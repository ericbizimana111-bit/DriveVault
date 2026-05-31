const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const csurf = require('csurf');
const { mongoSanitizeMiddleware } = require('./middleware/validation');
require('dotenv').config();
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/driving';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:4173';

if (!MONGO_URI) {
  console.error('Missing MONGO_URI in environment. Please set it in backend/.env');
  process.exit(1);
}

const allowedOrigins = [
  FRONTEND_URL,
  ADMIN_URL,
  'http://localhost:5174',
  'http://localhost:5175'
].filter(Boolean);

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected');
  })
  .catch(err => {
    console.error('DB Error:', err);
    process.exit(1);
  });


// Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS policy does not allow access from origin ${origin}`));
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'Accept', 'X-Requested-With']
}));
app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitizeMiddleware);

const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 3600
  }
});

app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.use('/api', csrfProtection);

app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }
  next(err);
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Routes
const authRouter = require('./routes/auth');
const driverRouter = require('./routes/drivers');
const docRouter = require('./routes/documents');
const messageRouter = require('./routes/messages');
const notificationRouter = require('./routes/notifications');

app.use('/api/auth', authRouter);
app.use('/api/messages', messageRouter);
app.use('/api/notifications', notificationRouter);
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
  console.log(`Rwanda Drive Backend running on port ${PORT}`);
});

module.exports = app;
