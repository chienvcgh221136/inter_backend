const express = require('express');
const router = express.Router();

const urlController = require('../controllers/UrlController');
const { verifyToken } = require('../middleware/auth');

// protected user routes
router.post('/shorten', verifyToken, urlController.shortenUrl);
router.post('/custom', verifyToken, urlController.createCustomUrl);
router.get('/', verifyToken, urlController.getAllUrls);
router.delete('/:id', verifyToken, urlController.deleteUrl);

module.exports = router;
