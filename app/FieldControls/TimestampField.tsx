import React from "react";
import { FieldControlProps } from "./FieldControlsCommon";
import moment, { Moment } from "moment";
import { FormControl, FormLabel } from "@material-ui/core";
import {
  KeyboardDatePicker,
  KeyboardTimePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";

const TimestampField: React.FC<FieldControlProps> = (props) => {
  const currentValue: Moment | undefined = props.maybeValues
    ? props.maybeValues.length > 0
      ? moment(props.maybeValues[0])
      : undefined
    : undefined;

  console.log("current raw values: ", props.maybeValues);
  console.log(
    "parsed value: ",
    currentValue ? currentValue.format("YYYY-MM-DD") : " not defined"
  );
  console.log(
    "parsed value: ",
    currentValue ? currentValue.format("HH:mm:ss") : " not defined"
  );
  return (
    <FormControl>
      <FormLabel htmlFor={props.controlId}>{props.viewHints.name}</FormLabel>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          variant="inline"
          format="yyyy-MM-dd"
          margin="normal"
          id={props.controlId}
          value={currentValue ? currentValue.format("YYYY-MM-DD") : ""}
          onChange={(evt) => console.log(evt)}
        />
        <KeyboardTimePicker
          variant="inline"
          format="HH:mm:ss"
          margin="normal"
          value={currentValue ? currentValue.format("HH:mm:ss") : ""}
          onChange={(evt) => console.log(evt)}
        />
      </MuiPickersUtilsProvider>
    </FormControl>
  );
};

export default TimestampField;
