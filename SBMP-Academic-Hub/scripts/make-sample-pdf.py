#!/usr/bin/env python3
"""Generate tests/fixtures/attendance-report.pdf — a text-based stand-in for the
college attendance PDF, so the upload path (PDF.js) can be tested end to end.
Run: python3 scripts/make-sample-pdf.py
"""
from pathlib import Path

HEADER = [
    "SVKM'S SBMP AND COLLEGE OF ENGINEERING",
    "Student Name: SHERLEKAR OM BHARAT BHAKTI   Student Number: 57507260018",
    "Additional ID Number: B053   Program Name: DIPLOMA IN COMPUTER ENGINEERING",
    "Academic Year & Academic Session 2026-2027 , Semester I",
    "Attendance Report Date: From 03.08.2026 To 24.10.2026",
    "S.No. Subject Class Total No. Of Classes Conducted Total No. Of Classes Attended Percentage (%)",
]

ROWS = [
    "1 APPLIED SCIENCE APPLIED SCIENCE TH-CSE-B 34 34 96.00",
    "2 APPLIED SCIENCE APPLIED SCIENCE PR-CSE-B-S2 16 14",
    "3 COMMUNICATION SKILLS COMMUNICATION SKILLS TH-CSE-B 33 30 93.18",
    "4 COMMUNICATION SKILLS COMMUNICATION SKILLS TU-CSE-B 11 11",
    "5 ENGINEERING MATHEMATICS ENGINEERING MATHEMATICS TH-CSE-B 31 30 98.08",
    "6 ENGINEERING MATHEMATICS ENGINEERING MATHEMATICS TU-CSE-B 21 21",
    "7 ENGINEERING GRAPHICS ENGINEERING GRAPHICS PR-CSE-B-S2 20 20 94.44",
    "8 ENGINEERING GRAPHICS ENGINEERING GRAPHICS TH-CSE-B 16 14",
    "9 FUNDAMENTALS OF COMPUTING SYSTEM FUNDAMENTALS OF COMPUTIN SYS PR-CSE-B-S2 22 22 97.62",
    "10 FUNDAMENTALS OF COMPUTING SYSTEM FUNDAMENTALS OF COMPUTING SYSTE TH-CSE-B 20 19",
    "11 UNIVERSAL HUMAN VALUES UNIVERSAL HUMAN VALUES TH-CSE-B 17 17 100.00",
    "12 UNIVERSAL HUMAN VALUES UNIVERSAL HUMAN VALUES TU-CSE-B 7 7",
    "13 WEBSITE DESIGNING WEBSITE DESIGNING PR-CSE-B-S2 44 44 98.51",
    "14 WEBSITE DESIGNING WEBSITE DESIGNING TH-CSE-B 23 22",
]

FOOTER = [
    "Average Attendance 315 305 96.83",
    "Students/ Parents are requested to contact Registrar/Vice Principal at SBMP, for Query regarding attendance if any.",
    "This is system generated attendance report and needs no signature.... 24.10.2026 11:34:32",
]


def escape(text: str) -> str:
    return text.replace("\\", r"\\").replace("(", r"\(").replace(")", r"\)")


def content_stream() -> bytes:
    lines = HEADER + ROWS + FOOTER
    body = ["BT", "/F1 7 Tf", "11 TL", "24 800 Td"]
    for line in lines:
        body.append(f"({escape(line)}) Tj T*")
    body.append("ET")
    return ("\n".join(body) + "\n").encode("latin-1")


def build() -> bytes:
    stream = content_stream()
    objects = [
        b"<</Type/Catalog/Pages 2 0 R>>",
        b"<</Type/Pages/Kids[3 0 R]/Count 1>>",
        b"<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>",
        b"<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>",
        b"<</Length " + str(len(stream)).encode("latin-1") + b">>\nstream\n" + stream + b"endstream",
    ]

    out = bytearray(b"%PDF-1.4\n")
    offsets = []
    for number, body in enumerate(objects, start=1):
        offsets.append(len(out))
        out += f"{number} 0 obj\n".encode("latin-1") + body + b"\nendobj\n"

    xref_at = len(out)
    out += f"xref\n0 {len(objects) + 1}\n".encode("latin-1")
    out += b"0000000000 65535 f \n"
    for offset in offsets:
        out += f"{offset:010d} 00000 n \n".encode("latin-1")
    out += f"trailer\n<</Size {len(objects) + 1}/Root 1 0 R>>\nstartxref\n{xref_at}\n%%EOF\n".encode("latin-1")
    return bytes(out)


def main() -> None:
    target = Path(__file__).resolve().parent.parent / "tests" / "fixtures" / "attendance-report.pdf"
    target.parent.mkdir(parents=True, exist_ok=True)
    data = build()
    target.write_bytes(data)
    print(f"wrote {target} ({len(data)} bytes)")


if __name__ == "__main__":
    main()
