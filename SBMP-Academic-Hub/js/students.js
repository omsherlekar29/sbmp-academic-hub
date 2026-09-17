import { STUDENTS } from '../data/students.js';
let filter='all',query='';
export function initStudents(){
 const h=document.getElementById('students-root');if(!h)return;
 document.getElementById('student-count').textContent=STUDENTS.length;
 document.querySelectorAll('.student-filter').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.student-filter').forEach(x=>x.classList.toggle('active',x===b));
  filter=b.dataset.filter;render();
 }));
 const s=document.getElementById('student-search');
 if(s)s.addEventListener('input',e=>{query=e.target.value.toLowerCase().trim();render();});
 render();
}
function render(){
 const h=document.getElementById('students-list');if(!h)return;
 let l=STUDENTS;
 if(filter!=='all')l=l.filter(s=>s.batch===filter);
 if(query)l=l.filter(s=>s.first.toLowerCase().includes(query)||s.last.toLowerCase().includes(query)||s.roll.toLowerCase().includes(query)||s.sap.includes(query));
 if(!l.length){h.innerHTML='<tr><td colspan="6" class="text-center text-mute" style="padding:30px;">No students match your filter.</td></tr>';return;}
 h.innerHTML=l.map(s=>`<tr><td><span class="badge badge-primary">${s.roll}</span></td><td>${s.sap}</td><td>${s.salutation} ${esc(s.first)} ${esc(s.middle)} ${esc(s.last)}</td><td>${s.division}</td><td><span class="badge">${s.batch}</span></td><td class="text-mute">Computer Engineering</td></tr>`).join('');
}
function esc(s){if(!s)return '';return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}