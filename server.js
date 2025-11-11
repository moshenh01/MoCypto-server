const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

const app = express();

// CORS configuration - CRITICAL: Must include OPTIONS and handle preflight
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      process.env.APP_URL,
      'https://mo-cypto-client.vercel.app', // TEMPORARY - hardcode to fix CORS
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ].filter(Boolean);
    
    console.log('CORS Origin Check:', origin);
    console.log('Allowed Origins:', allowedOrigins);
    
    if (allowedOrigins.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      callback(null, true);
    } else {
      callback(null, false); // Use false, NOT Error
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // CRITICAL: Must include OPTIONS
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
  optionsSuccessStatus: 200
};

// CRITICAL: Handle OPTIONS requests FIRST, before CORS middleware
app.options('*', (req, res) => {
  console.log('OPTIONS request received:', req.path);
  console.log('Origin:', req.headers.origin);
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  res.sendStatus(200);
});

// Apply CORS middleware
app.use(cors(corsOptions));

app.use(express.json());

// Serve static files
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
