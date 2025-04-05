// validations/userValidation.js
const { z } = require('zod');

// Schema for user registration body
const registerBodySchema = z.object({
  name: z.string({
    required_error: 'Name is required',
    invalid_type_error: 'Name must be a string',
  }).min(1, { message: 'Name cannot be empty' }), // Use object for message
  email: z.string({
    required_error: 'Email is required',
  }).email({ message: 'Invalid email format' }),
  password: z.string({
    required_error: 'Password is required',
  }).min(6, { message: 'Password must be at least 6 characters long' }),
  role: z.enum(['student', 'faculty', 'admin', 'public'], {
    errorMap: (issue, ctx) => { // Custom error message for enum
        if (issue.code === 'invalid_enum_value') {
            return { message: 'Invalid role specified. Must be one of: student, faculty, admin, public' };
        }
        return { message: ctx.defaultError };
    }
  }).optional(), // Make role optional, Mongoose schema default handles it
});

// Full schema including body, query, params for registration route
const registerSchema = z.object({
    body: registerBodySchema,
    query: z.object({}), // Define if query params are expected, else empty object
    params: z.object({}) // Define if route params are expected, else empty object
});


// Schema for user login body
const loginBodySchema = z.object({
   email: z.string({
     required_error: 'Email is required',
   }).email({ message: 'Invalid email format' }),
   password: z.string({
     required_error: 'Password is required',
   }).min(1, { message: 'Password cannot be empty' }), // Check for non-empty password
});

// Full schema including body, query, params for login route
const loginSchema = z.object({
    body: loginBodySchema,
    query: z.object({}),
    params: z.object({})
});


module.exports = {
  registerSchema, // Export the full schema
  loginSchema,   // Export the full schema
};