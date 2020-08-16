import React from "react";
import {render, shallow} from "enzyme";
import StringField from "../../app/FieldControls/StringField";
import {PlutoCustomData} from "../../app/vidispine/field-group/CustomData";
import sinon from "sinon";
import {makeStyles} from "@material-ui/core/styles";

describe("StringField", ()=>{

    it("should render a field respecting the viewhints", () => {
        const viewHints:PlutoCustomData = {
            name: "Label for test field",
            readonly: false,
            type: "string"
        };

        const classes:Record<string, string> = {

        };
        const didChangeCallback = sinon.spy();

        const rendered = render(<StringField fieldname="test-field"
                                             viewHints={viewHints}
                                             controlId="id-test-field"
                                             parentReadonly={false}
                                             valueDidChange={didChangeCallback}
                                             classes={classes}
                                             maybeValues={["entry1", "entry2"]}
                                             />);
        const label = rendered.find("label");
        expect(label.attr("for")).toEqual("id-test-field");
        const control = rendered.find("input");
        expect(control.attr("id")).toEqual("id-test-field");
        expect(control.attr("value")).toEqual("entry1 entry2");
        expect(control.attr("readonly")).toBeFalsy();

        // rendered.find("input").simulate("click")
        // expect(label.toBeTruthy());
        // expect(label.props.htmlFor)
    });
});