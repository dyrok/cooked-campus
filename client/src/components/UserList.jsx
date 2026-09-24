import { useEffect, useState } from "react";
import { request } from "../api";

// list of students or faculty w/ search + prev/next pages. role prop says which one
function UserList({ role, user }) {
  // the list + search text + page stuff from backend
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // get users from backend -> ?role=..&search=..&page=..&limit=5
  const loadUsers = () => {
    request("/users?role=" + role + "&search=" + search + "&page=" + page + "&limit=5")
      .then((data) => {
        // backend sends { data, total, page, pages }
        setUsers(data.data);
        setPages(data.pages);
        setTotal(data.total);
      })
      // eg 403 if this role isnt allowed
      .catch((err) => alert(err.message));
  };

  // load again whenever page or role changes (prev/next btns change page)
  useEffect(() => {
    loadUsers();
  }, [page, role]);

  // search btn -> go back to page 1 n reload
  const doSearch = (e) => {
    e.preventDefault();
    // already on page 1? just reload. else setPage(1) triggers the useEffect which reloads
    if (page === 1) loadUsers();
    else setPage(1);
  };

  // admin deletes a user then we reload the list
  const deleteUser = async (id) => {
    await request("/users/" + id, "DELETE");
    loadUsers();
  };

  return (
    <div className="card">
      <h3>{role === "student" ? "Students" : "Faculty"} ({total})</h3>
      {/* search box */}
      <form onSubmit={doSearch}>
        <input placeholder="Search name / email / roll no" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="action" type="submit">Search</button>
      </form>
      {/* users table */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>{role === "student" ? "Roll No / Sem" : "Employee ID"}</th>
            {/* extra column only for admin (delete btn) */}
            {user.role === "admin" && <th></th>}
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.department}</td>
              {/* students show roll no / sem, faculty show employee id */}
              <td>{role === "student" ? u.rollNo + " / " + u.semester : u.employeeId}</td>
              {user.role === "admin" && (
                <td><button className="small danger" onClick={() => deleteUser(u._id)}>Delete</button></td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {/* pagination btns, disabled on first / last page */}
      <div className="pager">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
        <span>Page {page} of {pages || 1}</span>
        <button disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}

export default UserList;
