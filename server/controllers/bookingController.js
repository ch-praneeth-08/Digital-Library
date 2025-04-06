// controllers/bookingController.js
const Booking = require('../models/Booking');
const Material = require('../models/Material'); // Need Material model to check availability and update copies
const User = require('../models/User');     // May need for checks later

// Helper function to calculate due date (e.g., 14 days from now)
const calculateDueDate = (borrowDate, durationDays = 14) => {
    const date = new Date(borrowDate);
    date.setDate(date.getDate() + durationDays);
    return date;
};


// @desc    Create a new booking (borrow a physical item)
// @route   POST /api/bookings
// @access  Private (e.g., Students, Faculty)
const createBooking = async (req, res) => {
    const { materialId } = req.body;
    const userId = req.user._id;

    // Basic validation (Use Zod later for body)
    if (!materialId?.match(/^[0-9a-fA-F]{24}$/)) {
         return res.status(400).json({ success: false, message: 'Valid materialId is required in the request body.' });
    }

    // --- Database Operations ---
    // Using a session for transaction-like behavior is recommended for atomicity
    // But for simplicity here, we'll do sequential checks and updates. Be aware of potential race conditions.
    // const session = await mongoose.startSession(); // Example start
    // session.startTransaction(); // Example start

    try {
        // ** Inside potential transaction **

        // 1. Find the material and check conditions
        const material = await Material.findById(materialId); //.session(session); // Add .session(session) if using transactions

        if (!material) {
            return res.status(404).json({ success: false, message: 'Material not found.' });
        }
        if (!material.isPhysical) {
            return res.status(400).json({ success: false, message: 'This material is not a physical item and cannot be booked.' });
        }
        if (material.availableCopies <= 0) {
            return res.status(400).json({ success: false, message: 'No copies currently available for borrowing.' });
        }

         // 2. Check if user already has an active booking for this material
         const existingActiveBooking = await Booking.findOne({
             user: userId,
             material: materialId,
             status: { $in: ['booked', 'active', 'overdue'] } // Check active states
         }); //.session(session);
         if (existingActiveBooking) {
             return res.status(400).json({ success: false, message: 'You already have an active loan or booking for this material.' });
         }

         // **Potentially add other user borrowing limits checks here (e.g., max active loans)**


        // 3. Decrement availableCopies on the Material
        material.availableCopies -= 1;
        await material.save(); // Add { session } if using transactions

         console.log(`Decremented available copies for ${material.title} to ${material.availableCopies}`);

        // 4. Create the Booking record
        const borrowDate = new Date();
        const dueDate = calculateDueDate(borrowDate); // Calculate due date

        const bookingData = {
            user: userId,
            material: materialId,
            borrowedAt: borrowDate, // Assuming booking = immediate borrow
            dueDate: dueDate,
            status: 'active', // Set initial status
        };

        const newBooking = await Booking.create(bookingData); // Could use [bookingData], { session } for create
         console.log(`Created new booking record ${newBooking._id}`);


        // ** If using transaction: **
        // await session.commitTransaction();
        // session.endSession();

         // Populate fields for response
         await newBooking.populate('user', 'name email');
         await newBooking.populate('material', 'title isbn');


        // 5. Send Success Response
        res.status(201).json({
            success: true,
            message: 'Material booked successfully.',
            data: newBooking,
        });

    } catch (error) {
         // ** If using transaction: **
         // await session.abortTransaction();
         // session.endSession();

        console.error("Create Booking Error:", error);
        // Specific check for the unique index violation
         if (error.code === 11000 && error.message.includes('user_1_material_1_status_1')) {
            // This might occur in a race condition if check passes but insert fails
             return res.status(400).json({ success: false, message: 'Booking failed: You appear to already have an active loan for this material (concurrent request?).' });
        }
        if (error.name === 'ValidationError') return res.status(400).json({ success: false, message: error.message });
         if (error.name === 'CastError') return res.status(400).json({ success: false, message: `Invalid ID format.`}); // More specific ID check possible

        // If decrement succeeded but booking create failed, ideally rollback decrement (requires transaction)
        // Simple recovery (try incrementing back - prone to issues):
        // try {
        //     await Material.findByIdAndUpdate(materialId, { $inc: { availableCopies: 1 } });
        //     console.error("Create Booking Error: Rolled back available copy decrement attempt.");
        // } catch (rollbackError) {
        //     console.error("!!! Create Booking Error: FAILED TO ROLLBACK available copy decrement:", rollbackError);
        // }

        res.status(500).json({ success: false, message: 'Server error creating booking.' });
    }
};


// TODO: Add controllers for getting user bookings, getting all bookings (admin), marking as returned
const getMyBookings = async (req, res) => {
    try {
        // Filter can include status (e.g., ?status=active)
         const filter = { user: req.user._id };
         if (req.query.status && ['booked', 'active', 'returned', 'overdue', 'cancelled'].includes(req.query.status)) {
             filter.status = req.query.status;
         }
         // TODO: Pagination

        const bookings = await Booking.find(filter)
             .populate('material', 'title isbn materialType') // Populate essential material details
             .sort({ createdAt: -1 }); // Show most recent bookings first

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        console.error("Get My Bookings Error:", error);
        res.status(500).json({ success: false, message: 'Server error retrieving your bookings.' });
    }
};


// @desc    Get all bookings (admin/faculty view)
// @route   GET /api/bookings
// @access  Private (Admin, Faculty)
const getAllBookings = async (req, res) => {
    try {
         // Filtering options: ?status=active, ?user=<userId>, ?material=<materialId>
         // Use AQP library for robust filtering/sorting/pagination is recommended here
         let filter = {};
         if (req.query.status && ['booked', 'active', 'returned', 'overdue', 'cancelled'].includes(req.query.status)) {
            filter.status = req.query.status;
        }
         if (req.query.userId?.match(/^[0-9a-fA-F]{24}$/)) {
             filter.user = req.query.userId;
         }
         if (req.query.materialId?.match(/^[0-9a-fA-F]{24}$/)) {
            filter.material = req.query.materialId;
         }

         // TODO: Pagination

        const bookings = await Booking.find(filter)
            .populate('user', 'name email')       // Populate user details
            .populate('material', 'title isbn') // Populate material details
            .sort({ createdAt: -1 });           // Sort most recent first

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
         console.error("Get All Bookings Error:", error);
         // Add CastError check for IDs if needed
        res.status(500).json({ success: false, message: 'Server error retrieving all bookings.' });
    }
};

const returnBooking = async (req, res) => {
    const bookingId = req.params.id;

     // Optional: Allow passing returnDate in body? Otherwise, defaults to now.
     // const { customReturnDate } = req.body;

    // --- Use Session/Transaction if possible ---
    // const session = await mongoose.startSession();
    // session.startTransaction();

    try {
        // 1. Find the active booking
        const booking = await Booking.findById(bookingId); //.session(session);
        if (!booking) {
             // await session.abortTransaction(); session.endSession(); // If using transaction
            return res.status(404).json({ success: false, message: 'Booking not found.' });
        }

         // 2. Check if it's already returned
         if (booking.status === 'returned') {
              // await session.abortTransaction(); session.endSession();
             return res.status(400).json({ success: false, message: 'This booking has already been marked as returned.' });
        }

        // 3. Find the associated material to increment its count
        const material = await Material.findById(booking.material); //.session(session);
         if (!material) {
             // Data integrity issue if booking exists but material doesn't! Log this.
             console.error(`!!! Data Integrity Issue: Material ${booking.material} not found for active booking ${bookingId}`);
              // await session.abortTransaction(); session.endSession();
             return res.status(500).json({ success: false, message: 'Cannot return booking: Associated material record not found.' });
        }

        // 4. Update the booking status and return date
         const returnDate = new Date(); // Or use customReturnDate if implemented
        booking.status = 'returned';
        booking.returnedAt = returnDate;
        await booking.save(); // Add { session } if using transaction

        console.log(`Marked booking ${booking._id} as returned`);


         // 5. Increment availableCopies for the material
         // Ensure not to exceed totalCopies (shouldn't happen on return, but safe)
         material.availableCopies = Math.min((material.availableCopies ?? 0) + 1, material.totalCopies ?? 0);
         await material.save(); // Add { session } if using transaction

         console.log(`Incremented available copies for ${material.title} to ${material.availableCopies}`);


        // ** Commit transaction if using session **
        // await session.commitTransaction();
        // session.endSession();


        // Populate for response
         await booking.populate('user', 'name email');
         await booking.populate('material', 'title isbn');


         // 6. Send success response
         res.status(200).json({
             success: true,
             message: 'Booking marked as returned successfully.',
             data: booking
         });

    } catch (error) {
         // ** Abort transaction if using session **
         // await session.abortTransaction();
         // session.endSession();

        console.error("Return Booking Error:", error);
         if (error.name === 'CastError') return res.status(400).json({ success: false, message: `Invalid booking ID format.` });
         // Handle potential errors during material save after booking save? (Transactions help)

        res.status(500).json({ success: false, message: 'Server error processing return.' });
    }
};


module.exports = {
    createBooking,
    getMyBookings,
    getAllBookings,
    returnBooking // Export new function
};