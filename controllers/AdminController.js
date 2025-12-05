const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER ADMIN
exports.registerAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: 'Username & password required' });

    const existing = await Admin.findOne({ username });
    if (existing) return res.status(400).json({ error: 'Admin already exists' });

    const hash = await bcrypt.hash(password, 10);

    const admin = new Admin({ username, password: hash });
    await admin.save();

    res.json({ success: true, message: 'Admin created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// LOGIN ADMIN
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(400).json({ error: 'Admin not found' });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(400).json({ error: 'Wrong password' });

    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ success: true, token, role: admin.role, username: admin.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET ALL ADMINS
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password');
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// GET ADMIN BY ID
exports.getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select('-password');
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// UPDATE ADMIN
exports.updateAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    let updateData = {};

    if (username) updateData.username = username;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const admin = await Admin.findByIdAndUpdate(
      req.params.id, updateData, { new: true }
    ).select('-password');

    if (!admin) return res.status(404).json({ error: 'Admin not found' });

    res.json({ success: true, admin });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE ADMIN
exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ error: 'Admin not found' });

    await Admin.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Admin deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
