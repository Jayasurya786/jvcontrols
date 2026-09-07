import { ProductItem } from '../types';

export const downloadProductSpecSheet = (product: ProductItem) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to download or print the Product Technical Specification Sheet.');
    return;
  }

  const specsRows = product.specs
    ? Object.entries(product.specs)
        .map(
          ([k, v]) => `
      <tr>
        <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: 600; background-color: #f8fafc; color: #334155; width: 35%;">${k}</td>
        <td style="padding: 8px 12px; border: 1px solid #e2e8f0; color: #0f172a;">${v}</td>
      </tr>
    `
        )
        .join('')
    : '';

  const featuresList = product.features
    ? product.features
        .map(
          (f) => `
      <li style="margin-bottom: 6px; color: #334155;">
        <span style="color: #005696; font-weight: bold; margin-right: 6px;">✔</span> ${f}
      </li>
    `
        )
        .join('')
    : '';

  const loadChartHeaderCols = product.loadChart?.headers
    ? product.loadChart.headers
        .map(
          (h) =>
            `<th style="padding: 8px 12px; text-align: left; border: 1px solid #cbd5e1; background: #e2e8f0; font-size: 11px;">${h}</th>`
        )
        .join('')
    : '';

  const loadChartRows = product.loadChart?.rows
    ? product.loadChart.rows
        .map(
          (row) => `
      <tr>
        ${row
          .map(
            (cell) =>
              `<td style="padding: 8px 12px; border: 1px solid #e2e8f0; color: #0f172a;">${cell}</td>`
          )
          .join('')}
      </tr>
    `
        )
        .join('')
    : '';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${product.name} - Technical Data Sheet | JV Controls Chennai</title>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      margin: 0;
      padding: 24px;
      background-color: #ffffff;
      line-height: 1.5;
    }
    .header-box {
      border-bottom: 3px solid #005696;
      padding-bottom: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 900;
      color: #005696;
      margin: 0;
    }
    .sub-brand {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #e65100;
      font-weight: 800;
    }
    .contact-info {
      text-align: right;
      font-size: 11px;
      color: #475569;
    }
    .product-title {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 4px;
      margin-bottom: 8px;
    }
    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-blue { background: #e0f2fe; color: #0369a1; }
    .badge-orange { background: #ffedd5; color: #c2410c; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
      margin-bottom: 20px;
      font-size: 12px;
    }
    .section-head {
      font-size: 14px;
      font-weight: 800;
      color: #005696;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
      margin-top: 20px;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .footer-note {
      margin-top: 30px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      font-size: 10px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
    }
    .btn-print {
      background: #005696;
      color: white;
      border: none;
      padding: 10px 20px;
      font-weight: 700;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="no-print" style="background: #f1f5f9; padding: 12px 20px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
    <span style="font-size: 13px; font-weight: 600; color: #334155;">Official Technical Specification Sheet</span>
    <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>

  <div class="header-box">
    <div>
      <div class="sub-brand">Authorized Power Solutions & Battery Partner</div>
      <h1 class="brand-title">JV CONTROLS</h1>
      <div style="font-size: 12px; color: #475569; margin-top: 2px;">
        # 1, Kujji 2nd Street, Annanagar East, Chennai - 600 102. Tamil Nadu, INDIA
      </div>
    </div>
    <div class="contact-info">
      <div><strong>Hotlines:</strong> +91 9500087723 / +91 9841619346</div>
      <div><strong>Landline:</strong> 044 - 32907475</div>
      <div><strong>Email:</strong> jvcjvcontrols@gmail.com | www.jvcontrols.in</div>
      <div style="color: #16a34a; font-weight: 700; margin-top: 2px;">✔ Certified Dealer & 24x7 AMC Support</div>
    </div>
  </div>

  <div style="display: flex; gap: 24px; align-items: flex-start; margin-bottom: 20px;">
    <div style="flex: 1;">
      <div style="margin-bottom: 6px;">
        <span class="badge badge-blue">${product.brand}</span>
        ${product.capacity ? `<span class="badge badge-orange" style="margin-left: 6px;">${product.capacity}</span>` : ''}
      </div>
      <h2 class="product-title">${product.name}</h2>
      ${product.tagline ? `<p style="font-style: italic; color: #64748b; font-size: 13px; margin: 0 0 12px 0;">"${product.tagline}"</p>` : ''}
      <p style="font-size: 12px; color: #334155; margin: 0;">${product.description}</p>
    </div>
  </div>

  ${
    featuresList
      ? `
    <div class="section-head">Key Features & Engineering Highlights</div>
    <ul style="padding-left: 20px; font-size: 12px; margin-top: 8px;">
      ${featuresList}
    </ul>
  `
      : ''
  }

  ${
    specsRows
      ? `
    <div class="section-head">Technical Specifications</div>
    <table>
      <tbody>
        ${specsRows}
      </tbody>
    </table>
  `
      : ''
  }

  ${
    loadChartRows
      ? `
    <div class="section-head">Typical Appliance Load & Backup Duration</div>
    <table>
      <thead>
        <tr style="background: #e2e8f0; color: #1e293b; font-size: 11px; text-transform: uppercase;">
          ${loadChartHeaderCols}
        </tr>
      </thead>
      <tbody>
        ${loadChartRows}
      </tbody>
    </table>
  `
      : ''
  }

  <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #d97706; padding: 12px 16px; border-radius: 6px; margin-top: 20px; font-size: 11px; color: #92400e;">
    <strong>Need Quotation or Doorstep Site Study?</strong> Call JV Controls Annanagar East at <strong>+91 9500087723</strong> or email <strong>jvcjvcontrols@gmail.com</strong>. All installations include manufacturer warranty, certified copper wiring, and emergency on-site service in Chennai.
  </div>

  <div class="footer-note">
    <span>Document Ref: JV-SPEC-${product.id.toUpperCase()}</span>
    <span>Generated via JV Controls Chennai Web Portal • https://jvcontrols.in</span>
    <span>© ${new Date().getFullYear()} JV Controls. All rights reserved.</span>
  </div>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};
