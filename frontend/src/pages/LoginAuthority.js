import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../utils/api";
import "./LoginAuthority.css"; // 👈 styles

function LoginAuthority() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [otp, setOtp] = useState(""); // for optional 2FA
  const [requireOtp, setRequireOtp] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // basic login request
      await loginUser("authority", { username: email, password, role, otp });

      navigate("/authority-dashboard");
    } catch (err) {
      if (!requireOtp) {
        // simulate requiring OTP for 2FA after password login
        setRequireOtp(true);
        alert("OTP required. Please enter the code sent to your email/phone.");
      } else {
        alert("Login failed");
      }
    }
  };

  return (
    <div className="authority-login-container">
      <div className="authority-login-card">
        <h2 className="title">🔐 Authority Login</h2>
        <p className="subtitle">Secure access for authorized staff</p>

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

        {/* Role / Access Level */}
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">Select Role</option>
          <option value="super-admin">Super Admin</option>
          <option value="dept-admin">Department Admin</option>
          <option value="reception">Reception Staff</option>
          <option value="billing">Billing Staff</option>
          <option value="it-support">IT Support</option>
        </select>

        {/* Two-Factor Authentication */}
        {requireOtp && (
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        )}

        {/* Login Button */}
        <button className="btn-primary" onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
}

export default LoginAuthority;
