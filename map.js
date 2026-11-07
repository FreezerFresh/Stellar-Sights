var map = document.getElementById("exoplanet-map");

//Function for multiple images for each exoplanet
function getExoplanetImage(planetName) {
    // Assuming images are stored in a folder named 'exo_image' and named after the planet
    var planetImage = {
        '55 Cnc e' : 'exo_image/55_Cnc_e.jpg',
        'GJ 1214 b' : 'exo_image/GJ_1214_b.png',
        'GJ 436 b' : 'exo_image/GJ_436_b.jpg',
        'HAT-P-1 b' : 'exo_image/HAT-P-1_b.jpg',
        'HAT-P-12 b' : 'exo_image/HAT-P-12_b.jpg',
        'HAT-P-13 b' : 'exo_image/HAT-P-13_b.png',
        'HAT-P-14 b' : 'exo_image/HAT-P-14_b.png',
        'HAT-P-17 b' : 'exo_image/HAT-P-17_b.png',
        "HAT-P-18 b" : 'exo_image/HAT-P-18_b.png',
        'HAT-P-26 b' : 'exo_image/HAT-P-26_b.jpg',
        'HAT-P-30 b' : 'exo_image/HAT-P-30_b.png',
        'HAT-P-32 b' : 'exo_image/HAT-P-32_b.png',
        'HD 149026 b' : 'exo_image/HD_149026_b.png',
        'HD 189733 b' : 'exo_image/HD_189733_b.jpeg',
        'HD 209458 b' : 'exo_image/HD_209458_b.png',
        'HD 80606 b' : 'exo_image/HD_80606_b.png',
        'TrES-4 b' : 'exo_image/TrES-4_b.png',
        'WASP-12 b' : 'exo_image/WASP-12_b.png',
        'WASP-15 b' : 'exo_image/WASP-15_b.png',
        'WASP-17 b' : 'exo_image/WASP-17_b.jpg',
    }
    return planetImage[planetName] || 'exo_image/default.jpg'; // Return default image if not found
}

// Map dimensions
var mapWidth = 800;
var mapHeight = 500;

// Create vertical grid lines
for (var x = 0; x <= mapWidth; x += 50) {
  var line = document.createElementNS("http://www.w3.org/2000/svg", "line");

  line.setAttribute("x1", x);
  line.setAttribute("y1", 0);
  line.setAttribute("x2", x);
  line.setAttribute("y2", mapHeight);

  line.setAttribute("class", "grid-line");

  map.appendChild(line);
}

// Create horizontal grid lines
for (var y = 0; y <= mapHeight; y += 50) {
  var line = document.createElementNS("http://www.w3.org/2000/svg", "line");

  line.setAttribute("x1", 0);
  line.setAttribute("y1", y);
  line.setAttribute("x2", mapWidth);
  line.setAttribute("y2", y);

  line.setAttribute("class", "grid-line");

  map.appendChild(line);
}

// Create the Solar System marker
var solarSystem = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "circle",
);

// Set the center position
solarSystem.setAttribute("cx", 400);
solarSystem.setAttribute("cy", 250);

// Set the size
solarSystem.setAttribute("r", 10);

// Give it a class for CSS styling
solarSystem.setAttribute("class", "solar-system");

// Add it to the map
map.appendChild(solarSystem);

// Clear planet details when Solar System is clicked
solarSystem.addEventListener("click", function() {
    var infoPanel = document.getElementById("planet-info");

    infoPanel.innerHTML =
        "<h2>Select an Exoplanet</h2>" +
        "<p>Click a planet marker to see its information.</p>";
});

// Create a label for the Solar System
var solarLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");

solarLabel.setAttribute("x", 415);
solarLabel.setAttribute("y", 255);
solarLabel.setAttribute("class", "map-label");
solarLabel.textContent = "Solar System";

map.appendChild(solarLabel);

// Load the exoplanet CSV file
fetch("data/exoplanets.csv")
  .then(function (response) {
    if (!response.ok) {
      throw new Error("Could not load exoplanet CSV");
    }

    return response.text();
  })
  .then(function (data) {
    // Split CSV into individual lines
    var rows = data.trim().split(/\r?\n/);

    // Get the CSV column names
    var headers = rows[0].replace(/^\uFEFF/, "").split(",");

    // Find the positions of the columns we need
    var nameIndex = headers.indexOf("pl_name");
    var raIndex = headers.indexOf("ra");
    var decIndex = headers.indexOf("dec");

    var planetCount = 0;

    // Start at row 1 because row 0 contains headers
    for (var i = 1; i < rows.length; i++) {
      var values = rows[i].split(",");

      var planetName = values[nameIndex];
      var ra = parseFloat(values[raIndex]);
      var dec = parseFloat(values[decIndex]);

      // Skip records with missing coordinates
      if (!planetName || isNaN(ra) || isNaN(dec)) {
        continue;
      }

      // Convert RA and Dec into map positions
      var x = (ra / 360) * 800;
      var y = ((90 - dec) / 180) * 500;

      // Create the planet marker
      var planetDot = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );

      planetDot.setAttribute("cx", x);
      planetDot.setAttribute("cy", y);
      planetDot.setAttribute("r", 5);
      planetDot.setAttribute("class", "exoplanet-dot");

      let selectedPlanet = {
        name: planetName,
        hostname: values[headers.indexOf("hostname")],
        ra: ra,
        dec: dec,
        orbitalPeriod: values[headers.indexOf("pl_orbper")],
      };

      planetDot.addEventListener("click", function () {
        // Find the information panel
        var infoPanel = document.getElementById("planet-info");

        // Display the selected planet's information

var imagePath = getExoplanetImage(selectedPlanet.name);

infoPanel.innerHTML =
    "<h2>" + selectedPlanet.name + "</h2>" +
    '<img src="' + imagePath + '" alt="' +
    selectedPlanet.name + '" class="planet-image">' +
    "<p>Host Star: " + selectedPlanet.hostname + "</p>" +
    "<p>Right Ascension: " + selectedPlanet.ra + "</p>" +
    "<p>Declination: " + selectedPlanet.dec + "</p>" +
    "<p>Orbital Period: " +
    selectedPlanet.orbitalPeriod + " days</p>";

      });

      // Add the planet name as a tooltip
      var tooltip = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "title",
      );

      tooltip.textContent = planetName;
      planetDot.appendChild(tooltip);

      // Add the marker to the map
      map.appendChild(planetDot);

      planetCount++;
    }

    document.getElementById("map-status").textContent =
      planetCount + " exoplanets displayed on the map.";
  })
  .catch(function (error) {
    document.getElementById("map-status").textContent =
      "Error loading exoplanets: " + error.message;

    console.log(error);
  });

  
// Get the expand button
var expandButton = document.getElementById("expand-map");

// Expand the map when clicked
expandButton.addEventListener("click", function() {

    var mapContainer = document.getElementById("map-container");

    if (!document.fullscreenElement) {

        mapContainer.requestFullscreen();

    } else {

        document.exitFullscreen();

    }

});

// Update button text when fullscreen changes
document.addEventListener("fullscreenchange", function() {

    if (document.fullscreenElement) {
        expandButton.textContent = "Exit Full Screen";
    } else {
        expandButton.textContent = "Enlarge Map";
    }

});