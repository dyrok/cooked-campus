import { useState } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";

// main component -> decides login page or dashboard
function App() {
  // user from localStorage so after refresh we're still logged in (null = not logged in)
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  // logout -> wipe token n user, set user null so login page shows
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // not logged in? -> show login page. login calls setUser once it works
  if (!user) {
    return <Login onLogin={setUser} />;
  }

  // logged in -> top bar + dashboard
  return (
    <div>
      {/* top bar w/ name, role n logout btn */}
      <nav className="topbar">
        <b>Smart Campus</b>
        <span>
          {user.name} ({user.role}{user.department ? " - " + user.department : ""})
          <button onClick={logout}>Logout</button>
        </span>
      </nav>
      {/* dashboard shows tabs based on user.role */}
      <div className="layout">
        <Dashboard user={user} />
      </div>
    </div>
  );
}

export default App;
