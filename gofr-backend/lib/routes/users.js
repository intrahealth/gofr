const crypto = require("crypto");
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

router.post("/addDhis2User", (req, res) => {
  let salt = crypto.randomBytes(16).toString('hex')
  let hash = hashPassword(req.body.username, salt)
  let user = {
    resource: {
      resourceType: "Person",
      id: req.body.id,
      meta: {
        profile: ["http://gofr.org/fhir/StructureDefinition/gofr-person-user"]
      },
      extension: [{
        url: "http://gofr.org/fhir/StructureDefinition/gofr-assign-role",
        valueReference: {
          reference: "Basic/gofr-role-data-manager"
        }
      }, {
        url: "http://gofr.org/fhir/StructureDefinition/gofr-password",
        extension: [
          {
            url: "hash",
            valueString: hash.hash
          },
          {
            url: "salt",
            valueString: salt
          }
        ]
      }],
      name: [{
        text: req.body.firstName + ' ' + req.body.surname
      }],
      telecom: [
        {
          system: "email",
          value: req.body.username
        }
      ],
      active: true
    }
  }
  fhirAxios.update(user.resource, 'DEFAULT').catch((err) => {
    console.error(err);
  })
  return res.status(200).json(user)
})

function hashPassword( password, salt ) {
  if ( !salt ) {
    salt = crypto.randomBytes(16).toString('hex')
  }
  let hash = crypto.pbkdf2Sync( password, salt, 1000, 64, 'sha512' ).toString('hex')
  return { hash: hash, salt: salt }
}

module.exports = router;
