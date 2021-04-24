

// set the dimensions and margins of the graph
var margin = {top: 10, right: 50, bottom: 30, left: 40},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var boxWidth = 30
// append the svg2 object to the body of the page
var svg2 = d3.select("#play_type_viz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  // Show the X scale
  var x2 = d3.scaleBand()
    .range([ 0, width ])
    .domain(["Run", "Pass(Short)", "Pass(Long)"])
    .paddingInner(1)
    .paddingOuter(.5);
  svg2.append("g")
    .attr("transform", "translate(0," + height + ")")
      .style("font-size", "12px")
    .call(d3.axisBottom(x2));

// Show the Y scale
var y2 = d3.scaleLinear()
  .domain([0.0,1])
  .range([height, 0]);
svg2.append("g")
.style("font-size", "10px")
.call(d3.axisLeft(y2));


// create a tooltip
var tooltip2 = d3.select("#play_type_viz")
    .append("g")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("pointer-events", "none");

// Three function that change the tooltip when user hover / move / leave a cell
var mouseover = function(d) {
    tooltip2
      .style("opacity", 1)
    d3.select(this)
      .style("stroke", "none")
      .style("opacity", 1)
  }
  var mousemove = function(d) {
    tooltip2
      .html("Probability: " + d3.format(".2f")(d.value)
    + "<br> UpperCI:" + + d3.format(".2f")(d.upperci)
    + "<br> LowerCI:" + + d3.format(".2f")(d.lowerci) )
      .style("left", (d3.mouse(this)[0]+70) + "px")
      .style("top", (d3.mouse(this)[1]) + "px")
  }
  var mouseleave = function(d) {
    tooltip2
      .style("opacity", 0)
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1)
  }




// Read the data and compute summary statistics for each specie
d3.json('/get-data', function(err, data){
        console.log("initialized data")

        if (err) console.warn(err);
        data2 = []
        data2.push({ group: "Run", variable: "RUN", value: parseFloat(data['prob_run']), upperci: parseFloat(data['prob_run_upper_ci']), lowerci: parseFloat(data['prob_run_lower_ci'])})
        data2.push({ group: "Pass(Short)", variable: "RUN", value: parseFloat(data['prob_short_pass']), upperci: parseFloat(data['prob_short_pass_upperci']), lowerci: parseFloat(data['prob_short_pass_lowerci'])})
        data2.push({ group: "Pass(Long)", variable: "RUN", value: parseFloat(data['prob_long_pass']), upperci: parseFloat(data['prob_long_pass_upperci']), lowerci: parseFloat(data['prob_long_pass_lowerci'])})


      function createBox2(selection, predictions2) {
          lines = svg2.selectAll('pants')
              .data(predictions2, function(d) {return d.upperci+':'+d.lowerci+':'+d.group+':'+d.variable+':'+d.value;});
          lines
              .enter()
              .append("line")
                .attr("x1", function(d) { return x2(d.group) })
                .attr("x2", function(d) { return x2(d.group) })
                .attr("y1", function(d) { return y2(d.lowerci) })
                .attr("y2", function(d) { return y2(d.upperci) })
                .attr("stroke", "black");


          lines
              .enter()
              .append("line")
                  .attr("x1", function(d) { return x2(d.group)-(boxWidth-10)/2})
                  .attr("x2", function(d) { return x2(d.group)+(boxWidth-10)/2})
                  .attr("y1",  function(d) { return y2(d.lowerci) })
                  .attr("y2",  function(d) { return y2(d.lowerci) })
                  .attr("stroke", "black")
                  .style("stroke-width", "2px");

          lines
              .enter()
              .append("line")
                  .attr("x1", function(d) { return x2(d.group)-(boxWidth-10)/2})
                  .attr("x2", function(d) { return x2(d.group)+(boxWidth-10)/2})
                  .attr("y1",  function(d) { return y2(d.upperci) })
                  .attr("y2",  function(d) { return y2(d.upperci) })
                  .attr("stroke", "black")
                  .style("stroke-width", "2px");



          lines
              .enter()
              .append("rect")
                .attr("x", function(d) { return x2(d.group)-(boxWidth)/2})
                .attr("y", function(d) { return y(d.upperci) })
                .attr('width', boxWidth)
                .attr("height", function(d) { return (y(d.lowerci)-y(d.upperci))})
                .attr('stroke', 'black')
                .style("fill", "#69b3a2")
                .attr("opacity","1")
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave);
                lines
                    .exit().remove();

            lines
                .enter()
                .append("line")
                    .attr("x1", function(d) { return x2(d.group)-(boxWidth)/2})
                    .attr("x2", function(d) { return x2(d.group)+(boxWidth)/2})
                    .attr("y1",  function(d) { return y2(d.value) })
                    .attr("y2",  function(d) { return y2(d.value) })
                    .attr("stroke", "black")
                    .style("stroke-width", "4px");


          }

  createBox2(svg2, data2);
  svg2.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left-2)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Probability")
      .style("font-size", "12px");



 })
