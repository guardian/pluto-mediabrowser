#!/usr/bin/env python

import requests
from argparse import ArgumentParser
import xml.etree.cElementTree as ET

xmlns = "{http://xml.vidispine.com/schema/vidispine}"


def get_name(root_node):
    """
    extracts the main name of the metadata group from the provided xml document.
    :param root_node:
    :return:
    """
    name_node = root_node.find("{http://xml.vidispine.com/schema/vidispine}name")
    if name_node is None:
        raise Exception("Could not find a name node in the document")
    if name_node.text != "":
        return name_node.text
    else:
        raise Exception("Name node was empty")


###START MAIN
parser = ArgumentParser(description="Deploy the given metadata definition XML to Vidispine")
parser.add_argument('--proto',type=str,help="http or https", default="http")
parser.add_argument('--host',type=str,help="Host that vidispine is running on", default="localhost")
parser.add_argument('--port',type=int,help="port that Vidisine is running on", default=8080)
parser.add_argument('--user',type=str,help="username for Vidispine", default="admin")
parser.add_argument('--passwd',type=str,help="password for Vidispine")
parser.add_argument('--file', type=str,help="file to send")
args = parser.parse_args()

if args.file is None:
    print("You must specify a file to send with --file. Use --help for more information.")
    exit(1)

parsed_content = None
with open(args.file, "r") as f:
    parsed_content = ET.fromstring(f.read())

group_name = get_name(parsed_content)

field_names = [get_name(x) for x in parsed_content.findall("{0}field".format(xmlns))]
print("Found a total of {0} fields to purge".format(field_names))

url_to_delete = "{0}://{1}:{2}/API/metadata-field/field-group/{3}".format(args.proto, args.host, args.port, group_name)
print("Deleting {0}...".format(url_to_delete))

response = requests.delete(url_to_delete, auth=(args.user, args.passwd), headers={"Content-Type":"application/xml"})
if response.status_code==200:
    print("Successfully sent")
else:
    print("Vidispine returned a {0} error:".format(response.status_code))
    print(response.text)

for field_name in field_names:
    url_to_delete = "{0}://{1}:{2}/API/metadata-field/{3}".format(args.proto, args.host, args.port, field_name)
    print("Deleting {0}...".format(url_to_delete))

    response = requests.delete(url_to_delete, auth=(args.user, args.passwd), headers={"Content-Type":"application/xml"})
    if response.status_code==200:
        print("Successfully sent")
    else:
        print("Vidispine returned a {0} error:".format(response.status_code))
        print(response.text)