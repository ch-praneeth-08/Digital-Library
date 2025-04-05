// validations/materialValidation.js
const { z } = require('zod');

// Schema for the metadata (body) expected during material upload
const materialUploadBodySchema = z.object({
    title: z.string({ required_error: 'Title is required' }).min(3, 'Title must be at least 3 characters'),
    authors: z.union([
        z.string().optional(), // Allow comma-separated string
        z.array(z.string()).optional() // Allow array of strings
      ]).transform(val => { // Normalize to array or undefined
        if (typeof val === 'string') {
            return val.split(',').map(s => s.trim()).filter(Boolean);
        }
        return val?.filter(Boolean); // Handle potential null/empty strings in array
      }).optional(),
    publicationYear: z.preprocess( // Preprocess to handle string input for year
        (val) => (typeof val === 'string' && val.trim() !== '' ? parseInt(val.trim(), 10) : val),
        z.number({ invalid_type_error: 'Publication year must be a number' })
          .int('Publication year must be an integer')
          .min(1000, 'Publication year seems too old')
          .max(new Date().getFullYear() + 1, 'Publication year cannot be in the far future')
          .optional()
    ),
    materialType: z.enum(['research_paper', 'book', 'course_material', 'thesis', 'other'], {
         required_error: 'Material type is required',
         invalid_type_error: 'Invalid material type'
    }),
    keywords: z.union([
        z.string().optional(),
        z.array(z.string()).optional()
    ]).transform(val => {
        if (typeof val === 'string') {
            return val.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
        }
        return val?.map(s => s.trim().toLowerCase()).filter(Boolean); // Normalize keywords to lowercase array
    }).optional(),
    category: z.string().trim().optional(),
    description: z.string().trim().optional(),
});

// Combined schema for the route
const materialUploadSchema = z.object({
    body: materialUploadBodySchema,
    query: z.object({}),
    params: z.object({})
    // NOTE: We don't validate req.file here with Zod, Multer handles file presence/type/size.
});

const materialQuerySchema = z.object({
    body: z.object({}), // GET requests don't typically have bodies
    params: z.object({}),// No route params for this endpoint
    query: z.object({
      // --- Search ---
      keyword: z.string().optional(), // Search term
  
      // --- Filters ---
      materialType: z.enum(['research_paper', 'book', 'course_material', 'thesis', 'other']).optional(),
      category: z.string().optional(),
      publicationYear: z.preprocess(
          (val) => (typeof val === 'string' && val.trim() !== '' ? parseInt(val.trim(), 10) : val),
           z.number().int().positive().optional()
          ).optional(), // Allow single year for filtering
      // Add more specific filters if needed (e.g., author)
  
      // --- Sorting ---
      sort: z.string().regex(/^-?[a-zA-Z]+(,-?[a-zA-Z]+)*$/, { // Allow fields and commas, optionally prefixed with -
          message: "Sort parameter should be comma-separated fields, optionally prefixed with '-' for descending order."
      }).optional(),
  
      // --- Pagination ---
      page: z.preprocess(
           (val) => (typeof val === 'string' && val.trim() !== '' ? parseInt(val.trim(), 10) : val),
            z.number().int().positive({ message: 'Page must be a positive integer' }).optional()
          ).default('1'), // Default page to 1 if not provided
      limit: z.preprocess(
            (val) => (typeof val === 'string' && val.trim() !== '' ? parseInt(val.trim(), 10) : val),
             z.number().int().positive({ message: 'Limit must be a positive integer' }).max(100, { message: 'Limit cannot exceed 100' }).optional() // Max limit
          ).default('10'), // Default limit to 10
    }),
  });
  
  
  module.exports = {
      materialUploadSchema,
      materialQuerySchema, // Export the new query schema
  };