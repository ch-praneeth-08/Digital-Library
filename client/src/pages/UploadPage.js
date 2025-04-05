// src/pages/UploadPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './FormStyles.css'; // Reuse form styles

// Use the same definitions as DashboardPage or import from a shared constants file
const materialTypes = [
    { value: 'research_paper', label: 'Research Paper' },
    { value: 'book', label: 'Book' },
    { value: 'course_material', label: 'Course Material' },
    { value: 'thesis', label: 'Thesis' },
];

// Ideally fetch from backend or use a shared constants file
const categories = [
    "Artificial Intelligence", "Computer Science", "Physics", "Quantum Physics", "Mathematics", "Engineering", "Other"
];


function UploadPage() {
    const [formData, setFormData] = useState({
        title: '',
        authors: '', // Input as comma-separated string
        publicationYear: '',
        materialType: '',
        keywords: '', // Input as comma-separated string
        category: '',
        description: ''
    });
    const [file, setFile] = useState(null); // State for the actual file object
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]); // Get the first file selected
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!file) {
            setError('Please select a file to upload.');
            return;
        }
        // Basic validation (add more as needed)
        if (!formData.title || !formData.materialType || !formData.category) {
            setError('Please fill in Title, Material Type, and Category.');
            return;
        }

        setLoading(true);

        // --- Use FormData to send file and metadata ---
        const data = new FormData();
        data.append('materialFile', file); // **IMPORTANT**: Backend expects the file under the name 'materialFile'
        data.append('title', formData.title);
        data.append('authors', formData.authors); // Send as string, backend's parseToArray handles it
        data.append('publicationYear', formData.publicationYear);
        data.append('materialType', formData.materialType);
        data.append('keywords', formData.keywords); // Send as string
        data.append('category', formData.category);
        data.append('description', formData.description);
        // Note: uploadedBy is handled by the backend using the auth token

        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
        // **CONFIRM UPLOAD ENDPOINT** - Should match backend route
        const uploadUrl = `${backendUrl}/api/materials/upload`;

        try {
            // **IMPORTANT**: When sending FormData with axios, it automatically sets the
            // 'Content-Type': 'multipart/form-data' header. Do NOT set it manually.
            // The Authorization header should still be set globally by AuthContext.
            const response = await axios.post(uploadUrl, data); // Send FormData object

            setSuccess(response.data?.message || 'Material uploaded successfully!');
            setLoading(false);
            // Optionally clear form
            setFormData({ title: '', authors: '', publicationYear: '', materialType: '', keywords: '', category: '', description: '' });
            setFile(null);
            document.getElementById('materialFile').value = null; // Clear file input visually

            // Optionally redirect after a delay
            setTimeout(() => {
                navigate('/dashboard'); // Redirect to dashboard after upload
            }, 1500);

        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Upload failed. Please try again.');
            console.error('Upload error:', err.response?.data || err.message || err);
        }
    };

    return (
        <div className="form-container">
            <h2>Upload New Material</h2>
            <form onSubmit={handleSubmit}>
                {/* Title */}
                <div className="form-group">
                    <label htmlFor="title">Title:</label>
                    <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} required disabled={loading} />
                </div>

                {/* Authors (Comma-separated) */}
                <div className="form-group">
                    <label htmlFor="authors">Authors (comma-separated):</label>
                    <input type="text" id="authors" name="authors" value={formData.authors} onChange={handleInputChange} disabled={loading} />
                </div>

                {/* Publication Year */}
                <div className="form-group">
                    <label htmlFor="publicationYear">Publication Year:</label>
                    <input type="number" id="publicationYear" name="publicationYear" value={formData.publicationYear} onChange={handleInputChange} min="1500" max={new Date().getFullYear() + 1} disabled={loading} />
                </div>

                {/* Material Type */}
                <div className="form-group">
                    <label htmlFor="materialType">Material Type:</label>
                    <select id="materialType" name="materialType" value={formData.materialType} onChange={handleInputChange} required disabled={loading}>
                        <option value="" disabled>Select Type</option>
                        {materialTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                    </select>
                </div>

                {/* Keywords (Comma-separated) */}
                <div className="form-group">
                    <label htmlFor="keywords">Keywords (comma-separated):</label>
                    <input type="text" id="keywords" name="keywords" value={formData.keywords} onChange={handleInputChange} disabled={loading} />
                </div>

                {/* Category */}
                <div className="form-group">
                    <label htmlFor="category">Category:</label>
                    <select id="category" name="category" value={formData.category} onChange={handleInputChange} required disabled={loading}>
                        <option value="" disabled>Select Category</option>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>

                {/* Description */}
                <div className="form-group">
                    <label htmlFor="description">Description/Abstract:</label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows="4" disabled={loading}></textarea>
                </div>

                {/* File Input */}
                <div className="form-group">
                    <label htmlFor="materialFile">File:</label>
                    <input type="file" id="materialFile" name="materialFile" onChange={handleFileChange} required disabled={loading} accept=".pdf,.doc,.docx,.ppt,.pptx" /> {/* Example accept types */}
                </div>

                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? 'Uploading...' : 'Upload Material'}
                </button>
            </form>
        </div>
    );
}

export default UploadPage;