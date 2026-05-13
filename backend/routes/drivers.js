const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Document = require('../models/Document');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
};

// Get all drivers (admin only)
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const drivers = await User.find({ role: 'user' }).select('-password');
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get single driver
router.get('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const driver = await User.findById(req.params.id).select('-password');
    if (!driver || driver.role !== 'user') return res.status(404).json({ message: 'Driver not found' });

    res.json(driver);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update driver profile (driver can update own, admin can update any)
router.put('/:id/profile', auth, upload.single('photo'), async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = { ...req.body };
    if (req.file) updates.photo = `/uploads/${req.file.filename}`;
    if (updates.password) updates.password = await bcrypt.hash(updates.password, 10);

    const driver = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    res.json(driver);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email or National ID already in use' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add driver (admin only)
router.post('/', auth, adminOnly, upload.single('photo'), async (req, res) => {
  try {
    const { name, email, password, phone, nationalId, licenseCategory, dateOfBirth, address } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, password required' });

    const searchCriteria = [{ email: email.toLowerCase().trim() }];
    if (nationalId) searchCriteria.push({ nationalId: nationalId.trim() });
    const exists = await User.findOne({ $or: searchCriteria });
    if (exists) return res.status(409).json({ message: 'Driver with this email or National ID already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const driver = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || '',
      nationalId: nationalId ? nationalId.trim() : undefined,
      licenseCategory: licenseCategory || 'B',
      dateOfBirth: dateOfBirth || '',
      address: address || '',
      photo: req.file ? `/uploads/${req.file.filename}` : null,
      role: 'user'
    });

    await driver.save();
    const safeDriver = driver.toObject();
    delete safeDriver.password;
    res.status(201).json(safeDriver);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Driver with this email or National ID already exists' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update driver (admin only)
router.put('/:id', auth, adminOnly, upload.single('photo'), async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.password) updates.password = await bcrypt.hash(updates.password, 10);
    if (req.file) updates.photo = `/uploads/${req.file.filename}`;

    const driver = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    res.json(driver);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email or National ID already exists' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete driver (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const driver = await User.findByIdAndDelete(req.params.id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    await Document.deleteMany({ driverId: req.params.id });
    res.json({ message: 'Driver deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
