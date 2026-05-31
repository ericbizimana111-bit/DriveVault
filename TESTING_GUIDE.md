# QUICK REFERENCE: ISSUES FIXED & HOW TO TEST

## 🔧 FIXES APPLIED

### 1. Blank Signup Page ✅
**File**: `frontend/src/pages/Signup.jsx`
**What was fixed**: Added missing icon imports
```javascript
// Line 5 - NOW INCLUDES:
import { Eye, EyeOff, Car } from 'lucide-react';
```
**How to test**:
- Navigate to http://localhost:5173/signup
- Form should display with all fields visible
- Password visibility toggle buttons should work
- Logo should display at top

---

### 2. JWT Secret Mismatch ✅
**File**: `backend/routes/auth.js` line 24
**What was fixed**: Unified JWT_SECRET fallback value
```javascript
// BEFORE: const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
// AFTER:  const JWT_SECRET = process.env.JWT_SECRET || 'rwanda_drive_secret_2024';
```
**How to test**:
- Run without setting JWT_SECRET env var
- Signup → OTP → Verify OTP flow should work end-to-end
- Login should work without token validation errors

---

### 3. Contact Form Disconnected ✅
**File**: `frontend/src/pages/Contact.jsx`
**What was fixed**: Integrated backend API call
```javascript
// NOW POSTS TO: apiFetch('/messages', {...})
// Backend endpoint: POST /api/messages
```
**How to test**:
- Navigate to http://localhost:5173/contact
- Fill out contact form with name, email, message
- Click "Send Message"
- Success toast should appear
- Message should be saved in MongoDB

---

## 🧪 FULL SYSTEM TEST FLOW

### 1. Signup & Email Verification
```
1. Go to http://localhost:5173/signup
2. Fill form:
   - Name: Test Driver
   - Email: testdriver@example.com
   - Phone: +250788123456
   - Next button
3. Step 2:
   - National ID: 1234567890123456 (16 digits)
   - Password: Test@1234 (8+ chars, uppercase, number, special)
   - Confirm: Test@1234
   - Signup button
4. Should redirect to /verify-email
5. Check email for OTP (or check MongoDB otp collection)
6. Enter OTP
7. Should redirect to /driver-dashboard
```

### 2. Admin Login & Driver Management
```
1. Database setup: Create admin user
   db.users.insertOne({
     name: "Admin",
     email: "admin@example.com",
     password: bcrypt("Admin@1234"),
     role: "admin",
     isEmailVerified: true
   })
2. Go to http://localhost:4173/admin/login
3. Login with admin@example.com / Admin@1234
4. Should redirect to /admin/dashboard
5. View stats (driver count, document count)
6. Navigate to /admin/drivers
7. Should see test driver from signup
8. Click edit to modify driver details
```

### 3. Contact Form Submission
```
1. Go to http://localhost:5173/contact
2. Fill form:
   - Name: John Doe
   - Email: john@example.com
   - Subject: Account Access Issue
   - Message: I can't login to my account
3. Click "Send Message"
4. Should see success: "Message sent! We'll respond within 24 hours."
5. Verify in MongoDB messages collection
6. (Admin) Can view and reply via admin panel when implemented
```

### 4. Document Upload & Expiry
```
1. Login as admin
2. Go to /admin/drivers
3. Click driver → Add Document
4. Fill form:
   - Type: Driving License
   - Expiry Date: 2026-08-29
   - Payment Code: RWD-AUTO or manual
5. Upload document photo
6. Save
7. Should appear in /admin/documents
8. Calculate days to expiry (shown in dashboard)
```

### 5. Role-Based Access Control
```
Test: Non-admin cannot access admin API
1. Login as driver (role: 'user')
2. Try to access /admin/dashboard manually
3. Should redirect to /admin/login
4. Try API call: GET /api/drivers (admin-only)
5. Should return 403 Forbidden with "Admin access required"

Test: Admin can access driver resources
1. Login as admin
2. Navigate /admin/drivers
3. Should fetch and display all drivers
4. Can edit, delete, create drivers
```

### 6. Rate Limiting
```
Test: Signup limit (5 per hour)
1. Attempt to signup 6 times from same IP
2. 6th attempt should fail with "Too many accounts created"

Test: Login limit (5 per 15 minutes)
1. Login with wrong password 5 times
2. 6th attempt should fail with "Too many login attempts"
3. Account should lock for 30 minutes

Test: OTP limit (3 per 5 minutes)
1. Request OTP verification 3 times
2. 4th request should fail with "Too many OTP requests"
```

### 7. CSRF Protection
```
Test: POST without CSRF token fails
1. Use curl to POST to /api/auth/login WITHOUT X-CSRF-Token
2. Should return 403 Forbidden with "Invalid CSRF token"

Test: Frontend automatically injects token
1. Signup should work (apiFetch injects token automatically)
2. No CSRF errors in browser console
```

---

## 🔐 SECURITY VERIFICATION

### Check these don't appear in logs
- ❌ Plain text passwords
- ❌ JWT_SECRET value
- ❌ Database connection strings
- ❌ SMTP credentials

### Verify these are in place
- ✅ HTTP-only cookies used for auth
- ✅ CORS only allows 5173 and 4173
- ✅ Passwords hashed with bcryptjs
- ✅ Helmet security headers present
- ✅ XSS sanitization active
- ✅ Rate limiting enforced

---

## 📋 ENVIRONMENT VARIABLES CHECKLIST

### Backend (.env file)
```
MONGO_URI=mongodb://127.0.0.1:27017/driving
JWT_SECRET=rwanda_drive_secret_2024
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:4173
PORT=5000
NODE_ENV=development

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SENDER_EMAIL=noreply@rwandadrive.rw
```

### Frontend (.env file)
```
VITE_API_URL=http://localhost:5000/api
```

### Admin (.env file)
```
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 QUICK START COMMANDS

```bash
# Terminal 1: Start Backend
cd backend
npm install
npm start

# Terminal 2: Start Frontend
cd frontend
npm install
npm run dev

# Terminal 3: Start Admin
cd admin
npm install
npm run dev

# MongoDB (if local)
mongod

# Access:
# Frontend: http://localhost:5173
# Admin: http://localhost:4173
# API: http://localhost:5000
```

---

## ❌ KNOWN ISSUES & WORKAROUNDS

### Issue: OTP emails not received
**Cause**: SMTP not configured
**Solution**: Set SMTP_* env vars or check backend logs for email errors

### Issue: Can't see uploaded documents
**Cause**: /uploads directory permissions or incorrect file path
**Solution**: Ensure backend/uploads/ directory exists and is writable

### Issue: Admin can't create driver
**Cause**: Missing admin account
**Solution**: Insert admin user directly in MongoDB:
```javascript
db.users.insertOne({
  name: "Admin",
  email: "admin@example.com",
  password: "$2b$10$...", // bcrypt hash of "Admin@1234"
  role: "admin",
  isEmailVerified: true,
  phone: "+250788123456",
  nationalId: "9999999999999999"
})
```

---

**Last Updated**: May 29, 2026 | **Status**: All Critical Issues Fixed ✅
