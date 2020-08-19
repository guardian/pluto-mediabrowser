#!/bin/sh

if [ ! -d /etc/config ]; then
  echo ERROR: Can\'t find /etc/config for accessing the app config
  exit 1
fi

if [ "$DEPLOYMENTPATH" == "" ]; then
  echo ERROR: You must set \'DEPLOYMENTPATH\' in the environment for this to work
  exit 1
fi

mkdir -p usr/share/nginx/html/config
cp -avL /etc/config/* /usr/share/nginx/html/config
cat /usr/share/nginx/html/index.template.html | sed 's/{{ DEPLOYMENTPATH }}/'$DEPLOYMENTPATH/ > /usr/share/nginx/html/index.html
rm -f /usr/share/nginx/html/index.template.html

echo Running server....
nginx -g 'daemon off;'