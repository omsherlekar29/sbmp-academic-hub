import { renderLayout } from './layout.js';
import { initTheme } from './theme.js';
import { initClock } from './clock.js';
import { initHomeNotices, initCalendarStrip } from './notices.js';
import { SUBJECTS, SUBJECT_ORDER } from '../data/subjects.js';
import { SUBJECT_COLORS } from '../data/timetable.js';
import { initPolish } from './polish.js';

function boot(){
  try { renderLayout(); } catch(e){ console.error('Layout error:', e); }
  try { initTheme(); }    catch(e){ console.error('Theme error:',  e); }
  try { initClock(); }    catch(e){ console.error('Clock error:',  e); }
  try { initHomeNotices(); } catch(e){ console.error('Home notices error:', e); }
  try { initCalendarStrip(); } catch(e){ console.error('Calendar error:', e); }
  try { initSubjectsPreview(); } catch(e){ console.error('Subjects preview error:', e); }
  setTimeout(initPolish, 50);
}

function initSubjectsPreview(){
  const sp = document.getElementById('subjects-preview');
  if (!sp) return;
  sp.innerHTML = SUBJECT_ORDER.map(c => {
    const s = SUBJECTS[c];
    const color = SUBJECT_COLORS[c] || '#0f2557';
    return `<a class="subject-card" href="subjects/${s.slug}.html" style="--subject-color:${color};">
      <div class="code">${s.code}</div>
      <h3>${s.name}</h3>
      <div class="meta"><span>${s.category}</span><span>·</span><span>${s.units.length} Units</span></div>
    </a>`;
  }).join('');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}