const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// In-memory data store (replace with a real DB in production)
const db = {
  users: [
    {
      id: 'admin-001',
      name: 'System Administrator',
      email: 'admin@rwandadrive.rw',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'admin',
      createdAt: new Date().toISOString()
    },

    {
      id: 'user-001',
      name: 'user1',
      email: 'user1@gmail.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'user',
      createdAt: new Date().toISOString()
    }
  ],
  drivers: [],
  documents: []
};

// ========== Auth Routes ==========
const authRouter = require('./routes/auth')(db);
app.use('/api/auth', authRouter);

// ========== Driver Routes ==========
const driverRouter = require('./routes/drivers')(db);
app.use('/api/drivers', driverRouter);

// ========== Document Routes ==========
const docRouter = require('./routes/documents')(db);
app.use('/api/documents', docRouter);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Rwanda Drive API running' }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve admin app
app.use('/admin', express.static(path.join(__dirname, '../admin/dist')));

// Serve frontend app for all other routes
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// SPA fallback handlers - must be middleware, not routes
app.use('/admin', (req, res, next) => {
  // For /admin routes, serve admin SPA
  res.sendFile(path.join(__dirname, '../admin/dist/index.html'));
});

// Catch-all handler for frontend
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚗 Rwanda Drive Backend running on port ${PORT}`);
});

module.exports = app;
