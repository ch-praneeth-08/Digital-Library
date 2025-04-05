// models/Material.js
const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Material title is required'],
      trim: true, // Remove whitespace from ends
    },
    authors: [ // Allow multiple authors
      {
        type: String,
        trim: true,
      }
    ],
    publicationYear: {
      type: Number,
      // Basic validation, can be made more strict if needed
      min: [1000, 'Publication year seems too old'],
      max: [new Date().getFullYear() + 1, 'Publication year cannot be in the far future'] // Allow current year + 1
    },
    materialType: {
      type: String,
      required: [true, 'Material type is required'],
      enum: ['research_paper', 'book', 'course_material', 'thesis', 'other'], // Define allowed types
      default: 'other',
    },
    keywords: [ // For searchability
         {
            type: String,
            trim: true,
            lowercase: true
        }
    ],
    category: { // e.g., 'Computer Science', 'Physics', 'Literature'
         type: String,
         trim: true,
         // You might want to create a separate Category model later for consistency
    },
    description: { // Optional description or abstract
         type: String,
         trim: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId, // Link to the User who uploaded it
      required: true,
      ref: 'User', // Reference the 'User' model
    },
    fileName: { // Original name of the uploaded file
      type: String,
      required: true,
    },
    filePath: { // Path where the file is stored (relative to uploads directory)
      type: String,
      required: true,
    },
    fileMimeType: { // Mime type of the uploaded file (e.g., 'application/pdf')
        type: String,
        required: true,
    },
    
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// Optional: Add indexes for frequently searched fields
materialSchema.index({ title: 'text', keywords: 'text', description: 'text' }); // For text search
materialSchema.index({ category: 1 });
materialSchema.index({ materialType: 1 });
materialSchema.index({ publicationYear: 1 });


const Material = mongoose.model('Material', materialSchema);

module.exports = Material;