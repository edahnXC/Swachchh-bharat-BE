import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles.css'; // Ensure you have a CSS file linked

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
    trsn_id: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    navigate('/payment'); // Redirect to payment page
  };

  const handleLogout = () => {
    navigate('/donor-login'); // Redirect to donor login page
  };

  return (
    <div className="donation-page">
      <h2>SELECT THE AMOUNT YOU WISH TO DONATE</h2>
      <form id="donationForm" onSubmit={handleSubmit}>
        <div className="donation-form-section">
          <input type="number" name="amt" placeholder="Helping Amount*" required onChange={handleChange} />
          <input type="text" name="name" placeholder="Name*" required onChange={handleChange} />
        </div>
        <div className="donation-form-section">
          <input type="email" name="email" placeholder="Email Address*" required onChange={handleChange} />
          <input type="text" name="phn" placeholder="Phone*" required onChange={handleChange} />
          <input type="text" name="pan_no" placeholder="PAN number*" required onChange={handleChange} />
        </div>
        <h3 id="address">ADDRESS</h3>
        <div className="donation-form-section">
          <input type="text" name="address" placeholder="Street Address*" required onChange={handleChange} />
          <input type="text" name="address2" placeholder="Address Line 2" onChange={handleChange} />
        </div>
        <div className="donation-form-section">
          <select name="state_name" required onChange={handleChange}>
            <option value="">Select State</option>
            <option value="Delhi">Delhi</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Karnataka">Karnataka</option>
            {/* Add more states */}
          </select>
          <input type="text" name="city" placeholder="City*" required onChange={handleChange} />
          <input type="text" name="zip" placeholder="ZIP / Postal Code*" required onChange={handleChange} />
          <input type="text" name="country" value="India" disabled />
        </div>
        
        <button id="submit" type="submit">PROCEED TO PAYMENT</button><br></br><br></br>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>

      </form>
    </div>
  );
}

export default Donation;