const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minLength: 5,
  },
  description: {
    type: String,
    required: true,
    minLength: 50,
  },
  photos: [
    {
      type: String, // Store the file paths or other reference
    },
  ],
});

module.exports = mongoose.model("Listing", listingSchema);
