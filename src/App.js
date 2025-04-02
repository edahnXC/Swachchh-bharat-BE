import React, { useState, useEffect } from "react";
import { Route, Routes, Link, useNavigate, useLocation } from "react-router-dom";
import "./styles.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { 
  FaPhone, FaEnvelope, FaFacebookF, FaTwitter, 
  FaInstagram, FaLinkedinIn, FaYoutube, 
  FaMapMarkerAlt, FaHandHoldingHeart, FaSignOutAlt 
} from "react-icons/fa";

// Import Components
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
import AdminPanel from "./components/AdminPanel";
import AddProgram from "./components/AddProgram";
import AdminLayout from "./components/AdminLayout";

const ProtectedRoute = ({ element, isAuthenticated }) => {
  return isAuthenticated ? element : <DonorLogin />;
};

// Update your AdminProtectedRoute component in App.js
const AdminProtectedRoute = ({ element, isAdmin }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
      if (!isAdmin) {
          navigate("/admin");
      }
  }, [isAdmin, navigate]);

  return isAdmin ? element : null;
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("token"));
    setIsAdmin(!!localStorage.getItem("adminToken"));
  }, []);

  const isAdminRoute = location.pathname.startsWith("/admin");

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/donor-login");
  };

  const redirectToDonation = () => {
    isAuthenticated ? navigate("/donation") : navigate("/donor-login");
  };

  return (
    <div className={`app-container ${isAdminRoute ? "admin-route" : ""}`}>
      {/* Don't show top bar and nav for admin routes */}
      {!isAdminRoute && (
        <>
          {/* Main Navigation */}
          <nav className="navbar">
            <div className="container">
              <Link to="/" className="logo">
                Swachh Bharat
              </Link>
              
              <ul className="nav-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/programmes">Programmes</Link></li>
                <li><Link to="/volunteer">Volunteer</Link></li>
                <li><Link to="/pledge">Take a Pledge</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>

              <div className="nav-buttons">
                <button className="donate-btn" onClick={redirectToDonation}>
                  <FaHandHoldingHeart /> Donate Now
                </button>
                {isAuthenticated && (
                  <button className="logged-btn" onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                  </button>
                )}
              </div>
            </div>
          </nav>
        </>
      )}

      {/* Main Content */}
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/programmes" element={<Programmes />} />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/volunteer-form" element={<VolunteerForm />} />
          <Route path="/donor-login" element={<DonorLogin setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/donor-signup" element={<DonorSignup setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/pledge" element={<Pledge />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/donation" element={<ProtectedRoute element={<Donation />} isAuthenticated={isAuthenticated} />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin setIsAdmin={setIsAdmin} />} />
          
          {/* Nested Admin Routes */}
          <Route 
            path="/admin/panel" 
            element={<AdminProtectedRoute element={<AdminLayout />} isAdmin={isAdmin} />}
          >
            <Route index element={<AdminPanel />} />
            <Route path="dashboard" element={<AdminPanel />} />
            <Route path="volunteers" element={<AdminPanel />} />
            <Route path="donors" element={<AdminPanel />} />
            <Route path="contacts" element={<AdminPanel />} />
            <Route path="programs" element={<AdminPanel />} />
            <Route path="pledges" element={<AdminPanel />} />
            <Route path="reports" element={<AdminPanel />} />
          </Route>
          
          {/* Separate route for add-program to ensure it's outside the panel layout if needed */}
          <Route 
            path="/admin/add-program" 
            element={<AdminProtectedRoute element={<AddProgram />} isAdmin={isAdmin} />} 
          />
        </Routes>
      </main>

      {/* Don't show footer for admin routes */}
      {!isAdminRoute && (
        <footer>
          <div className="footer-container">
            <div className="footer-top">
              <div className="footer-column">
                <h3>About Us</h3>
                <p>Swachh Bharat Mission is a national campaign by the Government of India to clean the streets, roads and infrastructure of the country.</p>
                <div className="footer-social">
                  <a href="#"><FaFacebookF /></a>
                  <a href="#"><FaTwitter /></a>
                  <a href="#"><FaInstagram /></a>
                  <a href="#"><FaYoutube /></a>
                </div>
              </div>
              
              <div className="footer-column">
                <h3>Quick Links</h3>
                <ul>
                  <li><Link to="/">Home</Link></li>
                  <li><Link to="/programmes">Our Programmes</Link></li>
                  <li><Link to="/volunteer">Volunteer</Link></li>
                  <li><Link to="/pledge">Take a Pledge</Link></li>
                  <li><Link to="/contact">Contact Us</Link></li>
                </ul>
              </div>
              
              <div className="footer-column">
                <h3>Contact Info</h3>
                <ul className="contact-info">
                  <li><FaMapMarkerAlt /> Gujarat, India</li>
                  <li><FaPhone /> +91 9876543210</li>
                  <li><FaEnvelope /> contact@swachhbharat.com</li>
                </ul>
              </div>
            </div>
            
            <div className="footer-bottom">
              <p>&copy; {new Date().getFullYear()} Swachh Bharat Mission. All Rights Reserved.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;