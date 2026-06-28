# Ansible for Ubuntu

## Requirements and Versions

> These steps are for installing on an Ubuntu system directly and requires experience with remote configuration and adherence to enterprise IT best practices which are out of scope for this document.

These steps require

* An Ubuntu target, e.g. server, VM, or desktop. Ubuntu 22 is recommended and tested against.
* Python3 installed on the target host. This is default on Ubuntu 22.
* Python3 and Ansible installed on the controller that directs installation on target hosts, e.g. your laptop.
* On the controller, the gofr repository cloned and the terminal directory changed to /packaging/ansible
* To use the CLI tool, dialog must be installed (this is macOS/Linux only).

> The controller can be any macOS, Ubuntu, or Linux that has Python3 and Ansible installed. Windows users are recommended to use WSL to have a Linux interface. CentOS is no longer supported as a target host.

Versions tested:
* Ubuntu 22
* HAPI FHIR JPA Server tag: v6.0.1
> All versions of below are defaults on Ubuntu 22
* Python 3
* Tomcat9
* PostgreSQL 14
* Nodejs 12
* Java: openjdk 17 (HAPI requires 17 to build but 11 to run)


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

As necessary, add additional ssh keys to the user. (This is done using the keys exposed in GitHub accounts, so first ensure that the user's public key is available on github, ie. visit https://github.com/<github_username>.keys to use this script):
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

### Docker-based installation

Use `docker-install.yaml` to set up a fresh Ubuntu or Debian server with Docker and run the Docker Compose stack from `instant/docker`.

This playbook:
* installs Docker Engine, Docker Buildx, and the Docker Compose plugin
* adds the install user to the `docker` group
* clones `https://github.com/ddhmoh-tech/Facility-Registry.git`
* checks out the `main` branch
* starts the GOFR stack with `docker compose up -d --build`
* starts an nginx reverse proxy on port 80 by default

Run:
```sh
ansible-playbook -i hosts docker-install.yaml -e user=gofr
```

If the repository is private, configure a GitHub SSH deploy key for the target user and pass the SSH clone URL:
```sh
ansible-playbook -i hosts docker-install.yaml -e user=gofr -e gofr_repo_clone_url=git@github.com:ddhmoh-tech/Facility-Registry.git
```

If the SSH key is not the user's default key, pass its path on the target host:
```sh
ansible-playbook -i hosts docker-install.yaml -e user=gofr -e gofr_repo_clone_url=git@github.com:ddhmoh-tech/Facility-Registry.git -e gofr_repo_key_file=/home/gofr/.ssh/facility_registry_deploy_key
```

If the target host cannot read the repository, the playbook uploads the controller's current checkout instead. This requires running the playbook from this repository and is useful when the controller has repository access but the target server does not.

The playbook installs the application repo at `/home/<user>/gofr` by default and runs Compose from `/home/<user>/gofr/instant/docker`.

The nginx overlay is enabled by default. Without SSL certificates, nginx proxies GOFR over HTTP on port 80. With certificates, nginx listens on 443 and redirects HTTP traffic to HTTPS.

To install with SSL, provide a certificate and private key from the controller:
```sh
ansible-playbook -i hosts docker-install.yaml -e user=gofr -e gofr_nginx_ssl_cert_src=/path/to/fullchain.pem -e gofr_nginx_ssl_key_src=/path/to/privkey.pem -e gofr_nginx_server_name=facility.example.org
```

The playbook copies those files to `/home/<user>/gofr-nginx-certs/tls.crt` and `/home/<user>/gofr-nginx-certs/tls.key` on the target host. Existing files in that directory are reused on later runs; remove them to return nginx to HTTP-only mode. To disable the nginx overlay and expose only the compose file's direct service ports, run:
```sh
ansible-playbook -i hosts docker-install.yaml -e user=gofr -e gofr_enable_nginx=false
```

After installation, check the containers:
```sh
ssh gofr@<server>
cd ~/gofr/instant/docker
GOFR_NGINX_CERTS_DIR=~/gofr-nginx-certs docker compose -p gofr -f docker-compose.yml -f docker-compose.nginx.yml ps
```

Check external TCP access from the controller or another remote machine:
```sh
nc -vz <server> 80
nc -vz <server> 443
```

Without SSL certificates, port 80 should connect and port 443 may refuse HTTPS traffic. With SSL certificates installed, both ports should connect, and HTTP requests on port 80 should redirect to HTTPS.

To restart or update the Docker stack after pulling changes:
```sh
ansible-playbook -i hosts docker-install.yaml -e user=gofr
```

### Native Ubuntu installation

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
* tomcat9 looks for the default Java which isn't installed, rather 17 is installed. So, the script updates JAVA_HOME for tomcat9.
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
* nginx, apache, caddy etc for gofr
* encryption
* fix next error with permissions...
* make it work without keycloak, make it work with keycloak


## Troubleshooting

Check that all processes are running and see the latest status:
```
ansible-playbook -i hosts troubleshoot.yaml -e user=gofr
```

Confirm HAPI is working from localhost:
```
curl http://localhost:8080/fhir/DEFAULT/metadata
```

Run GOFR manually.
```
cd $HOME/gofr/gofr-backend
app__installed=${false} mCSD__server__protocal=http mCSD__server__host=localhost mCSD__server__port=8080 mCSD__server__basePath=fhir  app__idp=gofr npm start
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
journalctl -u tomcat9.service -b
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

### Do not use

> Do not use these commands on production systems. This for troubleshooting the install scripts on servers without any data and trying migrations between versions.

Delete the hapi db in postgres
```
sudo -u postgres psql postgres
postgres=# drop database hapi;
DROP DATABASE
postgres=# \q
```

### Todo

HAPI v6.0.1 error with GOFR accessing HAPI:
```
{
"severity": "error",
"code": "processing",
"diagnostics": "HAPI-0389: Failed to call access method: org.springframework.transaction.CannotCreateTransactionException: Could not open JPA EntityManager for transaction; nested exception is org.hibernate.exception.JDBCConnectionException: Unable to acquire JDBC Connection"
}
```
