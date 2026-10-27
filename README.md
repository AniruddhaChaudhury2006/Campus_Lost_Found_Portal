# Campus Lost and Found Portal 🎒🔑

A full-stack campus portal designed to report lost and found belongings, submit private ownership claims, and coordinate verified handovers.

---

## 🛠️ Technology Stack
- **Backend:** Node.js & Express.js
- **Database:** SQLite3 (`database.sqlite`) with pure SQL schema ([`database/schema.sql`](./database/schema.sql))
- **File Uploads:** Multer (local disk storage in `/public/uploads`)
- **Frontend:** Vanilla HTML5, CSS3, Google Fonts (`DM Sans` & `Manrope`), FontAwesome

---

## 📁 Project Architecture
```
Campus_Lost_Found_Portal/
├── database/
│   ├── schema.sql             # SQL schema (USERS, ITEMS, CLAIMS, AUDIT_LOGS)
│   └── seed.sql               # Starter sample records
├── public/
│   ├── uploads/               # Uploaded item photos
│   ├── index.html             # Main portal (Noticeboard & My Dashboard)
│   └── login.html             # Dedicated sign-in & registration page
├── src/
│   ├── config/
│   │   └── db.js              # SQLite connection & schema loader
│   ├── controllers/
│   │   ├── authController.js  # Identity & authentication
│   │   ├── itemController.js  # Lost & Found CRUD operations
│   │   └── claimController.js # Verification, claim & handover
│   ├── middleware/
│   │   ├── authMiddleware.js  # Role & identity checks
│   │   └── uploadMiddleware.js# Image file upload handler
│   ├── routes/
│   │   ├── authRoutes.js      # /api/auth endpoints
│   │   ├── itemRoutes.js      # /api/items endpoints
│   │   └── claimRoutes.js     # /api/claims endpoints
│   ├── app.js                 # Server entry point
│   └── seed.js                # One-step database seeder
├── database.sqlite            # SQLite database file
├── schema.sql                 # Root SQL schema for quick review
├── seed.sql                   # Root SQL seed file
└── package.json
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Populate the Database
To populate default campus users, items, and sample claims:
```bash
npm run seed
```

### 3. Run the Server
```bash
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## ✨ Key Features
- **Noticeboard:** Real-time item search with category and location filters.
- **Dedicated Dashboard:** Separated student workspace showing only your items and active claims.
- **Private Claims:** Claimants submit private proof details only visible to administrators.
- **Admin Review Queue:** Administrators verify proof, approve valid claims, and record physical handovers.
- **100% Free & Local:** Runs completely on your local machine with zero external cloud API costs.
