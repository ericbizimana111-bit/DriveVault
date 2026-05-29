const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const OTP = require('../models/OTP');
const auth = require('../middleware/auth');
const {
  validateNationalId,
  validateEmail,
  validatePassword,
  getPasswordStrength
} = require('../middleware/validation');
const {
  sendOTPEmail,
  sendWelcomeEmail
} = require('../middleware/emailService');
const {
  loginLimiter,
  signupLimiter,
  otpLimiter
} = require('../middleware/rateLimiter');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const router = express.Router();

/**
 * Generate a random 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Create OTP hash using bcrypt
 */
const hashOTP = async (otp) => {
  return await bcrypt.hash(otp, 10);
};

/**
 * Verify OTP against hash
 */
const verifyOTPHash = async (otp, hash) => {
  return await bcrypt.compare(otp, hash);
};

// ==================== SIGNUP ENDPOINTS ====================

/**
 * POST /api/auth/signup
 * Step 1: Register user and send OTP
 */
router.post('/signup', signupLimiter, async (req, res) => {
  try {
    const { name, email, phone, nationalId, password } = req.body;

    // Validation
    if (!name || !email || !password || !nationalId) {
      return res.status(400).json({
        message: 'Name, email, password, and national ID are required'
      });
    }

    // Validate National ID format (exactly 16 digits)
    if (!validateNationalId(nationalId)) {
      return res.status(400).json({
        message: 'National ID must be exactly 16 digits'
      });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({
        message: 'Invalid email format'
      });
    }

    // Validate password strength
    const passwordStrength = getPasswordStrength(password);
    if (passwordStrength.level === 'weak') {
      return res.status(400).json({
        message: 'Password must be at least 8 characters with uppercase, number, and special character',
        passwordStrength: passwordStrength
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { nationalId: nationalId.trim() }
      ]
    });

    if (existingUser) {
      return res.status(409).json({
        message: existingUser.email === email.toLowerCase()
          ? 'This email is already registered'
          : 'This National ID is already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user (not verified yet)
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || '',
      nationalId: nationalId.trim(),
      licenseCategory: 'B',
      isEmailVerified: false,
      role: 'user'
    });

    await newUser.save();

    // Generate and send OTP
    const otp = generateOTP();
    const otpHash = await hashOTP(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const newOTP = new OTP({
      email: email.toLowerCase(),
      otpHash,
      expiresAt,
      attempts: 0
    });

    await newOTP.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, name);

    res.status(201).json({
      message: 'Account created. Please verify your email with the OTP sent.',
      userId: newUser.id,
      email: newUser.email,
      emailSent: emailSent,
      requiresOTPVerification: true
    });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({
      message: 'Server error during signup',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * POST /api/auth/verify-otp
 * Verify OTP and activate user account
 */
router.post('/verify-otp', otpLimiter, async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: 'Email and OTP are required'
      });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      used: false
    });

    if (!otpRecord) {
      return res.status(400).json({
        message: 'OTP not found or already used'
      });
    }

    // Check if OTP expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Check attempt limit
    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        message: 'Too many failed attempts. Please request a new OTP.'
      });
    }

    // Verify OTP
    const isValidOTP = await verifyOTPHash(otp, otpRecord.otpHash);

    if (!isValidOTP) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({
        message: 'Invalid OTP',
        attemptsRemaining: otpRecord.maxAttempts - otpRecord.attempts
      });
    }

    // Mark OTP as used
    otpRecord.used = true;
    otpRecord.usedAt = new Date();
    await otpRecord.save();

    // Update user as verified
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(email, user.name);

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set secure HTTP-only cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: 'Email verified successfully. You are now logged in.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        photo: user.photo || null
      }
    });

  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({
      message: 'Server error during OTP verification'
    });
  }
});

/**
 * POST /api/auth/resend-otp
 * Resend OTP to user email
 */
router.post('/resend-otp', otpLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Email is required'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        message: 'Email is already verified'
      });
    }

    // Delete old OTP if exists
    await OTP.deleteOne({ email: email.toLowerCase() });

    // Generate new OTP
    const otp = generateOTP();
    const otpHash = await hashOTP(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const newOTP = new OTP({
      email: email.toLowerCase(),
      otpHash,
      expiresAt,
      attempts: 0
    });

    await newOTP.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, user.name);

    res.json({
      message: 'OTP sent successfully',
      emailSent: emailSent
    });

  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({
      message: 'Server error during OTP resend'
    });
  }
});

// ==================== LOGIN ENDPOINTS ====================

/**
 * POST /api/auth/login
 * Login user (requires email verification)
 */
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Check if account is locked (brute force protection)
    if (user.lockUntil && new Date() < user.lockUntil) {
      return res.status(401).json({
        message: 'Account temporarily locked. Please try again later.'
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: 'Please verify your email first. Check your inbox for the OTP.',
        requiresEmailVerification: true,
        userId: user.id,
        email: user.email
      });
    }

    // Verify password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      // Increment login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }

      await user.save();

      return res.status(401).json({
        message: 'Invalid email or password',
        attemptsRemaining: 5 - user.loginAttempts
      });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set secure HTTP-only cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        photo: user.photo || null
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      message: 'Server error during login'
    });
  }
});

// ==================== USER ENDPOINTS ====================

/**
 * GET /api/auth/me
 * Get current logged-in user (requires authentication)
 */
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otpHash');
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }
    res.json(user);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({
      message: 'Server error fetching user'
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (clear HTTP-only cookie)
 */
router.post('/logout', (req, res) => {
  res.clearCookie('authToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
