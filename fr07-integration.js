
/* Connect FR-07 to the Stellar Sights search interface. */

let transitRows = [];
let transitLoadError = false;
let selectedTransitPlanet = null;

// Load Jacob's real transit prediction CSV.
async function loadTransitData() {
  try {
    const response = await fetch("data/nph-transits-api.csv");
    if (!response.ok) throw new Error("Transit data unavailable");

    transitRows = FR07.parseCSV(await response.text());
    transitLoadError = false;
  } catch (error) {
    transitLoadError = true;
    console.error("FR-07:", error);
  }
}

// Show a transit record safely using DOM text nodes.
function addTransitRecord(container, event) {
  const item = document.createElement("p");
  const ref = event.refname || "Unknown reference";

  item.textContent =
    `${event.midpointcalendar} — Prediction reference: ${ref}`;

  container.appendChild(item);
}

// Determine which message to display.
function displayTransitEvents() {
  if (!selectedTransitPlanet) return;

  const container = document.getElementById("transit-results");
  const date = document.getElementById("event-date").value;
  container.replaceChildren();

  if (transitLoadError) {
    container.textContent = "Unable to load transit data.";
    return;
  }

  const result = FR07.decide(
    transitRows,
    selectedTransitPlanet,
    date
  );

  if (result.kind === "invalid-date") {
    container.textContent = "Please select a valid date.";
    return;
  }

  if (result.kind === "no-events") {
    container.textContent =
      "No matching or earlier transit predictions available.";
    return;
  }

  const heading = document.createElement("p");

  if (result.kind === "earlier-predictions") {
    heading.textContent =
      "No transit predictions match this date. " +
      "Earlier predicted events:";
  } else {
    heading.textContent = "Matching transit predictions:";
  }

  container.appendChild(heading);

  result.events.forEach(event => {
    addTransitRecord(container, event);
  });
}

// Handle clicking an existing planet search result.
document.getElementById("results").addEventListener("click", event => {
  const card = event.target.closest(".result");
  if (!card) return;

  const planetName = card.querySelector("h2")?.textContent;
  if (!planetName) return;

  selectedTransitPlanet = planetName;

  document.getElementById("transit-section").hidden = false;
  document.getElementById("transit-section").style.display = "block";
  document.getElementById("transit-planet").textContent =
    "Transit events for " + planetName;

  displayTransitEvents();
});

// Refresh when the selected date changes.
document.getElementById("event-date")
  .addEventListener("change", displayTransitEvents);

loadTransitData();
