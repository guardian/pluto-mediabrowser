import React from "react";
import { FieldControlProps } from "./FieldControlsCommon";
import { Grid, Typography } from "@material-ui/core";

const FieldTypeNotRecognised: React.FC<FieldControlProps> = (props) => {
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
          Warning: field type {props.viewHints.type} is not recognised
        </Typography>
      </Grid>
    </Grid>
  );
};

export default FieldTypeNotRecognised;
