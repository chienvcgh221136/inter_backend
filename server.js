const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: 'http://localhost:8080', // <-- Sửa lại cho đúng URL của frontend
  credentials: true, // Cho phép gửi cookie
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
const urlRoutes = require('./routes/urlRoutes');
const { redirectUrl } = require('./controllers/UrlController');
app.use('/api/url', urlRoutes);

const adminRoutes = require('./routes/AdminRoutes');
app.use('/api/admin', adminRoutes);

const userRoutes = require('./routes/UserRoutes');
app.use('/api/user', userRoutes);


// Redirect handler
app.get('/:code', redirectUrl);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
