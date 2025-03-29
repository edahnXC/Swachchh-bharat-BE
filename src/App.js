import React, { useState, useEffect } from "react";
import { Route, Routes, Link, useNavigate } from "react-router-dom";
import "./styles.css";
import ErrorBoundary from "./ErrorBoundary";
import "bootstrap/dist/css/bootstrap.min.css";

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

// Protected Route Component
const ProtectedRoute = ({ element, isAuthenticated, redirectTo }) => {
    return isAuthenticated ? element : <DonorLogin />;
};

const AdminProtectedRoute = ({ element, isAdmin }) => {
    return isAdmin ? element : <AdminLogin />;
};

function App() {
    const navigate = useNavigate();

    // Authentication States
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    // Sync authentication states with localStorage
    useEffect(() => {
        setIsAuthenticated(!!localStorage.getItem("token"));
        setIsAdmin(!!localStorage.getItem("adminToken"));
    }, []);

    // Handle Logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        navigate("/donor-login");
    };

    // const handleAdminLogout = () => {
    //     localStorage.removeItem("adminToken");
    //     setIsAdmin(false);
    //     navigate("/admin");
    // };

    // Redirect to donation or login
    const redirectToDonation = () => {
        if (isAuthenticated) {
            navigate("/donation");
        } else {
            navigate("/donor-login");
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
                        <div className="nav-buttons">
                        {/* Donate Now should always be visible */}
                        <button className="donate-btn" onClick={redirectToDonation}>
                            Donate Now
                        </button>

                        {/* Show Logout only when the user is logged in */}
                        {isAuthenticated && (
                            <button className="logged-btn" onClick={handleLogout}>
                                Logout
                            </button>
                        )}
    </div>
</nav>
                </header>

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

                        {/* Protected Routes */}
                        <Route
                            path="/donation"
                            element={<ProtectedRoute element={<Donation />} isAuthenticated={isAuthenticated} />}
                        />

                        {/* Admin Routes */}
                        <Route path="/admin" element={<AdminLogin setIsAdmin={setIsAdmin} />} />
                        <Route
                            path="/admin/add-program"
                            element={<AdminProtectedRoute element={<AddProgram />} isAdmin={isAdmin} />}
                        />
                        <Route
                            path="/admin/panel"
                            element={<AdminProtectedRoute element={<AdminPanel />} isAdmin={isAdmin} />}
                        />
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
