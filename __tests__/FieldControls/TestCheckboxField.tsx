import React from "react";
import { mount } from "enzyme";
import { PlutoCustomData } from "../../app/vidispine/field-group/CustomData";
import sinon from "sinon";
import { createRender, createShallow } from "@material-ui/core/test-utils";
import CheckboxField from "../../app/FieldControls/CheckboxField";

describe("CheckboxField", () => {
  const render = createRender();

  it("should render a set of checkboxes for all choices and select the right ones", () => {
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

    const rendered = mount(
      <CheckboxField
        fieldname="test-field"
        viewHints={viewHints}
        controlId="id-test-field"
        parentReadonly={false}
        valueDidChange={didChangeSpy}
        classes={classes}
        maybeValues={["value3", "value1"]}
      />
    );
    const inputs = rendered.find("input");
    expect(inputs.length).toEqual(4);
    const labels = rendered.find("label");
    expect(labels.at(0).text()).toEqual("Label for test field");
    expect(labels.length).toEqual(5);

    inputs.children().forEach((element, idx) => {
      switch (idx) {
        case 0:
          expect(labels.at(idx + 1).text()).toEqual("First value");
          expect(element["type"]).toEqual("checkbox");
          expect(element.prop("checked")).toBeTruthy();
          break;
        case 1:
          expect(labels.at(idx + 1).text()).toEqual("Second value");
          expect(element["type"]).toEqual("checkbox");
          expect(element.prop("checked")).toBeTruthy();
          break;
        case 2:
          expect(labels.at(idx + 1).text()).toEqual("Third value");
          expect(element["type"]).toEqual("checkbox");
          expect(element.prop("checked")).toBeTruthy();
          break;
        case 3:
          expect(labels.at(idx + 1).text()).toEqual("Fourth value");
          expect(element["type"]).toEqual("checkbox");
          expect(element.prop("checked")).toBeTruthy();
          break;
        default:
          break;
      }
    });
  });
});
