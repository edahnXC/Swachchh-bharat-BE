import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles.css";

const VolunteerForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    state: "",
    city: "",
    number: "",
    message: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name || !formData.email || !formData.state || !formData.city || !formData.number) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/volunteers", formData);
      setSuccess(response.data.message || "Thank you for your application! We'll contact you soon.");
      setFormData({ name: "", email: "", state: "", city: "", number: "", message: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed. Please try again.");
    }
  };

  return (
    <div className="volunteer-page">
      <div className="volunteer-container form-container">
        <h2>Volunteer Application</h2>
        <p className="form-intro">Complete this form to join our volunteer team. We appreciate your willingness to help!</p>

        {error && <div className="alert error-message">{error}</div>}
        {success && <div className="alert success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="state">State *</label>
              <input 
                type="text" 
                id="state" 
                name="state" 
                value={formData.state} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="city">City *</label>
              <input 
                type="text" 
                id="city" 
                name="city" 
                value={formData.city} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="number">Phone Number *</label>
            <input 
              type="tel" 
              id="number" 
              name="number" 
              value={formData.number} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Tell us about yourself</label>
            <textarea 
              id="message" 
              name="message" 
              value={formData.message} 
              onChange={handleChange}
              placeholder="Your skills, interests, availability, etc."
            ></textarea>
          </div>

          <button type="submit" className="primary-btn">Submit Application</button>
        </form>

        <Link to="/volunteer" className="back-btn">Back to Volunteer Page</Link>
      </div>
    </div>
  );
};

export default VolunteerForm;