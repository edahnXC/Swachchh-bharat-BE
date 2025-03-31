import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles.css';

function Donation() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amt: '',
    name: '',
    email: '',
    phn: '',
    pan_no: '',
    address: '',
    state_name: '',
    city: '',
    zip: '',
    trsn_id: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    navigate('/payment');
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
              />
            </div>
            <div className="donation-form-group">
              <label htmlFor="pan_no">PAN Number*</label>
              <input 
                type="text" 
                id="pan_no" 
                name="pan_no" 
                placeholder="ABCDE1234F" 
                required 
                onChange={handleChange}
                pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                title="Enter valid PAN (e.g. ABCDE1234F)"
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
              <select id="state_name" name="state_name" required onChange={handleChange}>
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