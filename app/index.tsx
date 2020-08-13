import React from "react";
import { render } from "react-dom";
import {
  BrowserRouter,
  Link,
  Route,
  Switch,
  Redirect,
  withRouter, BrowserRouterProps, RouteComponentProps,
} from "react-router-dom";
import VidispineAssetSearch from "./VidispineAssetSearch";
import axios from "axios";
import FieldGroupCache from "./vidispine/FieldGroupCache";
import {LoadGroupFromServer, VidispineFieldGroup} from "./vidispine/field-group/VidispineFieldGroup";
import ItemViewComponent from "./ItemViewComponent";

interface AppState {
  vidispineBaseUrl?: string,
  fields?: FieldGroupCache,
  loading?: boolean,
  loadingStage?: number,
  lastError?: string | null
}

interface ConfigFileData {
  vidispineBaseUrl: string,
}

//this will be set in the index.html template file and gives us the value of deployment-root from the server config
const deploymentRootPath = "/";

axios.defaults.baseURL = deploymentRootPath;
axios.interceptors.request.use(function (config) {
  const token = window.sessionStorage.getItem("pluto:access-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

//think of a way to improve this later!
const groupsToCache = [
    "Asset",
    "Deliverable",
    "Newswire",
    "Rushes"
];

class App extends React.Component<RouteComponentProps<any>,AppState> {

  constructor(props:RouteComponentProps<any>) {
    super(props);
    this.state = {
      vidispineBaseUrl: "",
      fields: new FieldGroupCache(),
      loading: true,
      loadingStage: 0,
      lastError: null
    };
  }

  setStatePromise(newState:AppState) {
    return new Promise((resolve, reject)=>this.setState(newState, ()=>resolve()));
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

    const groupsData = await Promise.all(groupsToCache.map(groupName=>LoadGroupFromServer(this.state.vidispineBaseUrl as string, groupName)));
    const newCache = new FieldGroupCache(this.state.fields, ...groupsData);
    console.log(`Successfully loaded ${newCache.size()} metadata groups from Vidispine`);
    return this.setStatePromise({fields: newCache});
  }

  async componentDidMount() {
    try{
      await this.loadConfig();
      await this.setStatePromise({loadingStage: 1});
      await this.buildCache();
      await this.setStatePromise({loading: false, lastError:null, loadingStage:0});
    } catch(err) {
      console.error(err);
      this.setState({loading: false, lastError: "Could not load configuration, please try refreshing the page in a minute.  More details in the console log."});
    }
  }

  render() {
    if(this.state.lastError) {
      return <div className="error-dialog"><p>{this.state.lastError}</p></div>
    }

    if(this.state.loading) {
        return <p>Loading....</p>
    }

    return (
        <Switch>
          <Route
            path="/item/:itemId"
            component={(props: RouteComponentProps<ItemViewComponentMatches>) => (
                <ItemViewComponent vidispineBaseUrl={this.state.vidispineBaseUrl as string}
                                   history={props.history}
                                   location={props.location}
                                   match={props.match}
                />
            )
            }
            />
          <Route
            path="/"
            component={() => (
              <VidispineAssetSearch
                vidispineBaseUrl={this.state.vidispineBaseUrl}
              />
            )}
          />
        </Switch>
    );
  }
}

const AppWithRouter = withRouter(App);
render(
  <BrowserRouter basename="/">
    <AppWithRouter />
  </BrowserRouter>,
  document.getElementById("app")
);
