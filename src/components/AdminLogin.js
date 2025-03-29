import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminLogin = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(""); // Reset error message

        try {
            const response = await axios.post("http://localhost:5000/api/admin/login", { username, password });

            if (response.data.success) {
                localStorage.setItem("adminToken", response.data.token); // Store token
                navigate("/admin/panel"); // Redirect to dashboard
            } else {
                setError(response.data.message); // Display error
            }
        } catch (error) {
            setError("Invalid Credentials. Please try again.");
        }
    };

    return (
        <center>
        <div className="login-container">
            <h2>Admin Login</h2>
            <form onSubmit={handleLogin}>
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit">Login</button>
                {error && <p className="error">{error}</p>}
            </form>
        </div>
        </center>
    );
};

export default AdminLogin;
