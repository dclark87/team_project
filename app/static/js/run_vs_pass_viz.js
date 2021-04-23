

// set the dimensions and margins of the graph
var margin = {top: 10, right: 50, bottom: 30, left: 40},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var boxWidth = 30
// append the svg object to the body of the page
var svg = d3.select("#run_vs_pass_viz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");


// Show the X scale
var scale = d3.scaleLinear()
                .domain([0,1])
                .range([0, width-35]);
                //Append group and insert axis

  // Add scales to axis
  // Add scales to axis


var scalepad=30
var boxheight=60

var tooltip4 = d3.select("#run_vs_pass_viz")
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
var mouseover3 = function(d) {
    tooltip4
      .style("opacity", 1)
    d3.select(this)
      .style("stroke", "none")
      .style("opacity", 1)
  }
  var mousemove3 = function(d) {
    if (d.run_value >0.5) {
    tooltip4
      .html(  "Predicted Play Type: Run"
    + "<br> Probability: " + d3.format(".2f")(d.run_value)
    + "<br> UpperCI :" + + d3.format(".2f")(d.run_upperci)
    + "<br> LowerCI :" + + d3.format(".2f")(d.run_lowerci) )
      .style("left", (d3.mouse(this)[0]+70) + "px")
      .style("top", (d3.mouse(this)[1]) + "px")
  }

  else 	{
    tooltip4
      .html(  "Predicted Play Type: Pass"
    + "<br> Probability: " + d3.format(".2f")(d.pass_value)
    + "<br> UpperCI :" + + d3.format(".2f")(d.pass_upperci)
    + "<br> LowerCI :" + + d3.format(".2f")(d.pass_lowerci) )
      .style("left", (d3.mouse(this)[0]+70) + "px")
      .style("top", (d3.mouse(this)[1]) + "px")
  }
  }
  var mouseleave3 = function(d) {
    tooltip4
      .style("opacity", 0)
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1)
  }

// Read the data and compute summary statistics for each specie
d3.json('/get-data', function(err, data){
        console.log("initialized data")

        if (err) console.warn(err);
        data3 = []
        data3.push({ group: "Run", variable: "RUN", run_value: parseFloat(data['prob_run']),
         run_upperci: parseFloat(data['prob_run_lower_ci']), run_lowerci: parseFloat(data['prob_run_upper_ci']),
         pass_value: parseFloat(data['prob_pass']),
        pass_lowerci: parseFloat(data['prob_pass_lower_ci']), pass_upperci: parseFloat(data['prob_pass_upper_ci'])})


      function createBox3(selection, predictions3) {
          lines = svg.selectAll('pants')
              .data(predictions3, function(d) {return d.run_upperci+':'+d.run_lowerci+':'+d.run_value});
              lines
                  .enter()
                 lines
                     .enter()
                     .append("line")
                         .attr("x1", scalepad+ scale(0))
                         .attr("x2", scalepad+scale(1))
                         .attr("y1",  height/2)
                         .attr("y2",  height/2)
                         .attr("stroke", "black")
                         .style("stroke-width", "2px");



             lines
                 .enter()
                 .append('rect')
                  .attr("x", function(d){
                    if (d.run_value>0.5) {
                          return scalepad+scale(d.run_lowerci)
                    }
                    else 	{
                      console.log(d.pass_lowerci)
                         return scalepad+scale(d.pass_lowerci)
                    }})
                  .attr("y", height/2-boxheight/2)
                  .attr('width', function(d){
                    if (d.run_value >0.5) {
                        return scale(d.run_upperci)-scale(d.run_lowerci)
                    }
                    else 	{
                       return scale(d.pass_upperci)-scale(d.pass_lowerci)
                    }})
                  .attr("height",boxheight)
                  .attr('stroke', 'black')
                  .style("fill", function(d){
                    if (d.run_value >0.5) {
                        return "Sienna"
                    }
                    else 	{
                       return "LightSkyBlue"
                    }})
                  .on("mouseover", mouseover3)
                  .on("mousemove", mousemove3)
                  .on("mouseleave", mouseleave3);


          lines
              .enter()
              .append("line")
                  .attr("x1", function(d) { return scalepad + scale(d.pass_value)})
                  .attr("x2", function(d) { return scalepad + scale(d.pass_value)})
                  .attr("y1",  function(d) { return height/2+boxheight/2 })
                  .attr("y2",  function(d) { return height/2-boxheight/2 })
                  .attr("stroke", "black")
                  .style("stroke-width", "4px");


      lines
          .enter()
          .append("line")
              .attr("x1", function(d) { return scalepad + scale(0.5)})
              .attr("x2", function(d) { return scalepad + scale(0.5)})
              .attr("y1",  function(d) { return height/2+boxheight })
              .attr("y2",  function(d) { return height/2-boxheight })
              .attr("stroke", "red")
              .style("stroke-dasharray", ("3, 3"))
              .style("stroke-width", "4px");



          }


  createBox3(svg, data3);
  //add run pass labels
    svg.append("text")
      .attr("x", width)
      .attr("y", height/2)
      .attr("text-anchor", "Bottom")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text("Pass");

      svg.append("text")
        .attr("x", 0)
        .attr("y", height/2)
        .attr("text-anchor", "Bottom")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text("Run");



 })
