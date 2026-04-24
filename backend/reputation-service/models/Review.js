const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  targetUserId: { type: String, required: true }, // Doctor or Hospital being reviewed
  reviewerId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  role: { type: String, enum: ['doctor', 'hospital'], required: true } // Role of the person being reviewed
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
