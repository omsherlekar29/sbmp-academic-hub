import { NOTICES } from '../data/notices.js';
import { CALENDAR_EVENTS } from '../data/calendar.js';

export function initNotices(){
 const h=document.getElementById('notices-root');if(!h)return;
 const s=[...NOTICES].sort((a,b)=>b.date.localeCompare(a.date));
 if(!s.length){h.innerHTML='<div class="task-empty">No notices available yet.</div>';return;}
 h.innerHTML=s.map(n=>noticeHTML(n)).join('');
}

export function initHomeNotices(){
 const h=document.getElementById('home-notices');if(!h)return;
 const s=[...NOTICES].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
 h.innerHTML=s.map(n=>noticeHTML(n)).join('');
}

function noticeHTML(n){
 const d=new Date(n.date);
 const day=d.getDate().toString().padStart(2,'0');
 const mon=d.toLocaleString('en-IN',{month:'short'});
 return `<article class="notice-item">
  <div class="notice-date"><span class="d">${day}</span><span class="m">${mon}</span></div>
  <div class="notice-body">
   <div class="notice-title">${esc(n.title)}</div>
   <div class="notice-summary">${esc(n.summary)}</div>
   <div class="notice-meta"><span class="badge">${n.category}</span><span>${esc(n.source)}</span></div>
  </div>
 </article>`;
}

export function initCalendarStrip(){
 const h=document.getElementById('calendar-strip');if(!h)return;
 const u=CALENDAR_EVENTS.filter(e=>new Date(e.date)>=new Date(new Date().toDateString())).slice(0,8);
 if(!u.length){h.innerHTML='';return;}
 h.innerHTML=u.map(e=>{
  const d=new Date(e.date);
  const label=d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
  return `<div class="calendar-card">
   <div class="cc-date">${label}</div>
   <div class="cc-label">${esc(e.label)}</div>
  </div>`;
 }).join('');
}

function esc(s){if(!s)return '';return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}