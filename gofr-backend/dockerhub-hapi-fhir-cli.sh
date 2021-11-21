#!/usr/bin/env bash
set -ex

# automate tagging with the short commit hash
docker build -f ./Dockerfile-hapi-fhir-cli --no-cache -t intrahealth/hapi-fhir-cli:$(git rev-parse --short HEAD) .
docker tag intrahealth/hapi-fhir-cli:$(git rev-parse --short HEAD) intrahealth/hapi-fhir-cli
docker push intrahealth/hapi-fhir-cli:$(git rev-parse --short HEAD)
docker push intrahealth/hapi-fhir-cli:latest
