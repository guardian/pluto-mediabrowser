import React from 'react';
import PropTypes from 'prop-types';
import {BrowserRouter, Link, Route, Switch, Redirect, withRouter} from 'react-router-dom';
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
      scope.setState({
        imageWidth: this.width,
        imageHeight: this.height
      },() => {

      });
    }
    const imageURL = this.getValue(this.props.itemData.item.metadata.timespan[0].field, "representativeThumbnailNoAuth");
    img.src = this.props.vidispineHost + imageURL;
  }

  returnImageDimensions() {
    this.getImageSize();
    var widthToReturn = this.state.imageWidth;
    var heightToReturn = this.state.imageHeight;
    return widthToReturn, heightToReturn
  }

render() {
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
