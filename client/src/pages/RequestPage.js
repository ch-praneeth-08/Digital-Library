// src/pages/RequestPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './FormStyles.css'; // Reuse form styles if applicable

function RequestPage() {
    // State keys match the expected backend field names where applicable
    const [formData, setFormData] = useState({
        title: '',
        authors: '', // Input as comma-separated string
        publicationYear: '',
        description: '' // Matches the 'description' field in the schema (used for reason/details)
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // Optional: for redirecting after success

    // Handles changes in input fields and textarea
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handles the form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        setError(''); // Clear previous errors
        setSuccess(''); // Clear previous success messages

        // --- Frontend Validation based on Schema Requirements ---
        if (!formData.title) {
            setError('Please provide the title of the material.');
            return;
        }
        // The description/reason field is also required by the schema
        if (!formData.description) {
             setError('Please provide a reason or description for your request.');
             return;
        }
        // --- End Validation ---

        setLoading(true); // Set loading state

        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
        // **CONFIRM THIS ENDPOINT with backend dev**
        const requestUrl = `${backendUrl}/api/requests`; // Example endpoint

        try {
            // Auth token is sent automatically via axios defaults set in AuthContext
            // Backend should identify the requesting user from the token

            // --- Construct Payload Matching the Request Model ---
            const payload = {
                title: formData.title,
                // Parse comma-separated authors string into an array of trimmed strings
                authors: formData.authors ? formData.authors.split(',').map(a => a.trim()).filter(a => a) : [],
                publicationYear: formData.publicationYear ? Number(formData.publicationYear) : undefined, // Send as number or undefined
                description: formData.description // This field is required
                // `requestedBy` is added by the backend based on the authenticated user
                // `status`, `actionNotes`, `fulfilledMaterial` are handled by the backend lifecycle
            };
            // --- End Payload Construction ---

            // Make the POST request
            const response = await axios.post(requestUrl, payload);

            // Handle success
            setSuccess(response.data?.message || 'Request submitted successfully!');
            setLoading(false);

            // Clear the form fields after successful submission
            setFormData({ title: '', authors: '', publicationYear: '', description: '' });

            // Optional: Navigate away after a short delay
            // setTimeout(() => {
            //     // Example: navigate('/my-requests') // If such a page exists
            //     navigate('/dashboard');
            // }, 2000);

        } catch (err) {
            // Handle errors during submission
            setLoading(false);
            setError(err.response?.data?.message || 'Failed to submit request. Please try again.');
            console.error('Request submission error:', err.response?.data || err.message || err);
        }
    };

    // Render the form
    return (
        <div className="form-container">
            <h2>Request New Material</h2>
            <p>If you can't find a specific book, paper, or other resource, please provide the details below.</p>
            <form onSubmit={handleSubmit}>

                {/* Title (Required) */}
                <div className="form-group">
                    <label htmlFor="title">Title:</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                        placeholder="e.g., Operating System Concepts"
                     />
                </div>

                {/* Authors */}
                <div className="form-group">
                    <label htmlFor="authors">Author(s) (comma-separated if multiple):</label>
                    <input
                        type="text"
                        id="authors"
                        name="authors"
                        value={formData.authors}
                        onChange={handleInputChange}
                        disabled={loading}
                        placeholder="e.g., Silberschatz, Galvin, Gagne"
                    />
                </div>

                {/* Publication Year */}
                <div className="form-group">
                    <label htmlFor="publicationYear">Publication Year (approximate if unsure):</label>
                    <input
                        type="number"
                        id="publicationYear"
                        name="publicationYear"
                        value={formData.publicationYear}
                        onChange={handleInputChange}
                        min="1500" // Example minimum year
                        max={new Date().getFullYear() + 5} // Example maximum year (current + 5)
                        disabled={loading}
                        placeholder="e.g., 2023"
                    />
                </div>

                {/* Description/Reason (Required) - Matches 'description' in schema */}
                <div className="form-group">
                    <label htmlFor="description">Reason/Details for Request:</label>
                    <textarea
                        id="description"
                        name="description" // Ensure name matches state key and schema field
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="4"
                        required
                        disabled={loading}
                        placeholder="e.g., Required for course CS550, Useful for my thesis research on AI ethics..."
                     />
                </div>

                {/* Display Error and Success Messages */}
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}

                {/* Submit Button */}
                <button type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Request'}
                </button>
            </form>
        </div>
    );
}

export default RequestPage;