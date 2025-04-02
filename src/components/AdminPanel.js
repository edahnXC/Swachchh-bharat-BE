import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { 
  Row, Col, Card, Table, Button, 
  Nav, Navbar, Dropdown, Modal, Form,
  Pagination, Alert
} from "react-bootstrap";
import { 
  FaUsers, FaDonate, FaEnvelope, FaHome, 
  FaHandHoldingHeart, FaRupeeSign,
  FaUserCircle, FaBars, FaTimes,
  FaTrash, FaPlus, FaChartLine,
  FaCalendarAlt, FaEye
} from "react-icons/fa";
import "./adminpanel.css";

const AdminPanel = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [volunteers, setVolunteers] = useState([]);
    const [donors, setDonors] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [pledges, setPledges] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [adminDetails, setAdminDetails] = useState({
        username: "",
        email: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const navItems = [
        { tab: "dashboard", icon: <FaHome />, label: "Dashboard" },
        { tab: "volunteers", icon: <FaUsers />, label: "Volunteers" },
        { tab: "donors", icon: <FaDonate />, label: "Donors" },
        { tab: "contacts", icon: <FaEnvelope />, label: "Messages" },
        { tab: "programs", icon: <FaCalendarAlt />, label: "Programs" },
        { tab: "pledges", icon: <FaHandHoldingHeart />, label: "Pledges" },
        { tab: "reports", icon: <FaChartLine />, label: "Reports" }
    ];

    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        if (!token) {
            navigate("/admin");
            return;
        }

        // Set active tab based on current route
        const path = location.pathname;
        if (path.includes("volunteers")) setActiveTab("volunteers");
        else if (path.includes("donors")) setActiveTab("donors");
        else if (path.includes("contacts")) setActiveTab("contacts");
        else if (path.includes("programs")) setActiveTab("programs");
        else if (path.includes("pledges")) setActiveTab("pledges");
        else if (path.includes("reports")) setActiveTab("reports");
        else setActiveTab("dashboard");

        const fetchData = async () => {
            setLoading(true);
            try {
                const headers = { Authorization: `Bearer ${token}` };
                
                // Fetch admin profile first
                const adminResponse = await axios.get("http://localhost:5000/api/admin/profile", { headers });
                if (adminResponse.data.success) {
                    setAdminDetails(prev => ({
                        ...prev,
                        username: adminResponse.data.admin.username,
                        email: adminResponse.data.admin.email
                    }));
                }

                // Fetch other data
                const responses = await Promise.all([
                    axios.get("http://localhost:5000/api/admin/volunteers", { headers }),
                    axios.get("http://localhost:5000/api/admin/donors", { headers }),
                    axios.get("http://localhost:5000/api/admin/contacts", { headers }),
                    axios.get("http://localhost:5000/api/admin/programs", { headers }),
                    axios.get("http://localhost:5000/api/admin/pledges", { headers })
                ]);

                setVolunteers(responses[0].data.data || []);
                setDonors(responses[1].data.data || []);
                setContacts(responses[2].data.data || []);
                setPrograms(responses[3].data.data || []);
                setPledges(responses[4].data?.data || responses[4].data || []);
            } catch (error) {
                console.error("Error fetching data:", error.response?.data || error.message);
                if (error.response?.status === 401) {
                    localStorage.removeItem("adminToken");
                    navigate("/admin");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate, location]);

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentVolunteers = volunteers.slice(indexOfFirstItem, indexOfLastItem);
    const currentDonors = donors.slice(indexOfFirstItem, indexOfLastItem);
    const currentContacts = contacts.slice(indexOfFirstItem, indexOfLastItem);
    const currentPrograms = programs.slice(indexOfFirstItem, indexOfLastItem);
    const currentPledges = pledges.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const goToHomepage = () => navigate("/");
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1);
        navigate(`/admin/panel/${tab}`);
    };

    const handleAddNew = () => {
        switch(activeTab) {
            case "programs":
                navigate("/admin/add-program");
                break;
            case "contacts":
                navigate("/contact");
                break;
            case "pledges":
                navigate("/pledge");
                break;
            case "volunteers":
                navigate("/volunteer-form");
                break;
            default:
                break;
        }
    };

    const handleDelete = async (id, type) => {
        const token = localStorage.getItem("adminToken");
        if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
        
        try {
            const endpoint = type === "pledges" ? 
                `http://localhost:5000/api/pledges/${id}` :
                `http://localhost:5000/api/admin/${type}/${id}`;
            
            await axios.delete(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            switch(type) {
                case 'volunteers':
                    setVolunteers(prev => prev.filter(item => item._id !== id));
                    break;
                case 'donors':
                    setDonors(prev => prev.filter(item => item._id !== id));
                    break;
                case 'contacts':
                    setContacts(prev => prev.filter(item => item._id !== id));
                    break;
                case 'programs':
                    setPrograms(prev => prev.filter(item => item._id !== id));
                    break;
                case 'pledges':
                    setPledges(prev => prev.filter(item => item._id !== id));
                    break;
                default:
                    break;
            }
            
            setSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);
            setTimeout(() => setSuccess(""), 3000);
        } catch (error) {
            console.error(`Error deleting ${type}:`, error.response?.data || error.message);
            setError(`Failed to delete ${type}. Please try again.`);
            setTimeout(() => setError(""), 3000);
        }
    };

    const viewDetails = (item, type) => {
        setSelectedItem({ ...item, type });
    };

    const handleAdminUpdate = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        
        // Validate passwords match if changing password
        if (adminDetails.newPassword && adminDetails.newPassword !== adminDetails.confirmPassword) {
            setError("New passwords don't match!");
            return;
        }

        try {
            const token = localStorage.getItem("adminToken");
            const response = await axios.put(
                "http://localhost:5000/api/admin/profile", 
                {
                    username: adminDetails.username,
                    email: adminDetails.email,
                    currentPassword: adminDetails.currentPassword,
                    newPassword: adminDetails.newPassword
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            if (response.data.success) {
                setSuccess("Profile updated successfully!");
                setTimeout(() => setSuccess(""), 3000);
                setShowProfileModal(false);
                // Clear password fields
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

    const getCountForTab = (tab) => {
        switch(tab) {
            case 'volunteers': return volunteers.length;
            case 'donors': return donors.length;
            case 'contacts': return contacts.length;
            case 'programs': return programs.length;
            case 'pledges': return pledges.length;
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
            default: return 'primary';
        }
    };

    const renderPagination = (items) => {
        const pageNumbers = [];
        for (let i = 1; i <= Math.ceil(items.length / itemsPerPage); i++) {
            pageNumbers.push(i);
        }

        if (pageNumbers.length <= 1) return null;

        return (
            <Pagination className="mt-3 justify-content-center">
                <Pagination.Prev 
                    onClick={() => setCurrentPage(prev => (prev > 1 ? prev - 1 : prev))} 
                    disabled={currentPage === 1}
                />
                {pageNumbers.map(number => (
                    <Pagination.Item
                        key={number}
                        active={number === currentPage}
                        onClick={() => paginate(number)}
                    >
                        {number}
                    </Pagination.Item>
                ))}
                <Pagination.Next 
                    onClick={() => setCurrentPage(prev => (prev < pageNumbers.length ? prev + 1 : prev))} 
                    disabled={currentPage === pageNumbers.length}
                />
            </Pagination>
        );
    };

    return (
        <div className={`admin-container ${sidebarOpen ? "" : "sidebar-collapsed"}`}>
            {/* Sidebar */}
            <div className="admin-sidebar">
                <div className="sidebar-header">
                    <h3>Swachh Bharat CMS</h3>
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
                                <Dropdown.Item onClick={() => setShowProfileModal(true)}>Profile</Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={() => {
                                    localStorage.removeItem("adminToken");
                                    navigate("/admin");
                                }}>
                                    Logout
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
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    )}

                    {!loading && (
                        <>
                            {/* Dashboard */}
                            {activeTab === "dashboard" && (
                                <div className="dashboard-content">
                                    <Row className="stats-row">
                                        {navItems.filter(item => item.tab !== "dashboard").map(({ tab, icon, label }) => (
                                            <Col md={4} lg={2} key={tab}>
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
                                        <Col md={4} lg={2}>
                                            <Card className="stat-card">
                                                <Card.Body>
                                                    <div className="stat-icon bg-secondary">
                                                        <FaRupeeSign />
                                                    </div>
                                                    <div className="stat-info">
                                                        <h3>₹ XYZ</h3>
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
                                        <Button variant="success" size="sm" onClick={handleAddNew}>
                                            <FaPlus /> Add New
                                        </Button>
                                    </Card.Header>
                                    <Card.Body>
                                        <Table striped hover responsive>
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Name</th>
                                                    <th>Email</th>
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
                                                        <td>{volunteer.name}</td>
                                                        <td>{volunteer.email}</td>
                                                        <td>{volunteer.state}</td>
                                                        <td>{volunteer.city}</td>
                                                        <td>{volunteer.number}</td>
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
                                    </Card.Body>
                                </Card>
                            )}

                            {/* Donors List */}
                            {activeTab === "donors" && (
                                <Card>
                                    <Card.Header className="d-flex justify-content-between align-items-center">
                                        <h5>Donors</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <Table striped hover responsive>
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>Amount</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentDonors.map((donor, index) => (
                                                    <tr key={donor._id}>
                                                        <td>{indexOfFirstItem + index + 1}</td>
                                                        <td>{donor.name}</td>
                                                        <td>{donor.email}</td>
                                                        <td>₹{donor.amount || 'N/A'}</td>
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
                                    </Card.Body>
                                </Card>
                            )}

                            {/* Contacts List */}
                            {activeTab === "contacts" && (
                                <Card>
                                    <Card.Header className="d-flex justify-content-between align-items-center">
                                        <h5>Messages</h5>
                                        <Button variant="success" size="sm" onClick={handleAddNew}>
                                            <FaPlus /> Add New
                                        </Button>
                                    </Card.Header>
                                    <Card.Body>
                                        <Table striped hover responsive>
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>Message</th>
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
                                    </Card.Body>
                                </Card>
                            )}

                            {/* Programs List */}
                            {activeTab === "programs" && (
                                <Card>
                                    <Card.Header className="d-flex justify-content-between align-items-center">
                                        <h5>Programs</h5>
                                        <Button variant="success" size="sm" onClick={handleAddNew}>
                                            <FaPlus /> Add New
                                        </Button>
                                    </Card.Header>
                                    <Card.Body>
                                        <Table striped hover responsive>
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Title</th>
                                                    <th>Description</th>
                                                    <th>Image</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentPrograms.map((program, index) => (
                                                    <tr key={program._id}>
                                                        <td>{indexOfFirstItem + index + 1}</td>
                                                        <td>{program.title}</td>
                                                        <td>{program.description.substring(0, 50)}...</td>
                                                        <td>
                                                            <img 
                                                                src={`http://localhost:5000/uploads/${program.image}`} 
                                                                alt={program.title} 
                                                                width="50" 
                                                                className="img-thumbnail"
                                                            />
                                                        </td>
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
                                    </Card.Body>
                                </Card>
                            )}

                            {/* Pledges List */}
                            {activeTab === "pledges" && (
                                <Card>
                                    <Card.Header className="d-flex justify-content-between align-items-center">
                                        <h5>Pledges</h5>
                                        <Button variant="success" size="sm" onClick={handleAddNew}>
                                            <FaPlus /> Add New
                                        </Button>
                                    </Card.Header>
                                    <Card.Body>
                                        <Table striped hover responsive>
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>City</th>
                                                    <th>Pledges</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentPledges.map((pledge, index) => (
                                                    <tr key={pledge._id}>
                                                        <td>{indexOfFirstItem + index + 1}</td>
                                                        <td>{pledge.name}</td>
                                                        <td>{pledge.email}</td>
                                                        <td>{pledge.city}</td>
                                                        <td>
                                                            <ul className="list-unstyled">
                                                                {Array.isArray(pledge.pledges) ? (
                                                                    pledge.pledges.slice(0, 2).map((p, i) => (
                                                                        <li key={i}>• {p}</li>
                                                                    ))
                                                                ) : (
                                                                    <li>• {pledge.pledges.substring(0, 30)}...</li>
                                                                )}
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
                <Modal.Footer className="justify-content-center">
                    <small className="text-muted">Copyright © {new Date().getFullYear()} SwachhBharat. All rights reserved.</small>
                </Modal.Footer>
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
                                        <div className="detail-label">City:</div>
                                        <div className="detail-value">{selectedItem.city || <span className="empty">N/A</span>}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">State:</div>
                                        <div className="detail-value">{selectedItem.state || <span className="empty">N/A</span>}</div>
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
                                        <div className="detail-value">{selectedItem.title || <span className="empty">N/A</span>}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Description:</div>
                                        <div className="detail-value" style={{ whiteSpace: 'pre-wrap' }}>
                                            {selectedItem.description || <span className="empty">N/A</span>}
                                        </div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Date:</div>
                                        <div className="detail-value">{selectedItem.date || <span className="empty">N/A</span>}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Location:</div>
                                        <div className="detail-value">{selectedItem.location || <span className="empty">N/A</span>}</div>
                                    </div>
                                    {selectedItem.image && (
                                        <div className="detail-item">
                                            <div className="detail-label">Image:</div>
                                            <div className="detail-value">
                                                <img 
                                                    src={`http://localhost:5000/uploads/${selectedItem.image}`} 
                                                    alt={selectedItem.title || "Program"} 
                                                    className="img-fluid mt-2"
                                                    style={{ maxHeight: '200px' }}
                                                />
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