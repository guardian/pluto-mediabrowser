import React from "react";
import { FieldControlProps } from "./FieldControlsCommon";
import { FormControl, Input, InputLabel, Typography } from "@material-ui/core";

const StringField: React.FC<FieldControlProps> = (props) => {
  return (
    <FormControl classes={{ root: props.classes.inputField }}>
      <InputLabel htmlFor={props.controlId}>{props.viewHints.name}</InputLabel>
      <Input
        id={props.controlId}
        readOnly={props.viewHints.readonly || props.parentReadonly}
        value={props.maybeValues ? props.maybeValues.join(" ") : ""}
        onChange={(event) =>
          props.valueDidChange(props.fieldname, [event.target.value])
        }
      />
      {props.viewHints.readonly && !props.parentReadonly ? (
        <Typography variant="caption">
          You can't edit this, it's read-only
        </Typography>
      ) : null}
    </FormControl>
  );
};

export default StringField;
