import "date-fns";
import React, { useEffect, useState } from "react";
import {
  TextareaAutosize,
  Input,
  InputLabel,
  FormLabel,
  Paper,
  FormControl,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormGroup,
  Checkbox,
  FormControlLabel,
  TextField,
} from "@material-ui/core";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import {
  VidispineField,
  VidispineFieldGroup,
} from "../vidispine/field-group/VidispineFieldGroup";
import { VidispineItem } from "../vidispine/item/VidispineItem";
import { PlutoCustomData } from "../vidispine/field-group/CustomData";
import { makeStyles } from "@material-ui/core/styles";
import ChipInput from "material-ui-chip-input";
import Autocomplete from "@material-ui/lab/Autocomplete";
import moment, { Moment } from "moment";

interface MetadataGroupViewProps {
  group: VidispineFieldGroup;
  content: VidispineItem;
  elevation: number;
  readonly: boolean;
  valueDidChange: (name: string, values: string[]) => void;
}

const MetadataGroupView: React.FC<MetadataGroupViewProps> = (props) => {
  const useStyles = makeStyles((theme) => ({
    root: {
      warning: {
        color: theme.palette.warning,
      },
    },
    metagroup: {
      marginTop: "1.5rem",
      padding: "0.75rem",
    },
    inputField: {
      minWidth: "100%",
      maxWidth: "100%",
    },
  }));

  const classes = useStyles();

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
      case "tags":
        return (
          <FormControl classes={{ root: classes.inputField }}>
            <ChipInput
              value={maybeValues ?? []}
              readOnly={viewHints.readonly || props.readonly}
              onAdd={(newtext) => {
                props.valueDidChange(
                  fieldname,
                  maybeValues ? maybeValues.concat(newtext) : [newtext]
                );
              }}
              onDelete={(newtext) =>
                props.valueDidChange(
                  fieldname,
                  maybeValues ? maybeValues.filter((v) => v != newtext) : []
                )
              }
              label={viewHints.name}
            />
            {viewHints.readonly && !props.readonly ? (
              <Typography variant="caption">
                You can't edit this, it's read-only
              </Typography>
            ) : null}
          </FormControl>
        );
      case "lookup":
        return (
          <FormControl classes={{ root: classes.inputField }}>
            <FormLabel htmlFor={controlId}>{viewHints.name}</FormLabel>
            {viewHints.readonly || props.readonly ? (
              <Input
                readOnly={true}
                id={controlId}
                value={maybeValues ? maybeValues.join(" ") : ""}
              />
            ) : (
              <Autocomplete
                renderInput={(params) => <TextField {...params} />}
                options={viewHints.values ?? []}
                getOptionLabel={(entry) => entry.value}
              />
            )}
            {viewHints.readonly && !props.readonly ? (
              <Typography variant="caption">
                You can't edit this, it's read-only
              </Typography>
            ) : null}
          </FormControl>
        );
      case "checkbox":
        if (viewHints.values) {
          return (
            <FormControl classes={{ root: classes.inputField }}>
              <Grid
                container
                direction="row"
                justify="flex-start"
                alignItems="flex-start"
                spacing={1}
              >
                <Grid item sm={3}>
                  <FormLabel htmlFor={controlId}>{viewHints.name}</FormLabel>
                  {viewHints.readonly && !props.readonly ? (
                    <Typography variant="caption">
                      You can't edit this, it's read-only
                    </Typography>
                  ) : null}
                </Grid>
                <Grid item sm={9}>
                  <FormGroup id={controlId}>
                    {viewHints.values.map((dataPair, idx) => (
                      <FormControlLabel
                        label={dataPair.value}
                        control={
                          <Checkbox
                            checked={
                              maybeValues
                                ? maybeValues.includes(dataPair.key)
                                : false
                            }
                            color="primary"
                            readOnly={viewHints.readonly || props.readonly}
                            onChange={(event) => {
                              const newValue = event.target.checked
                                ? maybeValues
                                  ? maybeValues.concat(dataPair.key)
                                  : [dataPair.key]
                                : maybeValues
                                ? maybeValues.filter((v) => v !== dataPair.key)
                                : [];
                              props.valueDidChange(fieldname, newValue);
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
                <Typography>{viewHints.name}</Typography>
              </Grid>

              <Grid item sm={6}>
                <Typography
                  variant="caption"
                  id={controlId}
                  classes={{
                    root: classes.root,
                  }}
                >
                  Warning: field is a checkbox group but has no values
                  configured
                </Typography>
              </Grid>
            </Grid>
          );
        }
      case "dropdown":
        if (viewHints.values) {
          return (
            <FormControl classes={{ root: classes.inputField }}>
              <InputLabel id={controlId}>{viewHints.name}</InputLabel>
              <Select
                labelId={controlId}
                readOnly={viewHints.readonly || props.readonly}
                value={
                  maybeValues
                    ? maybeValues.length > 0
                      ? maybeValues[0]
                      : ""
                    : ""
                }
                onChange={(event) =>
                  props.valueDidChange(fieldname, [
                    event.target.value as string,
                  ])
                }
              >
                <MenuItem value="">(not set)</MenuItem>
                {viewHints.values.map((dataPair, index) => (
                  <MenuItem value={dataPair.key}>{dataPair.value}</MenuItem>
                ))}
              </Select>
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
                <Typography>{viewHints.name}</Typography>
              </Grid>

              <Grid item sm={6}>
                <Typography
                  variant="caption"
                  id={controlId}
                  classes={{
                    root: classes.root,
                  }}
                >
                  Warning: field is a dropdown but has no values configured
                </Typography>
              </Grid>
            </Grid>
          );
        }
      case "textarea":
        return (
          <FormControl classes={{ root: classes.inputField }}>
            <InputLabel htmlFor={controlId}>{viewHints.name}</InputLabel>
            <Input
              id={controlId}
              readOnly={viewHints.readonly || props.readonly}
              multiline={true}
              rows={6}
              rowsMax={6}
              value={maybeValues ? maybeValues.join(" ") : ""}
              onChange={(event) =>
                props.valueDidChange(fieldname, [event.target.value])
              }
            />
            {viewHints.readonly && !props.readonly ? (
              <Typography variant="caption">
                You can't edit this, it's read-only
              </Typography>
            ) : null}
          </FormControl>
        );
      case "string":
        return (
          <FormControl classes={{ root: classes.inputField }}>
            <InputLabel htmlFor={controlId}>{viewHints.name}</InputLabel>
            <Input
              id={controlId}
              readOnly={viewHints.readonly || props.readonly}
              value={maybeValues ? maybeValues.join(" ") : ""}
              onChange={(event) =>
                props.valueDidChange(fieldname, [event.target.value])
              }
            />
            {viewHints.readonly && !props.readonly ? (
              <Typography variant="caption">
                You can't edit this, it's read-only
              </Typography>
            ) : null}
          </FormControl>
        );
      case "timestamp":
        const currentValue: Moment | undefined = maybeValues
          ? maybeValues.length > 0
            ? moment(maybeValues[0])
            : undefined
          : undefined;

        console.log("current raw values: ", maybeValues);
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
            <FormLabel htmlFor={controlId}>{viewHints.name}</FormLabel>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
                variant="inline"
                format="yyyy-MM-dd"
                margin="normal"
                id={controlId}
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
      default:
        return (
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="flex-start"
            spacing={1}
          >
            <Grid item sm={6}>
              <Typography>{viewHints.name}</Typography>
            </Grid>

            <Grid item sm={6}>
              <Typography
                variant="caption"
                id={controlId}
                classes={{
                  root: classes.root,
                }}
              >
                Warning: field type {viewHints.type} is not recognised
              </Typography>
            </Grid>
          </Grid>
        );
    }
  };

  return (
    <Paper elevation={props.elevation} classes={{ root: classes.metagroup }}>
      <Typography variant="h3">{props.group.name}</Typography>
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
        spacing={2}
      >
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
              <Grid item sm={6}>
                {elementForDatatype(
                  field.name,
                  viewHints,
                  maybeValues,
                  controlId
                )}
              </Grid>
            );
          } else {
            return <p />;
          }
        })}
      </Grid>
    </Paper>
  );
};

export default MetadataGroupView;
