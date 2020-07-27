import React from 'react';
import PropTypes from 'prop-types';

class TypeFormatter extends React.Component {

  static propTypes = {
    type: PropTypes.string.isRequired
  };

  returnType(type) {
    switch(type) {
      case "RAW_IMPORT":
        return "Raw Import";
      case "NONE":
        return "None";
      case "IMPORT":
        return "Import";
      case "PLACEHOLDER_IMPORT":
        return "Placeholder Import";
      case "AUTO_IMPORT":
        return "Auto Import";
      case "SHAPE_IMPORT":
        return "Shape Import";
      case "SIDECAR_IMPORT":
        return "Sidecar Import";
      case "ESSENCE_VERSION":
        return "Essence Version";
      case "TRANSCODE":
        return "Transcode";
      case "TRANSCODE_RANGE":
        return "Transcode Range";
      case "CONFORM":
        return "Conform";
      case "TIMELINE":
        return "Timeline";
      case "THUMBNAIL":
        return "Thumbnail";
      case "ANALYZE":
        return "Analyze";
      case "SHAPE_UPDATE":
        return "Shape Update";
      case "RAW_TRANSCODE":
        return "Raw Transcode";
      case "EXPORT":
        return "Export";
      case "COPY_FILE":
        return "Copy File";
      case "MOVE_FILE":
        return "Move File";
      case "DELETE_FILE":
        return "Delete File";
      case "LIST_ITEMS":
        return "List Items";
      case "EXPORT":
        return "Export";
      case "COPY_FILE":
        return "Copy File";
      default:
       return type;
    }
  }

render() {
  return <div>{this.returnType(this.props.type)}
  </div>
  }
}

export default TypeFormatter;
