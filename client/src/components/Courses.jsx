import { useEffect, useState } from "react";
import { request } from "../api";

// add course form + list of courses
function Courses({ user }) {
  // courses list, faculty list (for dropdown) n the form boxes
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  // hod starts w/ their own dept filled in
  const [department, setDepartment] = useState(user.department || "");
  const [semester, setSemester] = useState("");
  const [facultyId, setFacultyId] = useState("");

  // get courses (backend already filters by role)
  const loadCourses = () => {
    request("/courses").then(setCourses);
  };

  // on page open -> load courses + faculty for the dropdown
  useEffect(() => {
    loadCourses();
    request("/users?role=faculty&limit=100").then((data) => setFaculty(data.data));
  }, []);

  // add course, clear boxes n reload list
  const addCourse = async (e) => {
    e.preventDefault();
    try {
      await request("/courses", "POST", { code, title, department, semester: Number(semester), faculty: facultyId });
      setCode("");
      setTitle("");
      setSemester("");
      loadCourses();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      {/* add course form */}
      <div className="card">
        <h3>Add Course</h3>
        <form onSubmit={addCourse} className="grid">
          <input placeholder="Code (CS403)" value={code} onChange={(e) => setCode(e.target.value)} required />
          <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          {/* hod cant change dept, its locked */}
          <input placeholder="Department" value={department} onChange={(e) => setDepartment(e.target.value)} disabled={user.role === "hod"} required />
          <input type="number" placeholder="Semester" value={semester} onChange={(e) => setSemester(e.target.value)} required />
          <select value={facultyId} onChange={(e) => setFacultyId(e.target.value)}>
            <option value="">-- Assign faculty --</option>
            {faculty.map((f) => (
              <option key={f._id} value={f._id}>{f.name} ({f.department})</option>
            ))}
          </select>
          <button className="action" type="submit">Add Course</button>
        </form>
      </div>
      {/* courses table */}
      <div className="card">
        <h3>Courses</h3>
        <table>
          <thead>
            <tr><th>Code</th><th>Title</th><th>Dept</th><th>Sem</th><th>Faculty</th></tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c._id}>
                <td>{c.code}</td><td>{c.title}</td><td>{c.department}</td><td>{c.semester}</td>
                {/* show '-' if no faculty assigned */}
                <td>{c.faculty ? c.faculty.name : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Courses;
