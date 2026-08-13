
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { loginAdmin } from "../firebase/auth";

import "./AdminLogin.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await loginAdmin(email, password);

      navigate("/admin");
    } catch (err) {
      console.log("Admin Login Error:", err);

      setError("Email or Password is incorrect");
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">

      <form
        className="login-box"
        onSubmit={handleLogin}
      >

        <div className="login-header">

          <div className="login-status">
            <span></span>
            SECURE ACCESS
          </div>

          <h1>
            OCMA Admin Panel
          </h1>

          <p className="login-subtitle">
            Official Administration Control Center
          </p>

        </div>


        {error && (
          <p className="login-error">
            ⚠ {error}
          </p>
        )}


        <div className="login-input-group">

          <label>
            ADMIN EMAIL
          </label>

          <input
            type="email"
            placeholder="Enter Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />

        </div>


        <div className="login-input-group">

          <label>
            PASSWORD
          </label>

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />

        </div>


        <button
          type="submit"
          disabled={loading}
          className={loading ? "login-button loading" : "login-button"}
        >

          {loading ? (
            <>
              <span className="loading-spinner"></span>
              AUTHENTICATING...
            </>
          ) : (
            <>
              🔐 LOGIN TO ADMIN PANEL
            </>
          )}

        </button>


        <div className="login-footer">

          <span>OCMA OFFICIAL PORTAL</span>

          <span>SECURE ADMIN ACCESS</span>

        </div>

      </form>

    </div>
  );
}

export default AdminLogin;

