import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./Programmes.css";

function Programmes() {
    const [programs, setPrograms] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [programsPerPage] = useState(6);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                setLoading(true);
                const response = await axios.get("http://localhost:5000/api/admin/programs", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
                });
                
                if (response.data.success) {
                    setPrograms(response.data.data);
                    setTotalPages(Math.ceil(response.data.data.length / programsPerPage));
                    setError(null);
                }
            } catch (err) {
                console.error("Error fetching programs:", err);
                setError("Failed to load programs. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchPrograms();
    }, [programsPerPage]);

    // Get current programs for pagination
    const indexOfLastProgram = currentPage * programsPerPage;
    const indexOfFirstProgram = indexOfLastProgram - programsPerPage;
    const currentPrograms = programs.slice(indexOfFirstProgram, indexOfLastProgram);

    const handleImageClick = (index) => {
        const absoluteIndex = indexOfFirstProgram + index;
        setSelectedIndex(absoluteIndex);
    };

    const handleCloseModal = () => {
        setSelectedIndex(null);
    };

    const handleKeyDown = useCallback((event) => {
        if (selectedIndex !== null) {
            if (event.key === "ArrowRight") {
                setSelectedIndex((prevIndex) => (prevIndex < programs.length - 1 ? prevIndex + 1 : prevIndex));
            } else if (event.key === "ArrowLeft") {
                setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
            } else if (event.key === "Escape") {
                handleCloseModal();
            }
        }
    }, [selectedIndex, programs.length]);

    useEffect(() => {
        if (selectedIndex !== null) {
            window.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [selectedIndex, handleKeyDown]);

    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;
        
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            const leftBound = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
            const rightBound = Math.min(totalPages, leftBound + maxVisiblePages - 1);
            
            if (leftBound > 1) {
                pageNumbers.push(1);
                if (leftBound > 2) pageNumbers.push('...');
            }
            
            for (let i = leftBound; i <= rightBound; i++) {
                pageNumbers.push(i);
            }
            
            if (rightBound < totalPages) {
                if (rightBound < totalPages - 1) pageNumbers.push('...');
                pageNumbers.push(totalPages);
            }
        }
        
        return pageNumbers;
    };

    return (
        <div className="program-container">
            <h2 className="heading">📅 Programs</h2>
            
            {loading ? (
                <div className="loading-spinner"></div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : (
                <>
                    <div className="program-list">
                        {currentPrograms.length > 0 ? (
                            currentPrograms.map((program, index) => (
                                <div key={program._id} className="program-card">
                                    <img 
                                        src={program.image || "https://via.placeholder.com/400x250?text=No+Image"} 
                                        alt={program.title} 
                                        className="program-image"
                                        onClick={() => handleImageClick(index)}
                                    />
                                    <div className="program-info">
                                        <h3>{program.title}</h3>
                                        <div className="program-date">{new Date(program.date).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-programs">No programs available.</p>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination-container">
                            <button 
                                className="pagination-button"
                                onClick={() => paginate(1)}
                                disabled={currentPage === 1}
                            >
                                &laquo;
                            </button>
                            <button 
                                className="pagination-button"
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                &lsaquo;
                            </button>
                            
                            <div className="page-numbers">
                                {getPageNumbers().map((number, index) => (
                                    number === '...' ? (
                                        <span key={index} className="ellipsis">...</span>
                                    ) : (
                                        <button
                                            key={index}
                                            className={`page-number ${currentPage === number ? 'active' : ''}`}
                                            onClick={() => paginate(number)}
                                        >
                                            {number}
                                        </button>
                                    )
                                ))}
                            </div>
                            
                            <button 
                                className="pagination-button"
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                &rsaquo;
                            </button>
                            <button 
                                className="pagination-button"
                                onClick={() => paginate(totalPages)}
                                disabled={currentPage === totalPages}
                            >
                                &raquo;
                            </button>
                        </div>
                    )}
                </>
            )}

            {selectedIndex !== null && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <span className="close-btn" onClick={handleCloseModal}>&times;</span>

                        {selectedIndex > 0 && (
                            <span className="arrow left" onClick={(e) => {
                                e.stopPropagation();
                                setSelectedIndex(selectedIndex - 1);
                            }}>&#10094;</span>
                        )}
                        
                        <img 
                            src={programs[selectedIndex].image} 
                            alt={programs[selectedIndex].title} 
                            className="modal-image" 
                        />
                        <div className="modal-info">
                            <h2>{programs[selectedIndex].title}</h2>
                            <p className="modal-description">{programs[selectedIndex].description}</p>
                            <p className="modal-date">{new Date(programs[selectedIndex].date).toLocaleDateString()}</p>
                        </div>
                        
                        {selectedIndex < programs.length - 1 && (
                            <span className="arrow right" onClick={(e) => {
                                e.stopPropagation();
                                setSelectedIndex(selectedIndex + 1);
                            }}>&#10095;</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Programmes;