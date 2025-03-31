import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="hero-section">
      <div className="hero-content">
        <h1>Join the Clean India Movement</h1>
        <p>Together we can make India cleaner and greener</p>
        <div className="hero-buttons">
          <button className="primary-btn" onClick={() => navigate("/pledge")}>
            Take a Pledge
          </button>
          <button className="secondary-btn" onClick={() => navigate("/volunteer")}>
            Become a Volunteer
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;