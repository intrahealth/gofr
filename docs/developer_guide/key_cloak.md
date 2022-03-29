# Introduction to Key Cloak

Keycloak is a single sign on solution for web apps such as the Global Open Facilities Registry system (**GOFR)** and other RESTful web services.

The goal of Keycloak is to make security simple so that it is easy for application developers to secure the apps and services they have deployed in their organization.

Security features that developers normally have to write for themselves are provided out of the box and are easily tailorable to the individual requirements of your organization.

Keycloak provides customizable user interfaces for login, registration, administration, and account management.

You can also use Keycloak as an integration platform to hook it into existing LDAP and Active Directory servers.

You can also delegate authentication to third party identity providers like Facebook and Google.

 <p>  For more information about Keycloak see  <a href="https://www.keycloak.org/documentation"> Developer guide</a> </p>

# Setting up Keycloak for GOFR

The initial server configuration includes an administrator account assigned the  **administrator** role in keycloak by default.

This account and password should be immediately changed after installation.

!!! important Install keycloak only if you want to use it as an identity provider. Follow instructions in here <https://www.keycloak.org/docs/latest/getting_started/index.html#installing-the-server> to install keycloak.


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