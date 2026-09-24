import { useEffect, useState } from "react";
import { request } from "../api";

// faculty marks who is absent for a course on a date
function MarkAttendance() {
  // todays date as yyyy-mm-dd (same format as the date input)
  const today = new Date().toISOString().slice(0, 10);
  // state: courses, picked course, date, students, absent ids, msg
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [date, setDate] = useState(today);
  const [students, setStudents] = useState([]);
  const [absent, setAbsent] = useState([]); // ids of the absent students
  const [msg, setMsg] = useState("");

  // on open -> load my courses, pick the first
  useEffect(() => {
    request("/courses").then((data) => {
      setCourses(data);
      if (data.length > 0) setCourseId(data[0]._id);
    });
  }, []);

  // when course or date changes -> load students + whatever was already saved that day (so we can edit it)
  useEffect(() => {
    if (!courseId) return;
    setMsg("");
    request("/courses/" + courseId + "/students").then(setStudents);
    request("/attendance?courseId=" + courseId + "&date=" + date).then((records) => {
      // keep only absent ones n take their student ids
      setAbsent(records.filter((r) => r.status === "absent").map((r) => r.student));
    });
  }, [courseId, date]);

  // checkbox click -> add to absent list or remove from it
  const toggle = (id) => {
    if (absent.includes(id)) {
      setAbsent(absent.filter((a) => a !== id));
    } else {
      setAbsent([...absent, id]);
    }
  };

  // save -> make a record for every student (absent if in list, else present)
  const save = async () => {
    const records = students.map((s) => ({
      studentId: s._id,
      status: absent.includes(s._id) ? "absent" : "present",
    }));
    try {
      // send all of them to backend in one go
      const data = await request("/attendance/mark", "POST", { courseId, date, records });
      setMsg(data.message);
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <div className="card">
      <h3>Mark Attendance</h3>
      {/* pick course n date */}
      <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
        {courses.map((c) => (
          <option key={c._id} value={c._id}>{c.code} - {c.title}</option>
        ))}
      </select>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <p className="muted">Everyone is present by default. Tick the students who are absent.</p>
      {/* students list, ticked = absent (row goes red) */}
      <table>
        <thead>
          <tr><th>Roll No</th><th>Name</th><th>Absent?</th></tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s._id} className={absent.includes(s._id) ? "risk" : ""}>
              <td>{s.rollNo}</td>
              <td>{s.name}</td>
              <td><input type="checkbox" checked={absent.includes(s._id)} onChange={() => toggle(s._id)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* live count */}
      <p>Present: {students.length - absent.length} / {students.length}</p>
      <button className="action" onClick={save} disabled={students.length === 0}>Save Attendance</button>
      {msg && <p>{msg}</p>}
    </div>
  );
}

export default MarkAttendance;
