const fhirpath = require('fhirpath');
const express = require('express');
const user = require('../modules/user');
const config = require('../config');
const kcadmin = require('../modules/keycloakAdminClient');

const router = express.Router();

const logger = require('../winston');
const fhirAxios = require('../modules/fhirAxios');

router.post('/addUser', (req, res) => {
  fhirAxios.search('Person', { _id: req.body.id }, 'DEFAULT').then((usersRes) => {
    if (!usersRes.entry || (usersRes.entry && usersRes.entry.length === 0)) {
      fhirAxios.update(req.body, 'DEFAULT').then((resp) => {
        if (config.get('app:idp') === 'keycloak') {
          kcadmin.populateRoleTasks({
            token: req.headers.authorization.split(' ')[1],
            user: resp,
          }).then((popResp) => {
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
        } else {
          return res.status(201).json(resp);
        }
      }).catch((err) => {
        logger.error(err);
        res.status(500).send();
      });
    } else if (config.get('app:idp') === 'keycloak') {
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
    } else {
      return res.status(200).json(usersRes.entry[0].resource);
    }
  });
});

router.get('/getUsers', (req, res) => {
  logger.info('received a request to get users lists');
  fhirAxios.search('Person', { }, 'DEFAULT').then((usersRes) => {
    const users = [];
    for (const user of usersRes.entry) {
      const email = fhirpath.evaluate(user.resource, "Person.telecom.where(system='email').value");
      const fullname = fhirpath.evaluate(user.resource, 'Person.name.text');
      if (!email || !fullname || email.length === 0 || fullname.length === 0) {
        continue;
      }
      users.push({
        id: user.resource.id,
        userName: email[0],
        fullName: fullname[0],
      });
    }
    logger.info(`sending back a list of ${usersRes.entry.length} users`);
    res.status(200).json(users);
  });
});

module.exports = router;
