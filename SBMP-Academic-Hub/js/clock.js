import { TIMETABLE_DIV_B, TIME_SLOTS } from '../data/timetable.js';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function periodLabel(index) {
 if (index === 4) return 'Lunch';
 return 'Period ' + (index < 4 ? index + 1 : index);
}

function classEntries(dayName, index) {
 const day = TIMETABLE_DIV_B[dayName];
 if (!day) return [];
 const cell = day[TIME_SLOTS[index]];
 if (!cell) return [];
 const list = Array.isArray(cell) ? cell : [cell];
 return list.filter((entry) => entry && entry.type === 'CLASS');
}

function describeEntries(entries) {
 return entries.map((entry) => {
  const name = entry.name || entry.code || '';
  const batch = entry.batch && entry.batch !== 'ALL' ? ` (${entry.batch})` : '';
  const room = entry.room ? ` \u00b7 ${entry.room}` : '';
  return `${name}${batch}${room}`;
 }).join(' / ');
}

function slotStart(index) {
 return 8 * 60 + index * 60;
}

// Pure helper so the schedule text can be tested without a DOM.
export function describeNow(now = new Date()) {
 const minutes = now.getHours() * 60 + now.getMinutes();
 const today = DAY_NAMES[now.getDay()];

 // "Now" only makes sense on a day that has a timetable; on a free period
 // fall through so the card shows the next real class instead of a dead end.
 if (TIMETABLE_DIV_B[today]) {
  for (let i = 0; i < TIME_SLOTS.length; i += 1) {
   const start = slotStart(i);
   if (minutes < start || minutes >= start + 60) continue;
   const entries = classEntries(today, i);
   if (entries.length) {
    return { kind: 'now', text: `Now: ${periodLabel(i)} \u00b7 ${describeEntries(entries)}` };
   }
  }
 }

 for (let offset = 0; offset < 8; offset += 1) {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
  const dayName = DAY_NAMES[date.getDay()];
  for (let i = 0; i < TIME_SLOTS.length; i += 1) {
   const start = slotStart(i);
   if (offset === 0 && start <= minutes) continue;
   const entries = classEntries(dayName, i);
   if (!entries.length) continue;
   const hour = String(Math.floor(start / 60)).padStart(2, '0');
   const when = offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : dayName;
   return { kind: 'next', text: `Next: ${when} ${hour}:00 \u00b7 ${describeEntries(entries)}` };
  }
 }

 return { kind: 'none', text: 'No classes scheduled in the next week' };
}

export function initClock() {
 const timeEl = document.getElementById('clock-time');
 const dateEl = document.getElementById('clock-date');
 const periodEl = document.getElementById('clock-period') || document.getElementById('radar-period');
 if (!timeEl && !dateEl) return;

 function upd() {
  const now = new Date();
  if (timeEl) {
   const h24 = now.getHours();
   const minutes = String(now.getMinutes()).padStart(2, '0');
   const seconds = String(now.getSeconds()).padStart(2, '0');
   const suffix = h24 >= 12 ? 'PM' : 'AM';
   const hour12 = h24 % 12 || 12;
   timeEl.textContent = `${hour12}:${minutes}:${seconds} ${suffix}`;
  }
  if (dateEl) {
   dateEl.textContent = 'Date: ' + DAY_NAMES[now.getDay()] + ', ' + now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  if (periodEl) periodEl.textContent = describeNow(now).text;
 }

 upd();
 setInterval(upd, 1000);
}
