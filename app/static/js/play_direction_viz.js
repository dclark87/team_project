

// set the dimensions and margins of the graph
var margin = {top: 10, right: 50, bottom: 30, left: 40},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var boxWidth = 30
// append the svg1 object to the body of the page
var svg1 = d3.select("#play_direction_viz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  // Show the X scale
var x = d3.scaleBand()
  .range([ 0, width ])
  .domain(["Left", "Middle", "Right"])
  .paddingInner(1)
  .paddingOuter(.5);
svg1.append("g")
  .attr("transform", "translate(0," + height + ")")
    .style("font-size", "12px")
  .call(d3.axisBottom(x));

// Show the Y scale
var y = d3.scaleLinear()
  .domain([0.0,1])
  .range([height, 0]);
svg1.append("g")
.style("font-size", "10px")
.call(d3.axisLeft(y));





var tooltip3 = d3.select("#play_direction_viz")
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
var mouseover2 = function(d) {
    tooltip3
      .style("opacity", 1)
    d3.select(this)
      .style("stroke", "none")
      .style("opacity", 1)
  }
  var mousemove2 = function(d) {
    tooltip3
      .html("Probability: " + d3.format(".2f")(d.value)
    + "<br> UpperCI:" + + d3.format(".2f")(d.upperci)
    + "<br> LowerCI:" + + d3.format(".2f")(d.lowerci) )
      .style("left", (d3.mouse(this)[0]+70) + "px")
      .style("top", (d3.mouse(this)[1]) + "px")
  }
  var mouseleave2 = function(d) {
    tooltip3
      .style("opacity", 0)
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1)
  }










// Read the data and compute summary statistics for each specie
d3.json('/get-data', function(err, data){
        if (err) console.warn(err);
        data1 = []
        data1.push({ group: "Left", variable: "RUN", value: parseFloat(data['prob_left_run']+data['prob_short_left_pass']+data['prob_long_left_pass']), upperci: parseFloat(data['prob_left_run_upperci']+data['prob_short_left_pass_upperci']+data['prob_long_left_pass_upperci']), lowerci: parseFloat(data['prob_left_run_lowerci']+data['prob_short_left_pass_lowerci']+data['prob_long_left_pass_lowerci'])})
        data1.push({ group: "Middle", variable: "RUN", value: parseFloat(data['prob_middle_run']+data['prob_short_middle_pass']+data['prob_long_middle_pass']), upperci: parseFloat(data['prob_middle_run_upperci']+data['prob_short_middle_pass_upperci']+data['prob_long_middle_pass_upperci']), lowerci: parseFloat(data['prob_middle_run_lowerci']+data['prob_short_middle_pass_lowerci']+data['prob_long_middle_pass_lowerci'])})
        data1.push({ group: "Right", variable: "RUN", value: parseFloat(data['prob_right_run']+data['prob_short_right_pass']+data['prob_long_right_pass']), upperci: parseFloat(data['prob_right_run_upperci']+data['prob_short_right_pass_upperci']+data['prob_long_right_pass_upperci']), lowerci: parseFloat(data['prob_right_run_lowerci']+data['prob_short_right_pass_lowerci']+data['prob_long_right_pass_lowerci'])})



      function createBox(selection, predictions) {
          lines = svg1.selectAll('.hmap_box')
              .data(predictions, function(d) {return d.upperci+':'+d.lowerci+':'+d.group+':'+d.variable+':'+d.value;});
          lines
              .enter()
              .append("line")
                .attr("x1", function(d) { return x(d.group) })
                .attr("x2", function(d) { return x(d.group) })
                .attr("y1", function(d) { return y(d.lowerci) })
                .attr("y2", function(d) { return y(d.upperci) })
                .attr("stroke", "black");

          lines
              .enter()
              .append("line")
                  .attr("x1", function(d) { return x(d.group)-(boxWidth-10)/2})
                  .attr("x2", function(d) { return x(d.group)+(boxWidth-10)/2})
                  .attr("y1",  function(d) { return y(d.lowerci) })
                  .attr("y2",  function(d) { return y(d.lowerci) })
                  .attr("stroke", "black")
                  .style("stroke-width", "2px");

          lines
              .enter()
              .append("line")
                  .attr("x1", function(d) { return x(d.group)-(boxWidth-10)/2})
                  .attr("x2", function(d) { return x(d.group)+(boxWidth-10)/2})
                  .attr("y1",  function(d) { return y(d.upperci) })
                  .attr("y2",  function(d) { return y(d.upperci) })
                  .attr("stroke", "black")
                  .style("stroke-width", "2px");



            lines
                .enter()
                .append("rect")
                  .attr("x", function(d) { return x(d.group)-(boxWidth)/2})
                  .attr("y", function(d) { return y(d.upperci) })
                  .attr('width', boxWidth)
                  .attr("height", function(d) { return (y(d.lowerci)-y(d.upperci))})
                  .attr('stroke', 'black')
                  .style("fill", "#69b3a2")
                  .attr("opacity","1")
                  .on("mouseover", mouseover2)
                  .on("mousemove", mousemove2)
                  .on("mouseleave", mouseleave2);
                  lines
                      .exit().remove();


          lines
              .enter()
              .append("line")
                  .attr("x1", function(d) { return x(d.group)-(boxWidth)/2})
                  .attr("x2", function(d) { return x(d.group)+(boxWidth)/2})
                  .attr("y1",  function(d) { return y(d.value) })
                  .attr("y2",  function(d) { return y(d.value) })
                  .attr("stroke", "black")
                  .style("stroke-width", "2px");
  }


  createBox(svg1, data1);
  svg1.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left-2)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Probability")
      .style("font-size", "12px");


 })
