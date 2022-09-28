const express = require('express');
const marked = require('marked');
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

const router = express.Router();

const fhirAxios = require('../modules/fhirAxios');
const fhirShortName = require('../modules/fhirShortName');
const fhirAudit = require('../modules/fhirAudit');
const fhirFilter = require('../modules/fhirFilter');

const outcomes = require('../../config/operationOutcomes');
const logger = require('../winston');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

router.get('/:partition/:resource/:id?', (req, res, next) => {
  if (req.params.resource.startsWith('$') || (req.params.id && req.params.id.startsWith('$'))) {
    return next();
  }
  let allowed = false;
  if (req.params.id) {
    allowed = req.user.hasPermissionByName('read', req.params.resource, req.params.id, req.params.partition);
  } else {
    allowed = req.user.hasPermissionByName('read', req.params.resource, '', req.params.partition);
  }
  if (!allowed) {
    return res.status(403).json(outcomes.DENIED);
  }
  if (req.params.id) {
    fhirAxios.read(req.params.resource, req.params.id, '', req.params.partition).then((resource) => {
      if (allowed === true) {
        return res.status(200).json(resource);
      }
      // Check permissions against the specific resource and return list
      // of allowed fields
      const fieldList = req.user.hasPermissionByObject('read', resource, req.params.partition);
      if (fieldList === true) {
        return res.status(200).json(resource);
      } if (!fieldList) {
        return res.status(403).json(outcomes.DENIED);
      }
      return res.status(200).json(fhirFilter.filter(resource, fieldList));
    }).catch((err) => {
      /* return response from FHIR server */
      // return res.status( err.response.status ).json( err.response.data )
      /* for custom responses */
      logger.error(err.message);
      const outcome = { ...outcomes.ERROR };
      outcome.issue[0].diagnostics = err.message;
      return res.status(500).json(outcome);
    });
  } else {
    const userFilters = req.user.getFilter(req.params.resource);
    if (userFilters) {
      for (const filter of userFilters) {
        const keyVal = filter.split('=', 2);
        if (keyVal.length === 2) {
          req.query[keyVal[0]] = keyVal[1];
        } else {
          logger.error(`Unable to process filter constraing for ${req.params.resource} ${filter}`);
        }
      }
    }
    fhirAxios.search(req.params.resource, req.query, req.params.partition).then((resource) => {
      // Need to do deeper checking due to possibility of includes
      if (resource && resource.entry && resource.entry.length > 0) {
        fhirFilter.filterBundle('read', resource, req.user, req.params.partition);
      }
      return res.status(200).json(resource);

      // DELETE THE FOLLOWING, ALL NEED TO BE FILTERED
      /*
      if ( allowed === true ) {
        return res.status(200).json(resource)
      } else {
        return res.status(200).json({"msg":"more to do filtering object from search"})
      }
      */
    }).catch((err) => {
      logger.error(err.message);
      const outcome = { ...outcomes.ERROR };
      outcome.issue[0].diagnostics = err.message;
      return res.status(500).json(outcome);
    });
  }
});

router.post('/:partition/:resource', (req, res) => {
  const allowed = req.user.hasPermissionByObject('write', req.body, req.params.partition);
  let resource;
  if (allowed === true) {
    resource = req.body;
  } else if (!allowed) {
    return res.status(403).json(outcomes.DENIED);
  } else {
    resource = fhirFilter.filter(req.body, allowed);
  }
  fhirAxios.create(resource, req.params.partition).then((output) => {
    fhirAudit.create(req.user, req.ip, `${output.resourceType}/${output.id
    }${output.meta.versionId ? `/_history/${output.meta.versionId}` : ''}`, true);
    return res.status(201).json(output);
  }).catch((err) => {
    fhirAudit.create(req.user, req.ip, null, false, { resource, err });
    const outcome = { ...outcomes.ERROR };
    outcome.issue[0].diagnostics = err.message;
    return res.status(500).json(outcome);
  });
});

router.patch('/:partition/CodeSystem/:id/:code', (req, res) => {
  const allowed = req.user.hasPermissionByName('write', 'CodeSystem', req.params.id);
  if (allowed !== true) {
    return res.status(403).json(outcomes.DENIED);
  }
  const incrementValueSetVersion = (codeSystem) => {
    const increment = (version) => {
      if (!version) return '0.0.1';
      try {
        const parts = version.split('.');
        if (parts.length > 2) {
          let last = Number(parts.pop());
          parts.push(++last);
        } else if (parts.length === 2) {
          parts.push(1);
        } else if (parts.length === 1) {
          parts.push(0);
          parts.push(1);
        }
        return parts.join('.');
      } catch (err) {
        return `${version}.1`;
      }
    };
    fhirAxios.search('ValueSet', { reference: codeSystem, _count: '200' }, req.params.partition).then((bundle) => {
      if (bundle.entry) {
        for (const entry of bundle.entry) {
          if (!entry.resource) continue;
          entry.resource.version = increment(entry.resource.version);
          fhirAxios.update(entry.resource, req.params.partition).catch((err) => {
            logger.error(`Failed to update valueset to increment version: ${entry.resource.id}`);
          });
        }
      }
    }).catch((err) => {
      logger.error(`Unable to find valuesets to increment for ${codeSystem}: ${err.message}`);
    });
  };

  const update = req.body;
  fhirAxios.read('CodeSystem', req.params.id, '', req.params.partition).then((resource) => {
    if (resource.concept) {
      const codeIdx = resource.concept.findIndex(concept => concept.code === update.code);
      if (codeIdx === -1) {
        resource.concept.push(update);
      } else {
        resource.concept[codeIdx] = update;
      }
    } else {
      resource.concept = [update];
    }
    resource.date = new Date().toISOString();
    fhirAxios.update(resource, req.params.partition).then((response) => {
      fhirAudit.patch(req.user, req.ip, `CodeSystem/${resource.id
      }${response.meta.versionId ? `/_history/${response.meta.versionId}` : ''}`, true, { code: req.params.code });
      incrementValueSetVersion(resource.url);
      return res.status(200).json({ ok: true });
    }).catch((err) => {
      /* return response from FHIR server */
      // return res.status( err.response.status ).json( err.response.data )
      /* for custom responses */
      // console.log(err)
      fhirAudit.patch(req.user, req.ip, `CodeSystem/${resource.id}`, false, { resource, err, code: req.params.code });
      const outcome = { ...outcomes.ERROR };
      outcome.issue[0].diagnostics = err.message;
      return res.status(500).json(outcome);
    });
  }).catch((err) => {
    /* return response from FHIR server */
    // return res.status( err.response.status ).json( err.response.data )
    /* for custom responses */
    // console.log(err)
    fhirAudit.patch(req.user, req.ip, `CodeSystem/${req.params.id}`, false, { resource: update, err, code: req.params.code });
    const outcome = { ...outcomes.ERROR };
    outcome.issue[0].diagnostics = err.message;
    return res.status(500).json(outcome);
  });
});

router.put('/:partition/:resource/:id', (req, res) => {
  const update = req.body;
  const allowed = req.user.hasPermissionByObject('write', update, req.params.partition);
  if (!allowed) {
    return res.status(403).json(outcomes.DENIED);
  }

  if (allowed !== true) {
    // Not allowed at this time because it's complicated to combine the filtered
    // results with the original data.  Due to arrays in FHIR elements.
    // Should instead use patching with this access level to update one field at a time.
    return res.status(403).json(outcomes.DENIED);
  }
  fhirAxios.update(update, req.params.partition).then((resource) => {
    fhirAudit.update(req.user, req.ip, `${resource.resourceType}/${resource.id
    }${resource.meta.versionId ? `/_history/${resource.meta.versionId}` : ''}`, true);
    res.status(200).json(resource);
  }).catch((err) => {
    /* return response from FHIR server */
    // return res.status( err.response.status ).json( err.response.data )
    /* for custom responses */
    fhirAudit.update(req.user, req.ip, `${update.resourceType}/${update.id}`, false, { resource: update, err });
    const outcome = { ...outcomes.ERROR };
    outcome.issue[0].diagnostics = err.message;
    return res.status(500).json(outcome);
  });
});

router.get('/:partition/ValueSet/:id/\\$expand', (req, res) => {
  const allowed = req.user.hasPermissionByName('read', 'ValueSet', req.params.id);
  if (!allowed) {
    return res.status(403).json(outcomes.DENIED);
  }
  fhirAxios.expand(req.params.id, req.query, '', '', req.params.partition).then((resource) => {
    if (allowed === true) {
      return res.status(200).json(resource);
    }
    // Field level access to ValueSets doesn't really make sense so don't do expansions if not full access
    return res.status(403).json(outcomes.DENIED);
  }).catch((err) => {
    /* return response from FHIR server */
    // return res.status( err.response.status ).json( err.response.data )
    /* for custom responses */
    const outcome = { ...outcomes.ERROR };
    outcome.issue[0].diagnostics = err.message;
    return res.status(500).json(outcome);
  });
});

router.get('/:partition/CodeSystem/\\$lookup', (req, res) => {
  const allowed = req.user.hasPermissionByName('read', 'CodeSystem');
  if (!allowed) {
    return res.status(403).json(outcomes.DENIED);
  }
  fhirAxios.lookup(req.query, req.params.partition).then((resource) => {
    if (allowed === true) {
      return res.status(200).json(resource);
    }
    // Field level access to CodeSystems doesn't really make sense so don't do lookups if not full access
    return res.status(403).json(outcomes.DENIED);
  }).catch((err) => {
    /* return response from FHIR server */
    // return res.status( err.response.status ).json( err.response.data )
    /* for custom responses */
    const outcome = { ...outcomes.ERROR };
    outcome.issue[0].diagnostics = err.message;
    return res.status(500).json(outcome);
  });
});

router.get('/:partition/DocumentReference/:id/\\$html', (req, res) => {
  const allowed = req.user.hasPermissionByName('read', 'DocumentReference', req.params.id, req.params.partition);
  if (!allowed) {
    return res.status(403).json(outcomes.DENIED);
  }
  fhirAxios.read('DocumentReference', req.params.id, '', req.params.partition).then((resource) => {
    const docToHTML = (resource) => {
      try {
        let html = '';
        const data64 = Buffer.from(resource.content[0].attachment.data, 'base64');
        const data = data64.toString('utf8');
        if (resource.content[0].attachment.contentType === 'text/markdown') {
          html = marked(data);
        } else {
          html = data;
        }
        return {
          title: resource.content[0].attachment.title,
          html: DOMPurify.sanitize(`<div>${html}</div>`),
        };
      } catch (err) {
        return 'Failed to get HTML from DocumentReference';
      }
    };

    if (allowed === true) {
      const content = docToHTML(resource);
      return res.status(200).json(content);
    }
    // Check permissions against the specific resource and return list
    // of allowed fields
    const fieldList = req.user.hasPermissionByObject('read', resource);
    if (fieldList === true) {
      const content = docToHTML(resource);
      return res.status(200).json(content);
    } if (!fieldList) {
      return res.status(403).json(outcomes.DENIED);
    }
    // Field level access to ValueSets doesn't really make sense so don't do expansions if not full access
    return res.status(403).json(outcomes.DENIED);
  }).catch((err) => {
    /* return response from FHIR server */
    // return res.status( err.response.status ).json( err.response.data )
    /* for custom responses */
    const outcome = { ...outcomes.ERROR };
    outcome.issue[0].diagnostics = err.message;
    return res.status(500).json(outcome);
  });
});

router.get('/:partition/\\$short-name', (req, res) => {
  let allowed = false;
  if (req.query.reference) {
    const refData = req.query.reference.split('/');
    if (refData.length !== 2) {
      logger.debug('invalid', req.query);
      return res.status(403).json(outcomes.DENIED);
    }
    allowed = req.user.hasPermissionByName('read', refData[0], '', req.params.partition);

    // Any read access will give short names
    if (allowed === false) {
      logger.debug('not allowed', allowed, req.query);
      return res.status(403).json(outcomes.DENIED);
    }
    fhirShortName.lookup(req.query, req.params.partition).then(display => res.status(200).json({ display }));
  } else {
    // can add more complexity later, but for now just check for access to CodeSystems and ValueSets
    allowed = req.user.hasPermissionByName('read', 'CodeSystem');
    if (req.query.valueset) {
      allowed = allowed && req.user.hasPermissionByName('read', 'ValueSet');
    }
    if (allowed !== true) {
      logger.debug('not allowed', allowed, req.query);
      return res.status(403).json(outcomes.DENIED);
    }
    fhirShortName.lookup(req.query, req.params.partition).then(display => res.status(200).json({ display }));
  }
});

module.exports = router;
