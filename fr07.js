/* FR-07: transit no-match messaging. Works in browser and Node tests. */
(function (root) {
  'use strict';
  function parseCSV(text) {
    const rows = []; let row = [], cell = '', quoted = false;
    for (let i=0;i<text.length;i++) {
      const ch=text[i];
      if (ch==='"') { if (quoted && text[i+1]==='"') {cell+='"';i++;} else quoted=!quoted; }
      else if (ch===','&&!quoted) {row.push(cell);cell='';}
      else if ((ch==='\n'||ch==='\r')&&!quoted) {
        if(ch==='\r'&&text[i+1]==='\n') i++;
        row.push(cell); if(row.some(x=>x.trim()))rows.push(row);row=[];cell='';
      } else cell+=ch;
    }
    if(cell||row.length){row.push(cell);rows.push(row)}
    const headers=(rows.shift()||[]).map(s=>s.trim());
    return rows.map(cells=>Object.fromEntries(headers.map((h,i)=>[h,(cells[i]||'').trim()])));
  }
  const clean = v => String(v||'').trim();
  const normalize = v => clean(v).toLocaleLowerCase('en-US').replace(/\s+/g,' ');
  function dateKey(value) {
    const s=clean(value), m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+\d{1,2}:\d{2})?$/);
    if (!m) return null;
    const mm=+m[1],dd=+m[2],yy=+m[3];
    const d=new Date(Date.UTC(yy,mm-1,dd));
    if(d.getUTCFullYear()!==yy||d.getUTCMonth()!==mm-1||d.getUTCDate()!==dd)return null;
    return `${yy}-${String(mm).padStart(2,'0')}-${String(dd).padStart(2,'0')}`;
  }
  function eventsForPlanet(rows, planet) {
    const matching=rows.filter(r=>normalize(r.planetname)===normalize(planet) && dateKey(r.midpointcalendar));
    // One estimated event per planet per date, favor the reference marked as default.
    const grouped=new Map();
    for(const r of matching){const day=dateKey(r.midpointcalendar), old=grouped.get(day);
      if(!old || (r.isdefault==='1' && old.isdefault!=='1'))grouped.set(day,r);
    }
    return [...grouped.values()].sort((a,b)=>a.midpointcalendar.localeCompare(b.midpointcalendar));
  }
  function decide(rows, planet, requestedDate) {
    if(!/^\d{4}-\d{2}-\d{2}$/.test(requestedDate||''))return {kind:'invalid-date',events:[]};
    const d=new Date(`${requestedDate}T00:00:00Z`);
    if(!Number.isFinite(d.getTime()) || d.toISOString().slice(0,10)!==requestedDate)return {kind:'invalid-date',events:[]};
    const all=eventsForPlanet(rows,planet);
    const matched=all.filter(r=>dateKey(r.midpointcalendar)===requestedDate);
    if(matched.length)return {kind:'matches',events:matched};
    const earlier=all.filter(r=>dateKey(r.midpointcalendar)<requestedDate).sort((a,b)=>dateKey(b.midpointcalendar).localeCompare(dateKey(a.midpointcalendar)));
    if(earlier.length)return {kind:'earlier-predictions',events:earlier.slice(0,5)};
    return {kind:'no-events',events:[]};
  }
  const api={parseCSV,dateKey,eventsForPlanet,decide};
  if(typeof module==='object' && module.exports)module.exports=api;
  root.FR07=api;
})(typeof globalThis!=='undefined'?globalThis:this);
