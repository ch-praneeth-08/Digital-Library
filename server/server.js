// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); // <<< Make sure 'path' is required
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const materialRoutes = require('./routes/materialRoutes'); // Require your routes
const requestRoutes = require('./routes/requestRoutes');

// --- Load Environment Variables & Connect DB ---
dotenv.config();
connectDB();

const app = express();

// --- Core Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies (needed for form-data text fields)


// --- API Routes ---
app.get('/', (req, res) => { res.send('Digital Academic Library API is running...') });
app.use('/api/users', userRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/requests', requestRoutes);
const forumCategoryRoutes = require('./routes/forumCategoryRoutes');
const forumThreadRoutes = require('./routes/forumThreadRoutes'); 
const bookingRoutes = require('./routes/bookingRoutes');



const uploadsDirectory = path.join(__dirname, 'uploads');
console.log(`Serving static files from: ${uploadsDirectory}`); 
app.use('/api/forum-categories', forumCategoryRoutes);
app.use('/api/forum-threads', forumThreadRoutes);
app.use('/api/bookings', bookingRoutes); 

app.use('/uploads', express.static(uploadsDirectory));
// --- Start Server ---
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});