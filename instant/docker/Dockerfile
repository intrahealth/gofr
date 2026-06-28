FROM node:18-bullseye

ENV NODE_OPTIONS=--openssl-legacy-provider

RUN apt-get -qq update \
    && apt-get install -y --no-install-recommends git wget ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy local repo into image
COPY . /src/

# build the packaged GUI from gofr-gui source before docker-site is assembled
WORKDIR /src/gofr-gui
RUN npm install \
    && ./node_modules/.bin/vue-cli-service build

# install backend deps
WORKDIR /src/gofr-backend
RUN npm install

# create docker-site from the in-repo template
RUN cp -r /src/gofr-backend/lib/gofr-backend-site /src/gofr-backend/docker-site \
    && cp /src/gofr-backend/docker-site/config/default.json.example /src/gofr-backend/docker-site/config/default.json

WORKDIR /src/gofr-backend/docker-site
RUN npm install

ARG FHIR_BASE_URL=http://fhir:8080/fhir
ENV mCSD__server__protocal=http
ENV mCSD__server__host=fhir
ENV mCSD__server__port=8080
ENV mCSD__server__basePath=fhir
ENV FHIR_BASE_URL=${FHIR_BASE_URL}

ENV DOCKERIZE_VERSION=v0.6.1
RUN wget -q https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

ENTRYPOINT dockerize -wait-retry-interval 5s -timeout 120s -wait ${FHIR_BASE_URL}/DEFAULT/metadata npm start
