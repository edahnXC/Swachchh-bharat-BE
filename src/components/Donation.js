import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles.css';

function Donation() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amt: '',
    name: '',
    email: '',
    phn: '',
    address: '',
    state_name: '',
    city: '',
    zip: '',
    trsn_id: '',
  });

  useEffect(() => {
    const fetchDonorInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await axios.get('http://localhost:5000/api/donors/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const donor = response.data;
        setFormData(prev => ({
          ...prev,
          name: donor.name || '',
          email: donor.email || '',
          // Add other fields if available in your donor model
        }));
      } catch (error) {
        console.error('Error fetching donor info:', error);
      }
    };

    fetchDonorInfo();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/donations', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/payment');
    } catch (error) {
      console.error('Donation submission error:', error);
      alert('Failed to submit donation. Please try again.');
    }
  };

  return (
    <div className="donation-page">
      <div className="donation-container">
        <h2>Select the Amount You Wish to Donate</h2>
        <p>Your contribution helps us make a difference in our community</p>
        
        <form className="donation-form" onSubmit={handleSubmit}>
          <div className="donation-form-group">
            <label htmlFor="amt">Donation Amount (₹)*</label>
            <input 
              type="number" 
              id="amt" 
              name="amt" 
              placeholder="Enter amount" 
              required 
              onChange={handleChange}
              min="1"
              value={formData.amt}
            />
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

          <div className="donation-form-row">
            <div className="donation-form-group">
              <label htmlFor="phn">Phone Number*</label>
              <input 
                type="tel" 
                id="phn" 
                name="phn" 
                placeholder="+91 " 
                required 
                onChange={handleChange}
                value={formData.phn}
              />
            </div>
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

          <div className="donation-form-group">
            <label htmlFor="address2">Address Line 2 (Optional)</label>
            <input 
              type="text" 
              id="address2" 
              name="address2" 
              placeholder="Area, Landmark" 
              onChange={handleChange}
            />
          </div>

          <div className="donation-form-row">
            <div className="donation-form-group">
              <label htmlFor="state_name">State*</label>
              <select 
                id="state_name" 
                name="state_name" 
                required 
                onChange={handleChange}
                value={formData.state_name}
              >
                <option value="">Select State</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
              </select>
            </div>
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
          </div>

          <div className="donation-form-row">
            <div className="donation-form-group">
              <label htmlFor="zip">ZIP / Postal Code*</label>
              <input 
                type="text" 
                id="zip" 
                name="zip" 
                placeholder="PIN code" 
                required 
                onChange={handleChange}
                pattern="[0-9]{6}"
                title="6-digit PIN code"
                value={formData.zip}
              />
            </div>
            <div className="donation-form-group">
              <label htmlFor="country">Country</label>
              <input 
                type="text" 
                id="country" 
                name="country" 
                value="India" 
                disabled 
                className="disabled-field"
              />
            </div>
          </div>

          <button type="submit" className="submit-donation-btn">
            Proceed to Payment
            <i className="fas fa-arrow-right" style={{ marginLeft: '8px' }}></i>
          </button>
        </form>
      </div>
    </div>
  );
}

export default Donation;