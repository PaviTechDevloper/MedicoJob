const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  entityId: { type: String, required: true, unique: true },
  entityType: { type: String, enum: ['job', 'doctor', 'applicant', 'hospital'], required: true },
  coordinates: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  }
});

locationSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Location', locationSchema);
