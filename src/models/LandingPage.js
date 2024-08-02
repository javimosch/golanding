const mongoose = require('mongoose');

// Define the LandingPage schema
const landingPageSchema = new mongoose.Schema({
  metadata: {
    type: mongoose.Schema.Types.Mixed, // Can store any type of data
    default:{},
    required: false,
  },
  sections: {
    type: [String], // Array of strings (HTML)
    required: true,
  },
  name: {
    type: String,
    required: true,
    unique: true, // Ensures the name is unique
    index: true,  // Creates an index on the name field
  },
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

// Export the LandingPage model
module.exports = mongoose.model('LandingPage', landingPageSchema);
