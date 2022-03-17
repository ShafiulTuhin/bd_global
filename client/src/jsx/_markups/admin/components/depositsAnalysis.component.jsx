import React from "react";
import ReactApexChart from "react-apexcharts";

class ApexBar3 extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [
        {
          name: "New",
          data: [20, 0, 10, 9, 50, 2, 1, 3],
        },
        {
          name: "Old",
          data: [20, 50, 20, 10, 10, 200,190, 39, 20, 85, 22, 50],
        },
      ],
      options: {
        chart: {
          type: "bar",
          height: 350,
          toolbar: {
            show: false,
          },
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "55%",
            endingShape: "rounded",
          },
        },
        dataLabels: {
          enabled: false,
        },

        legend: {
          show: true,
          fontSize: "12px",
          fontWeight: 300,

          labels: {
            colors: "black",
          },
          position: "bottom",
          horizontalAlign: "center",
          markers: {
            width: 19,
            height: 19,
            strokeWidth: 0,
            radius: 19,
            strokeColor: "#fff",
            fillColors: ["#EB8153", "#D45BFF"],
            offsetX: 0,
            offsetY: 0,
          },
        },
        yaxis: {
          labels: {
            style: {
              colors: "#3e4954",
              fontSize: "14px",
              fontFamily: "Poppins",
              fontWeight: 100,
            },
          },
        },
        stroke: {
          show: true,
          width: 2,
          colors: ["transparent"],
        },
        xaxis: {
          categories: ["Jan","Feb","Mar","Apr","May","Jun","Jul",
    				"Aug","Sep","Oct","Nov","Dec",
    			],
        },
        fill: {
          colors: ["#EB8153", "#D45BFF"],
          opacity: 1,
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return "$ " + val + " thousands";
            },
          },
        },
      },
    };
  }

  render() {
    return (
      <div id="chart" className="apex-chart">
        <ReactApexChart
          options={this.state.options}
          series={this.state.series}
          type="bar"
          height={350}
        />
      </div>
    );
  }
}

export default ApexBar3;
