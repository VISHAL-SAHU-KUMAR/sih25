import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../utils/api";
import "./LoginPatient.css";

function LoginPatient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [requireSecurity, setRequireSecurity] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    try {
      await loginUser("patient", { username: email, password, securityAnswer });
      navigate("/patient-dashboard");
    } catch (err) {
      if (!requireSecurity) {
        setRequireSecurity(true);
        setError("Please answer your security question for verification.");
      } else {
        setError("Invalid email or password. Please try again.");
      }
    }
  };

  return (
    <div className="patient-login-container">
      <div className="patient-login-card">
        <h2 className="login-title">🔒 Patient Login</h2>
        <p className="login-subtitle">Access your health dashboard securely</p>

        {error && <p className="error-message">{error}</p>}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {requireSecurity && (
          <div className="form-group">
            <label>Security Question / 2FA</label>
            <input
              type="text"
              placeholder="Enter your registered answer"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
            />
          </div>
        )}

        <button className="btn-primary" onClick={handleLogin}>
          Login
        </button>

        <p className="register-text">
          New patient?{" "}
          <Link to="/register/patient" className="register-link">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPatient;
