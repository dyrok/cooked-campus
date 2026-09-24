import { useEffect, useState } from "react";
import { request } from "../api";

// student -> sees own marks. faculty -> enters marks for a course
function Results({ user }) {
  // state for both roles
  const [results, setResults] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({}); // marks typed in -> { studentId: marks }

  // on open -> student loads own results, faculty loads courses for dropdown
  useEffect(() => {
    if (user.role === "student") {
      request("/results").then(setResults);
    } else {
      request("/courses").then((data) => {
        setCourses(data);
        if (data.length > 0) setCourseId(data[0]._id);
      });
    }
  }, []);

  // course changes -> load its students + marks already saved (to fill the boxes)
  useEffect(() => {
    if (!courseId) return;
    request("/courses/" + courseId + "/students").then(setStudents);
    request("/results?course=" + courseId).then((data) => {
      // turn results array into { studentId: marks } object
      const m = {};
      data.forEach((r) => (m[r.student._id] = r.marks));
      setMarks(m);
    });
  }, [courseId]);

  // save marks for one student (saving again just updates it)
  const save = async (studentId) => {
    try {
      await request("/results", "POST", { student: studentId, course: courseId, marks: Number(marks[studentId]) });
      alert("Saved");
    } catch (err) {
      alert(err.message);
    }
  };

  // student view -> just a table of my results
  if (user.role === "student") {
    return (
      <div className="card">
        <h3>My Results</h3>
        <table>
          <thead><tr><th>Course</th><th>Marks (out of 100)</th></tr></thead>
          <tbody>
            {results.map((r) => (
              <tr key={r._id}>
                <td>{r.course.code} - {r.course.title}</td>
                <td>{r.marks}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {results.length === 0 && <p>No results published yet.</p>}
      </div>
    );
  }

  // faculty view -> course dropdown + marks box for each student
  return (
    <div className="card">
      <h3>Enter Marks</h3>
      <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
        {courses.map((c) => (
          <option key={c._id} value={c._id}>{c.code} - {c.title}</option>
        ))}
      </select>
      <table>
        <thead><tr><th>Roll No</th><th>Name</th><th>Marks</th><th></th></tr></thead>
        <tbody>
          {students.map((s) => (
            <tr key={s._id}>
              <td>{s.rollNo}</td>
              <td>{s.name}</td>
              <td>
                {/* ?? "" -> show empty box if no marks yet */}
                <input type="number" min="0" max="100" value={marks[s._id] ?? ""}
                  onChange={(e) => setMarks({ ...marks, [s._id]: e.target.value })} />
              </td>
              <td><button className="small" onClick={() => save(s._id)}>Save</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Results;
