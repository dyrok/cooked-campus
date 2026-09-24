import { useEffect, useState } from "react";
import { request } from "../api";

// student/faculty apply for leave. hod/admin approve or reject
function Leaves({ user }) {
  // list + form boxes
  const [leaves, setLeaves] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");

  // student n faculty apply, the rest are approvers
  const canApply = user.role === "student" || user.role === "faculty";

  // backend sends own leaves, or dept/all for hod/admin
  const loadLeaves = () => {
    request("/leaves").then(setLeaves);
  };

  // on open -> load
  useEffect(() => {
    loadLeaves();
  }, []);

  // apply, clear form, reload. alert if error (eg from date after to date)
  const apply = async (e) => {
    e.preventDefault();
    try {
      await request("/leaves", "POST", { fromDate, toDate, reason });
      setFromDate("");
      setToDate("");
      setReason("");
      loadLeaves();
    } catch (err) {
      alert(err.message);
    }
  };

  // approve or reject
  const decide = async (id, status) => {
    await request("/leaves/" + id, "PUT", { status });
    loadLeaves();
  };

  return (
    <div>
      {/* apply form */}
      {canApply && (
        <div className="card">
          <h3>Apply for Leave</h3>
          <form onSubmit={apply} className="grid">
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} required />
            <input placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} required />
            <button className="action" type="submit">Apply</button>
          </form>
        </div>
      )}
      <div className="card">
        <h3>{canApply ? "My Leave Requests" : "Leave Requests"}</h3>
        {/* approvers see name + action columns */}
        <table>
          <thead>
            <tr>
              {!canApply && <th>Name</th>}
              <th>From</th><th>To</th><th>Reason</th><th>Status</th>
              {!canApply && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {leaves.map((l) => (
              <tr key={l._id}>
                {!canApply && <td>{l.applicant && l.applicant.name} ({l.applicant && l.applicant.role})</td>}
                <td>{l.fromDate}</td>
                <td>{l.toDate}</td>
                <td>{l.reason}</td>
                <td><span className={"status " + l.status}>{l.status}</span></td>
                {!canApply && (
                  <td>
                    {/* btns only while still pending */}
                    {l.status === "pending" && (
                      <>
                        <button className="small" onClick={() => decide(l._id, "approved")}>Approve</button>
                        <button className="small danger" onClick={() => decide(l._id, "rejected")}>Reject</button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {leaves.length === 0 && <p>No leave requests.</p>}
      </div>
    </div>
  );
}

export default Leaves;
