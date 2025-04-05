// validations/requestValidation.js
const { z } = require('zod');

// Schema for creating a request
const createRequestSchema = z.object({
    body: z.object({
        title: z.string({required_error: "Title is required"}).min(3, "Title must be at least 3 characters"),
        authors: z.union([z.string(), z.array(z.string())]).optional()
                 .transform(val => { // Normalize to array or undefined
                     if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
                     return val?.filter(Boolean);
                  }),
        publicationYear: z.preprocess( // Allow string input for year
                     (val) => (typeof val === 'string' && val.trim() !== '' ? parseInt(val.trim(), 10) : val),
                      z.number().int().positive().optional()
                    ).optional(),
         description: z.string({required_error: "Description is required"}).min(10, "Description must be at least 10 characters"),
    }),
    query: z.object({}),
    params: z.object({}),
});

// Schema for updating request status
const updateRequestStatusSchema = z.object({
     body: z.object({
         status: z.enum(['approved', 'rejected', 'fulfilled'], { // Allowed statuses for update
             required_error: 'Status is required (approved, rejected, or fulfilled)',
             invalid_type_error: 'Invalid status value',
         }),
         actionNotes: z.string().trim().optional(),
         fulfilledMaterialId: z.string() // Validate if it's a valid ObjectId format
             .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Material ID format') // Basic ObjectId check
             .optional(),
     }),
    query: z.object({}),
    params: z.object({ // Validate the route parameter ':id'
         id: z.string({required_error: "Request ID parameter is required"})
                .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Request ID format'), // Basic ObjectId check
    }),
});

module.exports = {
    createRequestSchema,
    updateRequestStatusSchema,
};