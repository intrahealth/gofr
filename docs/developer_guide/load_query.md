# API Usage

GOFR provides a powerful API to access and load data. 

Users may access the API in general as they would all [REST operations in FHIR](https://www.hl7.org/fhir/http.html). The base URL for API requests is simply the server:port for GOFR followed by `/fhir/<PARTITION>/`.

For more information about using FHIR see the page `Working wth FHIR` in this guide.

## Public Demo Server

The API routes are protected by token-based authentication and authorization.

On sign-up, an administrator must provide the `client_secret` in addition to a username and password. The API user must obtain an  `access_token` and `refresh_token`. For example, using Curl on *nix and WSL, with the `demo:demo` account on the public test server the API user must POST the following information:

```sh
curl -XPOST https://app.facilitymatch.net/keycloak/auth/realms/GOFR/protocol/openid-connect/token \
--data "grant_type=password" \
--data "username=demo" \
--data "password=demo" \
--data "client_id=gofr-api" \
--data "client_secret=df3dcc28-f79f-4df7-bd5c-427afe60a41b"
```

Response (the tokens are abbreviated with '...'):
```sh
{"access_token":"eyJhbGciOiJSUzI1NiIsInR5cCIgOi...","expires_in":300,"refresh_expires_in":1800,"refresh_token":"eyJhbGciOiJIUzI1NiIsInR5cCI...","token_type":"Bearer","not-before-policy":1632196935,"session_state":"de2ba5ab-3ec5-404c-9e82-f0ca94b71ab6","scope":"profile email"}
```

For quick tests, it may be easier to capture the token in an environment variable using the excellent [jq](https://stedolan.github.io/jq/) and then use that variable in queries, e.g.:
```sh
token=$(curl -XPOST https://app.facilitymatch.net/keycloak/auth/realms/GOFR/protocol/openid-connect/token \
--data "grant_type=password" \
--data "username=demo" \
--data "password=demo" \
--data "client_id=gofr-api" \
--data "client_secret=df3dcc28-f79f-4df7-bd5c-427afe60a41b" | jq -r '.access_token')
echo $token
curl -X GET "https://app.facilitymatch.net/fhir/DEFAULT/Location" -H "Authorization: Bearer $token"
```

The token can now be used to access the API.

!!! note
    Token expiration may be shorter than anticipated. This can be changed in Keycloak.

