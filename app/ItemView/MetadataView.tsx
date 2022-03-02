import React, { useContext, useState } from "react";
import MetadataGroupView, { MetadataGroupViewMode } from "./MetadataGroupView";
import FieldGroupCache from "../vidispine/FieldGroupCache";
import { VidispineItem } from "../vidispine/item/VidispineItem";
import { Grid, Typography } from "@material-ui/core";
import ToggleButton from "@material-ui/lab/ToggleButton";
import { Edit } from "@material-ui/icons";
import VidispineContext from "../Context/VidispineContext";

interface MetadataViewProps {
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

  const vidispineContext = useContext(VidispineContext);

  const getTableContent = (fieldCache: FieldGroupCache) =>
    //So, Array.from() is not the most performant method of iterating, but should be fine on small collections
    //https://stackoverflow.com/questions/43885365/using-map-on-an-iterator
    Array.from(fieldCache._content, ([groupname, group]) => {
      return props.content.hasGroup(groupname) ? ( //only render groups that are present on the item
        <MetadataGroupView
          key={groupname}
          group={group}
          content={props.content}
          elevation={props.elevation}
          mode={
            editMode
              ? MetadataGroupViewMode.MetadataEdit
              : MetadataGroupViewMode.MetadataView
          }
          valueDidChange={(fieldname, newvalue) =>
            props.valueDidChange(groupname, fieldname, newvalue)
          }
        />
      ) : null;
    });

  return (
    <>
      <Grid container justify="flex-end" alignContent="flex-start">
        <Grid item>
          <ToggleButton
            id="metadata-edit-toggle"
            selected={editMode}
            onChange={() => setEditMode(!editMode)}
          >
            <Edit />
            <Typography variant="caption">
              {editMode ? "Finish Editing" : "Edit Metadata"}
            </Typography>
          </ToggleButton>
        </Grid>
      </Grid>
      {vidispineContext
        ? getTableContent(vidispineContext.fieldCache)
        : undefined}
    </>
  );
};
export default MetadataView;
