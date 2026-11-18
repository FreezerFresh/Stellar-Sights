const test = require('node:test');
const assert = require('node:assert/strict');
const { getSuggestions, normalize } = require('./autocomplete-core.js');
const planets = [
  { pl_name: 'WASP-12 b', hostname: 'WASP-12' },
  { pl_name: 'WASP-15 b', hostname: 'WASP-15' },
  { pl_name: 'WASP-17 b', hostname: 'WASP-17' },
  { pl_name: 'HAT-P-12 b', hostname: 'HAT-P-12' },
  { pl_name: '55 Cnc e', hostname: '55 Cnc' },
  { pl_name: 'GJ 1214 b', hostname: 'GJ 1214' }
];
test('empty query hides suggestions', () => assert.deepEqual(getSuggestions(planets, ''), []));
test('matches planet names case-insensitively', () => assert.deepEqual(getSuggestions(planets, 'wasp').map(p=>p.name), ['WASP-12 b','WASP-15 b','WASP-17 b']));
test('matches host-star names', () => assert.equal(getSuggestions(planets, '55 Cnc')[0].name,'55 Cnc e'));
test('accepts spaces in place of hyphens', () => assert.equal(getSuggestions(planets, 'wasp 12')[0].name,'WASP-12 b'));
test('accepts hyphens in place of spaces', () => assert.equal(getSuggestions(planets, 'gj-1214')[0].name,'GJ 1214 b'));
test('respects suggestion limit', () => assert.equal(getSuggestions(planets,'wasp',2).length,2));
test('does not duplicate planets', () => assert.equal(getSuggestions([...planets,planets[0]],'wasp').length,3));
test('returns empty matches safely', () => assert.deepEqual(getSuggestions(planets,'XYZ123'),[]));
test('handles missing host and malformed items', () => assert.deepEqual(getSuggestions([null,{}, {pl_name:'Planet X'}],'planet').map(x=>x.name),['Planet X']));
test('normalizes case, spaces and punctuation', () => assert.equal(normalize('  HAT-P_12 '),'hat p 12'));
test('keeps original display names', () => assert.equal(getSuggestions(planets,'hat p')[0].name,'HAT-P-12 b'));
