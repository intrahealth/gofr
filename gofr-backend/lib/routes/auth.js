const fhirpath = require('fhirpath');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');

const router = express.Router();

const config = require('../config');
const logger = require('../winston');
const fhirAxios = require('../modules/fhirAxios');

router.post('/login', (req, res) => {
  logger.info(`Authenticating user ${req.body.username}`);
  fhirAxios.search('Person', { telecom: req.body.username }, 'DEFAULT').then((user) => {
    if (user.entry && user.entry.length === 1) {
      const passwdExt = user.entry[0].resource.extension && user.entry[0].resource.extension.find(ext => ext.url === 'password');
      if (!passwdExt || !user.entry[0].resource.active) {
        return res.status(200).json({
          token: null,
          role: null,
          userID: null,
        });
      }

      const passwordMatch = bcrypt.compareSync(req.body.password, passwdExt.valueString);
      if (passwordMatch) {
        const tokenDuration = config.get('auth:tokenDuration');
        const secret = config.get('auth:secret');
        const token = jwt.sign({
          id: user.entry[0].resource.id.toString(),
        }, secret, {
          expiresIn: tokenDuration,
        });
        const roleExt = user.entry[0].resource.extension && user.entry[0].resource.extension.find(ext => ext.url === 'role');
        if (!roleExt) {
          logger.error(`User ${req.body.username} has no role assigned, cant authenticate`);
          return res.status(200).json({
            token: null,
            role: null,
            userID: null,
          });
        }
        const role = roleExt.valueReference.reference.split('/');
        fhirAxios.read(role[0], role[1], '', 'DEFAULT').then((roleDt) => {
          const tasksExt = roleDt.extension && roleDt.extension.find(ext => ext.url === 'tasks');
          if (!tasksExt) {
            return res.status(200).json({
              token: null,
              role: null,
              userID: null,
            });
          }
          const roleNameExt = roleDt.extension && roleDt.extension.find(ext => ext.url === 'name');
          const tasks = tasksExt.valueCodeableConcept.coding;
          logger.info(`Successfully Authenticated user ${req.body.username}`);
          res.status(200).json({
            token,
            role: roleNameExt.valueString,
            tasks,
            userID: user.entry[0].resource.id,
          });
        }).catch((err) => {
          logger.error(err);
          return res.status(200).json({
            token: null,
            role: null,
            userID: null,
          });
        });
      } else {
        logger.info(`Failed Authenticating user ${req.body.username}`);
        res.status(200).json({
          token: null,
          role: null,
          userID: null,
        });
      }
    } else {
      logger.error(`More than one record found with username ${req.body.username}`);
      return res.status(200).json({
        token: null,
        role: null,
        userID: null,
      });
    }
  }).catch((err) => {
    logger.error(err);
    return res.status(200).json({
      token: null,
      role: null,
      userID: null,
    });
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
