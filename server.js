const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

const allowedOrigins = [
  'http://localhost:8080', // For local development
  'https://interfrontend.vercel.app', 
  'https://interfrontend-git-main-chienvcgh221136s-projects.vercel.app/',
  'https://interfrontend-iegb1z76n-chienvcgh221136s-projects.vercel.app/'
  
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Cho phép gửi cookie
}));
app.use(express.json());

// Routes
const urlRoutes = require('./routes/urlRoutes');
const { redirectUrl } = require('./controllers/urlController');
app.use('/api/url', urlRoutes);

const adminRoutes = require('./routes/AdminRoutes');
app.use('/api/admin', adminRoutes);

const userRoutes = require('./routes/UserRoutes');
app.use('/api/user', userRoutes);


// Redirect handler
app.get('/:code', redirectUrl);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('FATAL ERROR: MONGO_URI is not defined in .env file.');
    }
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
