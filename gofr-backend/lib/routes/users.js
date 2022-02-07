const fhirpath = require('fhirpath');
const express = require('express');

const router = express.Router();

const logger = require('../winston');
const fhirAxios = require('../modules/fhirAxios');

router.get('/getUsers', (req, res) => {
  logger.info('received a request to get users lists');
  fhirAxios.search('Person', { }, 'DEFAULT').then((usersRes) => {
    const users = [];
    for (const user of usersRes.entry) {
      const email = fhirpath.evaluate(user.resource, "Person.telecom.where(system='email').value");
      const fullname = fhirpath.evaluate(user.resource, 'Person.name.text');
      // if (!email || !fullname || email.length === 0 || fullname.length === 0) {
      //   continue;
      // }
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
