# Vidispine Job Tool

**Requirements**

- Docker
- A World Wide Web browser

**Functions**

1. View pages of Vidispine jobs.
2. View information on an individual Vidispine job.

**Installation and Set Up**

1. Find the Docker image name in the CI section of GitLab, for example 'guardianmultimedia/pluto-logtool:23'.
2. Run it like this: docker run --rm -p 8000:80 guardianmultimedia/pluto-logtool:23
3. At the moment the Vidispine host, username, and password are hardcoded into VidispineJobTool.jsx and JobPage.jsx. If the defaults are not suitable you will need to change these with an editor and save them.
4. Access your Web server with your Web browser at http://localhost:8000. If everything is working you should see the job list page.

**Notes**

Please note this software is early in development and may not work as expected.
