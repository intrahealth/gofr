#!/usr/bin/env bash

APP_BACKTITLE="GOFR admin scripts - for testing only"
APP_VERSION="0.0.1"
APP_TITLE="GOFR admin scripts"

troubleshoot () {
    printf "\ntroubleshooting...\n"
    ansible-playbook -i hosts troubleshoot.yaml -e user=gofr    
}


postgres () {
    printf "\npostgres...\n"
    ansible-playbook -i hosts postgres.yaml -e user=gofr -e pgpass=hapi
}


hapi () {
    printf "\nhapi...\n"
    ansible-playbook -i hosts hapi.yaml -e user=gofr -e pgpass=hapi
}


gofr () {
    printf "\nprep server(s)...\n"
    ansible-playbook -i hosts gofr.yaml -e user=gofr
}


prep () {
    printf "\nprep server(s)...\n"
    ansible-playbook -i hosts prep.yaml -e user=gofr
}


function quit {
    exit 0
}


function menu {
    choice=$(dialog \
            --backtitle "$APP_BACKTITLE" \
            --title     "$APP_TITLE: $APP_VERSION" \
            --clear \
            --nocancel \
            --menu  "Choose one" 30 50 4 \
            "troubleshoot"  "- troubleshooting utilities" \
            "postgres"  "- install/reconfigure postgres" \
            "hapi"  "- install/reconfigure hapi" \
            "gofr"          "- prep target server(s)" \
            "prep"          "- prep target server(s)" \
            "quit"          "- exit to desktop" \
            3>&1 1>&2 2>&3)

        case "$choice" in
        "troubleshoot")
            clear
            troubleshoot
            ;;
        "postgres")
            clear
            postgres
            ;;

        "hapi")
            clear
            hapi
            ;;

        "gofr")
            clear
            gofr
            ;;

        "prep")
            clear
            prep
            ;;

        *)
            clear
            echo "Wat?"
    esac
}

menu
exit 0