const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = (db) => {
  const router = express.Router();

  // Admin only middleware
  const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    next();
  };

  // Get all drivers (admin only)
  router.get('/', auth, adminOnly, (req, res) => {
    const drivers = db.drivers.map(({ password, ...d }) => d);
    res.json(drivers);
  });

  // Get single driver
  router.get('/:id', auth, (req, res) => {
    // Driver can only view their own profile; admin can view all
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const driver = db.drivers.find(d => d.id === req.params.id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    const { password, ...safe } = driver;
    res.json(safe);
  });

  // Add driver (admin only)
  router.post('/', auth, adminOnly, upload.single('photo'), async (req, res) => {
    try {
      const { name, email, password, phone, nationalId, licenseCategory, dateOfBirth, address } = req.body;
      if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, password required' });

      const exists = db.drivers.find(d => d.email === email || d.nationalId === nationalId);
      if (exists) return res.status(409).json({ message: 'Driver with this email or National ID already exists' });

      const hashedPassword = await bcrypt.hash(password, 10);
      const driver = {
        id: uuidv4(),
        name, email,
        password: hashedPassword,
        phone: phone || '',
        nationalId: nationalId || '',
        licenseCategory: licenseCategory || 'B',
        dateOfBirth: dateOfBirth || '',
        address: address || '',
        photo: req.file ? `/uploads/${req.file.filename}` : null,
        role: 'driver',
        createdAt: new Date().toISOString()
      };
      db.drivers.push(driver);
      const { password: pw, ...safe } = driver;
      res.status(201).json(safe);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  // Update driver (admin only)
  router.put('/:id', auth, adminOnly, upload.single('photo'), async (req, res) => {
    try {
      const idx = db.drivers.findIndex(d => d.id === req.params.id);
      if (idx === -1) return res.status(404).json({ message: 'Driver not found' });

      const updates = { ...req.body };
      if (updates.password) updates.password = await bcrypt.hash(updates.password, 10);
      if (req.file) updates.photo = `/uploads/${req.file.filename}`;

      db.drivers[idx] = { ...db.drivers[idx], ...updates };
      const { password, ...safe } = db.drivers[idx];
      res.json(safe);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  // Delete driver (admin only)
  router.delete('/:id', auth, adminOnly, (req, res) => {
    const idx = db.drivers.findIndex(d => d.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Driver not found' });
    db.drivers.splice(idx, 1);
    // Also remove their documents
    db.documents = db.documents.filter(doc => doc.driverId !== req.params.id);
    res.json({ message: 'Driver deleted successfully' });
  });

  return router;
};
