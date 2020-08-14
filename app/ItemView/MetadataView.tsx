import React, { useEffect, useState } from "react";
import MetadataGroupView from "./MetadataGroupView";
import FieldGroupCache from "../vidispine/FieldGroupCache";
import { VidispineItem } from "../vidispine/item/VidispineItem";
import { VidispineFieldGroup } from "../vidispine/field-group/VidispineFieldGroup";
import { doc } from "prettier";
import group = doc.builders.group;

interface MetadataViewProps {
  fieldCache: FieldGroupCache;
  elevation: number;
  readonly: boolean;
  content: VidispineItem;
  valueDidChange: (
    groupname: string,
    fieldname: string,
    newvalue: string[]
  ) => void;
}

const MetadataView: React.FC<MetadataViewProps> = (props) => {
  console.log(props.fieldCache._content);

  return (
    <>
      {
        //So, Array.from() is not the most performant method of iterating, but should be fine on small collections
        //https://stackoverflow.com/questions/43885365/using-map-on-an-iterator
        Array.from(props.fieldCache._content, ([groupname, group]) => {
          console.log("rendering ", groupname);
          return (
            <MetadataGroupView
              key={groupname}
              group={group}
              content={props.content}
              elevation={props.elevation}
              readonly={props.readonly}
              valueDidChange={(fieldname, newvalue) =>
                props.valueDidChange(groupname, fieldname, newvalue)
              }
            />
          );
        })
      }
    </>
  );
};
export default MetadataView;
