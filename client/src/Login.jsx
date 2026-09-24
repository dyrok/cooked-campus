import { useState } from "react";

// login page. onLogin is the fn from App that sets the user
function Login({ onLogin }) {
  // form boxes n error msg
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // runs when form is submitted
  const login = async (e) => {
    // stop page reload (default form behaviour) n clear old error
    e.preventDefault();
    setError("");
    // send email + password to backend (no token needed, its a public route)
    const res = await fetch("http://localhost:8000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    // wrong email/pass -> show the error n stop
    if (!res.ok) {
      setError(data.message);
      return;
    }
    // worked! save token + user so we stay logged in after refresh
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    // tell App we're logged in -> it shows the dashboard
    onLogin(data.user);
  };

  // demo btns just fill the email n password for u
  const demo = (mail) => {
    setEmail(mail);
    setPassword("password123");
  };

  return (
    <div className="login-wrap">
      <div className="card">
        <h2>Smart Campus Login</h2>
        {/* login form */}
        <form onSubmit={login}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="action" type="submit">Login</button>
        </form>
        {/* only shows if there is an error */}
        {error && <p className="error">{error}</p>}
        {/* quick fill btns for each role */}
        <p className="muted">Demo accounts (password123):</p>
        <button className="chip" onClick={() => demo("admin@campus.com")}>Admin</button>
        <button className="chip" onClick={() => demo("hod@campus.com")}>HOD</button>
        <button className="chip" onClick={() => demo("faculty@campus.com")}>Faculty</button>
        <button className="chip" onClick={() => demo("aarav@campus.com")}>Student</button>
      </div>
    </div>
  );
}

export default Login;
