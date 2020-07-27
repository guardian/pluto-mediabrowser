import React, {Component} from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
  withRouter
} from "react-router-dom";
import PropTypes from 'prop-types';
import moment from 'moment';
import StatusFormatter from './StatusFormatter.jsx';
import TypeFormatter from './TypeFormatter.jsx';
import PriorityFormatter from './PriorityFormatter.jsx';
import StepInfoBox from './StepInfoBox.jsx';

class JobPage extends Component {

  static propTypes = {
      vidispine_host: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      password: PropTypes.string.isRequired,
    };

constructor(props){
super(props);
this.state = {
  vidispineData: {
    data: [],
    log: [
      {task: []}
    ]
  },
  reversedTask: []
}
}

  setStatePromise(newState) {
    return new Promise((resolve,reject)=>this.setState(newState, ()=>resolve()));
  }

  async getJobData(endpoint) {
    const headers = new Headers();
    const encodedString = new Buffer(this.props.username + ":" + this.props.password).toString('base64');
    const url = this.props.vidispine_host + "/API/" + endpoint;
    await this.setStatePromise({loading: true});
    const result = await fetch(url, {headers: {Accept: "application/json", Authorization: "Basic " + encodedString}});

    switch(result.status) {
    case 200:
      const returnedData = await result.json();
      return this.setStatePromise({loading: false, vidispineData: returnedData});
    default:
      const errorContent = await result.text();
      return this.setStatePromise({loading: false, lastError: errorContent});
    }
  }

  getDataForRefresh = () => {
    this.getJobData('job/' + this.props.match.params.id + '?metadata=true');
  }

  componentDidMount() {
    const idToLoad = this.props.match.params.id;
    this.getJobData('job/' + idToLoad + '?metadata=true');
    setInterval(this.getDataForRefresh, 5000);
  }

  getValue(data,findthis) {
    var returnNow = 0;
    for (let [key, value] of Object.entries(data)) {
      for (let [key3, value3] of Object.entries(value)) {
        if (returnNow == 1) {
          return value3;
        }
        if (findthis == value3) {
          returnNow = 1;
        }
      }
    }
    return 'Unknown';
  }

  abort = () => {
    const encodedStringAbort = new Buffer(this.props.username + ":" + this.props.password).toString('base64');
    const urlAbort = this.props.vidispine_host + "/API/job/" + this.props.match.params.id;
    fetch(urlAbort, {headers: {Accept: "application/json", Authorization: "Basic " + encodedStringAbort}, method: 'DELETE'});
    this.getJobData('job/' + this.props.match.params.id + '?metadata=true');
  }

  displayAbort(status) {
    if ((status != 'ABORTED') && (status != 'ABORTED_PENDING') && (status != 'FINISHED_WARNING') && (status != 'FINISHED') && (status != 'FAILED_TOTAL')) {
      return <div class="abort_button" onClick={this.abort}>Abort</div>
    } else {
      return <div></div>
    }
  }

  displayProgressBar(current, total) {
    if (current < 1) {
      return (
        <div class="progress_bar_job_page" style={{width:'0%'}}></div>
      )
    }
    const percentNumber = 100 / total;
    var percentageDone = Math.round(percentNumber * current);
    if (percentageDone > 100) {
      percentageDone = 100;
    }
    return (
      <div class="progress_bar_job_page" style={{width:percentageDone+'%'}}></div>
    )
  }

  returnStatusForCSS(status) {
    if (status == 'FAILED_TOTAL') {
      return "job_data_box_failed";
    }
    if (status == 'FINISHED') {
      return "job_data_box_finished";
    }
    if (status == 'FINISHED_WARNING') {
      return "job_data_box_warning";
    }
    if (status == 'ABORTED') {
      return "job_data_box_aborted";
    }
    return "job_data_box_middle";
  }

  displayTime(input) {
    if (input == 'Unknown') {
      return input;
    } else {
      var d = Number(parseInt(input));
      var h = Math.floor(d / 3600);
      var m = Math.floor(d % 3600 / 60);
      var s = Math.floor(d % 3600 % 60);
      return h + ":" + ('0'  + m).slice(-2) + ":" +  ('0'  + s).slice(-2);
    }
  }

  handleReverseArray() {
    if (this.state.vidispineData.log.task && this.state.vidispineData.log.task.length > 0) {
      const reversedArray = this.state.vidispineData.log.task.slice().reverse();
      return reversedArray.map((item, i) =><StepInfoBox mapPlace={i} stepData={item} />)
    } else {
      return
    }
  }

  returnSourceFile() {
    const possibleURI = this.getValue(this.state.vidispineData.data, "sourceUri");
    if (possibleURI == 'Unknown') {
      const filePathMap = this.getValue(this.state.vidispineData.data, "filePathMap");
      if (filePathMap != 'Unknown') {
        const lastPart = filePathMap.slice(filePathMap.lastIndexOf(',') + 1);
        const lastPartOfLastPart = lastPart.slice(lastPart.lastIndexOf('=') + 1);
        return lastPartOfLastPart;
      }
      return 'Unknown';
    }
    return possibleURI;
  }

  render() {
    const id = this.props.match.params.id;
    const fileName = this.getValue(this.state.vidispineData.data, "originalFilename");
    const stepNumber = this.state.vidispineData.hasOwnProperty("currentStep") ? this.state.vidispineData.currentStep.number : 0;
    const itemId = this.getValue(this.state.vidispineData.data, "itemId");
    const tags = this.getValue(this.state.vidispineData.data, "tags");
    const timeLeft = this.getValue(this.state.vidispineData.data, "transcodeEstimatedTimeLeft");
    const transcoder = this.getValue(this.state.vidispineData.data, "transcoder");
    document.title = "Job " + id + " for " + fileName + " - Vidispine Job Tool";
    return (
      <div>
        <div class="job_page_grid">
          <div class="job_page_title_box">
            <div class="job_page_title">
              Job {id} for {fileName}
            </div>
            {this.displayAbort(this.state.vidispineData.status)}
          </div>
          <div class="job_data_box">
            <div class="job_data_label">
              Progress:
            </div>
            <div class="job_data_progress_bar">
              <div class="progress_bar_background_job_page">
                {this.displayProgressBar(stepNumber, this.state.vidispineData.totalSteps)}
              </div>
            </div>
          </div>
          <div class="job_data_box_left">
            <div class="job_data_label">
              Id.:
            </div>
            <div class="job_data_value">
              {id}
            </div>
          </div>
          <div class="job_data_box_middle">
            <div class="job_data_label">
              Started:
            </div>
            <div class="job_data_value">
              {moment(this.state.vidispineData.started).format("D/M/YYYY H:mm")}
            </div>
          </div>
          <div class="job_data_box_right">
            <div class="job_data_label">
              User:
            </div>
            <div class="job_data_value">
              {this.state.vidispineData.user}
            </div>
          </div>
          <div class="job_data_box_left">
            <div class="job_data_label">
              Type:
            </div>
            <div class="job_data_value">
              {<TypeFormatter type={this.state.vidispineData.type}/>}
            </div>
          </div>
          <div class={this.returnStatusForCSS(this.state.vidispineData.status)}>
            <div class="job_data_label">
              Status:
            </div>
            <div class="job_data_value">
              {<StatusFormatter status={this.state.vidispineData.status}/>}
            </div>
          </div>
          <div class="job_data_box_right">
            <div class="job_data_label">
              Target Object Id.:
            </div>
            <div class="job_data_value">
              {itemId}
            </div>
          </div>
          <div class="job_data_box">
            <div class="job_data_label">
              Original Filename:
            </div>
            <div class="job_data_value">
              {fileName}
            </div>
          </div>
          <div class="job_data_box">
            <div class="job_data_label">
              Source File:
            </div>
            <div class="job_data_value">
              {this.returnSourceFile()}
            </div>
          </div>
          <div class="job_data_box">
            <div class="job_data_label">
              Tags:
            </div>
            <div class="job_data_value">
              {tags}
            </div>
          </div>
          <div class="job_data_box_left">
            <div class="job_data_label">
              Estimated Time Left:
            </div>
            <div class="job_data_value">
              {this.displayTime(timeLeft)}
            </div>
          </div>
          <div class="job_data_box_middle">
            <div class="job_data_label">
              Job Steps:
            </div>
            <div class="job_data_value">
              {stepNumber} of {this.state.vidispineData.totalSteps}
            </div>
          </div>
          <div class="job_data_box_right">
            <div class="job_data_label">
              Priority:
            </div>
            <div class="job_data_value">
              {<PriorityFormatter priority={this.state.vidispineData.priority}/>}
            </div>
          </div>
          <div class="job_data_box">
            <div class="job_data_label">
              Transcoder Host:
            </div>
            <div class="job_data_value">
              {transcoder}
            </div>
          </div>
          <div class="job_page_steps_title_box">
            <div class="job_page_steps_title_boxtitle">
              Steps
            </div>
          </div>
            {this.handleReverseArray()}
        </div>
      </div>
    )
  }
}

export default withRouter(JobPage);
