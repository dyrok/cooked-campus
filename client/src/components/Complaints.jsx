import { useEffect, useState } from "react";
import { request } from "../api";

// student raises complaints. hod/admin change the status
function Complaints({ user }) {
  // list + form boxes
  const [complaints, setComplaints] = useState([]);
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");

  // student gets own, hod gets dept, admin gets all (backend decides)
  const loadComplaints = () => {
    request("/complaints").then(setComplaints);
  };

  // on open -> load
  useEffect(() => {
    loadComplaints();
  }, []);

  // student submits complaint, clear form, reload
  const addComplaint = async (e) => {
    e.preventDefault();
    await request("/complaints", "POST", { subject, text });
    setSubject("");
    setText("");
    loadComplaints();
  };

  // hod/admin -> open -> in-progress -> resolved
  const changeStatus = async (id, status) => {
    await request("/complaints/" + id, "PUT", { status });
    loadComplaints();
  };

  return (
    <div>
      {/* complaint form, students only */}
      {user.role === "student" && (
        <div className="card">
          <h3>Raise a Complaint</h3>
          <form onSubmit={addComplaint} className="grid">
            <input placeholder="Subject (WiFi, Hostel, Lab...)" value={subject} onChange={(e) => setSubject(e.target.value)} required />
            <input placeholder="Describe the problem" value={text} onChange={(e) => setText(e.target.value)} required />
            <button className="action" type="submit">Submit</button>
          </form>
        </div>
      )}
      <div className="card">
        <h3>{user.role === "student" ? "My Complaints" : "Complaints"}</h3>
        {/* staff see extra columns: student name n action btns */}
        <table>
          <thead>
            <tr>
              {user.role !== "student" && <th>Student</th>}
              <th>Subject</th><th>Details</th><th>Status</th>
              {user.role !== "student" && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => (
              <tr key={c._id}>
                {user.role !== "student" && <td>{c.student && c.student.name}</td>}
                <td>{c.subject}</td>
                <td>{c.text}</td>
                {/* status class gives it the colour */}
                <td><span className={"status " + c.status}>{c.status}</span></td>
                {user.role !== "student" && (
                  <td>
                    {c.status === "open" && <button className="small" onClick={() => changeStatus(c._id, "in-progress")}>Start</button>}
                    {c.status !== "resolved" && <button className="small" onClick={() => changeStatus(c._id, "resolved")}>Resolve</button>}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {complaints.length === 0 && <p>No complaints.</p>}
      </div>
    </div>
  );
}

export default Complaints;
