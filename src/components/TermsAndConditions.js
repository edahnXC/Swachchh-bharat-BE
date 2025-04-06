import React from 'react';
import { Link } from 'react-router-dom';
import '../styles.css';

const TermsAndConditions = () => {
  return (
    <div className="terms-page">
      <div className="container">
        <h1>Terms and Conditions</h1>
        
        <div className="terms-content">
          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing and using this website, you accept and agree to be bound by these Terms and Conditions.</p>
          </section>

          <section>
            <h2>2. Use of the Platform</h2>
            <p>The Swachh Bharat Mission platform is intended for individuals who wish to contribute to cleanliness initiatives across India.</p>
          </section>

          <section>
            <h2>3. User Responsibilities</h2>
            <p>Users agree to:</p>
            <ul>
              <li>Provide accurate information when registering</li>
              <li>Not misuse the platform for any unlawful purposes</li>
              <li>Respect all other participants in the mission</li>
            </ul>
          </section>

          <section>
            <h2>4. Privacy Policy</h2>
            <p>Your personal information will be handled in accordance with our Privacy Policy, which forms part of these Terms.</p>
          </section>

          <section>
            <h2>5. Modifications</h2>
            <p>We reserve the right to modify these Terms at any time. Continued use after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2>6. Contact Information</h2>
            <p>For any questions regarding these Terms, please contact us at:</p>
            <address>
              Swachh Bharat Mission<br />
              Ministry of Housing and Urban Affairs<br />
              Government of India<br />
              Email: contact@swachhbharat.gov.in
            </address>
          </section>

          <div className="terms-footer">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <Link to="/" className="back-btn">Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;