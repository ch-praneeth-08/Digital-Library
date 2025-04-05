// middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // File system module

// Define the upload directory relative to the project root
const UPLOAD_DIRECTORY = path.join(__dirname, '..', 'uploads'); // Points to backend/uploads

// Ensure the upload directory exists
if (!fs.existsSync(UPLOAD_DIRECTORY)) {
  fs.mkdirSync(UPLOAD_DIRECTORY, { recursive: true }); // Create directory if it doesn't exist
  console.log(`Upload directory created at: ${UPLOAD_DIRECTORY}`);
} else {
    console.log(`Upload directory already exists at: ${UPLOAD_DIRECTORY}`);
}

// Multer disk storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Set the destination folder for uploads
    cb(null, UPLOAD_DIRECTORY);
  },
  filename: function (req, file, cb) {
    // Create a unique filename to avoid collisions
    // Format: fieldname-<timestamp>.<original_extension>
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter function (optional but recommended)
const fileFilter = (req, file, cb) => {
  // Define allowed mime types
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-powerpoint', // .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    // Add other types as needed (e.g., images for book covers if extending)
    // 'image/jpeg',
    // 'image/png'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    // Accept the file
    cb(null, true);
  } else {
    // Reject the file
    console.warn(`Upload rejected: Invalid mime type ${file.mimetype} for file ${file.originalname}`);
    // Pass an error message to be potentially caught later
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, PPT, PPTX are allowed.'), false);
  }
};


// Create the Multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 50 // 50MB file size limit (adjust as needed)
  },
  fileFilter: fileFilter
});

// Middleware to handle Multer errors specifically (optional but good practice)
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading (e.g., file size limit)
        console.error("Multer Error:", err);
        return res.status(400).json({ message: `File upload error: ${err.message}` });
    } else if (err) {
        // An unknown error occurred when uploading (e.g., file type error from our filter)
         console.error("Upload Middleware Error:", err);
         return res.status(400).json({ message: err.message || 'File upload failed.' });
    }
    // Everything went fine or no upload attempted on this route
    next();
};


// Export the configured upload instance (for single file uploads typically)
// We specify the field name ('materialFile') expected from the form-data
module.exports = {
    uploadMaterial: upload.single('materialFile'), // Middleware expects a single file in a field named 'materialFile'
    handleUploadError // Export the error handler
 };

/*
  NOTES:
  - 'materialFile' is the 'name' attribute of the file input field in your frontend form.
  - upload.single('...') handles one file. Use upload.array('...') for multiple files in the same field,
    or upload.fields([...]) for multiple files in different fields.
  - We will use `uploadMaterial` in our routes.
  - The file information will be available in the controller via `req.file`.
  - Text fields from the same form-data request will be available in `req.body`.
*/