// dimensions
var svgWidth = 600;
var svgHeight = 500;

// setting the margins 
var margin = {
  top: 60,
  right: 60,
  bottom: 60,
  left: 60
};

// defining the dimensions
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Select SVG area to it
// is this correct? or should it be going to the "body"
var svg = d3.select("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Appending a group area here
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// loading the data in here
d3.csv("HappinessAlcoholConsumption_2016.csv").then(function(happinessData) {

  // Print the happinessData
  console.log(happinessData);

  // Format the Region and cast the HappinessScore value to a number
  var region = happinessData.map(d => d.Region)
  console.log("region",region)

  var happiness = happinessData.map(d=>d.HappinessScore)
  console.log("happiness", happiness)

  happinessData.forEach(function(d) {
    d.Region = d.Region;
    d.HappinessScore = +d.HappinessScore;
  });

   // Set the domain for the xBandScale function
  // d3.extent returns the an array containing the min and max values for the property specified
  var xBandScale = d3.scaleBand()
    .domain(happinessData.map(d => d.Region))
    .range([0, chartWidth])
    .padding(0.1);

    // making the y linear scale here
    // Set the domain for the xLinearScale function
  var yLinearScale = d3.scaleLinear()
    .range([chartHeight, 0])
    .domain([0, d3.max(happinessData, d => d.HappinessScore)]);

  // creating the two new functions / arguments
  // These will be used to create the chart's axes
  var bottomAxis = d3.axisBottom(xBandScale);
  var leftAxis = d3.axisLeft(yLinearScale).ticks(3);

  // line chart isnt working for me. idk how to do this
  // var drawLine = d3.line()
  //   .x(data => xBandScale(data.Region))
  //   .y(data => yLinearScale(data.HappinessScore));

  // chartGroup.append("path")
    // The drawLine function returns the instructions for creating the line for happinessData
    // .attr("d", drawLine(happinessData))
    // .classed("line", true);

  chartGroup.append("g")
    // .classed("axis", true)
    .call(leftAxis);

  chartGroup.append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(bottomAxis);

  // chartGroup.append("g")
  //   .classed("axis", true)
  //   .attr("transform", "translate(0, " + chartHeight + ")")
  //   .call(bottomAxis);
  chartGroup.selectAll(".bar")
    .data(happinessData)
    .enter()
    .append("rect")
    .attr("class","bar")
    .attr("x",d=> xBandScale(d.Region))
    .attr("y",d=> yLinearScale(d.HappinessScore))
    .attr("width",xBandScale.bandwidth())
    .attr("height",d=>chartHeight - yLinearScale(d.HappinessScore));

}).catch(function(error) {
  console.log(error);
});
