#!/bin/bash

while getopts p:h: option
do
    case "${option}"
        in
        p)port=${OPTARG};;
        h)host=${OPTARG};;
    esac
done

status_code=$(dockerize -wait-retry-interval 5s -timeout 120s -wait http://${host}:${port}/fhir/DEFAULT/metadata curl --write-out %{http_code} --silent --output /dev/null http://${host}:${port}/fhir/DEFAULT/ValueSet/location-status/$expand)

if [[ "$status_code" -ne 200 ]] ; then
  ./hapi-fhir-cli upload-definitions -v r4 -t http://${host}:${port}/fhir/DEFAULT
else
  echo "FHIR Definitions exists, not uploading"
  exit 0
fi