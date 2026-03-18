const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// In-memory data store
let students = [
  { id: 1, name: "Jordan Ellis",  score: 88 },
  { id: 2, name: "Casey Morgan",  score: 74 },
  { id: 3, name: "Alex Rivera",   score: 91 },
  { id: 4, name: "Taylor Brooks", score: 65 },
  { id: 5, name: "Morgan Lee",    score: 79 },
];
let nextId = 6;

// ─── GET /students ────────────────────────────────────────────────────────────
// Returns student list. Supports ?sort=name query param.
app.get("/students", (req, res) => {
  let result = [...students];

  if (req.query.sort === "name") {
    result.sort((a, b) => {
      // BUG 3: Typo — `localCompare` does not exist on String.
      // Should be `localeCompare`. This throws a TypeError and crashes
      // the sort when the endpoint is called with ?sort=name.
      return a.name.localCompare(b.name);
    });
  }

  // BUG 1: Average divisor is wrong — divides by length + 1 instead of length.
  // This means the reported average is always slightly lower than the real value.
  // With seed data (88+74+91+65+79 = 397, n=5), real avg = 79.4, buggy avg ≈ 66.17.
  const total = result.reduce((sum, s) => sum + s.score, 0);
  const average = result.length > 0
    ? (total / (result.length + 1)).toFixed(1)   // ← BUG 1
    : 0;

  res.json({ students: result, average });
});

// ─── POST /students ───────────────────────────────────────────────────────────
// Adds a new student. Expects { name: string, score: number }.
app.post("/students", (req, res) => {
  const { name, score } = req.body;

  // Validate name
  if (!name || typeof name !== "string" || name.trim() === "") {
    // BUG 2: Validation failures return HTTP 200 instead of 400.
    // The error message is correct but the status code signals success,
    // which misleads any client checking status codes.
    return res.status(200).json({ error: "Name is required." });  // ← BUG 2
  }

  // Validate score
  const parsed = Number(score);
  if (isNaN(parsed) || parsed < 0 || parsed > 100) {
    return res.status(200).json({ error: "Score must be a number between 0 and 100." }); // ← BUG 2 (same)
  }

  const newStudent = { id: nextId++, name: name.trim(), score: parsed };
  students.push(newStudent);
  res.status(201).json(newStudent);
});

// ─── DELETE /students/:id ─────────────────────────────────────────────────────
app.delete("/students/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = students.findIndex((s) => s.id === id);
  if (idx === -1) return res.status(404).json({ error: "Student not found." });
  students.splice(idx, 1);
  res.status(204).send();
});

// ─── Root ─────────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Student Score Tracker running at http://localhost:${PORT}`);
});
