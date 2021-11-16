const express = require('express');
const lodash = require('lodash');
const uuid4 = require('uuid/v4');

const router = express.Router();
const config = require('../config');
const fhirAxios = require('../modules/fhirAxios');
const logger = require('../winston');

router.post('/add', (req, res) => {
  const data = req.body;
  let statusCode;
  let statusDisplay;
  if (data.requestStatus === 'approved') {
    statusCode = 'approved';
    statusDisplay = 'Approved';
  } else if (data.requestStatus === 'rejected') {
    statusCode = 'rejected';
    statusDisplay = 'Rejected';
  } else {
    logger.error('Unknown request status');
    return res.status(400).send();
  }
  const bundle = {
    resourceType: 'Bundle',
    type: 'batch',
    entry: [],
  };
  const approvRes = lodash.cloneDeep(data.resource);
  if (statusCode === 'approved') {
    const profIndex = approvRes.meta.profile.indexOf(data.profile);
    approvRes.meta.profile.splice(profIndex, 1);
    approvRes.meta.profile.push(data.requestUpdatingResource);
    if (approvRes.extension) {
      for (const index in approvRes.extension) {
        if (approvRes.extension[index].url === `${config.get('profiles:baseURL')}/StructureDefinition/request-status`) {
          approvRes.extension.splice(index, 1);
          break;
        }
      }
    }
    approvRes.id = uuid4();
    bundle.entry.push({
      resource: approvRes,
      request: {
        method: 'PUT',
        url: `Location/${approvRes.id}`,
      },
    });
  }

  const reqRes = data.resource;
  if (!reqRes.extension) {
    reqRes.extension = [];
  }
  let updated = false;
  for (const index in reqRes.extension) {
    if (reqRes.extension[index].url === `${config.get('profiles:baseURL')}/StructureDefinition/request-status`) {
      reqRes.extension[index].valueCoding.code = statusCode;
      reqRes.extension[index].valueCoding.display = statusDisplay;
      updated = true;
    }
  }
  if (!updated) {
    reqRes.extension.push({
      url: `${config.get('profiles:baseURL')}/StructureDefinition/request-status`,
      valueCoding: {
        code: statusCode,
        display: statusDisplay,
      },
    });
  }

  if (statusCode === 'approved') {
    updated = false;
    for (const index in reqRes.extension) {
      if (reqRes.extension[index].url === `${config.get('profiles:baseURL')}/StructureDefinition/request-affected-resource`) {
        reqRes.extension[index].valueReference.reference = `Location/${approvRes.id}`;
        updated = true;
      }
    }
    if (!updated) {
      reqRes.extension.push({
        url: `${config.get('profiles:baseURL')}/StructureDefinition/request-affected-resource`,
        valueReference: {
          reference: `Location/${approvRes.id}`,
        },
      });
    }
  }

  bundle.entry.push({
    resource: reqRes,
    request: {
      method: 'PUT',
      url: `Location/${reqRes.id}`,
    },
  });

  fhirAxios.create(bundle).then(() => res.status(200).send()).catch((err) => {
    logger.error(err);
    return res.status(500).send();
  });
});

router.post('/update', (req, res) => {
  const reqRes = req.body.resource;
  let statusCode;
  let statusDisplay;
  if (req.body.requestStatus === 'approved') {
    statusCode = 'approved';
    statusDisplay = 'Approved';
  } else if (req.body.requestStatus === 'rejected') {
    statusCode = 'rejected';
    statusDisplay = 'Rejected';
  } else {
    logger.error('Unknown request status');
    return res.status(400).send();
  }
  if (!reqRes) {
    return res.status(500).send();
  }

  const bundle = {
    resourceType: 'Bundle',
    type: 'batch',
    entry: [],
  };

  if (!reqRes.extension) {
    reqRes.extension = [];
  }
  let updated = false;
  for (const index in reqRes.extension) {
    if (reqRes.extension[index].url === `${config.get('profiles:baseURL')}/StructureDefinition/request-status`) {
      reqRes.extension[index].valueCoding.code = statusCode;
      reqRes.extension[index].valueCoding.display = statusDisplay;
      updated = true;
    }
  }
  if (!updated) {
    reqRes.extension.push({
      url: `${config.get('profiles:baseURL')}/StructureDefinition/request-status`,
      valueCoding: {
        code: statusCode,
        display: statusDisplay,
      },
    });
  }
  let affectingResource = reqRes.extension.find(ext => ext.url === `${config.get('profiles:baseURL')}/StructureDefinition/request-affected-resource`);
  if (!affectingResource) {
    return res.status(400).send();
  }
  affectingResource = affectingResource.valueReference.reference;
  const makeUpdate = new Promise((resolve) => {
    if (statusCode === 'approved') {
      fhirAxios.search(affectingResource).then((updatingRes) => {
        for (const ele in reqRes) {
          if (ele === 'meta' || ele === 'id') {
            continue;
          }
          if (ele === 'extension') {
            if (!updatingRes[ele]) {
              updatingRes[ele] = [];
            }
            for (const ext of reqRes[ele]) {
              if (ext.url === 'http://gofr.org/fhir/StructureDefinition/request-status' || ext.url === 'http://gofr.org/fhir/StructureDefinition/request-affected-resource') {
                continue;
              }
              const extIndex = updatingRes[ele].findIndex(upExt => upExt.url === ext.url);
              if (extIndex !== -1) {
                updatingRes[ele][extIndex] = ext;
              } else {
                updatingRes[ele].push(ext);
              }
            }
          } else {
            updatingRes[ele] = reqRes[ele];
          }
        }
        bundle.entry.push({
          resource: updatingRes,
          request: {
            method: 'PUT',
            url: `Location/${updatingRes.id}`,
          },
        });
        return resolve();
      });
    } else {
      return resolve();
    }
  });
  makeUpdate.then(() => {
    bundle.entry.push({
      resource: reqRes,
      request: {
        method: 'PUT',
        url: `Location/${reqRes.id}`,
      },
    });
    fhirAxios.create(bundle).then(() => res.status(200).send()).catch((err) => {
      logger.error(err);
      return res.status(500).send();
    });
  }).catch((err) => {
    logger.error(err);
    return res.status(500).send();
  });
});
module.exports = router;
