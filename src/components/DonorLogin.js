import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles.css";

const DonorLogin = ({setIsAuthenticated}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/api/donors/login", { email, password });
      localStorage.setItem("token", response.data.token);
      setIsAuthenticated(true);
      alert("Login successful!");
      navigate("/donation");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed!");
    }
  };

  return (
    <div className="donorLogin-page">
      <h2>Donor Login</h2>
      <h3>Login to contribute to the Clean India Mission</h3>
      <div className="login-container">
        <form onSubmit={handleLogin}>
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
          <button type="submit">Login</button>
          <p>New User? <a href="/donor-signup">Sign up here</a></p>
        </form>
      </div>
    </div>
  );
};

export default DonorLogin;
