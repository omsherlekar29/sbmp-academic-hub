// Regression test for the attendance report parser.
// Run: node tests/parse-report.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseReportText, detectBatch } from '../js/pdf-import.js';
import { SUBJECTS, SUBJECT_ORDER } from '../data/subjects.js';

const text = readFileSync(new URL('./fixtures/attendance-report.txt', import.meta.url), 'utf8');
const result = parseReportText(text);
const row = (code) => result.rows.find((r) => r.code === code);

assert.equal(result.batch, 'S2', 'practical batch should be detected from PR-CSE-B-S2');
assert.equal(result.rows.length, 7, 'all seven subjects should be found');
assert.deepEqual(result.missing, [], 'no subject should be missing');

// Figures are "conducted, attended" in the report.
const expected = {
  EMT268901: { TH: [31, 30], TU: [21, 21] },
  ASC268902: { TH: [34, 34], PR: [16, 14] },
  CMS268903: { TH: [33, 30], TU: [11, 11] },
  ENG268904: { PR: [20, 20], TH: [16, 14] },
  FCS260801: { PR: [22, 22], TH: [20, 19] },
  UHV268905: { TH: [17, 17], TU: [7, 7] },
  WSD260802: { PR: [44, 44], TH: [23, 22] },
};

let attended = 0;
let held = 0;
Object.entries(expected).forEach(([code, types]) => {
  const found = row(code);
  assert.ok(found, `${code} should be parsed`);
  Object.entries(types).forEach(([type, [expectedHeld, expectedAttended]]) => {
    const value = found.values[type];
    assert.ok(value, `${code} ${type} should be parsed`);
    assert.equal(value.held, expectedHeld, `${code} ${type} conducted`);
    assert.equal(value.attended, expectedAttended, `${code} ${type} attended`);
    held += value.held;
    attended += value.attended;
  });
});

// The report's own footer says 315 conducted / 305 attended / 96.83%.
assert.equal(held, 315, 'total conducted must match the report footer');
assert.equal(attended, 305, 'total attended must match the report footer');
assert.equal(((attended / held) * 100).toFixed(2), '96.83', 'overall percentage must match the report');

// Every parsed type must exist in the subject data, or the dashboard drops it.
result.rows.forEach(({ code, values }) => {
  Object.keys(values).forEach((type) => {
    assert.ok(SUBJECTS[code].type.includes(type), `${code} declares ${type}`);
  });
});

// Averages/footers must never be read as a subject row.
assert.ok(!result.rows.some((r) => r.values.TH && r.values.TH.held === 315), 'average row must be ignored');

// Typed-in fallback keeps working with the same conducted-then-attended order.
const typed = parseReportText('EMT268901 TH 31 30');
assert.deepEqual(typed.rows[0].values.TH, { attended: 30, held: 31 });
assert.equal(typed.missing.length, 6);

// Batch detection still reads S1 reports.
assert.equal(detectBatch('PR-CSE-B-S1 row'), 'S1');

console.log(`parse-report: OK — ${result.rows.length} subjects, ${attended}/${held} = ${((attended / held) * 100).toFixed(2)}%, batch ${result.batch}`);
console.log(`subject order checked: ${SUBJECT_ORDER.length} codes`);
