import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AddProgram.css";

function AddProgram() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null
  });
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setMessage({ text: "Only JPG, PNG, or GIF images are allowed", type: "error" });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ text: "Image size must be less than 5MB", type: "error" });
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
      setMessage({ text: "", type: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    if (!formData.image) {
      setMessage({ text: "Please select an image", type: "error" });
      setIsLoading(false);
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("image", formData.image);

    try {
      await axios.post(
        "http://localhost:5000/api/admin/programs",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`
          }
        }
      );

      setMessage({ 
        text: "Program added successfully!", 
        type: "success" 
      });
      resetForm();
    } catch (error) {
      console.error("Error:", error);
      const errorMsg = error.response?.data?.message || 
                      error.message || 
                      "Failed to add program";
      setMessage({ text: errorMsg, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image: null
    });
    setPreview(null);
    const fileInput = document.getElementById("programImage");
    if (fileInput) fileInput.value = "";
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="add-program-page">
      <div className="add-program-container">
        <div className="header-section">
          <button onClick={handleBack} className="back-button">
            &larr; Back
          </button>
          <h2>Add New Program</h2>
        </div>
        
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter program title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="5"
              placeholder="Enter program description"
            />
          </div>

          <div className="form-group">
            <label htmlFor="programImage">Program Image</label>
            <input
              id="programImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
            {preview && (
              <div className="image-preview">
                <img src={preview} alt="Preview" />
              </div>
            )}
          </div>

          <div className="button-group">
            <button type="button" onClick={handleBack} className="secondary-button">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="primary-button">
              {isLoading ? (
                <>
                  <span className="spinner"></span> Adding...
                </>
              ) : (
                "Add Program"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProgram;