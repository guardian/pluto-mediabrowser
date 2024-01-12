import React, { useContext, useEffect, useState } from "react";
import { Paper, Typography } from "@material-ui/core";
import { VidispineItem } from "./vidispine/item/VidispineItem";
import { Helmet } from "react-helmet";
import { RouteComponentProps } from "react-router-dom";
import FieldGroupCache from "./vidispine/FieldGroupCache";
import MetadataView from "./ItemView/MetadataView";
import { makeStyles } from "@material-ui/core/styles";
import PlayerContainer from "./ItemView/PlayerContainer";
import VidispineContext from "./Context/VidispineContext";
import { loadItemMeta } from "./ItemView/LoadItem";
import { UserContext } from "@guardian/pluto-headers";
import RawMetadataView from "./ItemView/RawMetadataView";
import JobDataView from "./ItemView/JobDataView";

const ItemViewComponent: React.FC<RouteComponentProps<
  ItemViewComponentMatches
>> = (props) => {
  const [itemData, setItemData] = useState<VidispineItem | undefined>();
  const [lastError, setLastError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  //FIXME: should be loaded in from config!
  const defaultShapes = ["lowres", "lowimage", "lowaudio"];

  const vidispineContext = useContext(VidispineContext);
  const userContext = useContext(UserContext);

  const useStyles = makeStyles((theme) => ({
    heading: {
      fontSize: "26",
      padding: "0.5rem",
    },
  }));

  const classes = useStyles();

  useEffect(() => {
    if (vidispineContext) {
      console.log(`Loading item with id ${props.match.params.itemId}`);
      loadItemMeta(vidispineContext.baseUrl, props.match.params.itemId)
        .then((newItemData) => {
          setItemData(newItemData);
          setLastError("");
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          setLastError(err);
          if (err.contains("retrying")) window.setTimeout(loadItemMeta, 3000); //try again in 3 seconds
        });
    } else {
      console.log(
        "not loading item yet because vidispine context is not loaded"
      );
    }
  }, [vidispineContext]);

  const pageTitle = () => {
    if (!itemData) return "View item";
    const possibleTitle = itemData.getMetadataString("title");
    if (possibleTitle) {
      return `${possibleTitle as string} : ${props.match.params.itemId}`;
    } else {
      return `View item - ${props.match.params.itemId}`;
    }
  };

  const originalFilename = () => {
    if (!itemData) return undefined;
    const possibleFilename = itemData.getMetadataString("originalFilename");
    if (possibleFilename) {
      return `${possibleFilename as string}`;
    } else {
      return undefined;
    }
  };

  return (
    <>
      {itemData ? (
        <Helmet>
          <title>{pageTitle()}</title>
        </Helmet>
      ) : null}
      <Paper elevation={3}>
        <Typography variant="h2" classes={{ root: classes.heading }}>
          {pageTitle()}
        </Typography>
      </Paper>
      {loading ? <p>Loading...</p> : null}
      {lastError ? (
        <div className="error">
          <p>{lastError}</p>
        </div>
      ) : null}
      {itemData ? (
        <>
          {itemData && itemData.shape && itemData.files ? (
            <PlayerContainer
              shapes={itemData.shape}
              defaultShapes={defaultShapes}
              uriList={itemData.files.uri}
              originalFilename={originalFilename()}
            />
          ) : (
            <Typography variant="caption">
              No shapes exist on this item
            </Typography>
          )}
          <hr />
          <MetadataView
            elevation={3}
            readonly={false}
            content={itemData}
            valueDidChange={(groupname, fieldname, newvalue) =>
              console.log(
                `Would change ${fieldname} in ${groupname} to ${newvalue}`
              )
            }
          />
          {vidispineContext ? (
            <JobDataView
              itemId={itemData.id}
              baseURL={vidispineContext.baseUrl}
            />
          ) : null}
        </>
      ) : null}
    </>
  );
};

export default ItemViewComponent;
