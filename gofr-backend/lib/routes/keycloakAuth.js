const express = require('express');
const jwtDecode = require('jwt-decode');
const user = require('../modules/user');
const kcadmin = require('../modules/keycloakAdminClient');

const router = express.Router();

const logger = require('../winston');
const fhirAxios = require('../modules/fhirAxios');

router.post('/', (req, res) => {
  let userResource = req.body;
  if (!userResource || !userResource.id) {
    const userDetails = jwtDecode(req.headers.authorization.split(' ')[1]);
    logger.error(userDetails);
    if (!userDetails.sub) {
      logger.error('User details are missing');
      return res.status(401).send();
    }
    userResource = {
      resourceType: 'Person',
      id: userDetails.sub,
      meta: {
        profile: ['http://gofr.org/fhir/StructureDefinition/gofr-person-user'],
      },
      active: true,
    };
    if (userDetails.name) {
      userResource.name = [{
        use: 'official',
        text: userDetails.name,
      }];
    }
    if (userDetails.email) {
      userResource.telecom = [{
        system: 'email',
        value: userDetails.email,
      }];
    }
  }
  fhirAxios.search('Person', { _id: userResource.id }, 'DEFAULT').then((usersRes) => {
    if (!usersRes.entry || (usersRes.entry && usersRes.entry.length === 0)) {
      fhirAxios.update(userResource, 'DEFAULT').then((resp) => {
        kcadmin.populateRoleTasks({
          token: req.headers.authorization.split(' ')[1],
          user: resp,
        }).then((popResp) => {
          let userObj;
          user.createUserInstance(resp, popResp.role).then((obj) => {
            userObj = obj;
            res.status(200).json(userObj);
          }).catch(() => {
            res.status(500).json();
          });
        }).catch((err) => {
          logger.error(err);
          return res.status(500).json();
        });
      }).catch((err) => {
        logger.error(err);
        res.status(500).send();
      });
    } else {
      kcadmin.populateRoleTasks({
        token: req.headers.authorization.split(' ')[1],
        user: usersRes.entry[0].resource,
      }).then(async (popResp) => {
        let userObj;
        user.createUserInstance(usersRes.entry[0].resource, popResp.role).then((obj) => {
          userObj = obj;
          res.status(200).json(userObj);
        }).catch(() => {
          res.status(500).json();
        });
      }).catch((err) => {
        logger.error(err);
        return res.status(500).json();
      });
    }
  });
});
module.exports = router;
