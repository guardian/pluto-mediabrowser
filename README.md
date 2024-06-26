#  Pluto Media Browser

trigger

pluto-media-browser is a frontend UI to search and find media items in Vidispine.

## Dev setup

### Prerequisites
pluto-media-browser is written in Javascript and Typescript with the React framework.  Yarn is used as a package manager.
You need node.js installed to develop and build it; we use current LTS version 12.18.

You should also have a working Vidispine installation.  The easiest way to get this is to download 
https://gitlab.com/codmill/customer-projects/guardian/prexit-local and follow the instructions in both the root README
and the `vidispine/` subdir README.

Authentication to Vidispine is performed with bearer tokens.  The `prexit-local` minikube setup includes a setup of
Keycloak to use as a local ID provider. Follow the instructions there to configure Vidispine to use it.

### Vidispine initial setup
pluto-media-browser expects certain metadata fields and groups to be present in Vidispine.  These are detailed in the
`vs-metadata/` subdirectory.
Once you have working Vidispine (see the prexit-local instructions about configuring the APIinit and initial user!!),
then you can ingest these definitions be using the `deploy.py` tool in the `vs-metadata` subdirectory:
```
$ cd vs-metadata
$ ./validate.py metadata/g_asset.xml
$ ./deploy.py --host vidispine.local --port 80 --passwd admin --file metadata/g_asset.xml
$ [repeat the above two lines for the other files in metadata/]
```

### Setup
To build a dev version (non-stripped for debugging), then run:
```
$ yarn install
$ yarn update-interfaces
$ yarn test
$ yarn dev
```

Once you have the javascript bundle, you need to run it in a browser.
Unfortunately this is not as simple as just double-clicking an index.html file in the tree because it needs to be able
to pull in external resources and do CORS requests to Vidispine.

To start up on port 8000 locally, you can run:
```shell script
$ cd build
$ ./runlocal.sh
```

This will build a docker image and dynamically link the current state of bundle.js into it.  You can access it at
http://localhost:8000.  If you do so with the cache off then the bundle will get reloaded on every request and you
can take advantage of webpack's dynamic rebuilding.

The config will be supplied by the `default_config.json` file in `build/`.  This points you to `http://vidispine.local`
for Vidispine access, which is the expected configuration from prexit-local.  If you are running a different way,
you'll need to update the vidispine configuration.

### Troubleshooting
0. If you get an error doing yarn install when installing  https://gitlab.com/codmill/customer-projects/guardian/pluto-headers.git,
you should:
    1. Configure a git credential helper for your platform. See https://blog.scottlowe.org/2016/11/21/gnome-keyring-git-credential-helper/ for gnome,
 Mac should have one set up already I believe.
    2. In a temporary location run `git clone https://gitlab.com/codmill/customer-projects/guardian/pluto-headers.git` and
    supply your gitlab username and password. This should store them in the credential helper.
    3. Now `yarn install` should work.
1. Turn on the browser console!
2. If you are getting permission denied from VS on OPTIONS requests, then CORS is not set up properly.  The following
CORS configuration works for me:
    ```xml
    <CORSConfigurationDocument xmlns="http://xml.vidispine.com/schema/vidispine">
        <entry>
            <request>
                <headerRegex>
                    <key>authorization</key>
                    <value>.*</value>
                </headerRegex>
            </request>
            <response>
                <allowOrigin>*</allowOrigin>
                <allowHeaders>*</allowHeaders>
            </response>
        </entry>
    </CORSConfigurationDocument>
    ```
   See https://apidoc.vidispine.com/latest/system/property.html#cors-configuration for more information
3. If you are getting permission denied from VS for other requests, then the issue is probably not CORS.  Check that
your bearer token signing certificate is correctly set up, and check that the token is not expired!

### Running in prexit-local context

TBD!!
