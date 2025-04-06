import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles.css";

const DonorSignup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
    state: "",
    city: "",
    date: new Date().toISOString().split("T")[0],
    agreeToTerms: false
  });

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [filteredStates, setFilteredStates] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState({
    countries: true,
    states: true,
    submission: false
  });
  const navigate = useNavigate();

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
        setError("Failed to load location data. Please refresh the page.");
      } finally {
        setLoading(prev => ({
          ...prev,
          countries: false,
          states: false
        }));
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(prev => ({ ...prev, submission: true }));

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(prev => ({ ...prev, submission: false }));
      return;
    }

    if (!formData.agreeToTerms) {
      setError("You must agree to the terms and conditions");
      setLoading(prev => ({ ...prev, submission: false }));
      return;
    }

    try {
      const { confirmPassword, agreeToTerms, ...submitData } = formData;
      const response = await axios.post(
        "http://localhost:5000/api/donors/signup", 
        submitData
      );

      if (response.data.success) {
        alert("Signup successful! Please log in.");
        navigate("/donor-login");
      } else {
        setError(response.data.message || "Signup failed!");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 
                     error.response?.data?.error || 
                     "Signup failed. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(prev => ({ ...prev, submission: false }));
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
            name="name"
            placeholder="Full Name"
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
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

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
                <option disabled>No states available for selected country</option>
              )}
            </select>
          </div>

          <input
            type="text"
            name="city"
            placeholder="Enter your city"
            value={formData.city}
            onChange={handleChange}
            required
          />

          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
          />

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="agreeToTerms"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              required
            />
            <label htmlFor="agreeToTerms">I agree to the terms and conditions</label>
          </div>

          <button type="submit" disabled={loading.submission}>
            {loading.submission ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
        <p>Already a User? <a href="/donor-login">Login here</a></p>
      </div>
    </div>
  );
};

export default DonorSignup;