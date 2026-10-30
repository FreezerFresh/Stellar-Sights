Creating this file to update my parts of the code that was changed and tweaked

10/28/2026 
- Updated HTML, Script, and CSS file to have the exoplanets data
- Next part to work on is images and planet on transit with a line going through those images (maybe a transparent jpg image...)
- Made the HTML page more centered to make it look "modern" for my standard (adding in some fluff of the project for now)

10/29/2026
- Added exoplanets images
- Path those images to the search bar so they appear with the images
- If typed HAT-P not the full name it will show all images with the planets itself
- Tweaked the functions a bit to include images
- Some of the images are png, jpg and jpeg images 


Test Cases
1. Search by planet name: Enter 55 Cnc e and verify that the matching planet, astronomical information, and corresponding image appear.
2. Search by host star: Enter 55 Cnc and verify that planets matching the host star are returned.
3. Case-insensitive search: Enter wasp-12 b and verify that the search finds WASP-12 b.
4. Multiple search results: Enter HAT-P and verify that all matching HAT-P planets appear with their respective information and images.
5. Planet image mapping: Search for HAT-P-12 b and verify that the correct image is displayed rather than another planet's image or the default image.

Edge Cases
1. Empty search input: Click Search without entering a value and verify that the page handles the empty input without crashing.
2. No matching results: Enter PlanetXYZ123 and verify that an appropriate no-results message appears.
3. Missing CSV file: Temporarily rename the CSV file and verify that the application displays an error message when it cannot load the catalog.
4. Missing planet image: Temporarily rename or remove an image file and verify that the application handles the missing image appropriately.
5. Unknown planet image mapping: Search for a planet that exists in the CSV but does not have an image entry in the planetImage object. Verify that the default image appears.