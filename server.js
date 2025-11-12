const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

const app = express();

// Middleware
// CORS configuration - allows frontend URL from environment or localhost in development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      process.env.APP_URL,
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ].filter(Boolean); // Remove undefined values
    
    // Check if origin is in allowed list or matches pattern
    if (allowedOrigins.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // for JWT authentication
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 3600, // 1 hour, 60s in dev.
};

app.use(cors(corsOptions));

app.use(express.json());// lets express understand json, otherwise req.body would be undefined.

// Serve static files (memes images)
app.use('/uploads', express.static('./public/uploads'));

// Routes
app.use('/api/auth', require('./routes/auth-route'));
app.use('/api/onboarding', require('./routes/onboarding'));
app.use('/api/dashboard', require('./routes/dashboard/dashboard'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/profile', require('./routes/profile'));


mongoose.connect(process.env.MONGODB_URI )
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

