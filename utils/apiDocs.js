// api docs data + the html page shown at http://localhost:8000
// to document a new route just add an object to the right group below

const BASE_URL = "http://localhost:8000";

// every endpoint, grouped by module
// roles = who can call it ("public" = no token needed)
const apiDocs = [
  {
    group: "Auth",
    endpoints: [
      {
        method: "POST", path: "/auth/login", roles: ["public"],
        desc: "Log in with email + password. Returns a JWT token (valid 1 hour) to send with every other request.",
        body: { email: "faculty@campus.com", password: "password123" },
        response: { message: "Login successful", token: "eyJhbGciOiJIUzI1NiIs...", user: { id: "6ab4...", name: "Prof. Sharma", email: "faculty@campus.com", role: "faculty", department: "CSE" } },
        errors: ["400 email or password missing", "401 Invalid email or password"],
      },
    ],
  },
  {
    group: "Users",
    endpoints: [
      {
        method: "POST", path: "/users", roles: ["admin"],
        desc: "Add a student, faculty, HOD or admin. The password is saved as a salted HMAC-SHA-256 hash.",
        body: { name: "Ishaan Verma", email: "ishaan@campus.com", password: "password123", role: "student", department: "CSE", semester: 4, section: "A", rollNo: "CSE109" },
        response: { message: "User added", user: { _id: "6ab5...", name: "Ishaan Verma", email: "ishaan@campus.com", role: "student" } },
        errors: ["400 name, email, password and role are required", "400 Email already exists"],
      },
      {
        method: "GET", path: "/users", roles: ["admin", "hod", "faculty"],
        desc: "List users with search and pagination. HOD only gets their own department, faculty only gets students. Passwords are never returned.",
        query: [["role", "student (default) | faculty | hod | admin"], ["search", "matches name, email or roll no (case-insensitive)"], ["department", "e.g. CSE (ignored for HOD)"], ["page", "page number, default 1"], ["limit", "items per page, default 5"]],
        response: { data: [{ _id: "6ab4...", name: "Aarav", email: "aarav@campus.com", role: "student", department: "CSE", semester: 4, rollNo: "CSE101" }], total: 8, page: 1, pages: 2 },
      },
      {
        method: "DELETE", path: "/users/:id", roles: ["admin"],
        desc: "Delete a user by id.",
        response: { message: "User deleted" },
        errors: ["404 User not found"],
      },
    ],
  },
  {
    group: "Courses",
    endpoints: [
      {
        method: "POST", path: "/courses", roles: ["admin", "hod"],
        desc: "Add a course and (optionally) assign a faculty. HOD's department is forced to their own.",
        body: { code: "CS403", title: "Computer Networks", department: "CSE", semester: 4, faculty: "<faculty user _id>" },
        response: { _id: "6ab4...", code: "CS403", title: "Computer Networks", department: "CSE", semester: 4, faculty: "6ab4..." },
        errors: ["400 code, title, department and semester are required"],
      },
      {
        method: "GET", path: "/courses", roles: ["admin", "hod", "faculty", "student"],
        desc: "Courses for the logged-in user: faculty → courses they teach, student → their department + semester, HOD → their department, admin → all.",
        query: [["search", "matches course title"]],
        response: [{ _id: "6ab4...", code: "CS401", title: "Database Management Systems", department: "CSE", semester: 4, faculty: { _id: "6ab4...", name: "Prof. Sharma" } }],
      },
      {
        method: "GET", path: "/courses/:id/students", roles: ["admin", "hod", "faculty"],
        desc: "Students in a course (same department and semester as the course).",
        response: [{ _id: "6ab4...", name: "Aarav", rollNo: "CSE101" }],
        errors: ["404 Course not found"],
      },
    ],
  },
  {
    group: "Attendance",
    endpoints: [
      {
        method: "POST", path: "/attendance/mark", roles: ["faculty", "admin"],
        desc: "Save attendance for one course on one date. Re-saving the same date updates the old records (upsert), so no duplicates. Faculty can only mark their own course.",
        body: { courseId: "<course _id>", date: "2026-09-24", records: [{ studentId: "<student _id>", status: "present" }, { studentId: "<student _id>", status: "absent" }] },
        response: { message: "Attendance saved for 8 students" },
        errors: ["400 courseId, date and records are required", "404 Course not found", "403 This is not your course"],
      },
      {
        method: "GET", path: "/attendance", roles: ["faculty", "admin", "hod"],
        desc: "Records already marked for a course on a date (used to pre-fill the marking screen).",
        query: [["courseId", "course _id"], ["date", "YYYY-MM-DD"]],
        response: [{ _id: "6ab4...", course: "6ab4...", student: "6ab4...", date: "2026-09-24", status: "absent" }],
      },
      {
        method: "GET", path: "/attendance/my", roles: ["student"],
        desc: "The logged-in student's attendance percentage in every course.",
        response: [{ code: "CS401", title: "Database Management Systems", present: 5, total: 10, percent: 50 }],
      },
      {
        method: "GET", path: "/attendance/dashboard/:courseId", roles: ["faculty", "hod", "admin"],
        desc: "Faculty dashboard. Aggregation pipeline $match → $group → $lookup (users) → $unwind → $project → $sort gives each student's %, plus the at-risk list (below 75%) and class average.",
        response: { students: [{ _id: "6ab4...", name: "Kabir", rollNo: "CSE103", present: 5, total: 10, percent: 50 }], atRisk: [{ name: "Kabir", percent: 50 }, { name: "Rohan", percent: 70 }], classAverage: 89 },
      },
    ],
  },
  {
    group: "Assignments",
    endpoints: [
      {
        method: "POST", path: "/assignments", roles: ["faculty"],
        desc: "Create an assignment for a course.",
        body: { course: "<course _id>", title: "ER Diagram for Library", description: "Draw ER diagram for a library system", dueDate: "2026-10-01" },
        response: { _id: "6ab4...", course: "6ab4...", title: "ER Diagram for Library", createdBy: "6ab4...", submissions: [] },
        errors: ["400 course and title are required"],
      },
      {
        method: "GET", path: "/assignments", roles: ["admin", "hod", "faculty", "student"],
        desc: "Faculty → assignments they created (with submissions). Student → assignments of their courses.",
        response: [{ _id: "6ab4...", title: "ER Diagram for Library", course: { code: "CS401", title: "Database Management Systems" }, dueDate: "2026-10-01", submissions: [{ student: { name: "Aarav", rollNo: "CSE101" }, answer: "https://drive.google.com/...", submittedAt: "2026-09-24T10:00:00.000Z" }] }],
      },
      {
        method: "POST", path: "/assignments/:id/submit", roles: ["student"],
        desc: "Submit (or re-submit) an answer or link. Re-submitting replaces the old answer.",
        body: { answer: "https://drive.google.com/my-er-diagram" },
        response: { message: "Submitted" },
        errors: ["400 answer is required", "404 Assignment not found"],
      },
    ],
  },
  {
    group: "Results",
    endpoints: [
      {
        method: "POST", path: "/results", roles: ["faculty", "admin"],
        desc: "Save marks (0–100) for a student in a course. Saving again for the same student + course updates it.",
        body: { student: "<student _id>", course: "<course _id>", marks: 82 },
        response: { _id: "6ab4...", student: "6ab4...", course: "6ab4...", marks: 82 },
        errors: ["400 student, course and marks are required", "400 marks must be between 0 and 100"],
      },
      {
        method: "GET", path: "/results", roles: ["admin", "hod", "faculty", "student"],
        desc: "Student → only their own results. Others → filter by course.",
        query: [["course", "course _id (not used for students)"]],
        response: [{ _id: "6ab4...", student: { name: "Aarav", rollNo: "CSE101" }, course: { code: "CS401", title: "Database Management Systems" }, marks: 82 }],
      },
    ],
  },
  {
    group: "Notices",
    endpoints: [
      {
        method: "POST", path: "/notices", roles: ["admin", "hod", "faculty"],
        desc: "Post a notice to the whole college (\"ALL\") or one department.",
        body: { title: "Mid-sem exams from 5 Oct", body: "Timetable will be shared soon.", department: "ALL" },
        response: { _id: "6ab4...", title: "Mid-sem exams from 5 Oct", body: "Timetable will be shared soon.", department: "ALL", postedBy: "6ab4...", createdAt: "2026-09-24T10:00:00.000Z" },
        errors: ["400 title and body are required"],
      },
      {
        method: "GET", path: "/notices", roles: ["admin", "hod", "faculty", "student"],
        desc: "Newest first, with search and pagination. Non-admins only see \"ALL\" + their own department.",
        query: [["search", "matches notice title"], ["page", "default 1"], ["limit", "default 5"]],
        response: { data: [{ _id: "6ab4...", title: "Mid-sem exams from 5 Oct", department: "ALL", postedBy: { name: "Admin", role: "admin" } }], total: 2, page: 1, pages: 1 },
      },
      {
        method: "DELETE", path: "/notices/:id", roles: ["admin", "hod"],
        desc: "Delete a notice.",
        response: { message: "Notice deleted" },
      },
    ],
  },
  {
    group: "Events",
    endpoints: [
      {
        method: "POST", path: "/events", roles: ["admin", "hod", "faculty"],
        desc: "Add a college event.",
        body: { title: "Tech Fest 2026", description: "Coding contest + hackathon", date: "2026-10-15", venue: "Main Auditorium" },
        response: { _id: "6ab4...", title: "Tech Fest 2026", date: "2026-10-15", venue: "Main Auditorium", createdBy: "6ab4..." },
        errors: ["400 title and date are required"],
      },
      {
        method: "GET", path: "/events", roles: ["admin", "hod", "faculty", "student"],
        desc: "All events, sorted by date.",
        response: [{ _id: "6ab4...", title: "Tech Fest 2026", description: "Coding contest + hackathon", date: "2026-10-15", venue: "Main Auditorium" }],
      },
      {
        method: "DELETE", path: "/events/:id", roles: ["admin", "hod"],
        desc: "Delete an event.",
        response: { message: "Event deleted" },
      },
    ],
  },
  {
    group: "Complaints",
    endpoints: [
      {
        method: "POST", path: "/complaints", roles: ["student"],
        desc: "Raise a complaint. Student id and department are taken from the token.",
        body: { subject: "WiFi", text: "WiFi not working in hostel block B" },
        response: { _id: "6ab4...", student: "6ab4...", department: "CSE", subject: "WiFi", text: "WiFi not working in hostel block B", status: "open" },
        errors: ["400 subject and text are required"],
      },
      {
        method: "GET", path: "/complaints", roles: ["student", "hod", "admin"],
        desc: "Student → own complaints, HOD → their department, admin → all. Newest first.",
        query: [["status", "open | in-progress | resolved"]],
        response: [{ _id: "6ab4...", student: { name: "Aarav", rollNo: "CSE101" }, subject: "WiFi", text: "WiFi not working in hostel block B", status: "open" }],
      },
      {
        method: "PUT", path: "/complaints/:id", roles: ["hod", "admin"],
        desc: "Change a complaint's status.",
        body: { status: "resolved" },
        response: { _id: "6ab4...", subject: "WiFi", status: "resolved" },
        errors: ["400 Invalid status", "404 Complaint not found"],
      },
    ],
  },
  {
    group: "Leaves",
    endpoints: [
      {
        method: "POST", path: "/leaves", roles: ["student", "faculty"],
        desc: "Apply for leave.",
        body: { fromDate: "2026-10-03", toDate: "2026-10-04", reason: "Attending conference" },
        response: { _id: "6ab4...", applicant: "6ab4...", department: "CSE", fromDate: "2026-10-03", toDate: "2026-10-04", reason: "Attending conference", status: "pending" },
        errors: ["400 fromDate, toDate and reason are required", "400 fromDate cannot be after toDate"],
      },
      {
        method: "GET", path: "/leaves", roles: ["admin", "hod", "faculty", "student"],
        desc: "Student/faculty → own requests, HOD → their department, admin → all.",
        response: [{ _id: "6ab4...", applicant: { name: "Diya", role: "student" }, fromDate: "2026-09-28", toDate: "2026-09-29", reason: "Family function", status: "pending" }],
      },
      {
        method: "PUT", path: "/leaves/:id", roles: ["hod", "admin"],
        desc: "Approve or reject a leave request.",
        body: { status: "approved" },
        response: { _id: "6ab4...", status: "approved" },
        errors: ["400 status must be approved or rejected", "404 Leave not found"],
      },
    ],
  },
];

// turn a js value into safe html text (so < > & dont break the page)
const esc = (text) => String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const json = (value) => esc(JSON.stringify(value, null, 2));
// "/users/:id" -> "users-id" so we can link to it
const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// html for one endpoint card
const endpointHtml = (e) => {
  const isPublic = e.roles[0] === "public";
  let html = `<div class="ep" id="${slug(e.method + " " + e.path)}">`;
  html += `<div class="ep-head"><span class="m ${e.method}">${e.method}</span><code class="path">${esc(e.path)}</code>`;
  html += isPublic ? `<span class="lock open">no token</span>` : `<span class="lock">🔒 token</span>`;
  html += `</div><p>${esc(e.desc)}</p>`;
  html += `<div class="roles">Who can call it: ${e.roles.map((r) => `<span class="role ${r}">${r}</span>`).join("")}</div>`;
  if (e.query) {
    html += `<h4>Query params</h4><table>${e.query.map((q) => `<tr><td><code>${q[0]}</code></td><td>${esc(q[1])}</td></tr>`).join("")}</table>`;
  }
  if (e.body) {
    html += `<h4>Request body</h4><pre>${json(e.body)}</pre>`;
  }
  html += `<h4>Response</h4><pre>${json(e.response)}</pre>`;
  if (e.errors) {
    html += `<h4>Errors</h4><ul class="errs">${e.errors.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
  }
  return html + `</div>`;
};

// the whole docs page
const apiDocsPage = () => {
  let count = 0;
  apiDocs.forEach((g) => (count += g.endpoints.length));

  // left side menu: group name + its endpoints
  const nav = apiDocs.map((g) =>
    `<div class="nav-g"><a href="#${slug(g.group)}">${g.group}</a>${g.endpoints.map((e) =>
      `<a class="nav-e" href="#${slug(e.method + " " + e.path)}"><span class="m ${e.method}">${e.method}</span>${esc(e.path)}</a>`).join("")}</div>`).join("");

  // main content: one section per group
  const sections = apiDocs.map((g) => `<section id="${slug(g.group)}"><h2>${g.group}</h2>${g.endpoints.map(endpointHtml).join("")}</section>`).join("");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Smart Campus API Docs</title>
<style>
:root{--bg:#f4f6fb;--card:#fff;--text:#1a1a1a;--muted:#6b7280;--line:#e5e7eb;--code:#f3f4f6;--nav:#1f2937;--accent:#2563eb}
@media (prefers-color-scheme: dark){:root{--bg:#0f172a;--card:#1e293b;--text:#e5e7eb;--muted:#94a3b8;--line:#334155;--code:#0b1220;--nav:#020617;--accent:#60a5fa}}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--text)}
aside{position:fixed;top:0;left:0;bottom:0;width:280px;overflow-y:auto;background:var(--nav);color:#e5e7eb;padding:20px 14px}
aside h1{font-size:18px;margin:0 0 4px}aside .sub{color:#9ca3af;font-size:12px;margin-bottom:16px}
aside a{display:block;color:#e5e7eb;text-decoration:none;font-size:13px;padding:3px 6px;border-radius:4px}
aside a:hover{background:#374151}.nav-g{margin-bottom:10px}.nav-g>a{font-weight:600;font-size:14px}
.nav-e{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px!important;color:#cbd5e1!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.nav-e .m{font-size:9px;min-width:44px;padding:1px 4px;margin-right:6px}
main{margin-left:280px;padding:28px 36px;max-width:1100px}
main a{color:var(--accent)}
@media (max-width:800px){aside{position:static;width:auto}main{margin-left:0;padding:16px}}
.card,.ep{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:18px 20px;margin:14px 0}
h2{margin:30px 0 6px;font-size:22px;border-bottom:2px solid var(--line);padding-bottom:6px}
h4{margin:14px 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)}
code,pre{font-family:ui-monospace,Menlo,Consolas,monospace}
pre{background:var(--code);border:1px solid var(--line);border-radius:8px;padding:12px;overflow-x:auto;font-size:13px;margin:0}
.base{font-size:22px;font-weight:700;color:var(--accent)}
.ep-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.path{font-size:16px;font-weight:600}
.m{display:inline-block;min-width:62px;text-align:center;font-size:12px;font-weight:700;color:#fff;border-radius:5px;padding:3px 8px;font-family:ui-monospace,Menlo,monospace}
.GET{background:#059669}.POST{background:#2563eb}.PUT{background:#d97706}.DELETE{background:#dc2626}
.lock{font-size:12px;color:var(--muted);border:1px solid var(--line);border-radius:10px;padding:2px 8px}.lock.open{color:#059669;border-color:#059669}
.roles{font-size:13px;color:var(--muted)}.role{display:inline-block;font-size:12px;border-radius:10px;padding:1px 9px;margin-left:5px;background:#e0e7ff;color:#3730a3}
.role.public{background:#d1fae5;color:#065f46}.role.admin{background:#fee2e2;color:#991b1b}.role.hod{background:#fef3c7;color:#92400e}.role.student{background:#dbeafe;color:#1e40af}
table{border-collapse:collapse;width:100%;font-size:14px}td,th{border-bottom:1px solid var(--line);padding:6px 8px;text-align:left;vertical-align:top}
.errs{margin:0;padding-left:18px;font-size:14px;color:#dc2626}
</style></head><body>
<aside><h1>Smart Campus API</h1><div class="sub">${count} endpoints · v1.0</div>
<div class="nav-g"><a href="#start">Getting started</a><a href="#auth">Authentication</a><a href="#codes">Status codes</a></div>${nav}</aside>
<main>
<section id="start"><div class="card">
<h4>Base URL</h4><div class="base">${BASE_URL}</div>
<p>All requests and responses use JSON. Every route except <code>POST /auth/login</code> (and this page) needs a login token.
Demo accounts: <code>admin@campus.com</code>, <code>hod@campus.com</code>, <code>faculty@campus.com</code>, <code>aarav@campus.com</code> — password <code>password123</code>.
Machine-readable version: <a href="/docs.json">/docs.json</a>.</p></div></section>
<section id="auth"><h2>Authentication</h2><div class="card">
<p><b>1.</b> Log in to get a token:</p>
<pre>curl -X POST ${BASE_URL}/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"faculty@campus.com","password":"password123"}'</pre>
<p><b>2.</b> Send the token in the <code>Authorization</code> header on every other request:</p>
<pre>curl ${BASE_URL}/courses -H "Authorization: Bearer &lt;token&gt;"</pre>
<p>The token lasts <b>1 hour</b> and carries your id, role and department, which the server uses to decide what you can see.</p></div></section>
<section id="codes"><h2>Status codes</h2><div class="card"><table>
<tr><th>Code</th><th>Meaning</th></tr>
<tr><td><code>200</code> / <code>201</code></td><td>OK / created</td></tr>
<tr><td><code>400</code></td><td>Missing or wrong data (validation)</td></tr>
<tr><td><code>401</code></td><td>No token, bad or expired token, or wrong password</td></tr>
<tr><td><code>403</code></td><td>Logged in, but your role isn't allowed</td></tr>
<tr><td><code>404</code></td><td>Item or route not found</td></tr>
<tr><td><code>500</code></td><td>Something broke on the server</td></tr>
</table><p>Every error looks like <code>{ "message": "..." }</code>.</p></div></section>
${sections}
</main></body></html>`;
};

module.exports = { apiDocs, apiDocsPage };
