import { useNavigate, Link } from "react-router-dom";
import { User, Stethoscope, Shield, UserPlus, Store } from "lucide-react";
import "./RegisterPage.css";

function RegisterPage() {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    switch (role) {
      case "patient":
        navigate("/register/patient");
        break;
      case "doctor":
        navigate("/register/doctor");
        break;
      case "authority":
        navigate("/register/authority");
        break;
      case "medical_store_owner":
        navigate("/register/medical_store_owner");
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
      <div className="register-container">
        <div className="register-card">
          <div className="welcome-section">
            <div className="welcome-icon">
              <UserPlus size={32} />
            </div>
            <h1 className="register-title">Join SwasthyaSetu</h1>
            <p className="register-subtitle">
              Start your journey towards accessible rural healthcare. Choose your role to get started.
            </p>
          </div>

          <div className="features">
            <h4>Why Choose SwasthyaSetu?</h4>
            <p>Connecting rural communities with quality healthcare through telemedicine technology.</p>
          </div>

          <div className="role-options">
            <button
              className="role-btn patient"
              onClick={() => handleRoleSelect("patient")}
            >
              <User size={24} className="role-icon" />
              <span>Register as Patient</span>
            </button>

            <button
              className="role-btn doctor"
              onClick={() => handleRoleSelect("doctor")}
            >
              <Stethoscope size={24} className="role-icon" />
              <span>Register as Doctor</span>
            </button>

            <button
              className="role-btn authority"
              onClick={() => handleRoleSelect("authority")}
            >
              <Shield size={24} className="role-icon" />
              <span>Register as Authority</span>
            </button>
            <button
              className="role-btn owner"
              onClick={() => handleRoleSelect("medical_store_owner")}
            >
              <Store size={24} className="role-icon" />
              <span>Register as Medical Store Owner</span>
            </button>
          </div>

          <p className="login-text">
            Already part of our community?{" "}
            <Link to="/login" className="login-link">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default RegisterPage;