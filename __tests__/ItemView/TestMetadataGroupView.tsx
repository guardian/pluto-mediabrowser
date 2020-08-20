import React from "react";
import {shallow, mount} from "enzyme";
import MetadataGroupView from "../../app/ItemView/MetadataGroupView";
import {VidispineField, VidispineFieldGroup} from "../../app/vidispine/field-group/VidispineFieldGroup";
import sinon from "sinon";
import {PlutoCustomData} from "../../app/vidispine/field-group/CustomData";

describe("MetadataGroupView", ()=>{
    it("should render fields from a group", ()=>{
        const viewHints:PlutoCustomData = {
            name:"Test field",
            readonly: false,
            type: "string"
        }

        const mdGroup = new VidispineFieldGroup({
            name: "Group1",
            schema: { min: 1, max: 1, name: "Group1" },
            field: [
                new VidispineField({
                    "name": "field1",
                    schema: {
                        min: 1,
                        max: 1,
                        name: "field1"
                    },
                    type: "string",
                    data: [
                        {
                            key: "extradata",
                            value: JSON.stringify(viewHints)
                        }
                    ]
                }),
                new VidispineField({
                    "name": "field2",
                    schema: {
                        min: 1,
                        max: 1,
                        name: "field2"
                    },
                    type: "string",
                    data: [
                        {
                            key: "extradata",
                            value: JSON.stringify(viewHints)
                        }
                    ]
                })
            ],
        });

        const mapContent = new Map<string,string>();
        mapContent.set("field1","value1");

        const didChangeCb = sinon.spy();

        const rendered = mount(<MetadataGroupView group={mdGroup}
                                                  content={mapContent}
                                                  elevation={3}
                                                  readonly={false}
                                                  valueDidChange={didChangeCb}/>);
        const inputField = rendered.find("input#Group1-0");
        expect(inputField.length).toEqual(1);
        expect(inputField.prop("value")).toEqual("value1");

        const labels = rendered.find("label");
        expect(labels.length).toEqual(2);
        expect(labels.at(0).prop("htmlFor")).toEqual("Group1-0");
        expect(labels.at(0).text()).toEqual("Test field");
        expect(labels.at(1).prop("htmlFor")).toEqual("Group1-1");
        expect(labels.at(1).text()).toEqual("Test field");

        const input2 = rendered.find("input#Group1-1");
        expect(input2.prop("value")).toEqual("");
    });

    it("should inform the callback when data changes", ()=>{
        const viewHints:PlutoCustomData = {
            name:"Test field",
            readonly: false,
            type: "string"
        }

        const mdGroup = new VidispineFieldGroup({
            name: "Group1",
            schema: { min: 1, max: 1, name: "Group1" },
            field: [
                new VidispineField({
                    "name": "field1",
                    schema: {
                        min: 1,
                        max: 1,
                        name: "field1"
                    },
                    type: "string",
                    data: [
                        {
                            key: "extradata",
                            value: JSON.stringify(viewHints)
                        }
                    ]
                }),
                new VidispineField({
                    "name": "field2",
                    schema: {
                        min: 1,
                        max: 1,
                        name: "field2"
                    },
                    type: "string",
                    data: [
                        {
                            key: "extradata",
                            value: JSON.stringify(viewHints)
                        }
                    ]
                })
            ],
        });

        const mapContent = new Map<string,string>();
        mapContent.set("field1","value1");

        const didChangeCb = sinon.spy();

        const rendered = mount(<MetadataGroupView group={mdGroup}
                                                  content={mapContent}
                                                  elevation={3}
                                                  readonly={false}
                                                  valueDidChange={didChangeCb}/>);
        const inputField = rendered.find("input#Group1-0");
        expect(inputField.length).toEqual(1);
        expect(inputField.prop("value")).toEqual("value1");

        inputField.simulate("change",{target: {value:"anothervalue"}});
        expect(didChangeCb.calledWithExactly("field1",["anothervalue"]));
    })
});