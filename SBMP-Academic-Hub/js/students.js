import { STUDENTS } from '../data/students.js';

let filter = 'all';
let query = '';

export function initStudents() {
  const list = document.getElementById('students-list');
  if (!list) return;

  const countEl = document.getElementById('student-count');
  if (countEl) countEl.textContent = STUDENTS.length;

  document.querySelectorAll('.student-filter').forEach((b) => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.student-filter').forEach((x) => x.classList.toggle('active', x === b));
      filter = b.dataset.filter;
      render();
    });
  });

  const search = document.getElementById('student-search');
  if (search) {
    search.addEventListener('input', (e) => {
      query = e.target.value.toLowerCase().trim();
      render();
    });
  }

  const params = new URLSearchParams(window.location.search);
  const preset = params.get('q');
  if (preset && search) {
    search.value = preset;
    query = preset.toLowerCase().trim();
  }

  render();
}

function esc(s) {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function fullName(s) {
  return [s.salutation, s.first, s.middle, s.last].filter(Boolean).map(esc).join(' ');
}

function render() {
  const body = document.getElementById('students-list');
  if (!body) return;

  let list = STUDENTS;
  if (filter !== 'all') list = list.filter((s) => s.batch === filter);
  if (query) {
    list = list.filter((s) =>
      [s.first, s.middle, s.last].join(' ').toLowerCase().includes(query) ||
      s.roll.toLowerCase().includes(query)
    );
  }

  if (!list.length) {
    body.innerHTML = '<tr><td colspan="5" class="text-center text-mute" style="padding:30px;">No students match your filter.</td></tr>';
    return;
  }

  body.innerHTML = list.map((s) => `
    <tr>
      <td><span class="badge badge-primary">${s.roll}</span></td>
      <td>${fullName(s)}</td>
      <td>B</td>
      <td><span class="badge">${s.batch}</span></td>
      <td class="text-mute">Computer Engineering</td>
    </tr>`).join('');
}
