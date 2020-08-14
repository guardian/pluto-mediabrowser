import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
} from "@material-ui/core";
import { VidispineItem } from "./vidispine/item/VidispineItem";
import PreviewPlayer from "./ItemView/PreviewPlayer";

import {
  RouteComponentProps,
  useHistory,
  useLocation,
  useParams,
} from "react-router-dom";
import FieldGroupCache from "./vidispine/FieldGroupCache";
import MetadataView from "./ItemView/MetadataView";
import {makeStyles} from "@material-ui/core/styles";

interface ItemViewComponentProps
  extends RouteComponentProps<ItemViewComponentMatches> {
  vidispineBaseUrl: string;
  fieldCache: FieldGroupCache;
}

const ItemViewComponent: React.FC<ItemViewComponentProps> = (props) => {
  const [itemData, setItemData] = useState<VidispineItem | undefined>();
  const [lastError, setLastError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const useStyles = makeStyles((theme) => ({
    heading: {
      fontSize: "26",
      padding: "0.5rem"
    }
  }))

  const classes = useStyles();

  const loadItemMeta = async () => {
    const targetUrl = `${props.vidispineBaseUrl}/API/item/${props.match.params.itemId}?content=metadata`;
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
    console.log(`Loading item with id ${props.match.params.itemId}`);
    loadItemMeta();
  }, []);

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
      <Paper elevation={3}>
        <Typography variant="h2" classes={{root: classes.heading}}>{pageTitle()}</Typography>
      </Paper>
      {loading ? <p>Loading...</p> : null}
      {lastError ? (
        <div className="error">
          <p>{lastError}</p>
        </div>
      ) : null}
      {itemData ? (
        <>
          <PreviewPlayer proxyUri="notsetyet" mediaType="notsetyet" />
          <hr />
          <MetadataView
            fieldCache={props.fieldCache}
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
