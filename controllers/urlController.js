const Url = require('../models/urlModels');
const { nanoid } = require('nanoid');

exports.shortenUrl = async (req, res) => {
  const { originalUrl } = req.body;
  if (!originalUrl) return res.status(400).json({ error: 'URL is required' });

  try {
    const shortCode = nanoid(6);
    const url = new Url({ originalUrl, shortCode });
    await url.save();
    res.json({ success: true, shortUrl: `${process.env.BASE_URL}/${shortCode}`, shortCode });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createCustomUrl = async (req, res) => {
  const { originalUrl, customCode } = req.body;
  if (!originalUrl || !customCode) return res.status(400).json({ error: 'URL and custom code are required' });

  try {
    const existingUrl = await Url.findOne({ shortCode: customCode });
    if (existingUrl) return res.status(400).json({ error: 'Custom code already in use' });

    const url = new Url({ originalUrl, shortCode: customCode });
    await url.save();
    res.json({ success: true, shortUrl: `${process.env.BASE_URL}/${customCode}`, shortCode: customCode });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllUrls = async (req, res) => {
  try {
    const urls = await Url.find().sort({ createdAt: -1 });
    res.json(urls);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.redirectUrl = async (req, res) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.code });
    if (!url) return res.status(404).json({ error: 'No URL found' });

    url.clicks++;
    await url.save();
    res.redirect(url.originalUrl);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteUrl = async (req, res) => {
  try {
    const url = await Url.findById(req.params.id);
    if (!url) return res.status(404).json({ error: 'URL not found' });

    await Url.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'URL deleted successfully' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

