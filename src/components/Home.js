import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <section id="home" className="hero">
      <div className="hero-content">
        <h1>Your Support Is Powerful.</h1>
        <p>Keep Your City Clean And Live Healthy</p>
        <button className="get-support-btn" onClick={() => navigate("/Contact")}>
          Get Support
        </button>
      </div>
    </section>
  );
}

export default Home;
