import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles.css";

const VolunteerForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    country: "",
    state: "",
    city: "",
    number: "",
    message: "",
  });

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [filteredStates, setFilteredStates] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
      try {
        const response = await axios.get("https://swachchh-bharat-be.onrender.com/api/public/countries");
        console.log("Countries API response:", response.data);
        // Handle both possible response formats
        const countriesData = response.data.data || response.data || [];
        setCountries(countriesData);
      } catch (err) {
        console.error("Failed to fetch countries:", err);
      } finally {
        setLoadingCountries(false);
      }
    };

    const fetchStates = async () => {
      setLoadingStates(true);
      try {
        const response = await axios.get("https://swachchh-bharat-be.onrender.com/api/public/states");
        console.log("States API response:", response.data);
        // Handle both possible response formats
        const statesData = response.data.data || response.data || [];
        setStates(statesData);
      } catch (err) {
        console.error("Failed to fetch states:", err);
      } finally {
        setLoadingStates(false);
      }
    };

    fetchCountries();
    fetchStates();
  }, []);

  useEffect(() => {
    if (formData.country) {
      const filtered = states.filter(state => {
        // Handle both possible state-country relationship structures
        if (state.country) {
          if (typeof state.country === 'object') {
            return state.country._id === formData.country;
          } else {
            return state.country === formData.country;
          }
        }
        return false;
      });
      setFilteredStates(filtered);
    } else {
      setFilteredStates([]);
    }
  }, [formData.country, states]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Reset state when country changes
    if (name === 'country') {
      setFormData(prev => ({ ...prev, state: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!formData.name || !formData.email || !formData.country || !formData.state || !formData.city || !formData.number) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("https://swachchh-bharat-be.onrender.com/api/volunteers", formData);
      setSuccess(response.data.message || "Thank you for your application! We'll contact you soon.");
      setFormData({ 
        name: "", 
        email: "", 
        country: "", 
        state: "", 
        city: "", 
        number: "", 
        message: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
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

          <div className="form-group">
            <label htmlFor="country">Country *</label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              disabled={loadingCountries}
            >
              <option value="">Select Country</option>
              {loadingCountries ? (
                <option disabled>Loading countries...</option>
              ) : (
                countries.map(country => (
                  <option key={country._id} value={country._id}>
                    {country.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="state">State *</label>
            <select
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              disabled={!formData.country || loadingStates}
            >
              <option value="">Select State</option>
              {loadingStates ? (
                <option disabled>Loading states...</option>
              ) : filteredStates.length > 0 ? (
                filteredStates.map(state => (
                  <option key={state._id} value={state._id}>
                    {state.name}
                  </option>
                ))
              ) : (
                <option disabled>No states available for selected country</option>
              )}
            </select>
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

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>

        <Link to="/volunteer" className="back-btn">Back to Volunteer Page</Link>
      </div>
    </div>
  );
};

export default VolunteerForm;