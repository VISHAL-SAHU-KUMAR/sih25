import React from "react";
import { Link } from "react-router-dom";
import "./Landing.css";

const Landing = () => {
  return (
    <div className="landing-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <img src="/logo192.png" alt="SwasthyaSetu Logo" className="logo-img" />
            <span className="logo-text">SwasthyaSetu</span>
          </div>
          <div className="nav-links">
            <Link to="/login" className="nav-link">Login/Register</Link>
            <Link to="/contact" className="nav-link">Contact Us</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Bridging Healthcare Gaps in <span className="highlight">Rural India</span>
          </h1>
          <p className="hero-subtitle">
            AI-powered telemedicine platform connecting patients, doctors, pharmacies, and authorities 
            for seamless healthcare delivery in remote areas.
          </p>
          <div className="hero-buttons">
            <Link to="/home" className="btn-primary">Get Started</Link>
            <Link to="/register" className="btn-secondary">Register Now</Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="/logo.png" alt="Telemedicine" />
        </div>
      </section>

      {/* Problem Statement */}
      <section className="problem-section">
        <div className="section-content">
          <h2>Addressing Critical Healthcare Challenges</h2>
          <div className="problem-grid">
            <div className="problem-card">
              <img src="https://img.icons8.com/?size=100&id=RPS2gnw1awU7&format=png&color=000000" alt="Limited Doctors" />
              <h3>Limited Healthcare Staff</h3>
              <p>Long delays in treatment due to shortage of doctors and medical staff in rural areas.</p>
            </div>
            <div className="problem-card">
              <img src="https://img.icons8.com/?size=100&id=121185&format=png&color=000000" alt="Poor Infrastructure" />
              <h3>Poor Infrastructure</h3>
              <p>Travel burden and overcrowded hospitals make healthcare access challenging.</p>
            </div>
            <div className="problem-card">
              <img src="https://img.icons8.com/?size=100&id=108787&format=png&color=000000" alt="Medicine Shortages" />
              <h3>Medicine Shortages</h3>
              <p>Patients unable to access essential medications when needed most.</p>
            </div>
            <div className="problem-card">
              <img src="https://img.icons8.com/fluency/96/smartphone.png" alt="Digital Divide" />
              <h3>Digital Divide</h3>
              <p>Lack of multilingual, offline-ready health solutions for rural communities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Features */}
      <section className="features-section">
        <div className="section-content">
          <h2>Our Comprehensive Solution</h2>
          <div className="features-grid">
            <div className="feature-card">
              <img src="https://img.icons8.com/fluency/96/video-call.png" alt="Teleconsultation" />
              <h3>AI-Powered Teleconsultation</h3>
              <p>Connect with verified doctors via video/voice calls with AI symptom checker and triage system.</p>
            </div>
            <div className="feature-card">
              <img src="https://img.icons8.com/?size=100&id=05QLQBWU7IkX&format=png&color=000000" alt="Digital Prescriptions" />
              <h3>Smart Prescription Management</h3>
              <p>AI analyzes handwritten prescriptions and automates medicine orders with pharmacy integration.</p>
            </div>
            <div className="feature-card">
              <img src="https://img.icons8.com/fluency/96/delivery.png" alt="Medicine Delivery" />
              <h3>Doorstep Medicine Delivery</h3>
              <p>Integrated pharmacy network with real-time stock visibility and automatic order routing.</p>
            </div>
            <div className="feature-card">
              <img src="https://img.icons8.com/fluency/96/dashboard.png" alt="Authority Dashboard" />
              <h3>Authority Dashboards</h3>
              <p>Centralized monitoring for patient load, doctor availability, and medicine stock across villages.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Innovation Highlights */}
      <section className="innovation-section">
        <div className="section-content">
          <h2>What Makes Us Unique</h2>
          <div className="innovation-grid">
            <div className="innovation-item">
              <div className="innovation-icon">🤖</div>
              <h3>AI Prescription Analyzer</h3>
              <p>Reads handwritten prescriptions and extracts medicine details automatically</p>
            </div>
            <div className="innovation-item">
              <div className="innovation-icon">🔍</div>
              <h3>Smart Symptom Checker</h3>
              <p>AI-powered triage system that prioritizes emergencies and reduces hospital load</p>
            </div>
            <div className="innovation-item">
              <div className="innovation-icon">✅</div>
              <h3>Doctor Verification</h3>
              <p>Automatic verification ensures only certified doctors can register</p>
            </div>
            <div className="innovation-item">
              <div className="innovation-icon">📱</div>
              <h3>Offline-First Design</h3>
              <p>Core features work with poor connectivity via SMS/IVR support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Join the Healthcare Revolution</h2>
          <p>Experience the future of rural healthcare with SwasthyaSetu</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn-primary">Start Your Journey</Link>
            <Link to="/contact" className="btn-outline">Learn More</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;