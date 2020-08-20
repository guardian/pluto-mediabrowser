import React, {useEffect, useState} from "react";
import VidispineSearchDoc from "../vidispine/search/VidispineSearch";
import MetadataGroupView, {MetadataGroupViewMode} from "../ItemView/MetadataGroupView";
import FieldGroupCache from "../vidispine/FieldGroupCache";
import {VidispineFieldGroup} from "../vidispine/field-group/VidispineFieldGroup";
import MetadataGroupSelector from "./MetadataGroupSelector";
import {Button, FormControl, Grid, IconButton, Input, InputLabel, Paper, Typography} from "@material-ui/core";
import {ArrowLeft, ArrowRight} from "@material-ui/icons";

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
  const [groupFieldSearch, setGroupFieldSearch] = useState<Map<string,string[]>>(new Map());

  /**
   * reset the search if the user changes the group selector
   */
  useEffect(() => {
    setGroupFieldSearch(new Map());
  }, [groupName]);

  const makeSearchDoc = () => {
    const initialDoc = new VidispineSearchDoc()
    const withTitle = titleSearch ? initialDoc.withSearchTerm("title", [titleSearch]) : initialDoc;
    const finalSearch = Array
        .from(groupFieldSearch)
        .reduce(
            (searchDoc, entry, idx)=>{
              const nonEmptyEntries = entry[1].filter(str=>str.length>0);

              if(nonEmptyEntries.length>0){
                return searchDoc.withSearchTerm(entry[0], nonEmptyEntries, groupName);
              } else {
                return searchDoc;
              }
            },
            withTitle
        );
    props.onUpdated(finalSearch);
  }

  return (
      //FIXME: replace the null with an expander
      props.isHidden ? <Paper elevation={3}>
            <IconButton aria-label="hide" onClick={()=>props.onHideToggled(false)}>
              <ArrowRight/>
            </IconButton>
          </Paper> :
    <>
      <Paper elevation={3}>
        <Grid container justify="space-between">
          <Grid item>
            <Typography variant="h4">Search</Typography>
          </Grid>
          <Grid item>
            <IconButton aria-label="hide" onClick={()=>props.onHideToggled(true)}>
              <ArrowLeft/>
            </IconButton>
          </Grid>
        </Grid>
        <ul className="hidden-list">
          <li className="hidden-list">
            <FormControl>
              <InputLabel>Title</InputLabel>
              <Input
                  value={titleSearch}
                  onChange={(evt)=>setTitleSearch(evt.target.value)}
              />
            </FormControl>
          </li>
          <li className="hidden-list">
            <MetadataGroupSelector
                value={groupName}
                onChange={(evt) => setGroupName(evt.target.value)}
            />
          </li>
          <li className="hidden-list">
            <Grid container justify="flex-end">
              <Grid item>
                <Button variant="contained" onClick={makeSearchDoc}>Search</Button>
              </Grid>
            </Grid>
          </li>
        </ul>
      </Paper>

        {
          <MetadataGroupView
            group={props.fieldGroupCache.get(groupName) as VidispineFieldGroup}
            content={groupFieldSearch}
            elevation={3}
            mode={MetadataGroupViewMode.SearchForm}
            noHeader={true}
            valueDidChange={(fieldName, newValue) => {
                console.log(fieldName, newValue);
              //setGroupFieldSearch(Object.assign({}, groupFieldSearch, {fieldName: newValue}))
              setGroupFieldSearch(existingValue=>{
                const newMap = new Map(existingValue);
                return newMap.set(fieldName, newValue);
              });
            }}
          />
      }
    </>
  );
};

export default VidispineSearchForm;
