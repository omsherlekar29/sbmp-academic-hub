import { SUBJECTS, SUBJECT_ORDER } from './subjects.js';
export function getPortion(code){const s=SUBJECTS[code];return s?{code:s.code,name:s.name,units:s.units}:null;}
export function getAllPortions(){return SUBJECT_ORDER.map(getPortion);}