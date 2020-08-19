import React, {useEffect, useState} from "react";
import {Redirect, RouteComponentProps} from "react-router";
import VidispineSearchDoc, {SearchOrderValue} from "./vidispine/search/VidispineSearch";
import {VidispineItem} from "./vidispine/item/VidispineItem";
import axios from "axios";
import {VError} from "ts-interface-checker";
import SearchResultsPane from "./Frontpage/SearchResultsPane";
require("./dark.css");

interface FrontpageComponentProps extends RouteComponentProps {
    vidispineBaseUrl:string;
}

const FrontpageComponent:React.FC<FrontpageComponentProps> = (props) =>{
    const [currentSearch, setCurrentSearch] = useState<VidispineSearchDoc|undefined>(undefined);
    const [hideSearchBox, setHideSearchBox] = useState<boolean>(!props.location.pathname.startsWith("search"));
    const [searching, setSearching] = useState<boolean>(false);
    const [lastError, setLastError] = useState<string|undefined>(undefined);
    const [pageSize, setPageSize] = useState<number>(15);
    const [itemLimit, setItemLimit] = useState<number>(15);
    const [itemList, setItemList] = useState<VidispineItem[]>([]);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [redirectToItem, setRedirectToItem] = useState<string|undefined>(undefined);

    /**
     * validates a given vidispine item, returning either a VidispineItem or undefined if it fails to validate.
     * error message is output to console if it fails.
     * @param content object to verify
     */
    const validateVSItem = (content:any) => {
        try {
            return new VidispineItem(content);
        } catch (err) {
            if(err instanceof VError) {
                const vErr = err as VError;

                const itemId = content.id ?? "(no id given)"
                console.error(`Item ${itemId} failed metadata validation at ${vErr.path}: ${vErr.message}`);
            } else {
                console.error("Unexpected error: ", err);
            }
            return undefined;
        }
    }

    const loadNextPage = async () => {
        setSearching(true);
        const shouldCount:boolean = itemList.length>0;
        const searchUrl = `${props.vidispineBaseUrl}/API/item?content=metadata&from=${itemList.length+1}&number=${pageSize}&count=${shouldCount}`;
        try {
            const payload = currentSearch ?? new VidispineSearchDoc().setOrdering("created",SearchOrderValue.descending);
            const serverContent = await axios.put(searchUrl, payload, {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }});

            if(serverContent.data.hits) {
                setTotalItems(serverContent.data.hits);
            }
            if(serverContent.data.item) {
                if(serverContent.data.item.length==0) {
                    setSearching(false);
                    return;   //no more to do
                }
                //only add in items that validate as VidispineItem. Items that don't are logged to console.
                setItemList(
                    itemList.concat(
                        serverContent.data.item
                            .map(validateVSItem)
                            .filter((item: VidispineItem|undefined)=>item!==undefined)
                    )
                )

                if(itemList.length+serverContent.data.item.length < itemLimit) {
                    //allow the javascript engine to process state updates above before recursing on to next page.
                    window.setTimeout(()=>loadNextPage(), 200);
                }
            }
        } catch(err) {
            console.error("Could not load content from server: ", err);
            setLastError("Please see console for error details");
        }
    }

    /**
     * display last-15 items on startup
     * */
    useEffect(()=>{
        loadNextPage();
    }, []);

    if(redirectToItem) return <Redirect to={`/item/${redirectToItem}`}/>;

    return (
        <div className="search_grid">
            <div className="items_top_area">
                {/*<VidispineSearchForm currentSearch={currentSearch} */}
                {/*                     onUpdated={(newSearch)=>setCurrentSearch(newSearch)}*/}
                {/*                     onHideToggled{(newValue)=>setHideSearchBox(newValue)}*/}
                {/*                     isHidden={hideSearchBox}*/}
                {/*                     />*/}
                {/*<div className="right_box">*/}
                {/*    <FacetDisplays/>*/}
                {/*</div>*/}
            </div>
            <SearchResultsPane results={itemList}
                               onItemClicked={(itemId)=> {
                                   console.log("You clicked ", itemId);
                                   setRedirectToItem(itemId);
                               }}
            />

        </div>
    )
}

export type {FrontpageComponentProps};
export default FrontpageComponent;