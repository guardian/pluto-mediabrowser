import React, { CSSProperties, useContext, useState, useEffect, useRef } from "react";
import { VidispineItem } from "../vidispine/item/VidispineItem";
import {
  AccessTime,
  BathtubTwoTone,
  ComputerTwoTone,
  DescriptionTwoTone,
  MovieTwoTone,
  PanoramaTwoTone,
  Person,
  VolumeUpTwoTone,
} from "@material-ui/icons";
import VidispineContext from "../Context/VidispineContext";
import { format, parseISO } from "date-fns";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";
import { VError } from "ts-interface-checker";

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
  itemOwner: {
    fontSize: "13px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  inlineIcon: {
    maxHeight: "13px",
    marginRight: "0.2em",
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
    height: "240px",
  },
}));

const ItemTile: React.FC<ItemTileProps> = (props) => {
  const [loadedItem, setLoadedItem] = useState<VidispineItem | undefined>(undefined);
  let realItem: VidispineItem = new VidispineItem({
    id: "VX-1234",
    metadata: {
      revision: "",
      timespan: [
        {
          start: "-INF",
          end: "+INF",
          field: [],
          group: [
            {
              name: "Group1",
              field: [],
            },
          ],
        },
      ],
    },
  });
  //const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  //let dataLoaded = false;

  const classes = useStyles();

  console.log("ItemTile mounted for item: " + props.item.id);

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

  const formatCreatedDate = (created: any) => {
    //const created = props.item.getMetadataString("created");
    try {
      const createdDate = created ? parseISO(created) : undefined;
      return createdDate ? format(createdDate, "eee dd/MM/yyyy HH:mm:ss") : "";
    } catch (err) {
      console.error(`could not parse and format ${created}: ${err}`);
      return "(invalid date)";
    }
  };

  const isComponentMounted = useRef(false);

  useEffect(function () {
    isComponentMounted.current = true;
    return function () {
      isComponentMounted.current = false;
    };
  }, []);

  const validateVSItem = (content: any) => {
    console.log(content);
    try {
      return new VidispineItem(content);
    } catch (err) {
      if (err instanceof VError) {
        const vErr = err as VError;

        const itemId = content.id ?? "(no id given)";
        console.error(
          `Item ${itemId} failed metadata validation at ${vErr.path}: ${vErr.message}`
        );
      } else {
        console.error("Unexpected error: ", err);
      }
      return undefined;
    }
  };



  const loadNextPage = async () => {
    const searchUrl = `${
      vidispineContext?.baseUrl
    }/API/item/${props.item.id}?content=metadata`;

    try {

      const serverContent = await axios.get(
        searchUrl,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + window.localStorage["pluto:access-token"],
          },
        }
      );

      if (serverContent.data) {
        //console.log(serverContent);

        if (isComponentMounted.current) {
          setLoadedItem(validateVSItem(serverContent.data));
          //setDataLoaded(true);
        }

        //setLoadedItem(validateVSItem(serverContent.data));
        //let loadedItemData = validateVSItem(serverContent.data);

        //if (loadedItemData != undefined) {
        //  realItem = loadedItemData;
        //}
        //if (loadedItem != undefined) {
        //  console.log("Item data is now: " + loadedItem.id);
        //}
        //dataLoaded = true;
      }
    } catch (err) {
      console.error("Could not load content from server: ", err);
    }
  };

  useEffect(() => {
    loadNextPage();
  }, [props.item.id]);



  return (
    <div
      className={classes.itemBox}
      onClick={(evt) => props.onClick(props.item.id)}
      style={props.style} //this is set by react-window and allows us to virtualise a large number of tiles, i.e. only render what's visible
    >
      {loadedItem != undefined ? (
      <div className={classes.itemFilename}>
        <strong>
          {loadedItem.getMetadataString("originalFilename") ??
            loadedItem.getMetadataString("title")}
        </strong>
      </div>
      ) : (
          null
      )}

      <div className={classes.itemId}>{props.item.id}</div>
      {loadedItem != undefined ? (
      <div className={classes.itemThumbnail}>
        {loadedItem.getMetadataString(
            "representativeThumbnailNoAuth"
        ) && vidispineContext ? (
          <img
            src={vidispineContext.baseUrl + loadedItem.getMetadataString(
                "representativeThumbnailNoAuth"
            )}
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
      ) : (
          null
      )}
      {loadedItem != undefined ? (
      <div className={classes.itemOwner}>
        <Person className={classes.inlineIcon} />
        {loadedItem.getMetadataValuesInGroup("gnm_owner", "Asset")}
      </div>
      ) : (
          null
      )}
      {loadedItem != undefined ? (
      <div className={classes.itemCreated}>
        <AccessTime className={classes.inlineIcon} />
        {formatCreatedDate(loadedItem.getMetadataString("created"))}
      </div>
      ) : (
          null
      )}
    </div>
  );
};

export default ItemTile;
