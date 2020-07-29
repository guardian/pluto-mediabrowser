import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import {
  BrowserRouter,
  Link,
  Route,
  Switch,
  Redirect,
  withRouter,
} from "react-router-dom";
import { PieChart, Pie, Sector, Cell, Legend, Label } from "recharts";

class PieChartBox extends React.Component {
  static propTypes = {
    chartData: PropTypes.object.isRequired,
    chartName: PropTypes.string.isRequired,
    mapPlace: PropTypes.number.isRequired,
    vidispineHost: PropTypes.string.isRequired,
  };

  getChartData() {
    var chartDataToReturn = [];
    for (const [index, value] of this.props.chartData.count.entries()) {
      if (value.value != 0) {
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
      if (value.value != 0) {
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
    if (inputFieldName == "mediaType") {
      return "Media Type";
    }
    if (inputFieldName == "gnm_asset_category") {
      return "Category";
    }
    if (inputFieldName == "gnm_master_generic_source") {
      return "Source";
    }
    if (inputFieldName == "gnm_storage_rule_deletable") {
      return "Deletable";
    }
    return inputFieldName;
  }

  render() {
    const data = this.getChartData();
    const chartColours = [
      "#ff0000",
      "#00eaff",
      "#ffa200",
      "#00ff0c",
      "#ff00e4",
      "#fffc00",
      "#878aff",
      "#d3c69f",
      "#85cc7c",
      "#d87a7a",
      "#e4e591",
      "#9e62f9",
      "#3f51ff",
      "#b0ff63",
      "#d49f79",
      "#67aae8",
      "#93a354",
      "#9293c3",
      "#e58fe8",
      "#447645",
    ];

    const renderLegend = (props) => {
      const { payload } = props;

      return (
        <div>
          {payload.map((entry, index) => (
            <div
              class="pie_chart_lengend_box"
              key={`item-${index}`}
              style={{ backgroundColor: chartColours[index] }}
            >
              {entry.value}
            </div>
          ))}
        </div>
      );
    };

    const renderCustomizedLabel = ({ x, y, name, value, index }) => {
      return (
        <g>
          <rect
            x={x - this.returnSuitableOffsetForNumber(parseInt(value))}
            y={y - 10}
            width={this.returnSuitableWidthForNumber(parseInt(value))}
            height="17"
            rx="3"
            fill={chartColours[index]}
          />
          <text
            x={x}
            y={y}
            fill="black"
            textAnchor="end"
            dominantBaseline="central"
          >
            {value}
          </text>
        </g>
      );
    };

    if (data != "") {
      return (
        <div class="pie_chart_box">
          <div class="pie_chart_name">
            <strong>
              {this.returnHumanFriendlyTitle(this.props.chartName)}
            </strong>
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
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={chartColours[index % chartColours.length]}
                    strokeWidth={0}
                  />
                ))}
              </Pie>
              <Legend content={renderLegend} />
            </PieChart>
          </div>
        </div>
      );
    } else {
      return <div></div>;
    }
  }
}

export default PieChartBox;
