import React from "react";
import {mount} from "enzyme";
import {PlutoCustomData} from "../../app/vidispine/field-group/CustomData";
import sinon from "sinon";
import TimestampField from "../../app/FieldControls/TimestampField";

describe("TimestampField", ()=>{
    it("should render date and time pickers adjacent to each other", ()=> {
        const viewHints: PlutoCustomData = {
            name: "Label for test field",
            readonly: false,
            type: "checkbox",
            values: [
                {
                    "key": "value1",
                    "value": "First value"
                },
                {
                    "key": "value2",
                    "value": "Second value"
                },
                {
                    "key": "value3",
                    "value": "Third value"
                },
                {
                    "key": "value4",
                    "value": "Fourth value"
                },
            ]
        };

        const classes: Record<string, string> = {};
        const didChangeSpy = sinon.spy();

        const rendered = mount(<TimestampField fieldname="test-field"
                                               viewHints={viewHints}
                                               controlId="id-test-field"
                                               parentReadonly={false}
                                               valueDidChange={didChangeSpy}
                                               classes={classes}
                                               maybeValues={["2020-01-02T03:04:05Z"]}
                            />);
        rendered.find("input").forEach((element,idx)=>{
            switch(idx){
                case 0:
                    expect(element.prop("value")).toEqual("2020-01-02");
                    expect(element.prop("id")).toEqual("id-test-field");
                    break;
                case 1:
                    console.log(idx, element.debug());
                    expect(element.prop("value")).toEqual("03:04:05");
                    expect(element.prop("id")).toEqual("id-test-field-time");
                    break;
            }

        })
    });
})