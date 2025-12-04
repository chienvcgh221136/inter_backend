const express = require('express');
const router = express.Router();
const urlController = require('../controllers/UrlController');

router.post('/shorten', urlController.shortenUrl);
router.post('/custom', urlController.createCustomUrl);
router.get('/', urlController.getAllUrls);
router.delete('/:id', urlController.deleteUrl);

module.exports = router;
