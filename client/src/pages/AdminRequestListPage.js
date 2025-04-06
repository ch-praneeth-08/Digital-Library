// src/pages/AdminRequestListPage.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // Make sure axios is installed
import './AdminRequestListPage.css';

// Setup Axios interceptor to automatically send token (if not already done elsewhere)
// This is just an example setup, adjust based on how you store your token
// You might have a central place for this (e.g., api.js service)
axios.interceptors.request.use((config) => {
    const userJson = localStorage.getItem('userInfo'); // Or however you store user info/token
    if (userJson) {
        const userInfo = JSON.parse(userJson);
        if (userInfo?.token) {
            config.headers.Authorization = `Bearer ${userInfo.token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});


function AdminRequestListPage() {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('pending'); // Default to showing pending

    // Centralized Backend URL
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

    const fetchRequests = useCallback(async (status) => {
        setIsLoading(true);
        setError('');
        // Use URLSearchParams for cleaner query parameter handling
        const params = new URLSearchParams();
        if (status) { // Only add status if it's not empty (for the 'All' case)
             params.append('status', status);
        }
        const requestUrl = `${backendUrl}/api/requests?${params.toString()}`;
        console.log("Fetching requests from:", requestUrl); // Debug log

        try {
            const response = await axios.get(requestUrl);
            console.log("Fetched requests Response:", response.data); // Debug log

            if (response.data && response.data.success && Array.isArray(response.data.data)) {
                setRequests(response.data.data);
            } else {
                console.error("Unexpected response structure:", response.data);
                setRequests([]);
                setError("Failed to fetch requests or received invalid data.");
            }
        } catch (err) {
            console.error('Error fetching requests:', err);
             const errMsg = err.response?.data?.message || err.message || 'Failed to fetch requests.';
             console.error("Specific Fetch Error:", errMsg); // Debug log error message
            setError(errMsg);
            setRequests([]); // Clear requests on error
        } finally {
            setIsLoading(false);
        }
    }, [backendUrl]); // Add backendUrl as dependency

    // Fetch on mount and filter change
    useEffect(() => {
        fetchRequests(filterStatus);
    }, [filterStatus, fetchRequests]);

    // --- Handler to Update Status ---
    const handleUpdateRequestStatus = async (requestId, newStatus) => {
        // Get title for confirmation message
        const requestTitle = requests.find(r => r._id === requestId)?.title || 'this request';

         // Consider adding a notes input later
         let notes = '';
         if (newStatus === 'rejected') {
             if (!window.confirm(`Are you sure you want to REJECT the request for "${requestTitle}"?`)) {
                return; // Stop if user cancels
              }
              // Optionally prompt for rejection reason
             // notes = prompt(`Reason for rejecting "${requestTitle}" (optional):`) || '';
         } else if (newStatus === 'approved') {
             if (!window.confirm(`Are you sure you want to APPROVE the request for "${requestTitle}"?`)) {
                 return;
             }
              // Optionally prompt for approval notes
             // notes = prompt(`Approval notes for "${requestTitle}" (optional):`) || '';
         }
         // TODO: Handle 'fulfilled' status update if adding button

        const updateUrl = `${backendUrl}/api/requests/${requestId}/status`;
        console.log(`Sending PATCH request to: ${updateUrl}`); // Debug log

        try {
            const payload = { status: newStatus, actionNotes: notes };
            console.log("Sending Payload:", payload); // Debug log

            // *** Use axios.patch to match the backend route ***
            const response = await axios.patch(updateUrl, payload);
            console.log("Update Status Response:", response.data); // Debug log

            // Refresh the list to show only items matching the *current* filter
            // Alternatively update the item's status in the local state for instant feedback
             alert(`Request for "${requestTitle}" updated to ${newStatus}.`); // Better feedback
             fetchRequests(filterStatus); // Re-fetch based on the current filter

        } catch (err) {
            console.error(`Error updating request ${requestId} status:`, err);
             const errMsg = err.response?.data?.message || err.message || 'Failed to update status.';
             console.error("Specific Update Error:", errMsg); // Debug log error message
            // Display error to the user
            alert(`Failed to update status for "${requestTitle}".\nError: ${errMsg}`);
        }
    };

    const handleFilterChange = (e) => {
         setFilterStatus(e.target.value);
    };

    return (
        <div className="admin-requests-container">
            <h2>Manage Material Requests</h2>
             <div className="filter-section">
                 <label htmlFor="statusFilter">Filter by Status: </label>
                 <select id="statusFilter" value={filterStatus} onChange={handleFilterChange}>
                     <option value="pending">Pending</option>
                     <option value="approved">Approved</option>
                     <option value="rejected">Rejected</option>
                     <option value="fulfilled">Fulfilled</option>
                     <option value="">All</option>
                 </select>
             </div>

            {isLoading && <p>Loading requests...</p>}
            {error && <p className="error-message">Error: {error}</p>} {/* Display fetch error */}

            {!isLoading && !error && (
                <table className="requests-table">
                    {/* ... table head ... */}
                     <thead>
                        <tr>
                            <th>Title</th>
                            <th>Requested By</th>
                            <th>Year</th>
                            <th>Authors</th>
                            <th>Description/Reason</th>
                            <th>Date Requested</th>
                            <th>Status</th>
                             {/*<th>Admin Notes</th> Show notes if available? */}
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length === 0 ? (
                            <tr><td colSpan="8">No requests found matching the criteria.</td></tr>
                        ) : (
                            requests.map(req => (
                                <tr key={req._id}>
                                    <td>{req.title || 'N/A'}</td>
                                    <td>{req.requestedBy?.name || 'N/A'}</td>
                                    <td>{req.publicationYear || 'N/A'}</td>
                                    <td>{req.authors?.join(', ') || 'N/A'}</td>
                                    <td style={{ whiteSpace: 'pre-wrap', minWidth: '200px' }}>{req.description || 'N/A'}</td>
                                    <td>{new Date(req.requestedAt || req.createdAt).toLocaleDateString()}</td>
                                    <td><span className={`status status-${req.status}`}>{req.status}</span></td>
                                     {/*<td>{req.actionNotes || '-'}</td> Show notes? */}
                                    <td>
                                        {req.status === 'pending' && (
                                            <div className="action-buttons">
                                                <button onClick={() => handleUpdateRequestStatus(req._id, 'approved')} className="btn-approve" title="Approve Request">Approve</button>
                                                <button onClick={() => handleUpdateRequestStatus(req._id, 'rejected')} className="btn-reject" title="Reject Request">Reject</button>
                                                 {/* Button for fulfilled if appropriate */}
                                                {/* <button onClick={() => handleUpdateRequestStatus(req._id, 'fulfilled')}>Fulfilled</button> */}
                                            </div>
                                        )}
                                         {(req.status === 'approved' || req.status === 'rejected' || req.status === 'fulfilled') && (
                                             <button disabled className="btn-disabled">Processed</button> // Single button for non-pending
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