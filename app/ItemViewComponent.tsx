import React, {useContext, useEffect, useState} from "react";
import axios from "axios";
import {
  Paper,
  Typography,
} from "@material-ui/core";
import { VidispineItem } from "./vidispine/item/VidispineItem";
import { Helmet } from "react-helmet";
import {
  RouteComponentProps,
} from "react-router-dom";
import FieldGroupCache from "./vidispine/FieldGroupCache";
import MetadataView from "./ItemView/MetadataView";
import { makeStyles } from "@material-ui/core/styles";
import PlayerContainer from "./ItemView/PlayerContainer";
import VidispineContext from "./Context/VidispineContext";

const ItemViewComponent: React.FC<RouteComponentProps<ItemViewComponentMatches>> = (props) => {
  const [itemData, setItemData] = useState<VidispineItem | undefined>();
  const [lastError, setLastError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  //FIXME: should be loaded in from config!
  const defaultShapes = ["lowres", "lowimage", "lowaudio"];

  const vidispineContext = useContext(VidispineContext);

  const useStyles = makeStyles((theme) => ({
    heading: {
      fontSize: "26",
      padding: "0.5rem",
    },
  }));

  const classes = useStyles();

  const loadItemMeta = async (vidispineBaseUrl:string) => {
    const targetUrl = `${vidispineBaseUrl}/API/item/${props.match.params.itemId}?content=metadata,shape,uri&methodType=AUTO`;
    console.debug("loading item data from ", targetUrl);
    try {
      const result = await axios.get(targetUrl, {
        headers: { Accept: "application/json" },
      });
      const newItemData = new VidispineItem(result.data);
      console.debug("completed loading data: ", newItemData);
      setItemData(newItemData);
      setLastError("");
      setLoading(false);
    } catch (err) {
      console.error("Could not load from ", targetUrl, ": ", err);
      setLoading(false);
      if (err.response) {
        switch (err.response.status) {
          case 404:
            setLastError("The item does not exist.");
            break;
          case 400:
            setLastError("The item ID is not valid");
            break;
          case 503 | 502:
            setLastError("The server is not responding, retrying...");
            window.setTimeout(loadItemMeta, 3000);
            break;
          case 500:
            setLastError(
              "There is a server problem, please report this to multimediatech@theguardian.com"
            );
            break;
          default:
            console.error(err);
            setLastError(
              "Unable to load the given item. Please refer to the console for more information."
            );
        }
      } else {
        console.error(err);
        setLastError(
          "Unable to load the given item. Please refer to the console for more information."
        );
      }
    }
  };

  useEffect(() => {
    if(vidispineContext) {
      console.log(`Loading item with id ${props.match.params.itemId}`);
      loadItemMeta(vidispineContext.baseUrl);
    } else {
      console.log("not loading item yet because vidispine context is not loaded")
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
        </>
      ) : null}
    </>
  );
};

export default ItemViewComponent;
