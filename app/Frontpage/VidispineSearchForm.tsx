import React, { useEffect, useState } from "react";
import VidispineSearchDoc from "../vidispine/search/VidispineSearch";
import MetadataGroupView from "../ItemView/MetadataGroupView";
import FieldGroupCache from "../vidispine/FieldGroupCache";
import { VidispineFieldGroup } from "../vidispine/field-group/VidispineFieldGroup";
import MetadataGroupSelector from "./MetadataGroupSelector";
import {Button, FormControl, Input, InputLabel, Paper, Typography} from "@material-ui/core";

interface VidispineSearchFormProps {
  currentSearch?: VidispineSearchDoc;
  fieldGroupCache: FieldGroupCache;
  onUpdated: (newSearch: VidispineSearchDoc) => void;
  onHideToggled: (newValue: boolean) => void;
  isHidden: boolean;
}

interface SearchEntry {
  field:string;
  value:string;
}

const VidispineSearchForm: React.FC<VidispineSearchFormProps> = (props) => {
  //FIXME: don't like the Asset name hard-coded like this
  const [groupName, setGroupName] = useState<string>("Asset");
  const [titleSearch, setTitleSearch] = useState<string>("");
  const [groupFieldSearch, setGroupFieldSearch] = useState<Map<string,string>>(new Map());

  /**
   * reset the search if the user changes the group selector
   */
  useEffect(() => {
    setGroupFieldSearch(new Map());
  }, [groupName]);

  const makeSearchDoc = () => {
    const initialDoc = new VidispineSearchDoc()
    const withTitle = titleSearch ? initialDoc.withSearchTerm("title", [titleSearch]) : initialDoc;
    const finalSearch = Array.from(groupFieldSearch).reduce((searchDoc, entry, idx)=>{
      return searchDoc.withSearchTerm(entry[0],[entry[1]],groupName);
    },withTitle);
    props.onUpdated(finalSearch);
  }

  return (
      //FIXME: replace the null with an expander
      props.isHidden ? null :
    <>
      <Paper elevation={3}>
        <Typography variant="h4">Search</Typography>
        <FormControl>
          <InputLabel>Title</InputLabel>
          <Input
              value={titleSearch}
              onChange={(evt)=>setTitleSearch(evt.target.value)}
          />
        </FormControl>
        <MetadataGroupSelector
            value={groupName}
            onChange={(evt) => setGroupName(evt.target.value)}
        />
        <Button variant="outlined" onClick={makeSearchDoc}>Search</Button>
      </Paper>

        {
          <MetadataGroupView
            group={props.fieldGroupCache.get(groupName) as VidispineFieldGroup}
            content={groupFieldSearch}
            elevation={3}
            readonly={false}
            noHeader={true}
            valueDidChange={(fieldName, newValue) => {
                console.log(fieldName, newValue);
              setGroupFieldSearch(Object.assign({}, groupFieldSearch, {fieldName: newValue}))
            }}
          />
      }
    </>
  );
};

export default VidispineSearchForm;
