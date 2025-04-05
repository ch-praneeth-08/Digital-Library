// middleware/validateRequest.js
const { ZodError } = require('zod');

const validateRequest = (schema) => async (req, res, next) => {
  try {
    // Parse the entire request (body, query, params) against the provided schema
    await schema.parseAsync({
      body: req.body ?? {},
      query: req.query ?? {},
      params: req.params ?? {},
    });
    // If validation is successful, move to the next middleware/controller
    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      // If it's a Zod validation error, format it for the response
      const errorMessages = error.errors.map((err) => ({
        field: err.path.join('.'), // e.g., 'body.email' or 'query.page'
        message: err.message,
      }));
      console.error('Zod Validation Error:', JSON.stringify(errorMessages, null, 2));
      return res.status(400).json({
        message: "Validation failed",
        errors: errorMessages,
      });
    } else {
      // Handle other unexpected errors during the validation process
      console.error('Unexpected Middleware Error:', error);
      return res.status(500).json({ message: 'Internal Server Error during request validation' });
    }
  }
};

module.exports = validateRequest;