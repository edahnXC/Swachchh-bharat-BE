import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles.css';

function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { donationId, amount, paymentId } = location.state || {};

  useEffect(() => {
    // Clear any stored form data when success page mounts
    sessionStorage.removeItem('donationFormData');
    
    if (!donationId || !amount || !paymentId) {
      navigate('/donate');
    }
  }, [donationId, amount, paymentId, navigate]);

  if (!donationId || !amount || !paymentId) {
    return null;
  }

  return (
    <div className="payment-success-page">
      <div className="payment-success-container">
        <div className="success-icon">✓</div>
        <h2>Donation Successful!</h2>
        <p>Thank you for your generous donation of ₹{amount}.</p>
        
        <div className="payment-details">
          <p><strong>Payment ID:</strong> {paymentId}</p>
        </div>

        <p>You will receive a receipt at your email shortly.</p>
        
        <button 
          onClick={() => navigate('/')}
          className="return-home-btn"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}

export default PaymentSuccess;