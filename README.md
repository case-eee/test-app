# Student Score Tracker — Interview App
## Setup & Interviewer Guide

---

## Requirements
- Node.js v18+ installed
- Terminal access

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start

# 3. Open in browser
# http://localhost:3000
```

---

## Planted Bugs (Interviewer Eyes Only)

| # | Location | Bug | What a candidate should notice |
|---|---|---|---|
| 1 | `server.js` line ~53 | Average is divided by `scores.length + 1` instead of `scores.length` — average is always slightly too low | "The average doesn't look right" |
| 2 | `server.js` line ~38 | POST `/students` returns `res.status(200)` when score is invalid (non-numeric or out of 0–100 range) instead of `res.status(400)` | Network tab shows 200 on a bad request; no error shown to user |
| 3 | `server.js` line ~62 | GET `/students` sorts by name using `localCompare` (typo — should be `localeCompare`) causing a crash when list is sorted | Console error when "Sort A–Z" is clicked |
| 4 | `public/app.js` line ~31 | `fetchStudents()` is called before the DOM is ready — on slow loads, the list container is null and silently fails | List sometimes appears empty on first load; refresh fixes it |

### Suggested Bug Order for Entry-Level Candidates
Use bugs **1 → 2 → 3** in that order. Bug 4 is a stretch — only surface it if the candidate moves through 1–3 quickly and you have time.

---

## Interviewer Tips
- **Don't confirm** the candidate has found the right bug until they've explained *why* it's wrong
- If stuck on bug 1 for >8 minutes, nudge: *"What does the data look like when you inspect the API response directly?"*
- If stuck on bug 2: *"What would you expect to see in the network tab when you submit a bad score?"*
- If stuck on bug 3: *"Have you tried any of the UI controls yet?"*
