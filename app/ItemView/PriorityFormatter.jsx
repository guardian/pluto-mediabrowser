import React from 'react';
import PropTypes from 'prop-types';

class PriorityFormatter extends React.Component {

  static propTypes = {
    priority: PropTypes.string.isRequired
  };

  returnPriority(priority) {
    if (typeof(priority) !== 'undefined' || priority != null) {
      return priority.replace(
          /\w\S*/g,
          function(txt) {
              return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
          }
      );
    } else {
      return 'Unknown';
    }
  }

render() {
  return <div>{this.returnPriority(this.props.priority)}
  </div>
  }
}

export default PriorityFormatter;
