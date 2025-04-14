import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from 'axios';

function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
        axios.post("https://my-blog-project-2485.onrender.com/admin/login", { password })
        .then(res => {
            if (res.data.success) {
            sessionStorage.setItem("isAdmin", "true");
            onLogin(true);
            navigate("/");
            }
        })
        .catch(err => {
            alert("Login failed");
        });
    }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Admin Login</h2>
      <input
        type="password"
        placeholder="Enter admin password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}

export default AdminLogin;
