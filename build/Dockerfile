FROM nginx:1.24-alpine

COPY nginx-server.conf /etc/nginx/conf.d/default.conf
COPY index.template.html /usr/share/nginx/html
COPY Docker-entrypoint.sh /
COPY default_config.json /etc/config/config.json
ADD images/ /usr/share/nginx/html/images
COPY bundle.js /usr/share/nginx/html
CMD /Docker-entrypoint.sh
