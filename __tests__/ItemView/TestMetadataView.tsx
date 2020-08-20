import React from "react";
import { shallow } from "enzyme";
import MetadataView from "../../app/ItemView/MetadataView";
import sinon from "sinon";
import FieldGroupCache from "../../app/vidispine/FieldGroupCache";
import { VidispineFieldGroup } from "../../app/vidispine/field-group/VidispineFieldGroup";
import { VidispineItem } from "../../app/vidispine/item/VidispineItem";
import MetadataGroupView from "../../app/ItemView/MetadataGroupView";

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

    const didChangeCb = sinon.spy();

    const rendered = shallow(
      <MetadataView
        fieldCache={fieldCache}
        elevation={1}
        readonly={false}
        content={item}
        valueDidChange={didChangeCb}
      />
    );

    const mdGroupBoxes = rendered.find("MetadataGroupView");
    expect(mdGroupBoxes.length).toEqual(1);

    expect(mdGroupBoxes.at(0).prop("group")).toEqual(groups[0]);
    expect(mdGroupBoxes.at(0).prop("content")).toEqual(item);
    expect(mdGroupBoxes.at(0).prop("elevation")).toEqual(1);
    expect(mdGroupBoxes.at(0).prop("readonly")).toEqual(true);
  });
});
