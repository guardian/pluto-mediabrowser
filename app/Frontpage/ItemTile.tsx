import React, { CSSProperties, useContext } from "react";
import { VidispineItem } from "../vidispine/item/VidispineItem";
import {
  BathtubTwoTone,
  ComputerTwoTone,
  DescriptionTwoTone,
  MovieTwoTone,
  PanoramaTwoTone,
  VolumeUpTwoTone,
} from "@material-ui/icons";
import VidispineContext from "../Context/VidispineContext";
import { format, parseISO } from "date-fns";
import { makeStyles } from "@material-ui/core/styles";

interface ItemTileProps {
  item: VidispineItem;
  imageMaxWidth: number;
  imageMaxHeight: number;
  key?: string;
  style?: CSSProperties;
  onClick: (itemId: string) => void;
}

const mimeRegex = new RegExp("^([\\w\\d]+)/.*$");

const useStyles = makeStyles((theme) => ({
  itemFilename: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  itemId: {
    fontSize: "13px",
  },
  itemCreated: {
    fontSize: "13px",
  },
  itemThumbnail: {
    display: "flex",
    justifyContent: "center",
    alignContent: "center",
    width: "240px",
    margin: "-8px",
    marginTop: "0!important",
  },
  itemBox: {
    backgroundColor: theme.palette.type == "dark" ? "#222222" : "#DDDDDD",
    marginTop: "6px",
    marginBottom: "6px",
    borderRadius: "6px",
    width: "240px",
    display: "grid",
    cursor: "pointer",
    gridTemplateColumns: "200px",
    gridTemplateRows: "20px 18px 144px 20px",
    fontSize: "14px",
    padding: "8px",
    height: "220px",
  },
}));

const ItemTile: React.FC<ItemTileProps> = (props) => {
  const classes = useStyles();

  const maybeThumbnail = props.item.getMetadataString(
    "representativeThumbnailNoAuth"
  );

  const vidispineContext = useContext(VidispineContext);

  /**
   * get the "major" portion of the mimetype, or undefined if it can't be found
   */
  const getMimeMajorType = () => {
    const maybeMimeType = props.item.getMetadataString("mimeType");
    const matches = maybeMimeType ? mimeRegex.exec(maybeMimeType) : undefined;
    return matches ? matches[1].toLowerCase() : undefined;
  };

  /**
   * get an icon representing the mime type, or a default one otherwise
   */
  const mediaTypeIcon = () => {
    switch (getMimeMajorType()) {
      case "video":
        return <MovieTwoTone style={{ width: "104px", height: "104px" }} />;
      case "audio":
        return <VolumeUpTwoTone style={{ width: "104px", height: "104px" }} />;
      case "text":
        return (
          <DescriptionTwoTone style={{ width: "104px", height: "104px" }} />
        );
      case "application":
        return <ComputerTwoTone style={{ width: "104px", height: "104px" }} />;
      case "image":
        return <PanoramaTwoTone style={{ width: "104px", height: "104px" }} />;
      default:
        return <BathtubTwoTone style={{ width: "104px", height: "104px" }} />;
    }
  };

  const formatCreatedDate = () => {
    const created = props.item.getMetadataString("created");
    try {
      const createdDate = created ? parseISO(created) : undefined;
      return createdDate ? format(createdDate, "eee dd/MM/yyyy HH:mm:ss") : "";
    } catch (err) {
      console.error(`could not parse and format ${created}: ${err}`);
      return "(invalid date)";
    }
  };

  return (
    <div
      className={classes.itemBox}
      onClick={(evt) => props.onClick(props.item.id)}
      style={props.style} //this is set by react-window and allows us to virtualise a large number of tiles, i.e. only render what's visible
    >
      <div className={classes.itemFilename}>
        <strong>
          {props.item.getMetadataString("originalFilename") ??
            props.item.getMetadataString("title")}
        </strong>
      </div>

      <div className={classes.itemId}>{props.item.id}</div>
      <div className={classes.itemThumbnail}>
        {maybeThumbnail && vidispineContext ? (
          <img
            src={vidispineContext.baseUrl + maybeThumbnail}
            alt="Item thumbnail"
            style={{
              maxWidth: props.imageMaxWidth,
              maxHeight: props.imageMaxHeight,
            }}
            className="thumbnail"
          />
        ) : (
          mediaTypeIcon()
        )}
      </div>
      <div className={classes.itemCreated}>{formatCreatedDate()}</div>
    </div>
  );
};

export default ItemTile;
