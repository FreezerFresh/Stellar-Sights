Creating this file to update my parts of the code that was changed and tweaked

10/28/2026 
- Updated HTML, Script, and CSS file to have the exoplanets data
- Next part to work on is images and planet on transit with a line going through those images (maybe a transparent jpg image...)
- Made the HTML page more centered to make it look "modern" for my standard (adding in some fluff of the project for now)

Test Cases

1. Search by planet name: Enter `55 Cnc e` and verify that the matching planet and its information appear.
2. Search by host star: Enter `55 Cnc` and verify that planets matching the host star are returned.
3. Case-insensitive search: Enter `wasp-12 b` and verify that the search finds `WASP-12 b`.

Edge Cases

1. Empty search input: Click Search without entering a value and verify that the page handles the empty input without crashing.
2. No matching results: Enter `PlanetXYZ123` and verify that an appropriate no-results message appears.
3. Missing CSV file: Temporarily rename the CSV file and verify that the application displays an error message when it cannot load the catalog.