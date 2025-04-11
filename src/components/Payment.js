import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles.css';

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    donationId, 
    orderId, 
    amount, 
    email, 
    name, 
    phone,
    formData
  } = location.state || {};
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const rzpInstanceRef = useRef(null);

  // Check for required data on mount
  useEffect(() => {
    if (!donationId || !orderId || !amount || !email) {
      console.error('Missing payment data, redirecting...');
      navigate('/donate', { 
        state: { 
          error: 'Missing payment information. Please fill the form again.',
          formData: location.state?.formData || 
                   JSON.parse(sessionStorage.getItem('donationFormData'))
        },
        replace: true 
      });
      return;
    }
    
    if (!formData) {
      const storedFormData = JSON.parse(sessionStorage.getItem('donationFormData'));
      if (!storedFormData) {
        navigate('/donate', { 
          state: { error: 'Session expired. Please fill the form again.' },
          replace: true 
        });
      }
    }
  }, [donationId, orderId, amount, email, navigate, formData, location.state]);

  // Load Razorpay script once
  useEffect(() => {
    if (window.Razorpay) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('Razorpay script loaded');
      setScriptLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      setError('Failed to load payment system. Please refresh the page.');
      setLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Initialize payment when script is loaded and data is ready
  useEffect(() => {
    if (!scriptLoaded || !donationId || !orderId) return;

    const initializePayment = async () => {
      setLoading(true);
      try {
        const { data: { key: razorpayKey } } = await axios.get(
          'https://swachchh-bharat-be.onrender.com/api/config/razorpay',
          { timeout: 10000 }
        );

        const completeFormData = formData || 
          JSON.parse(sessionStorage.getItem('donationFormData'));

        if (!completeFormData) {
          throw new Error('Donation information not found');
        }

        const options = {
          key: razorpayKey,
          amount: Math.round(amount * 100),
          currency: 'INR',
          name: 'Clean India Initiative',
          description: 'Donation for Clean India',
          order_id: orderId,
          handler: async (response) => {
            try {
              const verifyResponse = await axios.post(
                'https://swachchh-bharat-be.onrender.com/api/donors/verify-payment',
                {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  donationId,
                  ...completeFormData
                },
                { 
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  timeout: 15000 
                }
              );

              if (!verifyResponse.data.success) {
                throw new Error(verifyResponse.data.message || 'Payment verification failed');
              }

              sessionStorage.removeItem('donationFormData');

              navigate('/payment-success', {
                state: { 
                  donationId,
                  amount,
                  paymentId: response.razorpay_payment_id,
                  name: completeFormData.name,
                  email: completeFormData.email
                },
                replace: true
              });
            } catch (err) {
              console.error('Verification error:', err);
              setError(`Payment verification failed: ${err.response?.data?.message || err.message}`);
              sessionStorage.removeItem('donationFormData');
            }
          },
          prefill: { 
            name: completeFormData.name, 
            email: completeFormData.email, 
            contact: completeFormData.phone || '+919999999999' 
          },
          notes: { donationId },
          theme: { color: '#3399cc' },
          modal: {
            ondismiss: () => {
              navigate('/donate', {
                state: { 
                  formData: completeFormData,
                  error: 'Payment cancelled'
                },
                replace: true
              });
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzpInstanceRef.current = rzp;
        
        rzp.on('payment.failed', (response) => {
          const errorDescription = response.error ? 
            (response.error.description || 'Payment failed') : 
            'Payment failed due to unknown error';
          setError(errorDescription);
          sessionStorage.removeItem('donationFormData');
        });

        rzp.open();
      } catch (err) {
        console.error('Payment initialization error:', err);
        setError(err.response?.data?.message || err.message || 'Payment initialization failed');
        sessionStorage.removeItem('donationFormData');
      } finally {
        setLoading(false);
      }
    };

    initializePayment();

    return () => {
      if (rzpInstanceRef.current) {
        rzpInstanceRef.current.close();
      }
    };
  }, [scriptLoaded, donationId, orderId, amount, email, name, phone, navigate, formData]);

  if (loading) {
    return (
      <div className="payment-page">
        <div className="payment-container">
          <div className="payment-loading">
            <h2>Processing Payment</h2>
            <p>Please wait while we connect to payment gateway...</p>
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-page">
        <div className="payment-container">
          <div className="payment-error">
            <h2>Payment Error</h2>
            <p>{error}</p>
            <div className="payment-error-actions">
              <button 
                onClick={() => window.location.reload()} 
                className="retry-payment-btn"
              >
                Try Again
              </button>
              <button 
                onClick={() => navigate('/donate', {
                  state: { 
                    formData: location.state?.formData || 
                             JSON.parse(sessionStorage.getItem('donationFormData')),
                    error: 'Payment not completed'
                  },
                  replace: true
                })} 
                className="back-to-donate-btn"
              >
                Back to Donation
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default Payment;