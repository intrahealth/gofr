# Configuration Parameters

The following are the various configurations for GoFR

**a) app.installed**

Used to control when to load default data needed for GOFR to run, GOFR will set it to true when all data are loaded successfully.

**b) app.idp**

Controls which identity provider to use, gofr and keycloak are the only two supported values for this configuration. When gofr is the Value then GOFR will be used as an identity provider and wnen keycloak is the set value then GOFR will use Keycloak as an identity provider.

**c) Server.port**

This is the port number for which GOFR is listening to requests.

**d) mCSD.server**

This configuration stores credentials of a FHIR server, I.e protocol, host, port etc for which the FHIR server is accessible

**e) defaults.fields**

Set various fields types, this must be a path to a specific field