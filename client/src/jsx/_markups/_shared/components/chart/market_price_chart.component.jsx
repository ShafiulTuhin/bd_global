import React from "react";
import ReactApexChart from "react-apexcharts";

/* var randomizeArray = function (arg) {
  var array = arg.slice();
  var currentIndex = array.length,
    temporaryValue, randomIndex;

  while (0 !== currentIndex) {

    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
} */

// data for the sparklines that appear below header area

class ApexBar4 extends React.Component {
  
  constructor(props) {
    super(props);
    
    const height = (this.props.height) ? this.props.height : 50;
    const width = (this.props.width) ? this.props.width : 150;
    const type = (this.props.type) ? this.props.type : 'line';
    this.state = {          
      series: [{
        data: this.props.sparklineData
      }],
      options: {
        chart: {
          type: type,
          width: width,
          height: height,
          sparkline: {
            enabled: true
          }
        },
        stroke: {
          curve: 'straight',
          width:1
        },
        fill: {
          opacity: 0.3
        },
        
        tooltip: {
          fixed: {
            enabled: false
          },
          x: {
            show: false
          },
          y: {
            title: {
              formatter: function (seriesName) {
                return ''
              }
            }
          },
          marker: {
            show: false
          }
        }
      },
    };
  }

  render() {
    const height = (this.props.height) ? this.props.height : 50;
    const width = (this.props.width) ? this.props.width : 150;
    const type = (this.props.type) ? this.props.type : 'line';
    return (
      <div id="chart" className="apex-chart">
        <ReactApexChart
          options={this.state.options}
          series={this.state.series}
          type={type}
          height={height} width={width}
        />
      </div>
    );
  }
}

export default ApexBar4;
