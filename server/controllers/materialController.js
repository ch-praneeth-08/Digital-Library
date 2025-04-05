// controllers/materialController.js
const Material = require('../models/Material');
// NOTE: Removed AQP and GetMaterials/DeleteMaterial for clarity on just upload
const aqp = require('api-query-params'); 
const path = require('path'); // REQUIRED for file paths
const fs = require('fs');      // REQUIRED for file system operations (cleanup)

const UPLOAD_DIRECTORY = path.resolve(__dirname, '..', 'uploads');


/**
 * Helper function to parse comma-separated strings or arrays into trimmed arrays.
 * @param {*} input The input value (string or array).
 * @returns {string[]} An array of trimmed strings, or an empty array.
 */
const parseToArray = (input) => {
    // ... (Keep this function as defined before) ...
    if (!input) return [];
    if (Array.isArray(input)) {
        return input.map(item => typeof item === 'string' ? item.trim() : item)
                    .filter(item => item != null && item !== '');
    }
    if (typeof input === 'string') {
        return input.split(',')
                    .map(item => item.trim())
                    .filter(Boolean);
    }
    return [];
};

// @desc    Upload a new academic material
// @route   POST /api/materials/upload
// @access  Private (e.g., Faculty, Admin - controlled by route middleware)
const uploadMaterial = async (req, res) => {
    // Multer (specifically `uploadMiddleware` which runs before this controller)
    // should have processed the file and populated `req.file` if successful,
    // or thrown an error handled by `handleUploadError` if unsuccessful (type/size issues).

    // User info should be in req.user from 'protect' middleware
    const {
        title, authors, publicationYear, materialType,
        keywords, category, description,
      } = req.body; // Metadata from form-data text fields

    // --- Verify file was actually processed and available ---
    // This double-checks if Multer middleware successfully provided req.file
    if (!req.file) {
      // This state could be reached if:
      // 1. The client didn't send a file with the name 'materialFile' at all.
      // 2. An unexpected error occurred *before* or *during* Multer processing that wasn't caught.
      // The fileFilter/size errors *should* have been caught by `handleUploadError`.
      console.warn('[UPLOAD] Controller reached but req.file is missing. Client might not have sent file, or pre-Multer error occurred.');
      return res.status(400).json({
            success: false,
            message: 'No file received. Ensure file is attached with field name "materialFile".'
      });
    }

    // --- At this point, Multer has saved the file to disk in UPLOAD_DIRECTORY ---
    // req.file contains details: filename (unique), originalname, mimetype, size, path etc.
    console.log("[UPLOAD] Multer processed successfully. File info:", req.file);
    console.log("[UPLOAD] Received body data:", req.body);


    try {
      // --- Prepare data for MongoDB ---
      const materialData = {
        title,
        authors: parseToArray(authors),
        publicationYear: publicationYear ? Number(publicationYear) : undefined,
        materialType,
        keywords: parseToArray(keywords).map(k => k.toLowerCase()),
        category: category ? category.trim() : undefined,
        description: description ? description.trim() : undefined,
        uploadedBy: req.user._id,
        fileName: req.file.originalname, // Original filename for user display
        filePath: req.file.filename,     // ** Unique filename generated by Multer (stored on disk) **
        fileMimeType: req.file.mimetype,
      };

      console.log("[UPLOAD] Prepared data for database:", materialData);


      // --- Save metadata to Database ---
      const material = await Material.create(materialData);
      console.log("[UPLOAD] Successfully saved material metadata to DB. ID:", material._id);


      // --- Send Success Response ---
      res.status(201).json({
        success: true,
        message: 'Material uploaded and metadata saved successfully!',
        material: { // Return essential info
           _id: material._id,
           title: material.title,
           filePath: material.filePath, // Path needed for frontend to build download URL
           uploadedAt: material.createdAt,
        }
      });

    } catch (error) {
      // --- Handle Errors During DATABASE Save ---
      console.error("!!! [UPLOAD] Error saving material metadata to DB:", error);

      // *** Attempt to Clean Up Uploaded File if DB Save Fails ***
      // This is important to prevent orphaned files (files on disk without DB record)
      if (req.file && req.file.filename) {
          // Construct the full path to the file Multer saved
          const orphanedFilePath = path.join(UPLOAD_DIRECTORY, req.file.filename);
          console.log(`[UPLOAD - ERROR] Attempting to clean up potentially orphaned file: ${orphanedFilePath}`);
          // Use fs.unlink to delete the file asynchronously
          fs.unlink(orphanedFilePath, (unlinkErr) => {
              if (unlinkErr) {
                   // Log cleanup error, but proceed with sending the primary error response
                   console.error(`!!! [UPLOAD - ERROR] FAILED to clean up orphaned file ${orphanedFilePath}:`, unlinkErr);
              } else {
                   console.log(`[UPLOAD - ERROR] Successfully cleaned up orphaned file: ${orphanedFilePath}`);
              }
           });
       }
      // *** End Cleanup Logic ***


      // --- Send Error Response ---
      // Check for Mongoose validation errors first
      if (error.name === 'ValidationError') {
           return res.status(400).json({ success: false, message: `Database Validation Error: ${error.message}` });
      }
      // Otherwise, send a generic server error
      res.status(500).json({ success: false, message: 'Server error saving material metadata.' });
    }
};

// NOTE: getMaterials and deleteMaterial are omitted here for focus,
// but should be included in your actual file.
const deleteMaterial = async (req, res) => {
    // ... (Keep your existing deleteMaterial function with fixes) ...
     try {
         const materialId = req.params.id;
         const loggedInUser = req.user;
         const material = await Material.findById(materialId);
         if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
         const isAdmin = loggedInUser.role === 'admin';
         const isOwner = material.uploadedBy.toString() === loggedInUser._id.toString();
         if (!isAdmin && !isOwner) return res.status(403).json({ success: false, message: 'User not authorized to delete this material' });
         const uploadsDir = path.resolve(__dirname, '..', 'uploads'); // Consistent path resolution
         const filePathOnDisk = path.join(uploadsDir, material.filePath);
         const deletedMaterial = await Material.findByIdAndDelete(materialId);
         if (!deletedMaterial) return res.status(404).json({ success: false, message: 'Material not found during delete operation.' });
         fs.unlink(filePathOnDisk, (err) => {
            if (err) console.error(`!!! [DELETE] Error deleting file ${filePathOnDisk}:`, err);
            else console.log(`[DELETE] Successfully deleted physical file: ${filePathOnDisk}`);
         });
         res.status(200).json({ success: true, message: 'Material deleted successfully', data: deletedMaterial });
     } catch (error) {
         console.error("!!! [DELETE] Delete Material Error:", error);
         if (error.name === 'CastError') return res.status(400).json({ success: false, message: `Invalid material ID format: ${req.params.id}` });
         res.status(500).json({ success: false, message: 'Server error during material deletion.' });
     }
};
const getMaterials = async (req, res) => {
    console.log('\n--- [DEBUG] GET /api/materials Route Hit ---'); // Log start
    try {
        // --- Log Raw Query Parameters ---
        console.log('[DEBUG] Received Raw Query Params:', req.query);

        // --- Use api-query-params ---
        // aqpFilter will contain filters based on fields other than 'keyword'
        const { filter: aqpFilter, skip, limit, sort, projection } = aqp(req.query, {
             // *** Tell aqp to IGNORE 'keyword' so we can handle it manually ***
             blacklist: ['keyword'],
             casters: {
                  insensitive: val => ({ $regex: `^${val}$`, $options: 'i' })
             },
             castParams: {
                  category: 'insensitive', // Apply case-insensitive caster to category
                  // Add others here if needed, e.g., materialType: 'insensitive'
             },
             // Optional: whitelist: [...]
        });

        // Initialize the final filter object, starting with filters from aqp
        let finalFilter = { ...aqpFilter }; // Clone to avoid modifying aqpFilter directly
        console.log('[DEBUG] Filter object AFTER api-query-params processing (excludes keyword):', JSON.stringify(finalFilter, null, 2));


        // --- START: Manual Keyword Search Logic using Regex ---
        if (req.query.keyword && typeof req.query.keyword === 'string' && req.query.keyword.trim() !== '') {
            const searchKeyword = req.query.keyword.trim();
            console.log(`[DEBUG] Manual keyword search initiated for: "${searchKeyword}"`);

            // Escape special regex characters from user input to prevent errors/injection
            const escapedKeyword = searchKeyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const regex = new RegExp(escapedKeyword, 'i'); // 'i' for case-insensitive search
            console.log(`[DEBUG] Regex created: ${regex}`);

            // Define the $or condition block for fields to search within
            const regexConditions = {
                $or: [
                    { title: regex },
                    { description: regex },
                    { keywords: regex },    // Searches within the 'keywords' array elements
                    { authors: regex },     // Searches within the 'authors' array elements
                    { category: regex }     // Also search category text with the keyword
                ]
            };
            console.log('[DEBUG] Regex $or conditions prepared:', JSON.stringify(regexConditions, null, 2));

            // Combine the regex search with existing filters from aqp
            const aqpHasFilters = Object.keys(aqpFilter).length > 0;

            if (aqpHasFilters) {
                 console.log('[DEBUG] Combining AQP filters with Keyword Regex search using $and.');
                 // Use $and to ensure both sets of conditions must be met
                 finalFilter = {
                      $and: [
                           aqpFilter,       // Existing filters (e.g., category, year)
                           regexConditions  // Keyword search across multiple fields
                      ]
                 };
            } else {
                 console.log('[DEBUG] No other AQP filters, using only Keyword Regex search conditions.');
                 // If no other filters, the final filter is just the regex conditions
                 finalFilter = regexConditions;
            }
        } else {
             console.log('[DEBUG] No valid keyword parameter detected for manual search.');
        }
        // --- END: Manual Keyword Search Logic ---


        // --- Log Final Filter Object Before DB Query ---
        console.log('>>> [DEBUG] FINAL Filter Object Sent to MongoDB:', JSON.stringify(finalFilter, null, 2));


        // --- Apply Defaults for Pagination ---
        const finalLimit = limit && limit > 0 ? limit : 10;
        const finalSkip = skip >= 0 ? skip : 0;
        console.log(`[DEBUG] Pagination: finalSkip=${finalSkip}, finalLimit=${finalLimit}`);
        console.log(`[DEBUG] Sorting:`, sort || '(default -createdAt)');
        console.log(`[DEBUG] Projection:`, projection || '(default - all fields)');

        // --- Determine Final Sort Order ---
        // aqp returns sort object { field: 1/-1 }. Use it or default to '-createdAt'
        const finalSort = sort && Object.keys(sort).length > 0 ? sort : { createdAt: -1 };


        // --- Execute Count Query ---
        console.log('[DEBUG] Executing countDocuments query...');
        const totalMaterials = await Material.countDocuments(finalFilter);
        console.log(`<<< [DEBUG] countDocuments Result: ${totalMaterials}`);

        // --- Execute Find Query ---
        console.log('[DEBUG] Executing find query...');
        const materialsQuery = Material.find(finalFilter)
          .sort(finalSort)      // Use determined sort order
          .skip(finalSkip)
          .limit(finalLimit)
          .select(projection);  // Apply projection if provided by aqp

        // Optionally add populate here
        // .populate('uploadedBy', 'name email');

        const materials = await materialsQuery;
        console.log(`<<< [DEBUG] find Query Result Length (current page): ${materials.length}`);


        // --- Calculate Pagination Details ---
        const totalPages = Math.ceil(totalMaterials / finalLimit);
        const currentPage = Math.floor(finalSkip / finalLimit) + 1;
        const pagination = {
            currentPage: currentPage, totalPages: totalPages, totalItems: totalMaterials,
            itemsPerPage: finalLimit, nextPage: (currentPage < totalPages) ? currentPage + 1 : null,
            prevPage: currentPage > 1 ? currentPage - 1 : null
        };
        console.log('[DEBUG] Calculated Pagination:', pagination);


        // --- Send Successful Response ---
        const responseJson = { success: true, count: materials.length, pagination: pagination, data: materials };
        console.log('--- [DEBUG] Sending success response. ---');
        res.status(200).json(responseJson);

    } catch (error) {
        console.error("!!! [DEBUG] ERROR in getMaterials:", error);
        res.status(500).json({ success: false, message: "Server error retrieving materials." });
    }
};


module.exports = {
    uploadMaterial,
    getMaterials, // Add back if using the combined file
     deleteMaterial // Add back if using the combined file
};