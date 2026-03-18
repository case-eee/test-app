const API = "http://localhost:3000";

// ─── State ────────────────────────────────────────────────────────────────────
let sorted = false;

// ─── DOM refs ─────────────────────────────────────────────────────────────────
// BUG 4: These refs are grabbed at parse time, before the DOM has finished
// rendering. On slow connections or machines, `listEl` and others can be null
// when fetchStudents() fires below, causing a silent failure (empty list).
// Fix: wrap in DOMContentLoaded, or move the script tag to end of <body>.
const listEl    = document.getElementById("student-list");
const countEl   = document.getElementById("total-count");
const avgEl     = document.getElementById("class-average");
const errorEl   = document.getElementById("form-error");
const nameInput = document.getElementById("input-name");
const scoreInput= document.getElementById("input-score");

// ─── Fetch & render ───────────────────────────────────────────────────────────
async function fetchStudents(sort = false) {
  try {
    const url = sort ? `${API}/students?sort=name` : `${API}/students`;
    const res  = await fetch(url);
    const data = await res.json();

    if (!listEl) return; // guard for Bug 4 scenario

    if (!data.students || data.students.length === 0) {
      listEl.innerHTML = '<p class="empty-msg">No students yet. Add one above!</p>';
      countEl.textContent = "0";
      avgEl.textContent   = "—";
      return;
    }

    countEl.textContent = data.students.length;
    avgEl.textContent   = data.average;

    listEl.innerHTML = data.students
      .map(
        (s) => `
        <div class="student-row">
          <div class="student-info">
            <span class="student-name">${escapeHtml(s.name)}</span>
            <span class="student-score ${scoreClass(s.score)}">${s.score}</span>
          </div>
          <button class="btn-delete" data-id="${s.id}" title="Remove student">✕</button>
        </div>`
      )
      .join("");

    // Attach delete handlers
    listEl.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", () => deleteStudent(Number(btn.dataset.id)));
    });

  } catch (err) {
    console.error("Failed to load students:", err);
    if (listEl) listEl.innerHTML = '<p class="empty-msg error-msg">Failed to load students.</p>';
  }
}

// ─── Add student ──────────────────────────────────────────────────────────────
async function addStudent() {
  const name  = nameInput.value.trim();
  const score = scoreInput.value.trim();

  hideError();

  try {
    const res  = await fetch(`${API}/students`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, score: score === "" ? score : Number(score) }),
    });

    const data = await res.json();

    // BUG 2 (client side effect): Because the server returns 200 on validation
    // errors, this check never catches them — res.ok is true for 200.
    // The `data.error` path below does handle it, but a proper fix would be
    // checking res.status === 201 or having the server return 400.
    if (data.error) {
      showError(data.error);
      return;
    }

    nameInput.value  = "";
    scoreInput.value = "";
    fetchStudents(sorted);

  } catch (err) {
    showError("Something went wrong. Please try again.");
    console.error(err);
  }
}

// ─── Delete student ───────────────────────────────────────────────────────────
async function deleteStudent(id) {
  try {
    await fetch(`${API}/students/${id}`, { method: "DELETE" });
    fetchStudents(sorted);
  } catch (err) {
    console.error("Delete failed:", err);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function scoreClass(score) {
  if (score >= 90) return "score-high";
  if (score >= 70) return "score-mid";
  return "score-low";
}

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.classList.remove("hidden");
}

function hideError() {
  errorEl.textContent = "";
  errorEl.classList.add("hidden");
}

function escapeHtml(str) {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

// ─── Event listeners ──────────────────────────────────────────────────────────
document.getElementById("btn-add").addEventListener("click", addStudent);
document.getElementById("btn-sort").addEventListener("click", () => {
  sorted = !sorted;
  document.getElementById("btn-sort").textContent = sorted ? "Clear Sort" : "Sort A–Z";
  fetchStudents(sorted);
});

nameInput.addEventListener("keydown", (e) => { if (e.key === "Enter") addStudent(); });
scoreInput.addEventListener("keydown",(e) => { if (e.key === "Enter") addStudent(); });

// BUG 4: fetchStudents called immediately at script parse time.
// If the DOM isn't ready, listEl etc. are null and the list silently fails to render.
// Fix would be: document.addEventListener("DOMContentLoaded", () => fetchStudents());
fetchStudents();
