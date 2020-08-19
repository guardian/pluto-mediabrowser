import React from "react";
import {VidispineItem} from "../vidispine/item/VidispineItem";
import moment from "moment";
import ItemTile from "./ItemTile";

interface SearchResultsPaneProps {
    results: VidispineItem[],
    onItemClicked: (itemId:string)=>void;
}

const SearchResultsPane:React.FC<SearchResultsPaneProps> = (props) => {
    return (
        <div id="search-results-area">
            {
                props.results.map((item,idx)=>
                    <ItemTile item={item}
                              key={idx.toString()}
                              imageMaxWidth={240}
                              imageMaxHeight={135}
                              onClick={props.onItemClicked}
                    />)
            }
        </div>
    );
}

export default SearchResultsPane;