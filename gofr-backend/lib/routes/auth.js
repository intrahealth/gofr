
const config = require('../config');

let authRoutes;
if (config.get('app:idp') === 'keycloak') {
  authRoutes = require('./keycloakAuth');
} else {
  authRoutes = require('./passportAuth');
}


module.exports = authRoutes;
