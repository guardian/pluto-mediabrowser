import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {BrowserRouter, Link, Route, Switch, Redirect, withRouter} from 'react-router-dom';
import StatusFormatter from './StatusFormatter.jsx';
import TypeFormatter from './TypeFormatter.jsx';
import PriorityFormatter from './PriorityFormatter.jsx';
import moment from 'moment';
import {
  PieChart, Pie, Sector, Cell, Legend, Label
} from 'recharts';

class PieChartBox extends React.Component {

  static propTypes = {
    chartData: PropTypes.object.isRequired,
    chartName: PropTypes.string.isRequired,
    mapPlace: PropTypes.number.isRequired,
    vidispineHost: PropTypes.string.isRequired
  };

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

  getChartData() {
    var chartDataToReturn = [];
    for (const [index, value] of this.props.chartData.count.entries()) {
      if (value.value != 0){
        chartDataToReturn.push({ name: value.fieldValue, value: value.value });
      }
    }
    return chartDataToReturn;
  }

  returnSuitableWidthForNumber(inputNumber) {
    if (inputNumber < 10) {
      return 14;
    }
    if (inputNumber < 100) {
      return 20;
    }
    if (inputNumber < 1000) {
      return 26;
    }
    if (inputNumber < 10000) {
      return 32;
    }
    if (inputNumber < 100000) {
      return 38;
    }
    return 44;
  }

  returnSuitableOffsetForNumber(inputNumber) {
    if (inputNumber < 10) {
      return 10;
    }
    if (inputNumber < 100) {
      return 16;
    }
    if (inputNumber < 1000) {
      return 24;
    }
    if (inputNumber < 10000) {
      return 32;
    }
    if (inputNumber < 100000) {
      return 40;
    }
    return 48;
  }

  returnSuitableHeightForChart() {
    var chartDataToProcess = [];
    for (const [index, value] of this.props.chartData.count.entries()) {
      if (value.value != 0){
        chartDataToProcess.push({ name: value.fieldValue, value: value.value });
      }
    }
    const chartEntities = chartDataToProcess.length;
    if (chartEntities <= 4) {
      return 300;
    }
    if (chartEntities <= 7) {
      return 320;
    }
    if (chartEntities <= 10) {
      return 340;
    }
    if (chartEntities <= 13) {
      return 360;
    }
    if (chartEntities <= 16) {
      return 380;
    }
    if (chartEntities <= 19) {
      return 400;
    }
    if (chartEntities <= 22) {
      return 420;
    }
    return 440;
  }

  returnHumanFriendlyTitle(inputFieldName) {
    if (inputFieldName == 'mediaType') {
      return 'Media Type';
    }
    if (inputFieldName == 'gnm_asset_category') {
      return 'Category';
    }
    if (inputFieldName == 'gnm_master_generic_source') {
      return 'Source';
    }
    if (inputFieldName == 'gnm_storage_rule_deletable') {
      return 'Deletable';
    }
    return inputFieldName;
  }

render() {

  const data = this.getChartData();
  //const data = [
  //  { name: 'Group A', value: 400 },
  //  { name: 'Group B', value: 300 },
  //  { name: 'Group C', value: 300 },
  //  { name: 'Group D', value: 200 },
  //];

  const chartColours = ['#ff0000', '#00eaff', '#ffa200', '#00ff0c', '#ff00e4', '#fffc00', '#878aff', '#d3c69f', '#85cc7c', '#d87a7a', '#e4e591', '#9e62f9', '#3f51ff', '#b0ff63', '#d49f79', '#67aae8', '#93a354', '#9293c3', '#e58fe8', '#447645'];

  const renderLegend = (props) => {
    const { payload } = props;

    return (
      <div>
        {
          payload.map((entry, index) => (
            <div class="pie_chart_lengend_box" key={`item-${index}`} style={{backgroundColor: chartColours[index]}}>{entry.value}</div>
          ))
        }
      </div>
    );
  }

  const renderCustomizedLabel = ({
    x, y, name, value, index
  }) => {
    return (
      <g>
        <rect x={(x-this.returnSuitableOffsetForNumber(parseInt(value)))} y={(y-10)} width={this.returnSuitableWidthForNumber(parseInt(value))} height="17" rx="3" fill={chartColours[index]} />
        <text x={x} y={y} fill="black" textAnchor="end" dominantBaseline="central">
          {value}
        </text>
      </g>
    );
  };




  //const stepNumber = this.props.jobData.hasOwnProperty("currentStep") ? this.props.jobData.currentStep.number : 0;
  //const fileName = this.getValue(this.props.chartData.item.metadata.timespan[0].field, "originalFilename");
  //const created = this.getValue(this.props.itemData.item.metadata.timespan[0].field, "created");
  //const thumbNail = this.getValue(this.props.itemData.item.metadata.timespan[0].field, "representativeThumbnailNoAuth");
  if (data != '') {
    return <div class="pie_chart_box">
        <div class="pie_chart_name">
          <strong>{this.returnHumanFriendlyTitle(this.props.chartName)}</strong>
        </div>
        <div class="pie_chart">
          <PieChart width={354} height={this.returnSuitableHeightForChart()}>
            <Pie
              data={data}
              cx={172}
              cy={130}
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={100}
              dataKey="value"
            >
              {
                data.map((entry, index) => <Cell key={`cell-${index}`} fill={chartColours[index % chartColours.length]} strokeWidth={0} />)
              }
            </Pie>
            <Legend content={renderLegend} />
          </PieChart>
        </div>
      </div>
    } else {
      return <div></div>
    }
  }
}

export default PieChartBox;
