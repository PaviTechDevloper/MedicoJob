const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Catch-all logger to debug 404s
app.use((req, res, next) => {
  console.log(`[MATCH] ${req.method} ${req.url}`);
  next();
});

// FIXED: Matching service uses multiple connections to stay integrated
const userConn = mongoose.createConnection(process.env.MONGO_URI_USER);
const jobConn = mongoose.createConnection(process.env.MONGO_URI_JOB);

userConn.on('connected', () => console.log('[MATCH] Connected to User DB'));
userConn.on('error', (err) => console.error('[MATCH] User DB Connection Error:', err));

jobConn.on('connected', () => console.log('[MATCH] Connected to Job DB'));
jobConn.on('error', (err) => console.error('[MATCH] Job DB Connection Error:', err));

const userSchema = new mongoose.Schema({ 
  name: String, 
  role: String, 
  specialization: String,
  skills: [String],
  preferredLocations: [String]
}, { strict: false });

const jobSchema = new mongoose.Schema({
  title: String,
  specialization: String,
  status: String,
  location: String,
  salary: Number
}, { strict: false });

const User = userConn.model('User', userSchema);
const Job = jobConn.model('Job', jobSchema);

// Explicitly handle both /match/jobs/:userId and potentially truncated or missing slashes
app.get('/match/jobs/:userId', async (req, res) => {
  console.log(`[MATCH] Matching jobs for user: ${req.params.userId}`);
  try {
    const { userId } = req.params;
    
    // 1. Fetch user details
    const user = await User.findById(userId);
    
    if (!user) {
      console.warn(`[MATCH] User ${userId} not found in user-service DB`);
      return res.json([]); // Return empty list instead of 404
    }

    // 2. Fetch all open jobs
    const jobs = await Job.find({ status: 'open' });

    // 3. Matching logic
    const matches = jobs.map(job => {
      let score = 0;
      if (job.specialization?.toLowerCase() === user.specialization?.toLowerCase()) score += 60;
      if (user.preferredLocations?.some(loc => job.location?.toLowerCase().includes(loc.toLowerCase()))) score += 30;
      const jobLower = (job.title + job.specialization).toLowerCase();
      const skillMatches = user.skills?.filter(skill => jobLower.includes(skill.toLowerCase()));
      if (skillMatches?.length > 0) score += (skillMatches.length * 5);

      return { ...job.toObject(), matchScore: score };
    }).filter(m => m.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json(matches);
  } catch (error) {
    console.error('[MATCH] Match Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Final catch-all for anything else to Port 5003
app.use((req, res) => {
  console.error(`[MATCH] 404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found in Matching Service', url: req.url });
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`Matching Service running on port ${PORT}`));
