const express = require('express');
const router = express.Router();

const adminController = require('../controllers/AdminController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// public admin register/login if you allow (be careful)
// Usually register admin is disabled in production; keep it for testing
router.post('/register', adminController.registerAdmin);
router.post('/login', adminController.loginAdmin);

// protected admin-only CRUD routes
router.get('/', verifyToken, verifyAdmin, adminController.getAllAdmins);
router.get('/:id', verifyToken, verifyAdmin, adminController.getAdminById);
router.put('/:id', verifyToken, verifyAdmin, adminController.updateAdmin);
router.delete('/:id', verifyToken, verifyAdmin, adminController.deleteAdmin);

module.exports = router;
