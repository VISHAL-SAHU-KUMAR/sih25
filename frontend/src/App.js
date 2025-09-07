import { HeartPulse } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// Global App CSS
import "./App.css";

// Pages CSS
import "./pages/Landing.css";
import "./pages/LoginPage.css";
import "./pages/RegisterPage.css";
import "./pages/LoginPatient.css";
import "./pages/LoginDoctor.css";
import "./pages/LoginAuthority.css";
import "./pages/RegisterPatient.css";
import "./pages/RegisterDoctor.css";
import "./pages/RegisterAuthority.css";


// Components CSS
import "./components/PatientDashboard.css";
import "./components/DoctorDashboard.css";
import "./components/AuthorityDashboard.css";
import "./components/PharmacyView.css";
import "./components/Chatbot.css";
import "./components/SymptomTracker.css";
import "./components/LanguageFab.css";
import "./components/Footer.css";
import "./components/SystemStatus.css";

// Pages
import Landing from "./pages/Landing";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPatient from "./pages/LoginPatient";
import LoginDoctor from "./pages/LoginDoctor";
import LoginAuthority from "./pages/LoginAuthority";
import RegisterPatient from "./pages/RegisterPatient";
import RegisterDoctor from "./pages/RegisterDoctor";
import RegisterAuthority from "./pages/RegisterAuthority";
import Footer from "./components/Footer";

// Dashboards
import PatientDashboard from "./components/PatientDashboard";
import DoctorDashboard from "./components/DoctorDashboard";
import AuthorityDashboard from "./components/AuthorityDashboard";
import PharmacyView from "./components/PharmacyView";
import Chatbot from "./components/Chatbot";
import SymptomTracker from "./components/SymptomTracker";
import LanguageFab from "./components/LanguageFab";
import SystemStatus from "./components/SystemStatus";

function App() {
  const { t } = useTranslation();

  return (
    <Router>
      <div className="App">
        {/* Navbar */}
        <header className="App-header">
          <div className="logo">
            <HeartPulse color="white" size={30} />
            <span className="app-name">MediHealth</span>
          </div>
          <nav className="nav-links">
            {[
              { path: "/login", label: t('nav.login') },
              { path: "/register", label: t('nav.register') },
              { path: "/symptom-tracker", label: t('nav.symptomTracker') },
              { path: "/chatbot", label: t('nav.chatbot') },
            ].map((link, index) => (
              <Link key={index} to={link.path} className="nav-link">
                {link.label}
              </Link>
            ))}
          </nav>
        </header>

        {/* Routes */}
        <main className="App-main">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login/patient" element={<LoginPatient />} />
            <Route path="/login/doctor" element={<LoginDoctor />} />
            <Route path="/login/authority" element={<LoginAuthority />} />
            <Route path="/register/patient" element={<RegisterPatient />} />
            <Route path="/register/doctor" element={<RegisterDoctor />} />
            <Route path="/register/authority" element={<RegisterAuthority />} />
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            <Route path="/authority-dashboard" element={<AuthorityDashboard />} />
            <Route path="/pharmacy-dashboard" element={<PharmacyView />} />
            <Route path="/symptom-tracker" element={<SymptomTracker />} />
            <Route path="/chatbot" element={<Chatbot />} />
          </Routes>
        </main>

        {/* Language Toggler FAB - positioned globally */}
        <LanguageFab />

        {/* System Status Monitor */}
        <SystemStatus />

        <Footer />
      </div>
    </Router>
  );
}

export default App;