//////////////////////////////////////////////////////////////////////////////////////////////////
//
//  This script visualizes all earthquake events over the magnitude of 2.5 over the previous week
//   
//  The popups on the circles show more information of each event
//
//////////////////////////////////////////////////////////////////////////////////////////////////

// Define the url for the GeoJSON earthquake data
let earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson";

// Create the map
let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 4
});

// Add "street" tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Retrieve and add the earthquake data to the map
d3.json(earthquakeUrl).then(function (data) {
    //console.log(data.features.length)

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
            }
            );
        },

        // Activate pop-up data when circles are clicked
        // The popup shows location description, magnitude, depth, and date/time
        onEachFeature: function (feature, layer) {
            layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><h4>Magnitude: 
            ${feature.properties.mag}</h4><h4>Depth: 
            ${feature.geometry.coordinates[2]} km</h4><hr><p>${new Date(feature.properties.time)}</p>`);

        }
    }).addTo(myMap);


    // Build out the legend
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
        });
        return div;
    };

    legend.addTo(myMap);

});