import React from "react";
import { ShallowRendererProps, ShallowWrapper } from "enzyme";
import StringField from "../../app/FieldControls/StringField";
import { PlutoCustomData } from "../../app/vidispine/field-group/CustomData";
import sinon from "sinon";
import { makeStyles } from "@material-ui/core/styles";
import { createRender, createShallow } from "@material-ui/core/test-utils";

describe("StringField", () => {
  let shallow: {
    <C extends React.Component, P = C["props"], S = C["state"]>(
      node: React.ReactElement<P>,
      options?: ShallowRendererProps
    ): ShallowWrapper<P, S, C>;
    <P>(
      node: React.ReactElement<P>,
      options?: ShallowRendererProps
    ): ShallowWrapper<P, any>;
    <P, S>(
      node: React.ReactElement<P>,
      options?: ShallowRendererProps
    ): ShallowWrapper<P, S>;
  };
  const render = createRender();

  beforeAll(() => {
    shallow = createShallow({
      untilSelector: "input",
    });
  });

  it("should render a field respecting the viewhints", () => {
    const viewHints: PlutoCustomData = {
      name: "Label for test field",
      readonly: false,
      type: "string",
    };

    const classes: Record<string, string> = {};
    const didChangeCallback = sinon.spy();

    const rendered = render(
      <StringField
          ignoreHintsReadonly={false}
        fieldname="test-field"
        viewHints={viewHints}
        controlId="id-test-field"
        parentReadonly={false}
        valueDidChange={didChangeCallback}
        classes={classes}
        maybeValues={["entry1", "entry2"]}
      />
    );
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

  /* temporarily commented until I can work out how to make it work */

  // it("should call out to valueDidChange when the value changes", () => {
  //     const viewHints:PlutoCustomData = {
  //         name: "Label for test field",
  //         readonly: false,
  //         type: "string"
  //     };
  //
  //     const classes:Record<string, string> = {
  //
  //     };
  //     const didChangeCallback = sinon.spy();
  //
  //     const rendered = shallow(<StringField fieldname="test-field"
  //                                          viewHints={viewHints}
  //                                          controlId="id-test-field"
  //                                          parentReadonly={false}
  //                                          valueDidChange={didChangeCallback}
  //                                          classes={classes}
  //                                          maybeValues={["entry1", "entry2"]}
  //     />);
  //
  //     console.log(rendered.children());
  //     const control = rendered.find("#test-field");
  //     control.simulate("change",{target: {value: "newvalue"}});
  //     expect(didChangeCallback.calledOnceWith("test-field", "newvalue"));
  // });
});
