import React, {useEffect, useState} from "react";
import { render } from "react-dom";
import {
  BrowserRouter,
  Link,
  Route,
  Switch,
  Redirect,
  withRouter,
  BrowserRouterProps,
  RouteComponentProps,
} from "react-router-dom";
import VidispineAssetSearch from "./VidispineAssetSearch";
import axios from "axios";
import FieldGroupCache from "./vidispine/FieldGroupCache";
import {
  LoadGroupFromServer,
  VidispineFieldGroup,
} from "./vidispine/field-group/VidispineFieldGroup";
import ItemViewComponent from "./ItemViewComponent";
import FrontpageComponent from "./Frontpage";
import {SystemNotification} from "pluto-headers";

import {Header, AppSwitcher, PlutoThemeProvider} from "pluto-headers";
import {
  CircularProgress,
  CssBaseline, Typography,
} from "@material-ui/core";
import { Helmet } from "react-helmet";
import {setupInterceptors} from "./interceptors";

interface AppState {
  vidispineBaseUrl?: string;
  fields?: FieldGroupCache;
  loading?: boolean;
  loadingStage?: number;
  lastError?: string | null;
}

interface ConfigFileData {
  vidispineBaseUrl: string;
}

declare var deploymentRootPath: string | undefined;

//this will be set in the index.html template file and gives us the value of deployment-root from the server config
if (deploymentRootPath == undefined) {
  deploymentRootPath = "/";
}

//set up request and response interceptors
setupInterceptors();

//think of a way to improve this later!
const groupsToCache = ["Deliverable", "Newswire", "Rushes", "Asset"];

const App:React.FC<{}> = ()=> {
  const [vidispineBaseUrl, setVidispineBaseUrl] = useState("");
  const [fields, setFields] = useState<FieldGroupCache>(new FieldGroupCache());
  const [loading, setLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState(0);
  const [lastError, setLastError] = useState<string|undefined>(undefined);

  /**
   * loads in the config json from the server. Required to know where Vidispine is.
   */
  const loadConfig = async () => {
    const response = await axios.get<ConfigFileData>("/config/config.json");
    setVidispineBaseUrl(response.data.vidispineBaseUrl);
  }

  /**
   * load in field/group definitions from VS. Updates the state.fields parameter
   */
  const buildCache = async () => {
    console.log(groupsToCache);

    const groupsData = await Promise.all(
      groupsToCache.map((groupName) =>
        LoadGroupFromServer(vidispineBaseUrl, groupName)
      )
    );
    const newCache = new FieldGroupCache(fields, ...groupsData);
    console.log(
      `Successfully loaded ${newCache.size()} metadata groups from Vidispine`
    );
    setFields(newCache);
  }

  const initialiseComponent = async () => {
    try {
      await loadConfig();
      setLoadingStage(1);
      await buildCache();
      setLoading(false);
      setLastError(undefined);
      setLoadingStage(0);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setLastError("Could not load configuration, please try refreshing the page in a minute.  More details in the console log.");
    }
  }

  useEffect(()=>{
    initialiseComponent();
  }, []);

  return (
    <PlutoThemeProvider>
      <CssBaseline />
      <Helmet>
        <title>PLUTO Media Browser</title>
      </Helmet>
      <SystemNotification/>
      <Header />
      <AppSwitcher onLoggedIn={()=>{}} onLoggedOut={()=>{}} />
      {
        lastError ? <div className="error-dialog">
          <Typography>{lastError}</Typography>
        </div> : undefined
      }
      {
        loading ? <CircularProgress/> : undefined
      }
      {
        !lastError && !loading ?
            <Switch>
              <Route
                  path="/item/:itemId"
                  component={(
                      props: RouteComponentProps<ItemViewComponentMatches>
                  ) => (
                      <ItemViewComponent
                          {...props}
                          vidispineBaseUrl={vidispineBaseUrl as string}
                          //this should never be undefined in reality; but the interface must specify it like that so we can do partial updates.
                          fieldCache={fields as FieldGroupCache}
                      />
                  )}
              />

              <Route
                  path="/last/:pageSize"
                  component={(props: RouteComponentProps<LastNComponentMatches>) => {
                    let itemLimit: number = 15;
                    try {
                      itemLimit = parseInt(props.match.params.pageSize);
                    } catch (err) {
                      console.error(`${props.match.params.pageSize} is not a number`);
                    }
                    return (
                        <FrontpageComponent
                            {...props}
                            vidispineBaseUrl={vidispineBaseUrl as string}
                            itemLimit={itemLimit}
                            fieldGroupCache={fields as FieldGroupCache}
                            projectIdToLoad={0}
                        />
                    );
                  }}
              />
              <Route
                  path="/search"
                  component={(props: RouteComponentProps) => (
                      <FrontpageComponent
                          {...props}
                          vidispineBaseUrl={vidispineBaseUrl as string}
                          fieldGroupCache={fields as FieldGroupCache}
                          projectIdToLoad={0}
                      />
                  )}
              />
              <Route
                  path="/project/:projectId"
                  component={(
                      props: RouteComponentProps<ProjectComponentMatches>
                  ) => {
                    let projectIdToLoad: number = 0;
                    try {
                      projectIdToLoad = parseInt(props.match.params.projectId);
                    } catch (err) {
                      console.error(
                          `${props.match.params.projectId} is not a number`
                      );
                    }
                    return (
                        <FrontpageComponent
                            {...props}
                            vidispineBaseUrl={vidispineBaseUrl as string}
                            projectIdToLoad={projectIdToLoad}
                            fieldGroupCache={fields as FieldGroupCache}
                        />
                    );
                  }}
              />
              <Route
                  path="/"
                  exact={true}
                  component={() => <Redirect to="/last/15"/>}
              />
            </Switch> : undefined
      }
    </PlutoThemeProvider>
  );
}

const AppWithRouter = withRouter(App);
render(
  <BrowserRouter basename={deploymentRootPath}>
    <AppWithRouter />
  </BrowserRouter>,
  document.getElementById("app")
);
