# Server administration


## GOFR Installation

Install redis.
```sh
sudo apt install redis
```
Install tomcat.
```sh
sudo apt install tomcat9
```
Install postgres (version 9.3 or above)

Install HAPI FHIR

Create database
```pgsql
sudo -u postgres psql
create database hapi;
create user hapi with encrypted password 'PASS';
grant all privileges on database hapi to hapi;
\q
```

Install maven to compile hapi
```sh
sudo apt install maven
```

```sh
git clone https://github.com/hapifhir/hapi-fhir-jpaserver-starter.git
cd hapi-fhir-jpaserver-starter
```

Edit pom.xml and change the following line from hapi-fhir-jpaserver:
```xml
<finalName>hapi</finalName>
```

Edit src/main/resources/application.yaml and change the following
```yaml
spring.datasource.url=’jdbc:postgresql://localhost:5432/hapi’
spring.datasource.username=’hapi’
spring.datasource.password=’PASS’
spring.datasource.driverClassName=’org.postgresql.Driver’
# Uncomment below lines
# hibernate.search.enabled: true
# hibernate.search.backend.type: lucene
# hibernate.search.backend.analysis.configurer: ca.uhn.fhir.jpa.search.HapiLuceneAnalysisConfigurer
# hibernate.search.backend.directory.type: local-filesystem
# hibernate.search.backend.directory.root: target/lucenefiles
# hibernate.search.backend.lucene_version: lucene_current

auto_create_placeholder_reference_targets=true
hapi.fhir.enable_index_missing_fields=true
hapi.fhir.client_id_strategy=ANY
# Uncomment below lines
# partitioning:
    # allow_references_across_partitions: false
    # partitioning_include_in_search_hashes: false
```

Create war file
```
mvn clean install -DskipTests
sudo mkdir /var/lib/tomcat9/target
sudo chown tomcat:tomcat /var/lib/tomcat9/target
sudo cp target/hapi.war /var/lib/tomcat9/webapps
```

Load Basic Definitions
* Download and install hapi-fhir-cli: here https://hapifhir.io/hapi-fhir/docs/tools/hapi_fhir_cli.html
* Load definitions with below commands `./hapi-fhir-cli upload-definitions -v r4 -t http://localhost:8080/hapi/fhir/`

## Keycloak Installation and Configuration

Install keycloak only if you want to use it as an identity provider. Follow instructions in here https://www.keycloak.org/docs/latest/getting_started/index.html#installing-the-server to install keycloak.

Modify keycloak base URL to keycloak/auth by changing web-context in standalone/configuration/standalone.xml to keycloak/auth. This will make keycloak accessible via http://localhost:8080/keycloak/auth

Copy GOFR keycloak theme to keycloak
```sh
cp -r gofr/resources/keycloak/themes/gofr keycloak/themes/
```
Load GOFR keycloak realm
Before loading the realm, make sure that Keycloak is running, if not running, please use below command to start it
```
bin/standalone.sh
```
To load the realm, first login to keycloak by running below command where username and password refers to an admin account that has access to the master realm
```sh
./kcadm.sh config credentials --server http://localhost:8080/keycloak/auth --realm master --user admin --password admin
```
Now load the GOFR keycloak realm with below command
```sh
./kcadm.sh create realms -f gofr/resources/keycloak/realm.json
```

Clone GOFR github repository
```
git clone https://github.com/intrahealth/gofr.git
```

Install dependencies
```
cd gofr/gofr-backend
npm install
```

Running GOFR in production mode
```
cd gofr/gofr-backend/lib
node app.js
```
Access GOFR at: http://localhost:4000

## Running GOFR in Development Mode

Install UI dependencies
```
cd gofr/gofr-gui
npm install
```

Start the UI
```
cd gofr/gofr-gui
npm run serve
```

Start the backend
```
cd gofr/gofr-backend/lib
node app.js
```

## Configuration Parameters

a)	app.installed
Used to control when to load default data needed for GOFR to run, GOFR will set it to true when all data are loaded successfully.

b)	app.idp
Controls which identity provider to use, gofr and keycloak are the only two supported values for this configuration. When gofr is the Value then GOFR will be used as an identity provider and wnen keycloak is the set value then GOFR will use Keycloak as an identity provider.

c)	Server.port
This is the port number for which GOFR is listening to requests.

d)	mCSD.server
This configuration stores credentials of a FHIR server, I.e protocol, host, port etc for which the FHIR server is accessible

e)	defaults.fields
Set various fields types, this must be a path to a specific field
