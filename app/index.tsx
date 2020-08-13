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
import VidispineAssetSearch from "./VidispineAssetSearch.jsx";
import axios from "axios";


interface AppState {
  vidispineBaseUrl: string,
  loading: boolean,
  lastError: string | null
}

interface ConfigFileData {
  vidispineBaseUrl: string,
}

//this will be set in the index.html template file and gives us the value of deployment-root from the server config
const deploymentRootPath = "/";

axios.defaults.baseURL = deploymentRootPath;
axios.interceptors.request.use(function (config) {
  console.log("axios interceptor triggered");
  const token = window.sessionStorage.getItem("pluto:access-token");
  console.log("Got token", token);
  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

class App extends React.Component<RouteComponentProps<any>,AppState>{
  constructor(props:RouteComponentProps<any>) {
    super(props);
    this.state = {
      vidispineBaseUrl: "",
      loading: true,
      lastError: null
    };
  }

  async loadConfig() {
    try {
      const response = await axios.get("/config/config.json");

      const configdata = response.data as ConfigFileData; //FIXME: we can improve this by adding a content test as per VS data
      this.setState({
        loading: false,
        vidispineBaseUrl: configdata.vidispineBaseUrl,
      });

    } catch(err) {
      console.error(err);
      this.setState({loading: false, lastError: "Could not load configuration, please try refreshing the page in a minute"});
    }
  }

  async componentDidMount() {
    return this.loadConfig();
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
