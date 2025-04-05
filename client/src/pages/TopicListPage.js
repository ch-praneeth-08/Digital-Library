// src/pages/TopicListPage.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate
import './TopicListPage.css'; // Create CSS

function TopicListPage() {
    const [topics, setTopics] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { categoryName } = useParams(); // Get category name from URL parameter
    const navigate = useNavigate(); // For navigating to create topic page

    // Decode the category name from the URL
    const decodedCategoryName = decodeURIComponent(categoryName || '');

    const fetchTopics = useCallback(async (category) => {
        if (!category) return; // Don't fetch if category is missing

        setIsLoading(true);
        setError('');
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
        // **CONFIRM ENDPOINT & PARAMS**
        const topicsUrl = `${backendUrl}/api/topics?category=${encodeURIComponent(category)}`;

        try {
            const response = await axios.get(topicsUrl);
            // **CONFIRM RESPONSE STRUCTURE & FIELDS** (title, createdBy.name, lastReplyAt, etc.)
            if (response.data && response.data.success && Array.isArray(response.data.data)) {
                setTopics(response.data.data);
            } else {
                console.error("Unexpected response:", response.data);
                setError("Failed to fetch topics or received invalid data.");
                setTopics([]);
            }
        } catch (err) {
            console.error('Error fetching topics:', err);
            setError(err.response?.data?.message || 'Failed to fetch topics.');
            setTopics([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTopics(decodedCategoryName);
    }, [decodedCategoryName, fetchTopics]);

    // Helper to format dates
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        // More sophisticated formatting can be added
        return new Date(dateString).toLocaleString();
    };

     // Navigate to the Create Topic page for this category
     const goToCreateTopic = () => {
         navigate(`/discussions/category/${categoryName}/new-topic`);
     };


    return (
        <div className="topic-list-container">
            <h2>Topics in: {decodedCategoryName}</h2>
             {/* Button to create a new topic */}
            <div className="topic-actions">
                <button onClick={goToCreateTopic} className="btn-create-topic">
                    Create New Topic
                </button>
                 <Link to="/discussions" className="link-back">Back to Categories</Link>
            </div>


            {isLoading && <p>Loading topics...</p>}
            {error && <p className="error-message">{error}</p>}

            {!isLoading && !error && (
                <table className="topics-table">
                    <thead>
                        <tr>
                            <th>Topic Title</th>
                            <th>Started By</th>
                            <th>Replies</th> {/* If available */}
                            <th>Last Activity</th> {/* If available */}
                        </tr>
                    </thead>
                    <tbody>
                        {topics.length === 0 ? (
                            <tr><td colSpan="4">No topics found in this category yet.</td></tr>
                        ) : (
                            topics.map(topic => (
                                <tr key={topic._id}>
                                    <td>
                                        {/* Link to view the specific topic */}
                                        <Link to={`/discussions/topic/${topic._id}`} className="topic-title-link">
                                            {topic.title}
                                        </Link>
                                    </td>
                                    {/* **CONFIRM POPULATED FIELD** */}
                                    <td>{topic.createdBy?.name || 'N/A'}</td>
                                    <td>{topic.replyCount || 0}</td> {/* Use field if available */}
                                    <td>{formatDate(topic.lastReplyAt || topic.createdAt)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default TopicListPage;