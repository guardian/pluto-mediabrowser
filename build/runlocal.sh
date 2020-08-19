#!/bin/bash -e

docker build . -t guardianmultimedia/pluto-mediabrowser:DEV
echo -----------------------
echo Starting up server. Try accessing at http://localhost:8000........

docker run --rm -it -p 8000:80 -e DEPLOYMENTPATH=http:\/\/localhost:8000\/ -v $PWD/bundle.js:/usr/share/nginx/html/bundle.js guardianmultimedia/pluto-mediabrowser:DEV
