import React from "react";
import { mount, shallow } from "enzyme";
import { PlutoCustomData } from "../../app/vidispine/field-group/CustomData";
import sinon from "sinon";
import DropdownField from "../../app/FieldControls/DropdownField";

describe("DropdownField", () => {
  it("should render a select with a set of options according to the menuhints", () => {
    const viewHints: PlutoCustomData = {
      name: "Label for test field",
      readonly: false,
      type: "checkbox",
      values: [
        {
          key: "value1",
          value: "First value",
        },
        {
          key: "value2",
          value: "Second value",
        },
        {
          key: "value3",
          value: "Third value",
        },
        {
          key: "value4",
          value: "Fourth value",
        },
      ],
    };

    const classes: Record<string, string> = {};
    const didChangeSpy = sinon.spy();

    const rendered = shallow(
      <DropdownField
        ignoreHintsReadonly={false}
        fieldname="test-field"
        viewHints={viewHints}
        controlId="id-test-field"
        parentReadonly={false}
        valueDidChange={didChangeSpy}
        classes={classes}
        maybeValues={["value3", "value1"]}
      />
    );
    //kinda the worst way to assert the contents but the only one i can find that works. appears that the MaterialUI
    //does not render a conventional select
    expect(rendered.childAt(0).text()).toEqual("Label for test field");
    expect(rendered.childAt(1).text()).toEqual(
      "(not set)First valueSecond valueThird valueFourth value"
    );
  });
});
