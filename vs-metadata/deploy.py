#!/usr/bin/env python

import requests
from argparse import ArgumentParser
import xml.etree.cElementTree as ET


def get_group_name(root_node):
    name_node = root_node.find("{http://xml.vidispine.com/schema/vidispine}name")
    if name_node is None:
        raise Exception("Could not find a name node in the document")
    if name_node.text != "":
        return name_node.text
    else:
        raise Exception("Name node was empty")

###START MAIN
parser = ArgumentParser(description="Deploy the given XML to Vidispine")
parser.add_argument('--proto',type=str,help="http or https", default="http")
parser.add_argument('--host',type=str,help="Host that vidispine is running on", default="localhost")
parser.add_argument('--port',type=int,help="port that Vidisine is running on", default=8080)
parser.add_argument('--user',type=str,help="username for Vidispine", default="admin")
parser.add_argument('--passwd',type=str,help="password for Vidispine")
parser.add_argument('--file', type=str,help="file to send")
args = parser.parse_args()

raw_content = None
if args.file is None:
    print("You must specify a file to send with --file. Use --help for more information.")
    exit(1)

with open(args.file, "r") as f:
    raw_content = f.read()

if raw_content is None:
    print("Could not read {0}".format(args.file))
    exit(2)

parsed_content = ET.fromstring(raw_content)

group_name = get_group_name(parsed_content)

url_to_send = "{0}://{1}:{2}/API/metadata-field/field-group/{3}".format(args.proto, args.host, args.port, group_name)
print("Sending to {0}...".format(url_to_send))

response = requests.put(url_to_send, data=raw_content, auth=(args.user, args.passwd), headers={"Content-Type":"application/xml"})
if response.status_code==200:
    print("Successfully sent")
else:
    print("Vidispine returned a {0} error:".format(response.status_code))
    print(response.text)
    exit(3)