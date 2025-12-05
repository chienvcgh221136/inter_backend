const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

    const token = jwt.sign(
      { id: user._id, username: user.username, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ success: true, token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ADMIN ONLY — GET ALL USERS
exports.getAllUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
};

// ADMIN OR SELF — GET USER BY ID
exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
};

// ADMIN OR SELF — UPDATE USER
exports.updateUser = async (req, res) => {
  const { username, password } = req.body;
  let update = {};

  if (username) update.username = username;
  if (password) update.password = await bcrypt.hash(password, 10);

  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
  res.json({ success: true, user });
};

// ADMIN ONLY — DELETE USER
exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'User deleted' });
};
