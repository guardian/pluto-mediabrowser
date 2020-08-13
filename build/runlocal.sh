#!/bin/bash -e

docker build . -t guardianmultimedia/pluto-mediabrowser:DEV
docker run --rm -p 8000:80 -v $PWD/bundle.js:/usr/share/nginx/html/bundle.js guardianmultimedia/pluto-mediabrowser:DEV