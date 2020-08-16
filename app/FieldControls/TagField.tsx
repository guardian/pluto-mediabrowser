import React, { useState, useEffect } from "react";
import { FieldControlProps } from "./FieldControlsCommon";
import { FormControl, Typography } from "@material-ui/core";
import ChipInput from "material-ui-chip-input";

const TagField: React.FC<FieldControlProps> = (props) => {
  return (
    <FormControl classes={{ root: props.classes.inputField }}>
      <ChipInput
        value={props.maybeValues ?? []}
        readOnly={props.viewHints.readonly || props.parentReadonly}
        onAdd={(newtext) => {
          props.valueDidChange(
            props.fieldname,
            props.maybeValues ? props.maybeValues.concat(newtext) : [newtext]
          );
        }}
        onDelete={(newtext) =>
          props.valueDidChange(
            props.fieldname,
            props.maybeValues
              ? props.maybeValues.filter((v) => v != newtext)
              : []
          )
        }
        label={props.viewHints.name}
      />
      {props.viewHints.readonly && !props.parentReadonly ? (
        <Typography variant="caption">
          You can't edit this, it's read-only
        </Typography>
      ) : null}
    </FormControl>
  );
};

export default TagField;
