import React, { useState, useEffect } from "react";
import { Route, Routes, Link, useNavigate, useLocation } from "react-router-dom";
import "./styles.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { 
  FaPhone, FaEnvelope, FaFacebookF, FaTwitter, 
  FaInstagram, FaYoutube, 
  FaMapMarkerAlt, FaHandHoldingHeart
} from "react-icons/fa";

// Import Components
import Home from "./components/Home";
import Programmes from "./components/Programmes";
import Volunteer from "./components/Volunteer";
import VolunteerForm from "./components/VolunteerForm";
import Pledge from "./pages/PledgePage";
import Contact from "./components/Contact";
import Donation from "./components/Donation";
import AdminLogin from "./components/AdminLogin";
import AdminPanel from "./components/AdminPanel";
import AddProgram from "./components/AddProgram";
import AdminLayout from "./components/AdminLayout";
import Payment from "./components/Payment";
import PaymentSuccess from "./components/PaymentSuccess";
import TermsAndConditions from './components/TermsAndConditions';

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Check admin authentication status
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    setIsAdmin(!!adminToken);
  }, [location.pathname]);

  const isAdminRoute = location.pathname.startsWith("/admin");

  const handleAdminLogout = () => {
    localStorage.removeItem("adminToken");
    setIsAdmin(false);
    navigate("/admin");
  };

  return (
    <div className={`app-container ${isAdminRoute ? "admin-route" : ""}`}>
      {/* Main Navigation - Only for non-admin routes */}
      {!isAdminRoute && (
        <nav className="navbar">
          <div className="container">
            <Link to="/" className="logo">
              Swachh Bharat
            </Link>
            <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
      <i className={menuOpen ? "fas fa-times" : "fas fa-bars"}></i>
    </div>

    <ul className={menuOpen ? "nav-links mobile-menu" : "nav-links"}>
      <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
      <li><Link to="/programmes" onClick={() => setMenuOpen(false)}>Programmes</Link></li>
      <li><Link to="/volunteer" onClick={() => setMenuOpen(false)}>Volunteer</Link></li>
      <li><Link to="/pledge" onClick={() => setMenuOpen(false)}>Take a Pledge</Link></li>
      <li><Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link></li>
    </ul>

            <div className="nav-buttons">
              <Link to="/donation" className="donate-btn">
                <FaHandHoldingHeart /> Donate Now
              </Link>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/programmes" element={<Programmes />} />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/volunteer-form" element={<VolunteerForm />} />
          <Route path="/pledge" element={<Pledge />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/donation" element={<Donation />} />
          <Route path="/donate" element={<Donation />}/>
          <Route path="/payment" element={<Payment />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={<AdminLogin setIsAdmin={setIsAdmin} />} 
          />
          
          {/* Nested Admin Routes */}
          <Route 
            path="/admin/panel" 
            element={
              <AdminProtectedRoute 
                element={<AdminLayout onLogout={handleAdminLogout} />} 
                isAdmin={isAdmin} 
              />
            }
          >
            <Route index element={<AdminPanel />} />
            <Route path="dashboard" element={<AdminPanel />} />
            <Route path="volunteers" element={<AdminPanel />} />
            <Route path="donors" element={<AdminPanel />} />
            <Route path="contacts" element={<AdminPanel />} />
            <Route path="programs" element={<AdminPanel />} />
            <Route path="pledges" element={<AdminPanel />} />
            <Route path="countries" element={<AdminPanel />} />
            <Route path="states" element={<AdminPanel />} />
            <Route path="reports" element={<AdminPanel />} />
          </Route>
          
          <Route 
            path="/admin/add-program" 
            element={
              <AdminProtectedRoute 
                element={<AddProgram />} 
                isAdmin={isAdmin} 
              />
            } 
          />
        </Routes>
      </main>

      {/* Footer - Only for non-admin routes */}
      {!isAdminRoute && (
        <footer>
          <div className="footer-container">
            <div className="footer-top">
              <div className="footer-column">
                <h3>About Us</h3>
                <p>Swachh Bharat Mission is a national campaign by the Government of India to clean the streets, roads and infrastructure of the country.</p>
                <div className="footer-social">
                <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
                <a href="https://x.com/?lang=en" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
                <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer"><FaInstagram /> </a>
                <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer"><FaYoutube /> </a>
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
                  <li><Link to="/terms-and-conditions">Terms & Conditions</Link></li>
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