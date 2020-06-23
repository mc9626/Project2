// from data.js
// var tableData = data;

// YOUR CODE HERE!
var tbody = d3.select("tbody");
// YOUR CODE HERE!
console.log(data);

data.forEach(function(aliensreport) {
    console.log(aliensreport);
    var row = tbody.append("tr");
    Object.entries(aliensreport).forEach(function([key, value]) {
        console.log(key, value);

        var cell = row.append("td");
        cell.text(value);
    });
});

data.forEach(aliensreport => {
    var row = tbody.append("tr");
    row.append ("td").text(aliensreport.datetime);
    row.append ("td").text(aliensreport.city);
    row.append ("td").text(aliensreport.state);
    row.append ("td").text(aliensreport.country);
    row.append ("td").text(aliensreport.shape);
    row.append ("td").text(aliensreport.durationMinutes);
    row.append ("td").text(aliensreport.comments);
}) 

var dateInputText = d3.select("#datetime")
var button = d3.select("filter-btn")

// filter data with date that the user inputs
function clickSelect(){
    //don't refresh the page!
    d3.event.preventDefault();
    //print the value that was input
    console.log(dateInputText.property("value"));
    //create a new table showing only the filterd data
    var filteredData = data.filter(sighting => sighting.datetime===dateInputText.property("value"))
    //display the new table
    displayData(filteredData);
}

// event listener to handle change and click
dateInputText.on("change", clickSelect)

// var button = d3.select("#filter-btn");

// var inputfield =d3.select("#datetime");

// function handleClick() {
//     console.log("filter button clicked");
//     console.log(d3.event.target);
// }

// inputfield.on("field",function() {
//     var newText =d3.event.target.value;
//     console.log(newText);
// })

// inputfield.on("change",handleClick)

// d3.event.preventDefault();