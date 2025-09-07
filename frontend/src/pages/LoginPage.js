import { useNavigate, Link } from "react-router-dom";
import { User, Stethoscope, Shield, Heart } from "lucide-react";
import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    switch (role) {
      case "patient":
        navigate("/login/patient");
        break;
      case "doctor":
        navigate("/login/doctor");
        break;
      case "authority":
        navigate("/login/authority");
        break;
      case "medical_store_owner":
        navigate("/login/medical_store_owner");
        break;
      default:
        break;
    }
  };

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <img 
              src="/logo.png" 
              alt="SwasthyaSetu Logo" 
              className="logo"
            />
            <h1 className="brand-text">SwasthyaSetu</h1>
          </div>
          <nav>
            <ul className="nav-links">
              <li>
                <Link to="/" className="nav-link">Home</Link>
              </li>
              <li>
                <Link to="/contact" className="nav-link">Contact</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="login-container">
        <div className="login-card">
          <div className="welcome-section">
            <div className="welcome-icon">
              <Heart size={32} />
            </div>
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">
              Access your SwasthyaSetu account to connect with rural healthcare services
            </p>
          </div>

          <div className="role-buttons">
            <button onClick={() => handleRoleSelect("patient")} className="role-btn">
              <User size={22} className="role-icon" />
              <span>Login as Patient</span>
            </button>
            <button onClick={() => handleRoleSelect("doctor")} className="role-btn">
              <Stethoscope size={22} className="role-icon" />
              <span>Login as Doctor</span>
            </button>
            <button onClick={() => handleRoleSelect("medical_store_owner")} className="role-btn">
              <Shield size={22} className="role-icon" />
              <span>Login as Medical Store Owner</span>
            </button>
            <button onClick={() => handleRoleSelect("authority")} className="role-btn">
              <Shield size={22} className="role-icon" />
              <span>Login as Authority</span>
            </button>
          </div>

          <p className="register-text">
            New to SwasthyaSetu?{" "}
            <Link to="/register" className="register-link">
              Create your account
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default LoginPage;