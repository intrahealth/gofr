FROM node:fermium

# for wget
RUN apt-get -qq update && apt-get install -y -qq git && apt-get install -y --no-install-recommends wget

ARG branch=master
RUN git clone --branch ${branch} https://github.com/intrahealth/gofr /src/

# install dependencies
# ADD package-lock.json /src/
# ADD package.json /src/
WORKDIR /src/gofr-backend
RUN npm install

RUN cp /src/gofr-backend/config/default.json.example /src/gofr-backend/config/default.json

# add app
# ADD . /src/

ARG FHIR_BASE_URL=http://fhir:8080/fhir
ENV FHIR_BASE_URL=${FHIR_BASE_URL}

ENV DOCKERIZE_VERSION v0.5.0
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

# CMD ["npm", "start"]

ENTRYPOINT dockerize -wait-retry-interval 5s -timeout 60s -wait ${FHIR_BASE_URL}/DEFAULT/metadata npm start