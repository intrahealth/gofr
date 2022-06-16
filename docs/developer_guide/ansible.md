# Ansible for Ubuntu

## Requirements and Versions

> These steps are for installing on an Ubuntu system directly and requires experience with remote configuration and adherence to enterprise IT best practices which are out of scope for this document.

These steps require:
* An Ubuntu target, e.g. server, VM, or desktop. Ubuntu 22 is recommended and tested against.
* Python3 installed on the target host. This is default on Ubuntu 22.
* Python3 and Ansible installed on the controller that directs installation on target hosts, e.g. your laptop.
* On the controller, the gofr repository cloned and the terminal directory changed to /packaging/ansible
* To use the CLI tool, dialog must be installed (this is macOS/Linux only).

> The controller can be any macOS, Ubuntu, or Linux that has Python3 and Ansible installed. Windows users are recommended to use WSL to have a Linux interface. CentOS is no longer supported as a target host.

Versions tested:
* Ubuntu 22
* HAPI FHIR JPA Server tag:image/v5.5.2
> All versions of below are defaults on Ubuntu 22
* Python 3
* Tomcat9
* PostgreSQL 14
* Nodejs 12
* Java: openjdk 11


## Ansible Target Hosts

Hosts can be specified in inventory files or on the command line. Hosts may be specified on the command line (the comma is necessary even if there is only one host):
```
ansible-playbook -i 172.16.168.158, someplaybook.yaml
```

To use Ansible with an inventory file, you must create a file or edit the one in the repository. YAML and INI formats are supported.

A `hosts` file that has an entry for one server and to also install on localhost would be (though you'll probably only do one of these):
```ini
[local]
localhost ansible_connection=local

[servers]
172.16.174.137
```

> Note that `[local] and [servers]` are not necessary, it is way to tag groups of servers. The file may simply contain an IP address or subdomain and DNS address.

To use the hosts file:
```
ansible-playbook -i hosts <someplaybook>.yaml
```


## User and SSH setup

A example playbook is provided to show how to use Ansible to create a user (`gofr`) with sudo permissions on the target host. Another user can be used but they must have sudo permissions for installation.

Make sure to include a public SSH key for the user who will install prerequisites.

Create the `gofr` user and gives it sudo access:
```sh
ansible-playbook -i hosts user.yaml
```

As necessary, add additional ssh keys to the user `gofr`. (This is done using the keys exposed in GitHub accounts, so first ensure that the user's public key is available on github, ie. visit https://github.com/<github_username>.keys to use this script):
```sh
ansible-playbook -i hosts keys.yaml
```

Some small conveniences can be installed and configured:
* https://github.com/magicmonty/bash-git-prompt
```sh 
ansible-playbook -i hosts  nicetohave.yaml -e user=gofr
```

## Installation

> Note: For the remainder of the playbooks, `-e user=gofr` is appended to the commands and must be changed if there's a different user being used on the target host.

Prerequisites: git, redis, nodejs, native build pkgs for node, java, tomcat, maven:
```sh 
ansible-playbook -i hosts prep.yaml -e user=gofr
```

Setup PostgreSQL.
```sh 
ansible-playbook -i hosts postgres.yaml -e user=gofr -e pgpass=hapi
```

Build and install HAPI FHIR JPA Server and run with tomcat9. 
* This playbook copies over the application.yaml.
* The tomcat9 systemd service file comes with installation and is not modified. (If you want to modify, use an overlay.)
* The DB name, user, and password defaults to `hapi`. 
* Remove the last argument to change postgres password for the db to something else. This will also change the db password in the application.yaml file.
```sh
ansible-playbook -i hosts hapi.yaml -e user=gofr -e pgpass=hapi
```

Clone or git pull the latest GOFR app in $HOME/gofr
```sh
ansible-playbook -i hosts gofr.yaml -e user=gofr
```

Install the gofr service and load and start in systemd:
```sh
ansible-playbook -i hosts services.yaml -e user=gofr
```


### todo
* nginx, apache, caddy etc
* encryption
* run gofr start twice to fix upload/sql with hapi
* fix next error with permissions...
* make it work without keycloak, make it work with keycloak

## Troubleshooting

Check that all processes are running and see the latest status:
```
ansible-playbook -i hosts troubleshoot.yaml -e user=gofr
```

## Upgrades

Rerunning the `install` playbook updates intrahealth/hearth and app repos on the remote server. Rerunning the `services.yaml` playbook updates services. Services are restarted (not just reloaded).

The `install.yaml` playbook uses:
* `git pull` to get the latest updates to the master branch.
* `npm install` to update packages.


#### Basic status
```
systemctl status postgresql@14-main
systemctl status redis
systemctl status gofr
```

#### Logs
```
journalctl -u postgresql@14-main.service -b
journalctl -u gofr.service -b
journalctl -u redis.service -b
```

#### Restart services
```
sudo systemctl restart gofr.service
```

#### Restart databases
```
sudo systemctl restart postgresql@14-main.service
sudo systemctl restart redis.service
```

### Networking

Ensure processes are listening on the correct ports:
See https://serverfault.com/questions/725262/what-causes-the-connection-refused-message
```
# gui: 8080, backend: 3000, hearth: 3447, mongo: 27017, redis: 6379
sudo netstat -tnlp | grep :8080
sudo netstat -tnlp | grep :3000
sudo netstat -tnlp | grep :3447
sudo netstat -tnlp | grep :27017
sudo netstat -tnlp | grep :6379
```

Check for firewall blocks. Rerun the gui and:
```
sudo tcpdump -n icmp 
```