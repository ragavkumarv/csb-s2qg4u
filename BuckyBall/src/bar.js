var currentSelection = null;
var truncLengh = 30;
$(document).ready(function () {
  Plot();
});
function Plot(year = 2002) {
  var sortedData = chartData(year).sort(function (a, b) {
    return (
      parseFloat(b[chartOptions[0].yaxis]) -
      parseFloat(a[chartOptions[0].yaxis])
    );
  });
  TransformChartData(sortedData, chartOptions);
  BuildBar("chart", sortedData, chartOptions);
}

function BuildBar(id, chartData, options, level) {
  d3.selectAll("#" + id + " svg").remove();
  chart = d3.select("#" + id + " .innerCont");

  var margin = { top: 50, right: 10, bottom: 100, left: 50 },
    width =
      $($("#" + id + " .innerCont")[0]).outerWidth() -
      margin.left -
      margin.right,
    height =
      $($("#" + id + " .innerCont")[0]).outerHeight() -
      margin.top -
      margin.bottom;
  var xVarName;
  var yVarName = options[0].yaxis;

  if (level == 1) {
    xVarName = options[0].xaxisl1;
  } else {
    xVarName = options[0].xaxis;
  }

  var xAry = runningData.map(function (el) {
    return el[xVarName];
  });

  var yAry = runningData.map(function (el) {
    return el[yVarName];
  });

  var capAry = runningData.map(function (el) {
    return el.caption;
  });

  var x = d3.scaleBand().domain(xAry).rangeRound([0, width], 0.5);
  var y = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(runningData, function (d) {
        return d[yVarName];
      }),
    ])
    .range([height, 0]);
  var rcolor = d3.scaleOrdinal().range(runningColors);

  chart = chart
    .append("svg") //append svg element inside #chart
    .attr("width", width + margin.left + margin.right) //set width
    .attr("height", height + margin.top + margin.bottom); //set height

  var bar = chart
    .selectAll("g")
    .data(runningData)
    .enter()
    .append("g")
    .attr("transform", function (d) {
      return "translate(" + x(d[xVarName]) + ", 0)";
    });

  var ctrtxt = 0;
  var xAxis = d3
    .axisBottom()
    .scale(x)
    .ticks(xAry.length)
    .tickFormat(function (d) {
      if (level == 0) {
        var mapper = options[0].captions[0];
        return mapper[d];
      } else {
        var r = runningData[ctrtxt].caption;
        ctrtxt += 1;
        return r;
      }
    });

  var yAxis = d3.axisLeft().scale(y).ticks(5); //orient left because y-axis tick labels will appear on the left side of the axis.

  bar
    .append("rect")
    .attr("y", function (d) {
      return y(d.Threatened) + margin.top - 15;
    })
    // .attr("y", height)
    .attr("x", function (d) {
      return margin.left + x.bandwidth() / 4;
    })
    .on("mouseenter", function (d) {
      d3.select(this)
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .attr("y", function (d) {
          return y(d.Threatened) + margin.top - 20;
        })
        .attr("height", function (d) {
          return height - y(d[yVarName]) + 5;
        })
        .attr("x", function (d) {
          return margin.left - 5 + x.bandwidth() / 4;
        })
        .attr("width", x.bandwidth() / 2 + 10)
        .transition()
        .duration(200);
    })
    .on("mouseleave", function (d) {
      d3.select(this)
        .attr("stroke", "none")
        .attr("y", function (d) {
          return y(d[yVarName]) + margin.top - 15;
        })
        .attr("height", function (d) {
          return height - y(d[yVarName]);
        })
        .attr("x", function (d) {
          return margin.left + x.bandwidth() / 4;
        })
        .attr("width", x.bandwidth() / 2)
        .transition()
        .duration(200);
    })
    .on("click", function (d) {
      if (this._listenToEvents) {
        // Reset immediatelly
        d3.select(this).attr("transform", "translate(0,0)");
        // Change level on click if no transition has started
        path.each(function () {
          this._listenToEvents = false;
        });
      }
      d3.selectAll("#" + id + " svg").remove();
      if (level == 1) {
        TransformChartData(chartData, options, 0, d[xVarName]);
        BuildBar(id, chartData, options, 0);
        currentSelection = null;
      } else {
        currentSelection = d[xVarName];
        var nonSortedChart = chartData.sort(function (a, b) {
          return (
            parseFloat(b[options[0].yaxis]) - parseFloat(a[options[0].yaxis])
          );
        });

        TransformChartData(chartData, options, 1, d[xVarName]);
        BuildBar(id, chartData, options, 1);
      }
      geodesic(year, currentSelection);
    });

  bar
    .selectAll("rect")
    .transition()
    .duration(000)
    .attr("height", function (d) {
      return height - y(d[yVarName]);
    })
    .attr("width", x.bandwidth() / 2); //set width base on range on ordinal data;

  bar.selectAll("rect").style("fill", function (d) {
    return rcolor(d[xVarName]);
  }),
    bar
      .append("text")
      .attr("x", x.bandwidth() / 4 - 240)
      .attr("y", x.bandwidth() / 2 + margin.left + 10)
      .attr("dy", ".35em")
      .text(function (d) {
        return d[yVarName];
      });

  bar.append("svg:title").text(function (d) {
    return (
      d["title"] +
      "- Assessed (" +
      d.Assessed +
      "), Threatened (" +
      d.Threatened +
      ")"
    );
  });

  chart
    .append("g")
    .attr("class", "x axis")
    .attr(
      "transform",
      "translate(" + margin.left + "," + (height + margin.top - 15) + ")"
    )
    .call(xAxis)
    .append("text")
    .attr("x", width)
    .attr("y", -6)
    .style("text-anchor", "end");
  //.text("Year");

  chart
    .append("g")
    .attr("class", "y axis")
    .attr(
      "transform",
      "translate(" + margin.left + "," + (margin.top - 15) + ")"
    )
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end");

  chart.selectAll("text").attr("transform", " translate(-10,50) rotate(270)");
  chart
    .select(".y.axis")
    .selectAll("text")
    .attr("transform", " translate(-15,-10) rotate(-90)"); // y axis label text

  if (level == 1) {
    chart
      .select(".x.axis")
      .selectAll("text")
      .attr("transform", " translate(10,30) rotate(300)");
  }
}

function TransformChartData(chartData, opts, level, filter) {
  var result = [];
  var resultColors = [];
  var counter = 0;
  var hasMatch;
  var xVarName;
  var yVarName = opts[0].yaxis;
  var Assessed = opts[0].Assessed;

  if (level == 1) {
    xVarName = opts[0].xaxisl1;
    for (var i in chartData) {
      hasMatch = false;
      for (var index = 0; index < result.length; ++index) {
        var data = result[index];
        if (
          data[xVarName] == chartData[i][xVarName] &&
          chartData[i][opts[0].xaxis] == filter
        ) {
          result[index][yVarName] =
            result[index][yVarName] + chartData[i][yVarName];
          result[index][Assessed] =
            result[index][Assessed] + chartData[i][Assessed];
          hasMatch = true;
          break;
        }
      }
      if (hasMatch == false && chartData[i][opts[0].xaxis] == filter) {
        if (result.length < 9) {
          ditem = {};
          ditem[xVarName] = chartData[i][xVarName];
          ditem[yVarName] = chartData[i][yVarName];
          ditem[Assessed] = chartData[i][Assessed];
          ditem["caption"] = chartData[i][xVarName].substring(0, 10) + "...";
          ditem["title"] = chartData[i][xVarName];
          ditem["op"] = 1.0 - parseFloat("0." + result.length);
          result.push(ditem);

          resultColors[counter] = opts[0].color[0][chartData[i][opts[0].xaxis]];

          counter += 1;
        }
      }
    }
  } else {
    xVarName = opts[0].xaxis;
    for (var i in chartData) {
      hasMatch = false;
      for (var index = 0; index < result.length; ++index) {
        var data = result[index];
        if (data[xVarName] == chartData[i][xVarName]) {
          result[index][yVarName] =
            result[index][yVarName] + chartData[i][yVarName];
          result[index][Assessed] =
            result[index][Assessed] + chartData[i][Assessed];
          hasMatch = true;
          break;
        }
      }
      if (hasMatch == false) {
        ditem = {};
        ditem[xVarName] = chartData[i][xVarName];
        ditem[yVarName] = chartData[i][yVarName];
        ditem[Assessed] = chartData[i][Assessed];
        ditem["caption"] =
          opts[0].captions != undefined
            ? opts[0].captions[0][chartData[i][xVarName]]
            : "";
        ditem["title"] =
          opts[0].captions != undefined
            ? opts[0].captions[0][chartData[i][xVarName]]
            : "";
        ditem["op"] = 1;
        result.push(ditem);
        // console.log(ditem);

        resultColors[counter] =
          opts[0].color != undefined
            ? opts[0].color[0][chartData[i][xVarName]]
            : "";

        counter += 1;
      }
    }
  }

  runningData = result;
  runningColors = resultColors;
  return;
}

const chartData = (year) => fullChartData.filter((data) => data.Year === year);

chartOptions = [
  {
    captions: [
      {
        "Fungi & protists": "Fungi & protists",
        Vertebrates: "Vertebrates",
        Invertebrates: "Invertebrates",
        Plants: "Plants",
      },
    ],
    color: [
      {
        "Fungi & protists": "orchid",
        Vertebrates: "darkkhaki",
        Invertebrates: "dodgerblue",
        Plants: "darkgreen",
      },
    ],
    xaxis: "Kingdom",
    xaxisl1: "Species",
    yaxis: "Threatened",
    Assessed: "Assessed",
  },
];
