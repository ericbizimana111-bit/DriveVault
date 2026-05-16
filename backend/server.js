const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL;

if (!MONGO_URI) {
  console.error('Missing MONGO_URI in environment. Please set it in backend/.env');
  process.exit(1);
}

const seedAdminUser = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@rwandadrive.rw';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const adminName = process.env.ADMIN_NAME || 'System Administrator';

  const existingAdmin = await User.findOne({ role: 'admin' });
  if (existingAdmin) {
    console.log('Admin user already exists:', existingAdmin.email);
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const admin = new User({
    name: adminName,
    email: adminEmail.toLowerCase().trim(),
    password: hashedPassword,
    role: 'admin'
  });

  await admin.save();
  console.log(`Admin user created: ${adminEmail}`);
};

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    await seedAdminUser();
  })
  .catch(err => {
    console.error('DB Error:', err);
    process.exit(1);
  });


// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Routes
const authRouter = require('./routes/auth');
const driverRouter = require('./routes/drivers');
const docRouter = require('./routes/documents');

app.use('/api/auth', authRouter);
app.use('/api/drivers', driverRouter);
app.use('/api/documents', docRouter);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Rwanda Drive API running' }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve admin SPA at /admin route with fallback for nested routes
app.use('/admin', express.static(path.join(__dirname, '../admin/dist'), { index: false }));
app.get(/^\/admin/, (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/dist/index.html'));
});

// Serve frontend app
app.use(express.static(path.join(__dirname, '../frontend/dist'), { index: false }));

// Catch-all handler for frontend SPA
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚗 Rwanda Drive Backend running on port ${PORT}`);
});

module.exports = app;
