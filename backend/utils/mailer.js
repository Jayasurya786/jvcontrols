import nodemailer from 'nodemailer';

// Generate 6-digit numeric OTP
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Nodemailer transporter initialization
export function createTransporter() {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const isGmail =
      (process.env.SMTP_HOST || '').toLowerCase().includes('gmail') ||
      (process.env.SMTP_USER || '').toLowerCase().includes('@gmail.com');

    if (isGmail) {
      // Port 587 + STARTTLS — works on Render/cloud (port 465 SSL is often blocked).
      // DNS IPv4 is forced globally via setDefaultResultOrder('ipv4first') in server.js.
      return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,         // STARTTLS (upgrades after connect)
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
      });
    }

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      family: 4,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });
  }
  return null;
}


/**
 * Verify SMTP / Email connection on startup
 */
export async function verifySMTP() {
  if (process.env.RESEND_API_KEY) {
    console.log(`[JV Controls Mailer] ✅ Resend HTTPS API configured (HTTPS Port 443 — Bypasses cloud SMTP blocks)`);
    return true;
  }
  if (process.env.BREVO_API_KEY) {
    console.log(`[JV Controls Mailer] ✅ Brevo HTTPS API configured (HTTPS Port 443 — Bypasses cloud SMTP blocks)`);
    return true;
  }
  const transporter = createTransporter();
  if (!transporter) {
    console.warn('[JV Controls Mailer] ⚠️ Email credentials not set. Set RESEND_API_KEY or SMTP_USER & SMTP_PASS.');
    return false;
  }
  try {
    await transporter.verify();
    console.log(`[JV Controls Mailer] ✅ SMTP connected & verified successfully (${process.env.SMTP_USER})`);
    return true;
  } catch (err) {
    console.warn(`[JV Controls Mailer] ⚠️ SMTP connection timeout: ${err.message}.`);
    console.warn(`[JV Controls Mailer] 💡 TIP: Free cloud hosts (Render/Vercel) block outbound SMTP ports (25/465/587). Add RESEND_API_KEY to your Render Environment to send live emails via HTTPS port 443!`);
    return false;
  }
}

/**
 * Universal Email Delivery Engine:
 * 1. Resend API (HTTPS port 443 — 100% works on Render free tier!)
 * 2. Brevo API (HTTPS port 443 — 100% works on Render free tier!)
 * 3. Nodemailer SMTP (works locally or with open SMTP ports)
 * 4. Fallback simulation
 */
export async function deliverEmail({ from, to, subject, html }) {
  const fromAddress = from || process.env.FROM_EMAIL || `"JV Controls Chennai" <${process.env.SMTP_USER || 'jvcjvcontrols@gmail.com'}>`;
  const recipientList = Array.isArray(to) ? to : (typeof to === 'string' ? to.split(',').map(s => s.trim()).filter(Boolean) : [to]);

  // 1. Resend API (HTTPS Port 443)
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'JV Controls <onboarding@resend.dev>',
          to: recipientList,
          subject,
          html,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`[JV Controls Mailer] 🚀 Email delivered via Resend API to ${recipientList.join(', ')}. ID: ${data.id}`);
        return { success: true, delivered: true, messageId: data.id, provider: 'resend' };
      } else {
        console.warn(`[JV Controls Mailer] ⚠️ Resend API returned error: ${data.message || JSON.stringify(data)}`);
      }
    } catch (err) {
      console.warn(`[JV Controls Mailer] ⚠️ Resend fetch failed (${err.message}). Trying fallback...`);
    }
  }

  // 2. Brevo API (HTTPS Port 443)
  if (process.env.BREVO_API_KEY) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'JV Controls Chennai', email: process.env.SMTP_USER || 'jvcjvcontrols@gmail.com' },
          to: recipientList.map(email => ({ email })),
          subject,
          htmlContent: html,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`[JV Controls Mailer] 🚀 Email delivered via Brevo API to ${recipientList.join(', ')}. ID: ${data.messageId}`);
        return { success: true, delivered: true, messageId: data.messageId, provider: 'brevo' };
      } else {
        console.warn(`[JV Controls Mailer] ⚠️ Brevo API returned error: ${data.message || JSON.stringify(data)}`);
      }
    } catch (err) {
      console.warn(`[JV Controls Mailer] ⚠️ Brevo fetch failed (${err.message}). Trying fallback...`);
    }
  }

  // 3. SMTP Transport (Nodemailer)
  const transporter = createTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to: recipientList.join(', '),
        subject,
        html,
      });
      console.log(`[JV Controls Mailer] 📧 Email delivered via SMTP to ${recipientList.join(', ')}. MessageId: ${info.messageId}`);
      return { success: true, delivered: true, messageId: info.messageId, provider: 'smtp' };
    } catch (err) {
      console.warn(`[JV Controls Mailer] ❌ SMTP send failed to ${recipientList.join(', ')} (${err.message}).`);
      return { success: false, error: err.message };
    }
  }

  console.log(`[JV Controls Mailer] ℹ️ Email dispatch simulated for ${recipientList.join(', ')}`);
  return { success: true, simulated: true };
}

/**
 * Send OTP for Account Registration Verification
 */
export async function sendRegistrationOTP(email, name, otp) {
  console.log('====================================================');
  console.log(`🔑 [EMAIL OTP VERIFICATION DISPATCH]`);
  console.log(`Recipient:  ${name} <${email}>`);
  console.log(`6-Digit OTP: >>> ${otp} <<< (Valid for 10 minutes)`);
  console.log('====================================================');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
      <div style="background: #004b87; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 1px;">JV CONTROLS CHENNAI</h1>
        <p style="color: #cbd5e1; margin: 6px 0 0 0; font-size: 12px; text-transform: uppercase;">Clean Power Solutions & Engineering</p>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 18px;">Email Verification Code</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          Thank you for registering with JV Controls. Please enter the following 6-digit verification code to activate your account:
        </p>
        <div style="margin: 24px 0; text-align: center;">
          <span style="display: inline-block; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #ea580c; background: #fff7ed; padding: 12px 28px; border-radius: 12px; border: 2px dashed #ea580c;">
            ${otp}
          </span>
        </div>
        <p style="color: #64748b; font-size: 12px; line-height: 1.5;">
          This code will expire in <strong>10 minutes</strong>. If you did not create an account on JV Controls, please disregard this email.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
          Plot No. 1957, 13th Main Road, Annanagar East, Chennai - 600040<br />
          Helpline: +91 9500087723 | Email: jvcjvcontrols@gmail.com
        </p>
      </div>
    </div>
  `;

  const result = await deliverEmail({
    to: email,
    subject: `[${otp}] Verify Your JV Controls Account`,
    html,
  });

  return { ...result, otp };
}

/**
 * Send OTP for Password Reset
 */
export async function sendPasswordResetOTP(email, name, otp) {
  console.log('====================================================');
  console.log(`🔐 [PASSWORD RESET OTP DISPATCH]`);
  console.log(`Recipient:  ${name || 'User'} <${email}>`);
  console.log(`6-Digit OTP: >>> ${otp} <<< (Valid for 10 minutes)`);
  console.log('====================================================');

  const result = await deliverEmail({
    to: email,
    subject: `[${otp}] Reset Your JV Controls Password`,
    html,
  });

  return { ...result, otp };
}

/**
 * Get resolved list of Admin email recipients
 */
export function getAdminEmailList() {
  const envAdmins = (process.env.ADMIN_EMAILS || 'jvcjvcontrols@gmail.com')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e && e !== 'admin@jvcontrols.in' && e !== 'adimin@jvcontrols.in');

  return envAdmins.length > 0 ? envAdmins : ['jvcjvcontrols@gmail.com'];
}

function formatDate(date) {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Send Equipment Registration & Warranty Welcome Confirmation Email (to Customer and Admin)
 */
export async function sendProductRegistrationEmail({ customerProduct, target = 'both' }) {
  const transporter = createTransporter();
  const fromAddress = process.env.FROM_EMAIL || `"JV Controls Chennai" <${process.env.SMTP_USER || 'jvcjvcontrols@gmail.com'}>`;
  const p = customerProduct;

  const cleanPhone = (p.mobile || '').replace(/\D/g, '');
  const targetPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  const whatsappBookingUrl = `https://wa.me/919500087723?text=${encodeURIComponent(
    `Hi JV Controls, I received my warranty certificate for ${p.productName} (S/N: ${p.serialNumber}). I have a query regarding warranty coverage / maintenance.`
  )}`;
  const adminWhatsAppCustomerUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(
    `Hi ${p.customerName}, this is JV Controls Chennai. Thank you for registering your ${p.productName} (S/N: ${p.serialNumber}). Your warranty is active until ${formatDate(p.warrantyExpiryDate)}. Our technical team is available 24x7 for support.`
  )}`;

  const schedule = p.serviceSchedule || [];

  const results = {
    customerSent: false,
    adminSent: false,
    customerError: null,
    adminError: null,
  };

  // Schedule rows HTML for customer
  const scheduleRows = schedule.map((s) => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 10px 12px; font-weight: 700; color: #0f172a; font-size: 13px;">${s.label || `Service #${s.serviceNumber}`}</td>
      <td style="padding: 10px 12px; color: #004b87; font-weight: 700; font-size: 13px;">${formatDate(s.dueDate)}</td>
      <td style="padding: 10px 12px; color: #16a34a; font-weight: 600; font-size: 12px;">✓ Included in Warranty (Free)</td>
    </tr>
  `).join('');

  // 1. CUSTOMER WELCOME & WARRANTY CERTIFICATE EMAIL
  const customerHtml = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #004b87 0%, #002d54 100%); padding: 26px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 0.5px;">JV CONTROLS CHENNAI</h1>
        <p style="color: #cbd5e1; margin: 6px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">
          Clean Power Solutions & Industrial Engineering
        </p>
      </div>

      <!-- Banner Badge -->
      <div style="background: #ecfdf5; border-bottom: 1px solid #a7f3d0; padding: 14px 24px; text-align: center;">
        <span style="display: inline-block; background: #059669; color: #ffffff; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
          ✓ Equipment Registered & Warranty Activated
        </span>
      </div>

      <!-- Body Content -->
      <div style="padding: 28px 24px;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 800;">
          Welcome to JV Controls Power Protection
        </h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
          Dear <strong>${p.customerName}</strong>,<br />
          Thank you for choosing JV Controls. Your new equipment has been successfully recorded in our central maintenance register. Below are your official warranty registration details and complimentary service schedule.
        </p>

        <!-- Product Specs Card -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
          <h3 style="color: #004b87; font-size: 14px; font-weight: 800; text-transform: uppercase; margin-top: 0; margin-bottom: 14px; letter-spacing: 0.5px;">
            Registered Equipment Details
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 40%;">Equipment Model:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${p.productName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Serial Number (S/N):</td>
              <td style="padding: 6px 0; color: #004b87; font-weight: 800; font-family: monospace; font-size: 14px;">${p.serialNumber}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Equipment Category:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${p.category}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Purchase / Buying Date:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${formatDate(p.purchaseDate)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Warranty Coverage:</td>
              <td style="padding: 6px 0; color: #16a34a; font-weight: 700;">${p.warrantyYears} Year${p.warrantyYears > 1 ? 's' : ''} (Valid until ${formatDate(p.warrantyExpiryDate)})</td>
            </tr>
            ${p.invoiceNumber ? `
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Invoice Reference:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${p.invoiceNumber}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Installation Site Address:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${p.address}</td>
            </tr>
          </table>
        </div>

        <!-- 6-Month Complimentary Service Schedule -->
        <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
          <div style="background: #f1f5f9; padding: 12px 16px; border-bottom: 1px solid #cbd5e1;">
            <h4 style="margin: 0; color: #0f172a; font-size: 13px; font-weight: 800; text-transform: uppercase;">
              🛠️ Complimentary 6-Month Preventative Maintenance Schedule
            </h4>
          </div>
          <p style="padding: 12px 16px 0 16px; margin: 0; color: #64748b; font-size: 12px; line-height: 1.5;">
            To ensure zero power downtime, your warranty includes complimentary on-site maintenance checkups every 6 months (battery specific gravity, distilled water top-up, and load test):
          </p>
          <div style="padding: 12px 16px 16px 16px; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr style="border-bottom: 2px solid #e2e8f0; color: #475569; font-size: 11px; text-transform: uppercase;">
                  <th style="padding: 8px 12px;">Milestone</th>
                  <th style="padding: 8px 12px;">Scheduled Due Date</th>
                  <th style="padding: 8px 12px;">Coverage</th>
                </tr>
              </thead>
              <tbody>
                ${scheduleRows}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 1-Click WhatsApp & Call Buttons -->
        <div style="text-align: center; margin: 26px 0;">
          <a href="${whatsappBookingUrl}" target="_blank" style="display: inline-block; background: #25D366; color: #ffffff; text-decoration: none; padding: 13px 26px; border-radius: 10px; font-weight: 800; font-size: 14px; margin-right: 10px; box-shadow: 0 2px 6px rgba(37, 211, 102, 0.3);">
            💬 Contact Technical Support on WhatsApp
          </a>
          <a href="tel:+919500087723" style="display: inline-block; background: #004b87; color: #ffffff; text-decoration: none; padding: 13px 24px; border-radius: 10px; font-weight: 800; font-size: 14px; box-shadow: 0 2px 6px rgba(0, 75, 135, 0.3);">
            📞 Call Hotline +91 9500087723
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0; line-height: 1.5;">
          JV Controls Chennai • Plot No. 1957, 13th Main Road, Annanagar East, Chennai - 600040<br />
          Helpline: +91 9500087723 | Email: jvcjvcontrols@gmail.com | 24/7 Breakdown Assistance
        </p>
      </div>
    </div>
  `;

  // 2. ADMIN ORDER / EQUIPMENT REGISTRATION EMAIL
  const adminHtml = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 22px 24px;">
        <span style="background: #3b82f6; color: #ffffff; font-size: 10px; font-weight: 900; padding: 3px 8px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
          ADMIN NOTIFICATION
        </span>
        <h2 style="color: #ffffff; margin: 8px 0 0 0; font-size: 18px; font-weight: 800;">
          📦 New Customer Equipment Registered
        </h2>
      </div>

      <div style="padding: 24px;">
        <!-- Customer Details Box -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 12px 0; color: #004b87; font-size: 12px; font-weight: 800; text-transform: uppercase;">
            Customer Contact Information
          </h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 5px 0; color: #64748b; width: 35%;">Client / Company:</td>
              <td style="padding: 5px 0; color: #0f172a; font-weight: 700;">${p.customerName}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;">Primary Mobile:</td>
              <td style="padding: 5px 0;">
                <a href="tel:${p.mobile}" style="color: #004b87; font-weight: 800; text-decoration: none;">${p.mobile}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;">Email Address:</td>
              <td style="padding: 5px 0; color: #0f172a; font-weight: 600;">${p.email || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;">Site Address:</td>
              <td style="padding: 5px 0; color: #0f172a; font-weight: 600;">${p.address}</td>
            </tr>
          </table>
        </div>

        <!-- Product Specs Box -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 12px 0; color: #004b87; font-size: 12px; font-weight: 800; text-transform: uppercase;">
            Equipment & Warranty Details
          </h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 5px 0; color: #64748b; width: 35%;">Model / Rating:</td>
              <td style="padding: 5px 0; color: #0f172a; font-weight: 700;">${p.productName} (${p.category})</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;">Serial Number:</td>
              <td style="padding: 5px 0; color: #004b87; font-weight: 800; font-family: monospace;">${p.serialNumber}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;">Buying Date:</td>
              <td style="padding: 5px 0; color: #0f172a; font-weight: 600;">${formatDate(p.purchaseDate)}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;">Warranty Period:</td>
              <td style="padding: 5px 0; color: #16a34a; font-weight: 700;">${p.warrantyYears} Year${p.warrantyYears > 1 ? 's' : ''} (Expires: ${formatDate(p.warrantyExpiryDate)})</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;">Service Milestones:</td>
              <td style="padding: 5px 0; color: #0f172a; font-weight: 600;">${schedule.length} periodic checkups scheduled</td>
            </tr>
            ${p.notes ? `
            <tr>
              <td style="padding: 5px 0; color: #64748b;">Notes:</td>
              <td style="padding: 5px 0; color: #475569; font-style: italic;">${p.notes}</td>
            </tr>` : ''}
          </table>
        </div>

        <!-- Quick Admin Action Buttons -->
        <div style="text-align: center; margin: 20px 0;">
          <a href="${adminWhatsAppCustomerUrl}" target="_blank" style="display: inline-block; background: #25D366; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 13px; margin-right: 8px;">
            💬 WhatsApp Customer
          </a>
          <a href="tel:${p.mobile}" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 13px;">
            📞 Call Customer (${p.mobile})
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="text-align: center; color: #94a3b8; font-size: 11px; margin: 0;">
          JV Controls Admin Operations • Automated Asset Registration Dispatch
        </p>
      </div>
    </div>
  `;

  // Send to Customer
  if ((target === 'both' || target === 'customer') && p.email) {
    const res = await deliverEmail({
      to: p.email,
      subject: `[JV Controls] ✅ Equipment Registered & Warranty Active: ${p.productName} (S/N: ${p.serialNumber})`,
      html: customerHtml,
    });
    if (res.success) {
      results.customerSent = true;
    } else {
      results.customerError = res.error;
    }
  }

  // Send to Admin List
  if (target === 'both' || target === 'admin') {
    const adminRecipients = getAdminEmailList();
    if (adminRecipients.length > 0) {
      const res = await deliverEmail({
        to: adminRecipients,
        subject: `[Admin Order Alert] 📦 New Equipment Registered: ${p.customerName} - ${p.productName} (S/N: ${p.serialNumber})`,
        html: adminHtml,
      });
      if (res.success) {
        results.adminSent = true;
      } else {
        results.adminError = res.error;
      }
    }
  }

  return results;
}

/**
 * Send 6-Month Periodic Maintenance Service Notification (to Customer and/or Admin)
 */
export async function sendServiceMilestoneEmail({ customerProduct, service, target = 'both' }) {
  const transporter = createTransporter();
  const fromAddress = process.env.FROM_EMAIL || `"JV Controls Chennai" <${process.env.SMTP_USER || 'jvcjvcontrols@gmail.com'}>`;
  const p = customerProduct;
  const s = service;

  const now = new Date();
  const dueDate = s.dueDate ? new Date(s.dueDate) : now;
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = diffDays < 0;
  const daysOverdue = Math.abs(diffDays);

  const statusText = isOverdue
    ? `🚨 OVERDUE by ${daysOverdue} day${daysOverdue === 1 ? '' : 's'}`
    : diffDays === 0
    ? `🔴 DUE TODAY`
    : `🔴 DUE in ${diffDays} day${diffDays === 1 ? '' : 's'}`;

  const cleanPhone = (p.mobile || '').replace(/\D/g, '');
  const targetPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  const whatsappBookingUrl = `https://wa.me/919500087723?text=${encodeURIComponent(
    `Hi JV Controls, I would like to schedule my complimentary 6-Month Service #${s.serviceNumber} for my ${p.productName} (S/N: ${p.serialNumber}). Address: ${p.address || ''}.`
  )}`;
  const adminWhatsAppCustomerUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(
    `Hi ${p.customerName}, this is JV Controls Chennai regarding your ${p.productName} (S/N: ${p.serialNumber}). Your complimentary 6-Month Periodic Service #${s.serviceNumber} is now due. When would be a convenient time for our field engineer to visit your premises at ${p.address}?`
  )}`;

  const results = {
    customerSent: false,
    adminSent: false,
    customerError: null,
    adminError: null,
  };

  // 1. CUSTOMER EMAIL TEMPLATE (Focus on Product Specs, Scope of Maintenance, WhatsApp Booking)
  const customerHtml = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #004b87 0%, #002d54 100%); padding: 26px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 0.5px;">JV CONTROLS CHENNAI</h1>
        <p style="color: #93c5fd; margin: 6px 0 0 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Clean Power Solutions & Engineering</p>
      </div>

      <!-- Hero Banner -->
      <div style="background: ${isOverdue ? '#fff1f2' : '#eff6ff'}; border-bottom: 1px solid ${isOverdue ? '#fecdd3' : '#bfdbfe'}; padding: 16px 24px; text-align: center;">
        <span style="display: inline-block; background: ${isOverdue ? '#dc2626' : '#0284c7'}; color: #ffffff; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px;">
          ${statusText}
        </span>
        <h2 style="color: #0f172a; margin: 10px 0 4px 0; font-size: 18px; font-weight: 800;">
          Complimentary 6-Month Maintenance Service Due
        </h2>
        <p style="color: #475569; margin: 0; font-size: 13px;">
          Periodic health checkup for your <strong>${p.productName}</strong> (Service #${s.serviceNumber})
        </p>
      </div>

      <div style="padding: 24px;">
        <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-top: 0;">
          Dear <strong>${p.customerName}</strong>,
        </p>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          Under your <strong>${p.warrantyYears}-Year JV Controls Warranty</strong>, your equipment is eligible for complimentary 6-month periodic health checkups to ensure uninterrupted power reliability, optimal battery lifespan, and electrical safety.
        </p>

        <!-- Product Details Table -->
        <div style="margin: 20px 0; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: #e2e8f0; padding: 10px 16px; font-size: 12px; font-weight: 800; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">
            📦 Registered Equipment & Service Details
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 16px; font-weight: bold; width: 40%; color: #64748b;">Equipment Model:</td>
              <td style="padding: 10px 16px; font-weight: 800; color: #0f172a;">${p.productName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9; background: #ffffff;">
              <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Serial Number:</td>
              <td style="padding: 10px 16px; font-family: monospace; font-weight: 800; color: #004b87;">${p.serialNumber}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Category:</td>
              <td style="padding: 10px 16px;">${p.category || 'Online UPS'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9; background: #ffffff;">
              <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Date of Purchase:</td>
              <td style="padding: 10px 16px;">${formatDate(p.purchaseDate)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Warranty Coverage:</td>
              <td style="padding: 10px 16px; font-weight: bold; color: #16a34a;">${p.warrantyYears} Year(s) (Valid until ${formatDate(p.warrantyExpiryDate)})</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9; background: #ffffff;">
              <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Service Milestone:</td>
              <td style="padding: 10px 16px; font-weight: 800; color: #ea580c;">Service #${s.serviceNumber} (${s.monthInterval}th Month Checkup)</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Scheduled Due Date:</td>
              <td style="padding: 10px 16px; font-weight: 800; color: ${isOverdue ? '#dc2626' : '#0f172a'};">${formatDate(s.dueDate)}</td>
            </tr>
            <tr style="background: #ffffff;">
              <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Installation Address:</td>
              <td style="padding: 10px 16px;">${p.address || 'Chennai'}</td>
            </tr>
          </table>
        </div>

        <!-- Scope of Checkup -->
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <h3 style="color: #166534; margin: 0 0 8px 0; font-size: 13px; font-weight: 800; text-transform: uppercase;">
            ✓ What Is Included in this Service Visit:
          </h3>
          <ul style="margin: 0; padding-left: 20px; color: #15803d; font-size: 13px; line-height: 1.6;">
            <li>Battery specific gravity test with hydrometer & distilled water top-up</li>
            <li>Inverter / Online UPS terminal cleaning & electrical contact tightening</li>
            <li>Load testing, battery backup discharge audit & inverter transfer calibration</li>
            <li>Earthing resistance inspection and ventilation dust blow-out</li>
          </ul>
        </div>

        <!-- Call to Action Buttons -->
        <div style="text-align: center; margin: 26px 0;">
          <a href="${whatsappBookingUrl}" target="_blank" style="display: inline-block; background: #16a34a; color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 12px 28px; border-radius: 12px; box-shadow: 0 4px 10px rgba(22,163,74,0.3); margin-right: 8px; margin-bottom: 8px;">
            💬 Book Service #${s.serviceNumber} on WhatsApp
          </a>
          <a href="tel:+919500087723" style="display: inline-block; background: #004b87; color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 12px 24px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,75,135,0.25); margin-bottom: 8px;">
            📞 Call Hotline: +91 9500087723
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

        <div style="text-align: center; color: #94a3b8; font-size: 11px; line-height: 1.5;">
          <strong>JV Controls Chennai</strong><br />
          Plot No. 1957, 13th Main Road, Annanagar East, Chennai - 600040<br />
          Email: jvcjvcontrols@gmail.com | 24x7 Support: +91 9500087723
        </div>
      </div>
    </div>
  `;

  // 2. ADMIN EMAIL TEMPLATE (Focus on Customer Info + Product Specs + Dispatch Action)
  const adminHtml = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #ffffff; border: 2px solid ${isOverdue ? '#ef4444' : '#004b87'}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.08);">
      <!-- Admin Header -->
      <div style="background: ${isOverdue ? '#991b1b' : '#004b87'}; padding: 22px 24px; text-align: center;">
        <span style="display: inline-block; background: #ffffff; color: ${isOverdue ? '#991b1b' : '#004b87'}; font-size: 10px; font-weight: 900; padding: 3px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
          JV Controls Admin Dispatch Alert
        </span>
        <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 900;">
          ${isOverdue ? '🚨 OVERDUE 6-MONTH SERVICE' : '🔴 6-MONTH MAINTENANCE SERVICE DUE'}
        </h1>
        <p style="color: #e2e8f0; margin: 4px 0 0 0; font-size: 12px;">
          Action Required: Schedule field engineer visit for client
        </p>
      </div>

      <div style="padding: 24px;">
        <!-- Status Callout -->
        <div style="background: ${isOverdue ? '#fef2f2' : '#fffbeb'}; border-left: 4px solid ${isOverdue ? '#ef4444' : '#f59e0b'}; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 13px; font-weight: bold; color: ${isOverdue ? '#991b1b' : '#92400e'};">
            Milestone: Service #${s.serviceNumber} (${s.monthInterval}th Month Checkup) • Status: ${statusText} • Due: ${formatDate(s.dueDate)}
          </p>
        </div>

        <!-- Section 1: Customer Details Table -->
        <div style="margin-bottom: 22px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: #0f172a; padding: 10px 16px; font-size: 12px; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px;">
            👤 Client / Customer Information
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 16px; font-weight: bold; width: 38%; color: #64748b;">Customer Name:</td>
              <td style="padding: 10px 16px; font-weight: 800; color: #0f172a;">${p.customerName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9; background: #f8fafc;">
              <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Mobile Phone:</td>
              <td style="padding: 10px 16px;">
                <a href="tel:${p.mobile}" style="color: #004b87; font-weight: 800; text-decoration: none;">📞 ${p.mobile}</a>
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Email Address:</td>
              <td style="padding: 10px 16px;">
                ${p.email ? `<a href="mailto:${p.email}" style="color: #004b87; text-decoration: none;">✉️ ${p.email}</a>` : '<span style="color: #94a3b8;">Not provided</span>'}
              </td>
            </tr>
            <tr style="background: #f8fafc;">
              <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Installation / Site Address:</td>
              <td style="padding: 10px 16px; font-weight: 600; color: #1e293b;">📍 ${p.address || 'Chennai'}</td>
            </tr>
          </table>
        </div>

        <!-- Section 2: Equipment & Warranty Details Table -->
        <div style="margin-bottom: 22px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: #004b87; padding: 10px 16px; font-size: 12px; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px;">
            ⚡ Equipment & Warranty Specifications
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 16px; font-weight: bold; width: 38%; color: #64748b;">Product Model:</td>
              <td style="padding: 10px 16px; font-weight: 800; color: #0f172a;">${p.productName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9; background: #f8fafc;">
              <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Category:</td>
              <td style="padding: 10px 16px;">${p.category || 'Online UPS'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Serial Number:</td>
              <td style="padding: 10px 16px; font-family: monospace; font-weight: 900; color: #004b87;">${p.serialNumber}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9; background: #f8fafc;">
              <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Date of Purchase:</td>
              <td style="padding: 10px 16px;">${formatDate(p.purchaseDate)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Warranty Expiry:</td>
              <td style="padding: 10px 16px; font-weight: bold;">${formatDate(p.warrantyExpiryDate)} (${p.warrantyYears} Yr)</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9; background: #f8fafc;">
              <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Invoice Number:</td>
              <td style="padding: 10px 16px;">${p.invoiceNumber || 'On Record'}</td>
            </tr>
            ${p.notes ? `
            <tr>
              <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Technical Notes:</td>
              <td style="padding: 10px 16px; font-style: italic; color: #64748b;">"${p.notes}"</td>
            </tr>` : ''}
          </table>
        </div>

        <!-- Section 3: Admin Quick Actions -->
        <div style="text-align: center; margin: 26px 0;">
          <a href="${adminWhatsAppCustomerUrl}" target="_blank" style="display: inline-block; background: #16a34a; color: #ffffff; font-size: 13px; font-weight: 800; text-decoration: none; padding: 12px 24px; border-radius: 10px; margin-right: 8px; margin-bottom: 8px;">
            💬 WhatsApp Client for Appointment
          </a>
          <a href="tel:${p.mobile}" style="display: inline-block; background: #0f172a; color: #ffffff; font-size: 13px; font-weight: 800; text-decoration: none; padding: 12px 20px; border-radius: 10px; margin-bottom: 8px;">
            📞 Call Client (${p.mobile})
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="text-align: center; color: #94a3b8; font-size: 11px; margin: 0;">
          JV Controls Admin Portal System • Automated Dispatch Engine
        </p>
      </div>
    </div>
  `;

  // Send to Customer
  if ((target === 'both' || target === 'customer') && p.email) {
    const res = await deliverEmail({
      to: p.email,
      subject: `[JV Controls] 🛠️ Periodic Maintenance Service #${s.serviceNumber} Due: ${p.productName} (S/N: ${p.serialNumber})`,
      html: customerHtml,
    });
    if (res.success) {
      results.customerSent = true;
    } else {
      results.customerError = res.error;
    }
  }

  // Send to Admin List
  if (target === 'both' || target === 'admin') {
    const adminRecipients = getAdminEmailList();
    if (adminRecipients.length > 0) {
      const res = await deliverEmail({
        to: adminRecipients,
        subject: `[Admin Alert] ${isOverdue ? '🚨 OVERDUE' : '🔴 DUE'}: 6-Month Service #${s.serviceNumber} for ${p.customerName} - ${p.productName} (S/N: ${p.serialNumber})`,
        html: adminHtml,
      });
      if (res.success) {
        results.adminSent = true;
      } else {
        results.adminError = res.error;
      }
    }
  }

  return results;
}

/**
 * Send Warranty Expired / Expiring Notification (to Customer and/or Admin)
 */
export async function sendWarrantyExpiredEmail({ customerProduct, target = 'both' }) {
  const transporter = createTransporter();
  const fromAddress = process.env.FROM_EMAIL || `"JV Controls Chennai" <${process.env.SMTP_USER || 'jvcjvcontrols@gmail.com'}>`;
  const p = customerProduct;

  const now = new Date();
  const expDate = p.warrantyExpiryDate ? new Date(p.warrantyExpiryDate) : now;
  const isExpired = expDate < now;
  const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const daysExpired = Math.abs(diffDays);

  const cleanPhone = (p.mobile || '').replace(/\D/g, '');
  const targetPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  const whatsappAmcUrl = `https://wa.me/919500087723?text=${encodeURIComponent(
    `Hi JV Controls, the warranty for my ${p.productName} (S/N: ${p.serialNumber}) has expired. I would like to inquire about AMC (Annual Maintenance Contract) packages and battery health testing.`
  )}`;
  const adminWhatsAppCustomerUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(
    `Hi ${p.customerName}, this is JV Controls Chennai. The warranty for your ${p.productName} (S/N: ${p.serialNumber}) expired on ${formatDate(expDate)}. We offer Comprehensive & Non-Comprehensive AMC maintenance plans to ensure zero power downtime. Would you like us to share our AMC quotation?`
  )}`;

  const schedule = p.serviceSchedule || [];
  const servicedCount = schedule.filter((s) => s.status === 'SERVICED').length;
  const totalServices = schedule.length;

  const results = {
    customerSent: false,
    adminSent: false,
    customerError: null,
    adminError: null,
  };

  // 1. CUSTOMER WARRANTY EXPIRED EMAIL
  const customerHtml = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #004b87 0%, #002d54 100%); padding: 26px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900;">JV CONTROLS CHENNAI</h1>
        <p style="color: #93c5fd; margin: 6px 0 0 0; font-size: 13px; font-weight: 600; text-transform: uppercase;">Equipment Warranty Notice</p>
      </div>

      <!-- Banner -->
      <div style="background: #fff7ed; border-bottom: 1px solid #ffedd5; padding: 16px 24px; text-align: center;">
        <span style="display: inline-block; background: #ea580c; color: #ffffff; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px;">
          ${isExpired ? `Warranty Expired (${daysExpired} Days Ago)` : `Warranty Expiring in ${diffDays} Days`}
        </span>
        <h2 style="color: #0f172a; margin: 10px 0 4px 0; font-size: 18px; font-weight: 800;">
          Warranty Status Update for ${p.productName}
        </h2>
        <p style="color: #64748b; margin: 0; font-size: 13px;">
          Protect your power backup system with our Annual Maintenance Contract (AMC)
        </p>
      </div>

      <div style="padding: 24px;">
        <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-top: 0;">
          Dear <strong>${p.customerName}</strong>,
        </p>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          This is an official notice regarding the manufacturer warranty on your power equipment registered with JV Controls. The initial warranty coverage concluded on <strong>${formatDate(expDate)}</strong>.
        </p>

        <!-- Product Specs Table -->
        <div style="margin: 20px 0; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: #e2e8f0; padding: 10px 16px; font-size: 12px; font-weight: 800; color: #1e293b; text-transform: uppercase;">
            📦 Equipment Information
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 16px; font-weight: bold; width: 40%; color: #64748b;">Product Name:</td>
              <td style="padding: 10px 16px; font-weight: 800; color: #0f172a;">${p.productName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9; background: #ffffff;">
              <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Serial Number:</td>
              <td style="padding: 10px 16px; font-family: monospace; font-weight: 800; color: #004b87;">${p.serialNumber}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Category:</td>
              <td style="padding: 10px 16px;">${p.category || 'Online UPS'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9; background: #ffffff;">
              <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Purchase Date:</td>
              <td style="padding: 10px 16px;">${formatDate(p.purchaseDate)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Warranty Expiry Date:</td>
              <td style="padding: 10px 16px; font-weight: 800; color: #ea580c;">${formatDate(p.warrantyExpiryDate)}</td>
            </tr>
            <tr style="background: #ffffff;">
              <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Installation Site:</td>
              <td style="padding: 10px 16px;">${p.address || 'Chennai'}</td>
            </tr>
          </table>
        </div>

        <!-- AMC Renewal Benefits -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 18px; margin: 20px 0;">
          <h3 style="color: #004b87; margin: 0 0 10px 0; font-size: 14px; font-weight: 800;">
            🛡️ Avoid Sudden Breakdown: Extend Coverage with JV Controls AMC
          </h3>
          <p style="color: #475569; font-size: 13px; line-height: 1.5; margin: 0 0 10px 0;">
            Power electronics and batteries require ongoing calibration to avoid sudden shutdown during grid outages. Our AMC plans include:
          </p>
          <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 13px; line-height: 1.6;">
            <li><strong>2 Scheduled Preventative Maintenance Visits</strong> every year</li>
            <li><strong>Priority 24x7 Emergency Technician Dispatch</strong> across Chennai</li>
            <li><strong>Zero Labour Charges</strong> on all service and repair call-outs</li>
            <li><strong>Quarterly Battery Health & Impedance Testing</strong></li>
          </ul>
        </div>

        <!-- Call to Action -->
        <div style="text-align: center; margin: 26px 0;">
          <a href="${whatsappAmcUrl}" target="_blank" style="display: inline-block; background: #16a34a; color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 12px 28px; border-radius: 12px; box-shadow: 0 4px 10px rgba(22,163,74,0.3); margin-right: 8px; margin-bottom: 8px;">
            💬 Inquire About AMC on WhatsApp
          </a>
          <a href="tel:+919500087723" style="display: inline-block; background: #004b87; color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 12px 24px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,75,135,0.25); margin-bottom: 8px;">
            📞 Call Hotline: +91 9500087723
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <div style="text-align: center; color: #94a3b8; font-size: 11px;">
          JV Controls Chennai • Plot No. 1957, 13th Main Road, Annanagar East, Chennai - 600040<br />
          Helpline: +91 9500087723 | Email: jvcjvcontrols@gmail.com
        </div>
      </div>
    </div>
  `;

  // 2. ADMIN WARRANTY EXPIRED EMAIL
  const adminHtml = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #ffffff; border: 2px solid #ea580c; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.08);">
      <div style="background: #ea580c; padding: 22px 24px; text-align: center;">
        <span style="display: inline-block; background: #ffffff; color: #ea580c; font-size: 10px; font-weight: 900; padding: 3px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
          JV Controls Admin CRM Alert
        </span>
        <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 900;">
          ⚠️ CUSTOMER WARRANTY EXPIRED
        </h1>
        <p style="color: #ffedd5; margin: 4px 0 0 0; font-size: 12px;">
          Opportunity for AMC renewal conversion and post-warranty service proposal
        </p>
      </div>

      <div style="padding: 24px;">
        <!-- Section 1: Customer Details Table -->
        <div style="margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: #0f172a; padding: 10px 16px; font-size: 12px; font-weight: 800; color: #ffffff; text-transform: uppercase;">
            👤 Client / Customer Information
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 16px; font-weight: bold; width: 38%; color: #64748b;">Customer Name:</td>
              <td style="padding: 10px 16px; font-weight: 800; color: #0f172a;">${p.customerName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9; background: #f8fafc;">
              <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Mobile Phone:</td>
              <td style="padding: 10px 16px;">
                <a href="tel:${p.mobile}" style="color: #004b87; font-weight: 800; text-decoration: none;">📞 ${p.mobile}</a>
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Email Address:</td>
              <td style="padding: 10px 16px;">
                ${p.email ? `<a href="mailto:${p.email}" style="color: #004b87; text-decoration: none;">✉️ ${p.email}</a>` : '<span style="color: #94a3b8;">Not provided</span>'}
              </td>
            </tr>
            <tr style="background: #f8fafc;">
              <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Installation Address:</td>
              <td style="padding: 10px 16px; font-weight: 600; color: #1e293b;">📍 ${p.address || 'Chennai'}</td>
            </tr>
          </table>
        </div>

        <!-- Section 2: Equipment Specs Table -->
        <div style="margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: #004b87; padding: 10px 16px; font-size: 12px; font-weight: 800; color: #ffffff; text-transform: uppercase;">
            📦 Expired Equipment Details
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 16px; font-weight: bold; width: 38%; color: #64748b;">Product Model:</td>
              <td style="padding: 10px 16px; font-weight: 800; color: #0f172a;">${p.productName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9; background: #f8fafc;">
              <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Category:</td>
              <td style="padding: 10px 16px;">${p.category || 'Online UPS'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Serial Number:</td>
              <td style="padding: 10px 16px; font-family: monospace; font-weight: 900; color: #004b87;">${p.serialNumber}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9; background: #f8fafc;">
              <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Purchase Date:</td>
              <td style="padding: 10px 16px;">${formatDate(p.purchaseDate)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Warranty Coverage:</td>
              <td style="padding: 10px 16px;">${p.warrantyYears} Year(s)</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9; background: #f8fafc;">
              <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Expired On:</td>
              <td style="padding: 10px 16px; font-weight: 900; color: #ea580c;">${formatDate(p.warrantyExpiryDate)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Service Track Record:</td>
              <td style="padding: 10px 16px; font-weight: bold; color: #16a34a;">${servicedCount} of ${totalServices} Periodic Services Completed</td>
            </tr>
            ${p.notes ? `
            <tr style="background: #f8fafc;">
              <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Notes:</td>
              <td style="padding: 10px 16px; font-style: italic;">"${p.notes}"</td>
            </tr>` : ''}
          </table>
        </div>

        <!-- Section 3: Actions -->
        <div style="text-align: center; margin: 26px 0;">
          <a href="${adminWhatsAppCustomerUrl}" target="_blank" style="display: inline-block; background: #16a34a; color: #ffffff; font-size: 13px; font-weight: 800; text-decoration: none; padding: 12px 24px; border-radius: 10px; margin-right: 8px; margin-bottom: 8px;">
            💬 WhatsApp Customer with AMC Proposal
          </a>
          <a href="tel:${p.mobile}" style="display: inline-block; background: #0f172a; color: #ffffff; font-size: 13px; font-weight: 800; text-decoration: none; padding: 12px 20px; border-radius: 10px; margin-bottom: 8px;">
            📞 Call Customer (${p.mobile})
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="text-align: center; color: #94a3b8; font-size: 11px; margin: 0;">
          JV Controls Admin Portal System • Automated CRM Engine
        </p>
      </div>
    </div>
  `;

  // Send to Customer
  if ((target === 'both' || target === 'customer') && p.email) {
    const res = await deliverEmail({
      to: p.email,
      subject: `[JV Controls] ⚠️ Warranty Expiry Notice: ${p.productName} (S/N: ${p.serialNumber})`,
      html: customerHtml,
    });
    if (res.success) {
      results.customerSent = true;
    } else {
      results.customerError = res.error;
    }
  }

  // Send to Admin List
  if (target === 'both' || target === 'admin') {
    const adminRecipients = getAdminEmailList();
    if (adminRecipients.length > 0) {
      const res = await deliverEmail({
        to: adminRecipients,
        subject: `[Admin Alert] ⚠️ Warranty Expired: ${p.customerName} - ${p.productName} (S/N: ${p.serialNumber})`,
        html: adminHtml,
      });
      if (res.success) {
        results.adminSent = true;
      } else {
        results.adminError = res.error;
      }
    }
  }

  return results;
}

/**
 * Scan all customer products and dispatch pending 6-month service and warranty expiry emails.
 * Deduplicates using emailNotifiedAt and warrantyEmailNotifiedAt timestamps.
 */
export async function scanAndDispatchPendingEmails(customerProducts, isMongoConnected, CustomerProductModel) {
  const now = new Date();
  const in14Days = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  let serviceEmailsSent = 0;
  let warrantyEmailsSent = 0;
  const dispatchLogs = [];

  for (const prod of customerProducts) {
    let modified = false;
    const schedule = prod.serviceSchedule || [];

    // 1. Check 6-Month Services
    for (const s of schedule) {
      if (s.status !== 'SERVICED' && s.dueDate) {
        const dueDate = new Date(s.dueDate);
        const isOverdue = dueDate < now;
        const isDueSoon = dueDate >= now && dueDate <= in14Days;

        if (isOverdue || isDueSoon) {
          // Send if never notified, or last notification was more than 7 days ago
          const lastSent = s.emailNotifiedAt ? new Date(s.emailNotifiedAt) : null;
          const daysSinceLastSent = lastSent ? (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60 * 24) : 999;

          if (!lastSent || daysSinceLastSent >= 7) {
            console.log(`[EMAIL SCAN] Dispatching service #${s.serviceNumber} alert for ${prod.customerName} (${prod.serialNumber})`);
            const res = await sendServiceMilestoneEmail({ customerProduct: prod, service: s, target: 'both' });
            if (res.customerSent || res.adminSent) {
              s.emailNotifiedAt = new Date();
              s.emailNotifiedCount = (s.emailNotifiedCount || 0) + 1;
              serviceEmailsSent++;
              modified = true;
              dispatchLogs.push({
                type: 'SERVICE',
                serial: prod.serialNumber,
                customer: prod.customerName,
                serviceNumber: s.serviceNumber,
                dueDate: s.dueDate,
                status: isOverdue ? 'OVERDUE' : 'DUE_SOON',
              });
            }
          }
        }
      }
    }

    // 2. Check Warranty Expiry
    if (prod.warrantyExpiryDate) {
      const expDate = new Date(prod.warrantyExpiryDate);
      const isExpired = expDate < now;
      const isExpiringSoon = expDate >= now && expDate <= in14Days;

      if (isExpired || isExpiringSoon) {
        const lastSent = prod.warrantyEmailNotifiedAt ? new Date(prod.warrantyEmailNotifiedAt) : null;
        const daysSinceLastSent = lastSent ? (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60 * 24) : 999;

        if (!lastSent || daysSinceLastSent >= 14) {
          console.log(`[EMAIL SCAN] Dispatching warranty expiry alert for ${prod.customerName} (${prod.serialNumber})`);
          const res = await sendWarrantyExpiredEmail({ customerProduct: prod, target: 'both' });
          if (res.customerSent || res.adminSent) {
            prod.warrantyEmailNotifiedAt = new Date();
            prod.warrantyEmailNotifiedCount = (prod.warrantyEmailNotifiedCount || 0) + 1;
            warrantyEmailsSent++;
            modified = true;
            dispatchLogs.push({
              type: 'WARRANTY',
              serial: prod.serialNumber,
              customer: prod.customerName,
              expiryDate: prod.warrantyExpiryDate,
              status: isExpired ? 'EXPIRED' : 'EXPIRING_SOON',
            });
          }
        }
      }
    }

    // Persist timestamp updates to DB if modified
    if (modified && isMongoConnected && CustomerProductModel && prod._id) {
      try {
        await CustomerProductModel.findByIdAndUpdate(prod._id, {
          serviceSchedule: prod.serviceSchedule,
          warrantyEmailNotifiedAt: prod.warrantyEmailNotifiedAt,
          warrantyEmailNotifiedCount: prod.warrantyEmailNotifiedCount,
        });
      } catch (saveErr) {
        console.warn(`[EMAIL SCAN] Failed to persist email timestamps for ${prod.serialNumber}:`, saveErr.message);
      }
    }
  }

  return {
    scannedCount: customerProducts.length,
    serviceEmailsSent,
    warrantyEmailsSent,
    totalDispatched: serviceEmailsSent + warrantyEmailsSent,
    dispatchLogs,
  };
}


