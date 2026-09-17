import { SUBJECTS, SUBJECT_ORDER } from '../data/subjects.js';
const KEY='sbmp-planner-tasks-v1';
let tasks=load();let currentFilter='all';
export function initPlanner(){
 const r=document.getElementById('planner-root');if(!r)return;
 renderForm();renderFilters();renderList();
}
export function initSubjectPlanner(code){
 const r=document.getElementById('subject-planner');if(!r)return;
 renderSubjectForm(code);renderSubjectList(code);
}
function load(){try{return JSON.parse(localStorage.getItem(KEY))||[];}catch{return [];}}
function save(){localStorage.setItem(KEY,JSON.stringify(tasks));}
function renderForm(){
 const f=document.getElementById('task-form');if(!f)return;
 f.innerHTML=`
  <select id="tf-subject" required><option value="">Select subject…</option>${SUBJECT_ORDER.map(c=>`<option value="${c}">${SUBJECTS[c].name}</option>`).join('')}</select>
  <input id="tf-title" placeholder="Task title" required maxlength="100">
  <input id="tf-desc" placeholder="Description (optional)" maxlength="200">
  <input id="tf-due" type="date">
  <select id="tf-priority"><option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option></select>
  <button type="submit" class="btn btn-primary">Add Task</button>`;
 f.addEventListener('submit',e=>{
  e.preventDefault();
  const s=f.querySelector('#tf-subject').value,t=f.querySelector('#tf-title').value.trim();
  if(!s||!t)return;
  tasks.push({id:crypto.randomUUID(),subject:s,title:t,desc:f.querySelector('#tf-desc').value.trim(),due:f.querySelector('#tf-due').value,priority:f.querySelector('#tf-priority').value,done:false,createdAt:Date.now()});
  save();f.reset();renderList();
 });
}
function renderFilters(){
 const h=document.getElementById('planner-filters');if(!h)return;
 h.innerHTML=`<button class="filter-tab active" data-filter="all">All</button><button class="filter-tab" data-filter="pending">Pending</button><button class="filter-tab" data-filter="done">Completed</button>`;
 h.querySelectorAll('.filter-tab').forEach(t=>t.addEventListener('click',()=>{
  h.querySelectorAll('.filter-tab').forEach(x=>x.classList.toggle('active',x===t));
  currentFilter=t.dataset.filter;renderList();
 }));
}
function renderList(){
 const h=document.getElementById('task-list');if(!h)return;
 let l=[...tasks];
 if(currentFilter==='pending')l=l.filter(t=>!t.done);
 if(currentFilter==='done')l=l.filter(t=>t.done);
 l.sort((a,b)=>(a.done-b.done)||((a.due||'9999').localeCompare(b.due||'9999')));
 if(!l.length){h.innerHTML='<div class="task-empty">No tasks here yet.<br><span class="text-mute" style="font-size:.85rem">Add your first task above.</span></div>';return;}
 h.innerHTML=l.map(html).join('');bind(h);
}
function html(t){
 const s=SUBJECTS[t.subject]||{name:t.subject};
 const dl=t.due?`Due ${new Date(t.due).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}`:'No due date';
 return `<div class="task-item priority-${t.priority} ${t.done?'done':''}" data-id="${t.id}">
  <input type="checkbox" class="task-checkbox" ${t.done?'checked':''} data-action="toggle">
  <div>
   <div class="task-title">${esc(t.title)}</div>
   ${t.desc?`<div class="task-desc">${esc(t.desc)}</div>`:''}
   <div class="task-meta"><span class="badge">${s.name}</span><span>${dl}</span><span>· ${t.priority}</span></div>
  </div>
  <div class="task-actions"><button class="btn btn-ghost btn-sm" data-action="edit">Edit</button><button class="btn btn-ghost btn-sm" data-action="delete" style="color:var(--danger)">Delete</button></div>
 </div>`;
}
function bind(h){
 h.querySelectorAll('.task-item').forEach(it=>{
  const id=it.dataset.id;
  it.querySelector('[data-action="toggle"]').addEventListener('change',()=>{const t=tasks.find(x=>x.id===id);if(t){t.done=!t.done;save();renderList();}});
  it.querySelector('[data-action="delete"]').addEventListener('click',()=>{if(!confirm('Delete this task?'))return;tasks=tasks.filter(x=>x.id!==id);save();renderList();});
  it.querySelector('[data-action="edit"]').addEventListener('click',()=>{
   const t=tasks.find(x=>x.id===id);if(!t)return;
   const nt=prompt('Task title:',t.title);if(nt===null)return;
   t.title=nt.trim()||t.title;save();renderList();
  });
 });
}
function renderSubjectForm(code){
 const h=document.getElementById('subject-planner-form');if(!h)return;
 h.innerHTML=`<form class="task-form" style="grid-template-columns:3fr 1fr 1fr auto;">
  <input id="sf-title" placeholder="Task title" required maxlength="100">
  <input id="sf-due" type="date">
  <select id="sf-priority"><option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option></select>
  <button type="submit" class="btn btn-primary">Add</button></form>`;
 h.querySelector('form').addEventListener('submit',e=>{
  e.preventDefault();
  const t=h.querySelector('#sf-title').value.trim();if(!t)return;
  tasks.push({id:crypto.randomUUID(),subject:code,title:t,desc:'',due:h.querySelector('#sf-due').value,priority:h.querySelector('#sf-priority').value,done:false,createdAt:Date.now()});
  save();h.querySelector('form').reset();renderSubjectList(code);
 });
}
function renderSubjectList(code){
 const h=document.getElementById('subject-task-list');if(!h)return;
 const l=tasks.filter(t=>t.subject===code);
 if(!l.length){h.innerHTML='<div class="task-empty">No tasks for this subject yet.</div>';return;}
 l.sort((a,b)=>(a.done-b.done)||((a.due||'9999').localeCompare(b.due||'9999')));
 h.innerHTML=l.map(html).join('');
 h.querySelectorAll('.task-item').forEach(it=>{
  const id=it.dataset.id;
  it.querySelector('[data-action="toggle"]').addEventListener('change',()=>{const t=tasks.find(x=>x.id===id);if(t){t.done=!t.done;save();renderSubjectList(code);}});
  it.querySelector('[data-action="delete"]').addEventListener('click',()=>{tasks=tasks.filter(x=>x.id!==id);save();renderSubjectList(code);});
  it.querySelector('[data-action="edit"]').addEventListener('click',()=>{const t=tasks.find(x=>x.id===id);if(!t)return;const nt=prompt('Task title:',t.title);if(nt===null)return;t.title=nt.trim()||t.title;save();renderSubjectList(code);});
 });
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}