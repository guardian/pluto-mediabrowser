import React from 'react';
import PropTypes from 'prop-types';

class StatusFormatter extends React.Component {

  static propTypes = {
    status: PropTypes.string.isRequired
  };

  returnStatus(status) {
    switch(status) {
      case "FAILED_TOTAL":
        return "Failed";
      case "READY":
        return "Ready";
      case "STARTED":
        return "Started";
      case "VIDINET_JOB":
        return "Vidinet";
      case "FINISHED":
        return "Finished";
      case "FINISHED_WARNING":
        return "Finished with Warning";
      case "WAITING":
        return "Waiting";
      case "ABORTED_PENDING":
        return "Aborted Pending";
      case "ABORTED":
        return "Aborted";
      default:
       return status;
    }
  }

render() {
  return <div>{this.returnStatus(this.props.status)}
  </div>
  }
}

export default StatusFormatter;
