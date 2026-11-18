/* Stellar Sights Cycle 3 — reusable autocomplete matching logic. */
(function (root) {
  'use strict';

  function normalize(value) {
    return String(value == null ? '' : value)
      .toLocaleLowerCase('en-US')
      .trim()
      .replace(/[-_\s]+/g, ' ');
  }

  function getSuggestions(planets, query, limit = 8) {
    const term = normalize(query);
    if (!term || !Array.isArray(planets) || limit <= 0) return [];
    const found = [];
    const seen = new Set();

    for (const planet of planets) {
      if (!planet) continue;
      const name = String(planet.pl_name || planet.planetName || '').trim();
      const host = String(planet.hostname || planet.hostStar || '').trim();
      const key = name.toLocaleLowerCase('en-US');
      if (!name || seen.has(key)) continue;
      const nameKey = normalize(name);
      const hostKey = normalize(host);
      if (!nameKey.includes(term) && !hostKey.includes(term)) continue;
      seen.add(key);
      const priority = nameKey.startsWith(term) ? 0 : hostKey.startsWith(term) ? 1 : 2;
      found.push({ name, host, priority });
    }
    found.sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));
    return found.slice(0, Math.floor(limit)).map(({ name, host }) => ({ name, host }));
  }

  const api = { normalize, getSuggestions };
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.StellarAutocomplete = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
