import React from 'react';
import {render} from 'react-dom';
import {BrowserRouter, Link, Route, Switch, Redirect, withRouter} from 'react-router-dom';
import VidispineAssetSearch from './VidispineAssetSearch.jsx';

class App extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      username: 'admin',
      password: 'admin'
    };
  }

  render(){
          return <div>
              <Switch>
                  <Route path="/" component={()=><VidispineAssetSearch vidispine_host="http://32937.gnm.int:8080" username={this.state.username ?? "admin"} password={this.state.password ?? "admin"} />}/>
              </Switch>
          </div>
      }
}

const AppWithRouter = withRouter(App);
render(<BrowserRouter root="/"><AppWithRouter/></BrowserRouter>, document.getElementById("app"));
