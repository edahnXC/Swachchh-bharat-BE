import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminFundStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('/api/admin/fund-stats');
        setStats(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load fund statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="fund-stats">
      <h2>Donation Statistics</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Raised</h3>
          <p>₹{stats.totalRaised.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Total Donations</h3>
          <p>{stats.totalDonations}</p>
        </div>
        <div className="stat-card">
          <h3>Average Donation</h3>
          <p>₹{stats.averageDonation.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

export default AdminFundStats;