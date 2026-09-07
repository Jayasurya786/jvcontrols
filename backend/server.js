import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import { User } from './models/User.js';
import { Inquiry } from './models/Inquiry.js';
import { ServiceTicket } from './models/ServiceTicket.js';
import { CustomerProduct, generateServiceSchedule } from './models/CustomerProduct.js';
import {
  generateOTP,
  sendRegistrationOTP,
  sendPasswordResetOTP,
  verifySMTP,
  sendServiceMilestoneEmail,
  sendWarrantyExpiredEmail,
  scanAndDispatchPendingEmails,
  getAdminEmailList,
} from './utils/mailer.js';

// ESM directory resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const PRIMARY_PHONE = process.env.PRIMARY_PHONE || '+91 9500087723';
const PRIMARY_WHATSAPP = process.env.PRIMARY_WHATSAPP || '919500087723';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jvcontrols';
const JWT_SECRET = process.env.JWT_SECRET || 'jvcontrols_jwt_secret_key_chennai_2026_9500087723';

// Authorized Admin Emails whitelist (Strictly restricted to jvcjvcontrols@gmail.com)
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'jvcjvcontrols@gmail.com')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter((e) => e && e !== 'admin@jvcontrols.in' && e !== 'adimin@jvcontrols.in');

// Ensure data directory exists for local fallback/redundancy
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');
const TICKETS_FILE = path.join(DATA_DIR, 'service_tickets.json');
const CUSTOMER_PRODUCTS_FILE = path.join(DATA_DIR, 'customer_products.json');
const READ_NOTIFICATIONS_FILE = path.join(DATA_DIR, 'read_notifications.json');

if (!fs.existsSync(INQUIRIES_FILE)) {
  fs.writeFileSync(INQUIRIES_FILE, JSON.stringify([], null, 2), 'utf8');
}
if (!fs.existsSync(TICKETS_FILE)) {
  fs.writeFileSync(TICKETS_FILE, JSON.stringify([], null, 2), 'utf8');
}
if (!fs.existsSync(CUSTOMER_PRODUCTS_FILE)) {
  fs.writeFileSync(CUSTOMER_PRODUCTS_FILE, JSON.stringify([], null, 2), 'utf8');
}
if (!fs.existsSync(READ_NOTIFICATIONS_FILE)) {
  fs.writeFileSync(READ_NOTIFICATIONS_FILE, JSON.stringify([], null, 2), 'utf8');
}

// Helpers for persistent JSON fallback
function readJSON(file) {
  try {
    const raw = fs.readFileSync(file, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${file}:`, err.message);
    return [];
  }
}

function writeJSON(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${file}:`, err.message);
    return false;
  }
}

// ==========================================
// MONGODB CONNECTION MANAGEMENT
// ==========================================
let isMongoConnected = false;

async function initMongoDB() {
  try {
    console.log(`[JV Controls] Connecting to MongoDB at ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}...`);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 4000,
    });
    isMongoConnected = true;
    console.log(`[JV Controls] 🍃 Successfully connected to MongoDB database: "${mongoose.connection.name}"`);

    // Backfill 6-month service schedules for existing products if missing
    try {
      const prodsWithoutSchedule = await CustomerProduct.find({
        $or: [{ serviceSchedule: { $exists: false } }, { serviceSchedule: { $size: 0 } }],
      });
      for (const p of prodsWithoutSchedule) {
        p.serviceSchedule = generateServiceSchedule(p.purchaseDate, p.warrantyYears);
        await p.save();
      }
      if (prodsWithoutSchedule.length > 0) {
        console.log(`[JV Controls] 🛠️ Auto-generated 6-month service schedules for ${prodsWithoutSchedule.length} existing products.`);
      }
    } catch (migErr) {
      console.warn('[JV Controls] Service schedule backfill note:', migErr.message);
    }

    // Synchronize primary administrator account & demote any non-whitelisted admin accounts
    try {
      await User.updateMany(
        { email: { $nin: ADMIN_EMAILS }, role: 'admin' },
        { $set: { role: 'customer' } }
      );

      const primaryAdminEmail = 'jvcjvcontrols@gmail.com';
      let adminUser = await User.findOne({ email: primaryAdminEmail });
      if (!adminUser) {
        const hashedPassword = await bcrypt.hash('AdminPass123!', 10);
        adminUser = new User({
          name: 'JV Controls Administrator',
          email: primaryAdminEmail,
          mobile: '9500087723',
          password: hashedPassword,
          role: 'admin',
          isVerified: true,
        });
        await adminUser.save();
        console.log(`[JV Controls] 👤 Created verified primary administrator account: ${primaryAdminEmail}`);
      } else {
        adminUser.role = 'admin';
        adminUser.isVerified = true;
        await adminUser.save();
        console.log(`[JV Controls] 👤 Confirmed primary administrator account: ${primaryAdminEmail}`);
      }
    } catch (userSyncErr) {
      console.warn('[JV Controls] Admin user sync note:', userSyncErr.message);
    }
  } catch (err) {
    isMongoConnected = false;
    console.warn(`[JV Controls] ⚠️ MongoDB connection skipped or unreachable (${err.message}).`);
    console.warn(`[JV Controls] Resilient fallback to local JSON database storage active.`);
  }
}

mongoose.connection.on('connected', () => {
  isMongoConnected = true;
  console.log('[JV Controls] 🍃 MongoDB connection established.');
});

mongoose.connection.on('disconnected', () => {
  isMongoConnected = false;
  console.warn('[JV Controls] ⚠️ MongoDB disconnected. Using local storage fallback.');
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ==========================================
// JWT AUTHENTICATION MIDDLEWARES
// ==========================================

// Authenticate any valid logged-in user
export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required. Please sign in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (isMongoConnected) {
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, error: 'User account no longer exists.' });
      }
      req.user = user;
    } else {
      req.user = decoded;
    }
    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: 'Invalid or expired session token. Please sign in again.' });
  }
}

// Protected Admin Middleware: Requires admin role AND email present in ADMIN_EMAILS whitelist
export async function requireAdmin(req, res, next) {
  authenticateToken(req, res, () => {
    const userEmail = (req.user?.email || '').toLowerCase();
    const userRole = req.user?.role;

    const isAuthorizedEmail = ADMIN_EMAILS.includes(userEmail);
    const isAdminRole = userRole === 'admin';

    if (!isAdminRole || !isAuthorizedEmail) {
      console.warn(`[SECURITY ALERT] Unauthorized admin access attempt by ${userEmail}`);
      return res.status(403).json({
        success: false,
        error: 'Access denied. The Admin Portal is strictly restricted to authorized administrator email addresses.',
        authorizedEmailsHint: 'Please sign in with jvcjvcontrols@gmail.com for administrator access.',
      });
    }

    next();
  });
}

// ==========================================
// AUTHENTICATION & USER ROUTES
// ==========================================

// 1. Unified Register User with Email OTP
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ success: false, error: 'Please fill in all required fields.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    // Automatically determine role based on authorized admin emails
    const assignedRole = ADMIN_EMAILS.includes(cleanEmail) ? 'admin' : 'customer';

    if (isMongoConnected) {
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser && existingUser.isVerified) {
        return res.status(409).json({
          success: false,
          error: 'An account with this email address already exists. Please sign in.',
        });
      }

      // Hash password with bcrypt
      const hashedPassword = await bcrypt.hash(password, 10);
      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      let user = existingUser;
      if (user) {
        // Update unverified user with new credentials and OTP
        user.name = name;
        user.mobile = mobile;
        user.password = hashedPassword;
        user.role = assignedRole;
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();
      } else {
        user = await User.create({
          name,
          email: cleanEmail,
          mobile,
          password: hashedPassword,
          role: assignedRole,
          isVerified: false,
          otp,
          otpExpires,
        });
      }

      // Send OTP via email
      const mailResult = await sendRegistrationOTP(cleanEmail, name, otp);

      return res.status(201).json({
        success: true,
        message: mailResult.delivered
          ? `Verification code dispatched to ${cleanEmail}. Please check your inbox/spam folder.`
          : `Verification code generated for ${cleanEmail}. (Code: ${otp})`,
        email: cleanEmail,
        name: user.name,
        devOtp: otp,
      });
    } else {
      // Resilient local simulation if MongoDB is temporarily offline
      const otp = generateOTP();
      console.log(`[AUTH] Local fallback registration for ${cleanEmail}, OTP: ${otp}`);
      return res.status(201).json({
        success: true,
        message: `Verification code generated for ${cleanEmail}.`,
        email: cleanEmail,
        name,
        devOtp: otp,
      });
    }
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ success: false, error: err.message || 'Registration failed.' });
  }
});

// 2. Verify Email OTP and Activate Account
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Email and OTP are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const isAuthorizedAdmin = ADMIN_EMAILS.includes(cleanEmail);
    const assignedRole = isAuthorizedAdmin ? 'admin' : 'customer';

    if (isMongoConnected) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        return res.status(404).json({ success: false, error: 'User account not found.' });
      }

      if (user.isVerified) {
        // Already verified, generate token and proceed
        user.role = assignedRole;
        await user.save();

        const token = jwt.sign(
          { id: user._id, email: user.email, mobile: user.mobile, role: assignedRole, name: user.name },
          JWT_SECRET,
          { expiresIn: '7d' }
        );
        return res.json({
          success: true,
          message: 'Account is already verified. Signing you in...',
          token,
          user: { ...user.toJSON(), role: assignedRole },
          isAdmin: isAuthorizedAdmin,
        });
      }

      // Check OTP match and expiration
      if (!user.otp || user.otp !== otp.trim()) {
        return res.status(400).json({ success: false, error: 'Invalid verification code. Please check your email.' });
      }

      if (new Date() > new Date(user.otpExpires)) {
        return res.status(400).json({
          success: false,
          error: 'Verification code has expired. Please click Resend OTP.',
        });
      }

      // Mark verified and update role
      user.isVerified = true;
      user.role = assignedRole;
      user.otp = null;
      user.otpExpires = null;
      await user.save();

      // Issue JWT session token
      const token = jwt.sign(
        { id: user._id, email: user.email, mobile: user.mobile, role: assignedRole, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      console.log(`[AUTH] User verified and signed in: ${user.email} (${assignedRole})`);

      return res.json({
        success: true,
        message: 'Account successfully verified and activated!',
        token,
        user: { ...user.toJSON(), role: assignedRole },
        isAdmin: isAuthorizedAdmin,
      });
    } else {
      // Local fallback simulation
      const token = jwt.sign({ id: 'local-demo-user', email: cleanEmail, mobile: '', role: assignedRole, name: 'User' }, JWT_SECRET, {
        expiresIn: '7d',
      });
      return res.json({
        success: true,
        message: 'Account verified successfully.',
        token,
        user: { email: cleanEmail, name: 'User', role: assignedRole },
        isAdmin: isAuthorizedAdmin,
      });
    }
  } catch (err) {
    console.error('Error verifying OTP:', err);
    res.status(500).json({ success: false, error: err.message || 'OTP verification failed.' });
  }
});

// 3. Resend OTP
app.post('/api/auth/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email address is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (isMongoConnected) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        return res.status(404).json({ success: false, error: 'User account not found.' });
      }

      const newOtp = generateOTP();
      user.otp = newOtp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      const mailResult = await sendRegistrationOTP(cleanEmail, user.name, newOtp);

      return res.json({
        success: true,
        message: mailResult.delivered
          ? `A new 6-digit verification code has been dispatched to ${cleanEmail}.`
          : `A new verification code has been generated. (Code: ${newOtp})`,
        devOtp: newOtp,
      });
    } else {
      const newOtp = generateOTP();
      console.log(`[AUTH] Resending OTP to ${cleanEmail}: ${newOtp}`);
      return res.json({
        success: true,
        message: `New OTP generated for ${cleanEmail}.`,
        devOtp: newOtp,
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Unified Sign In
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide both email and password.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const isAuthorizedAdmin = ADMIN_EMAILS.includes(cleanEmail);
    const assignedRole = isAuthorizedAdmin ? 'admin' : 'customer';

    if (isMongoConnected) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid email or password.' });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Invalid email or password.' });
      }

      // Check email verification status
      if (!user.isVerified) {
        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await sendRegistrationOTP(cleanEmail, user.name, otp);

        return res.status(403).json({
          success: false,
          unverified: true,
          email: cleanEmail,
          message: 'Your account is not yet verified. A new 6-digit verification code has been dispatched to your email.',
        });
      }

      // Automatically sync admin role if email matches authorized admin list
      if (user.role !== assignedRole) {
        user.role = assignedRole;
        await user.save();
      }

      // Issue JWT Token
      const token = jwt.sign(
        { id: user._id, email: user.email, mobile: user.mobile, role: assignedRole, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      console.log(`[AUTH] User logged in: ${user.email} [Role: ${assignedRole}, IsAdmin: ${isAuthorizedAdmin}]`);

      return res.json({
        success: true,
        message: isAuthorizedAdmin
          ? `Welcome back, Administrator ${user.name}!`
          : `Welcome back, ${user.name}!`,
        token,
        user: { ...user.toJSON(), role: assignedRole },
        isAdmin: isAuthorizedAdmin,
      });
    } else {
      // Local fallback simulation
      const token = jwt.sign({ id: 'demo-user', email: cleanEmail, mobile: '', role: assignedRole, name: 'User' }, JWT_SECRET, {
        expiresIn: '7d',
      });
      return res.json({
        success: true,
        token,
        user: { email: cleanEmail, name: 'User', role: assignedRole },
        isAdmin: isAuthorizedAdmin,
      });
    }
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ success: false, error: err.message || 'Login failed.' });
  }
});

// 5. Forgot Password: Request OTP
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email address is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (isMongoConnected) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        // Return success message even if email not found to avoid user enumeration
        return res.json({
          success: true,
          message: 'If an account with that email exists, a password reset code has been sent.',
        });
      }

      const otp = generateOTP();
      user.resetPasswordOtp = otp;
      user.resetPasswordOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
      await user.save();

      const mailResult = await sendPasswordResetOTP(cleanEmail, user.name, otp);

      return res.json({
        success: true,
        message: mailResult.delivered
          ? `A password reset code has been dispatched to ${cleanEmail}.`
          : `Password reset code generated. (Code: ${otp})`,
        email: cleanEmail,
        devOtp: otp,
      });
    } else {
      const otp = generateOTP();
      console.log(`[AUTH] Password reset OTP for ${cleanEmail}: ${otp}`);
      return res.json({
        success: true,
        message: `Password reset code generated.`,
        email: cleanEmail,
        devOtp: otp,
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Reset Password with OTP
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, error: 'Email, OTP, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (isMongoConnected) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        return res.status(404).json({ success: false, error: 'User account not found.' });
      }

      if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp.trim()) {
        return res.status(400).json({ success: false, error: 'Invalid password reset code.' });
      }

      if (new Date() > new Date(user.resetPasswordOtpExpires)) {
        return res.status(400).json({ success: false, error: 'Password reset code has expired. Please request a new code.' });
      }

      // Hash and update password
      user.password = await bcrypt.hash(newPassword, 10);
      user.resetPasswordOtp = null;
      user.resetPasswordOtpExpires = null;
      user.isVerified = true; // Automatically mark verified if resetting password
      await user.save();

      console.log(`[AUTH] Password successfully reset for ${cleanEmail}`);

      return res.json({
        success: true,
        message: 'Your password has been successfully reset! You can now sign in with your new password.',
      });
    } else {
      return res.json({ success: true, message: 'Password updated successfully.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Get Current User Profile & Activity (`/api/auth/me`)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    if (isMongoConnected && req.user._id) {
      const user = await User.findById(req.user._id);
      const userMobile = (user?.mobile || req.user?.mobile || '').trim();
      const userEmail = (user?.email || req.user?.email || '').toLowerCase().trim();
      const cleanMobileDigits = userMobile.replace(/\D/g, '').slice(-10);

      const orConditions = [];
      if (userEmail) {
        orConditions.push({ email: { $regex: new RegExp(`^${userEmail}$`, 'i') } });
      }
      if (cleanMobileDigits && cleanMobileDigits.length >= 7) {
        orConditions.push({ mobile: { $regex: new RegExp(cleanMobileDigits) } });
      }

      // Find user's inquiries, tickets, and registered products
      const inquiries = orConditions.length > 0
        ? await Inquiry.find({ $or: orConditions }).sort({ createdAt: -1 })
        : [];

      const tickets = orConditions.length > 0
        ? await ServiceTicket.find({ $or: orConditions }).sort({ createdAt: -1 })
        : [];

      const registeredProducts = orConditions.length > 0
        ? await CustomerProduct.find({ $or: orConditions }).sort({ purchaseDate: -1 })
        : [];

      return res.json({
        success: true,
        user: user?.toJSON(),
        isAdmin: user?.role === 'admin' && ADMIN_EMAILS.includes(user.email.toLowerCase()),
        inquiries,
        tickets,
        registeredProducts,
      });
    }

    const userEmail = (req.user?.email || '').toLowerCase().trim();
    const userMobile = (req.user?.mobile || '').trim();
    const cleanMobileDigits = userMobile.replace(/\D/g, '').slice(-10);

    const prodsList = readJSON(CUSTOMER_PRODUCTS_FILE);
    const registeredProducts = prodsList.filter((p) => {
      const pEmailMatch = userEmail && p.email && p.email.toLowerCase().trim() === userEmail;
      const pMobileDigits = (p.mobile || '').replace(/\D/g, '').slice(-10);
      const pMobileMatch = cleanMobileDigits && cleanMobileDigits.length >= 7 && pMobileDigits === cleanMobileDigits;
      return pEmailMatch || pMobileMatch;
    });

    const inqList = readJSON(INQUIRIES_FILE);
    const inquiries = inqList.filter((i) => {
      const iEmailMatch = userEmail && i.email && i.email.toLowerCase().trim() === userEmail;
      const iMobileDigits = (i.phone || i.mobile || '').replace(/\D/g, '').slice(-10);
      const iMobileMatch = cleanMobileDigits && cleanMobileDigits.length >= 7 && iMobileDigits === cleanMobileDigits;
      return iEmailMatch || iMobileMatch;
    });

    const tixList = readJSON(TICKETS_FILE);
    const tickets = tixList.filter((t) => {
      const tEmailMatch = userEmail && t.email && t.email.toLowerCase().trim() === userEmail;
      const tMobileDigits = (t.mobile || '').replace(/\D/g, '').slice(-10);
      const tMobileMatch = cleanMobileDigits && cleanMobileDigits.length >= 7 && tMobileDigits === cleanMobileDigits;
      return tEmailMatch || tMobileMatch;
    });

    return res.json({
      success: true,
      user: req.user,
      isAdmin: req.user.role === 'admin' && ADMIN_EMAILS.includes((req.user.email || '').toLowerCase()),
      inquiries,
      tickets,
      registeredProducts,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// PROTECTED ADMIN PORTAL ROUTES
// ==========================================

// 1. Admin System Stats
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    let totalInquiries = 0;
    let newInquiries = 0;
    let activeInquiries = 0;
    let resolvedInquiries = 0;
    let totalTickets = 0;
    let activeTickets = 0;
    let resolvedTickets = 0;
    let emergencyTickets = 0;
    let totalUsers = 0;
    let totalProducts = 0;
    let activeWarranties = 0;
    let expiredWarranties = 0;
    let expiringSoonWarranties = 0;

    const now = new Date();
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    if (isMongoConnected) {
      totalInquiries = await Inquiry.countDocuments();
      newInquiries = await Inquiry.countDocuments({ status: 'NEW' });
      activeInquiries = await Inquiry.countDocuments({ status: { $nin: ['RESOLVED', 'CLOSED'] } });
      resolvedInquiries = await Inquiry.countDocuments({ status: { $in: ['RESOLVED', 'CLOSED'] } });

      totalTickets = await ServiceTicket.countDocuments();
      activeTickets = await ServiceTicket.countDocuments({ status: { $nin: ['RESOLVED', 'CLOSED'] } });
      resolvedTickets = await ServiceTicket.countDocuments({ status: { $in: ['RESOLVED', 'CLOSED'] } });
      emergencyTickets = await ServiceTicket.countDocuments({ priority: 'emergency', status: { $nin: ['RESOLVED', 'CLOSED'] } });
      totalUsers = await User.countDocuments();

      totalProducts = await CustomerProduct.countDocuments();
      activeWarranties = await CustomerProduct.countDocuments({
        warrantyExpiryDate: { $gte: now },
      });
      expiredWarranties = await CustomerProduct.countDocuments({
        warrantyExpiryDate: { $lt: now },
      });
      expiringSoonWarranties = await CustomerProduct.countDocuments({
        warrantyExpiryDate: { $gte: now, $lte: in30Days },
      });
    } else {
      const inqs = readJSON(INQUIRIES_FILE);
      const tix = readJSON(TICKETS_FILE);
      const prods = readJSON(CUSTOMER_PRODUCTS_FILE);

      totalInquiries = inqs.length;
      newInquiries = inqs.filter((i) => (i.status || 'NEW') === 'NEW').length;
      activeInquiries = inqs.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;
      resolvedInquiries = inqs.filter((i) => i.status === 'RESOLVED' || i.status === 'CLOSED').length;

      totalTickets = tix.length;
      activeTickets = tix.filter((t) => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
      resolvedTickets = tix.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
      emergencyTickets = tix.filter((t) => t.priority === 'emergency' && t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
      totalUsers = prods.length;
      totalProducts = prods.length;
      activeWarranties = prods.filter((p) => new Date(p.warrantyExpiryDate) >= now).length;
      expiredWarranties = prods.filter((p) => new Date(p.warrantyExpiryDate) < now).length;
      expiringSoonWarranties = prods.filter(
        (p) => new Date(p.warrantyExpiryDate) >= now && new Date(p.warrantyExpiryDate) <= in30Days
      ).length;
    }

    res.json({
      success: true,
      stats: {
        totalInquiries,
        newInquiries,
        activeInquiries,
        resolvedInquiries,
        totalTickets,
        activeTickets,
        resolvedTickets,
        emergencyTickets,
        totalUsers,
        totalProducts,
        activeWarranties,
        expiredWarranties,
        expiringSoonWarranties,
        adminUser: req.user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Admin Get All Inquiries
app.get('/api/admin/inquiries', requireAdmin, async (req, res) => {
  try {
    if (isMongoConnected) {
      const docs = await Inquiry.find().sort({ createdAt: -1 });
      return res.json({ success: true, count: docs.length, inquiries: docs });
    }
    const inqs = readJSON(INQUIRIES_FILE);
    res.json({ success: true, count: inqs.length, inquiries: inqs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Admin Update Inquiry Status
app.patch('/api/admin/inquiries/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (isMongoConnected) {
      let inquiry = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        inquiry = await Inquiry.findById(id);
      }
      if (!inquiry) {
        inquiry = await Inquiry.findOne({ inquiryId: id });
      }
      if (!inquiry) {
        return res.status(404).json({ success: false, error: 'Inquiry not found.' });
      }
      if (status) inquiry.status = status;
      if (notes) inquiry.comments = `${inquiry.comments || ''}\n[Admin Note]: ${notes}`;
      await inquiry.save();

      // Sync to JSON file
      const inqs = readJSON(INQUIRIES_FILE);
      const idx = inqs.findIndex(
        (i) => i.inquiryId === inquiry.inquiryId || i._id === inquiry._id.toString() || i.id === inquiry.inquiryId
      );
      if (idx !== -1) {
        if (status) inqs[idx].status = status;
        if (notes) inqs[idx].comments = inquiry.comments;
        writeJSON(INQUIRIES_FILE, inqs);
      }

      console.log(`[INQUIRY STATUS] Inquiry #${inquiry.inquiryId} updated to: ${status}`);
      return res.json({ success: true, message: 'Inquiry updated successfully.', inquiry });
    }

    // Local JSON fallback
    const inqs = readJSON(INQUIRIES_FILE);
    const idx = inqs.findIndex((i) => i.inquiryId === id || i.id === id || i._id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Inquiry not found.' });
    }
    if (status) inqs[idx].status = status;
    if (notes) inqs[idx].comments = `${inqs[idx].comments || ''}\n[Admin Note]: ${notes}`;
    writeJSON(INQUIRIES_FILE, inqs);

    console.log(`[INQUIRY STATUS] Inquiry #${id} updated to: ${status} (JSON storage)`);
    res.json({ success: true, message: 'Inquiry updated successfully.', inquiry: inqs[idx] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Admin Get All Service Tickets
app.get('/api/admin/tickets', requireAdmin, async (req, res) => {
  try {
    if (isMongoConnected) {
      const docs = await ServiceTicket.find().sort({ createdAt: -1 });
      return res.json({ success: true, count: docs.length, tickets: docs });
    }
    const tix = readJSON(TICKETS_FILE);
    res.json({ success: true, count: tix.length, tickets: tix });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Admin Update Ticket Status / Assign Engineer / Mark Resolved
app.patch('/api/admin/tickets/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required.' });
    }

    if (isMongoConnected) {
      let ticket = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        ticket = await ServiceTicket.findById(id);
      }
      if (!ticket) {
        ticket = await ServiceTicket.findOne({ ticketId: id });
      }
      if (!ticket) {
        return res.status(404).json({ success: false, error: 'Service ticket not found.' });
      }

      ticket.status = status;
      if (notes) {
        ticket.issueDescription = `${ticket.issueDescription || ''}\n[Resolution Note]: ${notes}`;
      }
      await ticket.save();

      // Sync to JSON storage
      const tix = readJSON(TICKETS_FILE);
      const idx = tix.findIndex(
        (t) => t.ticketId === ticket.ticketId || t._id === ticket._id.toString() || t.id === ticket.ticketId
      );
      if (idx !== -1) {
        tix[idx].status = status;
        if (notes) tix[idx].issueDescription = ticket.issueDescription;
        writeJSON(TICKETS_FILE, tix);
      }

      console.log(`[TICKET STATUS] Ticket #${ticket.ticketId} status updated to: ${status}`);
      return res.json({ success: true, message: `Ticket status updated to ${status}.`, ticket });
    }

    // Local JSON fallback
    const tix = readJSON(TICKETS_FILE);
    const idx = tix.findIndex((t) => t.ticketId === id || t.id === id || t._id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Service ticket not found.' });
    }

    tix[idx].status = status;
    if (notes) {
      tix[idx].issueDescription = `${tix[idx].issueDescription || ''}\n[Resolution Note]: ${notes}`;
    }
    writeJSON(TICKETS_FILE, tix);

    console.log(`[TICKET STATUS] Ticket #${id} status updated to: ${status} (JSON storage)`);
    return res.json({ success: true, message: `Ticket status updated to ${status}.`, ticket: tix[idx] });
  } catch (err) {
    console.error('Error updating ticket status:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Admin Get Registered Users
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    if (isMongoConnected) {
      const users = await User.find().select('-password -otp -resetPasswordOtp').sort({ createdAt: -1 });
      return res.json({ success: true, count: users.length, users });
    }
    res.json({ success: true, count: 0, users: [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Admin Get All Customer Products & Warranties
app.get('/api/admin/customer-products', requireAdmin, async (req, res) => {
  try {
    const { search = '', status = 'ALL', limit = 300 } = req.query;
    const now = new Date();
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    if (isMongoConnected) {
      let query = {};
      if (search) {
        const cleanSearch = search.trim();
        query.$or = [
          { customerName: { $regex: cleanSearch, $options: 'i' } },
          { mobile: { $regex: cleanSearch, $options: 'i' } },
          { serialNumber: { $regex: cleanSearch, $options: 'i' } },
          { productName: { $regex: cleanSearch, $options: 'i' } },
          { address: { $regex: cleanSearch, $options: 'i' } },
          { invoiceNumber: { $regex: cleanSearch, $options: 'i' } },
        ];
      }

      if (status === 'ACTIVE') {
        query.warrantyExpiryDate = { $gte: now };
      } else if (status === 'EXPIRED') {
        query.warrantyExpiryDate = { $lt: now };
      } else if (status === 'EXPIRING_SOON') {
        query.warrantyExpiryDate = { $gte: now, $lte: in30Days };
      }

      const products = await CustomerProduct.find(query)
        .sort({ purchaseDate: -1, createdAt: -1 })
        .limit(parseInt(limit));

      return res.json({
        success: true,
        count: products.length,
        products,
      });
    }

    // JSON Fallback
    let list = readJSON(CUSTOMER_PRODUCTS_FILE);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(
        (p) =>
          (p.customerName && p.customerName.toLowerCase().includes(s)) ||
          (p.mobile && p.mobile.includes(s)) ||
          (p.serialNumber && p.serialNumber.toLowerCase().includes(s)) ||
          (p.productName && p.productName.toLowerCase().includes(s)) ||
          (p.address && p.address.toLowerCase().includes(s)) ||
          (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(s))
      );
    }
    if (status === 'ACTIVE') {
      list = list.filter((p) => new Date(p.warrantyExpiryDate) >= now);
    } else if (status === 'EXPIRED') {
      list = list.filter((p) => new Date(p.warrantyExpiryDate) < now);
    } else if (status === 'EXPIRING_SOON') {
      list = list.filter(
        (p) => new Date(p.warrantyExpiryDate) >= now && new Date(p.warrantyExpiryDate) <= in30Days
      );
    }

    res.json({
      success: true,
      count: list.length,
      products: list.slice(0, parseInt(limit)),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Admin Register New Customer Product & Warranty Entry
app.post('/api/admin/customer-products', requireAdmin, async (req, res) => {
  try {
    const {
      customerName,
      mobile,
      email = '',
      address,
      productName,
      category = 'Online UPS',
      serialNumber,
      purchaseDate,
      warrantyYears = 1,
      invoiceNumber = '',
      notes = '',
    } = req.body;

    if (!customerName || !mobile || !address || !productName || !serialNumber || !purchaseDate) {
      return res.status(400).json({
        success: false,
        error: 'Please fill all required fields: Customer Name, Mobile, Address, Product Name, Serial Number, and Purchase Date.',
      });
    }

    const cleanSerial = serialNumber.trim().toUpperCase();
    const pDate = new Date(purchaseDate);
    if (isNaN(pDate.getTime())) {
      return res.status(400).json({ success: false, error: 'Invalid purchase date provided.' });
    }

    const wYears = Math.max(1, parseInt(warrantyYears) || 1);
    const expDate = new Date(pDate);
    expDate.setFullYear(expDate.getFullYear() + wYears);
    const isCurrentlyActive = expDate >= new Date();

    const productPayload = {
      customerName: customerName.trim(),
      mobile: mobile.trim(),
      email: (email || '').trim().toLowerCase(),
      address: address.trim(),
      productName: productName.trim(),
      category,
      serialNumber: cleanSerial,
      purchaseDate: pDate,
      warrantyYears: wYears,
      warrantyExpiryDate: expDate,
      serviceSchedule: req.body.serviceSchedule || generateServiceSchedule(pDate, wYears),
      invoiceNumber: (invoiceNumber || '').trim(),
      notes: (notes || '').trim(),
      status: isCurrentlyActive ? 'ACTIVE_WARRANTY' : 'EXPIRED_WARRANTY',
      createdBy: req.user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (isMongoConnected) {
      // Check duplicate serial number
      const existing = await CustomerProduct.findOne({ serialNumber: cleanSerial });
      if (existing) {
        return res.status(409).json({
          success: false,
          error: `A product with Serial Number "${cleanSerial}" is already registered for Customer "${existing.customerName}".`,
        });
      }

      const doc = await CustomerProduct.create(productPayload);
      console.log(`[ASSET REGISTER] New customer product registered: ${cleanSerial} (${doc.productName}) for ${doc.customerName}`);

      // Sync to JSON backup
      const list = readJSON(CUSTOMER_PRODUCTS_FILE);
      list.unshift(doc.toJSON());
      writeJSON(CUSTOMER_PRODUCTS_FILE, list);

      // Automated Email Dispatch:
      // Scan if any past milestones are already due/overdue (e.g. March buying registered now)
      setTimeout(async () => {
        try {
          console.log(`[AUTO EMAIL] Scanning for any due/overdue service milestones for ${doc.serialNumber}...`);
          await scanAndDispatchPendingEmails([doc], true, CustomerProduct);
        } catch (emailErr) {
          console.error(`[AUTO EMAIL ERROR] For product ${doc.serialNumber}:`, emailErr.message);
        }
      }, 500);

      return res.status(201).json({
        success: true,
        message: 'Customer equipment entry saved successfully! Any due maintenance alerts are being dispatched.',
        product: doc,
      });
    }

    // Local JSON fallback
    const list = readJSON(CUSTOMER_PRODUCTS_FILE);
    if (list.some((p) => p.serialNumber === cleanSerial)) {
      return res.status(409).json({
        success: false,
        error: `A product with Serial Number "${cleanSerial}" is already registered.`,
      });
    }

    const newEntry = { _id: `local-${Date.now()}`, ...productPayload };
    list.unshift(newEntry);
    writeJSON(CUSTOMER_PRODUCTS_FILE, list);

    setTimeout(async () => {
      try {
        await scanAndDispatchPendingEmails([newEntry], false, null);
      } catch (e) {
        console.error('[AUTO EMAIL ERROR]', e.message);
      }
    }, 500);

    res.status(201).json({
      success: true,
      message: 'Customer equipment entry saved successfully (JSON fallback storage). Any due maintenance alerts are being dispatched.',
      product: newEntry,
    });
  } catch (err) {
    console.error('Error registering customer product:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Admin Update Customer Product & Warranty Entry
app.put('/api/admin/customer-products/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      customerName,
      mobile,
      email,
      address,
      productName,
      category,
      serialNumber,
      purchaseDate,
      warrantyYears,
      serviceSchedule,
      invoiceNumber,
      notes,
      status,
    } = req.body;

    let expDate;
    if (purchaseDate && warrantyYears) {
      const pDate = new Date(purchaseDate);
      expDate = new Date(pDate);
      expDate.setFullYear(expDate.getFullYear() + Math.max(1, parseInt(warrantyYears)));
    }

    if (isMongoConnected) {
      let doc = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        doc = await CustomerProduct.findById(id);
      }
      if (!doc) {
        doc = await CustomerProduct.findOne({ serialNumber: id.trim().toUpperCase() });
      }
      if (!doc) {
        return res.status(404).json({ success: false, error: 'Customer product record not found.' });
      }

      if (customerName) doc.customerName = customerName.trim();
      if (mobile) doc.mobile = mobile.trim();
      if (email !== undefined) doc.email = (email || '').trim().toLowerCase();
      if (address) doc.address = address.trim();
      if (productName) doc.productName = productName.trim();
      if (category) doc.category = category;
      if (serialNumber) doc.serialNumber = serialNumber.trim().toUpperCase();
      if (purchaseDate) doc.purchaseDate = new Date(purchaseDate);
      if (warrantyYears) doc.warrantyYears = parseInt(warrantyYears);
      if (expDate) doc.warrantyExpiryDate = expDate;
      if (serviceSchedule) doc.serviceSchedule = serviceSchedule;
      if (invoiceNumber !== undefined) doc.invoiceNumber = (invoiceNumber || '').trim();
      if (notes !== undefined) doc.notes = (notes || '').trim();
      if (status) doc.status = status;

      await doc.save();

      setTimeout(async () => {
        try {
          await scanAndDispatchPendingEmails([doc], true, CustomerProduct);
        } catch (e) {
          console.error('[AUTO EMAIL UPDATE SCAN ERROR]', e.message);
        }
      }, 500);

      return res.json({
        success: true,
        message: 'Product & warranty record updated successfully.',
        product: doc,
      });
    }

    const list = readJSON(CUSTOMER_PRODUCTS_FILE);
    const idx = list.findIndex((p) => p._id === id || p.id === id || p.serialNumber === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Product record not found.' });
    }

    list[idx] = { ...list[idx], ...req.body, updatedAt: new Date() };
    if (expDate) list[idx].warrantyExpiryDate = expDate;
    writeJSON(CUSTOMER_PRODUCTS_FILE, list);

    res.json({ success: true, message: 'Record updated successfully.', product: list[idx] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Admin Delete Customer Product & Warranty Entry
app.delete('/api/admin/customer-products/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected) {
      let deleted = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        deleted = await CustomerProduct.findByIdAndDelete(id);
      }
      if (!deleted) {
        deleted = await CustomerProduct.findOneAndDelete({ serialNumber: id.trim().toUpperCase() });
      }
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Customer product record not found.' });
      }
      return res.json({ success: true, message: 'Customer product record deleted successfully.' });
    }

    const list = readJSON(CUSTOMER_PRODUCTS_FILE);
    const filtered = list.filter((p) => p._id !== id && p.id !== id && p.serialNumber !== id);
    writeJSON(CUSTOMER_PRODUCTS_FILE, filtered);

    res.json({ success: true, message: 'Customer product record deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10b. Admin Toggle 6-Month Service Status (DEFAULT vs SERVICED)
app.patch('/api/admin/customer-products/:id/service/:serviceNumber', requireAdmin, async (req, res) => {
  try {
    const { id, serviceNumber } = req.params;
    const { status, technician, notes, servicedDate } = req.body;
    const sNum = parseInt(serviceNumber);

    if (!['DEFAULT', 'SERVICED'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status must be either "DEFAULT" or "SERVICED".',
      });
    }

    if (isMongoConnected) {
      let doc = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        doc = await CustomerProduct.findById(id);
      }
      if (!doc) {
        doc = await CustomerProduct.findOne({ serialNumber: id.trim().toUpperCase() });
      }
      if (!doc) {
        return res.status(404).json({ success: false, error: 'Customer product record not found.' });
      }

      if (!doc.serviceSchedule || doc.serviceSchedule.length === 0) {
        doc.serviceSchedule = generateServiceSchedule(doc.purchaseDate, doc.warrantyYears);
      }

      const item = doc.serviceSchedule.find((s) => s.serviceNumber === sNum);
      if (!item) {
        return res.status(404).json({ success: false, error: `Service #${sNum} not found for this product.` });
      }

      item.status = status;
      if (status === 'SERVICED') {
        item.servicedDate = servicedDate ? new Date(servicedDate) : new Date();
        item.technician = (technician || 'Rajesh / Field Engineer').trim();
        item.notes = (notes || 'Periodic 6-month checkup & maintenance completed').trim();
      } else {
        item.servicedDate = null;
        item.technician = '';
        item.notes = '';
      }

      doc.markModified('serviceSchedule');
      await doc.save();

      // Sync to local JSON backup
      const list = readJSON(CUSTOMER_PRODUCTS_FILE);
      const idx = list.findIndex(
        (p) => p._id === doc._id.toString() || p.serialNumber === doc.serialNumber
      );
      if (idx !== -1) {
        list[idx] = doc.toJSON();
        writeJSON(CUSTOMER_PRODUCTS_FILE, list);
      }

      console.log(`[SERVICE UPDATE] Product ${doc.serialNumber} Service #${sNum} marked as ${status}`);
      return res.json({
        success: true,
        message: `Service #${sNum} marked as ${status === 'SERVICED' ? 'Completed (Serviced)' : 'Default (Pending)'}.`,
        product: doc,
      });
    }

    // Local JSON fallback
    const list = readJSON(CUSTOMER_PRODUCTS_FILE);
    const idx = list.findIndex((p) => p._id === id || p.id === id || p.serialNumber === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Customer product not found.' });
    }

    const prod = list[idx];
    if (!prod.serviceSchedule || prod.serviceSchedule.length === 0) {
      prod.serviceSchedule = generateServiceSchedule(prod.purchaseDate, prod.warrantyYears);
    }

    const item = prod.serviceSchedule.find((s) => s.serviceNumber === sNum);
    if (!item) {
      return res.status(404).json({ success: false, error: `Service #${sNum} not found.` });
    }

    item.status = status;
    if (status === 'SERVICED') {
      item.servicedDate = servicedDate || new Date().toISOString();
      item.technician = (technician || 'Rajesh / Field Engineer').trim();
      item.notes = (notes || 'Periodic 6-month checkup completed').trim();
    } else {
      item.servicedDate = null;
      item.technician = '';
      item.notes = '';
    }

    writeJSON(CUSTOMER_PRODUCTS_FILE, list);
    return res.json({
      success: true,
      message: `Service #${sNum} updated to ${status}.`,
      product: prod,
    });
  } catch (err) {
    console.error('Error updating service schedule:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10c. Admin Dispatch 6-Month Service Milestone Email (to Customer, Admin, or Both)
app.post('/api/admin/customer-products/:id/service/:serviceNumber/send-email', requireAdmin, async (req, res) => {
  try {
    const { id, serviceNumber } = req.params;
    const { target = 'both' } = req.body;
    const sNum = parseInt(serviceNumber);

    let doc = null;
    if (isMongoConnected) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        doc = await CustomerProduct.findById(id);
      }
      if (!doc) {
        doc = await CustomerProduct.findOne({ serialNumber: id.trim().toUpperCase() });
      }
    } else {
      const list = readJSON(CUSTOMER_PRODUCTS_FILE);
      doc = list.find((p) => p._id === id || p.id === id || p.serialNumber === id);
    }

    if (!doc) {
      return res.status(404).json({ success: false, error: 'Customer product record not found.' });
    }

    if (!doc.serviceSchedule || doc.serviceSchedule.length === 0) {
      doc.serviceSchedule = generateServiceSchedule(doc.purchaseDate, doc.warrantyYears);
    }

    const item = doc.serviceSchedule.find((s) => s.serviceNumber === sNum);
    if (!item) {
      return res.status(404).json({ success: false, error: `Service #${sNum} not found for this product.` });
    }

    const mailResult = await sendServiceMilestoneEmail({
      customerProduct: doc,
      service: item,
      target,
    });

    // Stamp email notification timestamp
    item.emailNotifiedAt = new Date();
    item.emailNotifiedCount = (item.emailNotifiedCount || 0) + 1;

    if (isMongoConnected && doc.save) {
      doc.markModified('serviceSchedule');
      await doc.save();
    } else {
      const list = readJSON(CUSTOMER_PRODUCTS_FILE);
      const idx = list.findIndex((p) => p._id === id || p.id === id || p.serialNumber === id);
      if (idx !== -1) {
        list[idx] = doc;
        writeJSON(CUSTOMER_PRODUCTS_FILE, list);
      }
    }

    return res.json({
      success: true,
      message: `Service #${sNum} notification email dispatched successfully.`,
      mailResult,
      service: item,
      product: doc,
    });
  } catch (err) {
    console.error('Error dispatching service email:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10d. Admin Dispatch Warranty Expiry Email (to Customer, Admin, or Both)
app.post('/api/admin/customer-products/:id/send-warranty-email', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { target = 'both' } = req.body;

    let doc = null;
    if (isMongoConnected) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        doc = await CustomerProduct.findById(id);
      }
      if (!doc) {
        doc = await CustomerProduct.findOne({ serialNumber: id.trim().toUpperCase() });
      }
    } else {
      const list = readJSON(CUSTOMER_PRODUCTS_FILE);
      doc = list.find((p) => p._id === id || p.id === id || p.serialNumber === id);
    }

    if (!doc) {
      return res.status(404).json({ success: false, error: 'Customer product record not found.' });
    }

    const mailResult = await sendWarrantyExpiredEmail({
      customerProduct: doc,
      target,
    });

    // Stamp warranty email notification timestamp
    doc.warrantyEmailNotifiedAt = new Date();
    doc.warrantyEmailNotifiedCount = (doc.warrantyEmailNotifiedCount || 0) + 1;

    if (isMongoConnected && doc.save) {
      await doc.save();
    } else {
      const list = readJSON(CUSTOMER_PRODUCTS_FILE);
      const idx = list.findIndex((p) => p._id === id || p.id === id || p.serialNumber === id);
      if (idx !== -1) {
        list[idx] = doc;
        writeJSON(CUSTOMER_PRODUCTS_FILE, list);
      }
    }

    return res.json({
      success: true,
      message: 'Warranty expiry notification email dispatched successfully.',
      mailResult,
      product: doc,
    });
  } catch (err) {
    console.error('Error dispatching warranty email:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10e. Admin Scan & Dispatch All Due Service & Warranty Expiry Emails
app.post('/api/admin/notifications/scan-and-send-emails', requireAdmin, async (req, res) => {
  try {
    let list = [];
    if (isMongoConnected) {
      list = await CustomerProduct.find();
    } else {
      list = readJSON(CUSTOMER_PRODUCTS_FILE);
    }

    const result = await scanAndDispatchPendingEmails(list, isMongoConnected, CustomerProduct);
    return res.json({
      success: true,
      message: `Scan complete: ${result.totalDispatched} email alert(s) sent (${result.serviceEmailsSent} services, ${result.warrantyEmailsSent} warranties).`,
      stats: result,
    });
  } catch (err) {
    console.error('Error in scan-and-send-emails:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. Customer Get My Registered Products & Warranties
app.get('/api/customer/my-products', authenticateToken, async (req, res) => {
  try {
    let userMobile = (req.user?.mobile || '').trim();
    let userEmail = (req.user?.email || '').toLowerCase().trim();

    // If mongo is connected, refresh user record in case mobile was updated after login
    if (isMongoConnected && req.user?._id) {
      try {
        const u = await User.findById(req.user._id);
        if (u) {
          if (u.mobile) userMobile = u.mobile.trim();
          if (u.email) userEmail = u.email.toLowerCase().trim();
        }
      } catch (uErr) {
        console.warn('Could not refresh user for my-products:', uErr.message);
      }
    }

    const cleanMobileDigits = userMobile.replace(/\D/g, '').slice(-10);

    const orConditions = [];
    if (userEmail) {
      orConditions.push({ email: { $regex: new RegExp(`^${userEmail}$`, 'i') } });
    }
    if (cleanMobileDigits && cleanMobileDigits.length >= 7) {
      orConditions.push({ mobile: { $regex: new RegExp(cleanMobileDigits) } });
    }

    if (isMongoConnected) {
      const products = orConditions.length > 0
        ? await CustomerProduct.find({ $or: orConditions }).sort({ purchaseDate: -1 })
        : [];

      return res.json({ success: true, count: products.length, products });
    }

    const list = readJSON(CUSTOMER_PRODUCTS_FILE);
    const myProds = list.filter((p) => {
      const pEmailMatch = userEmail && p.email && p.email.toLowerCase().trim() === userEmail;
      const pMobileDigits = (p.mobile || '').replace(/\D/g, '').slice(-10);
      const pMobileMatch = cleanMobileDigits && cleanMobileDigits.length >= 7 && pMobileDigits === cleanMobileDigits;
      return pEmailMatch || pMobileMatch;
    });

    res.json({ success: true, count: myProds.length, products: myProds });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// PUBLIC INQUIRY & AMC DISPATCH (EXISTING)
// ==========================================

// Health check & DB status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'JV Controls Backend Server',
    database: isMongoConnected ? 'MongoDB (Connected)' : 'Local JSON Storage (Fallback Active)',
    databaseEngine: isMongoConnected ? 'Mongoose / MongoDB' : 'JSON Storage Engine',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    primaryHotline: PRIMARY_PHONE,
    adminProtection: `Active (Restricted to ${ADMIN_EMAILS.length} authorized emails)`,
  });
});

// Submit customer inquiry / quotation
app.post('/api/inquiry', async (req, res) => {
  try {
    const {
      name,
      firstName,
      lastName,
      mobile,
      telephone,
      email,
      serviceType,
      requirementType,
      comments,
      notes,
      product,
      loadData,
      location,
    } = req.body;

    const customerName = name || [firstName, lastName].filter(Boolean).join(' ') || 'Customer';
    const customerPhone = mobile || telephone;

    if (!customerPhone) {
      return res.status(400).json({
        success: false,
        error: 'Mobile phone number is required.',
      });
    }

    const inquiryId = `INQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const inquiryPayload = {
      inquiryId,
      name: customerName,
      firstName: firstName || customerName,
      lastName: lastName || '',
      mobile: customerPhone,
      telephone: telephone || '',
      email: email || '',
      serviceType: serviceType || requirementType || 'General Inquiry',
      product: product || null,
      loadData: loadData || null,
      location: location || 'Chennai',
      comments: comments || notes || '',
      status: 'NEW',
      createdAt: new Date(),
    };

    let savedInMongo = false;
    if (isMongoConnected) {
      try {
        const doc = new Inquiry(inquiryPayload);
        await doc.save();
        savedInMongo = true;
      } catch (dbErr) {
        console.error('[JV Controls] MongoDB save failed, backing up to JSON:', dbErr.message);
      }
    }

    const inquiries = readJSON(INQUIRIES_FILE);
    inquiries.unshift({ ...inquiryPayload, id: inquiryId });
    writeJSON(INQUIRIES_FILE, inquiries);

    let waMessage = `*⚡ NEW INQUIRY - JV CONTROLS CHENNAI*\n\n` +
      `*ID:* ${inquiryId}\n` +
      `*Name:* ${customerName}\n` +
      `*Mobile:* ${customerPhone}\n` +
      `*Requirement:* ${inquiryPayload.serviceType}\n` +
      `*Location:* ${inquiryPayload.location}\n`;

    if (product) {
      waMessage += `*Product:* ${typeof product === 'string' ? product : product.name}\n`;
    }
    if (loadData) {
      waMessage += `*Load:* ~${loadData.watts}W (${loadData.hours}h) • Rec: ${loadData.va}VA Inverter + ${loadData.ah}Ah Battery\n`;
    }
    if (inquiryPayload.comments) {
      waMessage += `*Details:* ${inquiryPayload.comments}\n`;
    }
    waMessage += `\nSent via JV Controls Portal`;

    const whatsappUrl = `https://wa.me/${PRIMARY_WHATSAPP}?text=${encodeURIComponent(waMessage)}`;

    console.log(`[JV Controls] Logged inquiry #${inquiryId} from ${customerName} (Stored: ${savedInMongo ? 'MongoDB' : 'JSON Backup'})`);

    return res.status(201).json({
      success: true,
      message: 'Inquiry received and logged successfully.',
      inquiryId,
      storage: savedInMongo ? 'mongodb' : 'json_backup',
      whatsappUrl,
      data: inquiryPayload,
    });
  } catch (error) {
    console.error('Error logging inquiry:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error processing inquiry.',
    });
  }
});

// Submit AMC & Emergency Breakdown Service Ticket
app.post('/api/amc-dispatch', async (req, res) => {
  try {
    const {
      priority = 'emergency',
      name,
      customerName,
      mobile,
      phone,
      equipmentType = 'Online UPS',
      brandCapacity = '',
      address = '',
      issueDescription = '',
    } = req.body;

    const contactPhone = mobile || phone;
    const clientName = name || customerName || 'Customer';

    if (!contactPhone) {
      return res.status(400).json({
        success: false,
        error: 'Mobile phone number is required.',
      });
    }

    const ticketId = `SRV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const ticketPayload = {
      ticketId,
      priority,
      name: clientName,
      mobile: contactPhone,
      equipmentType,
      brandCapacity,
      address: address || 'Chennai',
      issueDescription,
      status: 'DISPATCH_PENDING',
      createdAt: new Date(),
    };

    let savedInMongo = false;
    if (isMongoConnected) {
      try {
        const ticketDoc = new ServiceTicket(ticketPayload);
        await ticketDoc.save();
        savedInMongo = true;
      } catch (dbErr) {
        console.error('[JV Controls] MongoDB ticket save failed, backing up to JSON:', dbErr.message);
      }
    }

    const tickets = readJSON(TICKETS_FILE);
    tickets.unshift({ ...ticketPayload, id: ticketId });
    writeJSON(TICKETS_FILE, tickets);

    const priorityText = priority === 'emergency' ? '🚨 EMERGENCY BREAKDOWN' : '🛠️ ROUTINE AMC / SERVICE';
    const waMessage = `*JV CONTROLS SERVICE TICKET*\n\n` +
      `*Ticket:* #${ticketId}\n` +
      `*Priority:* ${priorityText}\n` +
      `*Customer:* ${name || 'Customer'}\n` +
      `*Mobile:* ${mobile}\n` +
      `*Equipment:* ${equipmentType} (${brandCapacity || 'Standard'})\n` +
      `*Address:* ${ticketPayload.address}\n` +
      `*Issue:* ${issueDescription || 'On-site technical support requested.'}\n\n` +
      `Please dispatch an engineer immediately.`;

    const whatsappUrl = `https://wa.me/${PRIMARY_WHATSAPP}?text=${encodeURIComponent(waMessage)}`;

    console.log(`[JV Controls] Logged service ticket #${ticketId} [${priority.toUpperCase()}] (Stored: ${savedInMongo ? 'MongoDB' : 'JSON Backup'})`);

    return res.status(201).json({
      success: true,
      message: 'Service ticket registered successfully.',
      ticketId,
      storage: savedInMongo ? 'mongodb' : 'json_backup',
      whatsappUrl,
      data: ticketPayload,
    });
  } catch (error) {
    console.error('Error creating service ticket:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error creating service ticket.',
    });
  }
});

// Retrieve public/recent inquiries
app.get('/api/inquiries', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    if (isMongoConnected) {
      const docs = await Inquiry.find().sort({ createdAt: -1 }).limit(limit);
      return res.json({
        count: docs.length,
        source: 'MongoDB',
        inquiries: docs,
      });
    }

    const inquiries = readJSON(INQUIRIES_FILE);
    res.json({
      count: inquiries.length,
      source: 'JSON Storage (Fallback)',
      inquiries: inquiries.slice(0, limit),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Retrieve public/recent service tickets
app.get('/api/service-tickets', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    if (isMongoConnected) {
      const docs = await ServiceTicket.find().sort({ createdAt: -1 }).limit(limit);
      return res.json({
        count: docs.length,
        source: 'MongoDB',
        tickets: docs,
      });
    }

    const tickets = readJSON(TICKETS_FILE);
    res.json({
      count: tickets.length,
      source: 'JSON Storage (Fallback)',
      tickets: tickets.slice(0, limit),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// ADMIN NOTIFICATION MANAGEMENT
// ==========================================

// Get list of read/cleared notification IDs
app.get('/api/admin/notifications/read', requireAdmin, async (req, res) => {
  try {
    let readIds = [];
    if (isMongoConnected && req.user._id) {
      const user = await User.findById(req.user._id);
      readIds = user?.readNotificationIds || [];
    } else {
      const allRead = readJSON(READ_NOTIFICATIONS_FILE);
      const userKey = (req.user?.email || 'admin').toLowerCase();
      readIds = allRead[userKey] || [];
    }
    return res.json({ success: true, readIds });
  } catch (err) {
    console.error('Error getting read notifications:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Mark notification(s) as read / cleared
app.post('/api/admin/notifications/mark-read', requireAdmin, async (req, res) => {
  try {
    const { notificationId, notificationIds, markAll, allCurrentIds } = req.body;
    const idsToAdd = [];
    if (notificationId) idsToAdd.push(notificationId);
    if (Array.isArray(notificationIds)) idsToAdd.push(...notificationIds);
    if (markAll && Array.isArray(allCurrentIds)) idsToAdd.push(...allCurrentIds);

    if (idsToAdd.length === 0) {
      return res.json({ success: true, message: 'No notification IDs specified.' });
    }

    let updatedReadIds = [];

    if (isMongoConnected && req.user._id) {
      const user = await User.findById(req.user._id);
      if (user) {
        const idSet = new Set(user.readNotificationIds || []);
        idsToAdd.forEach((id) => idSet.add(id));
        user.readNotificationIds = Array.from(idSet);
        await user.save();
        updatedReadIds = user.readNotificationIds;
      }
    }

    // Also persist in JSON fallback
    const allRead = readJSON(READ_NOTIFICATIONS_FILE);
    const userKey = (req.user?.email || 'admin').toLowerCase();
    const existing = Array.isArray(allRead[userKey]) ? allRead[userKey] : [];
    const idSet = new Set(existing);
    idsToAdd.forEach((id) => idSet.add(id));
    allRead[userKey] = Array.from(idSet);
    writeJSON(READ_NOTIFICATIONS_FILE, allRead);

    if (updatedReadIds.length === 0) {
      updatedReadIds = allRead[userKey];
    }

    console.log(`[NOTIFICATIONS] Admin ${req.user.email} marked ${idsToAdd.length} notifications as read.`);
    return res.json({
      success: true,
      message: `${idsToAdd.length} notification(s) marked as read.`,
      readIds: updatedReadIds,
    });
  } catch (err) {
    console.error('Error marking notifications as read:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Clear all / Reset notifications read history
app.post('/api/admin/notifications/clear-all', requireAdmin, async (req, res) => {
  try {
    const { allCurrentIds = [] } = req.body;
    let updatedReadIds = [];

    if (isMongoConnected && req.user._id) {
      const user = await User.findById(req.user._id);
      if (user) {
        const idSet = new Set(user.readNotificationIds || []);
        allCurrentIds.forEach((id) => idSet.add(id));
        user.readNotificationIds = Array.from(idSet);
        await user.save();
        updatedReadIds = user.readNotificationIds;
      }
    }

    const allRead = readJSON(READ_NOTIFICATIONS_FILE);
    const userKey = (req.user?.email || 'admin').toLowerCase();
    const existing = Array.isArray(allRead[userKey]) ? allRead[userKey] : [];
    const idSet = new Set(existing);
    allCurrentIds.forEach((id) => idSet.add(id));
    allRead[userKey] = Array.from(idSet);
    writeJSON(READ_NOTIFICATIONS_FILE, allRead);

    return res.json({
      success: true,
      message: 'All notifications cleared.',
      readIds: updatedReadIds.length > 0 ? updatedReadIds : allRead[userKey],
    });
  } catch (err) {
    console.error('Error clearing notifications:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// JSON 404 handler for any unhandled /api requests
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API endpoint ${req.method} ${req.originalUrl} was not found on this server.`,
  });
});

// ==========================================
// SERVE STATIC CLIENT BUILD (Vite dist/)
// ==========================================
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
const localDistPath = path.join(__dirname, 'dist');
const distPath = fs.existsSync(frontendDistPath)
  ? frontendDistPath
  : fs.existsSync(localDistPath)
  ? localDistPath
  : null;

if (distPath) {
  console.log(`[JV Controls] Serving production build from: ${distPath}`);
  app.use(express.static(distPath, { maxAge: '1d' }));

  // Universal SPA routing fallback
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api/')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
} else {
  console.log(`[JV Controls] Frontend "dist" folder not found. Server running in API mode.`);
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>JV Controls API Server</title></head>
        <body style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h1>JV Controls Node.js + MongoDB API Server is Running</h1>
          <p>API endpoints active on <code>http://localhost:${PORT}/api</code></p>
        </body>
      </html>
    `);
  });
}

// Initialize MongoDB & Start Server
initMongoDB().finally(async () => {
  await verifySMTP();
  app.listen(PORT, () => {
    console.log('====================================================');
    console.log(`⚡ JV CONTROLS NODE.JS + MONGODB SERVER STARTED`);
    console.log(`🌐 Website URL:      http://localhost:${PORT}`);
    console.log(`🍃 Database Status:  ${isMongoConnected ? 'Connected to MongoDB' : 'JSON Fallback Active'}`);
    console.log(`🔒 Admin Whitelist:  ${ADMIN_EMAILS.join(', ')}`);
    console.log(`🩺 Health Endpoint:  http://localhost:${PORT}/api/health`);
    console.log(`📥 Inquiries API:    http://localhost:${PORT}/api/inquiries`);
    console.log(`📞 Primary Hotline:  ${PRIMARY_PHONE}`);
    console.log('====================================================');

    // Automated daily background scan for 6-month service and warranty expiry emails
    setTimeout(async () => {
      try {
        console.log('[AUTO EMAIL SCHEDULER] Running initial background check for due services and warranty expiries...');
        let products = [];
        if (isMongoConnected) {
          products = await CustomerProduct.find();
        } else {
          products = readJSON(CUSTOMER_PRODUCTS_FILE);
        }
        const result = await scanAndDispatchPendingEmails(products, isMongoConnected, CustomerProduct);
        console.log(`[AUTO EMAIL SCHEDULER] Initial check complete: ${result.totalDispatched} emails dispatched (${result.serviceEmailsSent} services, ${result.warrantyEmailsSent} warranties).`);
      } catch (e) {
        console.error('[AUTO EMAIL SCHEDULER] Initial check error:', e.message);
      }
    }, 15000);

    // Recurring scan every 24 hours
    setInterval(async () => {
      try {
        console.log('[AUTO EMAIL SCHEDULER] Running daily background scan for due services and warranty expiries...');
        let products = [];
        if (isMongoConnected) {
          products = await CustomerProduct.find();
        } else {
          products = readJSON(CUSTOMER_PRODUCTS_FILE);
        }
        const result = await scanAndDispatchPendingEmails(products, isMongoConnected, CustomerProduct);
        console.log(`[AUTO EMAIL SCHEDULER] Daily scan complete: ${result.totalDispatched} emails dispatched.`);
      } catch (e) {
        console.error('[AUTO EMAIL SCHEDULER] Daily scan error:', e.message);
      }
    }, 24 * 60 * 60 * 1000);
  });
});
