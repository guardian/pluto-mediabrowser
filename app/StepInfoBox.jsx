import React from 'react';
import PropTypes from 'prop-types';
import {BrowserRouter, Link, Route, Switch, Redirect, withRouter} from 'react-router-dom';
import StatusFormatter from './StatusFormatter.jsx';
import TypeFormatter from './TypeFormatter.jsx';
import PriorityFormatter from './PriorityFormatter.jsx';
import moment from 'moment';

class StepInfoBox extends React.Component {

  static propTypes = {
    stepData: PropTypes.object.isRequired,
    //jobId: PropTypes.string.isRequired,
    //mapPlace: PropTypes.string.isRequired
  };

  returnCSSForStatus(status) {
    // Accepts a status. If the status has a special CSS statement with a custom background colour, return the name of the correct CSS statement. If not return the name of the CSS statement for normal job boxes.
    if (status == 'FAILED_TOTAL') {
      return "step_box_failed";
    }
    if (status == 'FINISHED') {
      return "step_box_finished";
    }
    if (status == 'FAILED_RETRY') {
      return "step_box_failed";
    }
    return "step_box";
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

render() {
  //const stepNumber = this.props.jobData.hasOwnProperty("currentStep") ? this.props.jobData.currentStep.number : 0;
  //const fileName = this.getValue(this.props.jobData.data, "originalFilename");
  //const timeLeft = this.getValue(this.props.jobData.data, "transcodeEstimatedTimeLeft");
  return <div class={this.returnCSSForStatus(this.props.stepData.status)}>
    <div class="step_number">
      {this.props.stepData.step}
    </div>
    <div class="step_description">
      {this.props.stepData.description}
    </div>
    <div class="step_tasks">
    {this.props.stepData.subStep && this.props.stepData.subStep.length > 0 ? (
      this.props.stepData.subStep.map(function(item, i){
             return <div>{(i + 1)}. {item.description}</div>;
           })
    ) : (
      <div></div>
    )}
    </div>
    <div class="step_data">
      Status: {this.props.stepData.status}
      <br />
      {moment(this.props.stepData.timestamp).format("D/M/YYYY H:mm")}
      <br />
      Attempts: {this.props.stepData.attempts}
      <br />
      Task: {this.props.stepData.id}
    </div>
  </div>
  }
}

export default StepInfoBox;
