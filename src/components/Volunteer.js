import React from 'react';
import { Link } from 'react-router-dom';

function Volunteer() {
  return (
    <div className="volunteer-page">
      <div className="volunteer-container">
      <h2>Volunteer with Us</h2>
      <p>Join us in making a difference in our community. Sign up to volunteer today!</p>
      <Link to="/volunteer-form" className="signup-btn">Sign Up</Link>
      {/* <Link to="/volunteer-login" className="login-btn">Already a Volunteer? Login</Link> */}
    </div>
    </div>
  );
}

export default Volunteer;
