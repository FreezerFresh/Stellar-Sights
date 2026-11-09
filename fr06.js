/* FR-06: shared, dependency-free planet filtering for search and map. */
(function (root) {
  'use strict';
  const clean = value => String(value ?? '').trim();
  const normalize = value => clean(value).toLocaleLowerCase('en-US');

  function parseCSV(text) {
    const rows = []; let row = [], cell = '', quoted = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === '"') {
        if (quoted && text[i + 1] === '"') { cell += '"'; i++; }
        else quoted = !quoted;
      } else if (ch === ',' && !quoted) { row.push(cell); cell = ''; }
      else if ((ch === '\n' || ch === '\r') && !quoted) {
        if (ch === '\r' && text[i + 1] === '\n') i++;
        row.push(cell); if (row.some(x => clean(x))) rows.push(row);
        row = []; cell = '';
      } else cell += ch;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    const headers = (rows.shift() || []).map((s, i) => i === 0 ? clean(s).replace(/^\uFEFF/, '') : clean(s));
    return rows.map(values => Object.fromEntries(headers.map((h, i) => [h, clean(values[i])])));
  }

  function validate(filters = {}) {
    const minText = clean(filters.minPeriod), maxText = clean(filters.maxPeriod);
    const validNumber = s => s === '' || (/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(s) && Number.isFinite(Number(s)));
    if (!validNumber(minText) || !validNumber(maxText)) return 'Enter valid, nonnegative orbital periods.';
    if (minText && maxText && Number(minText) > Number(maxText)) return 'Minimum period cannot exceed maximum period.';
    return null;
  }

  function filterPlanets(planets, filters = {}) {
    const error = validate(filters);
    if (error) return { results: [], error };
    const host = normalize(filters.hostStar);
    const min = clean(filters.minPeriod) === '' ? null : Number(filters.minPeriod);
    const max = clean(filters.maxPeriod) === '' ? null : Number(filters.maxPeriod);
    const results = (Array.isArray(planets) ? planets : []).filter(p => {
      if (host && !normalize(p.hostname ?? p.hostStar).includes(host)) return false;
      if (min !== null || max !== null) {
        const period = Number(p.pl_orbper ?? p.orbitalPeriod);
        if (!Number.isFinite(period) || clean(p.pl_orbper ?? p.orbitalPeriod) === '') return false;
        if (min !== null && period < min) return false;
        if (max !== null && period > max) return false;
      }
      return true;
    });
    return { results, error: null };
  }

  const api = { parseCSV, validate, filterPlanets };
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.FR06 = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
