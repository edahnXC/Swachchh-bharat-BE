import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Container, 
  Card, 
  Form, 
  Button, 
  Alert, 
  Row, 
  Col,
  Spinner 
} from "react-bootstrap";
import { FaLock, FaUser, FaSignInAlt } from "react-icons/fa";

const AdminLogin = ({ setIsAdmin }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [validated, setValidated] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        
        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }

        setError("");
        setLoading(true);

        try {
            const response = await axios.post(
                "https://swachchh-bharat-be.onrender.com/api/admin/login", 
                { username, password },
                { withCredentials: true }
            );

            if (response.data.success) {
                localStorage.setItem("adminToken", response.data.token);
                setIsAdmin(true);
                navigate("/admin/panel/dashboard");
            } else {
                setError(response.data.message || "Login failed");
            }
        } catch (error) {
            console.error("Login error:", error);
            setError(error.response?.data?.message || 
                   error.message || 
                   "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
            <Row className="w-100">
                <Col md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="p-4">
                            <div className="text-center mb-4">
                                <h2 style={{color:'green'}}>SwachhBharat</h2>
                                <h3 className="mb-1">Admin Portal</h3>
                                <p className="text-muted">Sign in to access the dashboard</p>
                            </div>

                            {error && (
                                <Alert variant="danger" className="text-center">
                                    {error}
                                </Alert>
                            )}

                            <Form noValidate validated={validated} onSubmit={handleLogin}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Username</Form.Label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <FaUser />
                                        </span>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Please provide a username.
                                        </Form.Control.Feedback>
                                    </div>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label>Password</Form.Label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <FaLock />
                                        </span>
                                        <Form.Control
                                            type="password"
                                            placeholder="Enter password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Please provide a password.
                                        </Form.Control.Feedback>
                                    </div>
                                </Form.Group>

                                <div className="d-grid mb-3">
                                    <Button 
                                        variant="primary" 
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                    className="me-2"
                                                />
                                                Signing In...
                                            </>
                                        ) : (
                                            <>
                                                <FaSignInAlt className="me-2" />
                                                Sign In
                                            </>
                                        )}
                                    </Button>
                                </div>

                                
                            </Form>
                        </Card.Body>
                        <Card.Footer className="text-center py-3">
                            <small className="text-muted">© {new Date().getFullYear()} Swachh Bharat Mission </small>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminLogin;