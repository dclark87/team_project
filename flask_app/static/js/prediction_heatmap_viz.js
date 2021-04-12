// set the dimensions and margins of the graph
var margin = {top: 40, right: 0, bottom: 30, left: 100},
  width = 800 - margin.left - margin.right,
  height = 360 - margin.top - margin.bottom;
// set dimensions of background field
var field_w = 600;
var field_h = 280;
var map_w = 570
var map_h = 270
// append the svg object to the body of the page
var svg_h = d3.select("#heatmap_viz")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

//temp data
data1 = [{group: "LEFT", variable: "RUN", value: "0.39"},
{group: "MIDDLE", variable: "RUN", value: "0.44"},
{group: "RIGHT", variable: "RUN", value: "0.40"},
{group: "LEFT", variable: "Pass (Short)", value: "0.51"},
{group: "MIDDLE", variable: "Pass (Short)", value: "0.48"},
{group: "RIGHT", variable: "Pass (Short)", value: "0.46"},
{group: "LEFT", variable: "Pass (Long)", value: "0.75"},
{group: "MIDDLE", variable: "Pass (Long)", value: "0.72"},
{group: "RIGHT", variable: "Pass (Long)", value: "0.85"}]


//Read the data
d3.csv("/static/heatmap_data.csv", function(data) {

  // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
  var myGroups = d3.map(data1, function(d){return d.group;}).keys()
  var myVars = d3.map(data1, function(d){return d.variable;}).keys()

  // Build X scales and axis:
  var x = d3.scaleBand()
    .range([ 0, map_w ])
    .domain(myGroups)
    //.padding(0.05);
  svg_h.append("g")
    .style("font-size", 15)
    .attr("class", "hmapAxis")
    .attr("transform", "translate(0, 0)")
    .call(d3.axisTop(x).tickSize(0))
    .select(".domain").remove()

  // Build Y scales and axis:
  var y = d3.scaleBand()
    .range([ map_h, 10 ])
    .domain(myVars)
    //.padding(0.05);
  svg_h.append("g")
    .style("font-size", 15)
    .attr("class", "hmapAxis")
    .attr("transform", "translate(-10, -35)")
    .call(d3.axisLeft(y).tickSize(0))
    .selectAll(".tick text")
    .call(wrap, 20);

  // Build color scale
  var myColor = d3.scaleSequential()
    //.interpolator(d3.interpolateInferno)
    //interpolate("blue", "red"))
    //.domain([.3,.8])
    .domain([d3.min(data1, function (d) {return d.value}), d3.max(data1, function(d) {return d.value})])
    //.range(["#1034A6", "#F62D2D"])
    .interpolator(d3.interpolate("#1034A6", "#F62D2D"));
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
  var box_stroke_width = 1
  var mouseover = function(d) {
    tooltip
      .style("opacity", 1)
    d3.select(this)
      .style("stroke", "black")
      .style("stroke-width", 3)
      .style("opacity", 1)
  }
  var mousemove = function(d) {
    tooltip
      .html("The predicted probability <br> of a " + d.variable + " to the " + d.group.toLowerCase() + " is: " + d.value)
      .style("left", (d3.mouse(this)[0]+100) + "px")
      .style("top", (d3.mouse(this)[1]+50) + "px")
  }
  var mouseleave = function(d) {
    tooltip
      .style("opacity", 0)
    d3.select(this)
      .style("stroke-width", box_stroke_width)
      .style("opacity", 0.8)
  }

  // add the squares
  svg_h.selectAll()
    .data(data1, function(d) {return d.group+':'+d.variable;})
    .enter()
    .append("rect")
      .attr("x", function(d) { return x(d.group)+15 })
      .attr("y", function(d) { return y(d.variable) })
      //.attr("rx", 10)
      //.attr("ry", 10)
      .attr("width", x.bandwidth() )
      .attr("height", y.bandwidth() )
      .style("fill", function(d) { return myColor(d.value)} )
      .style("stroke-width", box_stroke_width)
      .style("stroke", "black")
      .style("opacity", 0.8)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)

// add the legend
//Legend
//Colors

var legendWidth = Math.min(width*0.8, 400);
//Extra scale since the color scale is interpolated
var countScale = d3.scaleLinear()
	.domain([d3.min(data1, function(d) {return d.value}), d3.max(data1, function(d) {return d.value})])
	.range([0, width])

//Calculate the variables for the temp gradient
var numStops = 5;
countRange = countScale.domain();
countRange[2] = countRange[1] - countRange[0];
countPoint = [];
for(var i = 0; i < numStops; i++) {
	countPoint.push(i * countRange[2]/(numStops-1) + countRange[0]);
}//for i

//Create the gradient
svg_h.append("defs")
	.append("linearGradient")
	.attr("id", "legend-traffic")
	.attr("x1", "0%").attr("y1", "0%")
	.attr("x2", "100%").attr("y2", "0%")
	.selectAll("stop")
	.data(d3.range(numStops))
	.enter().append("stop")
	.attr("offset", function(d,i) {
		return countScale( countPoint[i] )/width;
	})
	.attr("stop-color", function(d,i) {
		return myColor( countPoint[i] );
	});


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

//Set scale for x-axis
var xScale = d3.scaleLinear()
	 .range([-legendWidth/2, legendWidth/2])
	 .domain([ d3.min(data1, function(d) { return d.value; }), d3.max(data1, function(d) { return d.value; })] );

//Define x-axis
var xAxis = d3.axisBottom()
      .tickSize(0)
	  //.tickFormat(formatPercent)
	  .scale(xScale);

//Set up X axis
legendsvg.append("g")
	.attr("class", "axis")
	.attr("transform", "translate(0," + 8 + ")")
	.call(xAxis);
call(d3.axisTop(x).tickSize(0))
    .select(".domain").remove()
/*
for (var i=0; i < 10; i++) {
var increment = .10
//var increment = (d3.max(data1, function(d) {return d.value}) - d3.min(data1, function(d) {return d.value})) / 10 ;
    svg_h.append("rect")
    .attr("x", 20*i)
    .attr("y", 290)
    .attr("width", 20)
    .attr("height", 20)
    .style("fill", myColor( increment * i  + d3.min(data1, function(d) {return d.value}) ) )
} -->*/

//console.log(data1)
//End csv
})

 // add X-Axis boxes
  svg_h.append("rect")
      .attr("class", "axis_box")
      .attr("x", 0)
      .attr("y", -30)
      .attr("width", field_w/3)
      .attr("height", 30 )
      .style("fill", "gray")
      .style("stroke", "#c4c4c4")
      .style("stroke-width", 1)
      .style("opacity", 1)
  svg_h.append("rect")
      .attr("class", "axis_box")
      .attr("x", field_w/3)
      .attr("y", -30)
      .attr("width", field_w/3)
      .attr("height", 30 )
      .style("fill", "gray")
      .style("stroke", "#c4c4c4")
      .style("stroke-width", 1)
      .style("opacity", 1)
  svg_h.append("rect")
      .attr("class", "axis_box")
      .attr("x", field_w/3*2)
      .attr("y", -30)
      .attr("width", field_w/3)
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
  for(var i = 1; i < 12; i++) {
	svg_h.append("line")
      .style("stroke", "white")
      .style("stroke-width", 4)
      .attr("x1", field_w*left_hash-hash_w)
      .attr("y1", scrimmage_line - tenyds/4*i)
      .attr("x2", field_w*left_hash)
      .attr("y2", scrimmage_line - tenyds/4*i);
}
  for(var i = 1; i < 6; i++) {
	svg_h.append("line")
      .style("stroke", "white")
      .style("stroke-width", 4)
      .attr("x1", field_w*left_hash-hash_w)
      .attr("y1", scrimmage_line + tenyds/4*i)
      .attr("x2", field_w*left_hash)
      .attr("y2", scrimmage_line + tenyds/4*i);
}
  for(var i = 1; i < 12; i++) {
	svg_h.append("line")
      .style("stroke", "white")
      .style("stroke-width", 4)
      .attr("x1", field_w*right_hash-hash_w)
      .attr("y1", scrimmage_line - tenyds/4*i)
      .attr("x2", field_w*right_hash)
      .attr("y2", scrimmage_line - tenyds/4*i);
}
  for(var i = 1; i < 6; i++) {
	svg_h.append("line")
      .style("stroke", "white")
      .style("stroke-width", 4)
      .attr("x1", field_w*right_hash-hash_w)
      .attr("y1", scrimmage_line + tenyds/4*i)
      .attr("x2", field_w*right_hash)
      .attr("y2", scrimmage_line + tenyds/4*i);
}
var myUrl = d3.select('#inputYardLine').property('value');
  //Add Yard Lines Numbers
  svg_h.append("text")
      .attr("x", 160)
      .attr("y", -120)
      .attr("class", "yardline")
      .attr("text-anchor", "left")
      .attr('transform', 'rotate(90)')
      .style("font-size", "48px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .style("max-width", 400)
      .text(myUrl);
  svg_h.append("text")
      .attr("x", -215)
      .attr("y", 490)
      .attr("class", "yardline")
      .attr("text-anchor", "left")
      .attr('transform', 'rotate(-90)')
      .style("font-size", "48px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .style("max-width", 400)
      .text(myUrl);

// when the input range changes update value
d3.select("#inputYardLine").on("input", function() {
  update(this.value);
});

// Initial update value
update(50);

// adjust the text
function update(inputYardLine) {
  // adjust the value
  svg_h.select(".yardline")
    .attr("text", inputYardLine);
}



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