import { useState } from "react";
import { request } from "../api";

// blank form, used at start n to clear it after adding
const empty = { name: "", email: "", password: "", role: "student", department: "", semester: "", section: "", rollNo: "", employeeId: "" };

// admin form to add student / faculty / hod / admin
function AddUser() {
  // whole form in one object + msg to show after submit
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState("");

  // one fn for all inputs -> uses the input's name to update that field
  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // submit -> POST /users, show ok msg or the error
  const addUser = async (e) => {
    e.preventDefault();
    try {
      await request("/users", "POST", form);
      setMsg("User added: " + form.email);
      setForm(empty);
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <div className="card">
      <h3>Add User</h3>
      <form onSubmit={addUser} className="grid">
        <input name="name" placeholder="Full name" value={form.name} onChange={change} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={change} required />
        <input name="password" placeholder="Password" value={form.password} onChange={change} required />
        <select name="role" value={form.role} onChange={change}>
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="hod">HOD</option>
          <option value="admin">Admin</option>
        </select>
        <input name="department" placeholder="Department (e.g. CSE)" value={form.department} onChange={change} />
        {/* extra boxes only for students */}
        {form.role === "student" && (
          <>
            <input name="semester" type="number" placeholder="Semester" value={form.semester} onChange={change} required />
            <input name="section" placeholder="Section" value={form.section} onChange={change} />
            <input name="rollNo" placeholder="Roll No" value={form.rollNo} onChange={change} />
          </>
        )}
        {/* faculty / hod get employee id box */}
        {(form.role === "faculty" || form.role === "hod") && (
          <input name="employeeId" placeholder="Employee ID" value={form.employeeId} onChange={change} />
        )}
        <button className="action" type="submit">Add User</button>
      </form>
      {/* success or error msg */}
      {msg && <p>{msg}</p>}
    </div>
  );
}

export default AddUser;
