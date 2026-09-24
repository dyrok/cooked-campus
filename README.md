# Smart Campus Management & Student Services Platform

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

- **JWT** – `routes/authRoutes.js` (sign) + `middleware/authMiddleware.js` (verify)
- **Role-based authorization** – `middleware/roleMiddleware.js`, used in every route file
- **Middleware** – app-level `app.use(authMiddleware)` in `server.js`, route-level `allowRoles(...)`
- **Aggregation + $lookup + attendance analytics** – `GET /attendance/dashboard/:courseId`
- **Pagination** – `GET /users`, `GET /notices` (`skip` + `limit`)
- **Search** – `$regex` in `GET /users`, `GET /notices`, `GET /courses`
- **API validation** – `required` checks at the top of every POST/PUT + `required/enum/min/max` in the schemas
