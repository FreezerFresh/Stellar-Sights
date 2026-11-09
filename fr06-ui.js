/* FR-06 UI adapter. Load after fr06.js and the site's existing JavaScript. */
(function () {
  'use strict';
  const isMap = Boolean(document.getElementById('exoplanet-map'));
  const resultsDiv = document.getElementById('results');
  const map = document.getElementById('exoplanet-map');
  if (!isMap && !resultsDiv) return;

  const STORAGE_KEY = 'stellar-sights-fr06';
  const saved = (() => { try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; } })();
  const filters = {
    hostStar: typeof saved.hostStar === 'string' ? saved.hostStar : '',
    minPeriod: typeof saved.minPeriod === 'string' ? saved.minPeriod : '',
    maxPeriod: typeof saved.maxPeriod === 'string' ? saved.maxPeriod : ''
  };

  const root = document.createElement('section');
  root.className = 'fr06-panel';
  root.innerHTML = `
    <h2>Filter Exoplanets</h2>
    <div class="fr06-fields">
      <label>Host star <input id="fr06-host" type="search" placeholder="e.g. WASP" autocomplete="off"></label>
      <label>Min. orbital period (days) <input id="fr06-min" type="number" min="0" step="any" placeholder="Any"></label>
      <label>Max. orbital period (days) <input id="fr06-max" type="number" min="0" step="any" placeholder="Any"></label>
      <button id="fr06-reset" type="button">Clear filters</button>
    </div>
    <p id="fr06-message" role="status" aria-live="polite"></p>`;
  if (isMap) document.getElementById('map-container').before(root);
  else resultsDiv.before(root);

  const hostInput = root.querySelector('#fr06-host');
  const minInput = root.querySelector('#fr06-min');
  const maxInput = root.querySelector('#fr06-max');
  const message = root.querySelector('#fr06-message');
  hostInput.value = filters.hostStar;
  minInput.value = filters.minPeriod;
  maxInput.value = filters.maxPeriod;

  let catalogRows = [];
  let lastMatches = null;
  let lastQuery = '';
  const originalShowResults = !isMap && typeof window.showResults === 'function' ? window.showResults : null;

  if (originalShowResults) {
    window.showResults = function (matches, query) {
      lastMatches = Array.isArray(matches) ? matches : [];
      lastQuery = query;
      renderSearch();
    };
  }

  function persist() { try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters)); } catch {} }
  function readFilters() {
    filters.hostStar = hostInput.value.trim();
    filters.minPeriod = minInput.value.trim();
    filters.maxPeriod = maxInput.value.trim();
    persist();
    apply();
  }
  function renderSearch() {
    if (!originalShowResults || lastMatches === null) {
      message.textContent = 'Enter a planet or host-star search to filter the results.';
      return;
    }
    const chosen = FR06.filterPlanets(lastMatches, filters);
    if (chosen.error) { message.textContent = chosen.error; return; }
    originalShowResults(chosen.results, lastQuery);
    message.textContent = chosen.results.length === 0 && lastMatches.length > 0
      ? 'No exoplanets match the active filters. Clear or adjust filters to see more results.'
      : `${chosen.results.length} of ${lastMatches.length} search results match the active filters.`;
  }

  function renderMap() {
    const dots = Array.from(map.querySelectorAll('.exoplanet-dot'));
    if (!dots.length) { message.textContent = 'Loading map markers...'; return; }
    const match = FR06.filterPlanets(catalogRows, filters);
    if (match.error) { message.textContent = match.error; return; }
    const allowed = new Set(match.results.map(p => String(p.pl_name).trim().toLowerCase()));
    let visible = 0;
    for (const dot of dots) {
      const planetName = (dot.querySelector('title')?.textContent || '').trim().toLowerCase();
      const show = allowed.has(planetName);
      dot.style.display = show ? '' : 'none';
      if (show) visible++;
    }
    const mapStatus = document.getElementById('map-status');
    if (mapStatus) {
      mapStatus.textContent = `${visible} of ${dots.length} exoplanets displayed on the map.`;
    }
    message.textContent = visible === 0
      ? 'No exoplanets match the active filters. Clear or adjust filters.'
      : `${visible} of ${dots.length} exoplanets displayed with active filters.`;
    const info = document.getElementById('planet-info');
    const selected = info?.querySelector('h2')?.textContent?.trim().toLowerCase();
    if (selected && selected !== 'select an exoplanet' && !allowed.has(selected)) {
      info.replaceChildren();
      const heading = document.createElement('h2');
      heading.textContent = 'Select an Exoplanet';
      const p = document.createElement('p');
      p.textContent = 'The previously selected planet is hidden by your active filters.';
      info.append(heading, p);
    }
  }
  function apply() { if (isMap) renderMap(); else renderSearch(); }

  [hostInput, minInput, maxInput].forEach(input => input.addEventListener('input', readFilters));
  root.querySelector('#fr06-reset').addEventListener('click', () => {
    [hostInput, minInput, maxInput].forEach(input => { input.value = ''; });
    readFilters();
  });

  if (isMap) {
    const observer = new MutationObserver(() => apply());
    observer.observe(map, { childList: true });
    fetch('data/exoplanets.csv')
      .then(response => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.text(); })
      .then(text => { catalogRows = FR06.parseCSV(text); apply(); })
      .catch(() => { message.textContent = 'Unable to load catalog for filtering.'; });
    apply();
  } else {
    apply();
  }
})();
