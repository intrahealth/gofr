#!/bin/sh
set -eu

CERT_FILE=/etc/nginx/certs/tls.crt
KEY_FILE=/etc/nginx/certs/tls.key
CONF_FILE=/etc/nginx/conf.d/default.conf
SERVER_NAME="${NGINX_SERVER_NAME:-_}"

write_proxy_location() {
  cat <<'EOF'
  location / {
    proxy_pass http://gofr:4000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
EOF
}

if [ -s "$CERT_FILE" ] && [ -s "$KEY_FILE" ]; then
  {
    cat <<EOF
server {
  listen 80;
  server_name $SERVER_NAME;
  return 301 https://\$host\$request_uri;
}

server {
  listen 443 ssl http2;
  server_name $SERVER_NAME;

  ssl_certificate $CERT_FILE;
  ssl_certificate_key $KEY_FILE;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_prefer_server_ciphers off;

EOF
    write_proxy_location
    cat <<'EOF'
}
EOF
  } > "$CONF_FILE"
else
  {
    cat <<EOF
server {
  listen 80;
  server_name $SERVER_NAME;

EOF
    write_proxy_location
    cat <<'EOF'
}
EOF
  } > "$CONF_FILE"
fi

exec nginx -g 'daemon off;'
