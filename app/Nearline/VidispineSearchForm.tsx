import React, { useContext, useEffect, useState } from "react";
import VidispineSearchDoc from "../vidispine/search/VidispineSearch";
import MetadataGroupView, {
  MetadataGroupViewMode,
} from "../ItemView/MetadataGroupView";
import FieldGroupCache from "../vidispine/FieldGroupCache";
import { VidispineFieldGroup } from "../vidispine/field-group/VidispineFieldGroup";
import MetadataGroupSelector from "../Frontpage/MetadataGroupSelector";
import {
  Button,
  FormControl,
  Grid,
  IconButton,
  Input,
  InputLabel,
  Paper,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { ArrowLeft, ArrowRight } from "@material-ui/icons";
import VidispineContext from "../Context/VidispineContext";

interface VidispineSearchFormProps {
  currentSearch?: VidispineSearchDoc;
  onUpdated: (newSearch: VidispineSearchDoc) => void;
  onHideToggled: (newValue: boolean) => void;
  isHidden: boolean;
  projectIdToLoad?: number;
  onLoadMoreClicked?: () => void;
  moreItemsAvailable?: boolean;
  onLoadPreviousClicked?: () => void;
  previousItemsAvailable?: boolean;
}

interface SearchEntry {
  field: string;
  value: string;
}

const VidispineSearchForm: React.FC<VidispineSearchFormProps> = (props) => {
  //FIXME: don't like the Asset name hard-coded like this
  const [groupName, setGroupName] = useState<string>("Asset");
  const [titleSearch, setTitleSearch] = useState<string>("");
  const [groupFieldSearch, setGroupFieldSearch] = useState<
    Map<string, string[]>
  >(new Map());

  const vidispineContext = useContext(VidispineContext);

  /**
   * reset the search if the user changes the group selector
   */
  useEffect(() => {
    setGroupFieldSearch(new Map());
  }, [groupName]);

  /**
   * called when the search button is pressed. Marshal our state into a VidispineSearchDoc and return it
   */
  const makeSearchDoc = () => {
    let maybeFields: Map<string, string[]> | undefined = titleSearch
      ? new Map([["title", [titleSearch]]])
      : undefined;

    if (maybeFields != undefined) {
      maybeFields.set("gnm_nearline_id", [""]);
    } else {
      maybeFields = new Map([["gnm_nearline_id", [""]]]);
    }

    const groups: Map<string, Map<string, string[]>> = new Map([
      [groupName, groupFieldSearch],
    ]);

    props.onUpdated(new VidispineSearchDoc(undefined, maybeFields, groups));
  };

  return props.isHidden ? (
    <Paper elevation={3}>
      <IconButton aria-label="hide" onClick={() => props.onHideToggled(false)}>
        <ArrowRight />
      </IconButton>
    </Paper>
  ) : (
    <>
      <Paper elevation={3} style={{ padding: "0.2em" }}>
        <Grid container justify="space-between">
          <Grid item>
            <Typography variant="h4">Search</Typography>
          </Grid>
          <Grid item>
            <IconButton
              aria-label="hide"
              onClick={() => props.onHideToggled(true)}
            >
              <ArrowLeft />
            </IconButton>
          </Grid>
        </Grid>
        <ul className="hidden-list">
          <li className="hidden-list">
            <FormControl>
              <InputLabel>Title</InputLabel>
              <Input
                value={titleSearch}
                onChange={(evt) => setTitleSearch(evt.target.value)}
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
            <Grid container spacing={2} justify="flex-end">
              <Grid item>
                <Tooltip
                  title={
                    props.previousItemsAvailable
                      ? "Load the previous 100 items"
                      : "There are no previous items"
                  }
                >
                  <span>
                    <Button
                      disabled={!props.previousItemsAvailable}
                      onClick={() =>
                        props.onLoadPreviousClicked
                          ? props.onLoadPreviousClicked()
                          : undefined
                      }
                    >
                      Previous 100
                    </Button>
                  </span>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip
                  title={
                    props.moreItemsAvailable
                      ? "Load the next 100 items"
                      : "All of the search results are displayed"
                  }
                >
                  <span>
                    <Button
                      disabled={!props.moreItemsAvailable}
                      onClick={() =>
                        props.onLoadMoreClicked
                          ? props.onLoadMoreClicked()
                          : undefined
                      }
                    >
                      Next 100
                    </Button>
                  </span>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title="Start a new search from the first item">
                  <Button variant="contained" onClick={makeSearchDoc}>
                    Search
                  </Button>
                </Tooltip>
              </Grid>
            </Grid>
          </li>
        </ul>
      </Paper>

      {vidispineContext ? (
        <MetadataGroupView
          group={
            vidispineContext.fieldCache.get(groupName) as VidispineFieldGroup
          }
          content={groupFieldSearch}
          elevation={3}
          mode={MetadataGroupViewMode.SearchForm}
          noHeader={true}
          projectIdToLoad={props.projectIdToLoad}
          valueDidChange={(fieldName, newValue) => {
            console.log(fieldName, newValue);
            setGroupFieldSearch((existingValue) => {
              const newMap = new Map(existingValue);
              const nonEmptyValues = newValue.filter((str) => str.length > 0);

              if (nonEmptyValues.length > 0) {
                newMap.set(fieldName, nonEmptyValues);
              } else {
                newMap.delete(fieldName);
              }
              return newMap;
            });
          }}
        />
      ) : undefined}
    </>
  );
};

export default VidispineSearchForm;
