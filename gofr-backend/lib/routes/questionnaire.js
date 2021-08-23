const express = require('express');

const router = express.Router();
const config = require('../config');

const fhirAxios = require('../modules/fhirAxios')
const fhirQuestionnaire = require('../modules/fhirQuestionnaire');
const fhirModules = require('../modules/fhirModules');
const outcomes = require('../../config/operationOutcomes');
const logger = require('../winston');

/**
 * This route will process a QuestionnaireReponse and parse
 * it into the underlying resources and save them.
 */
router.post('/:partition/QuestionnaireResponse', (req, res, next) => {
  const checkBundleForError = (bundle) => {
    if (bundle.entry) {
      for (const entry of bundle.entry) {
        if (entry.resource && entry.resource.resourceType === 'OperationOutcome') {
          return entry.resource;
        }
      }
    }
    return false;
  };

logger.error('here');
  const workflowQuestionnaires = config.get('workflow:questionnaire');
  const workflow = Object.keys(workflowQuestionnaires).find(wf => workflowQuestionnaires[wf].url === req.body.questionnaire);
  if (workflow) {
    let processor = workflow;
    if (workflowQuestionnaires[workflow].hasOwnProperty('processor')) {
      processor = workflowQuestionnaires[workflow].processor;
    }

    const details = config.get(`workflow:processor:${processor}`);

    if (!details || (!details.file && !details.library)) {
      const outcome = { ...outcomes.ERROR };
      outcome.issue[0].diagnostics = `Unable to find processor for this questionnaire: ${req.body.questionnaire} (${processor})`;
      return res.status(500).json(outcome);
    }
    fhirModules.requireWorkflow(workflow, details.library, details.file).then((module) => {
      module.process(req).then((bundle) => {
        fhirAxios.create(bundle, req.params.partition).then((results) => {
          if (module.postProcess) {
            module.postProcess(req, results).then(() => {
              next();
            }).catch((err) => {
              logger.error(err.message);
              return res.status(500).json({ err: err.message });
            });
          } else {
            next();
          }
        }).catch((err) => {
          logger.error(err.message);
          // return res.status( err.response.status ).json( err.response.data )
          return res.status(500).json({ err: err.message });
        });
      }).catch((err) => {
        logger.error(err.message);
        if (err === 'Invalid input') {
          return res.status(400).json(err);
        }
        return res.status(500).json(err);
      });
    }).catch((err) => {
      logger.error(err.message);
      const outcome = { ...outcomes.ERROR };
      outcome.issue[0].diagnostics = `Unable to find processor module for this questionnaire: ${req.body.questionnaire} (${processor})`;
      return res.status(500).json(outcome);
    });
  } else {
    fhirQuestionnaire.processQuestionnaire(req.body, req.params.partition).then((bundle) => {
      logger.error('hello');
      fhirAxios.create(bundle, req.params.partition).then((results) => {
        if (results.entry && results.entry.length > 0 && results.entry[0].response.location) {
          req.body.subject = { reference: results.entry[0].response.location };
        }
        next();
      }).catch((err) => {
        logger.error(err.message);
        return res.status(500).json({ err: err.message });
      });
    }).catch((err) => {
      logger.error(err.message);
      return res.status(500).json(err);
    });
  }
});

module.exports = router;
