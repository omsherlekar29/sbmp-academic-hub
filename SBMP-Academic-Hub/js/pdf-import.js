// Client-side attendance report parser.
// Text extraction uses PDF.js, loaded on demand from a CDN. If it cannot
// load (offline or blocked), the caller falls back to manual or pasted input.
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

export function detectBatch(text) {
  const m = String(text).match(/PR-CSE-B\s*-\s*S([12])/i);
  return m ? `S${m[1]}` : 'ALL';
}

function numbersIn(segment) {
  return (segment.match(/\d{1,4}/g) || []).map(Number).filter((n) => n <= 1000);
}

// Tolerant parse: for each known subject code, read the figures that follow it
// (attended/held), stopping before the next subject so rows cannot bleed.
export function parseReportText(text) {
  const upper = String(text).toUpperCase();
  const rows = [];
  const missing = [];

  SUBJECT_ORDER.forEach((code) => {
    const at = upper.indexOf(code);
    if (at === -1) { missing.push(code); return; }

    let segment = upper.slice(at + code.length);
    SUBJECT_ORDER.forEach((other) => {
      if (other === code) return;
      const stop = segment.indexOf(other);
      if (stop !== -1) segment = segment.slice(0, stop);
    });

    const nums = numbersIn(segment);
    if (nums.length < 2) { missing.push(code); return; }

    // Some entries repeat a type code (e.g. ['TH','TH']); collapse those or the
    // second assignment overwrites the first with zeros.
    const rawTypes = (SUBJECTS[code].type && SUBJECTS[code].type.length) ? SUBJECTS[code].type : ['TH'];
    const types = [...new Set(rawTypes)];
    const values = {};
    if (types.length >= 2 && nums.length >= 4) {
      values[types[0]] = { attended: nums[0], held: nums[1] };
      values[types[1]] = { attended: nums[2], held: nums[3] };
    } else {
      values[types[0]] = { attended: nums[0], held: nums[1] };
    }
    rows.push({ code, values });
  });

  return { batch: detectBatch(text), rows, missing };
}

export async function parseAttendanceReport(file) {
  const text = await extractPdfText(file);
  return { ...parseReportText(text), text };
}
