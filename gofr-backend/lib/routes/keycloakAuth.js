const express = require('express');
const jwtDecode = require('jwt-decode');
const deepmerge = require('deepmerge');
const user = require('../modules/user');
const kcadmin = require('../modules/keycloakAdminClient');
const dataSources = require('../modules/dataSources');

const router = express.Router();

const logger = require('../winston');
const fhirAxios = require('../modules/fhirAxios');

router.post('/', (req, res) => {
  let userResource = req.body;
  if (!userResource || !userResource.id) {
    const userDetails = jwtDecode(req.headers.authorization.split(' ')[1]);
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
    if (!usersRes.entry || (usersRes.entry && usersRes.entry.length >= 0)) {
      fhirAxios.update(userResource, 'DEFAULT').then((resp) => {
        kcadmin.populateRoleTasks({
          token: req.headers.authorization.split(' ')[1],
          user: resp,
        }).then((popResp) => {
          let userObj;
          user.createUserInstance(resp, popResp.role).then((obj) => {
            let isAdmin = false;
            if (obj.permissions['*'] && obj.permissions['*']['*']) {
              isAdmin = true;
            }
            dataSources.getSources({ isAdmin, userID: userResource.id }).then((sources) => {
              sources.forEach((source) => {
                const shareDetails = source.sharedUsers && source.sharedUsers.find(share => share.id === userResource.id);
                const partIndex = obj.permissions.partitions.findIndex(part => part.name === source.name);
                let partPerm = {};
                if (source.userID === userResource.id) {
                  partPerm = {
                    name: source.name,
                    '*': {
                      '*': true,
                    },
                  };
                } else if (shareDetails && shareDetails.permissions) {
                  partPerm = {
                    name: source.name,
                    ...shareDetails.permissions,
                  };
                }
                if (partIndex === -1) {
                  obj.permissions.partitions.push(partPerm);
                } else {
                  deepmerge(obj.permissions.partitions[partIndex], partPerm);
                }
              });
              userObj = obj;
              logger.error(JSON.stringify(userObj, 0, 2));
              res.status(200).json(userObj);
            }).catch(() => {
              userObj = obj;
              res.status(200).json(userObj);
            });
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
