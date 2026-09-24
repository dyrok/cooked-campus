import { useEffect, useState } from "react";
import { request } from "../api";

// student sees their own attendance % per course
function MyAttendance() {
  // list of courses w/ present, total, percent
  const [list, setList] = useState([]);

  // on open -> get my attendance from backend
  useEffect(() => {
    request("/attendance/my").then(setList);
  }, []);

  return (
    <div className="card">
      <h3>My Attendance</h3>
      {/* red row + warning if below 75% */}
      <table>
        <thead>
          <tr><th>Course</th><th>Present</th><th>Total</th><th>%</th></tr>
        </thead>
        <tbody>
          {list.map((c) => (
            <tr key={c.code} className={c.percent < 75 ? "risk" : ""}>
              <td>{c.code} - {c.title}</td>
              <td>{c.present}</td>
              <td>{c.total}</td>
              <td>
                {c.percent}% {c.percent < 75 && <b className="error"> (below 75%!)</b>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* nothing marked yet */}
      {list.length === 0 && <p>No attendance yet.</p>}
    </div>
  );
}

export default MyAttendance;
