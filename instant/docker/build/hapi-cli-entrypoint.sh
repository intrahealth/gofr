#!/bin/sh

isCommand() {
  if [ "$1" = "sh" ]; then
    return 1
  fi

  ./hapi-fhir-cli help "$1" > /dev/null 2>&1
}

# check if the first argument passed in looks like a flag
if [ "${1#-}" != "$1" ]; then
  set -- /sbin/tini -- /hapi-fhir-cli "$@"
# check if the first argument passed in is composer
elif [ "$1" = '/hapi-fhir-cli' ]; then
  set -- /sbin/tini -- "$@"
# check if the first argument passed in matches a known command
elif isCommand "$1"; then
  set -- /sbin/tini -- /hapi-fhir-cli "$@"
fi

exec "$@"