// models/Request.js
const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    title: { // Title of the requested material
      type: String,
      required: [true, 'Please provide the title of the requested material'],
      trim: true,
    },
    authors: [ // Optional: Authors of the material
        {
            type: String,
            trim: true,
        }
    ],
    publicationYear: { // Optional: Year of publication
        type: Number,
    },
    description: { // Reason for request or additional details
         type: String,
         required: [true, 'Please provide a reason or description for your request'],
         trim: true,
    },
    requestedBy: { // User who submitted the request
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'approved', 'rejected', 'fulfilled'], // Allowed statuses
      default: 'pending', // Default status when created
    },
    actionNotes: { // Notes added by admin/faculty when changing status
        type: String,
        trim: true,
    },
    fulfilledMaterial: { // Optional link to the Material document once fulfilled
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Material',
         default: null
    }
    // No timestamps: true here, createdAt is added below explicitly if preferred
    // requestedAt is equivalent to createdAt if timestamps were enabled.
  },
  {
     timestamps: { createdAt: 'requestedAt', updatedAt: true } // Use 'requestedAt' for createdAt field
   }
);

// Index requests by user and status for potentially faster lookups
requestSchema.index({ requestedBy: 1 });
requestSchema.index({ status: 1 });

const Request = mongoose.model('Request', requestSchema);

module.exports = Request;