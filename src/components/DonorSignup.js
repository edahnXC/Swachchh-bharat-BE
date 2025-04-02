import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles.css";

const DonorSignup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("All fields are required!");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/donors/signup", { name, email, password });
      alert("Signup successful! Please log in.");
      navigate("/donor-login");
    } catch (error) {
      setError(error.response?.data?.message || "Signup failed!");
    }
  };

  return (
    <div className="donorSignup-page">
      <h2>Donor Signup</h2>
      <h3>Join us in making a difference with the Clean India Mission</h3>
      <div className="signup-container">
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Sign Up</button>
        </form>
        <p>Already a User? <a href="/donor-login">Login here</a></p>
      </div>
    </div>
  );
};

export default DonorSignup;