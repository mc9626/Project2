function makeResponsive() {

  // select svgArea
  var svgArea = d3.select("body").select("svg");

  // clear svg if it is  not empty
  if (!svgArea.empty()) {
    svgArea.remove();
  }

// SVG wrapper dimensions are determined by the current width and height of the browser window.
var svgWidth = window.innerWidth*0.8;
var svgHeight =svgWidth*0.65;

//set margin
var margin = {
top: 20,
bottom: 100,
right: 40,
left: 80
};

//set svg height and width
var height = svgHeight - margin.top - margin.bottom;
var width = svgWidth - margin.left - margin.right;

//select place to add svg
var svg = d3
.select("#scatter")
.append("svg")
.attr("height", svgHeight)
.attr("width", svgWidth);

// Append group element
var chartGroup = svg.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

//set initial axes  
var chosenXAxis = "Beer_PerCapita";
var chosenYAxis = "HappinessScore";

//create xscale
function xScale(csvData, chosenXAxis) {
// create scales
var xLinearScale = d3.scaleLinear()
  .domain([
    d3.min(csvData, d => d[chosenXAxis]) * 0.8-10,
    d3.max(csvData, d => d[chosenXAxis]) * 1.2
    ])
  .range([0, width]);

return xLinearScale;
}

//create yscale  
function yScale(csvData, chosenYAxis) {
// create scales
var yLinearScale = d3.scaleLinear()
  .domain([
    d3.min(csvData, d => d[chosenYAxis]) * 0.8,
    d3.max(csvData, d => d[chosenYAxis]) * 1.2
    ])
  .range([height, 0]);

return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
var bottomAxis = d3.axisBottom(newXScale);

xAxis.transition()
  .duration(1000)
  .call(bottomAxis);

return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
var leftAxis = d3.axisLeft(newYScale);

yAxis.transition()
  .duration(1000)
  .call(leftAxis);

return yAxis;
}

// function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

circlesGroup.transition()
  .duration(1000)
  .attr("cx", d => newXScale(d[chosenXAxis]))
  .attr("cy", d => newYScale(d[chosenYAxis]));

return circlesGroup;
}

// function used for updating text group with a transition to new text
function renderText(textGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

textGroup.transition()
  .duration(1000)
  .attr("x", d => newXScale(d[chosenXAxis]))
  .attr("y", d => newYScale(d[chosenYAxis]));

return textGroup;
}

//function used for updating tooltips with a choice of different axes
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

var toolTip = d3.tip()
  .attr("class", "tooltip")
  .offset([80, -60])
  .html(function(d) {
    if (chosenXAxis === "beer") {
      return (`${d.Country}<br>${chosenXAxis}: ${d[chosenXAxis]}<br>${chosenYAxis}: ${d[chosenYAxis]}`);
    }
    else if (chosenXAxis === "spirit") {
      return (`${d.Country}<br>${chosenXAxis}: ${d[chosenXAxis]}  <br>${chosenYAxis}: ${d[chosenYAxis]}`);
    }
    else {
      return (`${d.Country}<br>${chosenXAxis}: ${d[chosenXAxis]}  <br>${chosenYAxis}: ${d[chosenYAxis]}`);
    }
  });

circlesGroup.call(toolTip);

//when mouse move over and out, tooltip shows and hides
circlesGroup
  .on("mouseover", function(data) {toolTip.show(data);})
  .on("mouseout", function(data, index) {toolTip.hide(data);});

  return circlesGroup;
}

//read local data file
d3.csv("data/data.csv").then(function(csvData, err) {
  if (err) throw err;

  // parse data
  csvData.forEach(function(data) {
    data.Beer_PerCapita = +data.Beer_PerCapita;
    data.Spirit_PerCapita = +data.Spirit_PerCapita;

    data.Wine_PerCapita = +data.Wine_PerCapita;
    data.HappinessScore = +data.HappinessScore;

    data.HDI = +data.HDI;

    data.Country = data.Country;
  });

  // use xLinearScale function above with import data
  var xLinearScale = xScale(csvData, chosenXAxis);

  // use xLinearScale function above with import data
  var yLinearScale = yScale(csvData, chosenYAxis);

// Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
  .classed("x-axis", true)
  .attr("transform", `translate(0, ${height})`)
  .call(bottomAxis);

  // append y axis
  var yAxis=chartGroup.append("g")
  .classed("y-axis", true)
  .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(csvData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 10)
    .attr("fill", "skyblue")
    //.attr("opacity", ".5")
    .attr("stroke-width", "1");

  // append initial text
  var textGroup = chartGroup.selectAll("text")
    .exit() //because enter() before, clear cache
    .data(csvData)
    .enter()
    .append("text")
    .text(d => d.Country)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .attr("font-size", "7px")
    .attr("text-anchor", "middle")
    .attr("class","stateText");

  // Create group for three x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var beerLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "Beer_PerCapita") // value to grab for event listener
    .classed("active", true)
    .text("Beer_PerCapita");

  var spiritLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "Spirit_PerCapita") // value to grab for event listener
    .classed("inactive", true)
    .text("Spirit_PerCapita");

  var wineLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "Wine_PerCapita") // value to grab for event listener
    .classed("inactive", true)
    .text("Wine_PerCapita");

  // Create group for three x-axis labels
  var ylabelsGroup = chartGroup.append("g");

  var scoreLabel = ylabelsGroup.append("text")
  .attr("transform", `translate(-60,${height / 2})rotate(-90)`)
  .attr("dy", "1em")
  .attr("value", "HappinessScore") 
  .classed("active", true)
  .text("Happiness Score");
   
  var hdiLabel = ylabelsGroup.append("text")
  .attr("transform",`translate(-80,${height / 2})rotate(-90)`)
  .attr("dy", "1em")
  .attr("value", "HDI") 
  .classed("inactive", true)
  .text("HDI"); 

// use updateToolTip function above with imported data
var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

// x axis labels event listener
labelsGroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {

      // replaces chosenXAxis with value
      chosenXAxis = value;

      // functions here found above csv import updates x scale for new data
      xLinearScale = xScale(csvData, chosenXAxis);
      yLinearScale = yScale(csvData, chosenYAxis);
      // updates x axis with transition
      xAxis = renderXAxes(xLinearScale, xAxis);

      // updates circles with new x values
      circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
      
      // updates text with new x values
      textGroup = renderText(textGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

      // changes classes to change bold text
      if (chosenXAxis === "Beer_PerCapita") {
        beerLabel
          .classed("active", true)
          .classed("inactive", false);
        spiritLabel
          .classed("active", false)
          .classed("inactive", true);
        wineLabel
          .classed("active", false)
          .classed("inactive", true);
        }
      else if (chosenXAxis === "Spirit_PerCapita") {
        beerLabel
          .classed("active", false)
          .classed("inactive", true);
        spiritLabel
          .classed("active", true)
          .classed("inactive", false);
        wineLabel
          .classed("active", false)
          .classed("inactive", true);
        }
      else {
        beerLabel
          .classed("active", false)
          .classed("inactive", true);
        spiritLabel
          .classed("active", false)
          .classed("inactive", true);
        wineLabel
          .classed("active", true)
          .classed("inactive", false);
    }
  }

});

// y axis labels event listener
ylabelsGroup.selectAll("text")
.on("click", function() {
  // get value of selection
  var value = d3.select(this).attr("value");
  if (value !== chosenYAxis) {

    // replaces chosenXAxis with value
    chosenYAxis = value;

    // functions here found above csv import updates y scale for new data
    xLinearScale = xScale(csvData, chosenXAxis);
    yLinearScale = yScale(csvData, chosenYAxis);
    // updates y axis with transition
    yAxis = renderYAxes(yLinearScale, yAxis);

    // updates circles with new y values
    circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

    // updates text with new y values
    textGroup = renderText(textGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);

    // updates tooltips with new info
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

      // changes classes to change bold text
      if (chosenYAxis === "HappinessScore") {
        scoreLabel
          .classed("active", true)
          .classed("inactive", false);
        hdiLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
      scoreLabel
        .classed("active", false)
        .classed("inactive", true);
      hdiLabel
        .classed("active", true)
        .classed("inactive", false);
    }
  }
})




});
}

makeResponsive();

d3.select(window).on("resize",makeResponsive);


//country=[];
function metadatainfo(id){
  d3.csv("data/data.csv").then((input) =>{
//      var metadata=metainput.metadata;
//      country=[];
      Western_Europe_h=[];
      North_America_h=[];
      Australia_and_New_Zealand_h=[];
      Middle_East_and_Northern_Africa_h=[];
      Latin_America_and_Caribbean_h=[];
      Southeastern_Asia_h=[];
      Central_and_Eastern_Europe_h=[];
      Eastern_Asia_h=[];
      Sub_Saharan_Africa_h=[];

      Western_Europe_B=[];
      Western_Europe_S=[];
      Western_Europe_W=[];

      North_America_B=[];
      North_America_S=[];
      North_America_W=[];

      Australia_and_New_Zealand_B=[];
      Australia_and_New_Zealand_S=[];
      Australia_and_New_Zealand_W=[];

      Middle_East_and_Northern_Africa_B=[];
      Middle_East_and_Northern_Africa_S=[];
      Middle_East_and_Northern_Africa_W=[];

      Latin_America_and_Caribbean_B=[];
      Latin_America_and_Caribbean_S=[];
      Latin_America_and_Caribbean_W=[];

      Southeastern_Asia_B=[];
      Southeastern_Asia_S=[];
      Southeastern_Asia_W=[];

      Central_and_Eastern_Europe_B=[];
      Central_and_Eastern_Europe_S=[];
      Central_and_Eastern_Europe_W=[];

      Eastern_Asia_B=[];
      Eastern_Asia_S=[];
      Eastern_Asia_W=[];

      Sub_Saharan_Africa_B=[];
      Sub_Saharan_Africa_S=[];
      Sub_Saharan_Africa_W=[];

//      dict={};
//      var list=[{key:"key",value:"value"}]
      for (var i=0;i<input.length;i++){

        input[i].HappinessScore = + input[i].HappinessScore;
        input[i].Beer_PerCapita = + input[i].Beer_PerCapita;
        input[i].Spirit_PerCapita = + input[i].Spirit_PerCapita;
        input[i].Wine_PerCapita = + input[i].Wine_PerCapita;

        if (input[i].Region=="Western Europe"){
          Western_Europe_h.push(input[i].HappinessScore);
          Western_Europe_B.push(input[i].Beer_PerCapita);
          Western_Europe_S.push(input[i].Spirit_PerCapita);
          Western_Europe_W.push(input[i].Wine_PerCapita);
        }
        else if(input[i].Region=="North America"){
          North_America_h.push(input[i].HappinessScore)
          North_America_B.push(input[i].Beer_PerCapita);
          North_America_S.push(input[i].Spirit_PerCapita);
          North_America_W.push(input[i].Wine_PerCapita);
        }
        else if(input[i].Region=="Australia and New Zealand"){
          Australia_and_New_Zealand_h.push(input[i].HappinessScore)
          Australia_and_New_Zealand_B.push(input[i].Beer_PerCapita);
          Australia_and_New_Zealand_S.push(input[i].Spirit_PerCapita);
          Australia_and_New_Zealand_W.push(input[i].Wine_PerCapita);
        }
        else if(input[i].Region=="Middle East and Northern Africa"){
          Middle_East_and_Northern_Africa_h.push(input[i].HappinessScore)
          Middle_East_and_Northern_Africa_B.push(input[i].Beer_PerCapita);
          Middle_East_and_Northern_Africa_S.push(input[i].Spirit_PerCapita);
          Middle_East_and_Northern_Africa_W.push(input[i].Wine_PerCapita);
        }
        else if(input[i].Region=="Latin America and Caribbean"){
          Latin_America_and_Caribbean_h.push(input[i].HappinessScore)
          Latin_America_and_Caribbean_B.push(input[i].Beer_PerCapita);
          Latin_America_and_Caribbean_S.push(input[i].Spirit_PerCapita);
          Latin_America_and_Caribbean_W.push(input[i].Wine_PerCapita);
        }
        else if(input[i].Region=="Southeastern Asia"){
          Southeastern_Asia_h.push(input[i].HappinessScore)
          Southeastern_Asia_B.push(input[i].Beer_PerCapita);
          Southeastern_Asia_S.push(input[i].Spirit_PerCapita);
          Southeastern_Asia_W.push(input[i].Wine_PerCapita);
        }
        else if(input[i].Region=="Central and Eastern Europe"){
          Central_and_Eastern_Europe_h.push(input[i].HappinessScore)
          Central_and_Eastern_Europe_B.push(input[i].Beer_PerCapita);
          Central_and_Eastern_Europe_S.push(input[i].Spirit_PerCapita);
          Central_and_Eastern_Europe_W.push(input[i].Wine_PerCapita);
        }
        else if(input[i].Region=="Eastern Asia"){
          Eastern_Asia_h.push(input[i].HappinessScore)
          Eastern_Asia_B.push(input[i].Beer_PerCapita);
          Eastern_Asia_S.push(input[i].Spirit_PerCapita);
          Eastern_Asia_W.push(input[i].Wine_PerCapita);
        }
        else {
          Sub_Saharan_Africa_h.push(input[i].HappinessScore)
          Sub_Saharan_Africa_B.push(input[i].Beer_PerCapita);
          Sub_Saharan_Africa_S.push(input[i].Spirit_PerCapita);
          Sub_Saharan_Africa_W.push(input[i].Wine_PerCapita);
        }
//      dict["Country"]=input[i].Country;
//      dict["HapinessScore"]=input[i].HappinessScore;
//      dict={};
//        list[i].key=input[i].key;
//      country.push(input[i].Country)
//      country.push(input[i].HappinessScore);
//      dict["Country"]=input[i].Country;
      }  
//      console.log(country);

h1=Western_Europe_h.reduce(function(a,b){
  return a+b;
},0);
h1f=h1/Western_Europe_h.length;
h11=Western_Europe_B.reduce(function(a,b){
  return a+b;
},0);
h12=Western_Europe_S.reduce(function(a,b){
  return a+b;
},0);
h13=Western_Europe_W.reduce(function(a,b){
  return a+b;
},0);
al1=h11+h12+h13;
al1f=al1/Western_Europe_B.length;
//console.log(al1f);

h2=North_America_h.reduce(function(a,b){
  return a+b;
},0);
h2f=h2/North_America_h.length;
h21=North_America_B.reduce(function(a,b){
  return a+b;
},0);
h22=North_America_S.reduce(function(a,b){
  return a+b;
},0);
h23=North_America_W.reduce(function(a,b){
  return a+b;
},0);
al2=h21+h22+h23;
al2f=al2/North_America_B.length;

h3=Australia_and_New_Zealand_h.reduce(function(a,b){
  return a+b;
},0);
h3f=h3/Australia_and_New_Zealand_h.length;
h31=Australia_and_New_Zealand_B.reduce(function(a,b){
  return a+b;
},0);
h32=Australia_and_New_Zealand_S.reduce(function(a,b){
  return a+b;
},0);
h33=Australia_and_New_Zealand_W.reduce(function(a,b){
  return a+b;
},0);
al3=h31+h32+h33;
al3f=al3/Australia_and_New_Zealand_B.length;

h4=Middle_East_and_Northern_Africa_h.reduce(function(a,b){
  return a+b;
},0);
h4f=h4/Middle_East_and_Northern_Africa_h.length;
h41=Middle_East_and_Northern_Africa_B.reduce(function(a,b){
  return a+b;
},0);
h42=Middle_East_and_Northern_Africa_S.reduce(function(a,b){
  return a+b;
},0);
h43=Middle_East_and_Northern_Africa_W.reduce(function(a,b){
  return a+b;
},0);
al4=h41+h42+h43;
al4f=al4/Middle_East_and_Northern_Africa_B.length;

h5=Latin_America_and_Caribbean_h.reduce(function(a,b){
  return a+b;
},0);
h5f=h5/Latin_America_and_Caribbean_h.length;
h51=Latin_America_and_Caribbean_B.reduce(function(a,b){
  return a+b;
},0);
h52=Latin_America_and_Caribbean_S.reduce(function(a,b){
  return a+b;
},0);
h53=Latin_America_and_Caribbean_W.reduce(function(a,b){
  return a+b;
},0);
al5=h51+h52+h53;
al5f=al5/Latin_America_and_Caribbean_B.length;

h6=Southeastern_Asia_h.reduce(function(a,b){
  return a+b;
},0);
h6f=h6/Southeastern_Asia_h.length;
h61=Southeastern_Asia_B.reduce(function(a,b){
  return a+b;
},0);
h62=Southeastern_Asia_S.reduce(function(a,b){
  return a+b;
},0);
h63=Southeastern_Asia_W.reduce(function(a,b){
  return a+b;
},0);
al6=h61+h62+h63;
al6f=al6/Southeastern_Asia_B.length;

h7=Central_and_Eastern_Europe_h.reduce(function(a,b){
  return a+b;
},0);
h7f=h7/Central_and_Eastern_Europe_h.length;
h71=Central_and_Eastern_Europe_B.reduce(function(a,b){
  return a+b;
},0);
h72=Central_and_Eastern_Europe_S.reduce(function(a,b){
  return a+b;
},0);
h73=Central_and_Eastern_Europe_W.reduce(function(a,b){
  return a+b;
},0);
al7=h71+h72+h73;
al7f=al7/Central_and_Eastern_Europe_B.length;

h8=Eastern_Asia_h.reduce(function(a,b){
  return a+b;
},0);
h8f=h8/Eastern_Asia_h.length;
h81=Eastern_Asia_B.reduce(function(a,b){
  return a+b;
},0);
h82=Eastern_Asia_S.reduce(function(a,b){
  return a+b;
},0);
h83=Eastern_Asia_W.reduce(function(a,b){
  return a+b;
},0);
al8=h81+h82+h83;
al8f=al8/Eastern_Asia_B.length;

h9=Sub_Saharan_Africa_h.reduce(function(a,b){
  return a+b;
},0);
h9f=h9/Sub_Saharan_Africa_h.length;
h91=Sub_Saharan_Africa_B.reduce(function(a,b){
  return a+b;
},0);
h92=Sub_Saharan_Africa_S.reduce(function(a,b){
  return a+b;
},0);
h93=Sub_Saharan_Africa_W.reduce(function(a,b){
  return a+b;
},0);
al9=h91+h92+h93;
al9f=al9/Sub_Saharan_Africa_B.length;

worldh=(h1+h2+h3+h4+h5+h6+h7+h8+h9)/input.length;
//console.log(input.length);
worldal=(al1+al2+al3+al4+al5+al6+al7+al8+al9)/input.length;

region2=["World", "Australia_and_New_Zealand", "North_America", "Western_Europe", "Latin_America_and_Caribbean", "Southeastern_Asia", "Eastern_Asia", "Middle_East_and_Northern_Africa", "Central_and_Eastern_Europe", "Sub_Saharan_Africa"];

      var info=region2.filter(input => input===id);
    
      
      var demographicinfo=d3.select("#sample-metadata");
      demographicinfo.html("");
      Object.entries(info).forEach(([key,value]) =>{
//        console.log(key,value);
        if (id=="World"){
          demographicinfo.append("h5").text(value);
          demographicinfo.append("h7").text(" Average Happiness Score: "+worldh);
          demographicinfo.append("h5").text("                    ");
          demographicinfo.append("h7").text("Average Alcohol Per Capita: "+worldal);
        }

        else if (id=="Western_Europe"){
          demographicinfo.append("h5").text(value);
          demographicinfo.append("h7").text(" Average Happiness Score: "+h1f);
          demographicinfo.append("h5").text("                    ");
          demographicinfo.append("h7").text("Average Alcohol Per Capita: "+al1f);
        }

        else if (id=="North_America"){
          demographicinfo.append("h5").text(value);
          demographicinfo.append("h7").text(" Total Happiness Score: "+h2f);
          demographicinfo.append("h5").text("                    ");
          demographicinfo.append("h7").text("Total Alcohol Per Capita: "+al2f);
        }

        else if (id=="Australia_and_New_Zealand"){
          demographicinfo.append("h5").text(value);
          demographicinfo.append("h7").text(" Total Happiness Score: "+h3f);
          demographicinfo.append("h5").text("                    ");
          demographicinfo.append("h7").text("Total Alcohol Per Capita: "+al3f);
        }

        else if (id=="Middle_East_and_Northern_Africa"){
          demographicinfo.append("h5").text(value);
          demographicinfo.append("h7").text(" Total Happiness Score: "+h4f);
          demographicinfo.append("h5").text("                    ");
          demographicinfo.append("h7").text("Total Alcohol Per Capita: "+al4f);
        }

        else if (id=="Latin_America_and_Caribbean"){
          demographicinfo.append("h5").text(value);
          demographicinfo.append("h7").text(" Total Happiness Score: "+h5f);
          demographicinfo.append("h5").text("                    ");
          demographicinfo.append("h7").text("Total Alcohol Per Capita: "+al5f);
        }

        else if (id=="Southeastern_Asia"){
          demographicinfo.append("h5").text(value);
          demographicinfo.append("h7").text(" Total Happiness Score: "+h6f);
          demographicinfo.append("h5").text("                    ");
          demographicinfo.append("h7").text("Total Alcohol Per Capita: "+al6f);
        }

        else if (id=="Central_and_Eastern_Europe"){
          demographicinfo.append("h5").text(value);
          demographicinfo.append("h7").text(" Total Happiness Score: "+h7f);
          demographicinfo.append("h5").text("                    ");
          demographicinfo.append("h7").text("Total Alcohol Per Capita: "+al7f);
        }

        else if (id=="Eastern_Asia"){
          demographicinfo.append("h5").text(value);
          demographicinfo.append("h7").text(" Total Happiness Score: "+h8f);
          demographicinfo.append("h5").text("                    ");
          demographicinfo.append("h7").text("Total Alcohol Per Capita: "+al8f);
        }

        else {
          demographicinfo.append("h5").text(value);
          demographicinfo.append("h7").text(" Total Happiness Score: "+h9f);
          demographicinfo.append("h5").text("                    ");
          demographicinfo.append("h7").text("Total Alcohol Per Capita: "+al9f);
        }
      })
  }
  )
}

function init(){
  var button=d3.select("#selDataset");
  d3.csv("data/data.csv").then((data) =>{
    country=[];
    area=["World", "Australia_and_New_Zealand", "North_America", "Western_Europe", "Latin_America_and_Caribbean", "Southeastern_Asia", "Eastern_Asia", "Middle_East_and_Northern_Africa", "Central_and_Eastern_Europe", "Sub_Saharan_Africa"];
    for (var i=0;i<data.length;i++){
    country.push(data[i].Country);
    }  
      area.forEach(function(Region){
          button.append("option").text(Region).property("value");

      }
      )
      metadatainfo("World");
      draw("World");
  }
  )
}

function optionChanged(id){
  metadatainfo(id);
  draw(id);
}

//initiate the plots
init();


function draw(id){
d3.csv("data/data.csv").then((importdata) =>{
        

  var data=importdata;
//  var filter=data.samples.filter(input => input.id.toString()===id)[0];
//  var filter2=data.metadata.filter(input => input.id.toString()===id)[0];
  
//  var samplevalue=filter.sample_values.slice(0,10).reverse();
 
country=[];
hapiness=[];
Western_Europe=[];
Western_Europe_Beer=[];
Western_Europe_Spirit=[];
Western_Europe_Wine=[];
Western_Europe_name=[];
//Western_Europe_al=[];

North_America=[];
North_America_Beer=[];
North_America_Spirit=[];
North_America_Wine=[];
North_America_name=[];

Australia_and_New_Zealand=[];
Australia_and_New_Zealand_Beer=[];
Australia_and_New_Zealand_Spirit=[];
Australia_and_New_Zealand_Wine=[];
Australia_and_New_Zealand_name=[];

Middle_East_and_Northern_Africa=[];
Middle_East_and_Northern_Africa_Beer=[];
Middle_East_and_Northern_Africa_Spirit=[];
Middle_East_and_Northern_Africa_Wine=[];
Middle_East_and_Northern_Africa_name=[];

Latin_America_and_Caribbean=[];
Latin_America_and_Caribbean_Beer=[];
Latin_America_and_Caribbean_Spirit=[];
Latin_America_and_Caribbean_Wine=[];
Latin_America_and_Caribbean_name=[];

Southeastern_Asia=[];
Southeastern_Asia_Beer=[];
Southeastern_Asia_Spirit=[];
Southeastern_Asia_Wine=[];
Southeastern_Asia_name=[];

Central_and_Eastern_Europe=[];
Central_and_Eastern_Europe_Beer=[];
Central_and_Eastern_Europe_Spirit=[];
Central_and_Eastern_Europe_Wine=[];
Central_and_Eastern_Europe_name=[];

Eastern_Asia=[];
Eastern_Asia_Beer=[];
Eastern_Asia_Spirit=[];
Eastern_Asia_Wine=[];
Eastern_Asia_name=[];

Sub_Saharan_Africa=[];
Sub_Saharan_Africa_Beer=[];
Sub_Saharan_Africa_Spirit=[];
Sub_Saharan_Africa_Wine=[];
Sub_Saharan_Africa_name=[];


for (var i=0;i<importdata.length;i++){
country.push(importdata[i].Country)
hapiness.push(importdata[i].HappinessScore);
importdata[i].HappinessScore = + importdata[i].HappinessScore;
importdata[i].Beer_PerCapita = + importdata[i].Beer_PerCapita;
importdata[i].Spirit_PerCapita = + importdata[i].Spirit_PerCapita;
importdata[i].Wine_PerCapita = + importdata[i].Wine_PerCapita;

if(importdata[i].Region=="Western Europe"){
  Western_Europe.push(importdata[i].HappinessScore)
  Western_Europe_Beer.push(importdata[i].Beer_PerCapita)
  Western_Europe_Spirit.push(importdata[i].Spirit_PerCapita)
  Western_Europe_Wine.push(importdata[i].Wine_PerCapita)
  Western_Europe_name.push(importdata[i].Country)
//  Western_Europe_al.push(importdata[i].Beer_PerCapita);
}
else if(importdata[i].Region=="North America"){
  North_America.push(importdata[i].HappinessScore)
  North_America_Beer.push(importdata[i].Beer_PerCapita)
  North_America_Spirit.push(importdata[i].Spirit_PerCapita)
  North_America_Wine.push(importdata[i].Wine_PerCapita)
  North_America_name.push(importdata[i].Country)
}
else if(importdata[i].Region=="Australia and New Zealand"){
  Australia_and_New_Zealand.push(importdata[i].HappinessScore)
  Australia_and_New_Zealand_Beer.push(importdata[i].Beer_PerCapita)
  Australia_and_New_Zealand_Spirit.push(importdata[i].Spirit_PerCapita)
  Australia_and_New_Zealand_Wine.push(importdata[i].Wine_PerCapita)
  Australia_and_New_Zealand_name.push(importdata[i].Country)
}
else if(importdata[i].Region=="Middle East and Northern Africa"){
  Middle_East_and_Northern_Africa.push(importdata[i].HappinessScore)
  Middle_East_and_Northern_Africa_Beer.push(importdata[i].Beer_PerCapita)
  Middle_East_and_Northern_Africa_Spirit.push(importdata[i].Spirit_PerCapita)
  Middle_East_and_Northern_Africa_Wine.push(importdata[i].Wine_PerCapita)
  Middle_East_and_Northern_Africa_name.push(importdata[i].Country)
}
else if(importdata[i].Region=="Latin America and Caribbean"){
  Latin_America_and_Caribbean.push(importdata[i].HappinessScore)
  Latin_America_and_Caribbean_Beer.push(importdata[i].Beer_PerCapita)
  Latin_America_and_Caribbean_Spirit.push(importdata[i].Spirit_PerCapita)
  Latin_America_and_Caribbean_Wine.push(importdata[i].Wine_PerCapita)
  Latin_America_and_Caribbean_name.push(importdata[i].Country)
}
else if(importdata[i].Region=="Southeastern Asia"){
  Southeastern_Asia.push(importdata[i].HappinessScore)
  Southeastern_Asia_Beer.push(importdata[i].Beer_PerCapita)
  Southeastern_Asia_Spirit.push(importdata[i].Spirit_PerCapita)
  Southeastern_Asia_Wine.push(importdata[i].Wine_PerCapita)
  Southeastern_Asia_name.push(importdata[i].Country)
}
else if(importdata[i].Region=="Central and Eastern Europe"){
  Central_and_Eastern_Europe.push(importdata[i].HappinessScore)
  Central_and_Eastern_Europe_Beer.push(importdata[i].Beer_PerCapita)
  Central_and_Eastern_Europe_Spirit.push(importdata[i].Spirit_PerCapita)
  Central_and_Eastern_Europe_Wine.push(importdata[i].Wine_PerCapita)
  Central_and_Eastern_Europe_name.push(importdata[i].Country)
}
else if(importdata[i].Region=="Eastern Asia"){
  Eastern_Asia.push(importdata[i].HappinessScore)
  Eastern_Asia_Beer.push(importdata[i].Beer_PerCapita)
  Eastern_Asia_Spirit.push(importdata[i].Spirit_PerCapita)
  Eastern_Asia_Wine.push(importdata[i].Wine_PerCapita)
  Eastern_Asia_name.push(importdata[i].Country)
}
else {
  Sub_Saharan_Africa.push(importdata[i].HappinessScore)
  Sub_Saharan_Africa_Beer.push(importdata[i].Beer_PerCapita)
  Sub_Saharan_Africa_Spirit.push(importdata[i].Spirit_PerCapita)
  Sub_Saharan_Africa_Wine.push(importdata[i].Wine_PerCapita)
  Sub_Saharan_Africa_name.push(importdata[i].Country)
}
}  

region=[ "Australia_and_New_Zealand", "North_America", "Western_Europe", "Latin_America_and_Caribbean", "Southeastern_Asia", "Eastern_Asia", "Middle_East_and_Northern_Africa", "Central_and_Eastern_Europe", "Sub_Saharan_Africa"];

hapiness2=hapiness.slice(0,10).reverse();
hapiness3=hapiness.slice(-10)
hapiness4=[];
hapiness4.push(hapiness2);
hapiness4.push(hapiness3);

sum1=Western_Europe.reduce(function(a,b){
  return a+b;
},0);
sum12=Western_Europe_Beer.reduce(function(a,b){
  return a+b;
},0);
sum13=Western_Europe_Spirit.reduce(function(a,b){
  return a+b;
},0);
sum14=Western_Europe_Wine.reduce(function(a,b){
  return a+b;
},0);
alsum1=sum12+sum13+sum14;

sum2=North_America.reduce(function(a,b){
  return a+b;
},0);
sum22=North_America_Beer.reduce(function(a,b){
  return a+b;
},0);
sum23=North_America_Spirit.reduce(function(a,b){
  return a+b;
},0);
sum24=North_America_Wine.reduce(function(a,b){
  return a+b;
},0);
alsum2=sum22+sum23+sum24;

sum3=Australia_and_New_Zealand.reduce(function(a,b){
  return a+b;
},0);
sum32=Australia_and_New_Zealand_Beer.reduce(function(a,b){
  return a+b;
},0);
sum33=Australia_and_New_Zealand_Spirit.reduce(function(a,b){
  return a+b;
},0);
sum34=Australia_and_New_Zealand_Wine.reduce(function(a,b){
  return a+b;
},0);
alsum3=sum32+sum33+sum34;

sum4=Middle_East_and_Northern_Africa.reduce(function(a,b){
  return a+b;
},0);
sum42=Middle_East_and_Northern_Africa_Beer.reduce(function(a,b){
  return a+b;
},0);
sum43=Middle_East_and_Northern_Africa_Spirit.reduce(function(a,b){
  return a+b;
},0);
sum44=Middle_East_and_Northern_Africa_Wine.reduce(function(a,b){
  return a+b;
},0);
alsum4=sum42+sum43+sum44;

sum5=Latin_America_and_Caribbean.reduce(function(a,b){
  return a+b;
},0);
sum52=Latin_America_and_Caribbean_Beer.reduce(function(a,b){
  return a+b;
},0);
sum53=Latin_America_and_Caribbean_Spirit.reduce(function(a,b){
  return a+b;
},0);
sum54=Latin_America_and_Caribbean_Wine.reduce(function(a,b){
  return a+b;
},0);
alsum5=sum52+sum53+sum54;

sum6=Southeastern_Asia.reduce(function(a,b){
  return a+b;
},0);
sum62=Southeastern_Asia_Beer.reduce(function(a,b){
  return a+b;
},0);
sum63=Southeastern_Asia_Spirit.reduce(function(a,b){
  return a+b;
},0);
sum64=Southeastern_Asia_Wine.reduce(function(a,b){
  return a+b;
},0);
alsum6=sum62+sum63+sum64;

sum7=Central_and_Eastern_Europe.reduce(function(a,b){
  return a+b;
},0);
sum72=Central_and_Eastern_Europe_Beer.reduce(function(a,b){
  return a+b;
},0);
sum73=Central_and_Eastern_Europe_Spirit.reduce(function(a,b){
  return a+b;
},0);
sum74=Central_and_Eastern_Europe_Wine.reduce(function(a,b){
  return a+b;
},0);
alsum7=sum72+sum73+sum74;

sum8=Eastern_Asia.reduce(function(a,b){
  return a+b;
},0)
sum82=Eastern_Asia_Beer.reduce(function(a,b){
  return a+b;
},0);
sum83=Eastern_Asia_Spirit.reduce(function(a,b){
  return a+b;
},0);
sum84=Eastern_Asia_Wine.reduce(function(a,b){
  return a+b;
},0);
alsum8=sum82+sum83+sum84;

sum9=Sub_Saharan_Africa.reduce(function(a,b){
  return a+b;
},0)
sum92=Sub_Saharan_Africa_Beer.reduce(function(a,b){
  return a+b;
},0);
sum93=Sub_Saharan_Africa_Spirit.reduce(function(a,b){
  return a+b;
},0);
sum94=Sub_Saharan_Africa_Wine.reduce(function(a,b){
  return a+b;
},0);
alsum9=sum92+sum93+sum94;

average1=sum1/Western_Europe.length;
average2=sum2/North_America.length;
average3=sum3/Australia_and_New_Zealand.length;
average4=sum4/Middle_East_and_Northern_Africa.length;
average5=sum5/Latin_America_and_Caribbean.length;
average6=sum6/Southeastern_Asia.length;
average7=sum7/Central_and_Eastern_Europe.length;
average8=sum8/Eastern_Asia.length;
average9=sum9/Sub_Saharan_Africa.length;
average=[average3, average2, average1, average5, average6, average8, average4, average7, average9];
al=[alsum3, alsum2, alsum1, alsum5, alsum6, alsum8, alsum4, alsum1, alsum9]
//averagef=average.sort(function(a,b){return b-a});
//console.log(Western_Europe_Beer);
//  var otuids=filter.otu_ids.slice(0,10);
//  newotuids=otuids.map(ids =>"OTU" +ids)
//  var label=filter.otu_labels.slice(0,10);

Western_Europe_alcohol=Western_Europe_Beer.map(function(v,i){
  return v+Western_Europe_Spirit[i]+Western_Europe_Wine[i];
});
//console.log(alcohol);

North_America_alcohol=North_America_Beer.map(function(v,i){
  return v+North_America_Spirit[i]+North_America_Wine[i];
});

Australia_and_New_Zealand_alcohol=Australia_and_New_Zealand_Beer.map(function(v,i){
  return v+Australia_and_New_Zealand_Spirit[i]+Australia_and_New_Zealand_Wine[i];
});

Middle_East_and_Northern_Africa_alcohol=Middle_East_and_Northern_Africa_Beer.map(function(v,i){
  return v+Middle_East_and_Northern_Africa_Spirit[i]+Middle_East_and_Northern_Africa_Wine[i];
});

Latin_America_and_Caribbean_alcohol=Latin_America_and_Caribbean_Beer.map(function(v,i){
  return v+Latin_America_and_Caribbean_Spirit[i]+Latin_America_and_Caribbean_Wine[i];
});

Southeastern_Asia_alcohol=Southeastern_Asia_Beer.map(function(v,i){
  return v+Southeastern_Asia_Spirit[i]+Southeastern_Asia_Wine[i];
});

Central_and_Eastern_Europe_alcohol=Central_and_Eastern_Europe_Beer.map(function(v,i){
  return v+Central_and_Eastern_Europe_Spirit[i]+Central_and_Eastern_Europe_Wine[i];
});

Eastern_Asia_alcohol=Eastern_Asia_Beer.map(function(v,i){
  return v+Eastern_Asia_Spirit[i]+Eastern_Asia_Wine[i];
});

Sub_Saharan_Africa_alcohol=Sub_Saharan_Africa_Beer.map(function(v,i){
  return v+Sub_Saharan_Africa_Spirit[i]+Sub_Saharan_Africa_Wine[i];
});


if(id==="World"){
  var trace1={
      x:average,
      y:region,
//      text: label,
      type:"bar",
      orientation:"h"
  };

  var trace2={
    x:al,
    y:region,
//      text: label,
    type:"bar",
    orientation:"h"
};

  var chartdata=[trace1];

  var layout={
      title:"hapiness score",
  
  }

  var chartdata2=[trace2];

  var layout2={
      title:"alcohol",
  
  }

  Plotly.newPlot("bar",chartdata,layout);
  Plotly.newPlot("bar2",chartdata2,layout2);
}

else if(id==="Western_Europe"){
  var trace1={
      x:Western_Europe,
      y:Western_Europe_name,
//      text: label,
      type:"bar",
      orientation:"h"
  };

  var trace2={
    x:Western_Europe_alcohol,
    y:Western_Europe_name,
//      text: label,
    type:"bar",
    orientation:"h"
};

  var chartdata=[trace1];

  var layout={
      title:"hapiness score",
  
  }

  var chartdata2=[trace2];

  var layout2={
      title:"alcohol",
  
  }

  Plotly.newPlot("bar",chartdata,layout);
  Plotly.newPlot("bar2",chartdata2,layout2);
}

else if(id==="North_America"){
  var trace1={
      x:North_America,
      y:North_America_name,
//      text: label,
      type:"bar",
      orientation:"h"
  };

  var trace2={
    x:North_America_alcohol,
    y:North_America_name,
//      text: label,
    type:"bar",
    orientation:"h"
};

  var chartdata=[trace1];

  var layout={
      title:"hapiness score",
  
  }

  var chartdata2=[trace2];

  var layout2={
      title:"alcohol",
  
  }

  Plotly.newPlot("bar",chartdata,layout);
  Plotly.newPlot("bar2",chartdata2,layout2);
}

else if(id==="Australia_and_New_Zealand"){
  var trace1={
      x:Australia_and_New_Zealand,
      y:Australia_and_New_Zealand_name,
//      text: label,
      type:"bar",
      orientation:"h"
  };

  var trace2={
    x:Australia_and_New_Zealand_alcohol,
    y:Australia_and_New_Zealand_name,
//      text: label,
    type:"bar",
    orientation:"h"
};

  var chartdata=[trace1];

  var layout={
      title:"hapiness score",
  
  }

  var chartdata2=[trace2];

  var layout2={
      title:"alcohol",
  
  }

  Plotly.newPlot("bar",chartdata,layout);
  Plotly.newPlot("bar2",chartdata2,layout2);
}

else if(id==="Middle_East_and_Northern_Africa"){
  var trace1={
      x:Middle_East_and_Northern_Africa,
      y:Middle_East_and_Northern_Africa_name,
//      text: label,
      type:"bar",
      orientation:"h"
  };

  var trace2={
    x:Middle_East_and_Northern_Africa_alcohol,
    y:Middle_East_and_Northern_Africa_name,
//      text: label,
    type:"bar",
    orientation:"h"
};

  var chartdata=[trace1];

  var layout={
      title:"hapiness score",
  
  }

  var chartdata2=[trace2];

  var layout2={
      title:"alcohol",
  
  }

  Plotly.newPlot("bar",chartdata,layout);
  Plotly.newPlot("bar2",chartdata2,layout2);
}

else if(id==="Latin_America_and_Caribbean"){
  var trace1={
      x:Latin_America_and_Caribbean,
      y:Latin_America_and_Caribbean_name,
//      text: label,
      type:"bar",
      orientation:"h"
  };

  var trace2={
    x:Latin_America_and_Caribbean_alcohol,
    y:Latin_America_and_Caribbean_name,
//      text: label,
    type:"bar",
    orientation:"h"
};

  var chartdata=[trace1];

  var layout={
      title:"hapiness score",
  
  }

  var chartdata2=[trace2];

  var layout2={
      title:"alcohol",
  
  }

  Plotly.newPlot("bar",chartdata,layout);
  Plotly.newPlot("bar2",chartdata2,layout2);
}

else if(id==="Southeastern_Asia"){
  var trace1={
      x:Southeastern_Asia,
      y:Southeastern_Asia_name,
//      text: label,
      type:"bar",
      orientation:"h"
  };

  var trace2={
    x:Southeastern_Asia_alcohol,
    y:Southeastern_Asia_name,
//      text: label,
    type:"bar",
    orientation:"h"
};

  var chartdata=[trace1];

  var layout={
      title:"hapiness score",
  
  }

  var chartdata2=[trace2];

  var layout2={
      title:"alcohol",
  
  }

  Plotly.newPlot("bar",chartdata,layout);
  Plotly.newPlot("bar2",chartdata2,layout2);
}

else if(id==="Central_and_Eastern_Europe"){
  var trace1={
      x:Central_and_Eastern_Europe,
      y:Central_and_Eastern_Europe_name,
//      text: label,
      type:"bar",
      orientation:"h"
  };

  var trace2={
    x:Central_and_Eastern_Europe_alcohol,
    y:Central_and_Eastern_Europe_name,
//      text: label,
    type:"bar",
    orientation:"h"
};

  var chartdata=[trace1];

  var layout={
      title:"hapiness score",
  
  }

  var chartdata2=[trace2];

  var layout2={
      title:"alcohol",
  
  }

  Plotly.newPlot("bar",chartdata,layout);
  Plotly.newPlot("bar2",chartdata2,layout2);
}

else if(id==="Eastern_Asia"){
  var trace1={
      x:Eastern_Asia,
      y:Eastern_Asia_name,
//      text: label,
      type:"bar",
      orientation:"h"
  };

  var trace2={
    x:Eastern_Asia_alcohol,
    y:Eastern_Asia_name,
//      text: label,
    type:"bar",
    orientation:"h"
};

  var chartdata=[trace1];

  var layout={
      title:"hapiness score",
  
  }

  var chartdata2=[trace2];

  var layout2={
      title:"alcohol",
  
  }

  Plotly.newPlot("bar",chartdata,layout);
  Plotly.newPlot("bar2",chartdata2,layout2);
}

else {
  var trace1={
      x:Sub_Saharan_Africa,
      y:Sub_Saharan_Africa_name,
//      text: label,
      type:"bar",
      orientation:"h"
  };

  var trace2={
    x:Sub_Saharan_Africa_alcohol,
    y:Sub_Saharan_Africa_name,
//      text: label,
    type:"bar",
    orientation:"h"
};

  var chartdata=[trace1];

  var layout={
      title:"hapiness score",
  
  }

  var chartdata2=[trace2];

  var layout2={
      title:"alcohol",
  
  }

  Plotly.newPlot("bar",chartdata,layout);
  Plotly.newPlot("bar2",chartdata2,layout2);
}


if(id=="World"){
  var level = (sum1+sum2+sum3+sum4+sum5+sum6+sum7+sum8+sum9)/importdata.length;
  }
  else if(id=="Western_Europe"){
    var level = average1;
    }
  else if(id=="North America"){
    var level = average2;
    }
  else if(id=="Australia_and_New_Zealand"){
    var level = average3;
    }
  else if(id=="Middle_East_and_Northern_Africa"){
    var level = average4;
    }
  else if(id=="Latin_America_and_Caribbean"){
    var level = average5;
    }
  else if(id=="Southeastern_Asia"){
    var level = average6;
    }
  else if(id=="Central_and_Eastern_Europe"){
    var level = average7;
    }
  else if(id=="Eastern_Asia"){
    var level = average8;
    }
  else {
    var level = average9;
    }


var data = [
	{
		domain: { x: [0, 1], y: [0, 1] },
		value: level,
		title: { text: "Speed" },
		type: "indicator",
		mode: "gauge+number"
	}
];

var layout = { width: 600, height: 500, margin: { t: 0, b: 0 } };
Plotly.newPlot('gauge', data, layout);




})
}





/*       // Enter a value as the frequency of the input data
       var level = country.wfreq;
        
       // Trig to calc meter point
       var degrees = 180 - level*20,
           radius = .5;
       var radians = degrees * Math.PI / 180;
       var x = radius * Math.cos(radians);
       var y = radius * Math.sin(radians);
       
       // Path: may have to change to create a better triangle
       var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
           pathX = String(x),
           space = ' ',
           pathY = String(y),
           pathEnd = ' Z';
       var path = mainPath.concat(pathX,space,pathY,pathEnd);
       
       var data3 = [{ type: 'scatter',
           x: [0], y:[0],
           marker: {size: 28, color:'DB5F59'},
           showlegend: false,
           name: 'Washing Frequency',
           text: level,
           hoverinfo: 'text+name'},
           { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
           rotation: 90,
           text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
           textinfo: 'text',
           textposition:'inside',
           marker: {colors: ['rgba(0, 112, 17, 1)', 'rgba(0, 143, 21, 1)', 'rgba(0, 179, 27, 1)',
           'rgba(0, 219, 33, 1)', 'rgba(5, 255, 43, 1)', 'rgba(66, 255, 95, 1)', 
           'rgba(97, 255, 121, 1)', 'rgba(122, 255, 142, 1)', 'rgba(173, 255, 186, 1)', 
           'rgba(255, 255, 255, 0)']},
           labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
           hoverinfo: 'label',
           hole: .5,
           type: 'pie',
           showlegend: false
           }];
       
       var layout3 = {
           shapes:[{
               type: 'path',
               path: path,
               fillcolor: 'DB5F59',
               line: {
                   color: 'DB5F59'
                     }
                   }],
               title: {
                   text:'Belly Button Weekly Washing Frequency'.bold()

                       }, 
               
               xaxis: {zeroline:false, showticklabels:false,
                            showgrid: false, range: [-1, 1]},
               yaxis: {zeroline:false, showticklabels:false,
                            showgrid: false, range: [-1, 1]}
               };
       
       //plot gauge plot
       Plotly.newPlot('gauge', data3, layout3);*/