# Smart Campus Management & Student Services Platform

<!-- TEMP: project introduction / elevator pitch — remove after presentation -->
## Project introduction (elevator pitch)

Colleges still run attendance on paper registers, notices on WhatsApp groups, and leave requests on signed forms. **Smart Campus** replaces all of that with one web app. Students, faculty, HODs and admins log in to a single dashboard and see only what their role allows. Faculty mark attendance in a few clicks and immediately see which students are below 75%. Students check their attendance, results, assignments and notices in one place. HODs approve leaves and resolve complaints without any paperwork.

**In one line:** a role-based campus portal on the MERN stack with JWT auth, 9 data models, 28 REST endpoints, live attendance analytics, and Swagger docs you can test in the browser.

### At a glance

| | |
|---|---|
| **Modules** | Users, Courses, Attendance, Attendance Analytics, Assignments, Notices, Events, Complaints, Leaves, Results |
| **Roles** | Admin, HOD, Faculty, Student, each with its own dashboard tabs and API permissions |
| **Data models** | 9 Mongoose schemas: User, Course, Attendance, Assignment, Notice, Event, Complaint, Leave, Result |
| **API** | 28 REST operations over 20 paths, documented in OpenAPI 3 (`swagger.json`) |
| **Codebase** | ~2,200 lines across routes, models and React components |
| **Team** | 5 members, each owning a full slice (model → route → React screen) |

### Tech stack

| Layer | Technology | Used for |
|---|---|---|
| Frontend | **React 18** + **Vite 5** | Single-page app, one component per module, `useState`/`useEffect` state handling |
| HTTP client | Native `fetch` (wrapped in `client/src/api.js`) | Adds the JWT `Authorization` header, turns non-2xx responses into errors |
| Backend | **Node.js** + **Express 5** | REST API, app-level and route-level middleware |
| Database | **MongoDB** + **Mongoose 9** | Document storage, schema validation (`required`, `enum`, `min`/`max`), `populate()` |
| Auth | **jsonwebtoken** (JWT, 1h expiry) | Stateless login sessions |
| Password security | Node `crypto`: HMAC-SHA-256 + per-user random salt | Stored as `salt:hash`, no plain text passwords |
| Authorization | Custom `allowRoles(...)` middleware | Returns 403 for roles that aren't allowed |
| API docs | **Swagger UI** (`swagger-ui-express`) + OpenAPI 3 | Interactive docs and testing at `/api-docs` |
| Cross-origin | `cors` | Lets the React app on :5173 call the API on :8000 |

### Technical highlights

- **Attendance analytics pipeline**: MongoDB aggregation (`$match → $group → $lookup → $project → $sort`) computes per-student percentages, the class average, and an at-risk list (< 75%) in a single query.
- **Idempotent attendance marking**: `findOneAndUpdate` with `upsert`, so re-marking the same day updates records instead of duplicating them.
- **Layered security**: every request after `/auth` passes through JWT verification, then role checks, then ownership checks (for example, faculty can only mark attendance for their own courses; an HOD only sees their own department).
- **Search and pagination**: `$regex` search plus `skip`/`limit` paging on users, notices and courses.
- **Consistent error contract**: 400 validation, 401 auth, 403 role, 404 not found, 500 server. The frontend shows the server's message directly.
- **Simple, readable architecture**: `server.js → middleware → routes → models`, with no controller layer, so any request can be traced in a single file.

<!-- /TEMP -->

One app for attendance, notices, assignments, events, complaints, leaves and results.
Roles: **Admin, HOD, Faculty, Student**. User flows are in [USER_FLOWS.md](USER_FLOWS.md).

Built the same way as the Day 8 Railway project (MEN-ITM repo):
`server.js` → `routes/` (logic written directly inside each route) → `models/`, with `config/db.js` and `middleware/authMiddleware.js`. **No controllers.**

## Run

```bash
# 1. MongoDB must be running on 127.0.0.1:27017
# 2. Backend (port 8000)
npm install
npm run seed      # demo data (deletes old data in SmartCampusDB)
npm start

# 3. Frontend (port 5173), in a new terminal
cd client
npm install
npm run dev
```

Logins (password `password123`): `admin@campus.com`, `hod@campus.com`, `faculty@campus.com`, `aarav@campus.com` (student). The login page has quick-fill buttons.

## Folder structure

```
server.js                 mounts all routes, app.use(authMiddleware) protects everything after /auth
config/db.js              mongoose.connect
utils/password.js         hashPassword() / checkPassword() - salted HMAC-SHA-256
swagger.json              OpenAPI 3 spec -> Swagger UI at /api-docs
middleware/
  authMiddleware.js       checks JWT, puts decoded user in req.user
  roleMiddleware.js       allowRoles("admin","hod") -> 403 for other roles
models/                   User, Course, Attendance, Assignment, Notice, Event, Complaint, Leave, Result
routes/                   one file per model, all logic inside the route
seed.js                   demo data
client/src/
  api.js                  fetch helper that adds the token
  App.jsx, Login.jsx, Dashboard.jsx (tabs per role)
  components/             one component per module
```

## API

Base URL: **http://localhost:8000**.

**Swagger (API docs + testing): http://localhost:8000/api-docs** (the home page `/` redirects there). The spec lives in `swagger.json` (OpenAPI 3); the raw JSON is at `/api-docs.json` for Postman.

To test protected routes in Swagger: run `POST /auth/login` with **Try it out** → copy the `token` → click **Authorize** → paste it → now **Try it out** works on every endpoint.

| Route | Who |
|---|---|
| `POST /auth/login` | public |
| `POST /users`, `DELETE /users/:id` | admin |
| `GET /users?role=&search=&department=&page=&limit=` | admin, hod (own dept), faculty (students only) |
| `GET /courses`, `POST /courses`, `GET /courses/:id/students` | all read (filtered by role); admin/hod add |
| `POST /attendance/mark` | faculty (own course), admin |
| `GET /attendance?courseId=&date=` | faculty, hod, admin |
| `GET /attendance/my` | student |
| `GET /attendance/dashboard/:courseId` | faculty, hod, admin — **aggregation + $lookup, at-risk < 75%** |
| `GET/POST /assignments`, `POST /assignments/:id/submit` | faculty creates, student submits |
| `GET/POST/DELETE /notices?search=&page=` | all read, staff post, admin/hod delete |
| `GET/POST/DELETE /events` | same as notices |
| `GET/POST /complaints`, `PUT /complaints/:id` | student raises, hod/admin update |
| `GET/POST /leaves`, `PUT /leaves/:id` | student/faculty apply, hod/admin decide |
| `GET/POST /results` | faculty/admin enter, student sees own |

## Where each "backend focus" point is

- **Password hashing** – `utils/password.js`: HMAC-SHA-256 with a secret key + random salt per user, stored as `salt:hash`
- **JWT** – `routes/authRoutes.js` (sign) + `middleware/authMiddleware.js` (verify)
- **Role-based authorization** – `middleware/roleMiddleware.js`, used in every route file
- **Middleware** – app-level `app.use(authMiddleware)` in `server.js`, route-level `allowRoles(...)`
- **Aggregation + $lookup + attendance analytics** – `GET /attendance/dashboard/:courseId`
- **Pagination** – `GET /users`, `GET /notices` (`skip` + `limit`)
- **Search** – `$regex` in `GET /users`, `GET /notices`, `GET /courses`
- **API validation** – `required` checks at the top of every POST/PUT + `required/enum/min/max` in the schemas

## Data flow: frontend ↔ API ↔ backend ↔ database

### The big picture

```
 ┌──────────────────────┐   HTTP request (JSON + token)   ┌──────────────────────────┐   Mongoose query   ┌─────────────┐
 │  React (port 5173)   │ ──────────────────────────────▶ │  Express API (port 8000) │ ─────────────────▶ │  MongoDB    │
 │  components/*.jsx    │                                 │  server.js → middleware  │                    │ SmartCampus │
 │  api.js → fetch()    │ ◀────────────────────────────── │  → routes/*.js → models  │ ◀───────────────── │     DB      │
 └──────────────────────┘   HTTP response (JSON + status) └──────────────────────────┘     documents      └─────────────┘
```

The browser **never** talks to MongoDB directly. Every piece of data goes through the Express API, which checks who you are and what you're allowed to do first.

### Going there: the request (frontend → backend → database)

| # | Where | What happens |
|---|---|---|
| 1 | **Component** (e.g. `MarkAttendance.jsx`) | The user clicks a button. The component takes the values it's holding in `useState` (course, date, absent students) and calls `request("/attendance/mark", "POST", { courseId, date, records })`. |
| 2 | **`client/src/api.js`** | `request()` builds the `fetch` call. It adds `Content-Type: application/json` and `Authorization: Bearer <token>` (the token saved in `localStorage` at login), turns the body into JSON text with `JSON.stringify`, and sends it to `http://localhost:8000/attendance/mark`. |
| 3 | **`server.js` → `cors()`** | Lets a page on port 5173 call a server on port 8000 (the browser blocks this otherwise). |
| 4 | **`server.js` → `express.json()`** | Turns the JSON text back into a JS object in `req.body`. |
| 5 | **`middleware/authMiddleware.js`** | Takes the token from the header and runs `jwt.verify()`. Missing or fake token → sends **401** and stops. Valid token → puts `{ userId, name, role, department, semester }` into `req.user` and calls `next()`. |
| 6 | **`app.use("/attendance", ...)`** | Express matches the URL and hands the request to `routes/attendanceRoutes.js`. |
| 7 | **`allowRoles("faculty","admin")`** | Checks `req.user.role`. A student gets **403** and stops here. |
| 8 | **Route handler** | Validation: missing fields → **400**, course not found → **404**, not your course → **403**. |
| 9 | **Model** (`models/Attendance.js`) | `Attendance.findOneAndUpdate(..., { upsert: true })` asks Mongoose to save the data. Mongoose checks the schema rules (`required`, `enum`) and sends the query to MongoDB. |
| 10 | **MongoDB** | Updates or inserts the documents in the `attendances` collection. |

### Coming back: the response (database → backend → frontend)

| # | Where | What happens |
|---|---|---|
| 11 | **MongoDB → Mongoose** | Returns the saved/found documents as JS objects (`populate()` swaps ids for names where needed). |
| 12 | **Route handler** | Builds the answer and sends it with a status code: `res.status(201).json({ message: "Attendance saved for 8 students" })`. If anything throws, the `catch` sends **500**. |
| 13 | **`api.js`** | `await res.json()` reads the answer. If `res.ok` is false (400/401/403/404/500) it throws an `Error` with the server's `message`; otherwise it returns the data. |
| 14 | **Component** | Puts the data into state (`setMsg(data.message)`, `setStudents(list)`, …). |
| 15 | **React** | Sees the state changed and re-draws the screen, so the user sees the new list or message. |

### Example 1: Login (the only request without a token)

```
Login.jsx ── POST /auth/login { email, password } ──▶ authRoutes.js
                                                      User.findOne({ email })             ──▶ MongoDB users
                                                      checkPassword(typed, saved hash)
                                                      jwt.sign({ userId, role, department, ... }, secret, 1h)
Login.jsx ◀── 200 { token, user: { name, role, department } } ──┘
   localStorage.setItem("token", ...) + setUser(user)  →  App.jsx shows the Dashboard
```
From now on, `api.js` attaches this token to **every** request, and that's how the backend knows who is calling.

### Example 2: Faculty dashboard (reading with aggregation)

```
AttendanceReport.jsx  useEffect → request("/attendance/dashboard/<courseId>")
  → authMiddleware (token ok) → allowRoles("faculty","hod","admin") ok
  → Attendance.aggregate([ $match course → $group per student → $lookup users → $project percent → $sort ])
  → MongoDB returns one row per student
  → route adds atRisk (percent < 75) + classAverage
  ◀ 200 { students: [...], atRisk: [...], classAverage: 89 }
  → setReport(data) → React draws the cards, the red at-risk banner and the % bars
```

### Example 3: When something is wrong (error flow)

```
Student calls POST /attendance/mark
  → authMiddleware ok → allowRoles("faculty","admin") ✗
  ◀ 403 { message: "Access denied for role: student" }
  → api.js: res.ok is false → throw new Error("Access denied for role: student")
  → component's catch → shows the message on screen (nothing was saved)
```

| Status | Sent by | Meaning |
|---|---|---|
| 200 / 201 | route handler | OK / created |
| 400 | route validation | missing or wrong data |
| 401 | authMiddleware / login | no token, bad token, or wrong password |
| 403 | allowRoles / route | logged in but not allowed |
| 404 | route | item not found |
| 500 | route `catch` | something crashed on the server |

## Team and work division

This project was built by a team of 5. Each member owned a full slice (model → route → React screen) so everyone worked on the backend **and** the frontend.

| Member | Area | Backend files | Frontend files | Also did |
|---|---|---|---|---|
| **Member 1** – _[Neel]_ (Team lead) | Project setup, login, security, users | `server.js`, `config/db.js`, `middleware/authMiddleware.js`, `middleware/roleMiddleware.js`, `utils/password.js`, `swagger.json`, `models/User.js`, `routes/authRoutes.js`, `routes/userRoutes.js` | `main.jsx`, `App.jsx`, `Login.jsx`, `Dashboard.jsx`, `api.js`, `components/UserList.jsx`, `components/AddUser.jsx` | Folder structure, JWT + password hashing, role rules, merging everyone's code |
| **Member 2** – _[Nimish]_ | Courses & attendance marking | `models/Course.js`, `models/Attendance.js`, `routes/courseRoutes.js`, `routes/attendanceRoutes.js` (mark, day view, `/my`) | `components/Courses.jsx`, `components/MarkAttendance.jsx`, `components/MyAttendance.jsx` | Upsert logic so re-marking a day doesn't duplicate |
| **Member 3** – _[Swanandi]_ | Attendance analytics & results | `GET /attendance/dashboard/:courseId` (aggregation + `$lookup`), `models/Result.js`, `routes/resultRoutes.js`, `seed.js` | `components/AttendanceReport.jsx`, `components/Results.jsx` | Faculty dashboard (at-risk < 75%), demo data |
| **Member 4** – _[Akshay]_ | Assignments, notices, events | `models/Assignment.js`, `models/Notice.js`, `models/Event.js`, `routes/assignmentRoutes.js`, `routes/noticeRoutes.js`, `routes/eventRoutes.js` | `components/Assignments.jsx`, `components/Notices.jsx`, `components/Events.jsx`, `styles.css` | Search + pagination on notices, UI styling |
| **Member 5** – _[Sneha]_ | Complaints, leaves, testing & docs | `models/Complaint.js`, `models/Leave.js`, `routes/complaintRoutes.js`, `routes/leaveRoutes.js` | `components/Complaints.jsx`, `components/Leaves.jsx` | API + browser testing, ERD, `USER_FLOWS.md`, project report (`docs/`) |

Shared work: everyone tested their own module with all 4 roles, and the whole team reviewed the final demo flow in [USER_FLOWS.md](USER_FLOWS.md).

## Docs

- [`docs/Smart_Campus_Project_Report.docx`](docs/Smart_Campus_Project_Report.docx): full project report (ERD, screenshots, code handbook, testing)
- [`docs/ERD.png`](docs/ERD.png), [`docs/Architecture.png`](docs/Architecture.png), [`docs/Request_Flow.png`](docs/Request_Flow.png): diagrams
- [`USER_FLOWS.md`](USER_FLOWS.md): step-by-step flows for each role
