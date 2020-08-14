import React, { useEffect, useState } from "react";
import {
  TextareaAutosize,
  Input,
  InputLabel,
  FormLabel,
  Paper,
  FormControl,
  Typography,
} from "@material-ui/core";
import {
  VidispineField,
  VidispineFieldGroup,
} from "../vidispine/field-group/VidispineFieldGroup";
import { VidispineItem } from "../vidispine/item/VidispineItem";
import { PlutoCustomData } from "../vidispine/field-group/CustomData";
import css from "./itemview.css";

interface MetadataGroupViewProps {
  group: VidispineFieldGroup;
  content: VidispineItem;
  elevation: number;
  readonly: boolean;
  valueDidChange: (name: string, value: string) => void;
}

const MetadataGroupView: React.FC<MetadataGroupViewProps> = (props) => {
  /**
   * returns a suitable control for the field data
   * @param fieldname
   * @param viewHints
   * @param maybeValues
   * @param controlId
   */
  const elementForDatatype = (
    fieldname: string,
    viewHints: PlutoCustomData,
    maybeValues: string[] | undefined,
    controlId: string
  ) => {
    switch (viewHints.type) {
      // case "tags":
      //     break;
      // case "lookup":
      //     break;
      // case "checkbox":
      //     break;
      // case "dropdown":
      //     break;
      case "string":
        return (
          <Input
            id={controlId}
            readOnly={viewHints.readonly || props.readonly}
            value={maybeValues ? maybeValues.join(" ") : ""}
            onChange={(event) =>
              props.valueDidChange(fieldname, event.target.value)
            }
          />
        );
      default:
        return (
          <p id={controlId}>
            Warning: field type {viewHints.type} is not recognised
          </p>
        );
    }
  };

  return (
    <Paper elevation={props.elevation}>
      <div className="fieldgroup-title-box">{props.group.name}</div>
      {props.group.field.map((entry, idx) => {
        const field = new VidispineField(entry);
        const controlId = `${props.group.name}-${idx}`;
        const maybeValues = props.content.getMetadataValuesInGroup(
          field.name,
          props.group.name
        );
        const viewHints = field.getCustomData();

        if (!viewHints) {
          console.error(
            `Field ${field.name} in ${props.group.name} has no view hints data`
          );
          return <p />;
        }

        if (viewHints) {
          return (
            <FormControl key={controlId}>
              <InputLabel htmlFor={controlId}>{viewHints.name}</InputLabel>
              {elementForDatatype(
                field.name,
                viewHints,
                maybeValues,
                controlId
              )}
            </FormControl>
          );
        } else {
          return <p />;
        }
      })}
    </Paper>
  );
};

export default MetadataGroupView;
