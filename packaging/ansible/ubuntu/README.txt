Install git
	sudo apt install git
install ansible
	sudo apt install ansible
install ansible modules 
	sudo ansible-galaxy collection install ansible.utils
	sudo ansible-galaxy collection install community.postgresql
Edit /etc/ansible/hosts and add 127.0.0.1
Clone gofr github repository
	git clone https://github.com/intrahealth/gofr.git
Run the installer
	cd gofr/packaging/ansible/ubuntu/
	sudo bash run.sh