import React from 'react';
import { Link } from 'react-router-dom';

function Volunteer() {
  return (
    <div className="volunteer-page">
      <div className="volunteer-container">
        <h2>Join Our Volunteer Community</h2>
        <p>Make a meaningful impact in your community by volunteering with us. Your time and skills can change lives.</p>
        <div className="cta-buttons">
          <Link to="/volunteer-form" className="primary-btn">Become a Volunteer</Link>
          <Link to="/" className="primary-btn">Learn More</Link>
        </div>
      </div>
    </div>
  );
}

export default Volunteer;