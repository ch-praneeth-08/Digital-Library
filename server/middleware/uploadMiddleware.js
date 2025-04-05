// backend/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // File system module

// Define the absolute path to the upload directory
// path.resolve ensures it's absolute regardless of where the script runs
const UPLOAD_DIRECTORY = path.resolve(__dirname, '..', 'uploads');
console.log(`Resolved UPLOAD_DIRECTORY to: ${UPLOAD_DIRECTORY}`); // Log for verification


// --- Ensure the upload directory exists ---
if (!fs.existsSync(UPLOAD_DIRECTORY)) {
  try {
    fs.mkdirSync(UPLOAD_DIRECTORY, { recursive: true }); // Create directory if it doesn't exist
    console.log(`Upload directory created at: ${UPLOAD_DIRECTORY}`);
  } catch (error) {
     console.error(`Error creating upload directory at ${UPLOAD_DIRECTORY}:`, error);
     // Depending on setup, you might want to throw an error here to prevent server start
  }
} else {
    console.log(`Upload directory already exists at: ${UPLOAD_DIRECTORY}`);
}
// --- End directory check ---


// --- Multer disk storage configuration ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Set the destination folder for uploads using the resolved absolute path
    cb(null, UPLOAD_DIRECTORY);
  },
  filename: function (req, file, cb) {
    // Create a unique filename to prevent overwrites and conflicts
    // Format: fieldname-<timestamp>-<random_number>.<original_extension>
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname); // Get original extension
    // Use original fieldname + suffix + extension
    const finalFilename = file.fieldname + '-' + uniqueSuffix + extension;
    console.log(`Generated filename for ${file.originalname}: ${finalFilename}`); // Log filename
    cb(null, finalFilename);
  },
});
// --- End storage configuration ---


// --- File filter function (defines allowed file types) ---
const fileFilter = (req, file, cb) => {
  // Define allowed mime types (adjust as needed)
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-powerpoint', // .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    // Add other types like text files, images etc. if needed
     'text/plain', // .txt
    // 'image/jpeg',
    // 'image/png'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    // Accept the file if its mime type is in the allowed list
    console.log(`File accepted: ${file.originalname} (${file.mimetype})`);
    cb(null, true);
  } else {
    // Reject the file if its mime type is not allowed
    console.warn(`Upload rejected: Invalid mime type ${file.mimetype} for file ${file.originalname}`);
    // Pass an error message to be caught by handleUploadError middleware
    cb(new Error(`Invalid file type: ${file.mimetype}. Only PDF, DOC(X), PPT(X), TXT are allowed.`), false);
  }
};
// --- End file filter ---


// --- Create the Multer instance ---
const upload = multer({
  storage: storage, // Use the disk storage configuration defined above
  limits: {
    fileSize: 1024 * 1024 * 50 // 50MB file size limit (adjust as needed)
  },
  fileFilter: fileFilter // Apply the file type filter
});
// --- End Multer instance creation ---


// --- Middleware to handle Multer-specific errors ---
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // A Multer error occurred (e.g., file size limit exceeded)
        console.error("Multer Error:", err);
        // Send a specific error message based on the Multer error code
        let message = `File upload error: ${err.message}`;
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'File size limit exceeded (Max 50MB).'; // More user-friendly message
        }
        return res.status(400).json({ success: false, message: message });
    } else if (err) {
        // An error occurred, possibly from our fileFilter
         console.error("Upload Middleware Custom Error:", err);
         return res.status(400).json({ success: false, message: err.message || 'File upload failed.' });
    }
    // If no error or error not related to Multer, pass control to the next middleware
    next();
};
// --- End Multer error handler ---


// --- Export the middleware ---
// We export the specific Multer middleware for handling a single file upload
// The key 'materialFile' must match the 'name' attribute of the file input field in the client form
module.exports = {
    uploadMiddleware: upload.single('materialFile'), // Changed name for clarity
    handleUploadError: handleUploadError
 };