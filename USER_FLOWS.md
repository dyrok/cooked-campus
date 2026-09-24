# Smart Campus — User Flows

Everyone starts at the same place:

```
Open app → Login page → enter email + password
        → POST /auth/login → server checks users collection
        → sends back JWT token + user (role)
        → token saved in localStorage
        → Dashboard shows tabs based on role
```

Every request after login sends `Authorization: Bearer <token>`.
`authMiddleware` checks the token → `allowRoles(...)` checks the role → route runs.

---

## 1. Admin (whole college)

| Flow | Steps | API |
|---|---|---|
| Add a user | Add User tab → fill name, email, password, role (+ dept / sem / roll no) → Add | `POST /users` |
| View students / faculty | Students or Faculty tab → search by name / email / roll → Prev / Next pages | `GET /users?role=&search=&page=` |
| Remove a user | Students tab → Delete | `DELETE /users/:id` |
| Add a course | Courses tab → code, title, dept, sem, pick faculty → Add | `POST /courses` |
| See attendance of any course | Attendance Report tab → pick course | `GET /attendance/dashboard/:courseId` |
| Post notice / event | Notices / Events tab → fill form → Post | `POST /notices`, `POST /events` |
| Handle complaints | Complaints tab → Start → Resolve | `PUT /complaints/:id` |
| Approve leave | Leaves tab → Approve / Reject | `PUT /leaves/:id` |

## 2. HOD (only their own department)

| Flow | Steps | API |
|---|---|---|
| Department attendance report | Attendance Report tab (first screen) → pick a course → see % + at-risk | `GET /attendance/dashboard/:courseId` |
| View dept students / faculty | Students / Faculty tab (server forces `department = HOD's dept`) | `GET /users` |
| Add a dept course | Courses tab (department is locked to HOD's) | `POST /courses` |
| Resolve dept complaints | Complaints tab → Start / Resolve | `PUT /complaints/:id` |
| Approve dept leaves (students + faculty) | Leaves tab → Approve / Reject | `PUT /leaves/:id` |
| Post / delete notices & events | Notices / Events tab | `POST`, `DELETE` |

## 3. Faculty

| Flow | Steps | API |
|---|---|---|
| **Dashboard** (first screen) | Pick course → students count, class average, **at-risk list (< 75%)**, table with % bars | `GET /attendance/dashboard/:courseId` (aggregation + $lookup) |
| Mark attendance | Mark Attendance tab → pick course + date → tick absent students → Save. Opening the same date again shows what was saved; saving again updates it | `GET /courses/:id/students`, `POST /attendance/mark` |
| Create assignment | Assignments tab → course, title, description, due date → Create | `POST /assignments` |
| Check submissions | Assignments tab → each card lists who submitted + their answer | `GET /assignments` |
| Enter marks | Results tab → pick course → type marks (0–100) → Save per student | `POST /results` |
| Apply for leave | Leaves tab → from, to, reason → Apply → wait for HOD | `POST /leaves` |
| Post notice / event | Notices / Events tab | `POST /notices`, `POST /events` |

## 4. Student

| Flow | Steps | API |
|---|---|---|
| Check attendance (first screen) | My Attendance → % per course, red if below 75% | `GET /attendance/my` |
| Submit assignment | Assignments tab → paste answer / drive link → Submit (can re-submit) | `POST /assignments/:id/submit` |
| See results | Results tab | `GET /results` (server only returns own) |
| Read notices | Notices tab → search + pages (college-wide + own dept only) | `GET /notices` |
| See events | Events tab | `GET /events` |
| Raise complaint | Complaints tab → subject + details → Submit → watch status open → in-progress → resolved | `POST /complaints` |
| Apply for leave | Leaves tab → dates + reason → status pending → approved / rejected | `POST /leaves` |

---

## End-to-end story (good for the demo / viva)

1. **Admin** adds a new student and a course, assigns Prof. Sharma.
2. **Faculty** marks attendance daily → the Dashboard shows Kabir at 50% and Rohan at 70% in red (**at risk**).
3. **Faculty** posts an assignment → **Student** submits a link → faculty sees it under Submissions.
4. **Student** raises a WiFi complaint → **HOD** clicks Start → Resolve → student sees "resolved".
5. **Faculty** applies for leave → **HOD** approves it.
6. **Faculty** enters marks → **Student** sees them in Results.
