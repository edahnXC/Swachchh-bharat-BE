import React, { useState } from "react";
import axios from "axios";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  // Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("https://swachchh-bharat-be.onrender.com/api/contact", formData);
      alert(response.data.message); // Show success message
      setFormData({ name: "", email: "", subject: "", message: "" }); // Clear form
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div className="contact-page">
      {/* Banner Section */}
      <div className="contact-banner">
        <h1>Feel Free To Contact Us</h1>
      </div>

      {/* Main Content Section */}
      <div className="contact-container">
        {/* Contact Form */}
        <div className="contact-form">
          <form onSubmit={handleSubmit}>
            <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
            <input type="text" name="subject" placeholder="Subject" value={formData.subject} onChange={handleChange} />
            <textarea name="message" placeholder="Message" value={formData.message} onChange={handleChange} required></textarea>

            <button type="submit">SEND MESSAGE</button>
          </form>
        </div>

        <div className="contact-info">
          <h2>📍 Our Office</h2>
          <hr />
          <p>
            <strong>Webmyne System</strong>
            <br />
            Ivory Terrace, Vadodara
            <br />
            Gujarat - India.
            <br />
          </p>
          <p>Contact us: +123456789</p>
        </div>
      </div>
    </div>
  );
}

export default Contact;
