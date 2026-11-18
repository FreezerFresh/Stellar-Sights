/* Cycle 3 — accessible, planet/host-star autocomplete for the existing search. */
(function () {
  'use strict';

  const input = document.getElementById('searchInput');
  if (!input || !window.StellarAutocomplete) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'stellar-autocomplete';
  input.parentNode.insertBefore(wrapper, input);
  wrapper.appendChild(input);

  const list = document.createElement('div');
  list.id = 'stellar-autocomplete-options';
  list.className = 'stellar-autocomplete-options';
  list.setAttribute('role', 'listbox');
  list.setAttribute('aria-label', 'Suggested exoplanets');
  list.hidden = true;
  wrapper.appendChild(list);

  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-controls', list.id);
  input.setAttribute('aria-expanded', 'false');

  let planets = [];
  let candidates = [];
  let active = -1;

  function close() {
    list.hidden = true;
    list.replaceChildren();
    candidates = [];
    active = -1;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
  }

  function updateActive() {
    for (const [index, option] of Array.from(list.children).entries()) {
      const selected = index === active;
      option.setAttribute('aria-selected', String(selected));
      option.classList.toggle('is-active', selected);
    }
    if (active >= 0) {
      input.setAttribute('aria-activedescendant', 'stellar-suggestion-' + active);
      list.children[active]?.scrollIntoView({ block: 'nearest' });
    } else input.removeAttribute('aria-activedescendant');
  }

  function select(index) {
    const selected = candidates[index];
    if (!selected) return;
    input.value = selected.name;
    close();
    if (typeof window.doSearch === 'function') window.doSearch();
    else document.getElementById('searchBtn')?.click();
    input.focus();
  }

  function render() {
    close();
    candidates = window.StellarAutocomplete.getSuggestions(planets, input.value, 8);
    if (!candidates.length) return;
    for (const [index, item] of candidates.entries()) {
      const option = document.createElement('div');
      option.id = 'stellar-suggestion-' + index;
      option.className = 'stellar-autocomplete-option';
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', 'false');

      const name = document.createElement('span');
      name.className = 'stellar-autocomplete-name';
      name.textContent = item.name;
      option.appendChild(name);
      if (item.host) {
        const host = document.createElement('span');
        host.className = 'stellar-autocomplete-host';
        host.textContent = 'Host: ' + item.host;
        option.appendChild(host);
      }
      option.addEventListener('mousedown', event => event.preventDefault());
      option.addEventListener('click', () => select(index));
      list.appendChild(option);
    }
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }

  input.addEventListener('input', render);
  input.addEventListener('focus', render);
  input.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (!list.hidden) { event.preventDefault(); close(); }
      return;
    }
    if (list.hidden) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      active = (active + 1) % candidates.length;
      updateActive();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      active = active <= 0 ? candidates.length - 1 : active - 1;
      updateActive();
    } else if (event.key === 'Enter' && active >= 0) {
      event.preventDefault();
      event.stopImmediatePropagation();
      select(active);
    } else if (event.key === 'Tab') close();
  });

  document.addEventListener('pointerdown', event => {
    if (!wrapper.contains(event.target)) close();
  });
  document.getElementById('searchBtn')?.addEventListener('click', close);

  fetch('data/exoplanets.csv')
    .then(response => {
      if (!response.ok) throw new Error('Catalog unavailable');
      return response.text();
    })
    .then(text => {
      if (window.FR06?.parseCSV) planets = window.FR06.parseCSV(text);
      else {
        const lines = text.trim().split(/\r?\n/);
        const headers = lines.shift().split(',').map(cell => cell.trim());
        planets = lines.map(line => {
          const cells = line.split(',');
          return Object.fromEntries(headers.map((header, i) => [header, (cells[i] || '').trim()]));
        });
      }
      if (document.activeElement === input && input.value.trim()) render();
    })
    .catch(() => {
      // Existing search already provides catalog-load error handling.
      close();
    });
})();
