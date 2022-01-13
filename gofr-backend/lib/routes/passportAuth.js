const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const CustomStrategy = require('passport-custom').Strategy;
const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();
const logger = require('../winston');
const fhirAudit = require('../modules/fhirAudit');
const user = require('../modules/user');
const config = require('../config');

const defaultUser = config.get('user:loggedout') || 'gofr-user-loggedout';

passport.use(new GoogleStrategy(
  {
    clientID: config.get('auth:google:clientId') || 'not set',
    clientSecret: config.get('auth:google:clientSecret') || 'not set',
    callbackURL: 'http://localhost:8080/auth/google/callback',
    passReqToCallback: true,
  },
  (req, accessToken, refreshToken, profile, done) => {
    user.lookupByProvider('google', profile.id).then((userObj) => {
      if (userObj) {
        fhirAudit.login(userObj, req.ip, true);
        done(null, userObj);
      } else {
        logger.debug(`${profile.id} not found in current users, checking by email.`);
        const email = profile.emails.find(em => em.verified === true);
        if (email && email.value) {
          user.lookupByEmail(email.value).then((userObj) => {
            if (!userObj.resource.identifier) userObj.resource.identifier = [];
            userObj.resource.identifier.push({ system: 'google', value: profile.id });
            fhirAudit.login(userObj, req.ip, true, email.value);
            userObj.update().then((response) => {
              done(null, userObj);
            }).catch((err) => {
              logger.info('Failed to update user with provider id for google.');
              logger.error(err.message);
              done(null, userObj);
            });
          }).catch((err) => {
            fhirAudit.login({}, req.ip, false, email.value);
            done(err);
          });
        } else {
          logger.info("Couldn't find verified email in profile.");
          fhirAudit.login({}, req.ip, false);
          done(null, false);
        }
      }
    }).catch((err) => {
      fhirAudit.login({}, req.ip, false);
      done(err);
    });
  },
));

passport.use('local', new LocalStrategy({ passReqToCallback: true },
  (req, email, password, done) => {
    user.lookupByEmail(email).then((userObj) => {
      if (!userObj) {
        fhirAudit.login(userObj, req.ip, false, email);
        done(null, false);
      } else if (userObj.checkPassword(password)) {
        fhirAudit.login(userObj, req.ip, true, email);
        done(null, userObj);
      } else {
        fhirAudit.login(userObj, req.ip, false, email);
        done(null, false);
      }
    }).catch((err) => {
      fhirAudit.login({}, req.ip, false, email);
      done(err);
    });
  }));

passport.use('custom-loggedout', new CustomStrategy(
  (req, done) => {
    fhirAudit.logout(req.user, req.ip, true);
    user.find(defaultUser).then((userObj) => {
      if (!userObj) {
        done(null, false);
      } else {
        done(null, userObj);
      }
    }).catch((err) => {
      done(err);
    });
  },
));

passport.serializeUser((obj, callback) => {
  callback(null, obj);
});
passport.deserializeUser((obj, callback) => {
  const userObj = user.restoreUser(obj);
  callback(null, userObj);
});

router.use(passport.initialize());
router.use(passport.session());

router.passport = passport;

router.get('/', (req, res, next) => {
  if (req.user) {
    res.status(200).json({
      userObj: req.user,
    });
  } else {
    return res.status(200).send();
  }
},
passport.authenticate('custom-loggedout', {}), (req, res) => {
  if (req.user) {
    res.status(200).json({ ok: true });
  } else {
    res.status(200).json({ ok: false });
  }
});
router.get('/logout', (req, res) => {
  req.logout();
  if (req.user) {
    res.status(200).json({ ok: true });
  } else {
    res.status(200).json({ ok: false });
  }
});

router.get('/google', passport.authenticate('google', { scope: ['email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/', successRedirect: '/' }));

router.post('/login', passport.authenticate('local', {}), (req, res) => {
  res.status(200).json({
    userObj: req.user,
  });
});

router.post('/token', (req, res) => {
  // For API Access only
  logger.info('Generating token');
  const secret = config.get('auth:secret');
  const tokenDuration = config.get('auth:tokenDuration');
  const { username, password } = req.body;

  user.lookupByEmail(username).then((userObj) => {
    if (!userObj) {
      logger.error('User not found');
      fhirAudit.login(userObj, req.ip, false, username);
      return res.status(401).send();
    }
    if (userObj.checkPassword(password)) {
      fhirAudit.login(userObj, req.ip, true, username);
      const token = jwt.sign({ user: userObj }, secret, { expiresIn: tokenDuration });
      res.status(200).json({ access_token: token });
    } else {
      logger.error('Invalid password');
      fhirAudit.login(userObj, req.ip, false, username);
      return res.status(401).send();
    }
  }).catch((err) => {
    fhirAudit.login({}, req.ip, false, username);
    return res.status(500).send();
  });
});

module.exports = router;
