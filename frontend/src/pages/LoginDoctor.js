import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../utils/api";
import "./LoginDoctor.css"; // 👈 new CSS file

function LoginDoctor() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [requireSecurity, setRequireSecurity] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // simulate login
      await loginUser("doctor", { username: email, password, securityAnswer });
      navigate("/doctor-dashboard");
    } catch (err) {
      if (!requireSecurity) {
        // require security Q for 2FA
        setRequireSecurity(true);
        alert("Please answer your security question for verification.");
      } else {
        alert("Login failed");
      }
    }
  };

  return (
    <div className="doctor-login-container">
      <div className="doctor-login-card">
        <h2 className="doctor-login-title">🔐 Doctor Login</h2>
        <p className="doctor-login-subtitle">
          Access your dashboard to manage appointments, consultations, and
          patient records securely.
        </p>

        {/* Email */}
        <input
          type="email"
          placeholder="Email / Username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Security Question (optional, shown only if required) */}
        {requireSecurity && (
          <input
            type="text"
            placeholder="What is your registered security answer?"
            value={securityAnswer}
            onChange={(e) => setSecurityAnswer(e.target.value)}
          />
        )}

        {/* Login Button */}
        <button className="btn-primary" onClick={handleLogin}>
          Login
        </button>

        {/* Links */}
        <div className="doctor-login-links">
          <a href="/forgot-password">Forgot Password?</a>
          <a href="/register/doctor">Register as Doctor</a>
        </div>
      </div>
    </div>
  );
}

export default LoginDoctor;
