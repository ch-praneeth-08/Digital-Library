// src/pages/PhysicalBooksPage.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './PhysicalBooksPage.css'; // Create CSS file

function PhysicalBooksPage() {
    const [books, setBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [bookingStatus, setBookingStatus] = useState({}); // To track booking attempts per book

    // Fetch available physical books
    const fetchPhysicalBooks = useCallback(async () => {
        setIsLoading(true);
        setError('');
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
        // **CONFIRM ENDPOINT & PARAMS**
        // Assuming filtering the main materials endpoint
        const booksUrl = `${backendUrl}/api/materials?materialType=book&isPhysical=true&quantityAvailable[gt]=0`; // Example: only fetch if available > 0

        try {
            const response = await axios.get(booksUrl);
            // **CONFIRM RESPONSE STRUCTURE & FIELDS** (e.g., quantityAvailable, location)
            if (response.data && response.data.success && Array.isArray(response.data.data)) {
                setBooks(response.data.data);
            } else {
                console.error("Unexpected response:", response.data);
                setError("Failed to fetch books or received invalid data.");
                setBooks([]);
            }
        } catch (err) {
            console.error('Error fetching physical books:', err);
            setError(err.response?.data?.message || 'Failed to fetch physical books.');
            setBooks([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPhysicalBooks();
    }, [fetchPhysicalBooks]);

    // --- Handle Booking ---
    const handleBookSlot = async (bookId, bookTitle) => {
        // Simple confirmation
        if (!window.confirm(`Confirm booking for "${bookTitle}"? You will be notified about pickup details.`)) {
            return;
        }

        setBookingStatus(prev => ({ ...prev, [bookId]: { loading: true, error: null, success: null } }));
        setError(''); // Clear general errors

        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
        // **CONFIRM BOOKING ENDPOINT & PAYLOAD**
        const bookingUrl = `${backendUrl}/api/bookings`; // Example
        const payload = {
            bookId: bookId,
            // Add other required fields like desiredPickupDate if needed by backend
        };

        try {
            // Auth token sent automatically
            const response = await axios.post(bookingUrl, payload);
            setBookingStatus(prev => ({
                ...prev,
                [bookId]: { loading: false, error: null, success: response.data?.message || 'Booking successful!' }
            }));
             // Optionally refresh book list or update availability locally
             // fetchPhysicalBooks(); // Refresh the whole list
             // Or decrease quantity locally if backend doesn't automatically trigger refresh
             setBooks(prevBooks => prevBooks.map(book =>
                book._id === bookId ? { ...book, quantityAvailable: (book.quantityAvailable || 1) - 1 } : book
             ));


        } catch (err) {
            console.error(`Error booking book ${bookId}:`, err);
            const errorMsg = err.response?.data?.message || 'Booking failed.';
            setBookingStatus(prev => ({
                ...prev,
                [bookId]: { loading: false, error: errorMsg, success: null }
            }));
        }
    };

    return (
        <div className="physical-books-container">
            <h2>Available Physical Books for Borrowing</h2>

            {isLoading && <p>Loading available books...</p>}
            {error && <p className="error-message">{error}</p>}

            {!isLoading && !error && (
                <div className="books-list">
                    {books.length === 0 ? (
                        <p>No physical books are currently available for borrowing.</p>
                    ) : (
                        books.map(book => {
                            const currentBookingStatus = bookingStatus[book._id] || {};
                            const isAvailable = (book.quantityAvailable ?? 0) > 0; // Check availability

                            return (
                                <div key={book._id} className={`book-item ${!isAvailable ? 'unavailable' : ''}`}>
                                    <h3>{book.title}</h3>
                                    <p><strong>Authors:</strong> {book.authors?.join(', ') || 'N/A'}</p>
                                    <p><strong>Year:</strong> {book.publicationYear || 'N/A'}</p>
                                    <p><strong>ISBN:</strong> {book.isbn || 'N/A'}</p> {/* Add ISBN if available */}
                                    <p><strong>Location:</strong> {book.location || 'Main Library'}</p> {/* Add Location */}
                                    <p><strong>Availability:</strong> {isAvailable ? `${book.quantityAvailable} available` : 'Currently Unavailable'}</p>

                                    {/* Booking Button and Status */}
                                    <div className="booking-section">
                                        {isAvailable && ( // Only show button if available
                                            <button
                                                onClick={() => handleBookSlot(book._id, book.title)}
                                                disabled={currentBookingStatus.loading || currentBookingStatus.success}
                                                className="btn-book"
                                            >
                                                {currentBookingStatus.loading ? 'Booking...' : (currentBookingStatus.success ? 'Booked!' : 'Book Slot')}
                                            </button>
                                        )}
                                        {currentBookingStatus.error && <p className="booking-error">{currentBookingStatus.error}</p>}
                                        {currentBookingStatus.success && !currentBookingStatus.loading && <p className="booking-success">{currentBookingStatus.success}</p>}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}

export default PhysicalBooksPage;