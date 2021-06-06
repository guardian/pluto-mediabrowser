import React from "react";
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

import { Header, AppSwitcher } from "pluto-headers";
import {
  createMuiTheme,
  CssBaseline,
  Theme,
  ThemeProvider,
} from "@material-ui/core";
import colours from "@material-ui/core/colors";
import { Helmet } from "react-helmet";

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

axios.defaults.baseURL = deploymentRootPath;
axios.interceptors.request.use(function (config) {
  const token = window.localStorage.getItem("pluto:access-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

//think of a way to improve this later!
const groupsToCache = ["Deliverable", "Newswire", "Rushes", "Asset"];

class App extends React.Component<RouteComponentProps<any>, AppState> {
  theme: Theme;

  constructor(props: RouteComponentProps<any>) {
    super(props);
    this.state = {
      vidispineBaseUrl: "",
      fields: new FieldGroupCache(),
      loading: true,
      loadingStage: 0,
      lastError: null,
    };

    this.theme = createMuiTheme({
      typography: {
        fontFamily: [
          //keep in-line with pluto-core 'till we implement a theming service
          "sans-serif",
          '"Helvetica Neue"',
          "Helvetica",
          "Arial",
          "sans-serif",
        ].join(","),
      },
      palette: {
        type: "dark",
      },
    });
  }

  setStatePromise(newState: AppState) {
    return new Promise<void>((resolve, reject) =>
      this.setState(newState, () => resolve())
    );
  }

  /**
   * loads in the config json from the server. Required to know where Vidispine is.
   */
  async loadConfig() {
    const response = await axios.get("/config/config.json");

    const configdata = response.data as ConfigFileData; //FIXME: we can improve this by adding a content test as per VS data
    return this.setStatePromise({
      vidispineBaseUrl: configdata.vidispineBaseUrl,
    });
  }

  /**
   * load in field/group definitions from VS. Updates the state.fields parameter
   */
  async buildCache() {
    console.log(groupsToCache);

    const groupsData = await Promise.all(
      groupsToCache.map((groupName) =>
        LoadGroupFromServer(this.state.vidispineBaseUrl as string, groupName)
      )
    );
    const newCache = new FieldGroupCache(this.state.fields, ...groupsData);
    console.log(
      `Successfully loaded ${newCache.size()} metadata groups from Vidispine`
    );
    return this.setStatePromise({ fields: newCache });
  }

  async componentDidMount() {
    try {
      await this.loadConfig();
      await this.setStatePromise({ loadingStage: 1 });
      await this.buildCache();
      await this.setStatePromise({
        loading: false,
        lastError: null,
        loadingStage: 0,
      });
    } catch (err) {
      console.error(err);
      this.setState({
        loading: false,
        lastError:
          "Could not load configuration, please try refreshing the page in a minute.  More details in the console log.",
      });
    }
  }

  doNothing() {}

  render() {
    if (this.state.lastError) {
      return (
        <>
          <Helmet>
            <title>PLUTO Media Browser</title>
          </Helmet>
          <Header />
          <AppSwitcher
            onLoggedIn={this.doNothing}
            onLoggedOut={this.doNothing}
          />
          <div className="error-dialog">
            <p>{this.state.lastError}</p>
          </div>
        </>
      );
    }

    if (this.state.loading) {
      return (
        <>
          <Helmet>
            <title>PLUTO Media Browser</title>
          </Helmet>
          <Header />
          <AppSwitcher
            onLoggedIn={this.doNothing}
            onLoggedOut={this.doNothing}
          />
          <p>Loading....</p>
        </>
      );
    }

    return (
      <ThemeProvider theme={this.theme}>
        <CssBaseline />
        <Helmet>
          <title>PLUTO Media Browser</title>
        </Helmet>
        <Header />
        <AppSwitcher onLoggedIn={this.doNothing} onLoggedOut={this.doNothing} />
        <Switch>
          <Route
            path="/item/:itemId"
            component={(
              props: RouteComponentProps<ItemViewComponentMatches>
            ) => (
              <ItemViewComponent
                {...props}
                vidispineBaseUrl={this.state.vidispineBaseUrl as string}
                //this should never be undefined in reality; but the interface must specify it like that so we can do partial updates.
                fieldCache={this.state.fields as FieldGroupCache}
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
                  vidispineBaseUrl={this.state.vidispineBaseUrl as string}
                  itemLimit={itemLimit}
                  fieldGroupCache={this.state.fields as FieldGroupCache}
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
                vidispineBaseUrl={this.state.vidispineBaseUrl as string}
                fieldGroupCache={this.state.fields as FieldGroupCache}
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
                  vidispineBaseUrl={this.state.vidispineBaseUrl as string}
                  projectIdToLoad={projectIdToLoad}
                  fieldGroupCache={this.state.fields as FieldGroupCache}
                />
              );
            }}
          />
          <Route
            path="/"
            exact={true}
            component={() => <Redirect to="/last/15" />}
          />
        </Switch>
      </ThemeProvider>
    );
  }
}

const AppWithRouter = withRouter(App);
render(
  <BrowserRouter basename={deploymentRootPath}>
    <AppWithRouter />
  </BrowserRouter>,
  document.getElementById("app")
);
