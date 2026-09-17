import { DAYS, TIME_SLOTS, TIMETABLE_DIV_B } from '../data/timetable.js';
let activeBatch='ALL';

export function initTimetable(){
  const root=document.getElementById('timetable-root');
  if(!root)return;
  renderControls();
  renderGrid();
  document.querySelectorAll('.tt-tab').forEach(t=>t.addEventListener('click',()=>{
    activeBatch=t.dataset.batch;
    document.querySelectorAll('.tt-tab').forEach(x=>x.classList.toggle('active',x===t));
    renderGrid();
  }));
}

function renderControls(){
  const c=document.getElementById('tt-controls');
  if(!c)return;
  c.innerHTML=`
    <div class="tt-tabs" role="tablist">
      <button class="tt-tab active" data-batch="ALL">Full Division B</button>
      <button class="tt-tab" data-batch="S1">Batch S1</button>
      <button class="tt-tab" data-batch="S2">Batch S2</button>
    </div>
    <button class="btn btn-secondary btn-sm" onclick="window.print()" style="margin-left:auto;">Print</button>
    <div class="badge badge-primary">AY 2026&ndash;27 · Effective 10.08.2026</div>`;
}

function currentSlot(){
  const now=new Date();
  const day=now.toLocaleDateString('en-US',{weekday:'long'});
  const t=now.getHours()*60+now.getMinutes();
  const slots=[
    ['08:00 - 09:00',480,540],
    ['09:00 - 10:00',540,600],
    ['10:00 - 11:00',600,660],
    ['11:00 - 12:00',660,720],
    ['12:00 - 01:00',720,780],
    ['01:00 - 02:00',780,840],
    ['02:00 - 03:00',840,900],
    ['03:00 - 04:00',900,960],
    ['04:00 - 05:00',960,1020]
  ];
  for(const [label,s,e] of slots)if(t>=s&&t<e)return {day,label};
  return null;
}

// Convert both formats to a uniform array for easy lookup
function getEntries(day, slot){
  const c = TIMETABLE_DIV_B[day][slot];
  if (!c) return [{type:'FREE'}];
  if (Array.isArray(c)) return c;
  return [c];
}

// Find a lab entry for a specific batch at this day/slot
function findLabEntry(day, slot, batch){
  const entries = getEntries(day, slot);
  return entries.find(e => e.type==='CLASS' && e.mode==='LL' && e.batch===batch) || null;
}

// Find any non-lab (regular) entry for a batch, or an ALL entry
function findRegularEntry(day, slot, batch){
  const entries = getEntries(day, slot);
  return entries.find(e => e.type==='CLASS' && e.mode!=='LL' && (e.batch==='ALL' || e.batch===batch)) || null;
}

// Special cell types (RECESS, LIBRARY, FREE)
function getSpecial(day, slot){
  const c = TIMETABLE_DIV_B[day][slot];
  if (!c) return null;
  if (Array.isArray(c)) return null;
  if (c.type==='RECESS' || c.type==='LIBRARY') return c;
  return null;
}

// Is this slot the FIRST hour of a 2-hour lab?
function isLabStart(day, slot){
  const idx = TIME_SLOTS.indexOf(slot);
  if (idx === TIME_SLOTS.length-1) return false;
  const next = TIME_SLOTS[idx+1];
  const curLabs = getEntries(day, slot).filter(e=>e.type==='CLASS'&&e.mode==='LL');
  const nextLabs = getEntries(day, next).filter(e=>e.type==='CLASS'&&e.mode==='LL');
  if (!curLabs.length || !nextLabs.length) return false;
  // At least one lab continues into next slot
  return curLabs.some(c => nextLabs.some(n => n.batch === c.batch));
}

// Is this slot the SECOND hour of a 2-hour lab?
function isLabContinuation(day, slot){
  const idx = TIME_SLOTS.indexOf(slot);
  if (idx === 0) return false;
  const prev = TIME_SLOTS[idx-1];
  const curLabs = getEntries(day, slot).filter(e=>e.type==='CLASS'&&e.mode==='LL');
  const prevLabs = getEntries(day, prev).filter(e=>e.type==='CLASS'&&e.mode==='LL');
  if (!curLabs.length || !prevLabs.length) return false;
  return curLabs.some(c => prevLabs.some(p => p.batch === c.batch));
}

function renderGrid(){
  const root=document.getElementById('timetable-root');
  if(!root)return;
  const cur = currentSlot();

  let h = '<div class="tt-wrap"><table class="tt-table">';
  h += '<thead><tr><th class="tt-th-time">Time</th>';
  DAYS.forEach(d => { h += `<th class="tt-th-day">${d}</th>`; });
  h += '</tr></thead><tbody>';

  for (let i=0; i<TIME_SLOTS.length; i++){
    const slot = TIME_SLOTS[i];
    h += `<tr><td class="tt-td-time">${slot}</td>`;

    for (const day of DAYS){
      const isNow = cur && day===cur.day && slot===cur.label;

      // Was this cell already covered by rowspan=2 from the previous row?
      if (isLabContinuation(day, slot)){
        const curLabs = getEntries(day, slot).filter(e=>e.type==='CLASS'&&e.mode==='LL');
        const prevLabs = getEntries(day, TIME_SLOTS[i-1]).filter(e=>e.type==='CLASS'&&e.mode==='LL');

        // Which labs were rendered in the previous row? Skip them
        const alreadyShown = curLabs.some(c => prevLabs.some(p => p.batch === c.batch));
        if (alreadyShown){
          // In ALL view, skip only if the cell was fully rendered (both labs covered)
          if (activeBatch==='ALL'){
            const allCovered = curLabs.every(c => prevLabs.some(p => p.batch === c.batch));
            if (allCovered) continue;
          } else {
            const myLab = curLabs.find(c => c.batch === activeBatch);
            if (myLab && prevLabs.some(p => p.batch === activeBatch)) continue;
          }
        }
      }

      h += renderCell(day, slot, isNow);
    }
    h += '</tr>';
  }
  h += '</tbody></table></div>';
  root.innerHTML = h;
}

function renderCell(day, slot, isNow){
  // Special cells (RECESS / LIBRARY)
  const special = getSpecial(day, slot);
  if (special && special.type==='RECESS') return '<td class="tt-td recess">RECESS</td>';
  if (special && special.type==='LIBRARY') return '<td class="tt-td library">LIBRARY</td>';

  const startLab = isLabStart(day, slot);
  const rowspan = startLab ? ' rowspan="2"' : '';
  const nowCls = isNow ? ' now-cell' : '';

  // ---------- Filtered by batch ----------
  if (activeBatch==='S1' || activeBatch==='S2'){
    const lab = findLabEntry(day, slot, activeBatch);
    if (lab){
      return `<td class="tt-td lab-cell${nowCls}"${rowspan}>
        <div class="code">${lab.code}</div>
        <div class="name">${shortName(lab.name)} LL</div>
        <div class="meta">${lab.faculty} · ${lab.room} · ${activeBatch}</div>
      </td>`;
    }
    const reg = findRegularEntry(day, slot, activeBatch);
    if (reg){
      const bt = reg.batch==='ALL' ? '' : `<span class="badge badge-primary" style="font-size:.62rem">${reg.batch}</span>`;
      return `<td class="tt-td${nowCls}">
        <div class="code">${reg.code} ${bt}</div>
        <div class="name">${reg.name}</div>
        <div class="meta">${reg.faculty} · ${reg.room} · ${reg.mode}</div>
      </td>`;
    }
    return '<td class="tt-td free">&mdash;</td>';
  }

  // ---------- Full Division B ----------
  const entries = getEntries(day, slot);
  const labs = entries.filter(e=>e.type==='CLASS'&&e.mode==='LL');
  const regs = entries.filter(e=>e.type==='CLASS'&&e.mode!=='LL');

  // Lab cell (may have 1 or 2 batches)
  if (labs.length){
    const s1 = labs.find(l => l.batch==='S1');
    const s2 = labs.find(l => l.batch==='S2');
    if (s1 && s2){
      return `<td class="tt-td lab-cell${nowCls}"${rowspan}>
        <div class="lab-block">
          <div class="lab-tag">S1</div>
          <div class="code">${s1.code}</div>
          <div class="name">${shortName(s1.name)} LL</div>
          <div class="meta">${s1.faculty} · ${s1.room}</div>
        </div>
        <div class="lab-block">
          <div class="lab-tag">S2</div>
          <div class="code">${s2.code}</div>
          <div class="name">${shortName(s2.name)} LL</div>
          <div class="meta">${s2.faculty} · ${s2.room}</div>
        </div>
      </td>`;
    }
    const one = s1 || s2;
    return `<td class="tt-td lab-cell${nowCls}"${rowspan}>
      <div class="lab-tag">${one.batch}</div>
      <div class="code">${one.code}</div>
      <div class="name">${shortName(one.name)} LL</div>
      <div class="meta">${one.faculty} · ${one.room}</div>
    </td>`;
  }

  // Regular class
  if (regs.length){
    const r = regs[0];
    const bt = r.batch==='ALL' ? '' : `<span class="badge badge-primary" style="font-size:.62rem">${r.batch}</span>`;
    return `<td class="tt-td${nowCls}">
      <div class="code">${r.code} ${bt}</div>
      <div class="name">${r.name}</div>
      <div class="meta">${r.faculty} · ${r.room} · ${r.mode}</div>
    </td>`;
  }

  return '<td class="tt-td free">&mdash;</td>';
}

function shortName(n){
  return n
    .replace('Engineering Mathematics','Engg Math')
    .replace('Engineering Graphics','Engg Graphics')
    .replace('Fundamentals of Computing System','Fund. Computing')
    .replace('Communication Skills','Comm. Skills')
    .replace('Universal Human Values','UHV')
    .replace('Website Designing','Web Design')
    .replace('Applied Science','Applied Sci');
}