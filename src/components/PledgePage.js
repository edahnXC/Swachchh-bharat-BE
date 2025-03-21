import React, { useState } from "react";
import "../pledgestyles.css";

const PledgePage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    city: "",
    pledges: [],
    date:"",
  });

  const [message, setMessage] = useState("");

  const pledgeOptions = [
    "I pledge to keep my surroundings clean.",
    "I will spread awareness about cleanliness.",
    "I will reduce waste and recycle.",
    "I will volunteer for a clean-up drive.",
  ];

  const handleCheckboxChange = (pledge) => {
    setFormData((prev) => ({
      ...prev,
      pledges: prev.pledges.includes(pledge)
        ? prev.pledges.filter((p) => p !== pledge)
        : [...prev.pledges, pledge],
    }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); 

    try {
      const response = await fetch("http://localhost:5000/api/pledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Thank you for your pledge!");
        setFormData({ name: "", email: "", city: "", pledges: [] ,date:""}); // Reset form
      } else {
        setMessage("❌ Error submitting pledge: " + data.error);
      }
    } catch (error) {
      setMessage("❌ Failed to connect to the server. Please try again.");
    }
  };

  return (
    <center>
      <div className="pledge-section">
        <div className="pledge-container">
          <h1>Pledge for <span>Clean India Mission</span></h1>
          {message && <p className="message">{message}</p>} {/* Display success/error message */}

          <form onSubmit={handleSubmit}>
            <input 
              type="text" 
              name="name" 
              placeholder="Enter your name" 
              value={formData.name} 
              onChange={handleChange}
              required
            />
            <input 
              type="email" 
              name="email" 
              placeholder="Enter your email" 
              value={formData.email} 
              onChange={handleChange}
              required
            />
            <input 
              type="text" 
              name="city" 
              placeholder="Enter your city" 
              value={formData.city} 
              onChange={handleChange}
              required
            />

            <div className="pledge-options">
              {pledgeOptions.map((pledge, index) => (
                <div key={index}>
                  <input
                    type="checkbox"
                    id={`pledge-${index}`}
                    checked={formData.pledges.includes(pledge)}
                    onChange={() => handleCheckboxChange(pledge)}
                  />
                  <label htmlFor={`pledge-${index}`}>{pledge}</label>
                </div>
              ))}
            </div>

            <button type="submit">Submit Pledge</button>
          </form>

          {/* <div className="social-buttons">
            <a href="#" className="share-btn facebook">Facebook</a>
            <a href="#" className="share-btn">WhatsApp</a>
          </div> */}
        </div>
      </div>
    </center>
  );
};

export default PledgePage;
