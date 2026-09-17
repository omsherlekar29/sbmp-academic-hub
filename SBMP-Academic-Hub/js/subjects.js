import { SUBJECTS, SUBJECT_ORDER } from '../data/subjects.js';
import { SUBJECT_COLORS } from '../data/timetable.js';

function subjPrefix(){
  return window.location.pathname.includes('/pages/') ? '../' : '';
}

export function initSubjectDirectory(){
 const h=document.getElementById('subjects-grid');if(!h)return;
 const s=document.getElementById('subject-search');
 const render=(q='')=>{
  const ql=q.toLowerCase();
  const l=SUBJECT_ORDER.filter(c=>{const s=SUBJECTS[c];return !q||s.name.toLowerCase().includes(ql)||c.toLowerCase().includes(ql);});
  if(!l.length){h.innerHTML='<div class="task-empty" style="grid-column:1/-1;">No subjects match your search.</div>';return;}
  h.innerHTML=l.map(c=>{const s=SUBJECTS[c],co=SUBJECT_COLORS[c]||'#1e3a8a';
   return `<a class="subject-card" href="${subjPrefix()}subjects/${s.slug}.html" style="--subject-color:${co};"><div class="code">${s.code}</div><h3>${s.name}</h3><div class="meta"><span>${s.category}</span><span>·</span><span>${s.units.length} Units</span><span>·</span><span>Credits ${s.credits}</span></div></a>`;
  }).join('');
 };
 render();
 if(s)s.addEventListener('input',e=>render(e.target.value));
}
export function renderSubjectDetail(code,mount){
 const h=document.querySelector(mount);if(!h)return;
 const s=SUBJECTS[code];if(!s){h.innerHTML='<div class="alert alert-danger">Subject not found.</div>';return;}
 const co=SUBJECT_COLORS[code]||'#1e3a8a';
 h.innerHTML=`
 <header class="subject-hero" style="border-top:4px solid ${co};"><div class="container">
  <div class="breadcrumbs"><a href="../pages/subjects.html">Subjects</a><span class="sep">/</span><span>${s.name}</span></div>
  <div class="code">${s.code}</div>
  <h1 style="margin-bottom:8px;">${s.name} <span class="cat">${s.category}</span></h1>
  <p class="lede">${s.objective}</p>
 </div></header>
 <div class="container">
  <div class="grid grid-3" style="margin-bottom:30px;">
   <div class="card"><div class="text-mute" style="font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;">Credits</div><div style="font-family:var(--font-head);font-size:1.5rem;font-weight:700;">${s.credits}</div></div>
   <div class="card"><div class="text-mute" style="font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;">Duration</div><div style="font-family:var(--font-head);font-size:1.5rem;font-weight:700;">${s.duration}</div></div>
   <div class="card"><div class="text-mute" style="font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;">IKS Hours</div><div style="font-family:var(--font-head);font-size:1.5rem;font-weight:700;">${s.ikkHrs}</div></div>
  </div>
  <section class="section"><h2>Course Outcomes</h2><ol>${s.outcomes.map(o=>`<li style="margin-bottom:6px;">${o}</li>`).join('')}</ol></section>
  <section class="section"><h2>Units</h2>${s.units.map(u=>`<details class="unit" ${u.no===1?'open':''}><summary><span class="unit-no">${u.no}</span><span>${u.title}</span>${u.hours?`<span class="hours">${u.hours} hrs</span>`:''}</summary><div class="unit-body"><ul>${u.topics.map(t=>`<li>${t}</li>`).join('')}</ul></div></details>`).join('')}</section>
  ${s.practicals?`<section class="section"><h2>Practicals / Tutorials</h2><div class="table-wrap"><table class="data"><thead><tr><th>Sr.</th><th>Title</th><th>Hrs</th><th>CO</th></tr></thead><tbody>${s.practicals.map((p,i)=>`<tr><td>${i+1}</td><td>${p.title}</td><td>${p.hrs}</td><td><span class="badge">${p.co}</span></td></tr>`).join('')}</tbody></table></div></section>`:''}
  ${s.tutorials?`<section class="section"><h2>Tutorials</h2><ul>${s.tutorials.map(t=>`<li>${t}</li>`).join('')}</ul></section>`:''}
  <section class="section"><h2>Learning Resources</h2><div class="grid grid-2">${s.resources.map(r=>`<div class="card card-tight"><div style="font-weight:600;">${r.title}</div><div class="text-mute" style="font-size:.85rem;">${r.author}</div><div class="text-mute" style="font-size:.78rem;">${r.pub}</div></div>`).join('')}</div></section>
  <section class="section"><h2>Websites &amp; Portals</h2><ul>${s.websites.map(w=>`<li><a href="${w}" target="_blank" rel="noopener">${w}</a></li>`).join('')}</ul></section>
  <section class="section">
   <div class="section-head"><h2>Subject Task Planner</h2><span class="text-mute" style="font-size:.85rem;">Saved locally in your browser</span></div>
   <div id="subject-planner-form"></div>
   <div id="subject-task-list" class="task-list" style="margin-top:14px;"></div>
  </section>
 </div>`;
}