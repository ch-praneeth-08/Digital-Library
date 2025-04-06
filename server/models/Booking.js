// models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: { // User who is borrowing the item
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        index: true,
    },
    material: { // The physical material being borrowed
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Material',
        index: true,
    },
    borrowedAt: { // Timestamp when the item was actually picked up/borrowed
         type: Date,
         default: Date.now // Set when created, assuming booking = immediate borrow for now
        // Or could be null initially and set later by admin
    },
    dueDate: { // When the item is due back
        type: Date,
        required: true,
        // Default due date calculation (e.g., 14 days from borrow date) will be done in controller
    },
    returnedAt: { // Timestamp when the item was actually returned
        type: Date,
        default: null, // Null until returned
    },
    status: { // Status of the booking/loan
         type: String,
         enum: ['booked', 'active', 'returned', 'overdue', 'cancelled'],
         default: 'active', // Assume active borrowing upon creation for now
         index: true
     },
    // Optional: notes added by librarian/admin
    // adminNotes: { type: String, trim: true }

}, {
    timestamps: true // Adds createdAt (when booking record created), updatedAt
});

// Ensure a user cannot have multiple *active* bookings for the same material
bookingSchema.index({ user: 1, material: 1, status: 1 }, { unique: true, partialFilterExpression: { status: { $in: ['booked', 'active', 'overdue']} } });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;