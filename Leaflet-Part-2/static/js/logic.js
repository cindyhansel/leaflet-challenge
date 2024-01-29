//////////////////////////////////////////////////////////////////////////////////////////////////
//
//  This script visualizes all earthquake events over the magnitude of 2.5 over the previous week
//  It also shows the boundaries of tectonic plates to visualize the correlation of the two datasets
//
//  The popups on the circles show more information of each event
//  The legend corresponds to the depths of the earthquake events
//
//////////////////////////////////////////////////////////////////////////////////////////////////

// Define the url for the GeoJSON earthquake data
let earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson";
let tectonicPlateUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

let earthquakes = L.layerGroup();
let tectonicPlates = L.layerGroup();

// Add "streetMap" tile layer to the map
let streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Add "topo" tile layer to the map
let topoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
let baseMaps = {
    "Street Map": streetMap,
    "Topographic Map": topoMap
  };

// Create the map which includes the layers
let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 4,
    layers: [topoMap, earthquakes]
});
  
// Retrieve and add the earthquake data to the map
d3.json(earthquakeUrl).then(function (data) {

    function determineColor(depth) {
        switch (true) {
            case depth >= 90:
                return "red";
            case depth >= 70:
                return "orangered";
            case depth >= 50:
                return "orange";
            case depth >= 30:
                return "gold";
            case depth >= 10:
                return "yellow";
            default:
                return "lightgreen";
        }
    }

    // Create points, or circles, to the map; add the popup 
    L.geoJson(data, {

        pointToLayer: function (feature, location) {
            // radius uses the magnitude of the event, 
            // fillColor calls a function using the depth of the event - the third element of geometry.coordinate
            return L.circleMarker(location, {
                radius: (feature.properties.mag * 4),
                opacity: 1,
                color: "gray",
                weight: 0.6,
                fillOpacity: 0.6,
                fillColor: determineColor(feature.geometry.coordinates[2])
            });
        },
        
        // Activate pop-up data when circles are clicked
        // The popup shows location description, magnitude, depth, and date/time
        onEachFeature: function (feature, layer) {
            layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><h4>Magnitude: 
            ${feature.properties.mag}</h4><h4>Depth: 
            ${feature.geometry.coordinates[2]} km</h4><hr><p>${new Date(feature.properties.time)}</p>`);
        }
    }).addTo(earthquakes);
    earthquakes.addTo(myMap);

    // Build out the legend for earthquake depths
    let legend = L.control({ position: "bottomright" });

    legend.onAdd = function(feature) {
        let div = L.DomUtil.create("div", "info legend");
        // Create bins for the determineColor function and labels to coordinate
        let depthBins = [-10, 10, 30, 50, 70, 90];
        let labels = ["-10-10", "10-30", "30-50", "50-70", "70-90", "90+"];
        // Title for the legend
        div.innerHTML += "<h4>Depths, in km</h4>";
        // Loop through the bins to create the colors and show the labels
        depthBins.forEach((range, i) => {
            div.innerHTML += `<i style="background: ${determineColor(range)}"></i><span>${labels[i]}</span><br>`;
        })
        return div;
    };
    legend.addTo(myMap);
});

// Retrieve and add the tectronicPlate data to the map
d3.json(tectonicPlateUrl).then(function (data) {
    
     L.geoJson(data, {
        color: "orange",
        opacity: 1,
        weight: 2
    }).addTo(tectonicPlates);
    tectonicPlates.addTo(myMap); 
});
    
// Create an overlay object to hold our overlay.
let overlayMaps = {
    Earthquakes: earthquakes,
    TectonicPlates: tectonicPlates
  };

// Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  

