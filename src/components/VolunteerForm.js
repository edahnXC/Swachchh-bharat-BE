import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles.css";

const VolunteerForm = () => {
  // State for form fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    state: "",
    city: "",
    number: "",
    message: "",
  });

  const [error, setError] = useState(""); // Error message
  const [success, setSuccess] = useState(""); // Success message

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Basic validation
    if (!formData.name || !formData.email || !formData.state || !formData.city || !formData.number) {
      setError("All fields except message are required!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/volunteers", formData);
      setSuccess(response.data.message || "Thank you for volunteering!");
      setFormData({ name: "", email: "", state: "", city: "", number: "", message: "" }); // Reset form
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="volunteer-signup-page">
      <div className="volunteer-container">
      <h2>Volunteer Form</h2>
      <p>Join us in making a difference!</p>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} required />
        <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
        <input type="text" name="number" placeholder="Phone Number" value={formData.number} onChange={handleChange} required />
        <textarea name="message" placeholder="Your Message" value={formData.message} onChange={handleChange}></textarea>

        <button type="submit">Register</button>
      </form>

      <Link to="/" className="back-btn">Back to Homepage</Link>
      </div>
    </div>
  );
};

export default VolunteerForm;
