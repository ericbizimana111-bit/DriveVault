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
  // Allow common Vite dev ports during development
  ...(process.env.NODE_ENV !== 'production'
    ? ['http://localhost:5174', 'http://localhost:5175']
    : [])
].filter(Boolean);




mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected');
  })
  .catch(err => {
    console.error('DB Error:', err);
    process.exit(1);
  });

// ─── Core Middleware ────────────────────────────────────────────────────────
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

// ─── CSRF ───────────────────────────────────────────────────────────────────
const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 60 * 60 * 1000  // 1 hour in milliseconds (was 3600ms = 3.6 seconds)
  }
});

// CSRF token endpoint — must be before the blanket /api middleware
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Apply CSRF protection to all other /api routes
app.use('/api', csrfProtection);

// ─── Static Assets ──────────────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// ─── API Routes ─────────────────────────────────────────────────────────────
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

app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', message: 'Rwanda Drive API running' })
);

// ─── SPA Static Serving ─────────────────────────────────────────────────────
app.use('/admin', express.static(path.join(__dirname, '../admin/dist'), { index: false }));
app.get(/^\/admin/, (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/dist/index.html'));
});

app.use(express.static(path.join(__dirname, '../frontend/dist'), { index: false }));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// ─── Error Handlers (must come LAST) ────────────────────────────────────────
// CSRF error — returns 403 with a clear message
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ message: 'Invalid or expired CSRF token. Please refresh and try again.' });
  }
  next(err);
});

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Rwanda Drive Backend running on port ${PORT}`);
});

module.exports = app;