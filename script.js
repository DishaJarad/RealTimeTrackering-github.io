// Initialize the Leaflet map
const map = L.map('map').setView([28.7041, 77.1025], 13); // Initial center: Delhi
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

// Custom icons for source and destination
const sourceIcon = L.icon({
  iconUrl: 'images/bike.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const destinationIcon = L.icon({
  iconUrl: 'images/flag.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Destination coordinates (Example)
const destinationCoords = [18.530823, 73.847466]; // Example destination
const destinationMarker = L.marker(destinationCoords, { icon: destinationIcon }).addTo(map).bindPopup('Destination');

// Initialize source marker (will update later with live GPS)
let sourceMarker = null;

// Routing control
let routeControl = null;

// Function to set up routing
function setupRouting(startCoords, endCoords) {
  if (routeControl) {
    map.removeControl(routeControl); // Remove the previous route
  }

  routeControl = L.Routing.control({
    waypoints: [
      L.latLng(startCoords[0], startCoords[1]),
      L.latLng(endCoords[0], endCoords[1]),
    ],
    lineOptions: {
      styles: [{ color: 'blue', opacity: 1, weight: 5 }], // Path color
    },
    createMarker: () => null, // Do not add default markers for waypoints
    routeWhileDragging: false,
    showAlternatives: false,
    router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
    show: false, // Disable the route instructions panel
  }).addTo(map);
}

// Update the source marker's position and recalculate the route
function updateSourcePosition(currentCoords) {
  if (!sourceMarker) {
    // Initialize source marker at the first GPS coordinates
    sourceMarker = L.marker(currentCoords, { icon: sourceIcon }).addTo(map).bindPopup('You');
    map.setView(currentCoords); // Center the map on user's location
  } else {
    sourceMarker.setLatLng(currentCoords); // Update marker position
  }

  // Recalculate the route to the destination
  setupRouting(currentCoords, destinationCoords);

  // Check if the source is near the destination
  const distanceToDestination = map.distance(currentCoords, destinationCoords);
  if (distanceToDestination <= 10) {
    console.log('You have reached your destination!');
    sourceMarker.bindPopup('Destination reached!').openPopup();
  }
}

// Fetch live GPS coordinates using the Geolocation API
if ('geolocation' in navigator) {
  navigator.geolocation.watchPosition(
    (position) => {
      const currentCoords = [position.coords.latitude, position.coords.longitude];
      console.log('Current Location:', currentCoords);
      updateSourcePosition(currentCoords); // Update the source position and recalculate route
    },
    (error) => {
      console.error('Error fetching location:', error);
      alert('Unable to retrieve your location. Please check your device settings.');
    },
    {
      enableHighAccuracy: true, // Use GPS for accurate location
      maximumAge: 0, // Do not use cached position
      timeout: 10000 // Timeout after 10 seconds if no position is available
    }
  );
} else {
  alert('Geolocation is not supported by your browser.');
}
