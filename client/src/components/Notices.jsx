import { useEffect, useState } from "react";
import { request } from "../api";

// notices list w/ search + pages. staff can post, admin/hod can delete
function Notices({ user }) {
  // list, search, page stuff n form boxes
  const [notices, setNotices] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [department, setDepartment] = useState("ALL");

  // who can do what
  const canPost = user.role !== "student";
  const canDelete = user.role === "admin" || user.role === "hod";

  // get notices for current page + search text
  const loadNotices = () => {
    request("/notices?search=" + search + "&page=" + page + "&limit=5").then((data) => {
      setNotices(data.data);
      setPages(data.pages);
    });
  };

  // reload when page changes
  useEffect(() => {
    loadNotices();
  }, [page]);

  // post notice, clear form, reload
  const addNotice = async (e) => {
    e.preventDefault();
    await request("/notices", "POST", { title, body, department });
    setTitle("");
    setBody("");
    loadNotices();
  };

  // delete then reload
  const deleteNotice = async (id) => {
    await request("/notices/" + id, "DELETE");
    loadNotices();
  };

  return (
    <div>
      {/* post form, not for students */}
      {canPost && (
        <div className="card">
          <h3>Post Notice</h3>
          <form onSubmit={addNotice} className="grid">
            <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <input placeholder="Message" value={body} onChange={(e) => setBody(e.target.value)} required />
            <select value={department} onChange={(e) => setDepartment(e.target.value)}>
              {/* ALL = whole college, or just my dept */}
              <option value="ALL">Whole college</option>
              {user.department && <option value={user.department}>{user.department} only</option>}
            </select>
            <button className="action" type="submit">Post</button>
          </form>
        </div>
      )}

      <div className="card">
        {/* search box (goes back to page 1 on search) */}
        <form onSubmit={(e) => { e.preventDefault(); page === 1 ? loadNotices() : setPage(1); }}>
          <input placeholder="Search notices" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className="action" type="submit">Search</button>
        </form>
        {/* each notice */}
        {notices.map((n) => (
          <div key={n._id} className="item">
            <b>{n.title}</b> <span className="badge">{n.department}</span>
            {canDelete && <button className="small danger right" onClick={() => deleteNotice(n._id)}>Delete</button>}
            <p>{n.body}</p>
            <p className="muted">
              {n.postedBy ? n.postedBy.name : ""} - {new Date(n.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
        {notices.length === 0 && <p>No notices.</p>}
        {/* prev / next */}
        <div className="pager">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
          <span>Page {page} of {pages || 1}</span>
          <button disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      </div>
    </div>
  );
}

export default Notices;
