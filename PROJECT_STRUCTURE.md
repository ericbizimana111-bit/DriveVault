# Driving Project - Complete Structure

## Project Overview
A full-stack driving management system with three main applications:
- **Backend**: Node.js Express API server
- **Frontend**: Driver portal (React + Vite)
- **Admin**: Admin dashboard (React + Vite)

---

## 📁 Complete Folder Structure

```
driving/
│
├── .git/                          # Git version control
│
├── backend/                       # Node.js Express Backend
│   ├── .gitignore
│   ├── package.json              # Backend dependencies (Express, JWT, bcryptjs, multer, etc.)
│   ├── package-lock.json
│   ├── server.js                 # Main server entry point
│   │
│   ├── middleware/
│   │   └── auth.js              # Authentication middleware
│   │
│   ├── routes/
│   │   ├── auth.js              # Authentication routes (login, signup)
│   │   ├── documents.js         # Document management routes
│   │   └── drivers.js           # Driver management routes
│   │
│   ├── uploads/                 # Directory for uploaded files
│   │
│   └── node_modules/            # Installed npm packages
│
├── frontend/                      # Driver Portal (React + Vite)
│   ├── .gitignore
│   ├── package.json             # Frontend dependencies (React, React Router, date-fns, etc.)
│   ├── package-lock.json
│   ├── vite.config.js           # Vite configuration
│   ├── eslint.config.js         # ESLint configuration
│   ├── index.html               # Main HTML entry point
│   ├── README.md
│   │
│   ├── public/                  # Static public assets
│   │   └── (empty - for favicons/public assets)
│   │
│   ├── src/
│   │   ├── main.jsx             # React app entry point
│   │   ├── index.jsx            # Additional index file
│   │   ├── App.jsx              # Main App component
│   │   ├── App.css              # Global app styles
│   │   ├── index.css            # Global index styles
│   │   │
│   │   ├── assets/              # Static assets (images, etc.)
│   │   │
│   │   ├── components/          # Reusable components
│   │   │   ├── DriverLayout.jsx
│   │   │   ├── DriverLayout.module.css
│   │   │   ├── PublicLayout.jsx
│   │   │   ├── PublicLayout.module.css
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── context/             # React Context (State Management)
│   │   │   ├── AuthContext.jsx  # Authentication context
│   │   │   └── DataContext.jsx  # Data context
│   │   │
│   │   └── pages/               # Page components
│   │       ├── Home.jsx
│   │       ├── Home.module.css
│   │       ├── Login.jsx
│   │       ├── Login.module.css
│   │       ├── Signup.jsx
│   │       ├── Signup.module.css
│   │       ├── About.jsx
│   │       ├── About.module.css
│   │       ├── Contact.jsx
│   │       ├── Contact.module.css
│   │       ├── DriverDashboard.jsx
│   │       ├── DriverDashboard.module.css
│   │       ├── DriverProfile.jsx
│   │       ├── DriverProfile.module.css
│   │       ├── DriverDocuments.jsx
│   │       └── DriverDocuments.module.css
│   │
│   ├── dist/                    # Production build output
│   └── node_modules/            # Installed npm packages
│
├── admin/                         # Admin Dashboard (React + Vite)
│   ├── .gitignore
│   ├── package.json             # Admin dependencies (same as frontend)
│   ├── package-lock.json
│   ├── vite.config.js           # Vite configuration
│   ├── eslint.config.js         # ESLint configuration
│   ├── index.html               # Main HTML entry point
│   ├── README.md
│   │
│   ├── public/                  # Static public assets
│   │   ├── favicon.svg
│   │   └── icons.svg
│   │
│   ├── src/
│   │   ├── main.jsx             # React app entry point
│   │   ├── App.jsx              # Main App component
│   │   ├── App.css              # Global app styles
│   │   ├── index.css            # Global index styles
│   │   │
│   │   ├── assets/              # Static assets (images, etc.)
│   │   │
│   │   ├── components/          # Reusable components
│   │   │   ├── AdminLayout.jsx
│   │   │   └── AdminLayout.module.css
│   │   │
│   │   ├── context/             # React Context (State Management)
│   │   │   ├── AuthContext.jsx  # Authentication context
│   │   │   └── DataContext.jsx  # Data context
│   │   │
│   │   └── pages/               # Page components
│   │       ├── AdminDashboard.jsx
│   │       ├── AdminDashboard.module.css
│   │       ├── AdminDrivers.jsx
│   │       ├── AdminDrivers.module.css
│   │       ├── AdminAddDriver.jsx
│   │       ├── AdminAddDriver.module.css
│   │       ├── AdminDocuments.jsx
│   │       ├── AdminDocuments.module.css
│   │       ├── AdminAddDocument.jsx
│   │       └── AdminAddDocument.module.css
│   │
│   ├── dist/                    # Production build output
│   └── node_modules/            # Installed npm packages
│
└── PROJECT_STRUCTURE.md         # This file
```

---

## 📊 Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js v5.2.1
- **Authentication**: JWT (jsonwebtoken), bcryptjs
- **File Upload**: multer v2.1.1
- **Utilities**: dotenv, uuid, cors

### Frontend & Admin
- **Library**: React v19.2.5
- **Build Tool**: Vite v8.0.10
- **Routing**: React Router DOM v7.x
- **Utilities**: date-fns, react-toastify
- **Linting**: ESLint

---

## 📝 Key Components by Purpose

### Authentication Flow
- **Context**: `AuthContext.jsx` (Frontend & Admin)
- **Routes**: `routes/auth.js` (Backend)
- **Middleware**: `middleware/auth.js` (Backend)

### Driver Management
- **Backend**: `routes/drivers.js` - Handles driver CRUD operations
- **Frontend Pages**: `DriverDashboard.jsx`, `DriverProfile.jsx`
- **Admin Pages**: `AdminDrivers.jsx`, `AdminAddDriver.jsx`

### Document Management
- **Backend**: `routes/documents.js` - Handles document uploads/retrieval
- **Frontend Pages**: `DriverDocuments.jsx`
- **Admin Pages**: `AdminDocuments.jsx`, `AdminAddDocument.jsx`

### State Management
- **Context API**: Used for authentication and data sharing
- **Files**: `context/AuthContext.jsx`, `context/DataContext.jsx`

---

## 🎯 Folder Descriptions

| Folder | Purpose |
|--------|---------|
| `backend/` | API server with routes and middleware |
| `frontend/` | Driver-facing web application |
| `admin/` | Administrator dashboard for system management |
| `middleware/` | Backend middleware (authentication) |
| `routes/` | Backend API endpoints |
| `src/` | React source code |
| `components/` | Reusable React components |
| `context/` | React Context for state management |
| `pages/` | Page-level React components |
| `uploads/` | Server-side uploaded files storage |
| `public/` | Static assets served to browser |
| `dist/` | Production build output |

---

## 🚀 Running the Project

### Backend Setup
```bash
cd backend
npm install
npm start          # or use nodemon for development
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev        # Development server
npm run build      # Production build
```

### Admin Setup
```bash
cd admin
npm install
npm run dev        # Development server
npm run build      # Production build
```

---

## 📦 File Summary

- **Total Directories**: 16 main directories
- **Backend Files**: 1 server file + 3 route files + 1 middleware file
- **Frontend Pages**: 8 pages with CSS modules
- **Admin Pages**: 5 pages with CSS modules
- **Configuration Files**: vite.config.js, eslint.config.js in each frontend app
- **Styling**: CSS modules + global CSS files

---

## 🔗 Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│            DRIVER PORTAL (Frontend)                 │
│     React App + Vite + React Router                 │
│  - Authentication                                   │
│  - Driver Dashboard                                 │
│  - Profile Management                               │
│  - Document Upload/View                             │
└────────────────┬────────────────────────────────────┘
                 │
                 │ HTTP/REST API
                 │
┌────────────────▼────────────────────────────────────┐
│        BACKEND API (Express.js)                     │
│     Node.js Server on port (check server.js)        │
│  - Authentication Routes                            │
│  - Driver Management Routes                         │
│  - Document Management Routes                       │
│  - File Upload Handler                              │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│            ADMIN DASHBOARD                          │
│     React App + Vite + React Router                 │
│  - Driver Management                                │
│  - Document Management                              │
│  - System Administration                            │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Project Completion Checklist

- [x] Backend API structure
- [x] Frontend driver portal
- [x] Admin dashboard
- [x] Authentication system
- [x] Document management
- [x] Driver management
- [ ] Database integration (check server.js)
- [ ] Environment configuration (.env files)
- [ ] Testing setup

---

*Generated: May 12, 2026*
