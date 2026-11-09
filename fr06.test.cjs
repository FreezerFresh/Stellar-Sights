const test = require('node:test');
const assert = require('node:assert/strict');
const FR06 = require('./fr06.js');
const planets = [
 {pl_name:'55 Cnc e',hostname:'55 Cnc',pl_orbper:'0.7365474'},
 {pl_name:'WASP-12 b',hostname:'WASP-12',pl_orbper:'1.091418901'},
 {pl_name:'WASP-15 b',hostname:'WASP-15',pl_orbper:'3.7521'},
 {pl_name:'GJ 1214 b',hostname:'GJ 1214',pl_orbper:'1.580404531'},
];
test('TC-06-01: No filters retain every planet',()=>assert.equal(FR06.filterPlanets(planets,{}).results.length,4));
test('TC-06-02: Host-star filter is case-insensitive',()=>assert.equal(FR06.filterPlanets(planets,{hostStar:'wasp'}).results.length,2));
test('TC-06-03: Whitespace in host filter is ignored',()=>assert.equal(FR06.filterPlanets(planets,{hostStar:' WASP-12 '}).results[0].pl_name,'WASP-12 b'));
test('TC-06-04: Minimum orbital period is inclusive',()=>assert.equal(FR06.filterPlanets(planets,{minPeriod:'1.580404531'}).results.length,2));
test('TC-06-05: Maximum orbital period is inclusive',()=>assert.equal(FR06.filterPlanets(planets,{maxPeriod:'1.091418901'}).results.length,2));
test('TC-06-06: Combined filters apply both conditions',()=>assert.deepEqual(FR06.filterPlanets(planets,{hostStar:'wasp',minPeriod:'2'}).results.map(p=>p.pl_name),['WASP-15 b']));
test('EC-06-01: Valid but nonmatching filters return empty results',()=>assert.equal(FR06.filterPlanets(planets,{hostStar:'not-a-star'}).results.length,0));
test('EC-06-02: Minimum greater than maximum rejected',()=>assert.match(FR06.filterPlanets(planets,{minPeriod:'4',maxPeriod:'2'}).error,/Minimum/));
test('EC-06-03: Negative orbital period rejected',()=>assert.match(FR06.filterPlanets(planets,{minPeriod:'-1'}).error,/nonnegative/));
test('EC-06-04: Missing orbital-period value excluded when period filtered',()=>assert.equal(FR06.filterPlanets([...planets,{pl_name:'x',hostname:'X',pl_orbper:''}],{minPeriod:'1'}).results.length,3));
test('EC-06-05: Empty catalog does not crash',()=>assert.deepEqual(FR06.filterPlanets([],{hostStar:'a'}).results,[]));
test('EC-06-06: CSV parsing handles quotes and commas',()=>assert.equal(FR06.parseCSV('pl_name,hostname,pl_orbper\n"Planet, A","Star, A",2\n')[0].pl_name,'Planet, A'));
