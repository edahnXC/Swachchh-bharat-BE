import React from 'react';
import { Link } from 'react-router-dom';
import GreenIndiaImage from '../Green-india.png';
import "../styles.css";

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Join the Swachh Bharat Mission</h1>
          <p>Be part of India's largest cleanliness movement and help create a cleaner, greener future for our nation.</p>
          <div className="hero-buttons">
            <Link to="/pledge" className="primary-btn">Take the Pledge</Link>
            <Link to="/volunteer" className="secondary-btn">Become a Volunteer</Link>
          </div>
        </div>
      </section>

      {/* Green India Section */}
      <section className="green-india-section">
        <div className="container green-india-container">
          <div className="green-india-image">
            <img src={GreenIndiaImage} alt="Green India Clean India" />
          </div>
          <div className="green-india-content">
            <h2>Green India, Clean India</h2>
            <p>
              Our mission is to create a cleaner and greener India by promoting sustainable waste management practices, 
              increasing green cover, and fostering environmental awareness among citizens.
            </p>
            <p>
              Join us in our efforts to make India free from open defecation and achieve 100% scientific waste management.
            </p>
            <div className="hero-buttons">
              <Link to="/programmes" className="primary-btn">Our Programmes</Link>
              <Link to="/donation" className="primary-btn">Support Us</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;