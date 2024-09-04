FROM nginx:mainline-alpine3.19

RUN apk update && \
    apk add --no-cache libx11=1.8.7-r0 && \
    rm -rf /var/cache/apk/*

COPY nginx-server.conf /etc/nginx/conf.d/default.conf
COPY index.template.html /usr/share/nginx/html
COPY Docker-entrypoint.sh /
COPY default_config.json /etc/config/config.json
ADD images/ /usr/share/nginx/html/images
COPY bundle.js /usr/share/nginx/html
CMD ["/Docker-entrypoint.sh"]
