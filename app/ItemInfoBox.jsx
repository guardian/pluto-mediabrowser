import React from 'react';
import PropTypes from 'prop-types';
import {BrowserRouter, Link, Route, Switch, Redirect, withRouter} from 'react-router-dom';
import StatusFormatter from './StatusFormatter.jsx';
import TypeFormatter from './TypeFormatter.jsx';
import PriorityFormatter from './PriorityFormatter.jsx';
import moment from 'moment';

class ItemInfoBox extends React.Component {

  static propTypes = {
    itemData: PropTypes.object.isRequired,
    itemId: PropTypes.string.isRequired,
    mapPlace: PropTypes.number.isRequired,
    vidispineHost: PropTypes.string.isRequired
  };

  constructor(props){
    super(props);
    this.state = {
      imageHeight: 0,
      imageWidth: 0
    }
  }

  returnStatusForCSS(status) {
    // Accepts a status. If the status has a special CSS statement with a custom background colour, return the name of the correct CSS statement. If not return the name of the CSS statement for normal job boxes.
    if (status == 'FAILED_TOTAL') {
      return "job_box_failed";
    }
    if (status == 'FINISHED') {
      return "job_box_finished";
    }
    if (status == 'FINISHED_WARNING') {
      return "job_box_warning";
    }
    if (status == 'ABORTED') {
      return "job_box_aborted";
    }
    return "job_box_normal";
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

  getValue(data,findthis) {
    for (let [key, value] of Object.entries(data)) {
      if (findthis == value.name) {
        for (let [key3, value3] of Object.entries(value.value)) {
          return value3.value;
        }
      }
    }
    return 'Unknown';
  }

  getImageSize() {
    var img = new Image();
    const scope = this
    img.onload = function() {
      //alert(this.width + 'x' + this.height);
      scope.setState({
        imageWidth: this.width,
        imageHeight: this.height
      },() => {
        //this.clearSelections();
        //this.getJobDataWrapper();
      });
    }
    const imageURL = this.getValue(this.props.itemData.item.metadata.timespan[0].field, "representativeThumbnailNoAuth");
    img.src = this.props.vidispineHost + imageURL;
    //const imageURL = this.getValue(this.props.itemData.item.metadata.timespan[0].field, "representativeThumbnailNoAuth");
    //var image = require("image-size!" + this.props.vidispineHost + imageURL);
    //console.log(image);
  }

  returnImageDimensions() {
    this.getImageSize();
    var widthToReturn = this.state.imageWidth;
    var heightToReturn = this.state.imageHeight;
    return widthToReturn, heightToReturn
  }

render() {
  //const stepNumber = this.props.jobData.hasOwnProperty("currentStep") ? this.props.jobData.currentStep.number : 0;
  const fileName = this.getValue(this.props.itemData.item.metadata.timespan[0].field, "originalFilename");
  const created = this.getValue(this.props.itemData.item.metadata.timespan[0].field, "created");
  const thumbNail = this.getValue(this.props.itemData.item.metadata.timespan[0].field, "representativeThumbnailNoAuth");
  const {imageWidthForDisplay, imageHeightForDisplay} = this.returnImageDimensions();
  return <div class="item_box">
    <div class="item_filename">
      <strong>{fileName}</strong>
    </div>
    <div class="item_id">
      {this.props.itemId}
    </div>
    <div class="item_thumbnail">
      { thumbNail != 'Unknown'
        ? ((this.state.imageWidth / this.state.imageHeight) > 1.78
          ? <img src={this.props.vidispineHost + thumbNail} width={240} class="thumbnail" />
          : <img src={this.props.vidispineHost + thumbNail} height={135} class="thumbnail" />
        )
        : <div> </div>
      }
    </div>
    <div class="item_created">
      {moment(created).format("dddd D/M/YYYY H:mm:ss")}
    </div>
  </div>
  }
}

export default ItemInfoBox;
