import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaEnvelope } from 'react-icons/fa';
import '../styles.css';

const TermsAndConditions = () => {
  return (
    <div className="terms-page">
      <div className="container">
        <div className="terms-header">
          <h1>Terms and Conditions</h1>
          <p className="last-updated">Last updated: {new Date().toLocaleDateString('en-IN')}</p>
        </div>
        
        <div className="terms-content">
          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing and using this website, you accept and agree to be bound by these Terms and Conditions. If you disagree with any part, please refrain from using our platform.</p>
          </section>

          <section>
            <h2>2. Use of the Platform</h2>
            <p>The Swachh Bharat Mission platform is intended for individuals who wish to contribute to cleanliness initiatives across India. Unauthorized commercial use is prohibited.</p>
          </section>

          <section>
            <h2>3. User Responsibilities</h2>
            <p>As a user, you agree to:</p>
            <ul>
              <li>Provide accurate and current information when registering</li>
              <li>Not misuse the platform for any unlawful purposes</li>
              <li>Respect all other participants and maintain decorum</li>
              <li>Report any suspicious activities immediately</li>
            </ul>
          </section>

          <section>
            <h2>4. Modifications</h2>
            <p>We reserve the right to modify these Terms at any time. Your continued use after changes constitutes acceptance of the modified Terms. We recommend reviewing this page periodically.</p>
          </section>

          <section className="contact-section">
            <h2>5. Contact Information</h2>
            <p>For any questions regarding these Terms, please feel free to:</p>
            
            <div className="contact-options">
              <Link to="/contact" className="contact-link">
                <FaEnvelope className="contact-icon" />
                <span>Contact Us through our form</span>
              </Link>
              
              <div className="direct-contact">
                <p>Or reach us directly at:</p>
                <address>
                  Swachh Bharat Mission<br />
                  Ministry of Housing and Urban Affairs<br />
                  Government of India<br />
                  Email: <a href="mailto:contact@swachhbharat.gov.in" className="email-link">
                    contact@swachhbharat.gov.in
                  </a>
                </address>
              </div>
            </div>
          </section>

          <div className="terms-footer">
            <Link to="/" className="back-btn">
              <FaArrowLeft className="back-icon" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;