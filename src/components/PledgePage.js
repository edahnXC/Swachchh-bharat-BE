import React, { useState, useEffect } from "react";
import axios from "axios";
import "../pledgestyles.css";

const PledgePage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    country: "",
    state: "",
    city: "",
    pledges: [],
    date: new Date().toISOString().split("T")[0],
  });

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [filteredStates, setFilteredStates] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState({
    countries: true,
    states: true,
    submission: false
  });

  const pledgeOptions = [
    "I pledge to keep my surroundings clean.",
    "I will spread awareness about cleanliness.",
    "I will reduce waste and recycle.",
    "I will volunteer for a clean-up drive.",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countriesRes, statesRes] = await Promise.all([
          axios.get("http://localhost:5000/api/public/countries"),
          axios.get("http://localhost:5000/api/public/states")
        ]);

        if (countriesRes.data.success) setCountries(countriesRes.data.data);
        if (statesRes.data.success) setStates(statesRes.data.data);
      } catch (err) {
        setMessage({ 
          text: "Failed to load location data. Please refresh the page.", 
          type: "error" 
        });
      } finally {
        setLoading(prev => ({ ...prev, countries: false, states: false }));
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (formData.country && states.length > 0) {
      const filtered = states.filter(state => 
        state.country.toString() === formData.country.toString()
      );
      setFilteredStates(filtered);
    } else {
      setFilteredStates([]);
      setFormData(prev => ({ ...prev, state: "" }));
    }
  }, [formData.country, states]);

  const handleCheckboxChange = (pledge) => {
    setFormData(prev => ({
      ...prev,
      pledges: prev.pledges.includes(pledge)
        ? prev.pledges.filter(p => p !== pledge)
        : [...prev.pledges, pledge]
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    setLoading(prev => ({ ...prev, submission: true }));

    if (!formData.name || !formData.email || !formData.country || 
        !formData.state || !formData.city || formData.pledges.length === 0) {
      setMessage({ 
        text: "Please fill in all required fields", 
        type: "error" 
      });
      setLoading(prev => ({ ...prev, submission: false }));
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/pledge", formData);
      setMessage({ 
        text: response.data.message || "Thank you for your pledge!", 
        type: "success" 
      });
      setFormData({
        name: "",
        email: "",
        country: "",
        state: "",
        city: "",
        pledges: [],
        date: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 
                     error.response?.data?.error || 
                     "Submission failed. Please try again.";
      setMessage({ text: errorMsg, type: "error" });
    } finally {
      setLoading(prev => ({ ...prev, submission: false }));
    }
  };

  return (
    <div className="pledge-section">
      <div className="pledge-container">
        <h1>Pledge for <span>Clean India Mission</span></h1>
        {message.text && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input 
              type="text" 
              name="name" 
              placeholder="Enter your name" 
              value={formData.name} 
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input 
              type="email" 
              name="email" 
              placeholder="Enter your email" 
              value={formData.email} 
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Country *</label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              disabled={loading.countries}
            >
              <option value="">Select Country</option>
              {loading.countries ? (
                <option disabled>Loading countries...</option>
              ) : countries.length > 0 ? (
                countries.map(country => (
                  <option key={country._id} value={country._id}>
                    {country.name}
                  </option>
                ))
              ) : (
                <option disabled>No countries available</option>
              )}
            </select>
          </div>

          <div className="form-group">
            <label>State *</label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              disabled={!formData.country || loading.states}
            >
              <option value="">Select State</option>
              {loading.states ? (
                <option disabled>Loading states...</option>
              ) : filteredStates.length > 0 ? (
                filteredStates.map(state => (
                  <option key={state._id} value={state._id}>
                    {state.name}
                  </option>
                ))
              ) : (
                <option disabled>No states available</option>
              )}
            </select>
          </div>

          <div className="form-group">
            <input 
              type="text" 
              name="city" 
              placeholder="Enter your city" 
              value={formData.city} 
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input 
              type="date" 
              name="date" 
              value={formData.date} 
              onChange={handleChange}
            />
          </div>

          <div className="pledge-options">
            <h4>Select your pledges:</h4>
            {pledgeOptions.map((pledge, index) => (
              <div key={index} className="pledge-option">
                <input
                  type="checkbox"
                  id={`pledge-${index}`}
                  checked={formData.pledges.includes(pledge)}
                  onChange={() => handleCheckboxChange(pledge)}
                />
                <span className="checkmark"></span>
                <label htmlFor={`pledge-${index}`}>{pledge}</label>
              </div>
            ))}
          </div>

          <button type="submit" disabled={loading.submission}>
            {loading.submission ? (
              <>
                <span className="spinner"></span> Submitting...
              </>
            ) : (
              "Submit Pledge"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PledgePage;