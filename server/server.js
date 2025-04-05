// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); // Need path module for serving static files
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const materialRoutes = require('./routes/materialRoutes'); // Import material routes
const requestRoutes = require('./routes/requestRoutes');
dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Needed to parse form-data text fields alongside files

app.get('/', (req, res) => {
  res.send('Digital Academic Library API is running...');
});

// --- Mount Routers ---
app.use('/api/users', userRoutes);
app.use('/api/materials', materialRoutes); // Use material routes for /api/materials path
app.use('/api/requests', requestRoutes);
// --- Serve Uploaded Files Statically (Optional but useful for access) ---
// Make the 'uploads' directory publicly accessible
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));


// --- Error Handling Middleware ---
// Add later if needed

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});