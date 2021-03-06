anychart.onDocumentReady(function () {
    // create data
    var data = [
      {x: "2010", y: "A", heat: 15},
      {x: "2011", y: "A", heat: 17},
      {x: "2012", y: "A", heat: 21},
      {x: "2010", y: "B", heat: 34},
      {x: "2011", y: "B", heat: 33},
      {x: "2012", y: "B", heat: 32},
      {x: "2010", y: "C", heat: 51},
      {x: "2011", y: "C", heat: 50},
      {x: "2012", y: "C", heat: 47}
    ];

    // create a chart and set the data
    var chart = anychart.heatMap(data);

    // set the chart title
    chart.title("Predicted Play Heat Map");

    // set the container id
    chart.container("heatmap");

    // initiate drawing the chart
    chart.draw();
});