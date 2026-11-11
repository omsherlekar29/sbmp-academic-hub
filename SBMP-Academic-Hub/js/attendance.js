import { SUBJECTS, SUBJECT_ORDER, ATTENDANCE_RULES, TYPE_LABELS, getAttendanceStatus } from '../data/subjects.js';
import { parseAttendanceReport, parseReportText } from './pdf-import.js';

const KEY = 'sbmp.attendance.v1';
const $ = (id) => document.getElementById(id);
const pct1 = (n) => (Number.isFinite(n) ? n.toFixed(1) : '0.0');

let state = loadState();
let sim = { attend: 0, skip: 0 };

function emptyState() {
  const entries = {};
  SUBJECT_ORDER.forEach((code) => {
    entries[code] = {};
    const types = (SUBJECTS[code].type && SUBJECTS[code].type.length) ? SUBJECTS[code].type : ['TH'];
    types.forEach((t) => { entries[code][t] = { attended: 0, held: 0 }; });
  });
  return { batch: 'ALL', entries, log: [] };
}

function loadState() {
  const base = emptyState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== 'object') return base;
    if (saved.batch) base.batch = saved.batch;
    SUBJECT_ORDER.forEach((code) => {
      Object.keys(base.entries[code]).forEach((type) => {
        const v = saved.entries && saved.entries[code] && saved.entries[code][type];
        if (v && Number.isFinite(Number(v.attended)) && Number.isFinite(Number(v.held))) {
          const held = Math.max(0, Math.round(Number(v.held)));
          const attended = Math.max(0, Math.min(held, Math.round(Number(v.attended))));
          base.entries[code][type] = { attended, held };
        }
      });
    });
    base.log = Array.isArray(saved.log) ? saved.log.slice(0, 500) : [];
  } catch (e) { /* corrupt storage: start clean */ }
  return base;
}

function saveState() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage full or blocked */ }
}

function subjectTotals(code) {
  const entry = state.entries[code] || {};
  let attended = 0;
  let held = 0;
  Object.values(entry).forEach((v) => { attended += v.attended; held += v.held; });
  return { attended, held, pct: held ? (attended / held) * 100 : 0 };
}

function overallTotals() {
  let attended = 0;
  let held = 0;
  SUBJECT_ORDER.forEach((code) => {
    const t = subjectTotals(code);
    attended += t.attended;
    held += t.held;
  });
  return { attended, held, pct: held ? (attended / held) * 100 : 0 };
}

function statusChip(pct) {
  const st = getAttendanceStatus(pct);
  return `<span class="status-chip is-${st.class}">${st.label}</span>`;
}

function neededToReach(attended, held) {
  const target = ATTENDANCE_RULES.minimum / 100;
  if (!held || attended / held >= target) return 0;
  return Math.ceil((target * held - attended) / (1 - target));
}

function safeToSkip(attended, held) {
  const target = ATTENDANCE_RULES.minimum / 100;
  if (!held) return 0;
  return Math.max(0, Math.floor(attended / target) - held);
}

function setStatus(message, isError) {
  const el = $('att-status');
  if (!el) return;
  el.textContent = message;
  el.classList.toggle('is-error', Boolean(isError));
}

function renderKpis() {
  const host = $('att-kpis');
  if (!host) return;
  const t = overallTotals();
  const st = getAttendanceStatus(t.pct);
  host.innerHTML = `
    <div class="att-kpi">
      <span class="att-kpi-label">Overall attendance</span>
      <span class="att-kpi-value">${pct1(t.pct)}%</span>
      <div class="att-bar is-${st.class}"><i style="width:${Math.min(100, t.pct)}%"></i></div>
    </div>
    <div class="att-kpi"><span class="att-kpi-label">Classes attended</span><span class="att-kpi-value">${t.attended}</span></div>
    <div class="att-kpi"><span class="att-kpi-label">Classes held</span><span class="att-kpi-value">${t.held}</span></div>
    <div class="att-kpi"><span class="att-kpi-label">Status</span><span class="att-kpi-value att-kpi-status">${st.label}</span><span class="att-kpi-note">Threshold ${ATTENDANCE_RULES.minimum}%</span></div>`;
}

function renderRows() {
  const body = $('att-rows');
  if (!body) return;
  const rows = [];
  SUBJECT_ORDER.forEach((code) => {
    const subject = SUBJECTS[code];
    const totals = subjectTotals(code);
    const types = Object.keys(state.entries[code]);
    types.forEach((type, index) => {
      const v = state.entries[code][type];
      const pct = v.held ? (v.attended / v.held) * 100 : 0;
      rows.push(`<tr>
        <td>${index === 0 ? `<span class="badge badge-primary">${code}</span><div class="att-subject-name">${subject.short}</div>` : '<span class="text-mute">—</span>'}</td>
        <td>${TYPE_LABELS[type] || type}</td>
        <td><input class="att-num" type="number" min="0" step="1" value="${v.attended}" data-code="${code}" data-type="${type}" data-field="attended" aria-label="${subject.short} ${type} attended"></td>
        <td><input class="att-num" type="number" min="0" step="1" value="${v.held}" data-code="${code}" data-type="${type}" data-field="held" aria-label="${subject.short} ${type} held"></td>
        <td class="att-pct">${v.held ? pct1(pct) + '%' : '—'}</td>
        <td>${v.held ? statusChip(pct) : '<span class="text-mute">No data</span>'}</td>
        <td>${v.held && pct < ATTENDANCE_RULES.minimum ? neededToReach(v.attended, v.held) : '—'}</td>
        <td>${v.held ? safeToSkip(v.attended, v.held) : '—'}</td>
      </tr>`);
    });
    if (types.length > 1) {
      rows.push(`<tr class="att-total-row"><td colspan="2">${subject.short} &mdash; overall</td><td colspan="1">${totals.attended}</td><td>${totals.held}</td><td class="att-pct">${totals.held ? pct1(totals.pct) + '%' : '—'}</td><td>${totals.held ? statusChip(totals.pct) : '<span class="text-mute">No data</span>'}</td><td colspan="2"></td></tr>`);
    }
  });
  body.innerHTML = rows.join('');
}

function renderSim() {
  const out = $('att-sim-out');
  if (!out) return;
  const t = overallTotals();
  const simHeld = t.held + sim.attend + sim.skip;
  const simAttended = t.attended + sim.attend;
  const simPct = simHeld ? (simAttended / simHeld) * 100 : 0;
  const delta = simPct - t.pct;
  out.innerHTML = `
    <div class="att-sim-line"><span class="text-mute">Now</span> <strong>${pct1(t.pct)}%</strong>
      <span class="att-sim-arrow">&rarr;</span>
      <span class="text-mute">Simulated</span> <strong>${pct1(simPct)}%</strong>
      <span class="badge ${delta < 0 ? 'badge-warning' : 'badge-primary'}">${delta >= 0 ? '+' : ''}${pct1(delta)} pts</span>
    </div>
    <div class="att-sim-line text-mute">${sim.attend} attended &middot; ${sim.skip} skipped &middot; ${statusChip(simPct)}</div>`;
}

function renderLog() {
  const list = $('att-log-list');
  if (!list) return;
  if (!state.log.length) {
    list.innerHTML = '<p class="text-mute" style="margin:12px 0 0;">No entries yet. Logging a class updates the counters above.</p>';
    return;
  }
  list.innerHTML = `<div class="table-wrap" style="margin-top:14px;"><table class="data"><thead><tr><th>Date</th><th>Subject</th><th>Type</th><th>Status</th><th></th></tr></thead><tbody>${state.log.map((entry, i) => `<tr><td>${entry.date}</td><td>${SUBJECTS[entry.code] ? SUBJECTS[entry.code].short : entry.code}</td><td>${TYPE_LABELS[entry.type] || entry.type}</td><td><span class="badge ${entry.status === 'present' ? 'badge-primary' : 'badge-warning'}">${entry.status}</span></td><td><button class="btn btn-secondary btn-sm" data-log-remove="${i}">Remove</button></td></tr>`).join('')}</tbody></table></div>`;
}

function renderSelects() {
  const subjectSelect = $('att-log-subject');
  const typeSelect = $('att-log-type');
  if (!subjectSelect || !typeSelect) return;
  if (!subjectSelect.options.length) {
    subjectSelect.innerHTML = SUBJECT_ORDER.map((code) => `<option value="${code}">${code} — ${SUBJECTS[code].short}</option>`).join('');
  }
  const types = Object.keys(state.entries[subjectSelect.value] || {});
  const current = typeSelect.value;
  typeSelect.innerHTML = types.map((t) => `<option value="${t}">${TYPE_LABELS[t] || t}</option>`).join('');
  if (types.includes(current)) typeSelect.value = current;
}

function renderAll() {
  renderKpis();
  renderRows();
  renderSim();
  renderLog();
  renderSelects();
}

function applyParsed(result, label) {
  let applied = 0;
  result.rows.forEach((row) => {
    if (!state.entries[row.code]) return;
    Object.entries(row.values).forEach(([type, value]) => {
      if (!state.entries[row.code][type]) return;
      const held = Math.max(0, Math.round(value.held));
      state.entries[row.code][type] = { held, attended: Math.max(0, Math.min(held, Math.round(value.attended))) };
    });
    applied += 1;
  });
  if (result.batch && result.batch !== 'ALL') state.batch = result.batch;
  saveState();
  renderAll();
  const missing = result.missing && result.missing.length ? ` Missing from report: ${result.missing.join(', ')}.` : '';
  setStatus(`${label}: ${applied} of ${SUBJECT_ORDER.length} subjects imported${result.batch && result.batch !== 'ALL' ? ` (Batch ${result.batch})` : ''}.${missing}`, applied === 0);
}

async function handleFile(file) {
  if (!file) return;
  setStatus('Reading PDF…');
  try {
    const result = await parseAttendanceReport(file);
    applyParsed(result, file.name);
  } catch (err) {
    setStatus(`Could not read that PDF (${err.message}). Enter the numbers manually, or paste the report text.`, true);
  }
}

function csvEscape(value) {
  const s = String(value == null ? '' : value);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function download(name, text) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportCsv(kind) {
  if (kind === 'log') {
    const lines = ['date,subject_code,subject,type,status'];
    state.log.forEach((e) => lines.push([e.date, e.code, SUBJECTS[e.code] ? SUBJECTS[e.code].name : '', e.type, e.status].map(csvEscape).join(',')));
    download('attendance-log.csv', lines.join('\n'));
    return;
  }
  const lines = ['subject_code,subject,type,attended,held,percent,status'];
  SUBJECT_ORDER.forEach((code) => {
    Object.entries(state.entries[code]).forEach(([type, v]) => {
      const pct = v.held ? (v.attended / v.held) * 100 : 0;
      lines.push([code, SUBJECTS[code].name, TYPE_LABELS[type] || type, v.attended, v.held, v.held ? pct1(pct) : '', v.held ? getAttendanceStatus(pct).label : 'No data'].map(csvEscape).join(','));
    });
  });
  download('attendance-summary.csv', lines.join('\n'));
}

function bind() {
  const fileInput = $('att-file');
  const drop = $('att-drop');
  if (fileInput) fileInput.addEventListener('change', (e) => handleFile(e.target.files && e.target.files[0]));

  if (drop) {
    ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('is-drag'); }));
    ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('is-drag'); }));
    drop.addEventListener('drop', (e) => handleFile(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]));
  }

  const pasteToggle = $('att-paste-toggle');
  const pasteBox = $('att-paste');
  if (pasteToggle && pasteBox) {
    pasteToggle.addEventListener('click', () => { pasteBox.hidden = !pasteBox.hidden; if (!pasteBox.hidden) $('att-paste-text').focus(); });
  }

  const pasteParse = $('att-paste-parse');
  if (pasteParse) {
    pasteParse.addEventListener('click', () => {
      const text = ($('att-paste-text') || {}).value || '';
      if (!text.trim()) { setStatus('Paste the report rows first.', true); return; }
      applyParsed(parseReportText(text), 'Pasted report');
    });
  }

  document.addEventListener('change', (e) => {
    const input = e.target.closest('.att-num');
    if (!input) return;
    const { code, type, field } = input.dataset;
    const entry = state.entries[code] && state.entries[code][type];
    if (!entry) return;
    const value = Math.max(0, Math.round(Number(input.value) || 0));
    entry[field] = value;
    if (entry.attended > entry.held) {
      if (field === 'held') entry.attended = entry.held;
      else entry.held = entry.attended;
    }
    saveState();
    renderAll();
  });

  document.addEventListener('click', (e) => {
    const simBtn = e.target.closest('[data-sim]');
    if (simBtn) {
      const action = simBtn.dataset.sim;
      if (action === 'attend') sim.attend += 1;
      else if (action === 'skip') sim.skip += 1;
      else sim = { attend: 0, skip: 0 };
      renderSim();
      return;
    }

    const exportBtn = e.target.closest('[data-export]');
    if (exportBtn) { exportCsv(exportBtn.dataset.export); return; }

    const removeBtn = e.target.closest('[data-log-remove]');
    if (removeBtn) {
      const index = Number(removeBtn.dataset.logRemove);
      const entry = state.log[index];
      if (entry) {
        const record = state.entries[entry.code] && state.entries[entry.code][entry.type];
        if (record) {
          record.held = Math.max(0, record.held - 1);
          if (entry.status === 'present') record.attended = Math.max(0, record.attended - 1);
        }
        state.log.splice(index, 1);
        saveState();
        renderAll();
      }
      return;
    }

    const resetBtn = e.target.closest('#att-reset');
    if (resetBtn && window.confirm('Clear all saved attendance data?')) {
      state = emptyState();
      sim = { attend: 0, skip: 0 };
      try { localStorage.removeItem(KEY); } catch (err) { /* ignore */ }
      renderAll();
      setStatus('Saved attendance cleared.');
    }
  });

  const logForm = $('att-log-form');
  if (logForm) {
    logForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const date = ($('att-log-date') || {}).value;
      const code = ($('att-log-subject') || {}).value;
      const type = ($('att-log-type') || {}).value;
      const status = ($('att-log-status') || {}).value;
      const record = state.entries[code] && state.entries[code][type];
      if (!date || !code || !type || !record) return;
      record.held += 1;
      if (status === 'present') record.attended += 1;
      state.log.unshift({ date, code, type, status });
      saveState();
      renderAll();
    });
  }

  const subjectSelect = $('att-log-subject');
  if (subjectSelect) subjectSelect.addEventListener('change', renderSelects);
}

export function initAttendance() {
  if (!$('att-root')) return;
  const dateInput = $('att-log-date');
  if (dateInput && !dateInput.value) dateInput.value = new Date().toISOString().slice(0, 10);
  renderAll();
  bind();
  setStatus(state.batch && state.batch !== 'ALL' ? `Loaded saved data (Batch ${state.batch}).` : 'Loaded saved data. Add a report or type the numbers below.');
}
