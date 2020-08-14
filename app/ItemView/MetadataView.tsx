import React, { useEffect, useState } from "react";
import MetadataGroupView from "./MetadataGroupView";
import FieldGroupCache from "../vidispine/FieldGroupCache";
import { VidispineItem } from "../vidispine/item/VidispineItem";
import { VidispineFieldGroup } from "../vidispine/field-group/VidispineFieldGroup";
import { doc } from "prettier";
import group = doc.builders.group;
import {Grid, Paper, Typography} from "@material-ui/core";
import ToggleButton from '@material-ui/lab/ToggleButton';
import {Edit} from "@material-ui/icons";

interface MetadataViewProps {
  fieldCache: FieldGroupCache;
  elevation: number;
  readonly: boolean;
  content: VidispineItem;
  valueDidChange: (
    groupname: string,
    fieldname: string,
    newvalue: string[]
  ) => void;
}

const MetadataView: React.FC<MetadataViewProps> = (props) => {
  const [editMode, setEditMode] = useState<boolean>(false);
  console.log(props.fieldCache._content);

  return (
    <>
      <Paper elevation={3}>
        <Grid container justify="flex-end" alignContent="flex-start">
          <Grid item>
          <ToggleButton
            selected={editMode}
            onChange={()=>setEditMode(!editMode)}
          >
            <Edit/><Typography variant="caption">{
              editMode ? "Finish Editing" : "Edit Metadata"
          }</Typography>
          </ToggleButton>
          </Grid>
        </Grid>
      </Paper>
      {
        //So, Array.from() is not the most performant method of iterating, but should be fine on small collections
        //https://stackoverflow.com/questions/43885365/using-map-on-an-iterator
        Array.from(props.fieldCache._content, ([groupname, group]) => {
          console.log("rendering ", groupname);
          return (
            <MetadataGroupView
              key={groupname}
              group={group}
              content={props.content}
              elevation={props.elevation}
              readonly={!editMode}
              valueDidChange={(fieldname, newvalue) =>
                props.valueDidChange(groupname, fieldname, newvalue)
              }
            />
          );
        })
      }
    </>
  );
};
export default MetadataView;
