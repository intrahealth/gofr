Install git
	sudo yum install git
install ansible
	sudo yum install epel-release
	sudo yum install ansible
install ansible modules 
	ansible-galaxy collection install ansible.utils
Edit /etc/ansible/hosts and add 127.0.0.1
Clone gofr github repository
	git clone https://github.com/intrahealth/gofr.git
Run the installer
	cd gofr/packaging/ansible/centos/
	bash run.sh