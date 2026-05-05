const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'rwanda_drive_secret_2024';

module.exports = (db) => {
  const router = express.Router();

  // Login
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

      // Check admin users first
      let user = db.users.find(u => u.email === email);
      let role = 'admin';

      // Check drivers
      if (!user) {
        user = db.drivers.find(d => d.email === email);
        role = 'driver';
      }

      if (!user) return res.status(401).json({ message: 'Invalid credentials' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

      const token = jwt.sign({ id: user.id, role: user.role || role }, JWT_SECRET, { expiresIn: '24h' });

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || role,
          photo: user.photo || null
        }
      });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  // Get current user
  router.get('/me', require('../middleware/auth'), (req, res) => {
    const user = db.users.find(u => u.id === req.user.id) || db.drivers.find(d => d.id === req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { password, ...safeUser } = user;
    res.json(safeUser);
  });

  return router;
};
