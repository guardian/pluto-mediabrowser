#!/usr/bin/python3

import xml.etree.cElementTree as ET
import sys
import re
import json

node_splitter = re.compile(r'^\{(.*)\}(.*)$')
xmlns = "{http://xml.vidispine.com/schema/vidispine}"


def split_namespace(string):
    """
    splits out the namespace and node name parts of an xml tag, if present
    :param string: the tag name to extract
    :return: a 2-tuple, first element being the tag and second being the namespace if present or None.
    """

    matches = node_splitter.search(string)
    if matches:
        return matches.group(2), matches.group(1)
    else:
        return string, None


def validate_root(root_node):
    """
    checks that we have the expected root node and namespace
    :param root_node:
    :return:
    """
    passing = True
    tagname, tagnamespace = split_namespace(root_node.tag)
    if tagname != "MetadataFieldGroupDocument":
        print("Root node was '{0}', not MetadataFieldGroupDocument".format(root_node.tag))
        passing = False
    if tagnamespace != "http://xml.vidispine.com/schema/vidispine":
        print("XML namespace was incorrect")
        passing = False
    return passing


def validate_node_single_nonempty(parent_node, node_name):
    """
    checks that the name exists and is not an empty string
    :param root_node:
    :return:
    """
    name_nodes = [x for x in parent_node.findall("{0}{1}".format(xmlns,node_name))]

    if len(name_nodes)==0:
        print("No <{0}> node under root".format(node_name))
        return False
    elif len(name_nodes)>1:
        print("Multiple <{0}> nodes under root!".format(node_name))
        return False

    if name_nodes[0].text=="":
        print("<{0}}> node existed but was empty".format(node_name))
        return False

    return True


def extract_extradata(field_node):
    """
    extracts the extradata from the field, if it is present
    :param field_node:
    :return: either the extradata text or None
    """
    for data_node in field_node.findall("{0}data".format(xmlns)):
        key_node = data_node.find("{0}key".format(xmlns))
        if key_node is not None and key_node.text=="extradata":
            value_node = data_node.find("{0}value".format(xmlns))
            if value_node is not None:
                return value_node.text
    return None


def validate_field_block(counter, field_node):
    """
    validates the contents of a single field block
    :param field_node:
    :return:
    """
    passing = True
    if not validate_node_single_nonempty(field_node, "name"):
        print("Field {0} in the doc has no name".format(counter))
        return False
    field_name = field_node.find("{0}name".format(xmlns)).text
    prefix = "Field {0} ({1})".format(counter, field_name)

    if not validate_node_single_nonempty(field_node,"schema"):
        print("{0} has no schema node".format(prefix))
        passing = False
    else:
        schema_node = field_node.find("{0}schema".format(xmlns))
        if not(schema_node.attrib.get("min")) or not(schema_node.attrib.get("max")) or not(schema_node.attrib.get("name")):
            print("{0} schema node is missing required arguments".format(prefix))
            passing = False
        if schema_node.attrib.get("name") != field_name:
            print("{0} schema node name is not the same as field name. Expected {1}, got {2}".format(prefix, field_name, schema_node.attrib.get("name")))
    if not validate_node_single_nonempty(field_node,"type"):
        print("{0} has no type node".format(prefix))
        passing = False

    originNodes = [x for x in field_node.findall("{0}origin".format(xmlns))]
    if len(originNodes)>0:
        print("{0} should not have an origin node".format(prefix))
        passing = False

    extradata = extract_extradata(field_node)

    if extradata:
        try:
            extradata_parsed = json.loads(extradata)
            readonly = extradata_parsed.get("readonly","")
            if not isinstance(readonly, bool):
                print("{0} Readonly should be a boolean".format(prefix))
                passing = False
            # if readonly!="true" and readonly!="false":
            #     print("{0} Readonly value was '{1}', not true or false".format(prefix, readonly))
            #     passing = False
            values = extradata_parsed.get("values",[])
            if not isinstance(values, list):
                print("{0} values key was a {1}, not a list".format(prefix, str(values.__class__)))
                passing = False
        except Exception as e:
            print("{0} extradata was not valid json: {1}".format(prefix, e))
            passing = False
        return passing
    else:
        print("{0} has no extradata present".format(prefix, counter, field_name))
        return False


def validate_fields(root_node):
    passing = True
    i = 0

    for field_node in root_node.findall("{0}field".format(xmlns)):
        i+=1

        if not validate_field_block(i, field_node):
            print("Field block for field {0} is not correct".format(i))
            passing = False

    return passing


###START MAIN
passing = True
if sys.argv[1]=="":
    print("Validates the given vidispine xml metadata description. Usage: validate.py {xmlfile}")
    exit(1)

with open(sys.argv[1],"r") as f:
    content = ET.fromstring(f.read())
    if not validate_root(content):
        passing = False

    if not validate_node_single_nonempty(content, "name"):
        passing = False

    if not validate_fields(content):
        passing = False

if passing:
    print("{0} passed validation".format(sys.argv[1]))
else:
    print("{0} failed validation, see above".format(sys.argv[1]))
    exit(2)
