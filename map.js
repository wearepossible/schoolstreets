// Access token
mapboxgl.accessToken = 'pk.eyJ1Ijoid2VhcmVwb3NzaWJsZSIsImEiOiJja2tncjNkdGMxODJ3MnBxdWllMXhncDV2In0.ud6gHlMUoxsJS5yDPdXtaA';

const urlprefix = window.location.href;

// HTML for map popup
const yesHTML = "<p id='yesSSText'>This school has a school street!</p><p><a href='https://action.wearepossible.org/page/112036/action/1' target='_blank'>Write to your councillor</a> to show your support for more school streets across the city.</p>"

let noHTML = "<p id='noSST ext'>This school lacks a school street.</p><p><a href='https://action.wearepossible.org/page/112036/action/1' target='_blank'>Write to your councillor</a> to request one and show your support for more school streets across the city.</p>"

let popup

// Set up the map
var map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/wearepossible/cl1xb2z7t001c14mqiv8hdzjp', // style URL
    center: [-1.88, 52.48], // starting position [lng, lat]
    zoom: 11 // starting zoom
});

// Add navigation controls on map
map.addControl(new mapboxgl.NavigationControl());

// Fly to different cities
const gotoBirmingham = () => map.flyTo({ center: [-1.88, 52.48], zoom: 11 });
const gotoLeeds = () => map.flyTo({ center: [-1.55, 53.80], zoom: 11 });
const gotoBristol = () => map.flyTo({ center: [-2.59, 51.45], zoom: 11 });

// Create a function that executes when the button is clicked
const locApprove = () => {

    // Get the user's actual latitude and longitude
    navigator.geolocation.getCurrentPosition(function (position, html5Error) {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;

        // Move the world map to your location
        map.flyTo({ center: [userLon, userLat], zoom: 15 });

    });
};

// Create variables to hold the details of the location
let locID, loc, locLat, locLng;

// Check if there's a hash in the URL
if (window.location.hash) {

    // Hash exists
    const hash = window.location.hash.substring(1) // Chop off the #

    // Check that it matches the right format for lat/lon
    if (llRegEx.test(hash)) {

        // Assign to locLat and locLng
        locLat = hash.split(",")[0]
        locLng = hash.split(",")[1]

        // Define a new point
        loc = draw.add({
            id: locID,
            type: 'Feature',
            properties: {},
            geometry: { type: 'Point', coordinates: [locLng, locLat] }
        });

        // Save its ID
        locID = loc[0];

        // Zoom to location
        map.flyTo({ center: [locLng, locLat], zoom: 16 });

    } else {
        // log an error
        console.log("Hash is not a valid lat/lon pair")
    }
}

// Click to place a parklet
map.on('click', 'schoolstreets', function (e) {
});

map.on('click', 'schoolstreets', (e) => {
    // Copy coordinates array.
    const coordinates = e.features[0].geometry.coordinates.slice();
    const name = e.features[0].properties["name"];
    const ss_status = e.features[0].properties["schoolstreet"]

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    noHTML = `<p id='noSSText'>This school lacks a school street.</p><p><a href='https://action.wearepossible.org/page/111513/action/1?supporter.questions.1365176=${name}' target='_blank'>Write to your councillor</a> to request one and show your support for more school streets across the city.</p>`

    // Figure out if it has a school street
    const ss = ss_status ? yesHTML : noHTML

    const html = `<div class="popup">
    <h3>${name}</h3>
    ${ss}
    </div>`

    // Zoom to location
    map.flyTo({ center: coordinates });

    popup = new mapboxgl.Popup({ offset: 20, maxWidth: '340px', anchor: 'bottom' })
        .setLngLat(coordinates)
        .setHTML(html)
        .addTo(map);
});

// Change the cursor to a pointer when the mouse is over the places layer.
map.on('mouseenter', 'schoolstreets', function () {
    map.getCanvas().style.cursor = 'pointer';
});

// Change it back to a pointer when it leaves.
map.on('mouseleave', 'schoolstreets', function () {
    map.getCanvas().style.cursor = '';
});

// This runs when the copy button is clicked (mousedown)
function copyURL() {
    navigator.clipboard.writeText(document.getElementById("urlboxmap").value);
    document.getElementById("copybutton").style.fontWeight = 800;
}

// This runs when the copy button is unclicked (mouseup)
function unbold() {
    document.getElementById("copybutton").style.fontWeight = 400;
}