  var myMap = L.map("map", {
    center: [0,0],
    zoom: 2
});

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: API_KEY
    }).addTo(myMap);

var link = 'fullDATA.geo.json';

var locations = {
  type: 'FeatureCollection',
  features: []
}

function style(feature) {
  return {
    color: "white",
    fillColor: "blue",
    fillOpacity: 0.5,
    weight: 1.5
  };
}

function onEachFeature(feature, layer) {
  layer.bindPopup("<h3>" + feature.properties.place +
    "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
}

d3.json(link).then(response => {

  //console.log(response);
  
  locations.features = response.features.filter(d => d.geometry.coordinates.length ? true : false)
    //console.log(locations)
  /* newLocations = locations.map(geo => {
      for (let i = 0; i < csvData.length; i++)j {
        if(geo.properties.Country === csvData[i].Country) {
          geo.properties = 
        }
      }

      })
    }) */
    L.geoJson(locations, {
        style: style,
        //onEachFeature: onEachFeature
      }).addTo(myMap);

    createBarPlot(locations.features)

}).catch(error => console.error(error));

function createBarPlot(features) {
  console.log(`called createBar: ${features.length}`)
}