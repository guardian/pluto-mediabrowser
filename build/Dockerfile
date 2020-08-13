FROM nginx:1.17-alpine

COPY nginx-server.conf /etc/nginx/conf.d/default.conf
COPY default_config.json /usr/share/nginx/html/config/config.json
COPY index.html /usr/share/nginx/html
COPY bundle.js /usr/share/nginx/html
