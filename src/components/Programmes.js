import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./Programmes.css";

function Programmes() {
    const [programs, setPrograms] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(null);

    useEffect(() => {
        axios.get("http://localhost:5000/api/admin/programs", {
            headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
        })
        .then(response => {
            if (response.data.success) {
                setPrograms(response.data.data);
            }
        })
        .catch(error => {
            console.error("Error fetching programs:", error);
        });
    }, []);

    const handleImageClick = (index) => {
        setSelectedIndex(index);
    };

    const handleCloseModal = () => {
        setSelectedIndex(null);
    };

    // ✅ Use useCallback to memoize handleKeyDown
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
    }, [selectedIndex, handleKeyDown]); // ✅ Now handleKeyDown is stable

    return (
        <div className="program-container">
            <h2 className="heading">📅 Programs</h2>
            <div className="program-list">
                {programs.length > 0 ? (
                    programs.map((program, index) => (
                        <div key={program._id} className="program-card">
                            <img 
                                src={program.image || "https://via.placeholder.com/400x250?text=No+Image"} 
                                alt={program.title} 
                                className="program-image"
                                onClick={() => handleImageClick(index)}
                            />
                            <div className="program-info">
                                <h3>{program.title}</h3>
                                <p>{program.description}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="no-programs">No programs available.</p>
                )}
            </div>

            {selectedIndex !== null && (
    <div className="modal-overlay" onClick={handleCloseModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <span className="close-btn" onClick={handleCloseModal}>&times;</span>

            {/* Left Arrow */}
            {selectedIndex > 0 && (
                <span className="arrow left" onClick={() => setSelectedIndex(selectedIndex - 1)}>&#10094;</span>
            )}
            
            {/* Modal Image */}
            <img 
                src={programs[selectedIndex].image} 
                alt={programs[selectedIndex].title} 
                className="modal-image" 
            />
            <h2>{programs[selectedIndex].title}</h2>
            <p>{programs[selectedIndex].description}</p>
            
            {/* Right Arrow */}
            {selectedIndex < programs.length - 1 && (
                <span className="arrow right" onClick={() => setSelectedIndex(selectedIndex + 1)}>&#10095;</span>
            )}
        </div>
    </div>
)}

        </div>
    );
}

export default Programmes;
