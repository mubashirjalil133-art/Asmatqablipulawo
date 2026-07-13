/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Printer, Calendar, FileSpreadsheet, Copy, 
  CheckCircle2, ShoppingBag, Hash, Table, Clock, User, ArrowRightLeft, 
  ShieldCheck, TrendingUp, AlertTriangle, ShieldAlert, Award, CreditCard, DollarSign
} from 'lucide-react';
import { Language, Order, Dish, InventoryItem } from '../types';
import { printReceipt } from '../utils/printReceipt';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';

interface RmsReportsProps {
  language: Language;
  orders: Order[];
  dishes: Dish[];
}

export default function RmsReports({ language, orders, dishes }: RmsReportsProps) {
  const isUrdu = language === 'ur';

  // Selection
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [copiedAlert, setCopiedAlert] = useState(false);
  const [liveInventory, setLiveInventory] = useState<InventoryItem[]>([]);

  // Load live inventory alerts
  useEffect(() => {
    const savedInv = localStorage.getItem('asmat_rms_inventory');
    if (savedInv) {
      setLiveInventory(JSON.parse(savedInv));
    }
  }, []);

  const printWithIframe = (htmlContent: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Restaurant Report</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&family=Inter:wght@400;500;600;700;800&display=swap');
              body {
                margin: 0;
                padding: 20px;
                background: white !important;
                color: black !important;
                font-family: 'Inter', sans-serif;
              }
              @media print {
                body {
                  background: white !important;
                  color: black !important;
                }
              }
            </style>
          </head>
          <body>
            ${htmlContent}
            <script>
              window.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => {
                  window.focus();
                  window.print();
                  window.onafterprint = () => window.close();
                }, 300);
              });
              setTimeout(() => {
                try { window.print(); } catch(e){}
              }, 1500);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      // Fallback: In-page print style overlay if popup blocker intercepts window.open
      const styleEl = document.createElement('style');
      styleEl.id = 'print-style-fallback';
      styleEl.innerHTML = `
        @media print {
          body > * {
            display: none !important;
          }
          #print-section-fallback {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            background: white !important;
            color: black !important;
            z-index: 9999999;
          }
        }
        #print-section-fallback {
          display: none;
        }
      `;
      document.head.appendChild(styleEl);
      
      const fallbackDiv = document.createElement('div');
      fallbackDiv.id = 'print-section-fallback';
      fallbackDiv.innerHTML = htmlContent;
      document.body.appendChild(fallbackDiv);
      
      window.focus();
      window.print();
      
      // cleanup
      setTimeout(() => {
        if (styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
        if (fallbackDiv.parentNode) fallbackDiv.parentNode.removeChild(fallbackDiv);
      }, 1000);
    }
  };

  // Compute stats for the report
  const now = new Date();
  
  // Date filtering logic
  const filterByPeriod = (order: Order) => {
    const oDate = new Date(order.timestamp);
    if (isNaN(oDate.getTime())) return true; // fallback

    const diffTime = Math.abs(now.getTime() - oDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (reportPeriod === 'daily') {
      return oDate.toLocaleDateString() === now.toLocaleDateString();
    } else if (reportPeriod === 'weekly') {
      return diffDays <= 7;
    } else if (reportPeriod === 'monthly') {
      return diffDays <= 30;
    } else {
      return oDate.getFullYear() === now.getFullYear();
    }
  };

  const periodOrders = orders.filter(filterByPeriod);
  const periodPaid = periodOrders.filter(o => o.paymentStatus === 'paid');
  
  const salesRevenue = periodPaid.reduce((sum, o) => sum + o.grandTotal, 0);
  const salesSubtotal = periodPaid.reduce((sum, o) => sum + o.subtotal, 0);
  const salesDiscount = periodPaid.reduce((sum, o) => sum + o.discount, 0);
  const salesTax = periodPaid.reduce((sum, o) => sum + o.tax, 0);
  const totalOrdersCount = periodOrders.length;
  const completedOrdersCount = periodPaid.length;

  // Split payment methods
  const cashSales = periodPaid.filter(o => o.paymentMethod === 'cash').reduce((sum, o) => sum + o.grandTotal, 0);
  const cardSales = periodPaid.filter(o => o.paymentMethod === 'card').reduce((sum, o) => sum + o.grandTotal, 0);
  const easypaisaSales = periodPaid.filter(o => o.paymentMethod === 'easypaisa').reduce((sum, o) => sum + o.grandTotal, 0);
  const jazzcashSales = periodPaid.filter(o => o.paymentMethod === 'jazzcash').reduce((sum, o) => sum + o.grandTotal, 0);

  // Compute Best Selling Items for the selected period
  const itemSalesMap: Record<string, { id: string; nameEn: string; nameUr: string; quantity: number; revenue: number; price: number }> = {};
  
  periodPaid.forEach(order => {
    order.items.forEach(item => {
      const id = item.dishId;
      if (!itemSalesMap[id]) {
        itemSalesMap[id] = {
          id,
          nameEn: item.nameEn,
          nameUr: item.nameUr,
          quantity: 0,
          revenue: 0,
          price: item.price
        };
      }
      itemSalesMap[id].quantity += item.quantity;
      itemSalesMap[id].revenue += item.price * item.quantity;
    });
  });

  const bestSellingItems = Object.values(itemSalesMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5); // top 5

  const allSoldItemsList = Object.values(itemSalesMap)
    .sort((a, b) => b.quantity - a.quantity);

  // Inventory warnings
  const outOfStockItems = liveInventory.filter(item => item.stock === 0);
  const lowStockItems = liveInventory.filter(item => item.stock > 0 && item.stock <= item.minStock);

  // Recharts Sales Trend Data Generator
  const getTrendData = () => {
    if (reportPeriod === 'daily') {
      const times = ['09:00 AM', '12:00 PM', '03:00 PM', '06:00 PM', '09:00 PM', '11:00 PM'];
      return times.map(t => {
        let revenue = 0;
        let tickets = 0;
        periodPaid.forEach(o => {
          const timePart = o.timestamp.split(',')[1]?.trim() || '';
          if (timePart) {
            const hr = parseInt(timePart.split(':')[0]);
            const isPM = timePart.toLowerCase().includes('pm');
            const hr24 = isPM && hr !== 12 ? hr + 12 : (!isPM && hr === 12 ? 0 : hr);

            if (t.includes('09:00 AM') && hr24 < 11) { revenue += o.grandTotal; tickets++; }
            else if (t.includes('12:00 PM') && hr24 >= 11 && hr24 < 14) { revenue += o.grandTotal; tickets++; }
            else if (t.includes('03:00 PM') && hr24 >= 14 && hr24 < 17) { revenue += o.grandTotal; tickets++; }
            else if (t.includes('06:00 PM') && hr24 >= 17 && hr24 < 20) { revenue += o.grandTotal; tickets++; }
            else if (t.includes('09:00 PM') && hr24 >= 20 && hr24 < 22) { revenue += o.grandTotal; tickets++; }
            else if (t.includes('11:00 PM') && hr24 >= 22) { revenue += o.grandTotal; tickets++; }
          }
        });
        return { name: t, Revenue: revenue, Orders: tickets };
      });
    } else if (reportPeriod === 'weekly') {
      const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const data = weekdays.map(day => ({ name: day, Revenue: 0, Orders: 0 }));
      
      periodPaid.forEach(o => {
        const oDate = new Date(o.timestamp);
        const dayName = oDate.toLocaleDateString('en-US', { weekday: 'short' });
        const match = data.find(d => d.name === dayName);
        if (match) {
          match.Revenue += o.grandTotal;
          match.Orders += 1;
        }
      });
      return data;
    } else if (reportPeriod === 'monthly') {
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      const data = weeks.map(wk => ({ name: wk, Revenue: 0, Orders: 0 }));
      periodPaid.forEach(o => {
        const oDate = new Date(o.timestamp);
        const dateNum = oDate.getDate();
        if (dateNum <= 7) { data[0].Revenue += o.grandTotal; data[0].Orders++; }
        else if (dateNum <= 14) { data[1].Revenue += o.grandTotal; data[1].Orders++; }
        else if (dateNum <= 21) { data[2].Revenue += o.grandTotal; data[2].Orders++; }
        else { data[3].Revenue += o.grandTotal; data[3].Orders++; }
      });
      return data;
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const data = months.map(m => ({ name: m, Revenue: 0, Orders: 0 }));
      periodPaid.forEach(o => {
        const oDate = new Date(o.timestamp);
        const mIdx = oDate.getMonth();
        if (mIdx >= 0 && mIdx < 12) {
          data[mIdx].Revenue += o.grandTotal;
          data[mIdx].Orders += 1;
        }
      });
      return data;
    }
  };

  const trendData = getTrendData();

  // Payment channels chart data
  const paymentChannelData = [
    { name: isUrdu ? 'کیش' : 'Cash', value: cashSales, color: '#991b1b' },
    { name: isUrdu ? 'کارڈ' : 'Card', value: cardSales, color: '#3b82f6' },
    { name: 'Easypaisa', value: easypaisaSales, color: '#10b981' },
    { name: 'JazzCash', value: jazzcashSales, color: '#f59e0b' }
  ].filter(item => item.value > 0);

  // Best Selling Items chart data
  const bestSellersChartData = bestSellingItems.map(item => ({
    name: isUrdu ? item.nameUr : item.nameEn,
    Quantity: item.quantity,
    Revenue: item.revenue
  }));

  // EXPORT TO EXCEL (Beautiful clean raw ledger & product sales rows)
  const handleExportExcel = () => {
    // Section 1: Sales Summary
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ASMAT KABULI PULAO & HOTEL - EXECUTIVE SALES LEDGER\n";
    csvContent += `Report Period,${reportPeriod.toUpperCase()}\n`;
    csvContent += `Export Date,${new Date().toLocaleString()}\n\n`;
    
    csvContent += "FINANCIAL KPI METRICS\n";
    csvContent += `Metric,Value\n`;
    csvContent += `Total Sales Revenue,Rs. ${salesRevenue}\n`;
    csvContent += `Gross Subtotal,Rs. ${salesSubtotal}\n`;
    csvContent += `Total Discounts Offered,Rs. ${salesDiscount}\n`;
    csvContent += `Total Sales Tax Collected,Rs. ${salesTax}\n`;
    csvContent += `Total Orders Served,${completedOrdersCount}\n`;
    csvContent += `Cash Drawer Intake,Rs. ${cashSales}\n`;
    csvContent += `Digital Card Intake,Rs. ${cardSales}\n`;
    csvContent += `Easypaisa Revenue,Rs. ${easypaisaSales}\n`;
    csvContent += `JazzCash Revenue,Rs. ${jazzcashSales}\n\n`;

    // Section 2: Best Selling Items
    csvContent += "BEST SELLING PRODUCTS PERFORMANCE\n";
    csvContent += "Dish Name,Quantity Sold,Unit Price (Rs),Total Contribution (Rs)\n";
    bestSellingItems.forEach(item => {
      csvContent += `"${item.nameEn}",${item.quantity},${item.price},${item.revenue}\n`;
    });
    csvContent += "\n";

    // Section 3: Critical Inventory Status
    csvContent += "CRITICAL INVENTORY REORDER ALERTS\n";
    csvContent += "Ingredient,Stock Level,Min Threshold,Unit,Status\n";
    liveInventory.forEach(item => {
      const status = item.stock === 0 ? "OUT OF STOCK" : item.stock <= item.minStock ? "LOW STOCK" : "OPTIMAL";
      csvContent += `"${item.nameEn}",${item.stock},${item.minStock},${item.unit},${status}\n`;
    });
    csvContent += "\n";

    // Section 4: Detailed Order Ledger
    csvContent += "TRANSACTION LEDGER DETAILS\n";
    csvContent += "Receipt Number,Timestamp,Table,Waiter Assigned,Subtotal,Discount,Tax,Grand Total,Payment Method,Status\n";
    periodOrders.forEach(o => {
      csvContent += `${o.orderNumber},"${o.timestamp}",Table ${o.tableNumber},"${o.waiterName || 'Counter'}",${o.subtotal},${o.discount},${o.tax},${o.grandTotal},${o.paymentStatus === 'paid' ? o.paymentMethod?.toUpperCase() : 'UNPAID'},${o.status.toUpperCase()}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `asmat_executive_report_${reportPeriod}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // EXPORT TO PDF & PRINT (Full A4 Executive Layout with Best Sellers, Financials, and Stock Alerts)
  const handlePrintA4Report = () => {
    const saved = localStorage.getItem('asmat_rms_settings');
    let settings = {
      logo: "/logo.png",
      nameEn: "ASMAT KABULI PULAO & HOTEL",
      nameUr: "عصمت ہوٹل اینڈ ریسٹورنٹ",
      sloganEn: "KABULI PULAO & HOTEL",
      sloganUr: "کابلی پلاؤ اینڈ ہوٹل",
      phone: "0302-8073204 / 0304-9767017",
      addressEn: "Main G.T. Road, Sarai Naurang, KP, Pakistan",
      addressUr: "مین جی ٹی روڈ، سرائے نورنگ، خیبر پختونخوا",
    };
    if (saved) {
      try {
        settings = { ...settings, ...JSON.parse(saved) };
      } catch (e) {}
    }

    const printContent = `
      <html>
        <head>
          <title>${settings.nameEn} - Executive Ledger</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; color: #1c1917; padding: 30px; line-height: 1.4; background: #fff; }
            .header { text-align: center; margin-bottom: 25px; border-bottom: 3px double #1c1917; padding-bottom: 15px; }
            .logo-title { font-size: 24px; font-weight: 900; margin: 0; letter-spacing: 1px; }
            .subtitle { font-size: 12px; margin: 3px 0; font-weight: bold; }
            .report-title { font-size: 16px; font-weight: bold; text-decoration: underline; margin-top: 15px; margin-bottom: 5px; text-transform: uppercase; }
            
            .grid-container { display: flex; justify-content: space-between; margin-top: 15px; gap: 20px; }
            .grid-box { flex: 1; border: 1px solid #000; padding: 12px; }
            .grid-box h3 { margin: 0 0 10px 0; font-size: 13px; font-weight: bold; border-bottom: 1px dashed #000; padding-bottom: 4px; }
            
            .summary-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            .summary-table td { padding: 6px 10px; border: 1px solid #1c1917; font-size: 11px; }
            
            .details-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .details-table th, .details-table td { padding: 6px 8px; border-bottom: 1px solid #1c1917; font-size: 10px; text-align: left; }
            .details-table th { background-color: #f5f5f4; border-top: 1px solid #1c1917; font-weight: bold; }
            
            .badge-red { background-color: #fee2e2; color: #991b1b; padding: 1px 4px; font-weight: bold; border: 1px solid #991b1b; }
            .badge-amber { background-color: #fef3c7; color: #92400e; padding: 1px 4px; font-weight: bold; border: 1px solid #92400e; }
            
            .section-header { font-size: 13px; font-weight: bold; margin-top: 25px; margin-bottom: 5px; border-bottom: 1px solid #1c1917; padding-bottom: 3px; text-transform: uppercase; }
            .footer { margin-top: 40px; text-align: center; font-size: 9px; border-top: 1px dashed #1c1917; padding-top: 10px; color: #78716c; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${settings.logo || '/logo.png'}" style="height: 60px; width: 60px; object-fit: contain; display: block; margin: 0 auto 10px auto;" />
            <h1 class="logo-title">${settings.nameEn.toUpperCase()}</h1>
            <p class="subtitle">${settings.addressEn}</p>
            <p class="subtitle">Contact: ${settings.phone}</p>
            <div class="report-title">${reportPeriod} Executive Audit Ledger & Operations Statement</div>
            <p class="subtitle">Generated: ${new Date().toLocaleString()} | Period Active: ${reportPeriod.toUpperCase()}</p>
          </div>

          <div class="grid-container">
            <div class="grid-box">
              <h3>1. FINANCIAL RECONCILIATION</h3>
              <table style="width:100%; font-size:11px; line-height:1.6;">
                <tr><td><strong>Gross Subtotal:</strong></td><td style="text-align:right;">Rs. ${salesSubtotal.toLocaleString()}</td></tr>
                <tr><td><strong>Discounts Given:</strong></td><td style="text-align:right; color:#991b1b;">- Rs. ${salesDiscount.toLocaleString()}</td></tr>
                <tr><td><strong>GST / Sales Tax:</strong></td><td style="text-align:right;">+ Rs. ${salesTax.toLocaleString()}</td></tr>
                <tr style="border-top:1px dashed #000;"><td style="font-weight:bold;">NET REVENUE:</td><td style="text-align:right; font-weight:bold;">Rs. ${salesRevenue.toLocaleString()}</td></tr>
              </table>
            </div>

            <div class="grid-box">
              <h3>2. PAYMENT RECEIVABLES CHANNEL</h3>
              <table style="width:100%; font-size:11px; line-height:1.6;">
                <tr><td><strong>Cash Drawer Intake:</strong></td><td style="text-align:right;">Rs. ${cashSales.toLocaleString()}</td></tr>
                <tr><td><strong>Credit/Debit Cards:</strong></td><td style="text-align:right;">Rs. ${cardSales.toLocaleString()}</td></tr>
                <tr><td><strong>Easypaisa Mobile:</strong></td><td style="text-align:right;">Rs. ${easypaisaSales.toLocaleString()}</td></tr>
                <tr><td><strong>JazzCash Mobile:</strong></td><td style="text-align:right;">Rs. ${jazzcashSales.toLocaleString()}</td></tr>
              </table>
            </div>
          </div>

          <table class="summary-table">
            <tr>
              <td><strong>Registered Tickets Count:</strong></td>
              <td>${totalOrdersCount} orders</td>
              <td><strong>Paid / Settled Invoices:</strong></td>
              <td>${completedOrdersCount} tickets</td>
              <td><strong>Average Ticket Size:</strong></td>
              <td>Rs. ${completedOrdersCount > 0 ? Math.round(salesRevenue / completedOrdersCount).toLocaleString() : 0}</td>
            </tr>
          </table>

          <div class="section-header">3. PRODUCT DEMAND & SOLD DISHES BREAKDOWN</div>
          <table class="details-table">
            <thead>
              <tr>
                <th style="width: 10%;">Rank</th>
                <th style="width: 50%;">Dish Description</th>
                <th style="width: 20%; text-align: center;">Units Served</th>
                <th style="width: 20%; text-align: right;">Revenue Sourced</th>
              </tr>
            </thead>
            <tbody>
              ${allSoldItemsList.length === 0 ? `
                <tr><td colspan="4" style="text-align:center; padding:15px; color:#78716c;">No food items logged in paid invoices.</td></tr>
              ` : allSoldItemsList.map((item, idx) => `
                <tr>
                  <td>#${idx + 1}</td>
                  <td><strong>${item.nameEn}</strong><br/><span style="font-size:9px; color:#57534e;">${item.nameUr}</span></td>
                  <td style="text-align: center;">x${item.quantity}</td>
                  <td style="text-align: right; font-weight: bold;">Rs. ${item.revenue.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="section-header">4. WAREHOUSE STOCK REORDER STATUS</div>
          <table class="details-table">
            <thead>
              <tr>
                <th>Ingredient SKU</th>
                <th>Material Specification</th>
                <th>Quantity in Hand</th>
                <th>Safety Threshold</th>
                <th>Vendor / Supplier ID</th>
                <th>Procurement Status</th>
              </tr>
            </thead>
            <tbody>
              ${liveInventory.length === 0 ? `
                <tr><td colspan="6" style="text-align:center; padding:15px; color:#78716c;">No inventory items found.</td></tr>
              ` : liveInventory.map(item => {
                const isOut = item.stock === 0;
                const isLow = item.stock > 0 && item.stock <= item.minStock;
                const statusBadge = isOut ? '<span class="badge-red">OUT OF STOCK</span>' : isLow ? '<span class="badge-amber">LOW REORDER</span>' : '<span style="color:#16a34a; font-weight:bold;">OPTIMAL</span>';
                return `
                  <tr>
                    <td>${item.sku}</td>
                    <td><strong>${item.nameEn}</strong><br/><span style="font-size:9px; color:#57534e;">${item.nameUr}</span></td>
                    <td>${item.stock} ${item.unit}</td>
                    <td>${item.minStock} ${item.unit}</td>
                    <td>${item.supplierId || 'Local'}</td>
                    <td>${statusBadge}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="section-header">5. AUDIT REGISTRY STATEMENT LOG</div>
          <table class="details-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Timestamp</th>
                <th>Table</th>
                <th>Assigned Server</th>
                <th>Subtotal</th>
                <th>Discount</th>
                <th>Grand Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${periodOrders.map(o => `
                <tr>
                  <td>${o.orderNumber}</td>
                  <td>${o.timestamp}</td>
                  <td>Table ${o.tableNumber}</td>
                  <td>${o.waiterName || 'Counter'}</td>
                  <td>Rs. ${o.subtotal}</td>
                  <td>Rs. ${o.discount}</td>
                  <td><strong>Rs. ${o.grandTotal}</strong></td>
                  <td>${o.paymentStatus === 'paid' ? 'PAID' : 'PENDING'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Enterprise RMS Auditor • Certified Restaurant Registry System</p>
            <p>© 1995-${new Date().getFullYear()} Asmat Kabuli Pulao & Hotel. All Rights Reserved.</p>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;

    printWithIframe(printContent);
  };

  // PRINT THERMAL DAILY CLOSING (80mm Thermal Slip)
  const handlePrintDailyClosingThermal = () => {
    const saved = localStorage.getItem('asmat_rms_settings');
    let settings = {
      logo: "/logo.png",
      nameEn: "ASMAT KABULI PULAO & HOTEL",
      nameUr: "عصمت ہوٹل اینڈ ریسٹورنٹ",
      sloganEn: "KABULI PULAO & HOTEL",
      sloganUr: "کابلی پلاؤ اینڈ ہوٹل",
      phone: "0302-8073204 / 0304-9767017",
      addressEn: "Main G.T. Road, Sarai Naurang, KP, Pakistan",
      addressUr: "مین جی ٹی روڈ، سرائے نورنگ، خیبر پختونخوا",
    };
    if (saved) {
      try {
        settings = { ...settings, ...JSON.parse(saved) };
      } catch (e) {}
    }

    const thermalContent = `
      <html>
        <head>
          <title>Daily Closing Receipt</title>
          <style>
            body { width: 80mm; font-family: 'Courier New', monospace; font-size: 11px; padding: 4px; color: #000; line-height: 1.3; }
            .center { text-align: center; }
            .line { border-bottom: 1px dashed #000; margin: 8px 0; }
            .double-line { border-bottom: 2px double #000; margin: 8px 0; }
            .flex-row { display: flex; justify-content: space-between; }
            .bold { font-weight: bold; }
            .logo { font-size: 14px; font-weight: bold; margin-bottom: 2px; }
          </style>
        </head>
        <body>
          <div class="center">
            <img src="${settings.logo || '/logo.png'}" style="height: 40px; width: 40px; object-fit: contain; display: block; margin: 0 auto 5px auto;" />
            <div class="logo">${settings.nameEn}</div>
            <div>${settings.addressEn}</div>
            <div>Phone: ${settings.phone}</div>
            <div class="bold">DAILY CLOSING Z-REPORT</div>
            <div>Date: ${new Date().toLocaleDateString()}</div>
            <div>Time: ${new Date().toLocaleTimeString()}</div>
          </div>

          <div class="line"></div>

          <div class="flex-row">
            <span>Period:</span>
            <span class="bold">${reportPeriod.toUpperCase()}</span>
          </div>
          <div class="flex-row">
            <span>Z-Report ID:</span>
            <span class="bold">ZR-${Date.now().toString().substring(6)}</span>
          </div>

          <div class="line"></div>

          <div class="flex-row bold">
            <span>TOTAL GROSS:</span>
            <span>Rs.${salesSubtotal.toLocaleString()}</span>
          </div>
          <div class="flex-row">
            <span>DISCOUNTS:</span>
            <span>Rs.${salesDiscount.toLocaleString()}</span>
          </div>
          <div class="flex-row">
            <span>TAX/GST:</span>
            <span>Rs.${salesTax.toLocaleString()}</span>
          </div>
          <div class="flex-row bold">
            <span>NET REVENUE:</span>
            <span>Rs.${salesRevenue.toLocaleString()}</span>
          </div>

          <div class="line"></div>

          <div class="flex-row">
            <span>CASH:</span>
            <span>Rs.${cashSales.toLocaleString()}</span>
          </div>
          <div class="flex-row">
            <span>CARD:</span>
            <span>Rs.${cardSales.toLocaleString()}</span>
          </div>
          <div class="flex-row">
            <span>EASYPAISA:</span>
            <span>Rs.${easypaisaSales.toLocaleString()}</span>
          </div>
          <div class="flex-row">
            <span>JAZZCASH:</span>
            <span>Rs.${jazzcashSales.toLocaleString()}</span>
          </div>

          <div class="line"></div>

          <div class="flex-row">
            <span>Total Orders:</span>
            <span>${totalOrdersCount}</span>
          </div>
          <div class="flex-row">
            <span>Paid Receipts:</span>
            <span>${completedOrdersCount}</span>
          </div>
          <div class="flex-row">
            <span>Avg ticket:</span>
            <span>Rs.${completedOrdersCount > 0 ? Math.round(salesRevenue / completedOrdersCount) : 0}</span>
          </div>

          <div class="line"></div>
          <div class="center bold">SOLD ITEMS BREAKDOWN</div>
          <div class="line"></div>
          ${allSoldItemsList.length === 0 ? `
            <div class="center" style="color:#666;">No sold items logged.</div>
          ` : allSoldItemsList.map(item => `
            <div class="flex-row">
              <span style="max-width: 65%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.nameEn} x${item.quantity}</span>
              <span>Rs.${item.revenue.toLocaleString()}</span>
            </div>
          `).join('')}

          <div class="double-line"></div>
          
          <div class="center bold">
            SYSTEM AUDIT OK<br/>
            DAILY REGISTER LOCKED
          </div>

          <script>window.print();</script>
        </body>
      </html>
    `;

    printWithIframe(thermalContent);
  };

  // PRINT INDIVIDUAL KOT LOG (Kitchen Order Ticket)
  const handlePrintKOT = (order: Order) => {
    const kotContent = `
      <html>
        <head>
          <title>KOT - Kitchen Order Ticket</title>
          <style>
            body { width: 80mm; font-family: 'Courier New', monospace; font-size: 12px; padding: 4px; color: #000; line-height: 1.4; }
            .center { text-align: center; }
            .line { border-bottom: 1px dashed #000; margin: 8px 0; }
            .flex-row { display: flex; justify-content: space-between; }
            .bold { font-weight: bold; font-size: 13px; }
            .header-title { font-size: 16px; font-weight: bold; border: 1px solid #000; padding: 4px; display: inline-block; margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <div class="center">
            <div class="header-title">KITCHEN ORDER TICKET (KOT)</div>
            <div class="bold">ASMAT KABULI PULAO</div>
            <div class="bold">TABLE #${order.tableNumber}</div>
            <div>Waiter: ${order.waiterName || 'Counter'}</div>
            <div>Order: ${order.orderNumber}</div>
            <div>Date: ${order.timestamp}</div>
          </div>

          <div class="line"></div>

          <div class="bold flex-row">
            <span>ITEM</span>
            <span>QTY</span>
          </div>

          <div class="line"></div>

          ${order.items.map(it => `
            <div class="flex-row bold">
              <span>* ${it.nameEn} <br/>&nbsp;&nbsp;(${it.nameUr})</span>
              <span>x${it.quantity}</span>
            </div>
            <div class="line"></div>
          `).join('')}

          <div class="center bold" style="margin-top: 15px;">
            -- COOKING PRIORITY STAMP --
          </div>

          <script>window.print();</script>
        </body>
      </html>
    `;

    printWithIframe(kotContent);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Dynamic Stock Alerts Integration */}
      {(outOfStockItems.length > 0 || lowStockItems.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {outOfStockItems.length > 0 && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-red-800 dark:text-red-400 flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider">
                  {isUrdu ? "انتہائی اہم: اسٹاک بالکل ختم ہے!" : "CRITICAL ALERT: OUT OF STOCK!"}
                </h4>
                <p className="text-[11px] opacity-90 mt-1">
                  {isUrdu 
                    ? `کچن کے لیے درج ذیل اشیاء بالکل ختم ہو چکی ہیں: ${outOfStockItems.map(i => i.nameUr).join(', ')}`
                    : `Immediate restock required! The following raw materials are at 0: ${outOfStockItems.map(i => i.nameEn).join(', ')}`
                  }
                </p>
              </div>
            </div>
          )}

          {lowStockItems.length > 0 && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-amber-800 dark:text-amber-400 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider">
                  {isUrdu ? "انتباہ: اسٹاک کم سطح پر ہے" : "LOW STOCK ALERTS"}
                </h4>
                <p className="text-[11px] opacity-90 mt-1">
                  {isUrdu 
                    ? `${lowStockItems.length} اشیاء کے اسٹاک کی سطح مقررہ حد سے کم ہو گئی ہے۔`
                    : `${lowStockItems.length} essential materials are running below safety limit. Order refill recommended.`
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Filter & Report Selection Control */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-stone-950 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 gap-4">
        <div>
          <span className="text-[10px] uppercase font-black text-red-800 dark:text-amber-500 tracking-wider">
            {isUrdu ? "ادارہ جاتی فنانشل آڈٹ" : "Audit Center"}
          </span>
          <h3 className="text-sm font-extrabold text-stone-900 dark:text-white">
            {isUrdu ? "روزانہ، ہفتہ وار، ماہانہ اور سالانہ رپورٹس" : "Comprehensive Restaurant Sales Ledger"}
          </h3>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {[
            { id: 'daily' as const, label: isUrdu ? 'روزانہ' : 'Daily' },
            { id: 'weekly' as const, label: isUrdu ? 'ہفتہ وار' : 'Weekly' },
            { id: 'monthly' as const, label: isUrdu ? 'ماہانہ' : 'Monthly' },
            { id: 'yearly' as const, label: isUrdu ? 'سالانہ' : 'Yearly' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setReportPeriod(p.id)}
              className={`flex-1 sm:flex-initial rounded-xl px-3.5 py-2 text-xs font-black transition-all cursor-pointer ${
                reportPeriod === p.id
                  ? 'bg-red-800 text-white dark:bg-amber-500 dark:text-stone-950 shadow'
                  : 'bg-stone-100 dark:bg-stone-900 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Executive KPI Dashboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Revenue card */}
        <div className="bg-white dark:bg-stone-950 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 flex items-center gap-4 shadow-sm">
          <div className="rounded-xl bg-red-800/10 dark:bg-amber-500/10 text-red-800 dark:text-amber-500 p-3">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 block">{isUrdu ? "کل ریوینیو آمدنی" : "Total Revenue"}</span>
            <span className="text-base font-black font-mono text-red-800 dark:text-amber-400 block">Rs. {salesRevenue.toLocaleString()}</span>
            <span className="text-[9px] text-stone-400 font-medium block mt-0.5">{isUrdu ? "ادا شدہ بلوں کا نیٹ" : "Net from settled tickets"}</span>
          </div>
        </div>

        {/* Total Orders card */}
        <div className="bg-white dark:bg-stone-950 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 flex items-center gap-4 shadow-sm">
          <div className="rounded-xl bg-blue-500/10 text-blue-500 p-3">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 block">{isUrdu ? "کل آرڈرز سروس" : "Total Orders"}</span>
            <span className="text-base font-black font-mono text-stone-900 dark:text-white block">{completedOrdersCount} / {totalOrdersCount}</span>
            <span className="text-[9px] text-stone-400 font-medium block mt-0.5">{isUrdu ? "ادا شدہ بمقابلہ کل آرڈرز" : "Paid vs total logged tickets"}</span>
          </div>
        </div>

        {/* Average Ticket Size Card */}
        <div className="bg-white dark:bg-stone-950 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 flex items-center gap-4 shadow-sm">
          <div className="rounded-xl bg-emerald-500/10 text-emerald-500 p-3">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 block">{isUrdu ? "اوسط آرڈر بل" : "Average Ticket Value"}</span>
            <span className="text-base font-black font-mono text-emerald-500 block">Rs. {completedOrdersCount > 0 ? Math.round(salesRevenue / completedOrdersCount).toLocaleString() : 0}</span>
            <span className="text-[9px] text-stone-400 font-medium block mt-0.5">{isUrdu ? "فی کسٹمر اوسط آمدنی" : "Average spending per guest"}</span>
          </div>
        </div>

        {/* Discounts Card */}
        <div className="bg-white dark:bg-stone-950 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 flex items-center gap-4 shadow-sm">
          <div className="rounded-xl bg-amber-500/10 text-amber-500 p-3">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 block">{isUrdu ? "کل رعایت (ڈسکاؤنٹ)" : "Discounts Awarded"}</span>
            <span className="text-base font-black font-mono text-amber-500 block">Rs. {salesDiscount.toLocaleString()}</span>
            <span className="text-[9px] text-stone-400 font-medium block mt-0.5">{isUrdu ? "گاہکوں کو دی گئی رعایت" : "Promotional deductions log"}</span>
          </div>
        </div>

      </div>

      {/* 4. Professional Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Sales Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-stone-950 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-900 pb-3">
            <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider">
              📈 {isUrdu ? "فروخت اور آمدنی کے رجحانات" : "Sales Revenue Trends"} ({reportPeriod.toUpperCase()})
            </h4>
            <span className="text-[10px] font-semibold text-red-800 dark:text-amber-500 font-mono">
              {isUrdu ? "لائیو اپ ڈیٹ" : "Live reconciliation"}
            </span>
          </div>

          <div className="h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#991b1b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#991b1b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                <XAxis 
                  dataKey="name" 
                  stroke="#a8a29e" 
                  fontSize={10} 
                  tickLine={false}
                />
                <YAxis stroke="#a8a29e" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `Rs.${val}`} />
                <Tooltip 
                  contentStyle={{ background: '#1c1917', border: 'none', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                  formatter={(value) => [`Rs. ${value}`, isUrdu ? 'آمدنی' : 'Revenue']}
                />
                <Area type="monotone" dataKey="Revenue" stroke="#991b1b" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Payment Channel Distribution */}
        <div className="bg-white dark:bg-stone-950 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="border-b border-stone-100 dark:border-stone-900 pb-3">
            <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider">
              💳 {isUrdu ? "ادائیگی کے ذرائع" : "Receivables Channel Share"}
            </h4>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {paymentChannelData.length === 0 ? (
              <div className="text-center text-stone-400 text-xs py-10">
                {isUrdu ? "کوئی ٹرانزیکشن لاگ نہیں ملا۔" : "No payment streams in active period."}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentChannelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {paymentChannelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: '#1c1917', border: 'none', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                    formatter={(value) => `Rs. ${value}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] mt-2 border-t border-stone-50 dark:border-stone-900 pt-3">
            {paymentChannelData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                <span className="text-stone-500 font-semibold truncate">{item.name}:</span>
                <span className="font-bold font-mono text-stone-800 dark:text-white">Rs.{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. Best Selling Items & Detailed Statement Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Panel: All Sold Food Items */}
        <div className="lg:col-span-5 bg-white dark:bg-stone-950 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-4 shadow-sm">
          <div className="border-b border-stone-100 dark:border-stone-900 pb-3 flex justify-between items-center">
            <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider">
              🔥 {isUrdu ? "فروخت شدہ پکوان کا تفصیلی حساب" : "Sold Items Breakdown"}
            </h4>
            <span className="text-[10px] bg-red-800/10 dark:bg-amber-500/10 text-red-800 dark:text-amber-500 px-2 py-0.5 rounded-full font-black">
              {isUrdu ? `${allSoldItemsList.length} اشیاء` : `${allSoldItemsList.length} Items`}
            </span>
          </div>

          <div className="space-y-3 max-h-[410px] overflow-y-auto pr-1">
            {allSoldItemsList.length === 0 ? (
              <div className="text-center py-16 text-stone-400 text-xs">
                {isUrdu ? "ادا شدہ انوائسز میں کوئی مینیو آرٹیکل نہیں ملا۔" : "No item sales registered in settled tickets yet."}
              </div>
            ) : (
              allSoldItemsList.map((item, idx) => {
                const pct = salesRevenue > 0 ? Math.round((item.revenue / salesRevenue) * 100) : 0;
                return (
                  <div key={idx} className="p-3 rounded-xl border border-stone-100 dark:border-stone-900 bg-stone-50/50 dark:bg-stone-900/30 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-lg bg-red-800 text-white flex items-center justify-center text-xs font-mono font-black">
                        #{idx + 1}
                      </div>
                      <div>
                        <h5 className="text-xs font-extrabold text-stone-900 dark:text-white truncate max-w-[150px]">
                          {isUrdu ? item.nameUr : item.nameEn}
                        </h5>
                        <p className="text-[10px] text-stone-400 font-medium">
                          {isUrdu ? `${item.quantity} یونٹ فروخت ہوئے` : `x${item.quantity} portions served`}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black font-mono text-red-800 dark:text-amber-400 block">Rs. {item.revenue.toLocaleString()}</span>
                      <span className="text-[9px] text-stone-400 font-semibold block">{pct}% {isUrdu ? "حصہ" : "share"}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Export Options & System Closing Logs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Quick Action Export Center */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <button 
              onClick={handleExportExcel}
              className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 flex items-center justify-between cursor-pointer hover:border-emerald-500/40 transition-all shadow-sm group text-left w-full active:scale-95"
            >
              <div className="space-y-1">
                <h4 className="text-xs font-black text-stone-900 dark:text-white uppercase tracking-wider group-hover:text-emerald-500 transition-colors">
                  {isUrdu ? "ایکسل شیٹ (CSV)" : "Excel Export (CSV)"}
                </h4>
                <p className="text-[10px] text-stone-400">{isUrdu ? "سیلز لیجر اور اسٹاک شیٹ ڈاؤن لوڈ کریں" : "Export financials, best sellers, and stock"}</p>
              </div>
              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500 group-hover:bg-emerald-500/20 transition-all">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
            </button>

            <button 
              onClick={handlePrintA4Report}
              className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 flex items-center justify-between cursor-pointer hover:border-red-500/40 transition-all shadow-sm group text-left w-full active:scale-95"
            >
              <div className="space-y-1">
                <h4 className="text-xs font-black text-stone-900 dark:text-white uppercase tracking-wider group-hover:text-red-500 transition-colors">
                  {isUrdu ? "آڈٹ پی ڈی ایف رپورٹ" : "PDF Executive Report"}
                </h4>
                <p className="text-[10px] text-stone-400">{isUrdu ? "خوبصورت پرنٹ ایبل پی ڈی ایف" : "Download structured formal paper audit"}</p>
              </div>
              <div className="rounded-xl bg-red-800/10 p-3 text-red-500 group-hover:bg-red-800/20 transition-all">
                <FileText className="h-5 w-5" />
              </div>
            </button>

          </div>

          {/* Audit Operations Controls */}
          <div className="bg-white dark:bg-stone-950 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 space-y-4">
            <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider">
              ⚙️ {isUrdu ? "اندراج اور روزانہ کیش بند لاگز" : "Auditing Controls & Registers"}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handlePrintDailyClosingThermal}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-800 hover:bg-red-700 text-white py-3 px-4 text-xs font-black transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                <Printer className="h-4 w-4" />
                <span>{isUrdu ? "تھرمل زیڈ کلوزنگ پرنٹ" : "Print Z-Closing (80mm)"}</span>
              </button>

              <button
                onClick={handlePrintA4Report}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 py-3 px-4 text-xs font-black transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                <FileText className="h-4 w-4" />
                <span>{isUrdu ? "مکمل لیجر آڈٹ پرنٹ کریں" : "Print Executive A4 Report"}</span>
              </button>
            </div>

            {/* Live KOT Log checklist */}
            <div className="pt-4 border-t border-stone-100 dark:border-stone-900 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-stone-400 block">🍳 {isUrdu ? "تخلیق شدہ کچن ٹکٹ لاگ" : "KOT Queue Operations"}</span>
                <span className="text-[10px] font-bold text-stone-400 font-mono">{periodOrders.length} {isUrdu ? "کل آرڈرز" : "total orders"}</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {periodOrders.length === 0 ? (
                  <div className="text-center py-6 text-stone-400 text-xs">
                    {isUrdu ? "کوئی آرڈر ٹکٹ دستیاب نہیں ہے۔" : "No active order logs in selected period."}
                  </div>
                ) : (
                  periodOrders.map((order, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-stone-100 dark:border-stone-900 bg-stone-50/50 dark:bg-stone-900/30 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-stone-900 dark:text-white">{order.orderNumber}</span>
                          <span className="text-[9px] bg-red-800/10 dark:bg-amber-500/10 text-red-800 dark:text-amber-400 px-1.5 py-0.5 rounded font-black uppercase">
                            Table #{order.tableNumber}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-400 mt-0.5">{order.timestamp.split(',')[1] || order.timestamp}</p>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handlePrintKOT(order)}
                          className="rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 px-2.5 py-1 text-[10px] font-extrabold inline-flex items-center gap-0.5 justify-center cursor-pointer active:scale-95 border border-stone-200/50 dark:border-stone-700/50"
                          title="Kitchen Order Ticket"
                        >
                          <Printer className="h-3 w-3" />
                          <span>KOT</span>
                        </button>
                        <button
                          onClick={() => printReceipt(order, '80mm', language)}
                          className="rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2.5 py-1 text-[10px] font-extrabold inline-flex items-center gap-0.5 justify-center cursor-pointer active:scale-95 border border-amber-500/20"
                          title="Print Thermal Receipt (80mm)"
                        >
                          <Printer className="h-3 w-3 text-amber-500" />
                          <span>Thermal</span>
                        </button>
                        <button
                          onClick={() => printReceipt(order, 'a4', language)}
                          className="rounded-lg bg-red-800/10 hover:bg-red-800/20 text-red-800 dark:text-red-400 px-2.5 py-1 text-[10px] font-extrabold inline-flex items-center gap-0.5 justify-center cursor-pointer active:scale-95 border border-red-800/20"
                          title="Print A4 Invoice"
                        >
                          <FileText className="h-3 w-3 text-red-800 dark:text-red-400" />
                          <span>A4</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
