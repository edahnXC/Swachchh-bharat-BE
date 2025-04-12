import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { 
  Row, Col, Card, Table, Button, 
  Nav, Navbar, Dropdown, Modal, Form,
  Pagination, Alert, Spinner
} from "react-bootstrap";
import { 
  FaUsers, FaDonate, FaEnvelope, FaHome, 
  FaHandHoldingHeart, FaRupeeSign,
  FaUserCircle, FaBars, FaTimes,
  FaTrash, FaPlus, FaChartLine, FaEdit,
  FaCalendarAlt, FaEye, FaSignOutAlt, FaSearch,
  FaGlobe
} from "react-icons/fa";
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import "./adminpanel.css";

Chart.register(...registerables);

// Helper functions for consistent data rendering
const renderCountry = (country) => {
  if (!country) return 'N/A';
  if (typeof country === 'string') return country;
  if (country && typeof country === 'object' && country.name) return country.name;
  return 'N/A';
};

const renderState = (state) => {
  if (!state) return 'N/A';
  if (typeof state === 'string') return state;
  if (state && typeof state === 'object' && state.name) return state.name;
  return 'N/A';
};

const renderAmount = (amount) => {
  if (amount === undefined || amount === null) return 'N/A';
  return `₹${amount.toLocaleString('en-IN')}`;
};

const AdminPanel = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [volunteers, setVolunteers] = useState([]);
    const [donors, setDonors] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [pledges, setPledges] = useState([]);
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showCountryModal, setShowCountryModal] = useState(false);
    const [showStateModal, setShowStateModal] = useState(false);
    const [showVolunteerModal, setShowVolunteerModal] = useState(false);
    const [showProgramModal, setShowProgramModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [adminDetails, setAdminDetails] = useState({
        username: "",
        email: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [countryForm, setCountryForm] = useState({
        name: "",
        code: "",
        currency: "INR",
        currencySymbol: "₹"
    });
    const [stateForm, setStateForm] = useState({
        name: "",
        code: "",
        country: ""
    });
    const [volunteerForm, setVolunteerForm] = useState({
        name: "",
        email: "",
        number: "",
        city: "",
        country: "",
        state: "",
        message: ""
    });
    const [programForm, setProgramForm] = useState({
        title: "",
        description: "",
        date: "",
        image: null,
        imagePreview: "",
        existingImage: ""
    });
    
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [reportType, setReportType] = useState("monthly");
    const [reportData, setReportData] = useState(null);
    const [reportYear, setReportYear] = useState(new Date().getFullYear());
    const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
    const [stats, setStats] = useState({
        totalDonors: 0,
        totalVolunteers: 0,
        totalPrograms: 0,
        totalPledges: 0,
        totalContacts: 0,
        totalCountries: 0,
        totalStates: 0
    });

    const navItems = [
        { tab: "dashboard", icon: <FaHome />, label: "Dashboard" },
        { tab: "volunteers", icon: <FaUsers />, label: "Volunteers" },
        { tab: "donors", icon: <FaDonate />, label: "Donors" },
        { tab: "contacts", icon: <FaEnvelope />, label: "Messages" },
        { tab: "programs", icon: <FaCalendarAlt />, label: "Programs" },
        { tab: "pledges", icon: <FaHandHoldingHeart />, label: "Pledges" },
        { tab: "countries", icon: <FaGlobe />, label: "Countries" },
        { tab: "states", icon: <FaGlobe />, label: "States" },
        { tab: "reports", icon: <FaChartLine />, label: "Reports" }
    ];

    const fetchAdminStats = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const response = await axios.get("https://swachchh-bharat-be.onrender.com/api/admin/stats", {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success) {
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const fetchData = useCallback(async (tab) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("adminToken");
            if (!token) {
                navigate("/admin");
                return;
            }
    
            const headers = { Authorization: `Bearer ${token}` };
            
            // Fetch admin profile first if not already loaded
            if (!adminDetails.username) {
                const profileResponse = await axios.get("https://swachchh-bharat-be.onrender.com/api/admin/profile", { headers });
                if (profileResponse.data.success) {
                    setAdminDetails(prev => ({
                        ...prev,
                        username: profileResponse.data.admin.username,
                        email: profileResponse.data.admin.email
                    }));
                }
            }
    
            // Only fetch data for the current tab and dashboard stats
            const endpoints = [];
            
            if (tab === "volunteers" || tab === "dashboard") {
                endpoints.push(axios.get("https://swachchh-bharat-be.onrender.com/api/admin/volunteers", { headers }));
            }
            if (tab === "donors" || tab === "dashboard") {
                endpoints.push(axios.get("https://swachchh-bharat-be.onrender.com/api/admin/donors", { headers }));
            }
            if (tab === "contacts" || tab === "dashboard") {
                endpoints.push(axios.get("https://swachchh-bharat-be.onrender.com/api/admin/contacts", { headers }));
            }
            if (tab === "programs" || tab === "dashboard") {
                endpoints.push(axios.get("https://swachchh-bharat-be.onrender.com/api/admin/programs", { headers }));
            }
            if (tab === "pledges" || tab === "dashboard") {
                endpoints.push(axios.get("https://swachchh-bharat-be.onrender.com/api/admin/pledges", { headers }));
            }
            if (tab === "countries" || tab === "dashboard") {
                endpoints.push(axios.get("https://swachchh-bharat-be.onrender.com/api/admin/countries", { headers }));
            }
            if (tab === "states" || tab === "dashboard") {
                endpoints.push(axios.get("https://swachchh-bharat-be.onrender.com/api/admin/states", { headers }));
            }
    
            if (endpoints.length === 0) {
                setLoading(false);
                return;
            }
    
            const responses = await Promise.all(endpoints);
            let responseIndex = 0;
    
            // Process and set data based on endpoints
            if (tab === "volunteers" || tab === "dashboard") {
                const volunteersData = responses[responseIndex++]?.data?.data || [];
                setVolunteers(volunteersData.map(v => ({
                    ...v,
                    country: (v.country && typeof v.country === 'object' && v.country.name) 
                        ? v.country.name 
                        : (v.country || 'N/A'),
                    state: (v.state && typeof v.state === 'object' && v.state.name) 
                        ? v.state.name 
                        : (v.state || 'N/A')
                })));
            }
            if (tab === "donors" || tab === "dashboard") {
                const donorsData = responses[responseIndex++]?.data?.data || [];
                setDonors(donorsData.map(d => ({
                    ...d,
                    country: (d.country && typeof d.country === 'object' && d.country.name) 
                        ? d.country.name 
                        : (d.country || 'N/A'),
                    amount: d.amount || 0
                })));
            }
            if (tab === "contacts" || tab === "dashboard") {
                setContacts(responses[responseIndex++]?.data?.data || []);
            }
            if (tab === "programs" || tab === "dashboard") {
                const programsData = responses[responseIndex++]?.data?.data || [];
                setPrograms(programsData.map(p => ({
                    ...p,
                    title: p.title || 'Untitled Program',
                    description: p.description || 'No description',
                    date: p.date || null,
                    image: p.image || null
                })));
            }
            if (tab === "pledges" || tab === "dashboard") {
                const pledgesData = responses[responseIndex++]?.data?.data || [];
                setPledges(pledgesData.map(p => ({
                    ...p,
                    country: (p.country && typeof p.country === 'object' && p.country.name) 
                        ? p.country.name 
                        : (p.country || 'N/A'),
                    pledges: Array.isArray(p.pledges) ? p.pledges : [p.pledges || 'N/A']
                })));
            }
            if (tab === "countries" || tab === "dashboard") {
                setCountries(responses[responseIndex++]?.data?.data || []);
            }
            if (tab === "states" || tab === "dashboard") {
                setStates(responses[responseIndex++]?.data?.data || []);
            }
    
            // Always fetch stats when dashboard is loaded
            if (tab === "dashboard") {
                await fetchAdminStats();
            }
        } catch (error) {
            console.error("Error fetching data:", error.response?.data || error.message);
            if (error.response?.status === 401) {
                localStorage.removeItem("adminToken");
                navigate("/admin");
            }
            setError("Failed to fetch data. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [navigate, adminDetails.username]);

    const handleProgramImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                setError("Only JPG, PNG, or GIF images are allowed");
                return;
            }
    
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setError("Image size must be less than 5MB");
                return;
            }
    
            const reader = new FileReader();
            reader.onloadend = () => {
                setProgramForm({
                    ...programForm,
                    image: file,
                    imagePreview: reader.result
                });
                setError("");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditProgram = (program) => {
        setProgramForm({
            _id: program._id,
            title: program.title || "",
            description: program.description || "",
            date: program.date ? new Date(program.date).toISOString().split('T')[0] : "",
            image: null,
            imagePreview: program.image || "",
            existingImage: program.image || ""
        });
        setShowProgramModal(true);
    };

    const handleProgramSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        
        // Validation
        if (!programForm.title || !programForm.description) {
            setError("Title and description are required");
            return;
        }
    
        if (programForm.title.length > 100) {
            setError("Title must be less than 100 characters");
            return;
        }
    
        try {
            const token = localStorage.getItem("adminToken");
            if (!token) {
                setError("Authentication token not found");
                return;
            }
    
            const formData = new FormData();
            formData.append('title', programForm.title.trim());
            formData.append('description', programForm.description.trim());
            
            if (programForm.date) {
                formData.append('date', programForm.date);
            }
            
            if (programForm.image) {
                formData.append('image', programForm.image);
            }
    
            const endpoint = programForm._id 
                ? `https://swachchh-bharat-be.onrender.com/api/admin/programs/${programForm._id}`
                : "https://swachchh-bharat-be.onrender.com/api/admin/programs";
            
            const method = programForm._id ? "put" : "post";
            
            const response = await axios[method](endpoint, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (response.data.success) {
                const updatedProgram = {
                    ...response.data.program,
                    title: response.data.program.title || 'Untitled Program',
                    description: response.data.program.description || 'No description'
                };
    
                if (programForm._id) {
                    setPrograms(prev => prev.map(p => 
                        p._id === programForm._id ? updatedProgram : p
                    ));
                    setSuccess("Program updated successfully!");
                } else {
                    setPrograms(prev => [...prev, updatedProgram]);
                    setSuccess("Program added successfully!");
                }
                
                setTimeout(() => setSuccess(""), 3000);
                setShowProgramModal(false);
                setProgramForm({
                    title: "",
                    description: "",
                    date: "",
                    image: null,
                    imagePreview: "",
                    existingImage: ""
                });
                setActiveTab("programs");
                navigate("/admin/panel/programs");
            } else {
                setError(response.data.message || "Failed to save program");
                setActiveTab("programs");
                navigate("/admin/panel/programs");
            }
        } catch (error) {
            console.error("Error saving program:", error);
            const errorMessage = error.response?.data?.message || 
                                error.message || 
                                "Failed to save program. Please try again.";
            setError(errorMessage);
            setTimeout(() => setError(""), 3000);
            setActiveTab("programs");
            navigate("/admin/panel/programs");
        }
    };

    const generateReportData = useCallback(async () => {
        const token = localStorage.getItem("adminToken");
        if (!token) return;

        try {
            setLoading(true);
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get(
                `https://swachchh-bharat-be.onrender.com/api/admin/reports?type=${reportType}&year=${reportYear}&month=${reportMonth}`,
                { headers }
            );

            if (response.data.success) {
                const data = response.data.data;
                
                const processedData = {
                    ...data,
                    dailyVolunteers: data.dailyVolunteers || [],
                    dailyDonations: data.dailyDonations || [],
                    dailyPledges: data.dailyPledges || [],
                    monthlyVolunteers: data.monthlyVolunteers || [],
                    monthlyDonations: data.monthlyDonations || [],
                    monthlyPledges: data.monthlyPledges || []
                };
                
                setReportData(processedData);
            } else {
                setError(response.data.message || "Failed to generate report");
            }
        } catch (error) {
            console.error("Error generating report:", error);
            setError("Failed to generate report data");
        } finally {
            setLoading(false);
        }
    }, [reportType, reportYear, reportMonth]);

    useEffect(() => {
        const path = location.pathname;
        let tab = "dashboard";
        
        if (path.includes("volunteers")) tab = "volunteers";
        else if (path.includes("donors")) tab = "donors";
        else if (path.includes("contacts")) tab = "contacts";
        else if (path.includes("programs")) tab = "programs";
        else if (path.includes("pledges")) tab = "pledges";
        else if (path.includes("countries")) tab = "countries";
        else if (path.includes("states")) tab = "states";
        else if (path.includes("reports")) tab = "reports";
        
        setActiveTab(tab);
        
        const token = localStorage.getItem("adminToken");
        if (!token) {
            navigate("/admin");
            return;
        }
    
        fetchData(tab);
    
        if (tab === "reports") {
            generateReportData();
        }
    }, [location.pathname, navigate, generateReportData, fetchData]);

    const filterData = (data) => {
        if (!searchTerm || !Array.isArray(data)) return data;
        return data.filter(item => 
            Object.values(item).some(
                val => val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentVolunteers = filterData(volunteers).slice(indexOfFirstItem, indexOfLastItem);
    const currentDonors = filterData(donors).slice(indexOfFirstItem, indexOfLastItem);
    const currentContacts = filterData(contacts).slice(indexOfFirstItem, indexOfLastItem);
    const currentPrograms = filterData(programs).slice(indexOfFirstItem, indexOfLastItem);
    const currentPledges = filterData(pledges).slice(indexOfFirstItem, indexOfLastItem);
    const currentCountries = filterData(countries).slice(indexOfFirstItem, indexOfLastItem);
    const currentStates = filterData(states).slice(indexOfFirstItem, indexOfLastItem);

    const goToHomepage = () => navigate("/");
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1);
        setSearchTerm("");
        navigate(`/admin/panel/${tab}`);
    };

    const handleAddNew = () => {
        switch(activeTab) {
            case "programs":
                setProgramForm({
                    title: "",
                    description: "",
                    date: "",
                    image: null,
                    imagePreview: "",
                    existingImage: ""
                });
                setShowProgramModal(true);
                break;
            case "countries":
                setCountryForm({
                    name: "",
                    code: "",
                    currency: "INR",
                    currencySymbol: "₹"
                });
                setShowCountryModal(true);
                break;
            case "states":
                setStateForm({
                    name: "",
                    code: "",
                    country: countries.length > 0 ? countries[0]._id : ""
                });
                setShowStateModal(true);
                break;
            case "volunteers":
                setVolunteerForm({
                    name: "",
                    email: "",
                    number: "",
                    city: "",
                    country: "",
                    state: "",
                    message: ""
                });
                setShowVolunteerModal(true);
                break;
            default:
                break;
        }
    };

    const handleEditCountry = (country) => {
        setCountryForm({
            name: country.name || "",
            code: country.code || "",
            currency: country.currency || "INR",
            currencySymbol: country.currencySymbol || "₹",
            _id: country._id
        });
        setShowCountryModal(true);
    };

    const handleEditState = (state) => {
        setStateForm({
            name: state.name || "",
            code: state.code || "",
            country: state.country?._id || state.country || "",
            _id: state._id
        });
        setShowStateModal(true);
    };

    const handleEditVolunteer = (volunteer) => {
        setVolunteerForm({
            _id: volunteer._id,
            name: volunteer.name || "",
            email: volunteer.email || "",
            number: volunteer.number || "",
            city: volunteer.city || "",
            country: volunteer.country?._id || volunteer.country || "",
            state: volunteer.state?._id || volunteer.state || "",
            message: volunteer.message || ""
        });
        setShowVolunteerModal(true);
    };

    const handleDelete = async (id, type) => {
        if (!window.confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)) return;
        
        try {
            const token = localStorage.getItem("adminToken");
            let endpoint = '';
            if (type === "countries") {
                endpoint = `https://swachchh-bharat-be.onrender.com/api/admin/countries/${id}`;
            } else if (type === "states") {
                endpoint = `https://swachchh-bharat-be.onrender.com/api/admin/states/${id}`;
            } else {
                endpoint = `https://swachchh-bharat-be.onrender.com/api/admin/${type}/${id}`;
            }
            
            await axios.delete(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const updateState = {
                'volunteers': setVolunteers,
                'donors': setDonors,
                'contacts': setContacts,
                'programs': setPrograms,
                'pledges': setPledges,
                'countries': setCountries,
                'states': setStates
            };
            
            updateState[type](prev => prev.filter(item => item._id !== id));
            
            // Update stats if we're on dashboard
            if (activeTab === "dashboard") {
                fetchAdminStats();
            }
            
            setSuccess(`${type.slice(0, -1).charAt(0).toUpperCase() + type.slice(0, -1).slice(1)} deleted successfully!`);
            setTimeout(() => setSuccess(""), 3000);
        } catch (error) {
            console.error(`Error deleting ${type}:`, error.response?.data || error.message);
            setError(`Failed to delete ${type.slice(0, -1)}. Please try again.`);
            setTimeout(() => setError(""), 3000);
        }
    };

    const viewDetails = (item, type) => {
        setSelectedItem({ 
            ...item, 
            type
        });
    };

    const handleAdminUpdate = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        
        if (adminDetails.newPassword && adminDetails.newPassword !== adminDetails.confirmPassword) {
            setError("New passwords don't match!");
            return;
        }

        try {
            const token = localStorage.getItem("adminToken");
            const response = await axios.put(
                "https://swachchh-bharat-be.onrender.com/api/admin/profile", 
                {
                    username: adminDetails.username,
                    email: adminDetails.email,
                    currentPassword: adminDetails.currentPassword,
                    newPassword: adminDetails.newPassword
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (response.data.success) {
                setSuccess("Profile updated successfully!");
                setTimeout(() => setSuccess(""), 3000);
                setShowProfileModal(false);
                setAdminDetails(prev => ({
                    ...prev,
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                }));
            }
        } catch (error) {
            console.error("Error updating profile:", error.response?.data || error.message);
            setError(error.response?.data?.message || "Failed to update profile. Please try again.");
            setTimeout(() => setError(""), 3000);
        }
    };

    const handleCountrySubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        
        // Validation
        if (!countryForm.name || !countryForm.code) {
            setError("Name and code are required");
            return;
        }
        
        if (countryForm.code.length < 2 || countryForm.code.length > 3) {
            setError("Country code must be 2-3 characters");
            return;
        }
    
        if (countryForm.name.length > 50) {
            setError("Country name must be less than 50 characters");
            return;
        }
    
        try {
            const token = localStorage.getItem("adminToken");
            const endpoint = countryForm._id ? 
                `https://swachchh-bharat-be.onrender.com/api/admin/countries/${countryForm._id}` : 
                "https://swachchh-bharat-be.onrender.com/api/admin/countries";
                
            const method = countryForm._id ? "put" : "post";
            
            const response = await axios[method](
                endpoint,
                {
                    name: countryForm.name.trim(),
                    code: countryForm.code.trim().toUpperCase(),
                    currency: countryForm.currency.trim(),
                    currencySymbol: countryForm.currencySymbol.trim()
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (response.data.success) {
                if (countryForm._id) {
                    setCountries(prev => prev.map(c => 
                        c._id === countryForm._id ? response.data.country : c
                    ));
                    setSuccess("Country updated successfully!");
                } else {
                    setCountries(prev => [...prev, response.data.country]);
                    setSuccess("Country added successfully!");
                }
                
                setTimeout(() => setSuccess(""), 3000);
                setShowCountryModal(false);
                setCountryForm({
                    name: "",
                    code: "",
                    currency: "INR",
                    currencySymbol: "₹"
                });
                setActiveTab("countries");
                navigate("/admin/panel/countries");
            } else {
                setError(response.data.message || "Failed to save country. Please try again.");
                setActiveTab("countries");
                navigate("/admin/panel/countries");
            }
        } catch (error) {
            console.error("Error saving country:", error.response?.data || error.message);
            setError(error.response?.data?.message || "Failed to save country. Please try again.");
            setTimeout(() => setError(""), 3000);
            setActiveTab("countries");
            navigate("/admin/panel/countries");
        }
    };

    const handleStateSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        
        // Validation
        if (!stateForm.name || !stateForm.code || !stateForm.country) {
            setError("All fields are required");
            return;
        }
        
        if (stateForm.code.length < 2 || stateForm.code.length > 3) {
            setError("State code must be 2-3 characters");
            return;
        }
    
        if (stateForm.name.length > 50) {
            setError("State name must be less than 50 characters");
            return;
        }
    
        try {
            const token = localStorage.getItem("adminToken");
            const endpoint = stateForm._id ? 
                `https://swachchh-bharat-be.onrender.com/api/admin/states/${stateForm._id}` : 
                "https://swachchh-bharat-be.onrender.com/api/admin/states";
                
            const method = stateForm._id ? "put" : "post";
            
            const response = await axios[method](
                endpoint,
                {
                    name: stateForm.name.trim(),
                    code: stateForm.code.trim().toUpperCase(),
                    country: stateForm.country
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (response.data.success) {
                if (stateForm._id) {
                    setStates(prev => prev.map(s => 
                        s._id === stateForm._id ? response.data.state : s
                    ));
                    setSuccess("State updated successfully!");
                } else {
                    setStates(prev => [...prev, response.data.state]);
                    setSuccess("State added successfully!");
                }
                
                setTimeout(() => setSuccess(""), 3000);
                setShowStateModal(false);
                setStateForm({
                    name: "",
                    code: "",
                    country: ""
                });
                setActiveTab("states");
                navigate("/admin/panel/states");
            } else {
                setError(response.data.message || "Failed to save state. Please try again.");
                setActiveTab("states");
                navigate("/admin/panel/states");
            }
        } catch (error) {
            console.error("Error saving state:", error.response?.data || error.message);
            setError(error.response?.data?.message || "Failed to save state. Please try again.");
            setTimeout(() => setError(""), 3000);
            setActiveTab("states");
            navigate("/admin/panel/states");
        }
    };

    const handleVolunteerSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        
        // Validation
        if (!volunteerForm.name || !volunteerForm.email || !volunteerForm.number) {
            setError("Name, email and phone number are required");
            return;
        }
    
        if (volunteerForm.name.length > 50) {
            setError("Name must be less than 50 characters");
            return;
        }
    
        if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(volunteerForm.email)) {
            setError("Please enter a valid email address");
            return;
        }
    
        if (!/^[0-9]{10,15}$/.test(volunteerForm.number)) {
            setError("Please enter a valid phone number (10-15 digits)");
            return;
        }
    
        try {
            const token = localStorage.getItem("adminToken");
            const endpoint = volunteerForm._id ? 
                `https://swachchh-bharat-be.onrender.com/api/admin/volunteers/${volunteerForm._id}` : 
                "https://swachchh-bharat-be.onrender.com/api/admin/volunteers";
                
            const method = volunteerForm._id ? "put" : "post";
            
            const response = await axios[method](
                endpoint,
                {
                    name: volunteerForm.name.trim(),
                    email: volunteerForm.email.trim(),
                    number: volunteerForm.number.trim(),
                    city: volunteerForm.city.trim(),
                    country: volunteerForm.country,
                    state: volunteerForm.state,
                    message: volunteerForm.message.trim()
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (response.data.success) {
                if (volunteerForm._id) {
                    setVolunteers(prev => prev.map(v => 
                        v._id === volunteerForm._id ? response.data.volunteer : v
                    ));
                    setSuccess("Volunteer updated successfully!");
                } else {
                    setVolunteers(prev => [...prev, response.data.volunteer]);
                    setSuccess("Volunteer added successfully!");
                }
                
                setTimeout(() => setSuccess(""), 3000);
                setShowVolunteerModal(false);
                setVolunteerForm({
                    name: "",
                    email: "",
                    number: "",
                    city: "",
                    country: "",
                    state: "",
                    message: ""
                });
                setActiveTab("volunteers");
                navigate("/admin/panel/volunteers");
            } else {
                setError(response.data.message || "Failed to save volunteer. Please try again.");
                setActiveTab("volunteers");
                navigate("/admin/panel/volunteers");
            }
        } catch (error) {
            console.error("Error saving volunteer:", error.response?.data || error.message);
            setError(error.response?.data?.message || "Failed to save volunteer. Please try again.");
            setTimeout(() => setError(""), 3000);
            setActiveTab("volunteers");
            navigate("/admin/panel/volunteers");
        }
    };

    const getCountForTab = (tab) => {
        switch(tab) {
            case 'volunteers': return stats.totalVolunteers;
            case 'donors': return stats.totalDonors;
            case 'contacts': return stats.totalContacts;
            case 'programs': return stats.totalPrograms;
            case 'pledges': return stats.totalPledges;
            case 'countries': return stats.totalCountries;
            case 'states': return stats.totalStates;
            default: return 0;
        }
    };

    const getColorForTab = (tab) => {
        switch(tab) {
            case 'volunteers': return 'primary';
            case 'donors': return 'success';
            case 'contacts': return 'info';
            case 'programs': return 'warning';
            case 'pledges': return 'danger';
            case 'countries': return 'secondary';
            case 'states': return 'dark';
            default: return 'primary';
        }
    };

    const renderPagination = (items) => {
        const filteredItems = filterData(items);
        const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
        
        if (totalPages <= 1) return null;
    
        // Show limited page numbers for better UX
        const getPageNumbers = () => {
            const pages = [];
            const maxVisiblePages = 5;
            
            if (totalPages <= maxVisiblePages) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else {
                const half = Math.floor(maxVisiblePages / 2);
                let start = currentPage - half;
                let end = currentPage + half;
                
                if (start < 1) {
                    start = 1;
                    end = maxVisiblePages;
                }
                
                if (end > totalPages) {
                    end = totalPages;
                    start = totalPages - maxVisiblePages + 1;
                }
                
                if (start > 1) pages.push(1);
                if (start > 2) pages.push('...');
                
                for (let i = start; i <= end; i++) pages.push(i);
                
                if (end < totalPages - 1) pages.push('...');
                if (end < totalPages) pages.push(totalPages);
            }
            
            return pages;
        };
    
        return (
            <Pagination className="mt-3 justify-content-center">
                <Pagination.Prev 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                    disabled={currentPage === 1}
                />
                {getPageNumbers().map((number, index) => (
                    number === '...' ? (
                        <Pagination.Ellipsis key={`ellipsis-${index}`} />
                    ) : (
                        <Pagination.Item
                            key={number}
                            active={number === currentPage}
                            onClick={() => setCurrentPage(number)}
                        >
                            {number}
                        </Pagination.Item>
                    )
                ))}
                <Pagination.Next 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                    disabled={currentPage === totalPages}
                />
            </Pagination>
        );
    };

    const renderReportCharts = () => {
        if (!reportData) return null;
    
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
    
        // Volunteers Chart
        const volunteersData = {
            labels: reportType === 'monthly' ? 
                Array.from({ length: new Date(reportYear, reportMonth, 0).getDate() }, (_, i) => i + 1) :
                months,
            datasets: [{
                label: 'Volunteers',
                data: reportType === 'monthly' ? 
                    (reportData.dailyVolunteers || Array(new Date(reportYear, reportMonth, 0).getDate()).fill(0)) : 
                    (reportData.monthlyVolunteers || Array(12).fill(0)),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                tension: 0.1
            }]
        };
    
        // Donations Chart
        const donationsData = {
            labels: reportType === 'monthly' ? 
                Array.from({ length: new Date(reportYear, reportMonth, 0).getDate() }, (_, i) => i + 1) :
                months,
            datasets: [{
                label: 'Donations (₹)',
                data: reportType === 'monthly' ? 
                    (reportData.dailyDonations || Array(new Date(reportYear, reportMonth, 0).getDate()).fill(0)) : 
                    (reportData.monthlyDonations || Array(12).fill(0)),
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                tension: 0.1
            }]
        };
    
        // Pledges Chart
        const pledgesData = {
            labels: reportType === 'monthly' ? 
                Array.from({ length: new Date(reportYear, reportMonth, 0).getDate() }, (_, i) => i + 1) :
                months,
            datasets: [{
                label: 'Pledges',
                data: reportType === 'monthly' ? 
                    (reportData.dailyPledges || Array(new Date(reportYear, reportMonth, 0).getDate()).fill(0)) : 
                    (reportData.monthlyPledges || Array(12).fill(0)),
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                tension: 0.1
            }]
        };
    
        // Summary Pie Chart
        const summaryData = {
            labels: ['Volunteers', 'Donations (₹)', 'Pledges', 'Messages', 'Programs'],
            datasets: [{
                data: [
                    reportData.totalVolunteers || 0,
                    reportData.totalDonations || 0,
                    reportData.totalPledges || 0,
                    reportData.totalMessages || 0,
                    reportData.totalPrograms || 0
                ],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        };
    
        // Common chart options
        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                if (context.dataset.label.includes('Donations')) {
                                    label += `₹${context.parsed.y.toLocaleString('en-IN')}`;
                                } else {
                                    label += context.parsed.y;
                                }
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: reportType === 'monthly' ? 'Count' : 'Amount (₹)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: reportType === 'monthly' ? 'Day' : 'Month'
                    }
                }
            }
        };
    
        return (
            <div className="report-charts">
                <Row>
                    <Col md={12} className="mb-4">
                        <Card>
                            <Card.Header>
                                <h5>Summary</h5>
                            </Card.Header>
                            <Card.Body>
                                <div style={{ height: '300px' }}>
                                    <Pie 
                                        data={summaryData}
                                        options={{
                                            ...commonOptions,
                                            plugins: {
                                                legend: {
                                                    position: 'right'
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col md={4} className="mb-4">
                        <Card>
                            <Card.Header>
                                <h5>Volunteers</h5>
                            </Card.Header>
                            <Card.Body>
                                <div style={{ height: '300px' }}>
                                    <Bar 
                                        data={volunteersData}
                                        options={{
                                            ...commonOptions,
                                            scales: {
                                                ...commonOptions.scales,
                                                y: {
                                                    ...commonOptions.scales.y,
                                                    title: {
                                                        ...commonOptions.scales.y.title,
                                                        text: 'Count'
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4} className="mb-4">
                        <Card>
                            <Card.Header>
                                <h5>Donations</h5>
                            </Card.Header>
                            <Card.Body>
                                <div style={{ height: '300px' }}>
                                    <Line 
                                        data={donationsData}
                                        options={{
                                            ...commonOptions,
                                            scales: {
                                                ...commonOptions.scales,
                                                y: {
                                                    ...commonOptions.scales.y,
                                                    title: {
                                                        ...commonOptions.scales.y.title,
                                                        text: 'Amount (₹)'
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4} className="mb-4">
                        <Card>
                            <Card.Header>
                                <h5>Pledges</h5>
                            </Card.Header>
                            <Card.Body>
                                <div style={{ height: '300px' }}>
                                    <Bar 
                                        data={pledgesData}
                                        options={{
                                            ...commonOptions,
                                            scales: {
                                                ...commonOptions.scales,
                                                y: {
                                                    ...commonOptions.scales.y,
                                                    title: {
                                                        ...commonOptions.scales.y.title,
                                                        text: 'Count'
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col md={12}>
                        <Card>
                            <Card.Header>
                                <h5>Total Statistics</h5>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={2} className="text-center">
                                        <Card className="mb-3">
                                            <Card.Body>
                                                <h3>{reportData.totalVolunteers || 0}</h3>
                                                <p>Volunteers</p>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={2} className="text-center">
                                        <Card className="mb-3">
                                            <Card.Body>
                                                <h3>₹{(reportData.totalDonations || 0).toLocaleString('en-IN')}</h3>
                                                <p>Donations</p>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={2} className="text-center">
                                        <Card className="mb-3">
                                            <Card.Body>
                                                <h3>{reportData.totalPledges || 0}</h3>
                                                <p>Pledges</p>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={2} className="text-center">
                                        <Card className="mb-3">
                                            <Card.Body>
                                                <h3>{reportData.totalMessages || 0}</h3>
                                                <p>Messages</p>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={2} className="text-center">
                                        <Card className="mb-3">
                                            <Card.Body>
                                                <h3>{reportData.totalPrograms || 0}</h3>
                                                <p>Programs</p>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    };

    return (
        <div className={`admin-container ${sidebarOpen ? "" : "sidebar-collapsed"}`}>
            {/* Sidebar */}
            <div className="admin-sidebar">
                <div className="sidebar-header">
                    <h3>Swachh Bharat </h3>
                    <Button variant="link" onClick={toggleSidebar} className="sidebar-toggle">
                        {sidebarOpen ? <FaTimes /> : <FaBars />}
                    </Button>
                </div>
                <Nav className="flex-column sidebar-nav">
                    {navItems.map(({ tab, icon, label }) => (
                        <Nav.Link
                            key={tab}
                            className={`nav-item ${activeTab === tab ? "active" : ""}`}
                            onClick={() => handleTabChange(tab)}
                        >
                            <span className="nav-icon">{icon}</span>
                            {sidebarOpen && <span className="nav-label">{label}</span>}
                        </Nav.Link>
                    ))}
                </Nav>
            </div>

            {/* Main Content */}
            <div className="admin-main">
                {/* Top Header */}
                <Navbar bg="light" expand="lg" className="admin-header">
                    <div className="header-actions ms-auto">
                        <Button variant="primary" onClick={goToHomepage} className="me-2">
                            Go to Homepage
                        </Button>
                        <Dropdown>
                            <Dropdown.Toggle variant="link" id="dropdown-user" className="user-dropdown">
                                <FaUserCircle /> {adminDetails.username || "Admin"}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => setShowProfileModal(true)}>
                                    <FaUserCircle className="me-2" /> Profile
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item 
                                    onClick={() => {
                                        localStorage.removeItem("adminToken");
                                        navigate("/admin");
                                    }}
                                >
                                    <FaSignOutAlt className="me-2" /> Logout
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </Navbar>

                {/* Alerts */}
                {error && (
                    <Alert variant="danger" onClose={() => setError("")} dismissible className="m-3">
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert variant="success" onClose={() => setSuccess("")} dismissible className="m-3">
                        {success}
                    </Alert>
                )}

                {/* Content Area */}
                <div className="admin-content">
                    {loading && (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2">Loading data...</p>
                        </div>
                    )}

                    {!loading && (
                        <>
                            {/* Dashboard */}
                            {activeTab === "dashboard" && (
                                <div className="dashboard-content">
                                    <Row className="stats-row">
                                        {navItems.filter(item => item.tab !== "dashboard" && item.tab !== "reports").map(({ tab, icon, label }) => (
                                            <Col md={4} lg={3} key={tab}>
                                                <Card 
                                                    className="stat-card"
                                                    onClick={() => handleTabChange(tab)}
                                                >
                                                    <Card.Body>
                                                        <div className={`stat-icon bg-${getColorForTab(tab)}`}>
                                                            {icon}
                                                        </div>
                                                        <div className="stat-info">
                                                            <h3>{getCountForTab(tab)}</h3>
                                                            <p>{label}</p>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        ))}
                                        <Col md={4} lg={3}>
                                            <Card className="stat-card">
                                                <Card.Body>
                                                    <div className="stat-icon bg-secondary">
                                                        <FaRupeeSign />
                                                    </div>
                                                    <div className="stat-info">
                                                        <h3>₹ {donors.reduce((sum, donor) => sum + (donor.amount || 0), 0)}</h3>
                                                        <p>Funds Raised</p>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                </div>
                            )}

                            {/* Volunteers List */}
                            {activeTab === "volunteers" && (
                                <Card>
                                    <Card.Header className="d-flex justify-content-between align-items-center">
                                        <h5>Volunteers</h5>
                                        <div className="d-flex">
                                            <div className="search-box me-2">
                                                <FaSearch className="search-icon" />
                                                <input
                                                    type="text"
                                                    placeholder="Search volunteers..."
                                                    value={searchTerm}
                                                    onChange={(e) => {
                                                        setSearchTerm(e.target.value);
                                                        setCurrentPage(1);
                                                    }}
                                                />
                                            </div>
                                            <Button variant="success" size="sm" onClick={handleAddNew}>
                                                <FaPlus /> Add New
                                            </Button>
                                        </div>
                                    </Card.Header>
                                    <Card.Body>
                                        {filterData(volunteers).length === 0 ? (
                                            <Alert variant="info">No volunteers found</Alert>
                                        ) : (
                                            <>
                                                <Table striped hover responsive>
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Name</th>
                                                            <th>Email</th>
                                                            <th>Country</th>
                                                            <th>State</th>
                                                            <th>City</th>
                                                            <th>Contact</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {currentVolunteers.map((volunteer, index) => (
                                                            <tr key={volunteer._id}>
                                                                <td>{indexOfFirstItem + index + 1}</td>
                                                                <td>{volunteer.name || 'N/A'}</td>
                                                                <td>{volunteer.email || 'N/A'}</td>
                                                                <td>{renderCountry(volunteer.country)}</td>
                                                                <td>{renderState(volunteer.state)}</td>
                                                                <td>{volunteer.city || 'N/A'}</td>
                                                                <td>{volunteer.number || 'N/A'}</td>
                                                                <td>
                                                                    <Button 
                                                                        variant="info" 
                                                                        size="sm"
                                                                        className="me-2"
                                                                        onClick={() => viewDetails(volunteer, "volunteer")}
                                                                    >
                                                                        <FaEye />
                                                                    </Button>
                                                                    <Button 
                                                                        variant="warning" 
                                                                        size="sm"
                                                                        className="me-2"
                                                                        onClick={() => handleEditVolunteer(volunteer)}
                                                                    >
                                                                        <FaEdit />
                                                                    </Button>
                                                                    <Button 
                                                                        variant="danger" 
                                                                        size="sm"
                                                                        onClick={() => handleDelete(volunteer._id, "volunteers")}
                                                                    >
                                                                        <FaTrash />
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                                {renderPagination(volunteers)}
                                            </>
                                        )}
                                    </Card.Body>
                                </Card>
                            )}

                            {/* Donors List */}
                            {activeTab === "donors" && (
                                <Card>
                                    <Card.Header className="d-flex justify-content-between align-items-center">
                                    <h5>Donors</h5>
                                    <div className="d-flex">
                                        <div className="search-box me-2">
                                        <FaSearch className="search-icon" />
                                        <input
                                            type="text"
                                            placeholder="Search donors..."
                                            value={searchTerm}
                                            onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1);
                                            }}
                                        />
                                        </div>
                                    </div>
                                    </Card.Header>
                                    <Card.Body>
                                        {filterData(donors).length === 0 ? (
                                            <Alert variant="info">No donors found</Alert>
                                        ) : (
                                            <>
                                                <Table striped hover responsive>
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Name</th>
                                                            <th>Email</th>
                                                            <th>Amount</th>
                                                            <th>Country</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {currentDonors.map((donor, index) => (
                                                            <tr key={donor._id}>
                                                                <td>{indexOfFirstItem + index + 1}</td>
                                                                <td>{donor.name || 'N/A'}</td>
                                                                <td>{donor.email || 'N/A'}</td>
                                                                <td>{renderAmount(donor.amount)}</td>
                                                                <td>{renderCountry(donor.country)}</td>
                                                                <td>
                                                                    <Button 
                                                                        variant="info" 
                                                                        size="sm"
                                                                        className="me-2"
                                                                        onClick={() => viewDetails(donor, "donor")}
                                                                    >
                                                                        <FaEye />
                                                                    </Button>
                                                                    <Button 
                                                                        variant="danger" 
                                                                        size="sm"
                                                                        onClick={() => handleDelete(donor._id, "donors")}
                                                                    >
                                                                        <FaTrash />
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                                {renderPagination(donors)}
                                            </>
                                        )}
                                    </Card.Body>
                                </Card>
                            )}

                            {/* Contacts List */}
                            {activeTab === "contacts" && (
                                <Card>
                                    <Card.Header className="d-flex justify-content-between align-items-center">
                                    <h5>Messages</h5>
                                    <div className="d-flex">
                                        <div className="search-box me-2">
                                        <FaSearch className="search-icon" />
                                        <input
                                            type="text"
                                            placeholder="Search messages..."
                                            value={searchTerm}
                                            onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1);
                                            }}
                                        />
                                        </div>
                                    </div>
                                    </Card.Header>
                                    <Card.Body>
                                        {filterData(contacts).length === 0 ? (
                                            <Alert variant="info">No messages found</Alert>
                                        ) : (
                                            <>
                                                <Table striped hover responsive>
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Name</th>
                                                            <th>Email</th>
                                                            <th>Message</th>
                                                            <th>Country</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {currentContacts.map((contact, index) => (
                                                            <tr key={contact._id}>
                                                                <td>{indexOfFirstItem + index + 1}</td>
                                                                <td>{contact.name}</td>
                                                                <td>{contact.email}</td>
                                                                <td>{contact.message.substring(0, 50)}...</td>
                                                                <td>{contact.country || 'N/A'}</td>
                                                                <td>
                                                                    <Button 
                                                                        variant="info" 
                                                                        size="sm"
                                                                        className="me-2"
                                                                        onClick={() => viewDetails(contact, "message")}
                                                                    >
                                                                        <FaEye />
                                                                    </Button>
                                                                    <Button 
                                                                        variant="danger" 
                                                                        size="sm"
                                                                        onClick={() => handleDelete(contact._id, "contacts")}
                                                                    >
                                                                        <FaTrash />
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                                {renderPagination(contacts)}
                                            </>
                                        )}
                                    </Card.Body>
                                </Card>
                            )}

                            {/* Programs List */}
                            {activeTab === "programs" && (
                                <Card>
                                    <Card.Header className="d-flex justify-content-between align-items-center">
                                        <h5>Programs</h5>
                                        <div className="d-flex">
                                            <div className="search-box me-2">
                                                <FaSearch className="search-icon" />
                                                <input
                                                    type="text"
                                                    placeholder="Search programs..."
                                                    value={searchTerm}
                                                    onChange={(e) => {
                                                        setSearchTerm(e.target.value);
                                                        setCurrentPage(1);
                                                    }}
                                                />
                                            </div>
                                            <Button variant="success" size="sm" onClick={handleAddNew}>
                                                <FaPlus /> Add New
                                            </Button>
                                        </div>
                                    </Card.Header>
                                    <Card.Body>
                                        {filterData(programs).length === 0 ? (
                                            <Alert variant="info">No programs found</Alert>
                                        ) : (
                                            <>
                                                <Table striped hover responsive>
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Title</th>
                                                            <th>Description</th>
                                                            <th>Image</th>
                                                            <th>Date</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {currentPrograms.map((program, index) => (
                                                            <tr key={program._id}>
                                                                <td>{indexOfFirstItem + index + 1}</td>
                                                                <td>{program.title || 'Untitled Program'}</td>
                                                                <td>{program.description.substring(0, 50)}...</td>
                                                                <td>
                                                                {program.image ? (
                                                                    <img 
                                                                        src={program.image}
                                                                        alt={program.title || 'Program'} 
                                                                        width="50" 
                                                                        className="img-thumbnail"
                                                                        onError={(e) => {
                                                                            e.target.onerror = null;
                                                                            e.target.src = '/placeholder.jpg';
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <span className="text-muted">No image</span>
                                                                )}
                                                                </td>
                                                                <td>{program.date ? new Date(program.date).toLocaleDateString() : 'N/A'}</td>
                                                                <td>
                                                                    <Button 
                                                                        variant="info" 
                                                                        size="sm"
                                                                        className="me-2"
                                                                        onClick={() => viewDetails(program, "program")}
                                                                    >
                                                                        <FaEye />
                                                                    </Button>
                                                                    <Button 
                                                                        variant="warning" 
                                                                        size="sm"
                                                                        className="me-2"
                                                                        onClick={() => handleEditProgram(program)}
                                                                    >
                                                                        <FaEdit />
                                                                    </Button>
                                                                    <Button 
                                                                        variant="danger" 
                                                                        size="sm"
                                                                        onClick={() => handleDelete(program._id, "programs")}
                                                                    >
                                                                        <FaTrash />
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                                {renderPagination(programs)}
                                            </>
                                        )}
                                    </Card.Body>
                                </Card>
                            )}

                            {/* Pledges List */}
                            {activeTab === "pledges" && (
                                <Card>
                                    <Card.Header className="d-flex justify-content-between align-items-center">
                                        <h5>Pledges</h5>
                                        <div className="d-flex">
                                            <div className="search-box me-2">
                                                <FaSearch className="search-icon" />
                                                <input
                                                    type="text"
                                                    placeholder="Search pledges..."
                                                    value={searchTerm}
                                                    onChange={(e) => {
                                                        setSearchTerm(e.target.value);
                                                        setCurrentPage(1);
                                                    }}
                                                />
                                            </div>
                                            <Button variant="success" size="sm" onClick={handleAddNew}>
                                                <FaPlus /> Add New
                                            </Button>
                                        </div>
                                    </Card.Header>
                                    <Card.Body>
                                        {filterData(pledges).length === 0 ? (
                                            <Alert variant="info">No pledges found</Alert>
                                        ) : (
                                            <>
                                                <Table striped hover responsive>
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Name</th>
                                                            <th>Email</th>
                                                            <th>Country</th>
                                                            <th>City</th>
                                                            <th>Pledges</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {currentPledges.map((pledge, index) => (
                                                            <tr key={pledge._id}>
                                                                <td>{indexOfFirstItem + index + 1}</td>
                                                                <td>{pledge.name || 'N/A'}</td>
                                                                <td>{pledge.email || 'N/A'}</td>
                                                                <td>{renderCountry(pledge.country)}</td>
                                                                <td>{pledge.city || 'N/A'}</td>
                                                                <td>
                                                                    <ul className="list-unstyled">
                                                                        {pledge.pledges.slice(0, 2).map((p, i) => (
                                                                            <li key={i}>• {p || 'N/A'}</li>
                                                                        ))}
                                                                    </ul>
                                                                </td>
                                                                <td>
                                                                    <Button 
                                                                        variant="info" 
                                                                        size="sm"
                                                                        className="me-2"
                                                                        onClick={() => viewDetails(pledge, "pledge")}
                                                                    >
                                                                        <FaEye />
                                                                    </Button>
                                                                    <Button 
                                                                        variant="danger" 
                                                                        size="sm"
                                                                        onClick={() => handleDelete(pledge._id, "pledges")}
                                                                    >
                                                                        <FaTrash />
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                                {renderPagination(pledges)}
                                            </>
                                        )}
                                    </Card.Body>
                                </Card>
                            )}

                            {/* Countries List */}
                            {activeTab === "countries" && (
                                <Card>
                                    <Card.Header className="d-flex justify-content-between align-items-center">
                                        <h5>Countries</h5>
                                        <div className="d-flex">
                                            <div className="search-box me-2">
                                                <FaSearch className="search-icon" />
                                                <input
                                                    type="text"
                                                    placeholder="Search countries..."
                                                    value={searchTerm}
                                                    onChange={(e) => {
                                                        setSearchTerm(e.target.value);
                                                        setCurrentPage(1);
                                                    }}
                                                />
                                            </div>
                                            <Button variant="success" size="sm" onClick={handleAddNew}>
                                                <FaPlus /> Add New
                                            </Button>
                                        </div>
                                    </Card.Header>
                                    <Card.Body>
                                        {filterData(countries).length === 0 ? (
                                            <Alert variant="info">No countries found</Alert>
                                        ) : (
                                            <>
                                                <Table striped hover responsive>
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Name</th>
                                                            <th>Code</th>
                                                            <th>Currency</th>
                                                            <th>Symbol</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {currentCountries.map((country, index) => (
                                                            <tr key={country._id}>
                                                                <td>{indexOfFirstItem + index + 1}</td>
                                                                <td>{country.name}</td>
                                                                <td>{country.code}</td>
                                                                <td>{country.currency}</td>
                                                                <td>{country.currencySymbol}</td>
                                                                <td>
                                                                    <Button 
                                                                        variant="info" 
                                                                        size="sm"
                                                                        className="me-2"
                                                                        onClick={() => viewDetails(country, "country")}
                                                                    >
                                                                        <FaEye />
                                                                    </Button>
                                                                    <Button 
                                                                        variant="warning" 
                                                                        size="sm"
                                                                        className="me-2"
                                                                        onClick={() => handleEditCountry(country)}
                                                                    >
                                                                        <FaEdit />
                                                                    </Button>
                                                                    <Button 
                                                                        variant="danger" 
                                                                        size="sm"
                                                                        onClick={() => handleDelete(country._id, "countries")}
                                                                    >
                                                                        <FaTrash />
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                                {renderPagination(countries)}
                                            </>
                                        )}
                                    </Card.Body>
                                </Card>
                            )}

                            {/* States List */}
                            {activeTab === "states" && (
                                <Card>
                                    <Card.Header className="d-flex justify-content-between align-items-center">
                                        <h5>States</h5>
                                        <div className="d-flex">
                                            <div className="search-box me-2">
                                                <FaSearch className="search-icon" />
                                                <input
                                                    type="text"
                                                    placeholder="Search states..."
                                                    value={searchTerm}
                                                    onChange={(e) => {
                                                        setSearchTerm(e.target.value);
                                                        setCurrentPage(1);
                                                    }}
                                                />
                                            </div>
                                            <Button variant="success" size="sm" onClick={handleAddNew}>
                                                <FaPlus /> Add New
                                            </Button>
                                        </div>
                                    </Card.Header>
                                    <Card.Body>
                                        {filterData(states).length === 0 ? (
                                            <Alert variant="info">No states found</Alert>
                                        ) : (
                                            <>
                                                <Table striped hover responsive>
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Name</th>
                                                            <th>Code</th>
                                                            <th>Country</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {currentStates.map((state, index) => (
                                                            <tr key={state._id}>
                                                                <td>{indexOfFirstItem + index + 1}</td>
                                                                <td>{state.name}</td>
                                                                <td>{state.code}</td>
                                                                <td>{state.country?.name || (typeof state.country === 'string' ? state.country : 'N/A')}</td>
                                                                <td>
                                                                    <Button 
                                                                        variant="info" 
                                                                        size="sm"
                                                                        className="me-2"
                                                                        onClick={() => viewDetails(state, "state")}
                                                                    >
                                                                        <FaEye />
                                                                    </Button>
                                                                    <Button 
                                                                        variant="warning" 
                                                                        size="sm"
                                                                        className="me-2"
                                                                        onClick={() => handleEditState(state)}
                                                                    >
                                                                        <FaEdit />
                                                                    </Button>
                                                                    <Button 
                                                                        variant="danger" 
                                                                        size="sm"
                                                                        onClick={() => handleDelete(state._id, "states")}
                                                                    >
                                                                        <FaTrash />
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                                {renderPagination(states)}
                                            </>
                                        )}
                                    </Card.Body>
                                </Card>
                            )}

                            {/* Reports */}
                            {activeTab === "reports" && (
                                <Card>
                                    <Card.Header className="d-flex justify-content-between align-items-center">
                                        <h5>Reports</h5>
                                        <div className="d-flex">
                                            <Form.Select 
                                                value={reportType}
                                                onChange={(e) => setReportType(e.target.value)}
                                                className="me-2"
                                                style={{ width: '150px' }}
                                            >
                                                <option value="monthly">Monthly</option>
                                                <option value="yearly">Yearly</option>
                                            </Form.Select>
                                            {reportType === 'monthly' && (
                                                <>
                                                    <Form.Select 
                                                        value={reportMonth}
                                                        onChange={(e) => setReportMonth(parseInt(e.target.value))}
                                                        className="me-2"
                                                        style={{ width: '150px' }}
                                                    >
                                                        {Array.from({ length: 12 }, (_, i) => (
                                                            <option key={i+1} value={i+1}>
                                                                {new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
                                                            </option>
                                                        ))}
                                                    </Form.Select>
                                                    <Form.Select 
                                                        value={reportYear}
                                                        onChange={(e) => setReportYear(parseInt(e.target.value))}
                                                        style={{ width: '120px' }}
                                                    >
                                                        {Array.from({ length: 10 }, (_, i) => (
                                                            <option key={i} value={new Date().getFullYear() - i}>
                                                                {new Date().getFullYear() - i}
                                                            </option>
                                                        ))}
                                                    </Form.Select>
                                                </>
                                            )}
                                            {reportType === 'yearly' && (
                                                <Form.Select 
                                                    value={reportYear}
                                                    onChange={(e) => setReportYear(parseInt(e.target.value))}
                                                    style={{ width: '120px' }}
                                                >
                                                    {Array.from({ length: 10 }, (_, i) => (
                                                        <option key={i} value={new Date().getFullYear() - i}>
                                                            {new Date().getFullYear() - i}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            )}
                                        </div>
                                    </Card.Header>
                                    <Card.Body>
                                        {loading ? (
                                            <div className="text-center py-5">
                                                <Spinner animation="border" variant="primary" />
                                                <p className="mt-2">Generating report...</p>
                                            </div>
                                        ) : reportData ? (
                                            <>
                                                <Row className="mb-4">
                                                    <Col md={3}>
                                                        <Card className="text-center">
                                                            <Card.Body>
                                                                <h3>{reportData.totalVolunteers}</h3>
                                                                <p>Total Volunteers</p>
                                                            </Card.Body>
                                                        </Card>
                                                    </Col>
                                                    <Col md={3}>
                                                        <Card className="text-center">
                                                            <Card.Body>
                                                                <h3>₹{reportData.totalDonations.toLocaleString('en-IN')}</h3>
                                                                <p>Total Donations</p>
                                                            </Card.Body>
                                                        </Card>
                                                    </Col>
                                                    <Col md={3}>
                                                        <Card className="text-center">
                                                            <Card.Body>
                                                                <h3>{reportData.totalPledges}</h3>
                                                                <p>Total Pledges</p>
                                                            </Card.Body>
                                                        </Card>
                                                    </Col>
                                                    <Col md={3}>
                                                        <Card className="text-center">
                                                            <Card.Body>
                                                                <h3>{reportData.totalPrograms}</h3>
                                                                <p>Total Programs</p>
                                                            </Card.Body>
                                                        </Card>
                                                    </Col>
                                                </Row>
                                                {renderReportCharts()}
                                            </>
                                        ) : (
                                            <Alert variant="info">No report data available</Alert>
                                        )}
                                    </Card.Body>
                                </Card>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Profile Modal */}
            <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Admin Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleAdminUpdate}>
                        <Form.Group className="mb-3">
                            <Form.Label>Username *</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={adminDetails.username}
                                onChange={(e) => setAdminDetails({...adminDetails, username: e.target.value})}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email Address *</Form.Label>
                            <Form.Control 
                                type="email" 
                                value={adminDetails.email}
                                onChange={(e) => setAdminDetails({...adminDetails, email: e.target.value})}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Current Password (required for changes)</Form.Label>
                            <Form.Control 
                                type="password" 
                                value={adminDetails.currentPassword}
                                onChange={(e) => setAdminDetails({...adminDetails, currentPassword: e.target.value})}
                                placeholder="Enter current password to make changes"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>New Password</Form.Label>
                            <Form.Control 
                                type="password" 
                                value={adminDetails.newPassword}
                                onChange={(e) => setAdminDetails({...adminDetails, newPassword: e.target.value})}
                                placeholder="Enter new password (leave blank to keep current)"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Confirm New Password</Form.Label>
                            <Form.Control 
                                type="password" 
                                value={adminDetails.confirmPassword}
                                onChange={(e) => setAdminDetails({...adminDetails, confirmPassword: e.target.value})}
                                placeholder="Confirm new password"
                            />
                        </Form.Group>
                        {error && <Alert variant="danger">{error}</Alert>}
                        {success && <Alert variant="success">{success}</Alert>}
                        <div className="d-flex justify-content-end">
                            <Button variant="secondary" onClick={() => setShowProfileModal(false)} className="me-2">
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit">
                                Save Changes
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Country Modal */}
            <Modal show={showCountryModal} onHide={() => {
                setShowCountryModal(false);
                setCountryForm({
                    name: "",
                    code: "",
                    currency: "INR",
                    currencySymbol: "₹"
                });
            }}>
                <Modal.Header closeButton>
                    <Modal.Title>{countryForm._id ? "Edit" : "Add"} Country</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleCountrySubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Country Name *</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={countryForm.name}
                                onChange={(e) => setCountryForm({...countryForm, name: e.target.value})}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Country Code *</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={countryForm.code}
                                onChange={(e) => setCountryForm({...countryForm, code: e.target.value})}
                                required
                                maxLength={3}
                            />
                            <Form.Text className="text-muted">
                                2-3 character country code (e.g., "IN" for India)
                            </Form.Text>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Currency *</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={countryForm.currency}
                                onChange={(e) => setCountryForm({...countryForm, currency: e.target.value})}
                                required
                            />
                            <Form.Text className="text-muted">
                                Currency name (e.g., "Indian Rupee")
                            </Form.Text>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Currency Symbol *</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={countryForm.currencySymbol}
                                onChange={(e) => setCountryForm({...countryForm, currencySymbol: e.target.value})}
                                required
                                maxLength={3}
                            />
                            <Form.Text className="text-muted">
                                Currency symbol (e.g., "₹")
                            </Form.Text>
                        </Form.Group>
                        {error && <Alert variant="danger">{error}</Alert>}
                        {success && <Alert variant="success">{success}</Alert>}
                        <div className="d-flex justify-content-end">
                            <Button variant="secondary" onClick={() => {
                                setShowCountryModal(false);
                                setCountryForm({
                                    name: "",
                                    code: "",
                                    currency: "INR",
                                    currencySymbol: "₹"
                                });
                            }} className="me-2">
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit">
                                {countryForm._id ? "Update" : "Save"} Country
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* State Modal */}
            <Modal show={showStateModal} onHide={() => {
                setShowStateModal(false);
                setStateForm({
                    name: "",
                    code: "",
                    country: ""
                });
            }}>
                <Modal.Header closeButton>
                    <Modal.Title>{stateForm._id ? "Edit" : "Add"} State</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleStateSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>State Name *</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={stateForm.name}
                                onChange={(e) => setStateForm({...stateForm, name: e.target.value})}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>State Code *</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={stateForm.code}
                                onChange={(e) => setStateForm({...stateForm, code: e.target.value})}
                                required
                                maxLength={3}
                            />
                            <Form.Text className="text-muted">
                                2-3 character state code
                            </Form.Text>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Country *</Form.Label>
                            <Form.Select
                                value={stateForm.country}
                                onChange={(e) => setStateForm({...stateForm, country: e.target.value})}
                                required
                            >
                                <option value="">Select Country</option>
                                {countries.map(country => (
                                    <option key={country._id} value={country._id}>                                    {country.name} ({country.code})
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        {error && <Alert variant="danger">{error}</Alert>}
                        {success && <Alert variant="success">{success}</Alert>}
                        <div className="d-flex justify-content-end">
                            <Button variant="secondary" onClick={() => {
                                setShowStateModal(false);
                                setStateForm({
                                    name: "",
                                    code: "",
                                    country: ""
                                });
                            }} className="me-2">
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit">
                                {stateForm._id ? "Update" : "Save"} State
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Volunteer Modal */}
            <Modal show={showVolunteerModal} onHide={() => {
                setShowVolunteerModal(false);
                setVolunteerForm({
                    name: "",
                    email: "",
                    number: "",
                    city: "",
                    country: "",
                    state: "",
                    message: ""
                });
            }}>
                <Modal.Header closeButton>
                    <Modal.Title>{volunteerForm._id ? "Edit" : "Add"} Volunteer</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleVolunteerSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Name *</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={volunteerForm.name}
                                onChange={(e) => setVolunteerForm({...volunteerForm, name: e.target.value})}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email *</Form.Label>
                            <Form.Control 
                                type="email" 
                                value={volunteerForm.email}
                                onChange={(e) => setVolunteerForm({...volunteerForm, email: e.target.value})}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Phone Number *</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={volunteerForm.number}
                                onChange={(e) => setVolunteerForm({...volunteerForm, number: e.target.value})}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>City</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={volunteerForm.city}
                                onChange={(e) => setVolunteerForm({...volunteerForm, city: e.target.value})}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Country</Form.Label>
                            <Form.Select
                                value={volunteerForm.country}
                                onChange={(e) => setVolunteerForm({...volunteerForm, country: e.target.value})}
                            >
                                <option value="">Select Country</option>
                                {countries.map(country => (
                                    <option key={country._id} value={country._id}>
                                        {country.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>State</Form.Label>
                            <Form.Select
                                value={volunteerForm.state}
                                onChange={(e) => setVolunteerForm({...volunteerForm, state: e.target.value})}
                                disabled={!volunteerForm.country}
                            >
                                <option value="">Select State</option>
                                {states
                                    .filter(state => state.country === volunteerForm.country || state.country._id === volunteerForm.country)
                                    .map(state => (
                                        <option key={state._id} value={state._id}>
                                            {state.name}
                                        </option>
                                    ))
                                }
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Message</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={3}
                                value={volunteerForm.message}
                                onChange={(e) => setVolunteerForm({...volunteerForm, message: e.target.value})}
                            />
                        </Form.Group>
                        {error && <Alert variant="danger">{error}</Alert>}
                        {success && <Alert variant="success">{success}</Alert>}
                        <div className="d-flex justify-content-end">
                            <Button variant="secondary" onClick={() => {
                                setShowVolunteerModal(false);
                                setVolunteerForm({
                                    name: "",
                                    email: "",
                                    number: "",
                                    city: "",
                                    country: "",
                                    state: "",
                                    message: ""
                                });
                            }} className="me-2">
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit">
                                {volunteerForm._id ? "Update" : "Save"} Volunteer
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Program Modal */}
            <Modal show={showProgramModal} onHide={() => setShowProgramModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{programForm._id ? "Edit" : "Add"} Program</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleProgramSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Title *</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={programForm.title}
                                onChange={(e) => setProgramForm({...programForm, title: e.target.value})}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description *</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={3}
                                value={programForm.description}
                                onChange={(e) => setProgramForm({...programForm, description: e.target.value})}
                                required
                            />
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Date</Form.Label>
                                    <Form.Control 
                                        type="date" 
                                        value={programForm.date}
                                        onChange={(e) => setProgramForm({...programForm, date: e.target.value})}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Program Image</Form.Label>
                            <div className="d-flex align-items-center mb-3">
                                {programForm.imagePreview ? (
                                    <img 
                                        src={programForm.imagePreview} 
                                        alt="Preview" 
                                        className="img-thumbnail me-3"
                                        style={{ maxHeight: '150px' }}
                                    />
                                ) : programForm.existingImage ? (
                                    <img 
                                        src={programForm.existingImage} 
                                        alt="Current" 
                                        className="img-thumbnail me-3"
                                        style={{ maxHeight: '150px' }}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/placeholder.jpg';
                                        }}
                                    />
                                ) : (
                                    <div className="text-muted me-3" style={{ width: '150px', height: '150px', border: '1px dashed #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        No image selected
                                    </div>
                                )}
                            </div>
                            <div className="d-flex">
                                <Form.Control 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleProgramImageChange}
                                    className="me-2"
                                />
                                {programForm.existingImage && (
                                    <Button 
                                        variant="outline-danger" 
                                        onClick={() => {
                                            setProgramForm(prev => ({
                                                ...prev,
                                                image: null,
                                                imagePreview: "",
                                                existingImage: ""
                                            }));
                                        }}
                                    >
                                        Remove
                                    </Button>
                                )}
                            </div>
                            <Form.Text className="text-muted">
                                Recommended size: 1200x630 pixels (max 5MB)
                            </Form.Text>
                        </Form.Group>
                        {error && <Alert variant="danger">{error}</Alert>}
                        {success && <Alert variant="success">{success}</Alert>}
                        <div className="d-flex justify-content-end">
                            <Button variant="secondary" onClick={() => setShowProgramModal(false)} className="me-2">
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit">
                                {programForm._id ? "Update" : "Save"} Program
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Details View Modal */}
            <Modal show={!!selectedItem} onHide={() => setSelectedItem(null)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{selectedItem?.type?.toUpperCase()} DETAILS</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedItem && (
                        <div className="details-container">
                            {selectedItem.type === "volunteer" && (
                                <>
                                    <div className="detail-item">
                                        <div className="detail-label">Name:</div>
                                        <div className="detail-value">{selectedItem.name || <span className="empty">N/A</span>}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Email:</div>
                                        <div className="detail-value">{selectedItem.email || <span className="empty">N/A</span>}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Phone:</div>
                                        <div className="detail-value">{selectedItem.number || <span className="empty">N/A</span>}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Country:</div>
                                        <div className="detail-value">{selectedItem.country || <span className="empty">N/A</span>}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">State:</div>
                                        <div className="detail-value">{selectedItem.state || <span className="empty">N/A</span>}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">City:</div>
                                        <div className="detail-value">{selectedItem.city || <span className="empty">N/A</span>}</div>
                                    </div>
                                    {selectedItem.message && (
                                        <div className="detail-item">
                                            <div className="detail-label">Message:</div>
                                            <div className="detail-value" style={{ whiteSpace: 'pre-wrap' }}>
                                                {selectedItem.message}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                            {selectedItem.type === "donor" && (
                                <>
                                    <div className="detail-item">
                                        <div className="detail-label">Name:</div>
                                        <div className="detail-value">{selectedItem.name || <span className="empty">N/A</span>}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Email:</div>
                                        <div className="detail-value">{selectedItem.email || <span className="empty">N/A</span>}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Amount:</div>
                                        <div className="detail-value">₹{selectedItem.amount || <span className="empty">N/A</span>}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Country:</div>
                                        <div className="detail-value">{selectedItem.country || <span className="empty">N/A</span>}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Message:</div>
                                        <div className="detail-value">{selectedItem.message || <span className="empty">N/A</span>}</div>
                                    </div>
                                </>
                            )}
                            {selectedItem.type === "message" && (
                                <>
                                    <div className="detail-item">
                                        <div className="detail-label">Name:</div>
                                        <div className="detail-value">{selectedItem.name || <span className="empty">N/A</span>}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Email:</div>
                                        <div className="detail-value">{selectedItem.email || <span className="empty">N/A</span>}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Country:</div>
                                        <div className="detail-value">{selectedItem.country || <span className="empty">N/A</span>}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Subject:</div>
                                        <div className="detail-value">{selectedItem.subject || <span className="empty">N/A</span>}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Message:</div>
                                        <div className="detail-value" style={{ whiteSpace: 'pre-wrap' }}>
                                            {selectedItem.message}
                                        </div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Date:</div>
                                        <div className="detail-value">
                                            {selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleString() : <span className="empty">N/A</span>}
                                        </div>
                                    </div>
                                </>
                            )}
                            {selectedItem.type === "program" && (
                                <>
                                    <div className="detail-item">
                                        <div className="detail-label">Title:</div>
                                        <div className="detail-value">
                                            {selectedItem.title || <span className="empty">N/A</span>}
                                        </div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Description:</div>
                                        <div 
                                            className="detail-value" 
                                            style={{ 
                                                whiteSpace: 'pre-wrap',
                                                maxHeight: '200px',
                                                overflowY: 'auto',
                                                padding: '8px',
                                                backgroundColor: '#f8f9fa',
                                                borderRadius: '4px'
                                            }}
                                        >
                                            {selectedItem.description || <span className="empty">N/A</span>}
                                        </div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Date:</div>
                                        <div className="detail-value">
                                            {selectedItem.date ? new Date(selectedItem.date).toLocaleDateString() : <span className="empty">N/A</span>}
                                        </div>
                                    </div>
                                    {selectedItem.image ? (
                                        <div className="detail-item">
                                            <div className="detail-label">Image:</div>
                                            <div className="detail-value">
                                                <div className="image-container" style={{
                                                    position: 'relative',
                                                    paddingTop: '56.25%',
                                                    backgroundColor: '#f8f9fa',
                                                    borderRadius: '4px',
                                                    overflow: 'hidden'
                                                }}>
                                                    <img 
                                                        src={selectedItem.image}
                                                        alt={selectedItem.title || "Program"} 
                                                        className="img-fluid"
                                                        style={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover'
                                                        }}
                                                        loading="lazy"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = '/placeholder.jpg';
                                                        }}
                                                    />
                                                </div>
                                                <div className="mt-2 text-center">
                                                    <Button 
                                                        variant="link" 
                                                        size="sm"
                                                        onClick={() => window.open(selectedItem.image, '_blank')}
                                                    >
                                                        View Full Image
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="detail-item">
                                            <div className="detail-label">Image:</div>
                                            <div className="detail-value">
                                                <span className="empty">No image available</span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                            {selectedItem.type === "pledge" && (
                                <>
                                    <div className="detail-item">
                                        <div className="detail-label">Name:</div>
                                        <div className="detail-value">{selectedItem.name || <span className="empty">N/A</span>}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Email:</div>
                                        <div className="detail-value">{selectedItem.email || <span className="empty">N/A</span>}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Country:</div>
                                        <div className="detail-value">{selectedItem.country || <span className="empty">N/A</span>}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">City:</div>
                                        <div className="detail-value">{selectedItem.city || <span className="empty">N/A</span>}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Pledges:</div>
                                        <div className="detail-value">
                                            <ul className="list-unstyled">
                                                {Array.isArray(selectedItem.pledges) ? (
                                                    selectedItem.pledges.map((p, i) => (
                                                        <li key={i}>• {p}</li>
                                                    ))
                                                ) : (
                                                    <li>• {selectedItem.pledges || <span className="empty">N/A</span>}</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Date:</div>
                                        <div className="detail-value">
                                            {selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleString() : <span className="empty">N/A</span>}
                                        </div>
                                    </div>
                                </>
                            )}
                            {selectedItem.type === "country" && (
                                <>
                                    <div className="detail-item">
                                        <div className="detail-label">Name:</div>
                                        <div className="detail-value">{selectedItem.name || <span className="empty">N/A</span>}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Code:</div>
                                        <div className="detail-value">{selectedItem.code || <span className="empty">N/A</span>}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Currency:</div>
                                        <div className="detail-value">{selectedItem.currency || <span className="empty">N/A</span>}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Currency Symbol:</div>
                                        <div className="detail-value">{selectedItem.currencySymbol || <span className="empty">N/A</span>}</div>
                                    </div>
                                </>
                            )}
                            {selectedItem.type === "state" && (
                                <>
                                    <div className="detail-item">
                                        <div className="detail-label">Name:</div>
                                        <div className="detail-value">{selectedItem.name || <span className="empty">N/A</span>}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Code:</div>
                                        <div className="detail-value">{selectedItem.code || <span className="empty">N/A</span>}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Country:</div>
                                        <div className="detail-value">
                                            {selectedItem.country?.name || selectedItem.country || <span className="empty">N/A</span>}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setSelectedItem(null)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminPanel;