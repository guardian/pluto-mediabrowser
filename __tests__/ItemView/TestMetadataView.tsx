import React from "react";
import { mount, shallow } from "enzyme";
import MetadataView from "../../app/ItemView/MetadataView";
import sinon from "sinon";
import FieldGroupCache from "../../app/vidispine/FieldGroupCache";
import { VidispineFieldGroup } from "../../app/vidispine/field-group/VidispineFieldGroup";
import { VidispineItem } from "../../app/vidispine/item/VidispineItem";
import MetadataGroupView, {
  MetadataGroupViewMode,
} from "../../app/ItemView/MetadataGroupView";
import VidispineContext, {
  VidispineContextType,
} from "../../app/Context/VidispineContext";

describe("MetadataView", () => {
  it("should render MetadataGroupView instances via the fieldcache for all groups that are present on the item", () => {
    const groups = [
      new VidispineFieldGroup({
        name: "Group1",
        schema: { min: 1, max: 1, name: "Group1" },
        field: [],
      }),
      new VidispineFieldGroup({
        name: "Group2",
        schema: { min: 1, max: 1, name: "Group2" },
        field: [],
      }),
    ];

    const item = new VidispineItem({
      id: "VX-1234",
      metadata: {
        revision: "",
        timespan: [
          {
            start: "-INF",
            end: "+INF",
            field: [],
            group: [
              {
                name: "Group1",
                field: [],
              },
            ],
          },
        ],
      },
    });

    const fieldCache = new FieldGroupCache(undefined, ...groups);

    const contextValue: VidispineContextType = {
      baseUrl: "https://fake-base-url",
      fieldCache: fieldCache,
    };

    const didChangeCb = sinon.spy();

    const rendered = mount(
      <VidispineContext.Provider value={contextValue}>
        <MetadataView
          elevation={1}
          readonly={false}
          content={item}
          valueDidChange={didChangeCb}
        />
      </VidispineContext.Provider>
    );

    const mdGroupBoxes = rendered.find("MetadataGroupView");
    expect(mdGroupBoxes.length).toEqual(1);

    expect(mdGroupBoxes.at(0).prop("group")).toEqual(groups[0]);
    expect(mdGroupBoxes.at(0).prop("content")).toEqual(item);
    expect(mdGroupBoxes.at(0).prop("elevation")).toEqual(1);
    expect(mdGroupBoxes.at(0).prop("mode")).toEqual(
      MetadataGroupViewMode.MetadataView
    );
  });

  it("should change to edit mode when the button is clicked", () => {
    const groups = [
      new VidispineFieldGroup({
        name: "Group1",
        schema: { min: 1, max: 1, name: "Group1" },
        field: [],
      }),
      new VidispineFieldGroup({
        name: "Group2",
        schema: { min: 1, max: 1, name: "Group2" },
        field: [],
      }),
    ];

    const item = new VidispineItem({
      id: "VX-1234",
      metadata: {
        revision: "",
        timespan: [
          {
            start: "-INF",
            end: "+INF",
            field: [],
            group: [
              {
                name: "Group1",
                field: [],
              },
            ],
          },
        ],
      },
    });

    const fieldCache = new FieldGroupCache(undefined, ...groups);

    const contextValue: VidispineContextType = {
      baseUrl: "https://fake-base-url",
      fieldCache: fieldCache,
    };

    const didChangeCb = sinon.spy();

    const rendered = mount(
      <VidispineContext.Provider value={contextValue}>
        <MetadataView
          elevation={1}
          readonly={false}
          content={item}
          valueDidChange={didChangeCb}
        />
      </VidispineContext.Provider>
    );

    const mdGroupBoxes = rendered.find("MetadataGroupView");
    expect(mdGroupBoxes.length).toEqual(1);

    expect(mdGroupBoxes.at(0).prop("mode")).toEqual(
      MetadataGroupViewMode.MetadataView
    );

    const modebutton = rendered.find("button#metadata-edit-toggle");
    modebutton.simulate("change");

    expect(rendered.find("MetadataGroupView").at(0).prop("mode")).toEqual(
      MetadataGroupViewMode.MetadataEdit
    );
  });
});
