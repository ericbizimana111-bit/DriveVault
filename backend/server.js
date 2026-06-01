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
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5174';
const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:5173';


if (!MONGO_URI) {
  console.error('Missing MONGO_URI in environment. Please set it in backend/.env');
  process.exit(1);
}

const allowedOrigins = [
  FRONTEND_URL,
  ADMIN_URL,
  ...(process.env.NODE_ENV !== 'production'
    ? [
      'http://localhost:5000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:4173',
      'http://localhost:4174'
    ]
    : [])
].filter(Boolean);

const connectWithRetry = async (attempt = 1) => {
  const maxAttempts = Number(process.env.MONGO_CONNECT_RETRIES || 5);

  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 });
    return;
  } catch (err) {
    if (attempt >= maxAttempts) throw err;

    console.warn(`MongoDB connection attempt ${attempt} failed: ${err.message}`);
    await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    return connectWithRetry(attempt + 1);
  }
};


const normalizeExistingAdminAccounts = async () => {
  const User = require('./models/User');
  const result = await User.updateMany(
    { role: 'admin', isEmailVerified: { $ne: true } },
    { $set: { isEmailVerified: true, emailVerifiedAt: new Date() } }
  );

  if (result.modifiedCount > 0) {
    console.log(`Verified ${result.modifiedCount} existing admin account(s)`);
  }
};

connectWithRetry()
  .then(async () => {
    console.log('MongoDB Connected');
    await normalizeExistingAdminAccounts();
    app.listen(PORT, () => console.log(`Rwanda Drive Backend running on port ${PORT}`));
  })
  .catch(err => { console.error('DB Error:', err); process.exit(1); });



app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
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
    key: '_csrf',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600
  }
});

app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ csrfToken: req.csrfToken() });
});

app.use('/api', csrfProtection);

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

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

app.use('/uploads', express.static(uploadsDir));

app.use('/admin', express.static(path.join(__dirname, '../admin/dist'), { index: false }));
app.get(/^\/admin/, (req, res) =>
  res.sendFile(path.join(__dirname, '../admin/dist/index.html'))
);

app.use(express.static(path.join(__dirname, '../frontend/dist'), { index: false }));
app.get(/.*/, (req, res) =>
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'))
);

app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    console.warn('[auth:csrf:failed]', {
      method: req.method,
      path: req.originalUrl,
      origin: req.headers.origin || null,
      ip: req.ip,
      userAgent: req.headers['user-agent'] || null
    });
    return res.status(403).json({ message: 'Invalid or expired CSRF token.' });
  }
  next(err);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

module.exports = app;
