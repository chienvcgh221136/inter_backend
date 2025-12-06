const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const { verifyToken, verifyAdmin, verifySelfOrAdmin } = require('../middleware/auth');

// public routes (register/login) - nếu đã có ở controller, giữ nguyên
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/refresh-token', userController.refreshToken);
router.post('/google-login', userController.googleLogin); // New route for Google login

// protected routes
router.get('/me', verifyToken, userController.getProfile); // Get current user profile
router.get('/', verifyToken, verifyAdmin, userController.getAllUsers); // admin only
router.get('/:id', verifyToken, verifySelfOrAdmin, userController.getUserById); // self or admin
router.put('/:id', verifyToken, verifySelfOrAdmin, userController.updateUser); // self or admin
router.delete('/:id', verifyToken, verifyAdmin, userController.deleteUser); // admin only

module.exports = router;
