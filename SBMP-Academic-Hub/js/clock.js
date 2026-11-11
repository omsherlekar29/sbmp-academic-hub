export function initClock() {
 const t = document.getElementById('clock-time');
 const d = document.getElementById('clock-date');
 const r = document.getElementById('radar-period');
 if (!t && !d) return;

 // Timetable data for Division B, Batch S1 & S2
 const TIMETABLE_DIV_B = {
  Monday: {
    slots: [
      { start: 8 * 60, end: 9 * 60, label: 'Period 1' },
      { start: 9 * 60, end: 10 * 60, label: 'Period 2' },
      { start: 10 * 60, end: 11 * 60, label: 'Period 3' },
      { start: 11 * 60, end: 12 * 60, label: 'Period 4' },
      { start: 12 * 60, end: 13 * 60, label: 'Lunch Break' },
      { start: 13 * 60, end: 14 * 60, label: 'Period 5' },
      { start: 14 * 60, end: 15 * 60, label: 'Period 6' }
    ]
  },
  Tuesday: {
    slots: [
      { start: 8 * 60, end: 9 * 60, label: 'Period 1' },
      { start: 9 * 60, end: 10 * 60, label: 'Period 2' },
      { start: 10 * 60, end: 11 * 60, label: 'Period 3' },
      { start: 11 * 60, end: 12 * 60, label: 'Period 4' },
      { start: 12 * 60, end: 13 * 60, label: 'Lunch Break' },
      { start: 13 * 60, end: 14 * 60, label: 'Period 5' },
      { start: 14 * 60, end: 15 * 60, label: 'Period 6' }
    ]
  },
  Wednesday: {
    slots: [
      { start: 8 * 60, end: 9 * 60, label: 'Period 1' },
      { start: 9 * 60, end: 10 * 60, label: 'Period 2' },
      { start: 10 * 60, end: 11 * 60, label: 'Period 3' },
      { start: 11 * 60, end: 12 * 60, label: 'Period 4' },
      { start: 12 * 60, end: 13 * 60, label: 'Lunch Break' },
      { start: 13 * 60, end: 14 * 60, label: 'Period 5' },
      { start: 14 * 60, end: 15 * 60, label: 'Period 6' }
    ]
  },
  Thursday: {
    slots: [
      { start: 8 * 60, end: 9 * 60, label: 'Period 1' },
      { start: 9 * 60, end: 10 * 60, label: 'Period 2' },
      { start: 10 * 60, end: 11 * 60, label: 'Period 3' },
      { start: 11 * 60, end: 12 * 60, label: 'Period 4' },
      { start: 12 * 60, end: 13 * 60, label: 'Lunch Break' },
      { start: 13 * 60, end: 14 * 60, label: 'Period 5' },
      { start: 14 * 60, end: 15 * 60, label: 'Period 6' }
    ]
  },
  Friday: {
    slots: [
      { start: 8 * 60, end: 9 * 60, label: 'Period 1' },
      { start: 9 * 60, end: 10 * 60, label: 'Period 2' },
      { start: 10 * 60, end: 11 * 60, label: 'Period 3' },
      { start: 11 * 60, end: 12 * 60, label: 'Period 4' },
      { start: 12 * 60, end: 13 * 60, label: 'Lunch Break' },
      { start: 13 * 60, end: 14 * 60, label: 'Period 5' },
      { start: 14 * 60, end: 15 * 60, label: 'Period 6' }
    ]
  },
  Saturday: {
    slots: []
  },
  Sunday: {
    slots: []
  }
};

 function upd() {
  const now = new Date();
  if (t) {
   const h24 = now.getHours();
   const m = String(now.getMinutes()).padStart(2, '0');
   const s = String(now.getSeconds()).padStart(2, '0');
   const ap = h24 >= 12 ? 'PM' : 'AM';
   const h12 = h24 % 12 || 12;
   t.textContent = `${h12}:${m}:${s} ${ap}`;
  }
  if (d) {
   const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
   const dayName = dayNames[now.getDay()];
   d.textContent = 'Date: ' + dayName + ', ' + now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  if (r) {
   const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
   const daySchedule = TIMETABLE_DIV_B[dayName] || {};
   const currentSlot = daySchedule.slots.find(s => now.getHours() * 60 >= s.start && now.getHours() * 60 < s.end);
   if (now.getDay() === 0 || now.getHours() < 8 || now.getHours() >= 17) {
    r.textContent = 'Outside College Hours \u2014 Next Class Monday 08:00 AM';
   } else if (now.getDay() === 6) {
    r.textContent = 'Saturday \u2014 No scheduled classes';
   } else if (currentSlot) {
    r.textContent = 'Now: ' + currentSlot.label;
   } else {
    const nextSlot = daySchedule.slots.filter(s => now.getHours() * 60 < s.end).sort((a, b) => a.start - b.start)[0];
    if (nextSlot) {
     const minutesUntil = nextSlot.start - now.getHours() * 60 - now.getMinutes();
     r.textContent = 'Next: ' + nextSlot.label + ' in ' + minutesUntil + ' min';
    } else {
     r.textContent = 'Outside College Hours \u2014 Next Class Monday 08:00 AM';
    }
   }
  }
 }
 upd();
 setInterval(upd, 1000);
}
