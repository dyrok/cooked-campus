import { useEffect, useState } from "react";
import { request } from "../api";

// faculty / hod dashboard -> attendance % of each student + who is at risk (below 75%)
function AttendanceReport() {
  // courses for dropdown, picked course n the report from backend
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [report, setReport] = useState(null);

  // on open -> load courses n auto pick the first one
  useEffect(() => {
    request("/courses").then((data) => {
      setCourses(data);
      if (data.length > 0) setCourseId(data[0]._id);
    });
  }, []);

  // every time course changes -> get the report (the aggregation route)
  useEffect(() => {
    if (courseId) {
      request("/attendance/dashboard/" + courseId).then(setReport);
    }
  }, [courseId]);

  return (
    <div>
      {/* course dropdown */}
      <div className="card">
        <label>Course: </label>
        <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>{c.code} - {c.title}</option>
          ))}
        </select>
        {courses.length === 0 && <p>No courses found.</p>}
      </div>

      {/* show only after report is loaded */}
      {report && (
        <>
          {/* 3 small boxes on top */}
          <div className="stats">
            <div className="stat"><span>{report.students.length}</span>Students</div>
            <div className="stat"><span>{report.classAverage}%</span>Class average</div>
            <div className="stat risk-stat"><span>{report.atRisk.length}</span>At risk (&lt; 75%)</div>
          </div>

          {/* red box listing at-risk students, only if there are any */}
          {report.atRisk.length > 0 && (
            <div className="card warn">
              <b>At-risk students: </b>
              {report.atRisk.map((s) => s.name + " (" + s.percent + "%)").join(", ")}
            </div>
          )}

          {/* full table, rows below 75% go red */}
          <div className="card">
            <table>
              <thead>
                <tr><th>Roll No</th><th>Name</th><th>Present</th><th>Total</th><th>%</th></tr>
              </thead>
              <tbody>
                {report.students.map((s) => (
                  <tr key={s._id} className={s.percent < 75 ? "risk" : ""}>
                    <td>{s.rollNo}</td>
                    <td>{s.name}</td>
                    <td>{s.present}</td>
                    <td>{s.total}</td>
                    <td>
                      {/* small progress bar, width = percent */}
                      <div className="bar"><div style={{ width: s.percent + "%" }}></div></div>
                      {s.percent}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {report.students.length === 0 && <p>No attendance marked yet.</p>}
          </div>
        </>
      )}
    </div>
  );
}

export default AttendanceReport;
