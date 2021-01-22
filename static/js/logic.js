// Store our API endpoint inside queryUrl
var Url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Perform a GET request to the query URL
d3.json(Url, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
  });

  function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3> Location: " + feature.properties.place +
        "</h3><hr><p> Date/Time: " + new Date(feature.properties.time) + "</p><p> Magnitude: " + feature.properties.mag + "</p>");
    }
  
    // create a circle radius based on the magnitude by creating a function
    function radiusSize(magnitude) {
      return magnitude * 15000;
    }
  
    // Define function to set the circle color based on the depth
    function circleColor(depth) {
      if (depth < 10) {
        return "#00ffff"
      }
      else if (depth < 30) {
        return "#80ff00"
      }
      else if (depth < 50) {
        return "#ffff00"
      }
      else if (depth < 70) {
        return "#ffbf00"
      }
      else if (depth < 90) {
        return "#ff4000"
      }
      else {
        return "#ff0000"
      }
    }
  
    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
      pointToLayer: function(earthquakeData, latlng) {
        return L.circle(latlng, {
          radius: radiusSize(earthquakeData.properties.mag),
          color: "black",
          stroke: "1",
          fillColor: circleColor(earthquakeData.geometry.coordinates[2]),
          fillOpacity: 1
        });
      },
      onEachFeature: onEachFeature
    });
  
    // adding our earthquakes layer to the createMap function
    createMap(earthquakes);
  }
  
  function createMap(earthquakes) {
  
    // Define streetmap, satellite map and darkmap layers
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
      });
    
    
    
    
    var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.satellite",
      accessToken: API_KEY
    });
  
    

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
    });

    // a baseMap is defined here to hold our base layers
    var baseMaps = {
        "Street Map": streetmap,
        "Satellite Map": satellitemap,
        "Dark Map": darkmap
    };

  // Creating an overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes,
    };

    // Creating our map which displays the streetmap and earthquakes layers 
    var myMap = L.map("map", {
        center: [25, -70],
        zoom: 5,
        layers: [streetmap, earthquakes]
    });
  
    // Create a layer control and pass it in our baseMaps and overlayMaps
    // Add the layer control to the map
     L.control.layers(baseMaps, overlayMaps, {
         collapsed: false
     }).addTo(myMap);

    // color function to be used when creating the legend
    function getColor(d) {
        return d > 90 ? '#ff0000' :
           d > 70  ? '#ff4000' :
           d > 50  ? '#ffbf00' :
           d > 30  ? '#ffff00' :
           d > 10  ? '#80ff00' :
                    '#00ffff';
    }
    // Add legend to the map
    var legend = L.control({position: 'bottomright'});
  
    legend.onAdd = function (map) {
  
      var div = L.DomUtil.create('div', 'info-legend'),
          depths = [-10, 10, 30, 50, 70, 90],
          labels = [];
  
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < depths.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(depths[i] + 1) + '">&nbsp&nbsp&nbsp&nbsp</i> ' +
            depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
      }
  
      return div;
    };
legend.addTo(myMap)
}