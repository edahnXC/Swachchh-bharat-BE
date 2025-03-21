import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Donation from '../components/Donation';

function DonationPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('donorToken'); // Check if user is logged in
    if (!token) {
      navigate('/donor-login'); // Redirect to login if not authenticated
    }
  }, [navigate]);

  return <Donation />;
}

export default DonationPage;
