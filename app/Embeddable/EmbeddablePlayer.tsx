import React, { useContext, useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { VidispineItem } from "../vidispine/item/VidispineItem";
import { CircularProgress, Typography } from "@material-ui/core";
import VidispineContext from "../Context/VidispineContext";
import PlayerContainer from "../ItemView/PlayerContainer";
import { loadItemMeta } from "../ItemView/LoadItem";
import { BreakDownQueryString } from "./QueryString";

const EmbeddablePlayer: React.FC<RouteComponentProps> = (props) => {
  const [itemData, setItemData] = useState<VidispineItem | undefined>();
  const [lastError, setLastError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const vidispineContext = useContext(VidispineContext);

  //FIXME: should be loaded in from config!
  const defaultShapes = ["lowres", "lowimage", "lowaudio"];

  console.log("embeddablePlayer");

  useEffect(() => {
    if (vidispineContext) {
      const params = BreakDownQueryString(props.location.search);
      console.log("params are ", params);
      const maybeId = params.get("onlineId");
      if (maybeId) {
        console.log(`Loading item with id ${maybeId}`);
        loadItemMeta(vidispineContext.baseUrl, maybeId)
          .then((newItemData) => {
            setItemData(newItemData);
            setLastError("");
            setLoading(false);
          })
          .catch((err) => {
            setLoading(false);
            setLastError(err);
            if (err.includes("retrying"))
              window.setTimeout(
                () => loadItemMeta(vidispineContext.baseUrl, maybeId),
                3000
              ); //try again in 3 seconds
          });
      } else {
        console.error(
          "Can't load item because no onlineId was present. Request was ",
          params
        );
      }
    } else {
      console.log("vidispine context not present");
    }
  }, [vidispineContext]);

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
    <div id="mediabrowser-embed">
      {loading ? <CircularProgress /> : undefined}
      {itemData && itemData.shape && itemData.files ? (
        <PlayerContainer
          shapes={itemData.shape}
          defaultShapes={defaultShapes}
          uriList={itemData.files.uri}
          originalFilename={originalFilename()}
        />
      ) : (
        <Typography variant="caption">No shapes exist on this item</Typography>
      )}
      {lastError ? (
        <Typography variant="caption">{lastError}</Typography>
      ) : undefined}
    </div>
  );
};

export default EmbeddablePlayer;
