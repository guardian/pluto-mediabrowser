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
import TagField from "../FieldControls/TagField";
import LookupField from "../FieldControls/LookupField";
import CheckboxField from "../FieldControls/CheckboxField";
import DropdownField from "../FieldControls/DropdownField";
import TextareaField from "../FieldControls/TextareaField";
import StringField from "../FieldControls/StringField";
import TimestampField from "../FieldControls/TimestampField";
import FieldTypeNotRecognised from "../FieldControls/FieldTypeNotRecognised";
import VidispineSearchDoc from "../vidispine/search/VidispineSearch";

enum MetadataGroupViewMode {
  MetadataView,
  MetadataEdit,
  SearchForm,
}

interface MetadataGroupViewProps {
  group: VidispineFieldGroup;
  content: VidispineItem | Map<string, string[]>;
  elevation: number;
  mode: MetadataGroupViewMode;
  noHeader?: boolean;
  valueDidChange: (name: string, values: string[]) => void;
  projectIdToLoad?: number;
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
   * @param fieldname server name of the field.
   * @param viewHints a ViewHints instance consisiting of the "custom data" which tells us the label content,
   * type of field to render, etc.
   * @param maybeValues an optional array of strings giving the values assigned to the field. It's up to the
   * specific field type how this is interpreted
   * @param controlId html id for the control
   */
  const elementForDatatype = (
    fieldname: string,
    viewHints: PlutoCustomData,
    maybeValues: string[] | undefined,
    controlId: string
  ) => {
    switch (viewHints.type) {
      case "tags":
        let valuesToUse = maybeValues;
        if (
          fieldname == "gnm_containing_projects" &&
          props.projectIdToLoad != 0
        ) {
          valuesToUse = [String(props.projectIdToLoad)];
        }
        return (
          <TagField
            fieldname={fieldname}
            viewHints={viewHints}
            controlId={controlId}
            parentReadonly={props.mode == MetadataGroupViewMode.MetadataView} //always force read-only if in view mode
            ignoreHintsReadonly={props.mode == MetadataGroupViewMode.SearchForm} //always allow edit in search form mode
            valueDidChange={props.valueDidChange}
            classes={classes}
            maybeValues={valuesToUse}
          />
        );
      case "lookup":
        return (
          <LookupField
            fieldname={fieldname}
            viewHints={viewHints}
            controlId={controlId}
            parentReadonly={props.mode == MetadataGroupViewMode.MetadataView}
            ignoreHintsReadonly={props.mode == MetadataGroupViewMode.SearchForm} //always allow edit in search form mode
            valueDidChange={props.valueDidChange}
            classes={classes}
            maybeValues={maybeValues}
          />
        );
      case "checkbox":
        return (
          <CheckboxField
            fieldname={fieldname}
            viewHints={viewHints}
            controlId={controlId}
            parentReadonly={props.mode == MetadataGroupViewMode.MetadataView}
            ignoreHintsReadonly={props.mode == MetadataGroupViewMode.SearchForm} //always allow edit in search form mode
            valueDidChange={props.valueDidChange}
            classes={classes}
            maybeValues={maybeValues}
          />
        );
      case "dropdown":
        return (
          <DropdownField
            fieldname={fieldname}
            viewHints={viewHints}
            controlId={controlId}
            parentReadonly={props.mode == MetadataGroupViewMode.MetadataView}
            ignoreHintsReadonly={props.mode == MetadataGroupViewMode.SearchForm} //always allow edit in search form mode
            valueDidChange={props.valueDidChange}
            classes={classes}
            maybeValues={maybeValues}
          />
        );
      case "textarea":
        return (
          <TextareaField
            fieldname={fieldname}
            viewHints={viewHints}
            controlId={controlId}
            parentReadonly={props.mode == MetadataGroupViewMode.MetadataView}
            ignoreHintsReadonly={props.mode == MetadataGroupViewMode.SearchForm} //always allow edit in search form mode
            valueDidChange={props.valueDidChange}
            classes={classes}
            maybeValues={maybeValues}
          />
        );
      case "string":
        return (
          <StringField
            fieldname={fieldname}
            viewHints={viewHints}
            controlId={controlId}
            parentReadonly={props.mode == MetadataGroupViewMode.MetadataView}
            ignoreHintsReadonly={props.mode == MetadataGroupViewMode.SearchForm} //always allow edit in search form mode
            valueDidChange={props.valueDidChange}
            classes={classes}
            maybeValues={maybeValues}
          />
        );
      case "timestamp":
        //FIXME: we should present a range if in SearchForm mode
        return (
          <TimestampField
            fieldname={fieldname}
            viewHints={viewHints}
            controlId={controlId}
            parentReadonly={props.mode == MetadataGroupViewMode.MetadataView}
            ignoreHintsReadonly={props.mode == MetadataGroupViewMode.SearchForm} //always allow edit in search form mode
            valueDidChange={props.valueDidChange}
            classes={classes}
            maybeValues={maybeValues}
          />
        );
      default:
        return (
          <FieldTypeNotRecognised
            fieldname={fieldname}
            viewHints={viewHints}
            controlId={controlId}
            parentReadonly={props.mode == MetadataGroupViewMode.MetadataView}
            ignoreHintsReadonly={props.mode == MetadataGroupViewMode.SearchForm} //always allow edit in search form mode
            valueDidChange={props.valueDidChange}
            classes={classes}
            maybeValues={maybeValues}
          />
        );
    }
  };

  const valuesFromContent = (field: VidispineField) => {
    if (props.content instanceof VidispineItem) {
      return props.content.getMetadataValuesInGroup(
        field.name,
        props.group.name
      );
    } else {
      return props.content.get(field.name);
    }
  };

  return (
    <Paper elevation={props.elevation} classes={{ root: classes.metagroup }}>
      {props.noHeader ? null : (
        <Typography variant="h3">{props.group.name}</Typography>
      )}
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
          const maybeValues: string[] | undefined = valuesFromContent(field);
          const viewHints = field.getCustomData();

          if (!viewHints) {
            console.log(
              `Field ${field.name} in ${props.group.name} has no view hints data`
            );
            return null;
          }

          if (viewHints) {
            return (
              <Grid item sm={6} key={idx}>
                {elementForDatatype(
                  field.name,
                  viewHints,
                  maybeValues,
                  controlId
                )}
              </Grid>
            );
          } else {
            return null;
          }
        })}
      </Grid>
    </Paper>
  );
};

export { MetadataGroupViewMode };
export default MetadataGroupView;
