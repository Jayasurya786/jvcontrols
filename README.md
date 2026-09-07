# JV Controls - Full Stack Architecture (Decoupled Frontend & Backend)

A high-performance, modern web application for **JV Controls** (Annanagar East, Chennai), decoupled into independent, modular `frontend/` and `backend/` directories.

---

## 📁 Repository Structure

```text
Ja.ve.Controls/
├── frontend/                     # React 18 + Vite + Tailwind CSS + TypeScript
│   ├── src/                      # Components, contexts, data, types, hooks
│   │   ├── components/           # UI components (Navbar, Catalog, Calculators, Portals)
│   │   ├── context/              # AuthContext, LanguageContext
│   │   ├── data/                 # Products, company data, multi-language translations
│   │   ├── types/                # TypeScript interfaces
│   │   └── utils/                # PDF spec generator, helpers
│   ├── public/                   # Static assets, branding logos, JV Controls HQ photo
│   │   └── images/
│   │       └── jvc_hq.png        # Official HQ & Experience Center Building Photo
│   ├── index.html                # Frontend HTML entry point
│   ├── package.json              # Frontend-only dependencies & scripts
│   ├── vite.config.ts            # Vite config with /api proxy to http://localhost:5000
│   ├── tailwind.config.js        # Tailwind CSS theme configuration
│   ├── postcss.config.js         # PostCSS configuration
│   └── tsconfig.json             # TypeScript configuration
│
├── backend/                      # Node.js + Express + Mongoose + Nodemailer
│   ├── models/                   # MongoDB Mongoose Models (User, Inquiry, ServiceTicket, CustomerProduct)
│   ├── utils/                    # Nodemailer email dispatcher with HTML templates & scheduler
│   ├── data/                     # Automatic JSON backup storage (failover redundancy)
│   │   ├── inquiries.json
│   │   ├── service_tickets.json
│   │   ├── customer_products.json
│   │   └── read_notifications.json
│   ├── server.js                 # Express REST API, auth, background mailer, & static serving
│   ├── package.json              # Backend-only dependencies & scripts
│   └── .env                      # Database, JWT, SMTP credentials, and admin whitelist
│
├── package.json                  # Monorepo root orchestrator (runs frontend & backend scripts)
└── README.md                     # Documentation & operational guide
```

---

## 🚀 Quick Start (Root Commands)

You can manage both frontend and backend seamlessly from the root directory:

### 1. Install Dependencies
```bash
npm run install:all
```
*Installs dependencies in both `frontend/` and `backend/` in one go.*

### 2. Run Frontend Development Server
```bash
npm run dev
```
*Starts Vite dev server at **[http://localhost:5173](http://localhost:5173)** with `/api` proxied to port `5000`.*

### 3. Start Backend Server
```bash
npm start
# or
npm run server
```
*Starts the Express server on **[http://localhost:5000](http://localhost:5000)** with MongoDB connection, automated 6-month service scheduler, and static file serving.*

### 4. Build Frontend for Production
```bash
npm run build
```
*Compiles TypeScript and outputs an optimized bundle to `frontend/dist`.*

---

## 💻 Running Services Independently

### Frontend Only (`cd frontend`)
```bash
cd frontend
npm install
npm run dev      # Runs dev server on http://localhost:5173
npm run build    # Compiles production build to dist/
npm run preview  # Previews production build on http://localhost:4173
```

### Backend Only (`cd backend`)
```bash
cd backend
npm install
npm start        # Starts server on http://localhost:5000
npm run dev      # Starts server with node --watch auto-reload
```

---

## ⚙️ Backend Environment Variables (`backend/.env`)

Configure your backend settings in `backend/.env`:

```env
# Server Port & Mode
PORT=5000
NODE_ENV=production

# Support Hotlines
PRIMARY_PHONE="+91 9500087723"
PRIMARY_WHATSAPP="919500087723"

# MongoDB Connection (Local or Atlas)
MONGODB_URI=mongodb://localhost:27017/jvcontrols

# JWT Secret
JWT_SECRET=jvcontrols_jwt_secret_key_chennai_2026_9500087723

# Admin Whitelist (Sole authorized administrator email)
ADMIN_EMAILS=jvcjvcontrols@gmail.com

# SMTP Nodemailer Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=viper637411@gmail.com
SMTP_PASS=hgvyxuzihctqxkln
FROM_EMAIL="JV Controls Chennai <viper637411@gmail.com>"
```

---

## 🛡️ Key Features & Implementations

1. **Decoupled Architecture**: Frontend and backend are completely isolated with zero circular dependencies or shared node_modules conflicts.
2. **Automated Maintenance Alerts**: Backend runs an automated cron / scheduler checking for upcoming and overdue 6-month preventive maintenance services and warranty expirations, dispatching branded HTML emails to customers and whitelisted admins.
3. **Sole Administrator Access**: Restricted exclusively to `jvcjvcontrols@gmail.com` for admin portal management and all operational alerts.
4. **Resilient Dual Storage**: MongoDB primary storage with automatic, transparent fallback to local JSON in `backend/data/` if MongoDB is ever temporarily offline.
5. **Authentic Assets & Experience**: Official JV Controls HQ and Experience Center photograph embedded directly in the About Us section.

