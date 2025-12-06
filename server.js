const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

const allowedOrigins = [
  'http://localhost:8080', // For local development
  'https://interfrontend.vercel.app/' // <-- THAY BẰNG URL FRONTEND CỦA BẠN
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

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error('FATAL ERROR: MONGO_URI is not defined in .env file.');
  process.exit(1); // Thoát ứng dụng nếu không có MONGO_URI
}

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
