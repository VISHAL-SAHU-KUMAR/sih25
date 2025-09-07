import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Footer Top */}
        <div className="footer-top">
          <div className="footer-section footer-brand">
            <div className="footer-logo">
              <img src="/logo.png" alt="SwasthyaSetu Logo" className="footer-logo-img" />
              <span className="footer-logo-text">SwasthyaSetu</span>
            </div>
            <p className="footer-description">
              Bridging healthcare gaps in rural India through AI-powered telemedicine solutions.
              Connecting patients, doctors, and health authorities for accessible healthcare.
            </p>
            <div className="footer-stats">
              <div className="footer-stat">
                <span className="stat-number">50K+</span>
                <span className="stat-label">Patients</span>
              </div>
              <div className="footer-stat">
                <span className="stat-number">1K+</span>
                <span className="stat-label">Villages</span>
              </div>
              <div className="footer-stat">
                <span className="stat-number">500+</span>
                <span className="stat-label">Doctors</span>
              </div>
            </div>
            <div className="social-links">
              <a href="#facebook" aria-label="Facebook" className="social-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#twitter" aria-label="Twitter" className="social-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#linkedin" aria-label="LinkedIn" className="social-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/login" className="footer-link">Login</Link></li>
              <li><Link to="/register" className="footer-link">Register</Link></li>
              <li><Link to="/emergency" className="footer-link">Emergency</Link></li>
              <li><Link to="/contact" className="footer-link">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">Services</h3>
            <ul className="footer-links">
              <li><Link to="/teleconsultation" className="footer-link">Video Consultation</Link></li>
              <li><Link to="/symptom-checker" className="footer-link">AI Symptoms</Link></li>
              <li><Link to="/medicine-delivery" className="footer-link">Medicine Delivery</Link></li>
              <li><Link to="/health-records" className="footer-link">Health Records</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">Network</h3>
            <ul className="footer-links">
              <li><Link to="/for-patients" className="footer-link">For Patients</Link></li>
              <li><Link to="/for-doctors" className="footer-link">For Doctors</Link></li>
              <li><Link to="/for-pharmacies" className="footer-link">For Pharmacies</Link></li>
              <li><Link to="/partnership" className="footer-link">Partnerships</Link></li>
            </ul>
          </div>

          <div className="footer-section footer-contact">
            <h3 className="footer-heading">Contact</h3>
            <div className="contact-info">
              <div className="contact-item">
                <div className="contact-icon">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                </div>
                <div className="contact-details">
                  <span className="contact-label">Email</span>
                  <span className="contact-value">support@swasthyasetu.com</span>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="contact-details">
                  <span className="contact-label">Location</span>
                  <span className="contact-value">Nabha, Punjab</span>
                </div>
              </div>
            </div>
            
            <div className="emergency-notice">
              <div className="emergency-icon">🚨</div>
              <div className="emergency-text">
                <strong>Emergency?</strong>
                <span>Call 102 or Emergency Button</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Middle - Certifications */}
        <div className="footer-middle">
          <div className="certification-badges">
            <div className="badge">
              <div className="badge-icon">🏛️</div>
              <span>Gov. Approved</span>
            </div>
            <div className="badge">
              <div className="badge-icon">🔒</div>
              <span>HIPAA Compliant</span>
            </div>
            <div className="badge">
              <div className="badge-icon">✅</div>
              <span>ISO Certified</span>
            </div>
            <div className="badge">
              <div className="badge-icon">🛡️</div>
              <span>Data Protected</span>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="copyright">
              <p>&copy; 2025 SwasthyaSetu Healthcare Solutions. All rights reserved.</p>
              <p className="mission-statement">Committed to bridging healthcare gaps in rural India.</p>
            </div>
            <div className="footer-bottom-links">
              <Link to="/privacy" className="footer-bottom-link">Privacy</Link>
              <span className="separator">|</span>
              <Link to="/terms" className="footer-bottom-link">Terms</Link>
              <span className="separator">|</span>
              <Link to="/support" className="footer-bottom-link">Help</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;