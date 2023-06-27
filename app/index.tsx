import React, { useEffect, useState } from "react";
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
import axios from "axios";
import FieldGroupCache from "./vidispine/FieldGroupCache";
import {
  LoadGroupFromServer,
  VidispineFieldGroup,
} from "./vidispine/field-group/VidispineFieldGroup";
import ItemViewComponent from "./ItemViewComponent";
import FrontpageComponent from "./Frontpage";
import {
  AppSwitcher,
  Header,
  JwtDataShape,
  OAuthContextData,
  OAuthContextProvider,
  SystemNotification,
  UserContextProvider,
  verifyExistingLogin,
  PlutoThemeProvider,
} from "@guardian/pluto-headers";
import { CircularProgress, CssBaseline, Typography } from "@material-ui/core";
import { Helmet } from "react-helmet";
import { setupInterceptors } from "./interceptors";
import VidispineContext, {
  VidispineContextType,
} from "./Context/VidispineContext";
import EmbeddablePlayer from "./Embeddable/EmbeddablePlayer";
import MediaAtomToolContext, {
  MediaAtomToolContextType,
} from "./pluto-deliverables/MediaAtomToolContext";
import NearlineComponent from "./Nearline";

interface AppState {
  vidispineBaseUrl?: string;
  fields?: FieldGroupCache;
  loading?: boolean;
  loadingStage?: number;
  lastError?: string | null;
  isLoggedIn?: boolean;
}

interface ConfigFileData {
  vidispineBaseUrl: string;
  mediaAtomBaseUrl: string;
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

const App: React.FC<{}> = () => {
  const [vidispineDetails, setVidispineDetails] = useState<
    VidispineContextType | undefined
  >(undefined);
  const [mediaAtomDetails, setMediaAtomDetails] = useState<
    MediaAtomToolContextType | undefined
  >(undefined);

  const [loading, setLoading] = useState(true);
  const [lastError, setLastError] = useState<string | undefined>(undefined);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<JwtDataShape | undefined>(
    undefined
  );

  const haveToken = () => {
    return window.localStorage.getItem("pluto:access-token");
  };

  const oAuthConfigLoaded = (oAuthConfig: OAuthContextData) => {
    if (haveToken()) {
      verifyExistingLogin(oAuthConfig)
        .then((profile) => {
          setUserProfile(profile);
          setIsLoggedIn(true);
        })
        .catch((err) =>
          console.error("Could not verify existing user profile: ", err)
        );
    }
  };

  /**
   * load in field/group definitions from VS. Updates the state.fields parameter
   */
  const buildCache = async (vidispineBaseUrl: string) => {
    console.log(groupsToCache);

    const groupsData = await Promise.all(
      groupsToCache.map((groupName) =>
        LoadGroupFromServer(vidispineBaseUrl, groupName)
      )
    );
    const maybeExistingData = vidispineDetails?.fieldCache;
    const newCache = new FieldGroupCache(maybeExistingData, ...groupsData);
    console.log(
      `Successfully loaded ${newCache.size()} metadata groups from Vidispine`
    );
    return newCache;
  };

  const initialiseComponent = async () => {
    try {
      const configResponse = await axios.get<ConfigFileData>(
        "/config/config.json"
      );
      const fieldGroupCache = await buildCache(
        configResponse.data.vidispineBaseUrl
      );
      setVidispineDetails({
        baseUrl: configResponse.data.vidispineBaseUrl,
        fieldCache: fieldGroupCache,
      });
      if (configResponse.data.mediaAtomBaseUrl)
        setMediaAtomDetails({
          baseUrl: configResponse.data.mediaAtomBaseUrl,
        });

      setLoading(false);
      setLastError(undefined);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setLastError(
        "Could not load configuration, please try refreshing the page in a minute.  More details in the console log."
      );
    }
  };

  useEffect(() => {
    initialiseComponent();
  }, []);

  if (window.location.href.includes("embed")) {
    //if we are embedding, we just need a minimum of decorations so don't load the full UI
    return (
      <PlutoThemeProvider>
        <CssBaseline />
        <OAuthContextProvider onLoaded={oAuthConfigLoaded}>
          <UserContextProvider
            value={{
              profile: userProfile,
              updateProfile: (newValue) => setUserProfile(newValue),
            }}
          >
            <VidispineContext.Provider value={vidispineDetails}>
              <Switch>
                <Route path="/embed/player" component={EmbeddablePlayer} />
              </Switch>
            </VidispineContext.Provider>
          </UserContextProvider>
        </OAuthContextProvider>
      </PlutoThemeProvider>
    );
  } else {
    return (
      <PlutoThemeProvider>
        <CssBaseline />
        <Helmet>
          <title>PLUTO Media Browser</title>
        </Helmet>
        <SystemNotification />
        <OAuthContextProvider onLoaded={oAuthConfigLoaded}>
          <UserContextProvider
            value={{
              profile: userProfile,
              updateProfile: (newValue) => setUserProfile(newValue),
            }}
          >
            <Header />
            {userProfile ? <AppSwitcher /> : undefined}
            {lastError ? (
              <div className="error-dialog">
                <Typography>{lastError}</Typography>
              </div>
            ) : undefined}
            {loading ? <CircularProgress /> : undefined}
            {!lastError && !loading ? (
              <VidispineContext.Provider value={vidispineDetails}>
                <MediaAtomToolContext.Provider value={mediaAtomDetails}>
                  <Switch>
                    <Route path="/item/:itemId" component={ItemViewComponent} />

                    <Route
                      path="/last/:pageSize"
                      render={(
                        props: RouteComponentProps<LastNComponentMatches>
                      ) => {
                        let itemLimit: number = 15;
                        try {
                          itemLimit = parseInt(props.match.params.pageSize);
                        } catch (err) {
                          console.error(
                            `${props.match.params.pageSize} is not a number`
                          );
                        }
                        return (
                          <FrontpageComponent
                            {...props}
                            itemLimit={itemLimit}
                            projectIdToLoad={0}
                          />
                        );
                      }}
                    />
                    <Route
                      path="/search"
                      render={(props: RouteComponentProps) => (
                        <FrontpageComponent {...props} projectIdToLoad={0} />
                      )}
                    />
                    <Route
                      path="/project/:projectId"
                      render={(
                        props: RouteComponentProps<ProjectComponentMatches>
                      ) => {
                        let projectIdToLoad: number = 0;
                        try {
                          projectIdToLoad = parseInt(
                            props.match.params.projectId
                          );
                        } catch (err) {
                          console.error(
                            `${props.match.params.projectId} is not a number`
                          );
                        }
                        return (
                          <FrontpageComponent
                            {...props}
                            projectIdToLoad={projectIdToLoad}
                          />
                        );
                      }}
                    />
                    <Route
                      path="/nearline"
                      render={(props: RouteComponentProps) => (
                        <NearlineComponent {...props} projectIdToLoad={0} />
                      )}
                    />
                    <Route
                      path="/"
                      exact={true}
                      component={() => <Redirect to="/last/15" />}
                    />
                  </Switch>
                </MediaAtomToolContext.Provider>
              </VidispineContext.Provider>
            ) : undefined}
          </UserContextProvider>
        </OAuthContextProvider>
      </PlutoThemeProvider>
    );
  }
};

const AppWithRouter = withRouter(App);
render(
  <BrowserRouter basename={deploymentRootPath}>
    <AppWithRouter />
  </BrowserRouter>,
  document.getElementById("app")
);
