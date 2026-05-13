const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'rwanda_drive_secret_2024';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        photo: user.photo || null
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Signup / Register driver
router.post('/signup', async (req, res) => {
  try {
    const { name, email, phone, nationalId, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required' });

    const searchCriteria = [{ email: email.toLowerCase().trim() }];
    if (nationalId) searchCriteria.push({ nationalId: nationalId.trim() });

    const exists = await User.findOne({ $or: searchCriteria });
    if (exists) return res.status(409).json({ message: 'A user with the same email or National ID already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newDriver = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || '',
      nationalId: nationalId ? nationalId.trim() : undefined,
      licenseCategory: 'B',
      dateOfBirth: '',
      address: '',
      photo: null,
      role: 'user'
    });

    await newDriver.save();
    const token = jwt.sign({ id: newDriver.id, role: newDriver.role }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      token,
      user: {
        id: newDriver.id,
        name: newDriver.name,
        email: newDriver.email,
        role: newDriver.role,
        photo: newDriver.photo
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email or national ID already in use' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get current logged-in user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
