import React, {useEffect, useState} from "react";
import {Redirect, RouteComponentProps} from "react-router";
import VidispineSearchDoc, {SearchOrderValue} from "./vidispine/search/VidispineSearch";
import {VidispineItem} from "./vidispine/item/VidispineItem";
import axios from "axios";
import {VError} from "ts-interface-checker";
import SearchResultsPane from "./Frontpage/SearchResultsPane";
import VidispineSearchForm from "./Frontpage/VidispineSearchForm";
import FieldGroupCache from "./vidispine/FieldGroupCache";
import {Grid, Typography} from "@material-ui/core";
import {FacetCountResponse, validateFacetResponse} from "./vidispine/search/FacetResponse";
import FacetDisplays from "./Frontpage/FacetDisplays";

require("./dark.css");
require("./FrontPageLayout.css");

interface FrontpageComponentProps extends RouteComponentProps {
  vidispineBaseUrl: string;
  itemLimit?: number;
  fieldGroupCache: FieldGroupCache;
}

const FrontpageComponent: React.FC<FrontpageComponentProps> = (props) => {
  const [currentSearch, setCurrentSearch] = useState<
    VidispineSearchDoc | undefined
  >(undefined);
  const [hideSearchBox, setHideSearchBox] = useState<boolean>(
    !props.location.pathname.startsWith("/search")
  );
  const [hideFacets, setHideFacets] = useState<boolean>(true);
  const [searching, setSearching] = useState<boolean>(false);
  const [lastError, setLastError] = useState<string | undefined>(undefined);
  const [pageSize, setPageSize] = useState<number>(15);
  const [itemLimit, setItemLimit] = useState<number>(props.itemLimit ?? 100);
  const [itemList, setItemList] = useState<VidispineItem[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [facetList, setFacetList] = useState<FacetCountResponse[]>([]);

  const [redirectToItem, setRedirectToItem] = useState<string | undefined>(
    undefined
  );

  /**
   * validates a given vidispine item, returning either a VidispineItem or undefined if it fails to validate.
   * error message is output to console if it fails.
   * @param content object to verify
   */
  const validateVSItem = (content: any) => {
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

  /**
   * puts terms to request the default graph set onto the provided SearchDoc
   * @param toSearch VidispineSearchDoc to add them to
   */
  const addDefaultFacets = (toSearch:VidispineSearchDoc) => {
    //FIXME: should load these in from config or from some kind of user profile!
    return toSearch
        .addFacet("mediaType",true)
        .addFacet("gnm_category", true)
        .addFacet("gnm_newswire_provider",true);
  }

  /**
   * load the next page of results as per the currently set search.
   * this "recurses" to pull in subsequent pages, after a short delay
   * to allow the ui to update
   */
  const loadNextPage = async (startAt?:number, previousItemList?:VidispineItem[]) => {
    setSearching(true);
    const fromParam = startAt ?? itemList.length;
    const shouldCount: boolean = fromParam == 0;
    const searchUrl = `${
      props.vidispineBaseUrl
    }/API/item?content=metadata&first=${
      fromParam + 1
    }&number=${pageSize}&count=${shouldCount}`;

    try {
      const initialSearch = currentSearch ?? new VidispineSearchDoc();

      const payload = fromParam==0 ? addDefaultFacets(initialSearch) : initialSearch;
      const serverContent = await axios.put(searchUrl,
          payload.setOrdering("created",SearchOrderValue.descending),
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          });

      if (serverContent.data.hits) {  //we only take the "hits" field on the first page
        setTotalItems(serverContent.data.hits);
      }

      if(serverContent.data.facet && serverContent.data.facet.length>0) {
        setFacetList(
            serverContent.data.facet
                .map(validateFacetResponse)
                .filter((maybeFacet:FacetCountResponse|undefined)=>maybeFacet!==undefined)
        );
        setHideFacets(false);
      }

      if (serverContent.data.item) {
        //only add in items that validate as VidispineItem. Items that don't are logged to console.
        const existingList = previousItemList ?? itemList;
        const updatedItemList = existingList.concat(
            serverContent.data.item
                .map(validateVSItem)
                .filter((item: VidispineItem | undefined) => item !== undefined)
        )
        setItemList(updatedItemList);

        console.log("updated list length is", updatedItemList.length);
        if (updatedItemList.length < itemLimit && serverContent.data.item.length) {
          //allow the javascript engine to process state updates above before recursing on to next page.
          window.setTimeout(() => loadNextPage(updatedItemList.length, updatedItemList), 200);
        } else {
          setSearching(false);
          return; //no more to do
        }
      }
    } catch (err) {
      console.error("Could not load content from server: ", err);
      setLastError("Please see console for error details");
    }
  };

  /**
   * display last-15 items on startup
   * */
  useEffect(() => {
    loadNextPage();
  }, []);

  /**
   * re-run the search when the searchdoc changes
   * */
  useEffect(() => {
    console.log("Search updated, reloading...");
    setLastError(undefined);
    //give the above a chance to execute before we kick off the download
    window.setTimeout(()=>loadNextPage(0, []), 100);
  }, [currentSearch]);

  if (redirectToItem) return <Redirect to={`/item/${redirectToItem}`} />;

  //FIXME: there must be a better way of doing dynamic grid resizing than this!
  const makeClassName = () => {
    let className = ["front-page-container"];
    if(hideSearchBox && hideFacets){
      className = className.concat("hide-both");
    } else if(hideSearchBox) {
      className = className.concat("hide-left");
    } else if(hideFacets) {
      className = className.concat("hide-right");
    }
    return className.join(" ");
  }

  return (
    <div className={makeClassName()}>
      <div className="status-container">
        <Grid container justify="space-around">
          {searching ? <Grid item>
            <Typography>Loading...</Typography>
          </Grid> : null
          }
        </Grid>
      </div>
      <div className="form-container">
        <VidispineSearchForm
          currentSearch={currentSearch}
          fieldGroupCache={props.fieldGroupCache}
          onUpdated={(newSearch) => {
            console.log("Got new search doc: ", newSearch);
            setCurrentSearch(newSearch);
          }}
          onHideToggled={(newValue) => setHideSearchBox(newValue)}
          isHidden={hideSearchBox}
        />
      </div>
      <div className="results-container">
        <SearchResultsPane
          results={itemList}
          vidispineBaseUrl={props.vidispineBaseUrl}
          onItemClicked={(itemId) => {
            console.log("You clicked ", itemId);
            props.history.push(`/item/${itemId}`);
          }}
        />
      </div>
      <div className="facets-container">
        <FacetDisplays isHidden={hideFacets} onHideToggled={(newValue)=>setHideFacets(newValue)} facets={facetList}>
          <Typography style={{marginLeft: "auto", marginRight: "0.6em", textAlign: "right"}}>Showing {itemList.length} items out of {totalItems} matching search</Typography>
        </FacetDisplays>
      </div>
    </div>
  );
};

export type { FrontpageComponentProps };
export default FrontpageComponent;
