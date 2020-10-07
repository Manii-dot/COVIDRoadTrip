// VARIABLES

var hasStart = false;
var start = "";
var routeData = "";

var googleAPIKEY = "AIzaSyAGcHIXpsKnSTicnC-IV0jrSRib9aUQ0ys";
var mapID = "e3babd9703ebde3a"

// ==========================================================================================================================
// MAP INITIALIZATION

mapboxgl.accessToken = 'pk.eyJ1IjoiY2hyaXN0aW5ha2VyciIsImEiOiJja2Z5NWhpY3EwNjE5MzRwajZmb3NzOHl2In0.spaOh4Gw5ZoKnJ0P9RpaUA';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v10',
    center: [-96, 39], // starting position
    zoom: 4
});
var canvas = map.getCanvasContainer();
map.addControl(new mapboxgl.NavigationControl());


// ==========================================================================================================================
// FUNCTIONS


function getRoute(end, start) { // Request directions from mapbox
    console.log(end, start);

    var url = 'https://api.mapbox.com/directions/v5/mapbox/driving-traffic/' + start[0] + ',' + start[1] + ';' + end[0] + ',' + end[1] + '?steps=true&geometries=geojson&access_token=' + mapboxgl.accessToken;
    console.log(url);

    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onload = function (response) {
        routeData = JSON.parse(req.response);
        var data = routeData.routes[0];
        var route = data.geometry.coordinates;
        var geojson = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: route
            }
        };
        console.log(routeData.routes[0].geometry.coordinates);             /// Coordinates of different points along the route!! You'll need this later!!!
        // if the route already exists on the map, reset it using setData
        if (map.getSource('route')) {
            map.getSource('route').setData(geojson);
        } else { // otherwise, make a new request
            map.addLayer({
                id: 'route',
                type: 'line',
                source: {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'LineString',
                            coordinates: geojson
                        }
                    }
                },
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#3887be',
                    'line-width': 5,
                    'line-opacity': 0.75
                }
            });
            map.getSource('route').setData(geojson);
        }
    };
    req.send();
    
}

function getCountyName(lat, lon) {
    var googleURL = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lon + "&key=" + googleAPIKEY;

    $.ajax({
        method: "GET",
        url: googleURL
    }).then(function(response){
        var county = response.results[0].address_components[4].long_name;
        console.log(response);
        console.log(county);
    })
}


// ==========================================================================================================================
// EVENT LISTENERS ETC

map.on('load', function () {

    getCountyName(40.714224, -73.961452)

    map.on("click", function (e) { // Event handler for clicking on the map

        if (hasStart === false) { // If a start location hasn't been selected yet, choose start
            hasStart = true;
            var startCoords = e.lngLat;
            canvas.style.cursor = '';
            start = Object.keys(startCoords).map(function (key) {
                return startCoords[key];
            });

            // Add starting point to the map
            map.addLayer({
                id: 'start',
                type: 'circle',
                source: {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: [{
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'Point',
                                coordinates: start
                            }
                        }
                        ]
                    }
                },
                paint: {
                    'circle-radius': 10,
                    'circle-color': '#3887be'
                }
            })
        } else if (hasStart === true){ // If there is a start location, choose the end location.
            var coordsObj = e.lngLat;
            canvas.style.cursor = '';
            var coords = Object.keys(coordsObj).map(function (key) {
                return coordsObj[key];
            });
            var end = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'Point',
                        coordinates: coords
                    }
                }
                ]
            };
            if (map.getLayer('end')) {
                map.getSource('end').setData(end);
            } else {
                map.addLayer({ // Add ending point to map
                    id: 'end',
                    type: 'circle',
                    source: {
                        type: 'geojson',
                        data: {
                            type: 'FeatureCollection',
                            features: [{
                                type: 'Feature',
                                properties: {},
                                geometry: {
                                    type: 'Point',
                                    coordinates: coords
                                }
                            }]
                        }
                    },
                    paint: {
                        'circle-radius': 10,
                        'circle-color': '#f30'
                    }
                });
            }
            getRoute(coords, start);
            //console.log(coords, start);
        }
    });

})

