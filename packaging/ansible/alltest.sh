#!/usr/bin/env bash
set -ex

ansible-playbook -i hosts localcleanup.yaml -e server=89.145.167.213
# accept ssh key on first contact, don't do in production
ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook -i hosts user.yaml -e user=root
ansible-playbook -i hosts nicetohave.yaml -e user=gofr
ansible-playbook -i hosts prep.yaml -e user=gofr
ansible-playbook -i hosts postgres.yaml -e user=gofr -e pgpass=hapi
ansible-playbook -i hosts hapi.yaml -e user=gofr -e pgpass=hapi

