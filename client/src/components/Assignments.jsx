import { useEffect, useState } from "react";
import { request } from "../api";

// faculty -> create + see submissions. student -> see n submit
function Assignments({ user }) {
  // list + faculty form boxes
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [course, setCourse] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [answers, setAnswers] = useState({}); // student's typed answer per assignment -> { assignmentId: text }

  // get assignments (backend gives the right ones for the role)
  const loadAssignments = () => {
    request("/assignments").then(setAssignments);
  };

  // on open -> load list. faculty also needs their courses for dropdown
  useEffect(() => {
    loadAssignments();
    if (user.role === "faculty") {
      request("/courses").then((data) => {
        setCourses(data);
        if (data.length > 0) setCourse(data[0]._id);
      });
    }
  }, []);

  // faculty creates assignment, clear form, reload
  const addAssignment = async (e) => {
    e.preventDefault();
    await request("/assignments", "POST", { course, title, description, dueDate });
    setTitle("");
    setDescription("");
    setDueDate("");
    loadAssignments();
  };

  // student submits answer for that one assignment
  const submit = async (id) => {
    try {
      await request("/assignments/" + id + "/submit", "POST", { answer: answers[id] });
      alert("Submitted!");
      loadAssignments();
    } catch (err) {
      alert(err.message);
    }
  };

  // find my submission (match my user id), undefined if i havent submitted
  const mySubmission = (a) => {
    return a.submissions.find((s) => s.student && s.student._id === user.id);
  };

  return (
    <div>
      {/* create form, faculty only */}
      {user.role === "faculty" && (
        <div className="card">
          <h3>New Assignment</h3>
          <form onSubmit={addAssignment} className="grid">
            <select value={course} onChange={(e) => setCourse(e.target.value)}>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>{c.code}</option>
              ))}
            </select>
            <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            <button className="action" type="submit">Create</button>
          </form>
        </div>
      )}

      {/* one card per assignment */}
      {assignments.map((a) => (
        <div className="card" key={a._id}>
          <h3>{a.title} <span className="badge">{a.course && a.course.code}</span></h3>
          <p>{a.description}</p>
          <p className="muted">Due: {a.dueDate || "-"}</p>

          {/* faculty sees who submitted */}
          {user.role === "faculty" && (
            <>
              <b>Submissions ({a.submissions.length})</b>
              <table>
                <tbody>
                  {a.submissions.map((s) => (
                    <tr key={s._id}>
                      <td>{s.student && s.student.rollNo}</td>
                      <td>{s.student && s.student.name}</td>
                      <td>{s.answer}</td>
                      <td>{new Date(s.submittedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* student gets answer box + submit btn */}
          {user.role === "student" && (
            <div>
              {mySubmission(a) && <p className="ok">Submitted: {mySubmission(a).answer}</p>}
              <input
                placeholder="Answer / Drive link"
                value={answers[a._id] || ""}
                onChange={(e) => setAnswers({ ...answers, [a._id]: e.target.value })}
              />
              <button className="action" onClick={() => submit(a._id)}>
                {mySubmission(a) ? "Re-submit" : "Submit"}
              </button>
            </div>
          )}
        </div>
      ))}
      {/* empty msg */}
      {assignments.length === 0 && <div className="card">No assignments.</div>}
    </div>
  );
}

export default Assignments;
