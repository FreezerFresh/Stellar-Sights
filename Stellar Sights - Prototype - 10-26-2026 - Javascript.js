
let catalog = [];
function loadCatalog() {
    var dataElement = document.getElementById('catalog-data');


    //the section where it opens and shows the databse or json.

    if (dataElement) {
        var dataText = dataElement.textContent;
        catalog = JSON.parse(dataText);
        document.getElementById('status').innerHTML = 'Catalog ready: ' + catalog.length + ' exoplanets';
    } else {
        document.getElementById('status').innerHTML = 'Error loading catalog.';
    }
}

// Function to search for planets
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
        html = html + '<div>';
        html = html + '<div>' + planet.planetName + '</div>';
        html = html + '<div>Host star: ' + planet.hostStar + '</div>';
        html = html + '</div>';
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
