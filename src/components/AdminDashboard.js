import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminDashboard = () => {
    const [volunteers, setVolunteers] = useState([]);
    const [donors, setDonors] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        if (!token) {
            navigate("/admin/login");
            return;
        }

        const fetchData = async () => {
            try {
                const volunteerRes = await axios.get("http://localhost:5000/api/admin/volunteers", {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true
                });
                setVolunteers(volunteerRes.data.data);

                const donorRes = await axios.get("http://localhost:5000/api/admin/donors", {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true
                });
                setDonors(donorRes.data.data);
            } catch (error) {
                console.log("Error fetching data");
            }
        };

        fetchData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
    };

    return (
    <center>
        <div className="dashboard-container">
            <h2>Admin Dashboard</h2>
            <button onClick={handleLogout}>Logout</button>
            <h3>Volunteers</h3>
            <ul>{volunteers.map((v) => <li key={v._id}>{v.name} - {v.email}</li>)}</ul>
            <h3>Donors</h3>
            <ul>{donors.map((d) => <li key={d._id}>{d.name} - ${d.amount}</li>)}</ul>
        </div>
        </center>
    );
};

export default AdminDashboard;
