# Quickstart using Docker

Docker is a fast way to get up and running with testing and trying out GOFR.

* Ensure that Docker is installed, `docker version`, and running.
* Clone the Facility Registry repository.
```sh
git clone https://github.com/ddhmoh-tech/Facility-Registry.git
# if using ssh
# git@github.com:ddhmoh-tech/Facility-Registry.git
```

* Docker Compose scripts are located in /instant/docker
```sh
cd Facility-Registry/instant/docker
```

Launch GOFR.
```sh
docker compose up -d --build
```

Launch GOFR with the nginx reverse proxy overlay.
```sh
docker compose -p gofr -f docker-compose.yml -f docker-compose.nginx.yml up -d --build
```

The nginx overlay defaults to HTTP on port 80 when SSL certificates are not present. To enable HTTPS, place the certificate and private key at:
```text
instant/docker/nginx/certs/tls.crt
instant/docker/nginx/certs/tls.key
```

When both files exist, nginx redirects HTTP to HTTPS and serves GOFR on port 443.

Check the running containers:
```sh
docker compose -p gofr -f docker-compose.yml -f docker-compose.nginx.yml ps
```

Expected default ports:
* GOFR direct: `4000`
* HAPI FHIR direct: `8080`
* Keycloak direct: `8084`
* nginx HTTP: `80`
* nginx HTTPS: `443`, only active when SSL certificates are configured




