import React from "react";
import {VidispineItem} from "../vidispine/item/VidispineItem";
import moment from "moment";

interface ItemTileProps {
    item:VidispineItem;
    imageMaxWidth: number;
    imageMaxHeight: number;
    vidispineBaseUrl: string;
    key?:string;
    onClick:(itemId:string)=>void;
}

const ItemTile:React.FC<ItemTileProps> = (props) => {
    const maybeThumbnail = props.item.getMetadataString("representativeThumbnailNoAuth");

    return (
        <div className="item_box" onClick={(evt)=>props.onClick(props.item.id)}>
            <div className="item_filename">
                <strong>{props.item.getMetadataString("originalFilename") ?? props.item.getMetadataString("title")}</strong>
            </div>

            <div className="item_id">{props.item.id}</div>
            <div className="item_thumbnail">
                { maybeThumbnail ? (
                        <img
                            src={props.vidispineBaseUrl + maybeThumbnail}
                            alt="Item thumbnail"
                            style={{
                                maxWidth: props.imageMaxWidth,
                                maxHeight: props.imageMaxHeight
                            }}
                            className="thumbnail"
                        />
                    ) : null    //FIXME: replace with "broken thumbnail" icon
            }
            </div>
            <div className="item_created">
                {moment(props.item.getMetadataString("created")).format("dddd D/M/YYYY H:mm:ss")}
            </div>
        </div>
    )
}

export default ItemTile;