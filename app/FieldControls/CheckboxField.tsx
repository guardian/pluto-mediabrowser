import React from "react";
import { FieldControlProps } from "./FieldControlsCommon";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  Typography,
} from "@material-ui/core";

const CheckboxField: React.FC<FieldControlProps> = (props) => {
  if (props.viewHints.values) {
    return (
      <FormControl classes={{ root: props.classes.inputField }}>
        <Grid
          container
          direction="row"
          justify="flex-start"
          alignItems="flex-start"
          spacing={1}
        >
          <Grid item sm={3}>
            <FormLabel htmlFor={props.controlId}>
              {props.viewHints.name}
            </FormLabel>
            {props.viewHints.readonly &&
            !props.parentReadonly &&
            !props.ignoreHintsReadonly ? (
              <Typography variant="caption">
                You can't edit this, it's read-only
              </Typography>
            ) : null}
          </Grid>
          <Grid item sm={9}>
            <FormGroup id={props.controlId}>
              {props.viewHints.values.map((dataPair, idx) => (
                <FormControlLabel
                  key={dataPair.key}
                  label={dataPair.value}
                  control={
                    <Checkbox
                      checked={
                        props.maybeValues
                          ? props.maybeValues.includes(dataPair.key)
                          : false
                      }
                      color="primary"
                      readOnly={
                        props.ignoreHintsReadonly
                          ? false
                          : props.viewHints.readonly || props.parentReadonly
                      }
                      onChange={(event) => {
                        const newValue = event.target.checked
                          ? props.maybeValues
                            ? props.maybeValues.concat(dataPair.key)
                            : [dataPair.key]
                          : props.maybeValues
                          ? props.maybeValues.filter((v) => v !== dataPair.key)
                          : [];
                        props.valueDidChange(props.fieldname, newValue);
                      }}
                    />
                  }
                />
              ))}
            </FormGroup>
          </Grid>
        </Grid>
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
            Warning: field is a checkbox group but has no values configured
          </Typography>
        </Grid>
      </Grid>
    );
  }
};

export default CheckboxField;
