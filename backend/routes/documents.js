const express = require('express');
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
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const DOC_TYPES = [
  'Driving License',
  'Vehicle Registration (Carte Jaune)',
  'Vehicle Insurance',
  'Motor Vehicle Inspection Certificate',
  'National ID',
  'International Driving Permit',
  'Rental Agreement'
];

const router = express.Router();

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required. Only administrators can upload documents.' });
  next();
};

// Get all documents for a driver
router.get('/driver/:driverId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== req.params.driverId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const docs = await Document.find({ driverId: req.params.driverId });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all documents (admin)
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const docs = await Document.find();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add document for a driver (admin only)
router.post('/', auth, adminOnly, upload.single('documentPhoto'), async (req, res) => {
  try {
    const { driverId, documentType, documentNumber, issueDate, expiryDate, issuedBy, paymentCode } = req.body;

    if (!driverId || !documentType) return res.status(400).json({ message: 'Driver ID and document type required' });

    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'user') return res.status(404).json({ message: 'Driver not found' });

    if (!DOC_TYPES.includes(documentType)) {
      return res.status(400).json({ message: 'Invalid document type' });
    }

    const document = new Document({
      driverId,
      driverName: driver.name,
      documentType,
      documentNumber: documentNumber || uuidv4().slice(0, 8).toUpperCase(),
      issueDate: issueDate || new Date().toISOString().split('T')[0],
      expiryDate: expiryDate || '',
      issuedBy: issuedBy || 'Rwanda National Police',
      paymentCode: paymentCode || `RWD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      documentPhoto: req.file ? `/uploads/${req.file.filename}` : null,
      status: 'active'
    });

    await document.save();
    res.status(201).json(document);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update document (admin only)
router.put('/:id', auth, adminOnly, upload.single('documentPhoto'), async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.documentPhoto = `/uploads/${req.file.filename}`;

    const document = await Document.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!document) return res.status(404).json({ message: 'Document not found' });

    res.json(document);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete document (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });
    res.json({ message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get document types
router.get('/types', auth, (req, res) => {
  res.json(DOC_TYPES);
});

module.exports = router;
