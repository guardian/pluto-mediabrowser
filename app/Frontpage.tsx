import React, { useContext, useEffect, useState } from "react";
import { Redirect, RouteComponentProps } from "react-router";
import VidispineSearchDoc, {
  SearchOrderValue,
} from "./vidispine/search/VidispineSearch";
import { VidispineItem } from "./vidispine/item/VidispineItem";
import axios from "axios";
import { VError } from "ts-interface-checker";
import SearchResultsPane from "./Frontpage/SearchResultsPane";
import VidispineSearchForm from "./Frontpage/VidispineSearchForm";
import {
  Button,
  Grid,
  makeStyles,
  Typography,
  useTheme,
} from "@material-ui/core";
import {
  FacetCountResponse,
  validateFacetResponse,
} from "./vidispine/search/FacetResponse";
import FacetDisplays from "./Frontpage/FacetDisplays";
import VidispineContext from "./Context/VidispineContext";
import {
  SystemNotifcationKind,
  SystemNotification,
} from "@guardian/pluto-headers";

require("./dark.css");
require("./FrontPageLayout.css");

interface FrontpageComponentProps extends RouteComponentProps {
  itemLimit?: number;
  projectIdToLoad?: number;
}

const useStyles = makeStyles({
  statusArea: {
    margin: "12px",
  },
});

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
  const [pageSize, setPageSize] = useState<number>(20);
  const [itemLimit, setItemLimit] = useState<number>(props.itemLimit ?? 500);
  const [moreItemsAvailable, setMoreItemsAvailable] = useState(false);
  const [loadFrom, setLoadFrom] = useState<number>(0);
  const [itemList, setItemList] = useState<VidispineItem[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [facetList, setFacetList] = useState<FacetCountResponse[]>([]);
  const [previousItemsAvailable, setPreviousItemsAvailable] = useState(false);

  const [redirectToItem, setRedirectToItem] = useState<string | undefined>(
    undefined
  );
  const [projectTitle, setProjectTitle] = useState<string | undefined>(
    undefined
  );
  const classes = useStyles();

  const vidispineContext = useContext(VidispineContext);

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
        SystemNotification.open(
          SystemNotifcationKind.Error,
          "This item contains invalid data and can't be displayed"
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
  const addDefaultFacets = (toSearch: VidispineSearchDoc) => {
    //FIXME: should load these in from config or from some kind of user profile!
    return toSearch
      .addFacet("mediaType", true)
      .addFacet("gnm_category", true)
      .addFacet("gnm_newswire_provider", true);
  };

  /**
   * Puts the project id to load onto the provided SearchDoc
   * @param toSearch VidispineSearchDoc to add them to
   */
  const addProject = (toSearch: VidispineSearchDoc) => {
    return toSearch.withSearchTerm("gnm_containing_projects", [
      String(props.projectIdToLoad),
    ]);
  };

  /**
   * load the next page of results as per the currently set search.
   * this "recurses" to pull in subsequent pages, after a short delay
   * to allow the ui to update
   */
  const loadNextPage = async (
    startAt?: number,
    previousItemList?: VidispineItem[]
  ) => {
    setSearching(true);
    const fromParam = startAt ?? loadFrom + itemList.length;
    const shouldCount: boolean = fromParam == 0;
    const searchUrl = `${
      vidispineContext?.baseUrl
    }/API/item?content=metadata&first=${
      fromParam + 1
    }&number=${pageSize}&count=${shouldCount}`;

    try {
      let initialSearch = currentSearch ?? new VidispineSearchDoc();

      if (props.projectIdToLoad != 0) {
        initialSearch = addProject(initialSearch);
      }

      const payload =
        fromParam == 0 ? addDefaultFacets(initialSearch) : initialSearch;
      const serverContent = await axios.put(
        searchUrl,
        payload.setOrdering("created", SearchOrderValue.descending),
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (serverContent.data.hits) {
        //we only take the "hits" field on the first page
        setTotalItems(serverContent.data.hits);
      }

      if (serverContent.data.facet && serverContent.data.facet.length > 0) {
        setFacetList(
          serverContent.data.facet
            .map(validateFacetResponse)
            .filter(
              (maybeFacet: FacetCountResponse | undefined) =>
                maybeFacet !== undefined
            )
        );
        setHideFacets(false);
      }

      if (serverContent.data.item) {
        if (serverContent.data.item.length < pageSize) {
          setMoreItemsAvailable(false);
        } else {
          setMoreItemsAvailable(true);
        }
        if (loadFrom == 0) {
          setPreviousItemsAvailable(false);
        } else {
          setPreviousItemsAvailable(true);
        }
        //only add in items that validate as VidispineItem. Items that don't are logged to console.
        const existingList = previousItemList ?? itemList;
        const updatedItemList = existingList.concat(
          serverContent.data.item
            .map(validateVSItem)
            .filter((item: VidispineItem | undefined) => item !== undefined)
        );
        setItemList(updatedItemList);

        if (
          updatedItemList.length < itemLimit &&
          serverContent.data.item.length
        ) {
          //allow the javascript engine to process state updates above before recursing on to next page.
          window.setTimeout(
            () =>
              loadNextPage(updatedItemList.length + loadFrom, updatedItemList),
            200
          );
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

  const getProjectTitle = async (projectId: number | undefined) => {
    try {
      const project = await axios.get(
        `../pluto-core/api/project/` + projectId,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "pluto:access-token"
            )}`,
          },
        }
      );
      setProjectTitle(project.data.result.title);
    } catch (error) {
      console.error("Unable to fetch project title: ", error);
      setProjectTitle("Could not load project title");
    }
  };

  /**
   * display last-15 items on startup
   * */
  useEffect(() => {
    loadNextPage();
    if (props.projectIdToLoad != 0) {
      getProjectTitle(props.projectIdToLoad);
    }
  }, [itemLimit]);

  /**
   * re-run the search when the searchdoc changes
   * */
  useEffect(() => {
    console.log("Search updated, reloading...");
    setLastError(undefined);
    //give the above a chance to execute before we kick off the download
    window.setTimeout(() => loadNextPage(loadFrom, []), 100);
  }, [currentSearch, loadFrom]);

  if (redirectToItem) return <Redirect to={`/item/${redirectToItem}`} />;

  //FIXME: there must be a better way of doing dynamic grid resizing than this!
  const makeClassName = () => {
    let className = ["front-page-container"];
    if (hideSearchBox && hideFacets) {
      className = className.concat("hide-both");
    } else if (hideSearchBox) {
      className = className.concat("hide-left");
    } else if (hideFacets) {
      className = className.concat("hide-right");
    }
    return className.join(" ");
  };

  const resultsContainerRef = React.createRef<HTMLDivElement>();

  const displayProgressBar = (current: number, total: number) => {
    if (current < 1) {
      return (
        <div
          style={{
            width: "0%",
            backgroundColor: barColour(),
            borderRadius: "3px",
            height: "18px",
          }}
        ></div>
      );
    }
    const percentNumber = 100 / total;
    var percentageDone = Math.round(percentNumber * current);
    if (percentageDone > 100) {
      percentageDone = 100;
    }
    return (
      <div
        style={{
          width: percentageDone + "%",
          backgroundColor: barColour(),
          borderRadius: "3px",
          height: "18px",
        }}
      ></div>
    );
  };

  const barTotal = (from: number, total: number) => {
    if (total < 500) {
      return total;
    } else if (total - from > 500) {
      return 500;
    } else {
      return total - Math.floor(total / 500) * 500;
    }
  };

  const detectDarkTheme = () => {
    const isDarkTheme = useTheme().palette.type === "dark";
    return isDarkTheme;
  };

  const barColour = () => {
    if (detectDarkTheme()) {
      return "#ffffff";
    } else {
      return "#B0B0B0";
    }
  };

  return (
    <div className={makeClassName()}>
      <div className="status-container">
        <Grid container className={classes.statusArea}>
          {searching ? (
            <Grid item>
              <div
                style={{
                  backgroundColor: "#000000",
                  borderRadius: "3px",
                  width: "200px",
                  height: "19px",
                }}
              >
                {displayProgressBar(
                  itemList.length,
                  barTotal(loadFrom, totalItems)
                )}
              </div>
              <Typography>Loading...</Typography>
            </Grid>
          ) : (
            <Grid item>
              {props.projectIdToLoad != 0 ? (
                <Typography>Items from project: {projectTitle}</Typography>
              ) : null}
            </Grid>
          )}
        </Grid>
      </div>
      <div className="form-container">
        <VidispineSearchForm
          currentSearch={currentSearch}
          onUpdated={(newSearch) => {
            console.log("Got new search doc: ", newSearch);
            setCurrentSearch(newSearch);
            setLoadFrom(0);
          }}
          onHideToggled={(newValue) => setHideSearchBox(newValue)}
          isHidden={hideSearchBox}
          projectIdToLoad={props.projectIdToLoad}
          moreItemsAvailable={moreItemsAvailable}
          onLoadMoreClicked={() => {
            setLoadFrom((currentValue) => currentValue + 500);
          }}
          previousItemsAvailable={previousItemsAvailable}
          onLoadPreviousClicked={() => {
            setLoadFrom((currentValue) => currentValue - 500);
          }}
          searching={searching}
        />
      </div>
      <div className="results-container" ref={resultsContainerRef}>
        <SearchResultsPane
          results={itemList}
          parentRef={resultsContainerRef}
          onItemClicked={(itemId) => {
            console.log("You clicked ", itemId);
            props.history.push(`/item/${itemId}`);
          }}
        />
      </div>
      <div className="facets-container">
        <FacetDisplays
          isHidden={hideFacets}
          onHideToggled={(newValue) => setHideFacets(newValue)}
          facets={facetList}
        >
          <Typography
            style={{
              marginLeft: "auto",
              marginRight: "0.6em",
              textAlign: "right",
            }}
          >
            Showing item {itemList.length > 0 ? loadFrom + 1 : 0} -{" "}
            {itemList.length + loadFrom} of {totalItems}
          </Typography>
        </FacetDisplays>
      </div>
    </div>
  );
};

export type { FrontpageComponentProps };
export default FrontpageComponent;
