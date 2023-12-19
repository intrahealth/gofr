# How to install GOFR

## GOFR Installation

### 1. Install redis

    sudo apt install redis

### 2. Install tomcat

    sudo apt install tomcat9

### 3.  Install postgres (version 9.3 or above)

### 4. Install HAPI FHIR

#### a) Create Database

    sudo -u postgres psql
    create database hapi;
    create user hapi with encrypted password 'PASS';
    grant all privileges on database hapi to hapi;
    \q

#### b) Install maven to compile hapi

    sudo apt install maven
    git clone <https://github.com/hapifhir/hapi-fhir-jpaserver-starter.git>
    cd hapi-fhir-jpaserver-starter

 Edit pom.xml and change the following line from hapi-fhir-jpaserver:

    <finalName>hapi</finalName>

 Edit src/main/resources/application.yaml and change the following

    spring.datasource.url=’jdbc:postgresql://localhost:5432/hapi’
    spring.datasource.username=’hapi’
    spring.datasource.password=’PASS’
    spring.datasource.driverClassName=’org.postgresql.Driver’

  Uncomment below lines

    # hibernate.search.enabled: true

    # hibernate.search.backend.type: lucene

    # hibernate.search.backend.analysis.configurer: ca.uhn.fhir.jpa.search.HapiLuceneAnalysisConfigurer

    # hibernate.search.backend.directory.type: local-filesystem

    # hibernate.search.backend.directory.root: target/lucenefiles

    # hibernate.search.backend.lucene_version: lucene_current
  
  auto_create_placeholder_reference_targets=true
  hapi.fhir.enable_index_missing_fields=true
  hapi.fhir.client_id_strategy=ANY

  Uncomment below lines

    # partitioning

    # allow_references_across_partitions: false

    # partitioning_include_in_search_hashes: false

 Create war file

     mvn clean install -DskipTests
     sudo mkdir /var/lib/tomcat9/target
     sudo chown tomcat:tomcat /var/lib/tomcat9/target
     sudo cp target/hapi.war /var/lib/tomcat9/webapps

#### c) Load Basic Definitions

 Download and install hapi-fhir-cli:  <a href="https://hapifhir.io/hapi-fhir/docs/tools/hapi_fhir_cli.html"> here</a> </p>

 Load definitions with below commands ./hapi-fhir-cli upload-definitions -v r4 -t <a href="http://localhost:8080/hapi/fhir"> here </a> </p>

### 5. Keycloak Installation

 !!! Important "Install keycloak only if you want to use it as an identity provider."

 Follow instructions  <a href="https://www.keycloak.org/docs/latest/getting_started/index.html#installing-the-server"> here</a> </p>

### 6. Keycloak Configuration

 Modify keycloak base URL to keycloak/auth by changing web-context in standalone/configuration/standalone.xml to keycloak/auth.

 This will make keycloak accessible via <http://localhost:8080/keycloak/auth>

 Copy GOFR keycloak theme to keycloak

     cp -r gofr/resources/keycloak/themes/gofr keycloak/themes/

 Load GOFR keycloak realm

  Before loading the realm, make sure that Keycloak is running, if not running, please use below command to start it

     bin/standalone.sh
  
  To load the realm, first login to keycloak by running below command

     ./kcadm.sh config credentials --server <http://localhost:8080/keycloak/auth> --realm master --user admin --password admin
  
  where **username** and **password** refers to an admin account that has access to the master realm

  Now load the GOFR keycloak realm with below command

     ./kcadm.sh create realms -f gofr/resources/keycloak/realm.json_

### 7. Clone GOFR github repository

    git clone <https://github.com/intrahealth/gofr.git>

### 8. Install dependencies

    cd gofr/gofr-backend
    npm install

### 9 Running GOFR in production mode

    cd gofr/gofr-backend/lib
    node app.js

### 10. Accessing GOFR

    <http://localhost:4000>


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




## Introduction to Key Cloak

**Keycloak** is a **single sign on solution** for web apps such as the **Global Open Facilities Registry system (GOFR)** and other RESTful web services.

The goal of **Keycloak** is to make security simple so that it is easy for application developers to secure the apps and services they have deployed in their organization.

Security features that developers normally have to write for themselves are provided out of the box and are easily tailorable to the individual requirements of your organization.

**Keycloak** provides **customizable user interfaces** for login, registration, administration, and account management.

You can also use Keycloak as an **integration platform** to hook it into existing LDAP and Active Directory servers.

You can also **delegate authentication** to third party identity providers like Facebook and Google.

 <p>  For more information about Keycloak see  <a href="https://www.keycloak.org/documentation"> Developer guide</a> </p>

## Setting up Keycloak for GOFR

The initial server configuration includes an administrator account assigned the  **administrator** role in keycloak by default.

This account and password should be immediately changed after installation.

!!! important " Install keycloak only if you want to use it as an identity provider. Follow instructions here <https://www.keycloak.org/docs/latest/getting_started/index.html#installing-the-server> to install keycloak." 


 Modify keycloak base URL to keycloak/auth by changing web-context in standalone/configuration/standalone.xml to keycloak/auth. 
 
 This will make keycloak accessible via <http://localhost:8080/keycloak/auth>

 Copy GOFR keycloak theme to keycloak

     cp -r gofr/resources/keycloak/themes/gofr keycloak/themes/

 Load GOFR keycloak realm

  Before loading the realm, make sure that Keycloak is running, if not running, please use below command to start it

     bin/standalone.sh
  
To load the realm, first login to keycloak by running below command where username and password refers to an admin account that has access to the master realm

  To load the realm, first login to keycloak by running below command 

     ./kcadm.sh config credentials --server <http://localhost:8080/keycloak/auth> --realm master --user admin --password admin
  
  where **username** and **password** refers to an admin account that has access to the master realm

  Now load the GOFR keycloak realm with below command

     ./kcadm.sh create realms -f gofr/resources/keycloak/realm.json_

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

    cd gofr/gofr-gui
    npm install

 Start the UI

    cd gofr/gofr-gui
    npm run serve

 Start the backend

    cd gofr/gofr-backend/lib
    node app.js

## GOFR installation using Ansible

### Install Ansible

#### CentOS
	
To run gofr on **CentOS** you will need to run the commands below:
    
        sudo apt install epel-release

Then:

	    sudo yum install epel-release

And finally:

	    sudo yum install ansible

#### Ubuntu

When using  **Ubuntu** :

1. Run the commands below:

    	sudo apt install Ansible
	
2. Edit **/etc/ansible/hosts** and add **127.0.0.1**

3. Install Ansible modules :


	    ansible-galaxy collection install ansible.utils
	    ansible-galaxy collection install community.postgresql

4. clone gofr with command:

	    git clone https://github.com/intrahealth/gofr.git

5. change dir to Ansible

	    cd gofr/packaging/ansible

Depending on your operating system, change **dir** to the OS folder  i.e if you are using **Ubuntu**, change to ubuntu as below:

	cd ubuntu
	
Start installation by executing the **run.sh**

	sudo bash run.sh