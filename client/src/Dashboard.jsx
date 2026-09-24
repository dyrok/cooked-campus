import { useState } from "react";
// all the tab components (one per module)
import UserList from "./components/UserList";
import AddUser from "./components/AddUser";
import Courses from "./components/Courses";
import AttendanceReport from "./components/AttendanceReport";
import MarkAttendance from "./components/MarkAttendance";
import MyAttendance from "./components/MyAttendance";
import Assignments from "./components/Assignments";
import Results from "./components/Results";
import Notices from "./components/Notices";
import Events from "./components/Events";
import Complaints from "./components/Complaints";
import Leaves from "./components/Leaves";

// which tabs each role gets. first one opens by default
const tabsByRole = {
  admin: ["Students", "Faculty", "Add User", "Courses", "Attendance Report", "Notices", "Events", "Complaints", "Leaves"],
  hod: ["Attendance Report", "Students", "Faculty", "Courses", "Notices", "Events", "Complaints", "Leaves"],
  faculty: ["Attendance Report", "Mark Attendance", "Assignments", "Results", "Notices", "Events", "Leaves"],
  student: ["My Attendance", "Assignments", "Results", "Notices", "Events", "Complaints", "Leaves"],
};

// shows tab btns + whichever tab is picked
function Dashboard({ user }) {
  // pick tabs for this user's role, start on the first one
  const tabs = tabsByRole[user.role];
  const [tab, setTab] = useState(tabs[0]);

  return (
    <div>
      {/* one btn per tab, the clicked one gets 'active' class (blue) */}
      <div className="tabs">
        {tabs.map((t) => (
          <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {/* show only the picked tab's component (&& = if true then show it) */}
      {tab === "Students" && <UserList role="student" user={user} />}
      {tab === "Faculty" && <UserList role="faculty" user={user} />}
      {tab === "Add User" && <AddUser />}
      {tab === "Courses" && <Courses user={user} />}
      {tab === "Attendance Report" && <AttendanceReport />}
      {tab === "Mark Attendance" && <MarkAttendance />}
      {tab === "My Attendance" && <MyAttendance />}
      {tab === "Assignments" && <Assignments user={user} />}
      {tab === "Results" && <Results user={user} />}
      {tab === "Notices" && <Notices user={user} />}
      {tab === "Events" && <Events user={user} />}
      {tab === "Complaints" && <Complaints user={user} />}
      {tab === "Leaves" && <Leaves user={user} />}
    </div>
  );
}

export default Dashboard;
