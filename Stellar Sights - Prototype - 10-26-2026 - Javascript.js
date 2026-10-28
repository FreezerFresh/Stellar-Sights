
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
                catalog.push(planet);
            }
        }
        document.getElementById('status').textContent = 'Catalog ready: ' + catalog.length + ' exoplanets';
    })
    .catch(error => {
        document.getElementById('status').textContent = 'Error loading catalog.';
    });
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
        var planet = matches[i];
        html += '<div class="result">';
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
    var matches = searchExoplanets(query);
    showResults(matches, query);
}

//button clicked do this

document.getElementById('searchBtn').onclick = doSearch;
document.getElementById('searchInput').onkeypress = function(event) {
    if (event.key == 'Enter') {
        doSearch();
    }
};

loadCatalog();
