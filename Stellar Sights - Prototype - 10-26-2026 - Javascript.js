
let catalog = [];
function loadCatalog() {
fetch('data/exoplanets.csv')
    .then(response => response.text())
    .then(data => {
        // Parse CSV data
        let lines = data.trim().split(/\r?\n/);
        let headers = lines[0].split(',').map(header => header.trim());
        for (let i = 1; i < lines.length; i++) {
            let values = lines[i].split(',').map(value => value.trim());
            if (values.length === headers.length) {
                let planet = {};
                for (let j = 0; j < headers.length; j++) {
                    planet[headers[j]] = values[j];
                }

                planet.raNum = parseFloat(planet.ra);
                planet.decNum = parseFloat(planet.dec);

                catalog.push(planet);
            }
        }
        document.getElementById('status').textContent = 'Catalog ready: ' + catalog.length + ' exoplanets';
    })
    .catch(error => {
        document.getElementById('status').textContent = 'Error loading catalog.';
    });
}

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

// Function to search for planets 
/*
function searchExoplanets(query) {
    var results = [];
    
    if (query == '' || query == null) {
        return results;
    }
    
    var searchTerm = query.toLowerCase();
    
    for (var i = 0; i < catalog.length; i++) {
        var planet = catalog[i];
        var planetName = planet.planetName.toLowerCase();
        var hostStar = planet.hostStar.toLowerCase();
        
        if (planetName.indexOf(searchTerm) != -1 || hostStar.indexOf(searchTerm) != -1) {
            results.push(planet);
        }
    }
    
    return results;
}
*/

//Function to search for planets updated to use the new catalog data structure
function searchExoplanets(query) {
    var results = [];
    if (query == '' || query == null) {
        return results;
    }

    var searchTerm = query.toLowerCase().trim();

    for (var i = 0; i < catalog.length; i++) {
        var planet = catalog[i];
        var planetName = planet.pl_name.toLowerCase();
        var hostStar = planet.hostname.toLowerCase();

        if (planetName.indexOf(searchTerm) != -1 || hostStar.indexOf(searchTerm) != -1) {
            results.push(planet);
        }
    }

    return results;
}

// ========== ADDED coordinates search ==========

function searchByCoordinates(raStr, decStr, threshold) {
    threshold = threshold || 2; // default ±2 degrees
    var results = [];
    var ra = parseFloat(String(raStr).replace(/[^0-9.\-]/g, ''));
    var dec = parseFloat(String(decStr).replace(/[^0-9.\-]/g, ''));

    if (isNaN(ra) || isNaN(dec)) {
        return { error: 'invalid', results: [] };
    }
    if (ra < 0 || ra > 360 || dec < -90 || dec > 90) {
        return { error: 'out-of-range', results: [] };
    }

    for (var i = 0; i < catalog.length; i++) {
        var planet = catalog[i];
        if (isNaN(planet.raNum) || isNaN(planet.decNum)) continue;

        var dRa = Math.abs(planet.raNum - ra);
        if (dRa > 180) dRa = 360 - dRa; // wrap around
        var dDec = Math.abs(planet.decNum - dec);
        var dist = Math.sqrt(dRa * dRa + dDec * dDec);

        if (dist <= threshold) {
            results.push(planet);
        }
    }

    results.sort(function (a, b) {
        var da = Math.sqrt(Math.pow(a.raNum - ra, 2) + Math.pow(a.decNum - dec, 2));
        var db = Math.sqrt(Math.pow(b.raNum - ra, 2) + Math.pow(b.decNum - dec, 2));
        return da - db;
    });

    return { error: null, results: results };
}
// Will ONLY WORK, with both x and y coordinate FOR this specific grid

function tryParseCoordinates(query) {
    var cleaned = query.replace(/ra|dec|right|ascension|declination/gi, ' ').trim();
    var parts = cleaned.split(/[\s,]+/).filter(function (p) { return p.length > 0; });
    if (parts.length < 2) return null;
    var ra = parseFloat(parts[0]);
    var dec = parseFloat(parts[1]);
    if (isNaN(ra) || isNaN(dec)) return null;
    return { ra: ra, dec: dec };
}
// ========== END of what is ADDED ==========

// Function to display search results updated to use the new catalog data structure
function showResults(matches, query) {
    var resultsDiv = document.getElementById('results');
    var statusDiv = document.getElementById('status');
    
    if (query == '') {
        resultsDiv.innerHTML = '';
        statusDiv.innerHTML = 'Enter a search term';
        return;
    }
    
    if (matches.length == 0) {
        resultsDiv.innerHTML = '';
        statusDiv.innerHTML = '0 results for "' + query + '"';
        return;
    }

    var resultText = matches.length + ' result';
    if (matches.length > 1) {
        resultText = resultText + 's';
    }
    statusDiv.innerHTML = resultText + ' for "' + query + '"';
    
    var html = '';
    for (var i = 0; i < matches.length; i++) {
    // Exoplanet data structure has been updated to use the new catalog data structure and images
        var planet = matches[i];
        var imagePath = getExoplanetImage(planet.pl_name);
        html += '<div class="result">';
        html += '<img src="' + imagePath + '" alt="' + planet.pl_name + '" class="exo_image">';
        html += '<h2>' + planet.pl_name + '</h2>';
        html += '<p>Host star: ' + planet.hostname + '</p>';
        html += '<p>Right Ascension: ' + planet.ra + '</p>';
        html += '<p>Declination: ' + planet.dec + '</p>';
        html += '<p>Orbit Period: ' + planet.pl_orbper + ' days</p>';
        html += '<p> ---------- </p>';
        html += '</div>';
    }
    
    resultsDiv.innerHTML = html;
}
function doSearch() {
    var inputBox = document.getElementById('searchInput');
    var query = inputBox.value;

    // ========== ADDED (check for coordinates first) ==========
    var coords = tryParseCoordinates(query);
    if (coords) {
        var result = searchByCoordinates(coords.ra, coords.dec, 2);
        if (result.error === 'out-of-range') {
            document.getElementById('status').innerHTML = 'Out of range.';
            document.getElementById('results').innerHTML = '';
            return;
        }
        if (result.results.length > 0) {
            showResults(result.results, 'RA ' + coords.ra + ', Dec ' + coords.dec);
            return;
        }
    }
    // ==== END of what is ADDED ==========

    var matches = searchExoplanets(query);
    showResults(matches, query);
}

document.getElementById('searchBtn').onclick = doSearch;
document.getElementById('searchInput').onkeypress = function(event) {
    if (event.key == 'Enter') {
        doSearch();
    }
};

loadCatalog();
