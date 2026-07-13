/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order, Language } from '../types';

export function printReceipt(order: Order, format: '80mm' | 'a4', language: Language) {
  const isUrdu = language === 'ur';

  // Load active restaurant settings from localStorage or fallback
  const savedSettings = localStorage.getItem('asmat_rms_settings');
  let settings = {
    logo: "/logo.png",
    nameEn: "ASMAT HOTEL & RESTAURANT",
    nameUr: "عصمت ہوٹل اینڈ ریسٹورنٹ",
    sloganEn: "KABULI PULAO & HOTEL",
    sloganUr: "کابلی پلاؤ اینڈ ہوٹل",
    phone: "0302-8073204 / 0304-9767017",
    addressEn: "Main G.T. Road, Sarai Naurang, KP, Pakistan",
    addressUr: "مین جی ٹی روڈ، سرائے نورنگ، خیبر پختونخوا",
    email: "info@asmathotel.com",
  };

  if (savedSettings) {
    try {
      settings = { ...settings, ...JSON.parse(savedSettings) };
    } catch (e) {
      // ignore
    }
  }

  // Find cashier from logged-in staff or defaults
  const activeStaff = localStorage.getItem('asmat_rms_active_staff') || localStorage.getItem('rms_current_user');
  let cashierName = "Administrator";
  if (activeStaff) {
    try {
      const staffObj = JSON.parse(activeStaff);
      cashierName = staffObj.nameEn || staffObj.name || "Administrator";
    } catch(e) {
      if (typeof activeStaff === 'string' && activeStaff.length < 30) {
        cashierName = activeStaff;
      }
    }
  }

  // Create temporary print container
  const printSection = document.createElement('div');
  printSection.id = 'print-section';

  // Format date nicely
  const orderDate = order.timestamp || new Date().toLocaleString();

  // HTML content for 80mm Thermal Receipt
  const thermalHTML = `
    <div class="thermal-receipt-container">
      <div class="center-align">
        <img class="receipt-logo" src="${settings.logo || '/logo.png'}" alt="Logo" />
        <h1 class="restaurant-name-en">${settings.nameEn}</h1>
        <h2 class="restaurant-name-ur font-urdu">${settings.nameUr}</h2>
        <p class="slogan">${isUrdu ? settings.sloganUr : settings.sloganEn}</p>
        <p class="contact-info">${isUrdu ? settings.addressUr : settings.addressEn}</p>
        <p class="contact-info">Phone: ${settings.phone}</p>
      </div>

      <div class="dashed-line"></div>

      <div class="meta-info">
        <div class="flex-row">
          <span><strong>ORDER #:</strong></span>
          <span class="mono">${order.orderNumber}</span>
        </div>
        <div class="flex-row">
          <span><strong>Date:</strong></span>
          <span class="mono">${orderDate}</span>
        </div>
        <div class="flex-row">
          <span><strong>Table / میز:</strong></span>
          <span>Table ${order.tableNumber}</span>
        </div>
        <div class="flex-row">
          <span><strong>Waiter / ویٹر:</strong></span>
          <span>${order.waiterName || (isUrdu ? 'کاؤنٹر' : 'Counter')}</span>
        </div>
        <div class="flex-row">
          <span><strong>Cashier / کیشیئر:</strong></span>
          <span>${cashierName}</span>
        </div>
        ${order.customerName ? `
        <div class="flex-row">
          <span><strong>Customer / کسٹمر:</strong></span>
          <span>${order.customerName}</span>
        </div>` : `
        <div class="flex-row">
          <span><strong>Customer / کسٹمر:</strong></span>
          <span>General Guest</span>
        </div>`}
      </div>

      <div class="dashed-line"></div>

      <div class="items-table">
        <div class="flex-row table-header">
          <span class="col-desc">ITEM / پکوان</span>
          <span class="col-qty">QTY</span>
          <span class="col-price">TOTAL</span>
        </div>
        
        <div class="dashed-line-thin"></div>

        ${order.items.map(item => `
          <div class="item-row">
            <div class="item-name-block">
              <span class="item-name-en font-bold">${item.nameEn}</span>
              <span class="item-name-ur font-urdu">${item.nameUr}</span>
              ${item.notes ? `<span class="item-notes">* Note: ${item.notes}</span>` : ''}
            </div>
            <div class="flex-row item-pricing">
              <span class="col-desc text-muted">${item.quantity} x Rs.${item.price.toLocaleString()}</span>
              <span class="col-price font-bold mono">Rs.${(item.price * item.quantity).toLocaleString()}</span>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="dashed-line"></div>

      <div class="totals-section">
        <div class="flex-row">
          <span>Subtotal / کل رقم:</span>
          <span class="mono">Rs.${order.subtotal.toLocaleString()}</span>
        </div>
        
        ${order.discount > 0 ? `
        <div class="flex-row">
          <span>Discount (${order.discountPercent || 0}%):</span>
          <span class="mono">-Rs.${order.discount.toLocaleString()}</span>
        </div>` : ''}

        ${order.tax > 0 ? `
        <div class="flex-row">
          <span>GST Tax (${order.taxPercent || 0}%):</span>
          <span class="mono">Rs.${order.tax.toLocaleString()}</span>
        </div>` : ''}

        <div class="dashed-line-thin"></div>

        <div class="flex-row grand-total-row">
          <span>GRAND TOTAL / میزان:</span>
          <span class="mono">Rs.${order.grandTotal.toLocaleString()}</span>
        </div>
      </div>

      <div class="dashed-line"></div>

      <div class="payment-details center-align">
        <p><strong>Payment Method / ادائیگی:</strong> ${order.paymentMethod ? order.paymentMethod.toUpperCase() : 'CASH'}</p>
        <p class="payment-status-badge ${order.paymentStatus === 'paid' ? 'paid' : 'pending'}">
          ${order.paymentStatus === 'paid' ? '★ PAID ★' : '★ PENDING PAYMENT ★'}
        </p>
      </div>

      <div class="dashed-line-thin"></div>

      <div class="thank-you center-align">
        <p class="thank-you-en">Thank you for dining with us!</p>
        <p class="thank-you-ur font-urdu">تشریف آوری کا بہت بہت شکریہ!</p>
        <p class="software-credit">Powered by Asmat RMS</p>
      </div>
    </div>
  `;

  // HTML content for A4 Paper Receipt
  const a4HTML = `
    <div class="a4-receipt-container">
      <div class="invoice-header">
        <div class="header-left">
          <img class="a4-logo" src="${settings.logo || '/logo.png'}" alt="Logo" />
          <div>
            <h1 class="a4-title-en">${settings.nameEn}</h1>
            <h2 class="a4-title-ur font-urdu">${settings.nameUr}</h2>
            <p class="a4-slogan">${isUrdu ? settings.sloganUr : settings.sloganEn}</p>
          </div>
        </div>
        <div class="header-right text-right">
          <div class="invoice-badge">INVOICE / رسید</div>
          <p class="invoice-number">Order: <span class="mono">${order.orderNumber}</span></p>
          <p class="invoice-date">Date: ${orderDate}</p>
        </div>
      </div>

      <hr class="elegant-line" />

      <div class="invoice-details-grid">
        <div class="details-card">
          <h3>RESTAURANT DETAILS</h3>
          <p><strong>Address:</strong> ${isUrdu ? settings.addressUr : settings.addressEn}</p>
          <p><strong>Phone:</strong> ${settings.phone}</p>
          <p><strong>Email:</strong> ${settings.email}</p>
        </div>

        <div class="details-card">
          <h3>SERVICE DETAILS</h3>
          <p><strong>Table Seating:</strong> Table #${order.tableNumber}</p>
          <p><strong>Served By / Waiter:</strong> ${order.waiterName || 'Counter Operations'}</p>
          <p><strong>Cashier Name:</strong> ${cashierName}</p>
          <p><strong>Guest Name:</strong> ${order.customerName || 'General Guest'}</p>
          <p><strong>Status:</strong> <span class="badge-status ${order.paymentStatus}">${order.paymentStatus.toUpperCase()}</span></p>
        </div>
      </div>

      <div class="invoice-items-section">
        <table class="a4-table">
          <thead>
            <tr>
              <th class="text-left">DISH DESCRIPTION / پکوان کی تفصیل</th>
              <th class="text-right" style="width: 120px;">UNIT PRICE</th>
              <th class="text-center" style="width: 80px;">QTY</th>
              <th class="text-right" style="width: 150px;">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item, idx) => `
              <tr class="${idx % 2 === 0 ? 'even-row' : ''}">
                <td>
                  <div class="a4-item-name font-bold">${item.nameEn}</div>
                  <div class="a4-item-name-ur font-urdu">${item.nameUr}</div>
                  ${item.notes ? `<div class="a4-item-note">📝 Note: ${item.notes}</div>` : ''}
                </td>
                <td class="text-right mono">Rs.${item.price.toLocaleString()}</td>
                <td class="text-center mono">x${item.quantity}</td>
                <td class="text-right font-bold mono">Rs.${(item.price * item.quantity).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="invoice-summary-section">
        <div class="summary-remarks">
          <h4>OPERATIONAL REMARKS & DIRECTIONS</h4>
          <p class="remarks-text">${order.notes ? `"${order.notes}"` : 'Standard order processing with active kitchen dispatch. All tax ratios are calculated under provincial dining regulations.'}</p>
          
          <div class="signature-block">
            <div class="sig-line"></div>
            <p>Authorized Counter Signature</p>
          </div>
        </div>

        <div class="summary-totals">
          <div class="summary-row">
            <span>Subtotal (کل میزان):</span>
            <span class="mono">Rs.${order.subtotal.toLocaleString()}</span>
          </div>
          
          ${order.discount > 0 ? `
          <div class="summary-row text-red">
            <span>Discount (رعایت) [${order.discountPercent || 0}%]:</span>
            <span class="mono">-Rs.${order.discount.toLocaleString()}</span>
          </div>` : ''}

          ${order.tax > 0 ? `
          <div class="summary-row text-muted">
            <span>GST Tax (ٹیکس) [${order.taxPercent || 0}%]:</span>
            <span class="mono">Rs.${order.tax.toLocaleString()}</span>
          </div>` : ''}

          <div class="summary-row-grand">
            <span>GRAND TOTAL (میزان کل):</span>
            <span class="mono">Rs.${order.grandTotal.toLocaleString()}</span>
          </div>

          <div class="payment-summary-card text-right">
            <p><strong>Payment Status:</strong> ${order.paymentStatus === 'paid' ? 'PAID' : 'PENDING'}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod ? order.paymentMethod.toUpperCase() : 'CASH'}</p>
          </div>
        </div>
      </div>

      <div class="invoice-footer text-center">
        <p class="footer-thank-you font-urdu">تشریف آوری کا بہت بہت شکریہ! آپ کی خدمت ہمارا فخر ہے۔</p>
        <p class="footer-thank-you-en">Thank you for dining with us! We hope to see you again soon.</p>
        <p class="footer-tech">Invoice compiled dynamically via Asmat Restaurant Management System (RMS)</p>
      </div>
    </div>
  `;

  // Inject receipt structure based on selected format
  printSection.innerHTML = `
    <style>
      /* Embed Google Urdu fonts for beautiful printing */
      @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&family=Inter:wght@400;500;600;700;800&display=swap');

      /* General Print resets */
      #print-section {
        display: block !important;
        background: white !important;
        color: black !important;
        box-sizing: border-box;
      }

      .font-urdu {
        font-family: 'Noto Nastaliq Urdu', 'Inter', serif !important;
      }
      
      .font-bold {
        font-weight: bold;
      }

      .mono {
        font-family: 'Courier New', Courier, monospace !important;
      }

      .center-align {
        text-align: center;
      }

      .text-right {
        text-align: right;
      }

      .text-left {
        text-align: left;
      }

      .text-center {
        text-align: center;
      }

      .flex-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

      /* =======================================================
         80MM THERMAL RECEIPT STYLES
         ======================================================= */
      .thermal-receipt-container {
        width: 100%;
        max-width: 74mm;
        margin: 0 auto;
        font-family: 'Courier New', Courier, monospace;
        font-size: 11px;
        line-height: 1.35;
        color: black;
      }

      .thermal-receipt-container .receipt-logo {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        margin: 0 auto 5px auto;
        display: block;
        object-fit: contain;
      }

      .thermal-receipt-container h1.restaurant-name-en {
        font-size: 14px;
        font-weight: 800;
        margin: 4px 0 2px 0;
        letter-spacing: -0.5px;
      }

      .thermal-receipt-container h2.restaurant-name-ur {
        font-size: 13px;
        font-weight: 700;
        margin: 0 0 4px 0;
        line-height: 1.5;
      }

      .thermal-receipt-container p.slogan {
        font-size: 9px;
        margin: 0 0 3px 0;
        font-style: italic;
      }

      .thermal-receipt-container p.contact-info {
        font-size: 8px;
        margin: 0 0 2px 0;
      }

      .thermal-receipt-container .dashed-line {
        border-bottom: 1.5px dashed black;
        margin: 8px 0;
        height: 0;
      }

      .thermal-receipt-container .dashed-line-thin {
        border-bottom: 0.8px dashed black;
        margin: 5px 0;
        height: 0;
      }

      .thermal-receipt-container .meta-info {
        margin: 4px 0;
        font-size: 10.5px;
      }

      .thermal-receipt-container .meta-info .flex-row {
        margin-bottom: 2.5px;
      }

      .thermal-receipt-container .table-header {
        font-weight: bold;
        margin-bottom: 3px;
      }

      .thermal-receipt-container .col-desc {
        flex: 1;
        text-align: left;
      }

      .thermal-receipt-container .col-qty {
        width: 40px;
        text-align: center;
      }

      .thermal-receipt-container .col-price {
        width: 75px;
        text-align: right;
      }

      .thermal-receipt-container .item-row {
        margin-bottom: 7px;
      }

      .thermal-receipt-container .item-name-block {
        display: flex;
        flex-direction: column;
        text-align: left;
      }

      .thermal-receipt-container .item-name-en {
        font-size: 11px;
      }

      .thermal-receipt-container .item-name-ur {
        font-size: 9.5px;
        line-height: 1.4;
        margin-top: 1px;
      }

      .thermal-receipt-container .item-notes {
        font-size: 8.5px;
        font-style: italic;
        margin-top: 1px;
      }

      .thermal-receipt-container .item-pricing {
        margin-top: 1px;
      }

      .thermal-receipt-container .text-muted {
        color: #555;
      }

      .thermal-receipt-container .totals-section {
        font-size: 11px;
      }

      .thermal-receipt-container .totals-section .flex-row {
        margin-bottom: 3px;
      }

      .thermal-receipt-container .grand-total-row {
        font-size: 13px;
        font-weight: 800;
        margin: 4px 0;
      }

      .thermal-receipt-container .payment-status-badge {
        font-size: 11px;
        font-weight: 800;
        margin: 6px 0;
        padding: 2.5px;
        border: 1px solid black;
        display: inline-block;
      }

      .thermal-receipt-container .payment-status-badge.paid {
        background-color: #000;
        color: #fff;
      }

      .thermal-receipt-container .thank-you {
        margin-top: 10px;
      }

      .thermal-receipt-container .thank-you-en {
        font-size: 9.5px;
        margin: 0;
      }

      .thermal-receipt-container .thank-you-ur {
        font-size: 10px;
        margin: 2px 0 0 0;
        line-height: 1.5;
      }

      .thermal-receipt-container .software-credit {
        font-size: 7.5px;
        color: #666;
        margin-top: 6px;
      }


      /* =======================================================
         A4 PAPER RECEIPT STYLES
         ======================================================= */
      .a4-receipt-container {
        font-family: 'Inter', sans-serif;
        color: #1c1917; /* stone-900 */
        line-height: 1.5;
        font-size: 13px;
        padding: 0;
        background: white;
      }

      .a4-receipt-container .invoice-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .a4-receipt-container .header-left {
        display: flex;
        align-items: center;
        gap: 15px;
      }

      .a4-receipt-container .a4-logo {
        width: 70px;
        height: 70px;
        border-radius: 50%;
        object-fit: contain;
      }

      .a4-receipt-container h1.a4-title-en {
        font-size: 20px;
        font-weight: 850;
        color: #7f1d1d; /* red-900 */
        margin: 0;
        letter-spacing: -0.5px;
      }

      .a4-receipt-container h2.a4-title-ur {
        font-size: 16px;
        color: #1c1917;
        margin: 3px 0 0 0;
        line-height: 1.4;
      }

      .a4-receipt-container p.a4-slogan {
        font-size: 11px;
        color: #d97706; /* amber-600 */
        margin: 2px 0 0 0;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .a4-receipt-container .invoice-badge {
        background-color: #7f1d1d;
        color: white;
        font-size: 11px;
        font-weight: 800;
        padding: 5px 12px;
        border-radius: 6px;
        display: inline-block;
        letter-spacing: 1.5px;
        margin-bottom: 8px;
      }

      .a4-receipt-container .invoice-number {
        font-size: 13px;
        font-weight: bold;
        margin: 0;
      }

      .a4-receipt-container .invoice-date {
        font-size: 11px;
        color: #78716c; /* stone-500 */
        margin: 2px 0 0 0;
      }

      .a4-receipt-container .elegant-line {
        border: 0;
        height: 1.5px;
        background-color: #7f1d1d;
        margin: 15px 0;
        opacity: 0.85;
      }

      .a4-receipt-container .invoice-details-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 25px;
        margin-bottom: 25px;
      }

      .a4-receipt-container .details-card {
        background-color: #fcfbf9;
        border: 1px solid #f5f2eb;
        border-radius: 12px;
        padding: 15px;
      }

      .a4-receipt-container .details-card h3 {
        font-size: 11px;
        font-weight: 800;
        color: #d97706;
        margin: 0 0 10px 0;
        letter-spacing: 1px;
        border-bottom: 1px solid #f5f2eb;
        padding-bottom: 5px;
      }

      .a4-receipt-container .details-card p {
        font-size: 12px;
        margin: 0 0 6px 0;
        color: #44403c;
      }

      .a4-receipt-container .details-card p:last-child {
        margin-bottom: 0;
      }

      .a4-receipt-container .badge-status {
        font-size: 10px;
        font-weight: bold;
        padding: 2px 8px;
        border-radius: 4px;
        text-transform: uppercase;
      }

      .a4-receipt-container .badge-status.paid {
        background-color: #dcfce7;
        color: #166534;
      }

      .a4-receipt-container .badge-status.pending {
        background-color: #fef9c3;
        color: #854d0e;
      }

      .a4-receipt-container .a4-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 25px;
      }

      .a4-receipt-container .a4-table th {
        background-color: #7f1d1d;
        color: white;
        font-size: 11px;
        font-weight: bold;
        padding: 10px 15px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .a4-receipt-container .a4-table th:first-child {
        border-top-left-radius: 8px;
        border-bottom-left-radius: 8px;
      }

      .a4-receipt-container .a4-table th:last-child {
        border-top-right-radius: 8px;
        border-bottom-right-radius: 8px;
      }

      .a4-receipt-container .a4-table td {
        padding: 12px 15px;
        border-bottom: 1px solid #f5f2eb;
        vertical-align: middle;
      }

      .a4-receipt-container .even-row {
        background-color: #fbfbfb;
      }

      .a4-receipt-container .a4-item-name {
        font-size: 13px;
        color: #1c1917;
      }

      .a4-receipt-container .a4-item-name-ur {
        font-size: 12px;
        color: #57534e;
        line-height: 1.5;
        margin-top: 2px;
      }

      .a4-receipt-container .a4-item-note {
        font-size: 10.5px;
        color: #b45309;
        font-style: italic;
        margin-top: 3px;
      }

      .a4-receipt-container .invoice-summary-section {
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: 30px;
        margin-bottom: 30px;
      }

      .a4-receipt-container .summary-remarks h4 {
        font-size: 11px;
        font-weight: 800;
        color: #78716c;
        margin: 0 0 8px 0;
        letter-spacing: 0.5px;
      }

      .a4-receipt-container .remarks-text {
        font-size: 11.5px;
        color: #57534e;
        font-style: italic;
        line-height: 1.6;
        margin: 0;
      }

      .a4-receipt-container .signature-block {
        margin-top: 30px;
        width: 200px;
      }

      .a4-receipt-container .sig-line {
        border-bottom: 1px solid #d6d3d1;
        margin-bottom: 5px;
      }

      .a4-receipt-container .signature-block p {
        font-size: 10px;
        color: #78716c;
        margin: 0;
      }

      .a4-receipt-container .summary-totals .summary-row {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        margin-bottom: 6px;
        color: #44403c;
      }

      .a4-receipt-container .text-red {
        color: #b91c1c !important;
      }

      .a4-receipt-container .summary-row-grand {
        display: flex;
        justify-content: space-between;
        font-size: 16px;
        font-weight: 900;
        color: #7f1d1d;
        border-top: 1.5px solid #7f1d1d;
        padding-top: 8px;
        margin-top: 10px;
        margin-bottom: 15px;
      }

      .a4-receipt-container .payment-summary-card {
        background-color: #fef2f2;
        border: 1px solid #fee2e2;
        padding: 10px 15px;
        border-radius: 8px;
        font-size: 12px;
        color: #991b1b;
      }

      .a4-receipt-container .payment-summary-card p {
        margin: 0 0 3px 0;
      }

      .a4-receipt-container .payment-summary-card p:last-child {
        margin: 0;
      }

      .a4-receipt-container .invoice-footer {
        border-top: 1px solid #f5f2eb;
        padding-top: 20px;
        margin-top: 20px;
      }

      .a4-receipt-container .footer-thank-you {
        font-size: 14px;
        font-weight: bold;
        color: #7f1d1d;
        margin: 0;
        line-height: 1.6;
      }

      .a4-receipt-container .footer-thank-you-en {
        font-size: 12px;
        color: #44403c;
        margin: 4px 0 0 0;
        font-weight: 500;
      }

      .a4-receipt-container .footer-tech {
        font-size: 9.5px;
        color: #a8a29e;
        margin: 12px 0 0 0;
      }

      /* Print Specific Overrides */
      @media print {
        @page {
          size: ${format === '80mm' ? '80mm auto' : 'A4'};
          margin: ${format === '80mm' ? '0' : '15mm'};
        }
        
        body {
          background: white !important;
          color: black !important;
        }

        #print-section {
          width: ${format === '80mm' ? '72mm' : '100%'} !important;
          padding: ${format === '80mm' ? '2mm' : '0'} !important;
          margin: 0 auto !important;
        }

        .thermal-receipt-container {
          width: 72mm !important;
          max-width: 72mm !important;
        }
      }
    </style>
    ${format === '80mm' ? thermalHTML : a4HTML}
  `;

  // Open print content in a new tab for pristine cross-browser and iframe compatibility
  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt #${order.orderNumber}</title>
        <style>
          /* Embed Google Urdu fonts for beautiful printing */
          @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&family=Inter:wght@400;500;600;700;800&display=swap');

          /* General resets */
          body {
            margin: 0;
            padding: ${format === '80mm' ? '0' : '15mm'};
            background: white !important;
            color: black !important;
            box-sizing: border-box;
            font-family: 'Inter', sans-serif;
          }
          #print-section {
            width: ${format === '80mm' ? '72mm' : '100%'} !important;
            margin: 0 auto !important;
          }
          @media print {
            @page {
              size: ${format === '80mm' ? '80mm auto' : 'A4'};
              margin: ${format === '80mm' ? '0' : '15mm'};
            }
            body {
              background: white !important;
              color: black !important;
            }
          }
        </style>
        ${printSection.querySelector('style')?.outerHTML || ''}
      </head>
      <body>
        <div id="print-section">
          ${format === '80mm' ? thermalHTML : a4HTML}
        </div>
        <script>
          // Run print on load
          window.addEventListener('DOMContentLoaded', () => {
            // Give layout/images 300ms to render beautifully
            setTimeout(() => {
              window.focus();
              window.print();
              // Auto close printed tab
              window.onafterprint = () => {
                window.close();
              };
            }, 300);
          });
          // Fallback trigger
          setTimeout(() => {
            try { window.print(); } catch(e){}
          }, 1500);
        </script>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
  } else {
    // Fallback: In-page print style overlay if popup blocker intercepts window.open
    const styleEl = document.createElement('style');
    styleEl.id = 'print-style-fallback';
    styleEl.innerHTML = `
      @media print {
        body * {
          visibility: hidden !important;
        }
        #print-overlay-fallback, #print-overlay-fallback * {
          visibility: visible !important;
        }
        #print-overlay-fallback {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          background: white !important;
        }
      }
    `;
    document.head.appendChild(styleEl);

    const overlay = document.createElement('div');
    overlay.id = 'print-overlay-fallback';
    overlay.className = 'fixed inset-0 bg-white dark:bg-stone-900 z-[9999] overflow-auto p-4 flex flex-col items-center justify-center';
    overlay.innerHTML = `
      <div class="w-full max-w-sm bg-white dark:bg-stone-950 p-4 border border-stone-200 dark:border-stone-800 shadow-lg rounded-xl mb-4 overflow-auto max-h-[80vh]">
        ${printContent}
      </div>
      <div class="flex gap-2 no-print">
        <button id="btn-fallback-print" class="px-4 py-2 bg-red-800 text-white font-bold rounded-lg text-xs cursor-pointer">Print Receipt</button>
        <button id="btn-fallback-close" class="px-4 py-2 bg-stone-200 text-stone-800 font-bold rounded-lg text-xs cursor-pointer">Close</button>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('btn-fallback-print')?.addEventListener('click', () => {
      window.print();
    });

    document.getElementById('btn-fallback-close')?.addEventListener('click', () => {
      overlay.remove();
      styleEl.remove();
    });
  }
}
