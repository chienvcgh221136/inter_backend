// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { nanoid } = require('nanoid');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import model
const Url = require('./models/Url');

// Tạo link rút gọn ngẫu nhiên
app.post('/api/url/shorten', async (req, res) => {
  const { originalUrl } = req.body;
  
  if (!originalUrl) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // Tạo mã ngẫu nhiên 6 ký tự
    const shortCode = nanoid(6);
    
    const url = new Url({
      originalUrl,
      shortCode,
    });

    await url.save();

    return res.json({
      success: true,
      shortUrl: `${process.env.BASE_URL}/${shortCode}`,
      shortCode
    });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Tạo link rút gọn tùy chỉnh
app.post('/api/url/custom', async (req, res) => {
  const { originalUrl, customCode } = req.body;
  
  if (!originalUrl || !customCode) {
    return res.status(400).json({ error: 'URL and custom code are required' });
  }

  try {
    // Kiểm tra xem mã tùy chỉnh đã tồn tại chưa
    const existingUrl = await Url.findOne({ shortCode: customCode });
    if (existingUrl) {
      return res.status(400).json({ error: 'Custom code already in use' });
    }
    
    const url = new Url({
      originalUrl,
      shortCode: customCode,
    });

    await url.save();

    return res.json({
      success: true,
      shortUrl: `${process.env.BASE_URL}/${customCode}`,
      shortCode: customCode
    });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Lấy danh sách URL
app.get('/api/urls', async (req, res) => {
  try {
    const urls = await Url.find().sort({ createdAt: -1 });
    res.json(urls);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Chuyển hướng URL
app.get('/:code', async (req, res) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.code });
    
    if (!url) {
      return res.status(404).json({ error: 'No URL found' });
    }

    // Tăng số lượt click
    url.clicks++;
    await url.save();

    // Chuyển hướng đến URL gốc
    return res.redirect(url.originalUrl);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Xóa URL
app.delete('/api/url/:id', async (req, res) => {
  try {
    const url = await Url.findById(req.params.id);
    
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    await Url.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'URL deleted successfully' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));