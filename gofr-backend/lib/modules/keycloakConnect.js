
const Keycloak = require('keycloak-connect');
const config = require('../config');
const logger = require('../winston');

let _keycloak;

const keycloakConfig = {
  realm: config.get('keycloak:realm'),
  clientId: config.get('keycloak:backendClientId'),
  bearerOnly: true,
  serverUrl: config.get('keycloak:baseURL'),
};

function initKeycloak(store) {
  if (_keycloak) {
    logger.warn('Trying to init Keycloak again!');
    return _keycloak;
  }

  logger.info('Initializing Keycloak...');
  _keycloak = new Keycloak({ store }, keycloakConfig);
  return _keycloak;
}

function getKeycloak() {
  if (!_keycloak) {
    logger.error('Keycloak has not been initialized. Please called init first.');
  }
  logger.info('Keycloak Initialized');
  return _keycloak;
}

module.exports = {
  initKeycloak,
  getKeycloak,
};
