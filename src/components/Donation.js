import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles.css';

function Donation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    amount: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    country: '',
    state: '',
    city: '',
    postalCode: '',
  });

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (location.state?.error) {
      setError(location.state.error);
    }
    if (location.state?.formData) {
      setFormData(prev => ({
        ...prev,
        ...location.state.formData
      }));
    }
  }, [location.state]);

  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
      try {
        const response = await axios.get('https://swachchh-bharat-be.onrender.com/api/public/countries', {
          timeout: 10000
        });
        setCountries(response.data.data || []);
      } catch (error) {
        console.error('Error fetching countries:', error);
        setError('Failed to load countries. Please refresh the page.');
      } finally {
        setLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchStates = async () => {
      if (!formData.country) {
        setStates([]);
        return;
      }
      
      setLoadingStates(true);
      try {
        const response = await axios.get(
          `https://swachchh-bharat-be.onrender.com/api/public/states?country=${formData.country}`,
          { timeout: 10000 }
        );
        setStates(response.data.data || []);
      } catch (error) {
        console.error('Error fetching states:', error);
        setError('Failed to load states for selected country.');
      } finally {
        setLoadingStates(false);
      }
    };
    
    if (formData.country) {
      fetchStates();
    }
  }, [formData.country]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value,
      ...(name === 'country' ? { state: '' } : {})
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const donationAmount = parseFloat(formData.amount);
      if (!donationAmount || donationAmount < 100) {
        throw new Error('Minimum donation amount is ₹100');
      }

      const requiredFields = ['name', 'email', 'phone', 'country', 'state', 'city', 'postalCode'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      sessionStorage.setItem('donationFormData', JSON.stringify({
        ...formData,
        amount: donationAmount
      }));

      const response = await axios.post(
        'https://swachchh-bharat-be.onrender.com/api/donors/donate',
        {
          ...formData,
          amount: donationAmount
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Donation failed');
      }

      navigate('/payment', { 
        state: { 
          donationId: response.data.data.donationId,
          orderId: response.data.data.orderId,
          amount: response.data.data.amount,
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          formData: {
            ...formData,
            amount: donationAmount
          }
        },
        replace: true
      });
    } catch (error) {
      console.error("Donation failed:", error);
      let errorMsg = 'Donation failed. Please try again.';
      
      if (error.response) {
        errorMsg = error.response.data.message || errorMsg;
      } else if (error.request) {
        errorMsg = 'Network error. Please check your connection.';
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setError(errorMsg);
      sessionStorage.removeItem('donationFormData');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donation-page">
      <div className="donation-container">
        <h2>Make a Donation</h2>
        <p>Your contribution helps us make a difference in our community</p>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form className="donation-form" onSubmit={handleSubmit}>
          <div className="donation-form-group">
            <label htmlFor="amount">Donation Amount (₹)*</label>
            <input 
              type="number" 
              id="amount" 
              name="amount" 
              placeholder="Enter amount" 
              required 
              onChange={handleChange}
              min="100"
              step="any"
              value={formData.amount}
            />
            <small>Minimum donation: ₹100</small>
          </div>

          <div className="donation-form-row">
            <div className="donation-form-group">
              <label htmlFor="name">Full Name*</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                placeholder="Your full name" 
                required 
                onChange={handleChange}
                value={formData.name}
              />
            </div>
            <div className="donation-form-group">
              <label htmlFor="email">Email Address*</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="your@email.com" 
                required 
                onChange={handleChange}
                value={formData.email}
              />
            </div>
          </div>

          <div className="donation-form-group">
            <label htmlFor="phone">Phone Number*</label>
            <input 
              type="tel" 
              id="phone" 
              name="phone" 
              placeholder="+91 " 
              required 
              onChange={handleChange}
              pattern="[0-9]{10}"
              title="10 digit phone number"
              value={formData.phone}
            />
          </div>

          <h3 className="section-title">Address Details</h3>

          <div className="donation-form-group">
            <label htmlFor="address">Street Address*</label>
            <input 
              type="text" 
              id="address" 
              name="address" 
              placeholder="House no., Building, Street" 
              required 
              onChange={handleChange}
              value={formData.address}
            />
          </div>

          <div className="donation-form-row">
            <div className="donation-form-group">
              <label htmlFor="country">Country*</label>
              <select
                id="country"
                name="country"
                required
                onChange={handleChange}
                value={formData.country}
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
            <div className="donation-form-group">
              <label htmlFor="state">State*</label>
              <select
                id="state"
                name="state"
                required
                onChange={handleChange}
                value={formData.state}
                disabled={!formData.country || loadingStates}
              >
                <option value="">Select State</option>
                {loadingStates ? (
                  <option disabled>Loading states...</option>
                ) : states.length > 0 ? (
                  states.map(state => (
                    <option key={state._id} value={state._id}>
                      {state.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No states available for selected country</option>
                )}
              </select>
            </div>
          </div>

          <div className="donation-form-row">
            <div className="donation-form-group">
              <label htmlFor="city">City*</label>
              <input 
                type="text" 
                id="city" 
                name="city" 
                placeholder="Your city" 
                required 
                onChange={handleChange}
                value={formData.city}
              />
            </div>
            <div className="donation-form-group">
              <label htmlFor="zip">ZIP / Postal Code*</label>
              <input 
                type="text" 
                id="postalCode" 
                name="postalCode" 
                placeholder="PIN code" 
                required 
                onChange={handleChange}
                pattern="[0-9]{6}"
                title="6-digit PIN code"
                value={formData.postalCode}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-donation-btn"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Proceed to Payment'}
            {!loading && <i className="fas fa-arrow-right" style={{ marginLeft: '8px' }}></i>}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Donation;