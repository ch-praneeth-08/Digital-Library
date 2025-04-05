// src/pages/AdminRequestListPage.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './AdminRequestListPage.css'; // Create CSS file for styling

function AdminRequestListPage() {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('pending'); // Default to showing pending

    const fetchRequests = useCallback(async (status) => {
        setIsLoading(true);
        setError('');
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
        // **CONFIRM ENDPOINT & PARAMS** - Assuming GET /api/requests?status=<status>
        const requestUrl = `${backendUrl}/api/requests?status=${status}`;

        try {
            // Auth token sent automatically
            const response = await axios.get(requestUrl);
            // **CONFIRM RESPONSE STRUCTURE** - Assuming response.data.data is the array
            // Also confirm if user info is populated (e.g., response.data.data[0].requestedBy.name)
            if (response.data && response.data.success && Array.isArray(response.data.data)) {
                setRequests(response.data.data);
            } else {
                console.error("Unexpected response structure:", response.data);
                setRequests([]);
                setError("Failed to fetch requests or received invalid data.");
            }
        } catch (err) {
            console.error('Error fetching requests:', err);
            setError(err.response?.data?.message || 'Failed to fetch requests.');
            setRequests([]);
        } finally {
            setIsLoading(false);
        }
    }, []); // Empty dependency array if backendUrl is stable

    // Fetch requests when the component mounts or filter changes
    useEffect(() => {
        fetchRequests(filterStatus);
    }, [filterStatus, fetchRequests]);

    // --- Handler to Update Status ---
    const handleUpdateRequestStatus = async (requestId, newStatus, notes = '') => {
        // Optionally add a loading indicator per request item
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
        // **CONFIRM ENDPOINT** - Assuming PUT /api/requests/:id/status or PATCH /api/requests/:id
        const updateUrl = `${backendUrl}/api/requests/${requestId}/status`; // Example

         // Basic confirmation for destructive actions like 'rejected'
         if (newStatus === 'rejected') {
              if (!window.confirm(`Are you sure you want to reject the request for "${requests.find(r=>r._id === requestId)?.title}"?`)) {
                    return; // Stop if user cancels
              }
         }

        try {
            // **CONFIRM PAYLOAD** - Assuming { status: '...', actionNotes: '...' }
            const payload = { status: newStatus, actionNotes: notes };
            await axios.put(updateUrl, payload); // Or axios.patch

            // Refresh the list after successful update
            // Or update the state locally for better UX
            setRequests(prevRequests => prevRequests.filter(req => req._id !== requestId)); // Remove the processed request
             alert(`Request status updated to ${newStatus}.`); // Simple feedback


        } catch (err) {
            console.error(`Error updating request ${requestId} status:`, err);
            setError(`Failed to update status for request ID ${requestId}. ${err.response?.data?.message || ''}`);
            // Show specific error to the user
             alert(`Failed to update status. Error: ${err.response?.data?.message || 'Server Error'}`);
        }
    };


    // --- Handler for filter change ---
    const handleFilterChange = (e) => {
         setFilterStatus(e.target.value);
    };

    return (
        <div className="admin-requests-container">
            <h2>Manage Material Requests</h2>

            {/* Filter Dropdown */}
             <div className="filter-section">
                 <label htmlFor="statusFilter">Filter by Status: </label>
                 <select id="statusFilter" value={filterStatus} onChange={handleFilterChange}>
                     <option value="pending">Pending</option>
                     <option value="approved">Approved</option>
                     <option value="rejected">Rejected</option>
                     <option value="fulfilled">Fulfilled</option>
                     <option value="">All</option> {/* Option to fetch all */}
                 </select>
             </div>


            {isLoading && <p>Loading requests...</p>}
            {error && <p className="error-message">{error}</p>}

            {!isLoading && !error && (
                <table className="requests-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Requested By</th> {/* Assuming populated data */}
                            <th>Year</th>
                            <th>Authors</th>
                            <th>Description/Reason</th>
                            <th>Date Requested</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length === 0 ? (
                            <tr><td colSpan="8">No requests found matching the criteria.</td></tr>
                        ) : (
                            requests.map(req => (
                                <tr key={req._id}>
                                    <td>{req.title}</td>
                                    {/* **CONFIRM POPULATED FIELD**: Adjust if needed */}
                                    <td>{req.requestedBy?.name || req.requestedBy || 'N/A'}</td>
                                    <td>{req.publicationYear || 'N/A'}</td>
                                    <td>{req.authors?.join(', ') || 'N/A'}</td>
                                    <td>{req.description}</td>
                                    <td>{new Date(req.requestedAt || req.createdAt).toLocaleDateString()}</td>
                                    <td><span className={`status status-${req.status}`}>{req.status}</span></td>
                                    <td>
                                        {req.status === 'pending' && ( // Only show actions for pending requests
                                            <div className="action-buttons">
                                                <button
                                                    onClick={() => handleUpdateRequestStatus(req._id, 'approved')}
                                                    className="btn-approve"
                                                    title="Approve Request"
                                                >
                                                   Approve
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateRequestStatus(req._id, 'rejected')}
                                                    className="btn-reject"
                                                     title="Reject Request"
                                                >
                                                    Reject
                                                </button>
                                                {/* TODO: Add ability to add notes when rejecting/approving */}
                                                 {/* TODO: Add action for 'fulfilled' if needed */}
                                            </div>
                                        )}
                                        {req.status === 'approved' && (
                                             <button disabled className="btn-disabled">Approved</button>
                                             // TODO: Maybe add 'Mark as Fulfilled' button here?
                                        )}
                                        {req.status === 'rejected' && (
                                              <button disabled className="btn-disabled">Rejected</button>
                                        )}
                                         {req.status === 'fulfilled' && (
                                              <button disabled className="btn-disabled">Fulfilled</button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default AdminRequestListPage;