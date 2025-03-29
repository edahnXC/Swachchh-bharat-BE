import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Row, Col, Card, Table, Button, 
  Nav, Navbar, Dropdown
} from "react-bootstrap";
import { 
  FaUsers, FaDonate, FaEnvelope, FaHome, 
  FaHandHoldingHeart, FaRupeeSign,
  FaUserCircle, FaBars, FaTimes,
  FaTrash, FaPlus, FaChartLine,
  FaCalendarAlt
} from "react-icons/fa";
import "./adminpanel.css";

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [volunteers, setVolunteers] = useState([]);
    const [donors, setDonors] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [pledges, setPledges] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
            navigate("/admin/login");
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const headers = { Authorization: `Bearer ${token}` };
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
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const goToHomepage = () => navigate("/");
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const handleCardClick = (tab) => {
        setActiveTab(tab);
    };

    const handleAddNew = () => {
        switch(activeTab) {
            case "programs":
                navigate("/admin/add-program");
                break;
            case "contacts":
                navigate("/Contact");
                break;
            case "pledges":
                navigate("/Pledge");
                break;
            case "volunteers":
                navigate("/Volunteer-Form");
                break;
            case "donors":
                break;
            default:
                // For other tabs, we'll keep the existing modal
                break;
        }
    };

    const handleDelete = async (id, type) => {
        const token = localStorage.getItem("adminToken");
        if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
        
        try {
            // For pledges, we need to use a different endpoint if the API requires it
            const endpoint = type === "pledges" ? 
                `http://localhost:5000/api/pledges/${id}` :
                `http://localhost:5000/api/admin/${type}/${id}`;
            
            await axios.delete(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Update the appropriate state based on the type
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
            
            alert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);
        } catch (error) {
            console.error(`Error deleting ${type}:`, error.response?.data || error.message);
            alert(`Failed to delete ${type}. Please try again.`);
        }
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
                            onClick={() => setActiveTab(tab)}
                        >
                            <span className="nav-icon">{icon}</span>
                            {sidebarOpen && <span className="nav-label">{label}</span>}
                        </Nav.Link>
                    ))}
                </Nav>
                <div className="sidebar-footer">
                    <Button 
                        variant="link" 
                        className="logout-btn"
                        onClick={() => {
                            localStorage.removeItem("adminToken");
                            navigate("/admin/login");
                        }}
                    >
                        <FaUserCircle /> {sidebarOpen && "Logout"}
                    </Button>
                </div>
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
                                <FaUserCircle /> Admin
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item>Profile</Dropdown.Item>
                                <Dropdown.Item>Settings</Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={() => {
                                    localStorage.removeItem("adminToken");
                                    navigate("/admin/login");
                                }}>
                                    Logout
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </Navbar>

                {/* Content Area */}
                <div className="admin-content">
                    {loading && (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    )}

                    {/* Dashboard */}
                    {!loading && activeTab === "dashboard" && (
                        <div className="dashboard-content">
                            <Row className="stats-row">
                                <Col md={4} lg={2}>
                                    <Card 
                                        className="stat-card"
                                        onClick={() => handleCardClick("volunteers")}
                                    >
                                        <Card.Body>
                                            <div className="stat-icon bg-primary">
                                                <FaUsers />
                                            </div>
                                            <div className="stat-info">
                                                <h3>{volunteers.length}</h3>
                                                <p>Volunteers</p>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={4} lg={2}>
                                    <Card 
                                        className="stat-card"
                                        onClick={() => handleCardClick("donors")}
                                    >
                                        <Card.Body>
                                            <div className="stat-icon bg-success">
                                                <FaDonate />
                                            </div>
                                            <div className="stat-info">
                                                <h3>{donors.length}</h3>
                                                <p>Donors</p>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={4} lg={2}>
                                    <Card 
                                        className="stat-card"
                                        onClick={() => handleCardClick("contacts")}
                                    >
                                        <Card.Body>
                                            <div className="stat-icon bg-info">
                                                <FaEnvelope />
                                            </div>
                                            <div className="stat-info">
                                                <h3>{contacts.length}</h3>
                                                <p>Messages</p>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={4} lg={2}>
                                    <Card 
                                        className="stat-card"
                                        onClick={() => handleCardClick("programs")}
                                    >
                                        <Card.Body>
                                            <div className="stat-icon bg-warning">
                                                <FaCalendarAlt />
                                            </div>
                                            <div className="stat-info">
                                                <h3>{programs.length}</h3>
                                                <p>Programs</p>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={4} lg={2}>
                                    <Card 
                                        className="stat-card"
                                        onClick={() => handleCardClick("pledges")}
                                    >
                                        <Card.Body>
                                            <div className="stat-icon bg-danger">
                                                <FaHandHoldingHeart />
                                            </div>
                                            <div className="stat-info">
                                                <h3>{pledges.length}</h3>
                                                <p>Pledges</p>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
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

                            {/* Recent Activity Section */}
                            <Card className="mt-4">
                                <Card.Header>
                                    <h5>Recent Activities</h5>
                                </Card.Header>
                                <Card.Body>
                                    <Table striped hover responsive>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Activity</th>
                                                <th>User</th>
                                                <th>Date</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                {/* Sample data can be added here */}
                                            </tr>
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </div>
                    )}

                    {/* Volunteers List */}
                    {!loading && activeTab === "volunteers" && (
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
                                        {volunteers.map((volunteer, index) => (
                                            <tr key={volunteer._id}>
                                                <td>{index + 1}</td>
                                                <td>{volunteer.name}</td>
                                                <td>{volunteer.email}</td>
                                                <td>{volunteer.state}</td>
                                                <td>{volunteer.city}</td>
                                                <td>{volunteer.number}</td>
                                                <td>
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
                            </Card.Body>
                        </Card>
                    )}

                    {/* Donors List */}
                    {!loading && activeTab === "donors" && (
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
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {donors.map((donor, index) => (
                                            <tr key={donor._id}>
                                                <td>{index + 1}</td>
                                                <td>{donor.name}</td>
                                                <td>{donor.email}</td>
                                                <td>
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
                            </Card.Body>
                        </Card>
                    )}

                    {/* Contacts List */}
                    {!loading && activeTab === "contacts" && (
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
                                        {contacts.map((contact, index) => (
                                            <tr key={contact._id}>
                                                <td>{index + 1}</td>
                                                <td>{contact.name}</td>
                                                <td>{contact.email}</td>
                                                <td>{contact.message}</td>
                                                <td>
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
                            </Card.Body>
                        </Card>
                    )}

                    {/* Programs List */}
                    {!loading && activeTab === "programs" && (
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
                                        {programs.map((program, index) => (
                                            <tr key={program._id}>
                                                <td>{index + 1}</td>
                                                <td>{program.title}</td>
                                                <td>{program.description}</td>
                                                <td>
                                                    <img 
                                                        src={program.imageUrl} 
                                                        alt={program.title} 
                                                        width="100" 
                                                        className="img-thumbnail"
                                                    />
                                                </td>
                                                <td>
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
                            </Card.Body>
                        </Card>
                    )}

                    {/* Pledges List */}
                    {!loading && activeTab === "pledges" && (
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
                                        {pledges.map((pledge, index) => (
                                            <tr key={pledge._id}>
                                                <td>{index + 1}</td>
                                                <td>{pledge.name}</td>
                                                <td>{pledge.email}</td>
                                                <td>{pledge.city}</td>
                                                <td>
                                                    <ul className="list-unstyled">
                                                        {Array.isArray(pledge.pledges) ? (
                                                            pledge.pledges.map((p, i) => (
                                                                <li key={i}>• {p}</li>
                                                            ))
                                                        ) : (
                                                            <li>• {pledge.pledges}</li>
                                                        )}
                                                    </ul>
                                                </td>
                                                <td>
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
                            </Card.Body>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;