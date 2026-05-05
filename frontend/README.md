# 🚗 Rwanda DriveDoc

**Official Digital Driving Document Management System for Rwanda**

Built for Rwanda National Police and drivers across Rwanda to manage driving licenses and vehicle documents digitally.

---

## 📁 Project Structure

```
rwanda-drive/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx                    ← Main router
│   ├── index.jsx                  ← Entry point
│   ├── index.css                  ← Global styles
│   ├── context/
│   │   ├── AuthContext.jsx        ← Login / logout / user state
│   │   └── DataContext.jsx        ← Drivers & documents API calls
│   ├── components/
│   │   ├── PublicLayout.jsx       ← Header + footer for public pages
│   │   ├── DriverLayout.jsx       ← Sidebar layout for drivers
│   │   └── ProtectedRoute.jsx     ← Route guard by role
│   ├── pages/                     ← Public & driver pages
│   │   ├── Home.jsx               ← Landing page
│   │   ├── About.jsx              ← About Rwanda DriveDoc
│   │   ├── Contact.jsx            ← Contact & FAQ
│   │   ├── Login.jsx              ← Login page
│   │   ├── DriverDashboard.jsx    ← Driver home with stats
│   │   ├── DriverDocuments.jsx    ← All documents with countdown
│   │   └── DriverProfile.jsx      ← Profile & license info
│   └── admin/
│       ├── components/
│       │   └── AdminLayout.jsx    ← Admin sidebar layout
│       └── pages/
│           ├── AdminDashboard.jsx ← Admin overview
│           ├── AdminDrivers.jsx   ← Manage drivers
│           ├── AdminAddDriver.jsx ← Add driver + photo upload
│           ├── AdminDocuments.jsx ← Manage all documents
│           └── AdminAddDocument.jsx ← Add document + photo
├── backend/
│   ├── server.js                  ← Express server entry
│   ├── middleware/
│   │   └── auth.js                ← JWT middleware
│   ├── routes/
│   │   ├── auth.js                ← Login, /me
│   │   ├── drivers.js             ← Driver CRUD
│   │   └── documents.js           ← Document CRUD
│   └── uploads/                   ← Uploaded photos stored here
└── README.md
```

---

## 🚀 How to Run

### 1. Backend

```bash
cd backend
npm install
node server.js
# Runs on http://localhost:5000
```

### 2. Frontend

```bash
cd ..   # back to rwanda-drive root
npm install
npm start
# Runs on http://localhost:3000
```

---

## 🔐 Default Login

| Role  | Email                    | Password   |
|-------|--------------------------|------------|
| Admin | admin@rwandadrive.rw     | password   |

> The admin can create driver accounts from the admin panel.

---

## ✨ Features

### Public Pages
- **Home** — Rwanda transport info, license categories, required documents, road rules
- **About** — How the system works, step-by-step guide
- **Contact** — Contact form + FAQ

### Driver Portal
- Login with admin-issued credentials
- Dashboard with document stats (valid, expiring, expired)
- View all documents with real-time expiry countdown
- Unique payment code per document for renewal
- View license category and what vehicles they can drive
- Profile page with personal details

### Admin Panel
- Dashboard with system-wide overview and alerts
- Add drivers with photo upload
- View all registered drivers
- Add documents (any type) to any driver with document photo
- Delete drivers and documents
- Search and filter functionality

---

## 📋 Supported Document Types

1. Driving License
2. Vehicle Registration (Carte Jaune)
3. Vehicle Insurance
4. Motor Vehicle Inspection Certificate
5. National ID
6. International Driving Permit
7. Rental Agreement

---

## 🇷🇼 Rwanda Driving Information

- Minimum driving age: **18 years**
- Definitive license cost: **50,000 RWF**
- Processing time: **1 day**
- Drive on the **right** side of the road
- Speed limit: **40 km/h** in towns, **60–80 km/h** on highways
- Blood alcohol limit: **0.08%**

---

## 🎨 Design

- **Colors:** Deep forest green (`#1a3a2a`) + Golden amber (`#e8a020`)
- **Font:** Sora + IBM Plex Mono
- **Theme:** Professional Rwanda transport — mature, clean, minimal

---

© 2025 Rwanda DriveDoc | Powered by Rwanda National Police
