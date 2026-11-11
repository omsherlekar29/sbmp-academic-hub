// Client-side attendance report parser for the SBMP attendance PDF.
//
// The college report prints one row per class type, e.g.
//   1 APPLIED SCIENCE APPLIED SCIENCE TH-CSE-B 34 34 96.00
//   2 APPLIED SCIENCE APPLIED SCIENCE PR-CSE-B-S2 16 14
// where the figures are "Total No. Of Classes Conducted" then "Total No. Of
// Classes Attended" (conducted first), the class column carries the type
// (TH/PR/TU) and the practical batch, and the percentage is a subject total
// printed on the first row of each subject. PDF.js joins a whole page into one
// space-separated string, so rows are found by class token, not by newline.
import { SUBJECTS, SUBJECT_ORDER } from '../data/subjects.js';

const PDFJS_VERSION = '3.11.174';
const CDN = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/`;
let loader = null;

function loadPdfJs() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (loader) return loader;
  loader = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = CDN + 'build/pdf.min.js';
    script.onload = () => {
      const lib = window.pdfjsLib;
      if (!lib) { reject(new Error('PDF.js did not initialise')); return; }
      try { lib.GlobalWorkerOptions.workerSrc = CDN + 'build/pdf.worker.min.js'; } catch (e) { /* worker optional */ }
      resolve(lib);
    };
    script.onerror = () => reject(new Error('PDF.js could not be loaded'));
    document.head.appendChild(script);
  });
  return loader;
}

export async function extractPdfText(file) {
  const lib = await loadPdfJs();
  const data = await file.arrayBuffer();
  const pdf = await lib.getDocument({ data }).promise;
  const pages = [];
  for (let p = 1; p <= pdf.numPages; p += 1) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => item.str).join(' '));
  }
  return pages.join('\n');
}

// TH-CSE-B, PR-CSE-B-S2, TU-CSE-B ...
const CLASS_TOKEN = /(TH|PR|TU)\s*-\s*CSE\s*-\s*B(?:\s*-\s*S?([12]))?/gi;
const TYPE_ORDER = ['TH', 'PR', 'TU'];

export function detectBatch(text) {
  const m = String(text).match(/PR\s*-\s*CSE\s*-\s*B\s*-\s*S([12])/i);
  return m ? `S${m[1]}` : 'ALL';
}

function squash(value) {
  return String(value).toUpperCase().replace(/[^A-Z]+/g, ' ').replace(/\s+/g, ' ').trim();
}

// Longest alias wins, so "ENGINEERING MATHEMATICS" cannot be mistaken for
// "ENGINEERING GRAPHICS" when a truncated name leaves both prefixes present.
const NAME_INDEX = SUBJECT_ORDER.map((code) => {
  const subject = SUBJECTS[code];
  const names = [subject.name, subject.short, ...(subject.match || [])].filter(Boolean);
  return { code, keys: [...new Set(names.map(squash))].filter(Boolean).sort((a, b) => b.length - a.length) };
});

function findSubject(chunk) {
  const text = squash(chunk);
  if (!text) return null;
  let best = null;
  NAME_INDEX.forEach(({ code, keys }) => {
    keys.forEach((key) => {
      if (text.includes(key) && (!best || key.length > best.length)) best = { code, length: key.length };
    });
  });
  return best ? best.code : null;
}

function firstNumbers(segment, limit = 2) {
  const out = [];
  const re = /\d+(?:\.\d+)?/g;
  let m;
  while (out.length < limit && (m = re.exec(segment))) out.push(Number(m[0]));
  return out;
}

function classTokens(text) {
  const out = [];
  CLASS_TOKEN.lastIndex = 0;
  let m;
  while ((m = CLASS_TOKEN.exec(text))) {
    out.push({ index: m.index, end: m.index + m[0].length, type: m[1].toUpperCase() });
  }
  return out;
}

function addValues(store, code, type, held, attended) {
  const safeHeld = Math.max(0, Math.round(held));
  const safeAttended = Math.max(0, Math.min(safeHeld, Math.round(attended)));
  if (!store.has(code)) store.set(code, {});
  const values = store.get(code);
  values[type] = { attended: safeAttended, held: safeHeld };
}

export function parseReportText(text) {
  const raw = String(text || '');
  const store = new Map();
  const found = classTokens(raw);

  found.forEach((token, i) => {
    const previousEnd = i === 0 ? 0 : found[i - 1].end;
    const code = findSubject(raw.slice(previousEnd, token.index));
    if (!code) return;

    const stopAt = i + 1 < found.length ? found[i + 1].index : raw.length;
    let segment = raw.slice(token.end, stopAt);
    const average = segment.search(/average\s+attendance/i);
    if (average !== -1) segment = segment.slice(0, average);

    const nums = firstNumbers(segment, 2);
    if (nums.length < 2) return;
    addValues(store, code, token.type, nums[0], nums[1]);
  });

  // Fallback for typed-in rows such as "EMT268901 TH 31 30" (conducted, attended).
  SUBJECT_ORDER.forEach((code) => {
    const re = new RegExp(`${code}\\s*(?:(TH|PR|TU)\\s*)?(\\d{1,4})\\s+(\\d{1,4})`, 'i');
    const m = raw.match(re);
    if (!m) return;
    const defaults = SUBJECTS[code].type || ['TH'];
    const type = (m[1] || defaults[0]).toUpperCase();
    const existing = store.get(code);
    if (existing && existing[type]) return;
    addValues(store, code, type, Number(m[2]), Number(m[3]));
  });

  const rows = SUBJECT_ORDER.filter((code) => store.has(code)).map((code) => {
    const values = {};
    const found = store.get(code);
    TYPE_ORDER.forEach((type) => { if (found[type]) values[type] = found[type]; });
    return { code, values };
  });

  return {
    batch: detectBatch(raw),
    rows,
    missing: SUBJECT_ORDER.filter((code) => !store.has(code)),
  };
}

export async function parseAttendanceReport(file) {
  const text = await extractPdfText(file);
  return { ...parseReportText(text), text };
}
