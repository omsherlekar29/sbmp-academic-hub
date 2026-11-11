// Global quick search (Ctrl/Cmd + K) across pages, subjects, students,
// faculty and notices. Index is built lazily on first open.
import { SUBJECTS, SUBJECT_ORDER } from '../data/subjects.js';
import { STUDENTS } from '../data/students.js';
import { FACULTY } from '../data/faculty.js';
import { NOTICES } from '../data/notices.js';

const MAX_RESULTS = 10;
let index = null;
let active = 0;
let current = [];
let overlay;
let input;
let list;

function prefix() {
  const p = window.location.pathname;
  return (p.includes('/pages/') || p.includes('/subjects/')) ? '../' : '';
}

function buildIndex() {
  const base = prefix();
  const entries = [];

  [
    ['Home', 'index.html', 'home dashboard start overview'],
    ['Attendance Tracker', 'pages/attendance.html', 'attendance 75 percent eligibility pdf import tracker'],
    ['Timetable', 'pages/timetable.html', 'timetable schedule periods lectures labs batch'],
    ['Subjects', 'pages/subjects.html', 'subjects syllabus codes directory'],
    ['Portion', 'pages/portion.html', 'portion units topics syllabus'],
    ['Task Planner', 'pages/planner.html', 'planner tasks todo homework'],
    ['Faculty', 'pages/faculty.html', 'faculty teachers staff directory'],
    ['Students', 'pages/students.html', 'students directory roll batch s1 s2'],
    ['Notices', 'pages/notices.html', 'notices calendar events exams'],
    ['Feedback', 'pages/feedback.html', 'feedback form response'],
    ['Academics', 'pages/academics.html', 'academics curriculum programme'],
    ['Department', 'pages/department.html', 'department institute about'],
  ].forEach(([title, path, keywords]) => {
    entries.push({ group: 'Page', title, sub: path, href: base + path, keywords });
  });

  SUBJECT_ORDER.forEach((code) => {
    const s = SUBJECTS[code];
    entries.push({
      group: 'Subject',
      title: `${code} — ${s.name}`,
      sub: `${s.category} · ${s.units.length} units`,
      href: `${base}subjects/${s.slug}.html`,
      keywords: `${code} ${s.name} ${s.short} ${s.category}`,
    });
  });

  STUDENTS.forEach((s) => {
    const name = [s.salutation, s.first, s.middle, s.last].filter(Boolean).join(' ');
    entries.push({
      group: 'Student',
      title: name,
      sub: `${s.roll} · Batch ${s.batch}`,
      href: `${base}pages/students.html?q=${encodeURIComponent(s.roll)}`,
      keywords: `${s.roll} ${s.first} ${s.middle} ${s.last} ${s.batch}`,
    });
  });

  FACULTY.forEach((f) => {
    entries.push({
      group: 'Faculty',
      title: f.name,
      sub: f.role,
      href: `${base}pages/faculty.html`,
      keywords: `${f.initials} ${f.name} ${f.dept} ${(f.subjects || []).join(' ')}`,
    });
  });

  NOTICES.forEach((n) => {
    entries.push({
      group: 'Notice',
      title: n.title,
      sub: `${n.date} · ${n.category}`,
      href: `${base}pages/notices.html`,
      keywords: `${n.title} ${n.summary} ${n.category}`,
    });
  });

  return entries.map((e) => ({ ...e, haystack: `${e.title} ${e.sub} ${e.keywords}`.toLowerCase() }));
}

function search(term) {
  const q = term.trim().toLowerCase();
  if (!q) return [];
  const words = q.split(/\s+/).filter(Boolean);
  const scored = [];

  index.forEach((entry) => {
    const title = entry.title.toLowerCase();
    let score = 0;
    if (title.startsWith(q)) score += 6;
    else if (title.includes(q)) score += 4;
    if (entry.haystack.includes(q)) score += 2;
    if (words.every((w) => entry.haystack.includes(w))) score += 1;
    if (score > 0) scored.push({ entry, score });
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, MAX_RESULTS).map((r) => r.entry);
}

function highlight(text, term) {
  const q = term.trim();
  if (!q) return escapeHtml(text);
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return escapeHtml(text);
  return `${escapeHtml(text.slice(0, i))}<mark>${escapeHtml(text.slice(i, i + q.length))}</mark>${escapeHtml(text.slice(i + q.length))}`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function render(term) {
  current = search(term);
  active = 0;
  if (!current.length) {
    list.innerHTML = `<li class="search-empty">${term.trim() ? 'No matches for ' + escapeHtml(term.trim()) : 'Type to search pages, subjects, students, faculty and notices.'}</li>`;
    return;
  }
  let lastGroup = '';
  list.innerHTML = current.map((entry, i) => {
    const header = entry.group !== lastGroup ? `<li class="search-group-label">${entry.group}</li>` : '';
    lastGroup = entry.group;
    return `${header}<li><a class="search-result${i === 0 ? ' active' : ''}" href="${entry.href}" data-index="${i}">
      <span class="sr-title">${highlight(entry.title, term)}</span>
      <span class="sr-sub">${escapeHtml(entry.sub)}</span>
    </a></li>`;
  }).join('');
}

function setActive(next) {
  const items = list.querySelectorAll('.search-result');
  if (!items.length) return;
  active = (next + items.length) % items.length;
  items.forEach((el, i) => el.classList.toggle('active', i === active));
  items[active].scrollIntoView({ block: 'nearest' });
}

function open() {
  if (!overlay) return;
  if (!index) index = buildIndex();
  overlay.classList.add('open');
  input.value = '';
  render('');
  setTimeout(() => input.focus(), 20);
}

function close() {
  if (overlay) overlay.classList.remove('open');
}

export function initSearch() {
  if (document.getElementById('search-overlay')) return;
  overlay = document.createElement('div');
  overlay.id = 'search-overlay';
  overlay.className = 'search-overlay';
  overlay.innerHTML = `
    <div class="search-dialog" role="dialog" aria-modal="true" aria-label="Search the academic hub">
      <div class="search-field">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        <input id="search-input" type="search" placeholder="Search subjects, students, faculty, notices…" autocomplete="off" aria-controls="search-results">
        <kbd class="search-kbd">Esc</kbd>
      </div>
      <ul class="search-results" id="search-results"></ul>
      <div class="search-hint"><span>&uarr;&darr; navigate</span><span>&crarr; open</span><span>Esc close</span></div>
    </div>`;
  document.body.appendChild(overlay);

  input = overlay.querySelector('#search-input');
  list = overlay.querySelector('#search-results');

  input.addEventListener('input', () => render(input.value));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  list.addEventListener('click', (e) => { if (e.target.closest('.search-result')) close(); });

  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (overlay.classList.contains('open')) close();
      else open();
      return;
    }
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
    else if (e.key === 'Enter') {
      const items = list.querySelectorAll('.search-result');
      if (items[active]) { e.preventDefault(); window.location.href = items[active].getAttribute('href'); }
    } else if (typing && e.key === '/') {
      // let search inputs take the character
    }
  });

  const trigger = document.getElementById('search-trigger');
  if (trigger) trigger.addEventListener('click', open);
}
