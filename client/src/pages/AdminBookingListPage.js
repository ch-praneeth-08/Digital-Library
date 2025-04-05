// src/pages/AdminBookingListPage.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
// Reuse AdminRequestListPage CSS or create a new one if needed
import './AdminRequestListPage.css'; // Reusing similar table styles

function AdminBookingListPage() {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('booked'); // Default to 'booked' (awaiting pickup)

    const fetchBookings = useCallback(async (status) => {
        setIsLoading(true);
        setError('');
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
        // **CONFIRM ENDPOINT & PARAMS**
        let bookingsUrl = `${backendUrl}/api/bookings`; // Assuming base endpoint
         if (status) {
             bookingsUrl += `?status=${status}`; // Add status filter if provided
         }
        // Add other params if needed (e.g., populate=user,book)

        try {
            const response = await axios.get(bookingsUrl);
            // **CONFIRM RESPONSE STRUCTURE & POPULATED FIELDS**
            // Assuming response.data.data contains bookings with populated user/book
            if (response.data && response.data.success && Array.isArray(response.data.data)) {
                setBookings(response.data.data);
            } else {
                console.error("Unexpected response structure:", response.data);
                setError("Failed to fetch bookings or received invalid data.");
                setBookings([]);
            }
        } catch (err) {
            console.error('Error fetching bookings:', err);
            setError(err.response?.data?.message || 'Failed to fetch bookings.');
            setBookings([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch on mount and when filter changes
    useEffect(() => {
        fetchBookings(filterStatus);
    }, [filterStatus, fetchBookings]);

    // --- Handle Status Update ---
    const handleUpdateBookingStatus = async (bookingId, newStatus) => {
        setError(''); // Clear previous errors
         // Simple confirmation, especially for 'returned'
         if (!window.confirm(`Confirm updating status to "${newStatus}" for this booking?`)) {
             return;
         }

        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
        // **CONFIRM ENDPOINT & PAYLOAD**
        // Assuming PATCH /api/bookings/:id or similar
        const updateUrl = `${backendUrl}/api/bookings/${bookingId}/status`; // Example endpoint
        const payload = { status: newStatus }; // Example payload

        try {
            await axios.patch(updateUrl, payload); // Use PATCH or PUT as required by backend

            // Refresh list after update
            fetchBookings(filterStatus); // Re-fetch the list with the current filter
             alert(`Booking status updated to ${newStatus}.`);


        } catch (err) {
            console.error(`Error updating booking ${bookingId} status:`, err);
            setError(`Failed to update status for booking ID ${bookingId}. ${err.response?.data?.message || ''}`);
             alert(`Failed to update status. Error: ${err.response?.data?.message || 'Server Error'}`);
        }
    };

    // --- Handle Filter Change ---
     const handleFilterChange = (e) => {
         setFilterStatus(e.target.value);
     };

    // --- Helper to format dates ---
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="admin-requests-container"> {/* Reusing container class */}
            <h2>Manage Physical Book Bookings</h2>

             {/* Filter Dropdown */}
             <div className="filter-section">
                 <label htmlFor="statusFilter">Filter by Status: </label>
                 <select id="statusFilter" value={filterStatus} onChange={handleFilterChange}>
                     <option value="booked">Booked (Awaiting Pickup)</option>
                     <option value="picked-up">Picked Up (Borrowed)</option>
                     <option value="returned">Returned</option>
                     <option value="cancelled">Cancelled</option> {/* If applicable */}
                     <option value="overdue">Overdue</option> {/* If applicable */}
                     <option value="">All</option> {/* Option to fetch all */}
                 </select>
             </div>

            {isLoading && <p>Loading bookings...</p>}
            {error && <p className="error-message">{error}</p>}

            {!isLoading && !error && (
                <table className="requests-table"> {/* Reusing table class */}
                    <thead>
                        <tr>
                            <th>Book Title</th>
                            <th>Borrower</th>
                            <th>Booking Date</th>
                            <th>Due Date</th> {/* If available */}
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.length === 0 ? (
                            <tr><td colSpan="6">No bookings found matching the criteria.</td></tr>
                        ) : (
                            bookings.map(booking => (
                                <tr key={booking._id}>
                                    {/* **CONFIRM POPULATED FIELDS** */}
                                    <td>{booking.book?.title || 'N/A'}</td>
                                    <td>{booking.user?.name || booking.user?.email || 'N/A'}</td>
                                    <td>{formatDate(booking.bookingDate || booking.createdAt)}</td>
                                    <td>{formatDate(booking.dueDate)}</td> {/* Display Due Date */}
                                    <td><span className={`status status-${booking.status}`}>{booking.status}</span></td>
                                    <td>
                                        <div className="action-buttons">
                                            {booking.status === 'booked' && (
                                                <button
                                                    onClick={() => handleUpdateBookingStatus(booking._id, 'picked-up')}
                                                    className="btn-action btn-pickup"
                                                    title="Mark as Picked Up"
                                                >
                                                    Mark Picked Up
                                                </button>
                                            )}
                                            {booking.status === 'picked-up' && (
                                                <button
                                                    onClick={() => handleUpdateBookingStatus(booking._id, 'returned')}
                                                    className="btn-action btn-return"
                                                    title="Mark as Returned"
                                                >
                                                    Mark Returned
                                                </button>
                                            )}
                                             {/* Add buttons for other actions like 'Cancel' or 'Mark Overdue' if needed */}
                                             {(booking.status === 'returned' || booking.status === 'cancelled') && (
                                                 <span className="no-action">No actions</span>
                                             )}
                                        </div>
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

export default AdminBookingListPage;