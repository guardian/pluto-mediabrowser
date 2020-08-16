import React from "react";
import { FieldControlProps } from "./FieldControlsCommon";
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@material-ui/core";

const DropdownField: React.FC<FieldControlProps> = (props) => {
  if (props.viewHints.values) {
    return (
      <FormControl classes={{ root: props.classes.inputField }}>
        <InputLabel id={props.controlId}>{props.viewHints.name}</InputLabel>
        <Select
          labelId={props.controlId}
          readOnly={props.viewHints.readonly || props.parentReadonly}
          value={
            props.maybeValues
              ? props.maybeValues.length > 0
                ? props.maybeValues[0]
                : ""
              : ""
          }
          onChange={(event) =>
            props.valueDidChange(props.fieldname, [
              event.target.value as string,
            ])
          }
        >
          <MenuItem value="">(not set)</MenuItem>
          {props.viewHints.values.map((dataPair, index) => (
            <MenuItem value={dataPair.key}>{dataPair.value}</MenuItem>
          ))}
        </Select>
        {props.viewHints.readonly && !props.parentReadonly ? (
          <Typography variant="caption">
            You can't edit this, it's read-only
          </Typography>
        ) : null}
      </FormControl>
    );
  } else {
    return (
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
        spacing={1}
      >
        <Grid item sm={6}>
          <Typography>{props.viewHints.name}</Typography>
        </Grid>

        <Grid item sm={6}>
          <Typography
            variant="caption"
            id={props.controlId}
            classes={{
              root: props.classes.root,
            }}
          >
            Warning: field is a dropdown but has no values configured
          </Typography>
        </Grid>
      </Grid>
    );
  }
};

export default DropdownField;
