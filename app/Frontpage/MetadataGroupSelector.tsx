import React, { ChangeEvent } from "react";
import { FormControl, InputLabel, MenuItem, Select } from "@material-ui/core";

interface MetadataGroupSelectorProps {
  value: string;
  onChange: (evt: ChangeEvent<any>) => void;
}

const MetadataGroupSelector: React.FC<MetadataGroupSelectorProps> = (props) => {
  //FIXME: this is horrible. Better to load in from config.
  const availableMetadataGroups = [
    "Asset",
    "Rushes",
    "Deliverable",
    "Newswire",
  ];

  return (
    <FormControl
        style={{width:"100%"}}  //FIXME: find a better way to do this
    >
      <InputLabel id="md-group-selector">Search metadata group</InputLabel>
      <Select
        onChange={props.onChange}
        value={props.value}
        label="md-group=selector"
      >
        {availableMetadataGroups.map((groupName, idx) => (
          <MenuItem key={idx} value={groupName}>
            {groupName}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default MetadataGroupSelector;
