import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Review from './models/Review.js';

const app = express();
app.disable('x-powered-by');
const allowedOrigins = new Set(
  (process.env.CORS_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean)
);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Origin is not allowed by CORS'));
  },
}));
app.use(express.json());

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`[REP] ${req.method} ${req.url}`, req.body);
  next();
});

const MONGO_URI = process.env.MONGO_URI_REPUTATION || process.env.MONGO_URI;

try {
  await mongoose.connect(MONGO_URI);
  console.log('Reputation Service DB Connected');
} catch (err) {
  console.error('Reputation DB Connection Error:', err);
}

app.post('/reviews', async (req, res) => {
  try {
    const { targetUserId, reviewerId, rating, role } = req.body;
    
    if (!targetUserId || !reviewerId || !rating || !role) {
      return res.status(400).json({ error: 'Missing required fields', received: req.body });
    }
    
    const review = new Review({
      targetUserId,
      reviewerId,
      rating: Number(rating),
      comment: req.body.comment || '',
      role
    });

    await review.save();
    res.status(201).json(review);
  } catch (error) {
    console.error('Review Save Error:', error);
    // Return stack trace to frontend for immediate debugging
    res.status(500).json({ 
      error: error.message, 
      stack: error.stack,
      received: req.body 
    });
  }
});

app.get('/reviews/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ targetUserId: req.params.userId });
    const averageRating = reviews.length > 0 
      ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length 
      : 0;
    res.json({ reviews, averageRating, count: reviews.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5006;
app.listen(PORT, () => console.log(`Reputation Service running on port ${PORT}`));
