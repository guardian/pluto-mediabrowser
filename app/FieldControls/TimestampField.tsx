import React from "react";
import { FieldControlProps } from "./FieldControlsCommon";
import { FormControl, FormLabel } from "@material-ui/core";
import {
  KeyboardDatePicker,
  KeyboardTimePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";

const TimestampField: React.FC<FieldControlProps> = (props) => {
  const currentValue: string | undefined = props.maybeValues
    ? props.maybeValues.length > 0
      ? props.maybeValues[0]
      : undefined
    : undefined;

  return (
    <FormControl>
      <FormLabel htmlFor={props.controlId}>{props.viewHints.name}</FormLabel>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          variant="inline"
          format="yyyy-MM-dd"
          margin="normal"
          readOnly={props.ignoreHintsReadonly ? false : props.viewHints.readonly || props.parentReadonly}
          id={props.controlId}
          value={currentValue ?? ""}
          onChange={(evt) => console.log(evt)}
        />
        <KeyboardTimePicker
          variant="inline"
          format="HH:mm:ss"
          margin="normal"
          id={`${props.controlId}-time`}
          readOnly={props.ignoreHintsReadonly ? false : props.viewHints.readonly || props.parentReadonly}
          value={currentValue ?? ""}
          onChange={(evt) => console.log(evt)}
        />
      </MuiPickersUtilsProvider>
    </FormControl>
  );
};

export default TimestampField;
