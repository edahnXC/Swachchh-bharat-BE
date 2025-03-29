import React, { useState } from "react";
import axios from "axios";
import "./AddProgram.css";

function AddProgram() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file)); // Live preview
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      setMessage("⚠️ Please select an image!");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("image", image);

    try {
        await axios.post(  // Removed 'const res ='
            "http://localhost:5000/api/admin/add-program",
            formData,
            { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${localStorage.getItem("adminToken")}` } }
        );

        setMessage("✅ Program added successfully!");
        setTitle("");
        setDescription("");
        setImage(null);
        setPreview(null);
        document.getElementById("fileInput").value = "";
    } catch (error) {
        console.error(error);
        setMessage("❌ Error adding program");
    }
};

  return (
    <div className="add-program-container">
      <h2 className="heading">Add a New Program</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit} className="add-program-form">
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            placeholder="Enter Program Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="input-field"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            placeholder="Provide a brief description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="input-field"
          />
        </div>

        <div className="form-group">
          <label>Upload Image</label>
          <input
            type="file"
            accept="image/*"
            id="fileInput"
            onChange={handleImageChange}
            required
            className="file-input"
          />
          {preview && <img src={preview} alt="Preview" className="image-preview" />}
        </div>

        <button type="submit" className="submit-btn">➕ Add Programme</button>
      </form>
    </div>
  );
}

export default AddProgram;
