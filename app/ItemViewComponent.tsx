import React, {useEffect, useState} from "react";
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
    Typography
} from "@material-ui/core";
import {VidispineItem} from "./vidispine/item/VidispineItem";
import PreviewPlayer from "./ItemView/PreviewPlayer";

import {
    RouteComponentProps,
    useHistory,
    useLocation,
    useParams,
} from "react-router-dom";

// interface HeaderTitles {
//     label: string;
//     key?: keyof Project;
// }

interface ItemViewComponentProps extends RouteComponentProps<ItemViewComponentMatches> {
    vidispineBaseUrl: string
}

const ItemViewComponent:React.FC<ItemViewComponentProps> = (props) => {
    const [itemData, setItemData] = useState<VidispineItem|undefined>();
    const [lastError, setLastError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);

    const loadItemMeta = async () => {
        const targetUrl = `${props.vidispineBaseUrl}/API/item/${props.match.params.itemId}?content=metadata`;
        console.debug("loading item data from ", targetUrl);
        try {
            const result = await axios.get(targetUrl, {headers: {"Accept": "application/json"}});
            const newItemData = new VidispineItem(result.data);
            console.debug("completed loading data: ", newItemData);
            setItemData(newItemData);
            setLastError("");
            setLoading(false);
        } catch(err) {
            console.error("Could not load from ", targetUrl, ": ", err);
            setLoading(false);
            if(err.response) {
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
                        setLastError("There is a server problem, please report this to multimediatech@theguardian.com");
                        break;
                    default:
                        console.error(err);
                        setLastError("Unable to load the given item. Please refer to the console for more information.");
                }
            } else {
                console.error(err);
                setLastError("Unable to load the given item. Please refer to the console for more information.");
            }
        }
    }

    useEffect( ()=>{
        console.log(`Loading item with id ${props.match.params.itemId}`);
        loadItemMeta();
    }, []);

    const pageTitle = () => {
        if(!itemData) return "View item";
        const possibleTitle = itemData.getMetadataString("title");
        if(possibleTitle) {
            return `${possibleTitle as string} : ${props.match.params.itemId}`
        } else {
            return `View item - ${props.match.params.itemId}`
        }
    }

    return (
        <>
            <div className="search_title_box">{pageTitle()}</div>
            {
                loading ? <p>Loading...</p> : null
            }
            {
                lastError ? <div className="error"><p>{lastError}</p></div> : null
            }
            {
                itemData ? <>
                    <PreviewPlayer proxyUri="notsetyet" mediaType="notsetyet"/>
                    <p>{itemData.id}</p>
                    </> : null
            }

        </>
    )
}

export default ItemViewComponent;