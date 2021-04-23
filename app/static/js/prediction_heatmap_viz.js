d3.json('/get-data', function(err, data){
        console.log("initialized data")
        console.log(data)
        if (err) console.warn(err);
        data1 = []
        data1.push({ group: "LEFT", variable: "RUN", value: parseFloat(data['prob_left_run']) })
        data1.push({ group: "MIDDLE", variable: "RUN", value: parseFloat(data['prob_middle_run']) })
        data1.push({ group: "RIGHT", variable: "RUN", value: parseFloat(data['prob_right_run']) })
        data1.push({ group: "LEFT", variable: "Pass (Short)", value: parseFloat(data['prob_short_left_pass']) })
        data1.push({ group: "MIDDLE", variable: "Pass (Short)", value: parseFloat(data['prob_short_middle_pass']) })
        data1.push({ group: "RIGHT", variable: "Pass (Short)", value: parseFloat(data['prob_short_right_pass']) })
        data1.push({ group: "LEFT", variable: "Pass (Long)", value: parseFloat(data['prob_long_left_pass']) })
        data1.push({ group: "MIDDLE", variable: "Pass (Long)", value: parseFloat(data['prob_long_middle_pass']) })
        data1.push({ group: "RIGHT", variable: "Pass (Long)", value: parseFloat(data['prob_long_right_pass']) })

// set the dimensions and margins of the graph
var margin = {top: 25, right: 0, bottom: 30, left: 65},
  width = 800 - margin.left - margin.right,
  height = 360 - margin.top - margin.bottom;
// set dimensions of background field
var field_w = 700;
var field_h = 280;
var map_w = 0.95*field_w
var map_h = field_h - 10
// append the svg object to the body of the page
var svg_h = d3.select("#heatmap_viz")
            .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");
var box_stroke_width = 1
var legendWidth = Math.min(width*0.8, 400);
var x, y, dataMin, dataMax, myColor, mouseover, mousemove, mouseleave, boxes, myGroups, myVars

function makeData(){

    dataMin = d3.min(data1, function(d) {return d.value})
    dataMax = d3.max(data1, function(d) {return d.value})

    // Build color scale
    myColor = d3.scaleSequential()
        .domain([dataMin, dataMax])
        .interpolator(d3.interpolate("#1034A6", "#F62D2D"));
}

//Read the data
// Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
createField()
makeData()
createAxes(data1)
createLegend(data1)
createHeatmap(svg_h, data1)

//create Axes
function createAxes(predictions){
    myGroups = d3.map(predictions, function(d){return d.group;}).keys()
    myVars = d3.map(predictions, function(d){return d.variable;}).keys()

    // Build X scales and axis:
    x = d3.scaleBand()
        .range([ 0, map_w ])
        .domain(myGroups)
        //.padding(0.05);

    //Append the x-axis
    svg_h.append("g")
        .style("font-size", 15)
        .attr("class", "hmapAxis")
        .attr("transform", "translate(17.5, 0)")
        .call(d3.axisTop(x).tickSize(0))
        .select(".domain").remove()

    // Build Y scales and axis:
    y = d3.scaleBand()
        .range([ map_h, 10 ])
        .domain(myVars)
        //.padding(0.05);

    //Append the y-axis
    svg_h.append("g")
        .style("font-size", 15)
        .attr("class", "hmapAxis")
        .attr("transform", "translate(-10, -35)")
        .call(d3.axisLeft(y).tickSize(0))
        .selectAll(".tick text")
        .call(wrap, 20);

    // create a tooltip
    var tooltip = d3.select("#heatmap_viz")
        .append("g")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("pointer-events", "none")

    // Three function that change the tooltip when user hover / move / leave a cell
    mouseover = function(d) {
    tooltip
      .style("opacity", 1)
    d3.select(this)
      .style("stroke", "black")
      .style("stroke-width", 3)
      .style("opacity", 1)
    }
    mousemove = function(d) {
    tooltip
      .html("The predicted probability <br> of a " + d.variable + " to the " + d.group.toLowerCase() + " is: " + parseFloat(d.value).toFixed(4))
      .style("left", (d3.mouse(this)[0]+100) + "px")
      .style("top", (d3.mouse(this)[1]+50) + "px")
    }
    mouseleave = function(d) {
    tooltip
      .style("opacity", 0)
    d3.select(this)
      .style("stroke-width", box_stroke_width)
      .style("opacity", function(d) {
                    if (d.value == 0) {
                        return .25}
                    else if (d.value == dataMax)  {
                        return 1.00
                    }
                    else {
                        return 0.8
                    }

       })
    }

  }

// add the heatmap squares
function createHeatmap(selection, predictions) {
    boxes = svg_h.selectAll('.hmap_box')
        .data(predictions, function(d) {return d.group+':'+d.variable+':'+d.value;});
    boxes
        .enter()
            .append("rect")
            .attr("class", "hmap_box")
            .attr("x", function(d) { return x(d.group)+17.5 })
            .attr("y", function(d) { return y(d.variable) })
            //.attr("rx", 10)
            //.attr("ry", 10)
            .attr("width", x.bandwidth() )
            .attr("height", y.bandwidth() )
            .style("stroke-width", box_stroke_width)
            .style("stroke", "black")
            .style("opacity", function(d) {
                    if (d.value == 0) {
                        return .25}
                    else if (d.value == dataMax)  {
                        return 1.00
                    }
                    else {
                        return 0.8
                        }
             })
            .style("fill", function(d) { return myColor(d.value)} )
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
    boxes
        .exit().remove()

    boxes_text = svg_h.selectAll('.box_text')
        .data(predictions, function(d) {return d.group+':'+d.variable+':'+d.value;});
    boxes_text
        .enter()
            .append("text")
            .attr("class", 'box_text')
            .style("fill", "black")
            .style("font-weight", "bold")
            .style("opacity", .5)
            .style('font-size', '16px')
            .attr("x", function(d) { return x(d.group)+100+17.5})
            .attr("y", function(d) { return y(d.variable)+25})
            .text(function(d){return parseFloat(d.value*100).toFixed(2)+"%"})
    boxes_text
        .exit().remove()
}

function createLegend (predictions){

    //Extra scale since the color scale is interpolated
    var countScale = d3.scaleLinear()
        .domain([dataMin, dataMax])
        .range([0, width])

    //Calculate the variables for the temp gradient
    var numStops = 5;
    countRange = countScale.domain();
    countRange[2] = countRange[1] - countRange[0];
    countPoint = [];
    for(var i = 0; i < numStops; i++) {
        countPoint.push(i * countRange[2]/(numStops-1) + countRange[0]);
    }

    //Create the gradient
    svg_h.append("defs")
        .append("linearGradient")
        .attr("id", "legend-traffic")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "0%")
        .selectAll("stop")
        .data(d3.range(numStops))
        .enter()
            .append("stop")
            .attr("offset", function(d,i) {
                return countScale( countPoint[i] )/width;
            })
            .attr("stop-color", function(d,i) {
                return myColor( countPoint[i] );
            })

//Color Legend container
var legendsvg = svg_h.append("g")
	.attr("class", "legendWrapper")
	.attr("transform", "translate(" + field_w/2 + "," + 300     + ")");

//Draw the Rectangle
legendsvg.append("rect")
	.attr("class", "legendRect")
	.attr("x", -legendWidth/2)
	.attr("y", 0)
	//.attr("rx", hexRadius*1.25/2)
	.attr("width", legendWidth)
	.attr("height", 10)
	.style("fill", "url(#legend-traffic)");

//Append title
legendsvg.append("text")
	.attr("class", "legendTitle")
	.attr("x", 0)
	.attr("y", -5)
	.style("text-anchor", "middle")
	.style("font-size", "12px")
	.text("Probability of Play Type");

//Set scale for legend x-axis
var xScale = d3.scaleLinear()
	 .range([-legendWidth/2, legendWidth/2])
	 .domain([ dataMin, dataMax] );

var formatPercent = d3.format(".0%");
//Define x-axis for the legend
var xAxis = d3.axisBottom()
      .tickSize(0)
	  .scale(xScale)
	  .tickFormat(formatPercent)

//Set up X axis
legendsvg.append("g")
	.attr("class", "axis")
	.attr("id", "legendAxis")
	.attr("transform", "translate(0," + 8 + ")")
	.call(xAxis)
    .select(".domain").remove();
}

function updateLegend(predictions){
    //console.log("updateLegend ran")
    //Set scale for legend x-axis
    var newScale = d3.scaleLinear()
         .range([-legendWidth/2, legendWidth/2])
         .domain([ dataMin, dataMax] );
    //console.log(dataMin + " = min & max = " + dataMax)
    //console.log(data1)
    //Define x-axis for the legend
    var newAxis = d3.axisBottom()
          .tickSize(0)
          .scale(newScale);
          //.tickFormat(formatPercent)
    svg_h.selectAll(".axis")
            .call(newAxis)
}

// generate the football field
function createField (){
 // add X-Axis boxes
  svg_h.append("rect")
      .attr("class", "axis_box")
      .attr("x", 0)
      .attr("y", -30)
      .attr("width", field_w/3+5)
      .attr("height", 30 )
      .style("fill", "gray")
      .style("stroke", "#c4c4c4")
      .style("stroke-width", 1)
      .style("opacity", 1)
  svg_h.append("rect")
      .attr("class", "axis_box")
      .attr("x", field_w/3+5)
      .attr("y", -30)
      .attr("width", field_w/3-10)
      .attr("height", 30 )
      .style("fill", "gray")
      .style("stroke", "#c4c4c4")
      .style("stroke-width", 1)
      .style("opacity", 1)
  svg_h.append("rect")
      .attr("class", "axis_box")
      .attr("x", field_w/3*2-5)
      .attr("y", -30)
      .attr("width", field_w/3+5)
      .attr("height", 30 )
      .style("fill", "gray")
      .style("stroke", "#c4c4c4")
      .style("stroke-width", 1)
      .style("opacity", 1)
  // add Y-Axis boxes
  var yBox_width = 60
  svg_h.append("rect")
      .attr("class", "axis_box")
      .attr("x", -yBox_width)
      .attr("y", 0)
      .attr("width", yBox_width)
      .attr("height", field_h/3 )
      .style("fill", "gray")
      .style("stroke", "#c4c4c4")
      .style("stroke-width", 1)
      .style("opacity", 1)
  svg_h.append("rect")
      .attr("class", "axis_box")
      .attr("x", -yBox_width)
      .attr("y", field_h/3)
      .attr("width", yBox_width)
      .attr("height", field_h/3 )
      .style("fill", "gray")
      .style("stroke", "#c4c4c4")
      .style("stroke-width", 1)
      .style("opacity", 1)
  svg_h.append("rect")
      .attr("class", "axis_box")
      .attr("x", -yBox_width)
      .attr("y", field_h/3*2    )
      .attr("width", yBox_width)
      .attr("height", field_h/3 )
      .style("fill", "gray")
      .style("stroke", "#c4c4c4")
      .style("stroke-width", 1)
      .style("opacity", 1)
  //Add Field Background
  svg_h.append("rect")
      .attr("class", "axis_box")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", field_w)
      .attr("height", field_h )
      .style("fill", "green")
      .style("stroke", "#c4c4c4")
      .style("stroke-width", 1)
      .style("opacity", 1)
 //Add Scrimmage Line
  svg_h.append("line")
      .style("stroke", "yellow")
      .style("stroke-width", 4)
      .attr("x1", 0)
      .attr("y1", 187)
      .attr("x2", field_w)
      .attr("y2", 187);
  //Add Yard Lines
    var tenyds = 65;
    var scrimmage_line = 187;
    var hash_w = 20;
  for(var i = 1; i < 2; i++) {
	svg_h.append("line")
      .style("stroke", "white")
      .style("stroke-width", 4)
      .attr("x1", 0)
      .attr("y1", 187 + tenyds*i)
      .attr("x2", field_w)
      .attr("y2", 187 + tenyds*i);
}
  for(var i = 1; i < 3; i++) {
	svg_h.append("line")
      .style("stroke", "white")
      .style("stroke-width", 4)
      .attr("x1", 0)
      .attr("y1", scrimmage_line - tenyds*i)
      .attr("x2", field_w)
      .attr("y2", scrimmage_line - tenyds*i);
}
  //Add hash lines
  //Left Sideline
  for(var i = 1; i < 12; i++) {
	svg_h.append("line")
      .style("stroke", "white")
      .style("stroke-width", 4)
      .attr("x1", 0)
      .attr("y1", scrimmage_line - tenyds/4*i)
      .attr("x2", hash_w)
      .attr("y2", scrimmage_line - tenyds/4*i);
}
  for(var i = 1; i < 6; i++) {
	svg_h.append("line")
      .style("stroke", "white")
      .style("stroke-width", 4)
      .attr("x1", 0)
      .attr("y1", scrimmage_line + tenyds/4*i)
      .attr("x2", hash_w)
      .attr("y2", scrimmage_line + tenyds/4*i);
}
  //Right Sideline
  for(var i = 1; i < 12; i++) {
	svg_h.append("line")
      .style("stroke", "white")
      .style("stroke-width", 4)
      .attr("x1", field_w-hash_w)
      .attr("y1", scrimmage_line - tenyds/4*i)
      .attr("x2", field_w)
      .attr("y2", scrimmage_line - tenyds/4*i);
}
  for(var i = 1; i < 6; i++) {
	svg_h.append("line")
      .style("stroke", "white")
      .style("stroke-width", 4)
      .attr("x1", field_w-hash_w)
      .attr("y1", scrimmage_line + tenyds/4*i)
      .attr("x2", field_w)
      .attr("y2", scrimmage_line + tenyds/4*i);
}
//center hashes
var left_hash = .35
var right_hash = .685
var left_center_pos = map_w / 3 + 17.5
var right_center_pos = 2*(map_w / 3) + 17.5
  for(var i = 1; i < 12; i++) {
	svg_h.append("line")
      .style("stroke", "white")
      .style("stroke-width", 4)
      //.attr("x1", field_w*left_hash-hash_w)
      .attr("x1", left_center_pos - hash_w/2)
      .attr("y1", scrimmage_line - tenyds/4*i)
      .attr("x2", left_center_pos + hash_w/2)
      .attr("y2", scrimmage_line - tenyds/4*i);
}
  for(var i = 1; i < 6; i++) {
	svg_h.append("line")
      .style("stroke", "white")
      .style("stroke-width", 4)
      .attr("x1", left_center_pos - hash_w/2)
      .attr("y1", scrimmage_line + tenyds/4*i)
      .attr("x2", left_center_pos + hash_w/2)
      .attr("y2", scrimmage_line + tenyds/4*i);
}
  for(var i = 1; i < 12; i++) {
	svg_h.append("line")
      .style("stroke", "white")
      .style("stroke-width", 4)
      .attr("x1", right_center_pos - hash_w/2)
      .attr("y1", scrimmage_line - tenyds/4*i)
      .attr("x2", right_center_pos + hash_w/2)
      .attr("y2", scrimmage_line - tenyds/4*i);
}
  for(var i = 1; i < 6; i++) {
	svg_h.append("line")
      .style("stroke", "white")
      .style("stroke-width", 4)
      .attr("x1", right_center_pos - hash_w/2)
      .attr("y1", scrimmage_line + tenyds/4*i)
      .attr("x2", right_center_pos + hash_w/2)
      .attr("y2", scrimmage_line + tenyds/4*i);
}
var myUrl = d3.select('#inputYardLine').property('value');
  //Add Yard Lines Numbers
    svg_h.append("text")
      .attr("x", 160)
      .attr("y", -35)
      .attr("id", "yardline")
      .attr("text-anchor", "left")
      .attr('transform', 'rotate(90)')
      .style("font-size", "48px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .style("max-width", 400)
      .text(myUrl);
    svg_h.append("text")
      .attr("x", -215)
      .attr("y", 670)
      .attr("id", "yardline")
      .attr("text-anchor", "left")
      .attr('transform', 'rotate(-90)')
      .style("font-size", "48px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .style("max-width", 400)
      .text(myUrl);
}

//Bind updateYardLines to the submit button click event
d3.select('#submit')
        .on('click', updateHeatMap);

function updateHeatMap(){

d3.json('/get-data', function(err, data){
        console.log("data raw")
        console.log(data)
        if (err) console.warn(err);
        data1 = []
        data1.push({ group: "LEFT", variable: "RUN", value: parseFloat(data['prob_left_run']) })
        data1.push({ group: "MIDDLE", variable: "RUN", value: parseFloat(data['prob_middle_run']) })
        data1.push({ group: "RIGHT", variable: "RUN", value: parseFloat(data['prob_right_run']) })
        data1.push({ group: "LEFT", variable: "Pass (Short)", value: parseFloat(data['prob_short_pass']) })
        data1.push({ group: "MIDDLE", variable: "Pass (Short)", value: parseFloat(data['prob_short_pass']) })
        data1.push({ group: "RIGHT", variable: "Pass (Short)", value: parseFloat(data['prob_short_pass']) })
        data1.push({ group: "LEFT", variable: "Pass (Long)", value: parseFloat(data['prob_long_pass']) })
        data1.push({ group: "MIDDLE", variable: "Pass (Long)", value: parseFloat(data['prob_long_pass']) })
        data1.push({ group: "RIGHT", variable: "Pass (Long)", value: parseFloat(data['prob_long_pass']) })

    updateYardLines()
    makeData()
    createAxes(data1)
    createHeatmap(svg_h, data1)
    updateLegend(data1)
    console.log("Show Data")
    console.log(data1)
    })
}
//function to update the yard line numbers
function updateYardLines() {
    var inputLine = d3.select('#inputYardLine').property('value');
    d3.selectAll("#yardline")
    .text(inputLine)
}

// Supporting function to wrap axis text labels
function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}

})