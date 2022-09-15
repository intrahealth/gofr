#!/usr/bin/env bash
set -ex

# automate tagging with the short commit hash
docker build --no-cache -t intrahealth/gofr:$(git rev-parse --short HEAD) .
docker tag intrahealth/gofr:$(git rev-parse --short HEAD) intrahealth/gofr
docker push intrahealth/gofr:$(git rev-parse --short HEAD)
docker push intrahealth/gofr:latest