const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// REGISTER USER
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: 'Username & password required' });

    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ error: 'User already exists' });

    const hash = await bcrypt.hash(password, 10);

    const user = new User({ username, password: hash });
    await user.save();

    res.json({ success: true, message: 'User created' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// LOGIN USER
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Wrong password' });

    const payload = { id: user._id, username: user.username, displayName: user.displayName, role: 'user' };

    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' } // Access token có thời hạn 1 ngày
    );
    const refreshToken = jwt.sign(
      { id: user._id, username: user.username, displayName: user.displayName, role: 'user' },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' } // Refresh token có thời hạn 7 ngày
    );

    res.json({ success: true, accessToken, refreshToken, user: payload });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// GOOGLE LOGIN
exports.googleLogin = async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { name, email, sub: googleId } = ticket.getPayload();

    let user = await User.findOne({ googleId });

    if (!user) {
      // If user doesn't exist, check if an account with that email already exists
      const existingUser = await User.findOne({ username: email });
      if (existingUser) {
        return res.status(400).json({ error: 'An account with this email already exists. Please log in with your password.' });
      }

      // Create a new user
      user = new User({
        username: email, // Use email as username
        googleId: googleId,
      });
      await user.save();
    }

    // Create JWT for our application
    const payload = { id: user._id, username: user.username, displayName: user.displayName, role: 'user' };
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    const refreshToken = jwt.sign(
      { id: user._id, username: user.username, displayName: user.displayName, role: 'user' },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ success: true, accessToken, refreshToken, user: payload });
  } catch (err) {
    res.status(401).json({ error: 'Invalid Google token' });
  }
};

// REFRESH TOKEN
exports.refreshToken = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const payload = { id: decoded.id, username: decoded.username, displayName: decoded.displayName, role: decoded.role };

    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ success: true, accessToken });
  } catch (err) {
    return res.status(403).json({ error: 'Invalid refresh token' });
  }
};

// GET CURRENT USER PROFILE
exports.getProfile = async (req, res) => {
  // req.user is populated by the verifyToken middleware
  const user = await User.findById(req.user.id).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
};

// ADMIN ONLY — GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('urls');
    res.json(users);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ADMIN OR SELF — GET USER BY ID
exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
};

// ADMIN OR SELF — UPDATE USER
exports.updateUser = async (req, res) => {
  const { displayName, password } = req.body; // Removed username from destructuring to prevent update
  let update = {};

  if (displayName !== undefined) update.displayName = displayName;
  if (password) update.password = await bcrypt.hash(password, 10);

  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
  res.json({ success: true, user });
};

// ADMIN ONLY — DELETE USER
exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'User deleted' });
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await user.remove(); // This will trigger the pre-remove hook in User model
    res.json({ success: true, message: 'User and their links deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
