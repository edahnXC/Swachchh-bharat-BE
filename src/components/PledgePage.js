import React, { useState } from "react";
import "../pledgestyles.css";

const PledgePage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    city: "",
    pledges: [],
    date: new Date().toISOString().split("T")[0], // Auto-fill date
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/pledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        setMessage("✅ Thank you for your pledge!");
        setFormData({
          name: "",
          email: "",
          city: "",
          pledges: [],
          date: new Date().toISOString().split("T")[0], // Reset date
        });
      } else {
        setMessage("❌ Error: " + data.message);
      }
    } catch (error) {
      setLoading(false);
      setMessage("❌ Failed to connect to the server. Please try again.");
    }
  };

  return (
    <center>
      <div className="pledge-section">
        <div className="pledge-container">
          <h1>Pledge for <span>Clean India Mission</span></h1>
          {message && <p className="message">{message}</p>} 

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

            <button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Pledge"}
            </button>
          </form>
        </div>
      </div>
    </center>
  );
};

export default PledgePage;
