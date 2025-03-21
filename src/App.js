import React, { useState } from "react";
import { Route, Routes, Link, useNavigate } from "react-router-dom";
import "./styles.css";
import ErrorBoundary from "./ErrorBoundary";

// Import all your components
import Home from "./components/Home";
import Programmes from "./components/Programmes";
import Volunteer from "./components/Volunteer";
import VolunteerForm from "./components/VolunteerForm";
import DonorLogin from "./components/DonorLogin";
import DonorSignup from "./components/DonorSignup";
import Pledge from "./pages/PledgePage";
import Contact from "./components/Contact";
import Donation from "./components/Donation";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem("token") ? true : false);

  const redirectToDonation = () => {
    if (isAuthenticated) {
      navigate("/donation");
    } else {
      navigate("/donor-login"); // Redirect to login if not authenticated
    }
  };

  return (
    <ErrorBoundary>
      <div className="app-container">
        <header>
          <nav className="navbar">
            <ul className="nav-links">
              <li><Link to="/">What We Do</Link></li>
              <li><Link to="/programmes">Programmes</Link></li>
              <li><Link to="/volunteer">Volunteer</Link></li>
              <li><Link to="/pledge">Take A Pledge</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
            <button className="donate-btn" onClick={redirectToDonation}>
              Donate Now
            </button>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/programmes" element={<Programmes />} />
            <Route path="/volunteer" element={<Volunteer />} />
            <Route path="/volunteer-form" element={<VolunteerForm />} />
            <Route path="/donor-login" element={<DonorLogin setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/donor-signup" element={<DonorSignup setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/pledge" element={<Pledge />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/donation" element={isAuthenticated ? <Donation /> : <DonorLogin setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Routes>
        </main>

        <footer>
          <p>&copy; 2025 Clean India Mission</p>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
