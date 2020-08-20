import React from "react";
import { VidispineItem } from "../vidispine/item/VidispineItem";
import moment from "moment";
import {
    Bathtub, BathtubTwoTone,
    Computer,
    ComputerTwoTone,
    Description, DescriptionTwoTone,
    Movie, MovieTwoTone,
    Panorama,
    PanoramaTwoTone,
    VolumeUp, VolumeUpTwoTone
} from "@material-ui/icons";

interface ItemTileProps {
  item: VidispineItem;
  imageMaxWidth: number;
  imageMaxHeight: number;
  vidispineBaseUrl: string;
  key?: string;
  onClick: (itemId: string) => void;
}

const mimeRegex = new RegExp("^([\\w\\d]+)\/.*$");

const ItemTile: React.FC<ItemTileProps> = (props) => {
  const maybeThumbnail = props.item.getMetadataString(
    "representativeThumbnailNoAuth"
  );

    /**
     * get the "major" portion of the mimetype, or undefined if it can't be found
     */
  const getMimeMajorType = () => {
      const maybeMimeType = props.item.getMetadataString("mimeType");
      const matches = maybeMimeType ? mimeRegex.exec(maybeMimeType) : undefined;
      return matches ? matches[1].toLowerCase() : undefined;
  }

    /**
     * get an icon representing the mime type, or a default one otherwise
     */
  const mediaTypeIcon = () => {
      switch(getMimeMajorType()) {
          case "video":
              return <MovieTwoTone style={{width: "104px", "height":"104px"}}/>
          case "audio":
              return <VolumeUpTwoTone style={{width: "104px", "height":"104px"}}/>
          case "text":
              return <DescriptionTwoTone style={{width: "104px", "height":"104px"}}/>
          case "application":
              return <ComputerTwoTone style={{width: "104px", "height":"104px"}}/>
          case "image":
              return <PanoramaTwoTone style={{width: "104px", "height":"104px"}}/>
          default:
              return <BathtubTwoTone style={{width: "104px", "height":"104px"}}/>
      }
  }

  return (
    <div className="item_box" onClick={(evt) => props.onClick(props.item.id)}>
      <div className="item_filename">
        <strong>
          {props.item.getMetadataString("originalFilename") ??
            props.item.getMetadataString("title")}
        </strong>
      </div>

      <div className="item_id">{props.item.id}</div>
      <div className="item_thumbnail">
        {
          maybeThumbnail ? (
            <img
              src={props.vidispineBaseUrl + maybeThumbnail}
              alt="Item thumbnail"
              style={{
                maxWidth: props.imageMaxWidth,
                maxHeight: props.imageMaxHeight,
              }}
              className="thumbnail"
            />
          ) : mediaTypeIcon()
        }
      </div>
      <div className="item_created">
        {moment(props.item.getMetadataString("created")).format(
          "dddd D/M/YYYY H:mm:ss"
        )}
      </div>
    </div>
  );
};

export default ItemTile;
