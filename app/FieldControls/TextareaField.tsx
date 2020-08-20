import React from "react";
import { FieldControlProps } from "./FieldControlsCommon";
import { FormControl, Input, InputLabel, Typography } from "@material-ui/core";

interface TextareaFieldProps extends FieldControlProps {
  rows?: number;
  rowsMax?: number;
}

const TextareaField: React.FC<TextareaFieldProps> = (props) => {
  return (
    <FormControl classes={{ root: props.classes.inputField }}>
      <InputLabel htmlFor={props.controlId}>{props.viewHints.name}</InputLabel>
      <Input
        id={props.controlId}
        readOnly={props.ignoreHintsReadonly ? false : props.viewHints.readonly || props.parentReadonly}
        multiline={true}
        rows={props.rows ?? 6}
        rowsMax={props.rowsMax ?? 6}
        value={props.maybeValues ? props.maybeValues.join(" ") : ""}
        onChange={(event) =>
          props.valueDidChange(props.fieldname, [event.target.value])
        }
      />
      {props.viewHints.readonly && !props.parentReadonly && !props.ignoreHintsReadonly ? (
        <Typography variant="caption">
          You can't edit this, it's read-only
        </Typography>
      ) : null}
    </FormControl>
  );
};

export default TextareaField;
