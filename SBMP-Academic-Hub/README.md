# SBMP Academic Hub

A student-built academic portal for the **Computer Engineering Diploma, Semester I, Division B** at Shri Bhagubhai Mafatlal Polytechnic (SVKM). It brings the timetable, a 75% attendance tracker with PDF import, the syllabus, faculty and student directories, notices, a task planner and the academic calendar into one place. Plain HTML, CSS and ES modules, no build step, no backend.

## Short description

> Academic portal for SBMP Computer Engineering (Semester I, Division B): timetable, 75% attendance tracking with official PDF import, unit-wise syllabus, faculty and student directories, notices, task planner and calendar. Light and dark mode, fully client-side.

## Features

- **Timetable** — division timetable with S1/S2 batch filters, merged two-hour lab blocks, current-period highlighting and a print layout.
- **Attendance tracker** — import the official college attendance PDF (PDF.js), paste the report text, or type the numbers. Theory, tutorial and practical rows are tracked separately against the 75% threshold, with a what-if simulator (+1 attend / +1 skip), a daily log and CSV export.
- **Subject pages** — unit-wise syllabus, course outcomes, practicals and tutorials, learning resources, websites, and a per-subject task planner.
- **Directories** — 9 faculty and 63 students, with only roll number, name, batch and salutation stored for students (no SAP or registration numbers).
- **Notices and calendar** — notices list plus an academic calendar strip with a one-click `.ics` export.
- **Task planner** — add, edit, complete and filter tasks across all subjects.
- **Global search** — `Ctrl/⌘ + K` overlay covering pages, subjects, students, faculty and notices.
- **Theming** — light and dark palettes from one semantic token set, applied before first paint so navigation never flashes white, defaulting to the OS preference.
- **Responsive** — grouped navigation with a "More" menu, layouts that hold from 320px up, and print rules on every page.

## Quick start

ES modules cannot load over `file://`, so serve the folder rather than double-clicking `index.html`:

```bash
cd SBMP-Academic-Hub
python3 -m http.server 8000
# open http://localhost:8000
```

Any static host works (GitHub Pages, Netlify, Cloudflare Pages). There is nothing to build or install.

## Project structure

```
index.html          home page: live clock, quick access, notices, calendar strip
pages/              11 pages: timetable, attendance, subjects, portion, faculty,
                    students, notices, planner, feedback, academics, department
subjects/           7 subject detail pages
css/                style.css (layout and type), themes.css (colour tokens),
                    responsive.css, print.css
js/                 14 modules: layout, theme, clock, search, attendance,
                    pdf-import, planner, subjects, students, notices, feedback, polish
data/               7 data files: subjects, students, faculty, notices,
                    calendar, timetable, team
tests/              report fixture, sample PDF and parser regression test
scripts/            generator for the sample attendance PDF
```

## Attendance report parser

The college report lists one row per class type (`TH-CSE-B`, `PR-CSE-B-S2`, `TU-CSE-B`), gives **conducted before attended**, uses subject names (sometimes truncated in the export), prints subject-level percentages, and PDF.js joins a whole page into one space-separated string. `js/pdf-import.js` therefore finds rows by class token rather than newline, maps subject names through aliases declared in `data/subjects.js`, merges theory, tutorial and practical rows, and ignores the `Average Attendance` footer.

Run the regression test against the real report text:

```bash
node tests/parse-report.mjs
# parse-report: OK — 7 subjects, 305/315 = 96.83%, batch S2
```

- `tests/fixtures/attendance-report.txt` — report text exactly as extracted from the PDF
- `tests/fixtures/attendance-report.pdf` — text-based sample used to exercise the upload path
- `scripts/make-sample-pdf.py` — regenerates that sample PDF

## Data and privacy

Everything is served from this repository except the PDF.js library, which is loaded from a CDN only when someone imports a PDF. Attendance, planner tasks and feedback live in the visitor's `localStorage` and are never uploaded anywhere. The student directory deliberately stores only public class-list fields.

## Browser support

Modern evergreen browsers (Chrome, Edge, Firefox, Safari). Requires ES modules and `localStorage`; the theme and search features degrade gracefully without JavaScript.

## Credits

Built by Team TechNova, Division B — 7 subjects, 8 notices, 13 calendar events.

| Roll | Name | Role |
| --- | --- | --- |
| B041 | Chitraksh Vijay Raikar | Testing & Calendar |
| B052 | Mohammedabdullah M. Shaikh | Documentation & Print Design |
| B053 | Om Bharat Sherlekar | Team Lead |
| B056 | Gunja Rajesh Soni | UI & Theming |
| B060 | Karan Ashok Tiwari | Academic Content |

Footer text: `© 2026 Team TechNova · All rights reserved` and `Built by B041 · B052 · B053 · B056 · B060`.
