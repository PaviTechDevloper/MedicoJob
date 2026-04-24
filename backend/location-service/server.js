const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Location = require('./models/Location');

const app = express();
app.use(cors());
app.use(express.json());

// FIXED: Using correct environment variable
const MONGO_URI = process.env.MONGO_URI_LOCATION || process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('Location Service DB Connected'))
  .catch(err => console.error('Location DB Connection Error:', err));

// Upsert location
app.post('/location', async (req, res) => {
  try {
    const { entityId, entityType, lng, lat } = req.body;
    const location = await Location.findOneAndUpdate(
      { entityId },
      { entityId, entityType, coordinates: { type: 'Point', coordinates: [lng, lat] } },
      { upsert: true, returnDocument: 'after' }
    );
    res.json(location);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/nearby/jobs', async (req, res) => {
  try {
    const { lat, lng, distance = 50000 } = req.query; // default 50km
    const locations = await Location.find({
      entityType: 'job',
      coordinates: {
        $near: {
          $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(distance)
        }
      }
    });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/nearby/doctors', async (req, res) => {
  try {
    const { lat, lng, distance = 50000 } = req.query;
    const locations = await Location.find({
      entityType: 'doctor',
      coordinates: {
        $near: {
          $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(distance)
        }
      }
    });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => console.log(`Location Service running on port ${PORT}`));
