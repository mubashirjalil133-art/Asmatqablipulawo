/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Language, Order, Table as TableType, OrderStatus, 
  PaymentStatus, PaymentMethod, TableStatus, Dish 
} from '../types';
import { 
  TrendingUp, DollarSign, Users, ClipboardList, Search, 
  Filter, Calendar, Check, X, Trash2, ArrowRight, 
  HelpCircle, Receipt, Eye, Printer, FileText, AlertTriangle
} from 'lucide-react';
import { printReceipt } from '../utils/printReceipt';
import { dishesData } from '../data';

interface RmsSalesDashboardProps {
  language: Language;
  orders: Order[];
  tables: TableType[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onUpdateOrderPayment: (
    orderId: string, 
    paymentStatus: PaymentStatus, 
    method?: PaymentMethod,
    discountPercent?: number,
    taxPercent?: number
  ) => void;
  onUpdateTableStatus: (tableId: string, status: TableStatus, currentOrderId?: string) => void;
  onDeleteOrder: (orderId: string) => void;
}

export default function RmsSalesDashboard({
  language,
  orders,
  tables,
  onUpdateOrderStatus,
  onUpdateOrderPayment,
  onUpdateTableStatus,
  onDeleteOrder
}: RmsSalesDashboardProps) {
  const isUrdu = language === 'ur';

  // State variables for search, filter and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(''); // YYYY-MM-DD string
  const [tableFilter, setTableFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'cancelled'>('all');
  
  // Product analytics sorting & searching state
  const [productSearch, setProductSearch] = useState('');
  const [productSort, setProductSort] = useState<'todayQty' | 'weekQty' | 'monthQty' | 'totalQty' | 'revenue'>('totalQty');
  const [analyticsTab, setAnalyticsTab] = useState<'dates' | 'items'>('dates');

  // Modal / Confirm state for deletions
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Helper: Robust Date parser
  const parseOrderDate = (timestamp: string): Date | null => {
    if (!timestamp) return null;
    try {
      const cleanStr = timestamp.replace(/[\u200E\u200F]/g, '');
      const d = new Date(cleanStr);
      if (!isNaN(d.getTime())) return d;
    } catch (e) {}
    return null;
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isThisWeek = (date: Date): boolean => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    return date >= sevenDaysAgo && date <= today;
  };

  const isThisMonth = (date: Date): boolean => {
    const today = new Date();
    return date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Product sales analytics aggregation
  const itemSalesMap: Record<string, {
    nameEn: string;
    nameUr: string;
    todayQty: number;
    weekQty: number;
    monthQty: number;
    totalQty: number;
    revenue: number;
    image?: string;
  }> = {};

  // Seed with all current dishes to display 0 counts if not sold yet
  dishesData.forEach(dish => {
    itemSalesMap[dish.nameEn] = {
      nameEn: dish.nameEn,
      nameUr: dish.nameUr,
      todayQty: 0,
      weekQty: 0,
      monthQty: 0,
      totalQty: 0,
      revenue: 0,
      image: dish.image
    };
  });

  // Load ledger items from localStorage
  const getLedgerItems = () => {
    const savedLedger = localStorage.getItem('asmat_rms_product_sales_ledger');
    if (savedLedger) {
      try {
        return JSON.parse(savedLedger) as Array<{
          id: string;
          orderId: string;
          nameEn: string;
          nameUr: string;
          quantity: number;
          price: number;
          timestamp: string;
          image?: string;
        }>;
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const ledger = getLedgerItems();

  if (ledger.length > 0) {
    ledger.forEach(item => {
      const key = item.nameEn;
      if (!itemSalesMap[key]) {
        itemSalesMap[key] = {
          nameEn: item.nameEn,
          nameUr: item.nameUr || item.nameEn,
          todayQty: 0,
          weekQty: 0,
          monthQty: 0,
          totalQty: 0,
          revenue: 0,
          image: item.image
        };
      }

      const date = parseOrderDate(item.timestamp);
      if (!date) return;

      const qty = item.quantity || 0;
      const price = item.price || 0;
      const rev = price * qty;

      itemSalesMap[key].totalQty += qty;
      itemSalesMap[key].revenue += rev;

      if (isToday(date)) {
        itemSalesMap[key].todayQty += qty;
      }
      if (isThisWeek(date)) {
        itemSalesMap[key].weekQty += qty;
      }
      if (isThisMonth(date)) {
        itemSalesMap[key].monthQty += qty;
      }
    });
  } else {
    // Fallback: Aggregate from orders if ledger is empty (e.g. before initial load seeder runs)
    orders.forEach(order => {
      const isCompleted = order.status === 'completed' || order.status === 'served' || order.paymentStatus === 'paid';
      const isCancelled = order.status === 'cancelled';
      if (!isCompleted || isCancelled) return;

      const date = parseOrderDate(order.timestamp);
      if (!date) return;

      order.items.forEach(item => {
        const key = item.nameEn;
        if (!itemSalesMap[key]) {
          itemSalesMap[key] = {
            nameEn: item.nameEn,
            nameUr: item.nameUr || item.nameEn,
            todayQty: 0,
            weekQty: 0,
            monthQty: 0,
            totalQty: 0,
            revenue: 0,
            image: item.image
          };
        }

        const qty = item.quantity || 0;
        const price = item.price || 0;
        const rev = price * qty;

        itemSalesMap[key].totalQty += qty;
        itemSalesMap[key].revenue += rev;

        if (isToday(date)) {
          itemSalesMap[key].todayQty += qty;
        }
        if (isThisWeek(date)) {
          itemSalesMap[key].weekQty += qty;
        }
        if (isThisMonth(date)) {
          itemSalesMap[key].monthQty += qty;
        }
      });
    });
  }

  // Convert map to array and filter/sort
  const analyticItems = Object.values(itemSalesMap);

  const filteredAnalyticItems = analyticItems.filter(item => {
    const q = productSearch.toLowerCase();
    return item.nameEn.toLowerCase().includes(q) || item.nameUr.toLowerCase().includes(q);
  });

  const sortedAnalyticItems = [...filteredAnalyticItems].sort((a, b) => {
    if (productSort === 'revenue') {
      return b.revenue - a.revenue;
    }
    return b[productSort] - a[productSort];
  });

  // Helper: Get local current date in YYYY-MM-DD
  const getTodayDateString = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayString = getTodayDateString();

  // Helper: Get robust local date string "YYYY-MM-DD" from any timestamp
  const getLocalDateString = (timestamp: string): string => {
    const d = parseOrderDate(timestamp);
    if (!d) return 'Unknown Date';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  interface DailyProductSale {
    nameEn: string;
    nameUr: string;
    quantity: number;
    price: number;
    revenue: number;
    image?: string;
  }

  interface DailySalesGroup {
    dateStr: string;
    formattedDate: string;
    totalQuantity: number;
    totalRevenue: number;
    items: Record<string, DailyProductSale>;
  }

  const getDailySalesGroups = (): DailySalesGroup[] => {
    const groups: Record<string, DailySalesGroup> = {};

    const processItem = (nameEn: string, nameUr: string, quantity: number, price: number, timestamp: string, image?: string) => {
      const dateStr = getLocalDateString(timestamp);
      if (dateStr === 'Unknown Date') return;

      if (!groups[dateStr]) {
        const d = parseOrderDate(timestamp);
        let formattedDate = dateStr;
        if (d) {
          formattedDate = d.toLocaleDateString(isUrdu ? 'ur-PK' : 'en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
        groups[dateStr] = {
          dateStr,
          formattedDate,
          totalQuantity: 0,
          totalRevenue: 0,
          items: {}
        };
      }

      const grp = groups[dateStr];
      const qty = quantity || 0;
      const rev = qty * (price || 0);

      grp.totalQuantity += qty;
      grp.totalRevenue += rev;

      if (!grp.items[nameEn]) {
        grp.items[nameEn] = {
          nameEn,
          nameUr: nameUr || nameEn,
          quantity: 0,
          price: price || 0,
          revenue: 0,
          image
        };
      }

      grp.items[nameEn].quantity += qty;
      grp.items[nameEn].revenue += rev;
    };

    if (ledger.length > 0) {
      ledger.forEach(item => {
        processItem(item.nameEn, item.nameUr, item.quantity, item.price, item.timestamp, item.image);
      });
    } else {
      orders.forEach(order => {
        const isCompleted = order.status === 'completed' || order.status === 'served' || order.paymentStatus === 'paid';
        const isCancelled = order.status === 'cancelled';
        if (!isCompleted || isCancelled) return;

        order.items.forEach(item => {
          processItem(item.nameEn, item.nameUr || item.nameEn, item.quantity || 1, item.price || 0, order.timestamp, item.image);
        });
      });
    }

    return Object.values(groups).sort((a, b) => b.dateStr.localeCompare(a.dateStr));
  };

  const dailySalesGroups = getDailySalesGroups();

  // Helper: Match specific date from local timestamp string vs YYYY-MM-DD input
  const matchesDate = (timestamp: string, searchDate: string) => {
    if (!searchDate) return true;
    try {
      const d = new Date(timestamp);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}` === searchDate;
      }
    } catch (e) {}
    // Fallback comparison
    return timestamp.includes(searchDate);
  };

  // Compute Core Metrics
  const todayOrders = orders.filter(o => matchesDate(o.timestamp, todayString));
  
  const todaySales = todayOrders
    .filter(o => o.paymentStatus === 'paid' || o.status === 'completed')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'paid' || o.status === 'completed')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  // Calculate unique customer count based on customer names or orders
  const customerCount = new Set(
    orders
      .map(o => o.customerName?.trim() || o.orderNumber)
      .filter(Boolean)
  ).size;

  // Filtered list of orders
  const filteredOrders = orders.filter(order => {
    // 1. Text Query
    const query = searchTerm.toLowerCase();
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(query) ||
      (order.customerName && order.customerName.toLowerCase().includes(query)) ||
      (order.waiterName && order.waiterName.toLowerCase().includes(query));

    // 2. Date Filter
    const matchesDateSelected = matchesDate(order.timestamp, dateFilter);

    // 3. Table Filter
    const matchesTable = tableFilter === 'all' || order.tableNumber.toString() === tableFilter;

    // 4. Status Filter (Paid vs Pending vs Cancelled)
    let matchesStatus = true;
    if (statusFilter === 'paid') {
      matchesStatus = order.paymentStatus === 'paid' && order.status !== 'cancelled';
    } else if (statusFilter === 'pending') {
      matchesStatus = order.paymentStatus === 'pending' && order.status !== 'cancelled';
    } else if (statusFilter === 'cancelled') {
      matchesStatus = order.status === 'cancelled';
    }

    return matchesSearch && matchesDateSelected && matchesTable && matchesStatus;
  });

  // Action: Mark as Paid
  const handleMarkAsPaid = (order: Order) => {
    onUpdateOrderPayment(order.id, 'paid', 'cash');
    // Set order status to completed/served
    onUpdateOrderStatus(order.id, 'completed');
    // Liberate the table associated
    const table = tables.find(t => t.number === order.tableNumber);
    if (table) {
      onUpdateTableStatus(table.id, 'vacant');
    }
  };

  // Action: Mark as Pending
  const handleMarkAsPending = (order: Order) => {
    onUpdateOrderPayment(order.id, 'pending');
    onUpdateOrderStatus(order.id, 'preparing');
    const table = tables.find(t => t.number === order.tableNumber);
    if (table) {
      onUpdateTableStatus(table.id, 'preparing');
    }
  };

  // Action: Mark as Cancelled
  const handleMarkAsCancelled = (order: Order) => {
    onUpdateOrderStatus(order.id, 'cancelled');
    // De-allocate table
    const table = tables.find(t => t.number === order.tableNumber);
    if (table) {
      onUpdateTableStatus(table.id, 'vacant');
    }
  };

  // Action: Confirm and trigger Delete Order
  const handleDeleteTrigger = (orderId: string) => {
    onDeleteOrder(orderId);
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-6" id="rms-sales-dashboard">
      
      {/* 4 Bento Cards for Core Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Today's Orders */}
        <div className="bg-white dark:bg-stone-950 p-5 rounded-2xl border border-stone-200 dark:border-stone-850 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 block tracking-wider">
              {isUrdu ? "آج کے کل آرڈرز" : "Today's Orders"}
            </span>
            <span className="text-2xl font-black text-stone-900 dark:text-white font-mono block">
              {todayOrders.length}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>{isUrdu ? "تمام لائیو سرگرمیاں" : "Live activity sync"}</span>
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-500 dark:bg-amber-500/5">
            <ClipboardList className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2: Today's Sales */}
        <div className="bg-white dark:bg-stone-950 p-5 rounded-2xl border border-stone-200 dark:border-stone-850 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 block tracking-wider">
              {isUrdu ? "آج کی کل فروخت" : "Today's Sales"}
            </span>
            <span className="text-2xl font-black text-emerald-700 dark:text-amber-400 font-mono block">
              Rs.{todaySales.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 block">
              {isUrdu ? "آج موصول شدہ رقم" : "Received payments today"}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/5">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3: Total Revenue */}
        <div className="bg-white dark:bg-stone-950 p-5 rounded-2xl border border-stone-200 dark:border-stone-850 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 block tracking-wider">
              {isUrdu ? "کل مجموعی آمدن" : "Total Revenue"}
            </span>
            <span className="text-2xl font-black text-red-800 dark:text-rose-400 font-mono block">
              Rs.{totalRevenue.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 block">
              {isUrdu ? "مجموعی تاریخی آمدنی" : "All-time paid revenue"}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-red-800/10 text-red-800 dark:bg-red-800/5 dark:text-rose-400">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        {/* Card 4: Total Customers */}
        <div className="bg-white dark:bg-stone-950 p-5 rounded-2xl border border-stone-200 dark:border-stone-850 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 block tracking-wider">
              {isUrdu ? "صارفین کی کل تعداد" : "Number of Customers"}
            </span>
            <span className="text-2xl font-black text-stone-900 dark:text-white font-mono block">
              {customerCount}
            </span>
            <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 block">
              {isUrdu ? "منفرد مہمانوں کا ریکارڈ" : "Unique registered profiles"}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-500 dark:bg-blue-500/5">
            <Users className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* Product Sales Analytics Summary Section */}
      <div className="bg-white dark:bg-stone-950 p-6 rounded-2xl border border-stone-200 dark:border-stone-850 shadow-sm space-y-4" id="product-sales-analytics">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-100 dark:border-stone-900 pb-4">
          <div>
            <span className="text-[10px] uppercase font-black text-red-800 dark:text-amber-500 tracking-wider block">
              {isUrdu ? "پروڈکٹ سیلز اینالیٹکس" : "Product Sales Analytics"}
            </span>
            <h3 className="text-sm font-extrabold text-stone-900 dark:text-white">
              {analyticsTab === 'dates' 
                ? (isUrdu ? "تاریخ وار فروخت کا خلاصہ (تفصیلی)" : "Date-Wise Sales Breakdown (Chronological)")
                : (isUrdu ? "آئٹم کے لحاظ سے فروخت کا خلاصہ" : "Product-Wise Sales Performance Summary")
              }
            </h3>
            <p className="text-[11px] text-stone-400 dark:text-stone-500 font-bold">
              {analyticsTab === 'dates'
                ? (isUrdu ? "ہر دن کی فروخت اور اس کے آئٹمز کی تفصیلی تاریخ وار رپورٹ۔" : "Detailed daily chronological breakdown of dishes sold and daily revenue.")
                : (isUrdu ? "ہر مینیو آئٹم کی آج، اس ہفتے، اور اس مہینے کی فروخت کی تفصیلی رپورٹ۔" : "Detailed breakdown of sales volume (Today, This Week, This Month, All-Time) for every menu item.")
              }
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-stone-100 dark:bg-stone-900 p-1 rounded-xl self-stretch sm:self-auto">
            <button
              onClick={() => setAnalyticsTab('dates')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                analyticsTab === 'dates'
                  ? 'bg-red-800 text-white shadow-sm dark:bg-amber-500 dark:text-stone-950'
                  : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
              }`}
            >
              {isUrdu ? "تاریخ وار" : "By Date"}
            </button>
            <button
              onClick={() => setAnalyticsTab('items')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                analyticsTab === 'items'
                  ? 'bg-red-800 text-white shadow-sm dark:bg-amber-500 dark:text-stone-950'
                  : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
              }`}
            >
              {isUrdu ? "آئٹم وار" : "By Product"}
            </button>
          </div>
        </div>

        {analyticsTab === 'dates' ? (
          /* DATE-WISE TAB */
          <div className="space-y-6">
            {dailySalesGroups.length === 0 ? (
              <div className="py-12 text-center text-stone-400 font-bold text-xs bg-stone-50/50 dark:bg-stone-900/10 rounded-xl border border-dashed border-stone-200 dark:border-stone-800">
                {isUrdu ? "کوئی فروخت کا ریکارڈ موجود نہیں ہے۔" : "No sales records available yet."}
              </div>
            ) : (
              dailySalesGroups.map((group) => (
                <div key={group.dateStr} className="border border-stone-200 dark:border-stone-850 rounded-xl overflow-hidden bg-stone-50/30 dark:bg-stone-900/10 shadow-sm">
                  {/* Group Header */}
                  <div className="bg-stone-100/50 dark:bg-stone-900/60 px-4 py-3.5 border-b border-stone-200 dark:border-stone-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-red-800 dark:text-amber-500" />
                      <span className="font-extrabold text-stone-800 dark:text-stone-200 text-xs">
                        {group.formattedDate}
                      </span>
                    </div>
                    <div className="flex gap-4 text-[11px] font-mono font-bold">
                      <span className="text-stone-500 dark:text-stone-400">
                        {isUrdu ? "کل آئٹمز:" : "Items Sold:"} <strong className="text-stone-800 dark:text-white font-black">{group.totalQuantity}</strong>
                      </span>
                      <span className="text-stone-500 dark:text-stone-400">
                        {isUrdu ? "کل آمدن:" : "Revenue:"} <strong className="text-emerald-700 dark:text-amber-400 font-black">Rs.{group.totalRevenue.toLocaleString()}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Grouped Items List */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse" style={{ direction: isUrdu ? 'rtl' : 'ltr' }}>
                      <thead>
                        <tr className="bg-stone-50/20 dark:bg-stone-900/20 text-stone-400 text-[9px] font-black uppercase tracking-wider border-b border-stone-200 dark:border-stone-850">
                          <th className="px-4 py-2 w-12 text-center">{isUrdu ? "تصویر" : "Pic"}</th>
                          <th className="px-4 py-2">{isUrdu ? "آئٹم کا نام" : "Item Name"}</th>
                          <th className="px-4 py-2 text-center">{isUrdu ? "فروخت شدہ مقدار" : "Qty Sold"}</th>
                          <th className="px-4 py-2 text-right font-mono">{isUrdu ? "قیمت" : "Price"}</th>
                          <th className="px-4 py-2 text-right font-mono">{isUrdu ? "کل رقم" : "Subtotal"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 dark:divide-stone-900">
                        {Object.values(group.items).map((item, idx) => (
                          <tr key={idx} className="text-xs hover:bg-stone-50/50 dark:hover:bg-stone-900/5">
                            {/* Pic */}
                            <td className="px-4 py-2 text-center">
                              <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 flex items-center justify-center mx-auto overflow-hidden">
                                {item.image ? (
                                  <img src={item.image} alt={item.nameEn} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <HelpCircle className="h-4 w-4 text-stone-400" />
                                )}
                              </div>
                            </td>

                            {/* Name */}
                            <td className="px-4 py-2 font-bold">
                              <div className="flex flex-col">
                                <span className="text-stone-800 dark:text-stone-200 text-xs">{item.nameEn}</span>
                                <span className="text-[10px] text-stone-400 mt-0.5 leading-none font-urdu font-medium">{item.nameUr}</span>
                              </div>
                            </td>

                            {/* Qty */}
                            <td className="px-4 py-2 text-center font-bold">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-red-800/10 text-red-800 dark:bg-amber-500/10 dark:text-amber-400 font-black">
                                {item.quantity}
                              </span>
                            </td>

                            {/* Price */}
                            <td className="px-4 py-2 text-right font-mono text-stone-500 dark:text-stone-400">
                              Rs.{item.price.toLocaleString()}
                            </td>

                            {/* Subtotal */}
                            <td className="px-4 py-2 text-right font-mono font-bold text-stone-900 dark:text-stone-100">
                              Rs.{item.revenue.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* ITEM-WISE TAB */
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 justify-end">
              {/* Search items */}
              <input
                type="text"
                placeholder={isUrdu ? "آئٹم تلاش کریں..." : "Search items..."}
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 px-3 py-1.5 text-xs outline-none text-stone-700 dark:text-stone-300 font-bold w-full sm:w-40"
              />
              {/* Sort items */}
              <select
                value={productSort}
                onChange={(e) => setProductSort(e.target.value as any)}
                className="rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 px-3 py-1.5 text-xs outline-none text-stone-700 dark:text-stone-300 font-bold w-full sm:w-auto"
              >
                <option value="todayQty">{isUrdu ? "آج سب سے زیادہ فروخت" : "Most Sold Today"}</option>
                <option value="weekQty">{isUrdu ? "اس ہفتے سب سے زیادہ فروخت" : "Most Sold This Week"}</option>
                <option value="monthQty">{isUrdu ? "اس مہینے سب سے زیادہ فروخت" : "Most Sold This Month"}</option>
                <option value="totalQty">{isUrdu ? "کل فروخت (All-Time)" : "Most Sold All-Time"}</option>
                <option value="revenue">{isUrdu ? "سب سے زیادہ آمدنی" : "Highest Revenue"}</option>
              </select>
            </div>

            {/* Analytics Table */}
            <div className="overflow-x-auto border border-stone-100 dark:border-stone-900 rounded-xl">
              <table className="w-full text-left border-collapse" style={{ direction: isUrdu ? 'rtl' : 'ltr' }}>
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-850 bg-stone-50/50 dark:bg-stone-900/40 text-stone-500 text-[10px] font-black uppercase tracking-wider">
                    <th className="px-4 py-2.5 w-12 text-center">{isUrdu ? "تصویر" : "Pic"}</th>
                    <th className="px-4 py-2.5">{isUrdu ? "ڈش / پروڈکٹ کا نام" : "Menu Item Name"}</th>
                    <th className="px-4 py-2.5 text-center">{isUrdu ? "آج فروخت" : "Sold Today"}</th>
                    <th className="px-4 py-2.5 text-center">{isUrdu ? "اس ہفتے" : "This Week"}</th>
                    <th className="px-4 py-2.5 text-center">{isUrdu ? "اس مہینے" : "This Month"}</th>
                    <th className="px-4 py-2.5 text-center">{isUrdu ? "کل تعداد" : "Total Sold"}</th>
                    <th className="px-4 py-2.5 text-right font-mono">{isUrdu ? "کل آمدن" : "Total Revenue"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-900">
                  {sortedAnalyticItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-stone-400 font-bold text-xs">
                        {isUrdu ? "کوئی آئٹم نہیں ملا۔" : "No items found matching the search criteria."}
                      </td>
                    </tr>
                  ) : (
                    sortedAnalyticItems.map((item, index) => (
                      <tr key={index} className="hover:bg-stone-50/40 dark:hover:bg-stone-900/10 text-xs">
                        {/* Item Pic */}
                        <td className="px-4 py-3 text-center">
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-center mx-auto">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.nameEn}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <HelpCircle className="h-4 w-4 text-stone-400" />
                            )}
                          </div>
                        </td>

                        {/* Item Name */}
                        <td className="px-4 py-3 font-bold">
                          <div className="flex flex-col">
                            <span className="text-stone-900 dark:text-white text-[11px] leading-tight">
                              {item.nameEn}
                            </span>
                            <span className="text-[10px] text-stone-400 font-urdu mt-0.5 leading-none font-medium">
                              {item.nameUr}
                            </span>
                          </div>
                        </td>

                        {/* Today Qty */}
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            item.todayQty > 0
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-stone-50 dark:bg-stone-900 text-stone-400'
                          }`}>
                            {item.todayQty}
                          </span>
                        </td>

                        {/* Week Qty */}
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            item.weekQty > 0
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                              : 'bg-stone-50 dark:bg-stone-900 text-stone-400'
                          }`}>
                            {item.weekQty}
                          </span>
                        </td>

                        {/* Month Qty */}
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            item.monthQty > 0
                              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400'
                              : 'bg-stone-50 dark:bg-stone-900 text-stone-400'
                          }`}>
                            {item.monthQty}
                          </span>
                        </td>

                        {/* Total Qty */}
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            item.totalQty > 0
                              ? 'bg-red-800/10 text-red-800 dark:bg-red-800/20 dark:text-red-400'
                              : 'bg-stone-50 dark:bg-stone-900 text-stone-400'
                          }`}>
                            {item.totalQty}
                          </span>
                        </td>

                        {/* Revenue */}
                        <td className="px-4 py-3 text-right font-mono font-bold text-stone-900 dark:text-amber-400 font-bold">
                          Rs.{item.revenue.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Filter and Control Center */}
      <div className="bg-white dark:bg-stone-950 p-5 rounded-2xl border border-stone-200 dark:border-stone-850 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h3 className="text-sm font-black text-stone-900 dark:text-white">
              {isUrdu ? "فروخت اور آرڈرز کی مانیٹرنگ" : "Sales Ledger & Order Controls"}
            </h3>
            <p className="text-[11px] text-stone-400 dark:text-stone-500 font-bold">
              {isUrdu ? "آرڈرز تلاش کریں، ادائیگیوں کی صورتحال تبدیل کریں اور ریکارڈز کا انتظام کریں۔" : "Filter orders by custom dates, tables, and update payment states."}
            </p>
          </div>

          {/* Quick Clear Button if filters active */}
          {(searchTerm || dateFilter || tableFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setDateFilter('');
                setTableFilter('all');
                setStatusFilter('all');
              }}
              className="text-[10px] font-extrabold text-red-800 dark:text-amber-500 hover:underline cursor-pointer"
            >
              {isUrdu ? "تمام فلٹرز صاف کریں ✕" : "Clear All Filters ✕"}
            </button>
          )}
        </div>

        {/* Dynamic Inputs Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* 1. Date Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-stone-400 dark:text-stone-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{isUrdu ? "تاریخ کے ذریعے تلاش:" : "Search by Date:"}</span>
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 px-3.5 py-2 text-xs font-bold outline-none text-stone-700 dark:text-stone-300 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* 2. Table Selection Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-stone-400 dark:text-stone-500 flex items-center gap-1">
              <Filter className="h-3 w-3" />
              <span>{isUrdu ? "ٹیبل نمبر فلٹر:" : "Filter by Table:"}</span>
            </label>
            <select
              value={tableFilter}
              onChange={(e) => setTableFilter(e.target.value)}
              className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 px-3.5 py-2 text-xs font-extrabold outline-none text-stone-700 dark:text-stone-300 focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">{isUrdu ? "تمام ٹیبلز (All)" : "All Tables"}</option>
              {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                <option key={num} value={num.toString()}>
                  {isUrdu ? `ٹیبل نمبر ${num}` : `Table #${num}`}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Text Search */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-stone-400 dark:text-stone-500 flex items-center gap-1">
              <Search className="h-3 w-3" />
              <span>{isUrdu ? "آرڈر یا کسٹمر تلاش کریں:" : "Search query:"}</span>
            </label>
            <input
              type="text"
              placeholder={isUrdu ? "آرڈر نمبر، کسٹمر، ویٹر..." : "ID, Customer, Waiter..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 px-3.5 py-2 text-xs outline-none text-stone-700 dark:text-stone-300 focus:ring-1 focus:ring-amber-500 font-bold"
            />
          </div>

          {/* 4. Payment status Quick Filter Tabs */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-stone-400 dark:text-stone-500 block">
              {isUrdu ? "ادائیگی کی حالت فلٹر:" : "Payment Status Filter:"}
            </label>
            <div className="grid grid-cols-4 gap-1 bg-stone-50 dark:bg-stone-900 p-1 rounded-xl border border-stone-200/60 dark:border-stone-800">
              {(['all', 'paid', 'pending', 'cancelled'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`py-1 text-[9px] font-black uppercase rounded-lg transition-all cursor-pointer ${
                    statusFilter === status
                      ? 'bg-red-800 text-white dark:bg-amber-500 dark:text-stone-950 font-extrabold shadow-sm'
                      : 'text-stone-500 hover:text-stone-850 dark:hover:text-stone-200'
                  }`}
                >
                  {isUrdu 
                    ? (status === 'all' ? "سب" : status === 'paid' ? "ادا" : status === 'pending' ? "باقی" : "منسوخ")
                    : status
                  }
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Orders Data Ledger */}
      <div className="bg-white dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-850 overflow-hidden shadow-sm">
        
        {/* Table View (Desktop) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ direction: isUrdu ? 'rtl' : 'ltr' }}>
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-850 bg-stone-50 dark:bg-stone-900/40 text-stone-500 text-[10px] font-black uppercase tracking-wider">
                <th className="px-5 py-3 text-center w-24">{isUrdu ? "آرڈر نمبر" : "Order ID"}</th>
                <th className="px-5 py-3">{isUrdu ? "تاریخ اور وقت" : "Date & Time"}</th>
                <th className="px-5 py-3">{isUrdu ? "ٹیبل اور تفصیل" : "Table & Client"}</th>
                <th className="px-5 py-3">{isUrdu ? "آئٹمز اور مقدار" : "Items Ordered"}</th>
                <th className="px-5 py-3 font-mono text-right">{isUrdu ? "میزان بل" : "Grand Total"}</th>
                <th className="px-5 py-3 text-center">{isUrdu ? "صورتحال" : "Status"}</th>
                <th className="px-5 py-3 text-center">{isUrdu ? "ادائیگی" : "Payment"}</th>
                <th className="px-5 py-3 text-center w-48">{isUrdu ? "عملیات" : "Operational Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-900">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center text-stone-400 font-bold text-xs">
                    {isUrdu ? "کوئی مطابقت رکھنے والا آرڈر ریکارڈ نہیں ملا۔" : "No matching order records found for selected filters."}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/40 dark:hover:bg-stone-900/10 text-xs">
                    
                    {/* Order Number */}
                    <td className="px-5 py-4 font-mono font-extrabold text-stone-900 dark:text-white text-center">
                      {order.orderNumber}
                    </td>

                    {/* Date/Time */}
                    <td className="px-5 py-4 text-stone-500 dark:text-stone-400 font-bold whitespace-nowrap">
                      {order.timestamp}
                    </td>

                    {/* Table / Customer / Waiter */}
                    <td className="px-5 py-4 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-red-800/10 text-red-800 dark:bg-amber-500/10 dark:text-amber-400 font-black text-[10px]">
                          {isUrdu ? `ٹیبل ${order.tableNumber}` : `T#${order.tableNumber}`}
                        </span>
                        {order.customerName && (
                          <span className="font-extrabold text-stone-850 dark:text-stone-200">
                            {order.customerName}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400 block font-bold">
                        {isUrdu ? `ویٹر: ${order.waiterName || 'کاؤنٹر'}` : `Waiter: ${order.waiterName || 'Counter'}`}
                      </span>
                    </td>

                    {/* Items List */}
                    <td className="px-5 py-4">
                      <div className="max-w-xs space-y-1 font-bold text-[11px]">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-stone-700 dark:text-stone-300">
                            <span>{item.quantity} x {isUrdu ? item.nameUr : item.nameEn}</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Grand Total */}
                    <td className="px-5 py-4 font-mono text-right font-black text-red-850 dark:text-amber-400">
                      Rs.{order.grandTotal.toLocaleString()}
                    </td>

                    {/* Order Status badge */}
                    <td className="px-5 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                        order.status === 'completed' || order.status === 'served'
                          ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-500/20'
                          : order.status === 'cancelled'
                          ? 'bg-stone-500/10 text-stone-500 border-stone-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      }`}>
                        {isUrdu 
                          ? (order.status === 'new' ? "نیا آرڈر" : order.status === 'preparing' ? "تیار ہو رہا ہے" : order.status === 'ready' ? "تیار ہے" : order.status === 'served' ? "سرو ہو گیا" : order.status === 'completed' ? "مکمل" : "منسوخ")
                          : order.status
                        }
                      </span>
                    </td>

                    {/* Payment Status badge */}
                    <td className="px-5 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                        order.paymentStatus === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-red-800/10 text-red-800 dark:text-rose-400 border-red-800/20'
                      }`}>
                        {isUrdu 
                          ? (order.paymentStatus === 'paid' ? "ادا شدہ" : "غیر ادا شدہ")
                          : order.paymentStatus
                        }
                      </span>
                    </td>

                    {/* Actions Panel */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        {/* 1. Mark as Paid (Only if pending & not cancelled) */}
                        {order.paymentStatus === 'pending' && order.status !== 'cancelled' ? (
                          <button
                            onClick={() => handleMarkAsPaid(order)}
                            className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all cursor-pointer"
                            title={isUrdu ? "ادائیگی وصول کریں" : "Mark as Paid"}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        ) : order.paymentStatus === 'paid' && order.status !== 'cancelled' ? (
                          <button
                            onClick={() => handleMarkAsPending(order)}
                            className="p-1.5 rounded-lg bg-amber-500 text-stone-950 hover:bg-amber-600 transition-all cursor-pointer"
                            title={isUrdu ? "ادائیگی زیر التواء کریں" : "Revert to Pending"}
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        ) : null}

                        {/* 2. Cancel Button */}
                        {order.status !== 'cancelled' && order.status !== 'completed' && order.status !== 'served' && (
                          <button
                            onClick={() => handleMarkAsCancelled(order)}
                            className="p-1.5 rounded-lg border border-red-800/30 text-red-800 dark:text-rose-400 hover:bg-red-800/5 transition-all cursor-pointer"
                            title={isUrdu ? "آرڈر منسوخ کریں" : "Cancel Order"}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {/* 3. Print receipt */}
                        <button
                          onClick={() => printReceipt(order, '80mm', language)}
                          className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-200 dark:hover:bg-stone-800 transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm"
                          title={isUrdu ? "تھرمل رسید (80mm)" : "Thermal (80mm) Print"}
                          id={`print-thermal-sales-${order.id}`}
                        >
                          <Printer className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500" />
                        </button>

                        <button
                          onClick={() => printReceipt(order, 'a4', language)}
                          className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:text-red-800 dark:hover:text-red-400 hover:bg-stone-200 dark:hover:bg-stone-800 transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm"
                          title={isUrdu ? "اے فور پرنٹ (A4)" : "A4 Print"}
                          id={`print-a4-sales-${order.id}`}
                        >
                          <FileText className="h-3.5 w-3.5 text-red-800 dark:text-red-400" />
                        </button>

                        {/* 4. Delete button */}
                        {confirmDeleteId === order.id ? (
                          <div className="flex items-center gap-1 bg-red-100 dark:bg-red-950/40 p-1 rounded-lg border border-red-200 dark:border-red-900 animate-pulse">
                            <button
                              onClick={() => handleDeleteTrigger(order.id)}
                              className="px-1.5 py-0.5 rounded text-[9px] font-black bg-red-600 text-white hover:bg-red-700 transition-all cursor-pointer"
                            >
                              {isUrdu ? "ہاں" : "Yes"}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-1.5 py-0.5 rounded text-[9px] font-black bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 cursor-pointer"
                            >
                              {isUrdu ? "ناں" : "No"}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(order.id)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/10 transition-all cursor-pointer"
                            title={isUrdu ? "آرڈر حذف کریں" : "Delete Order Record"}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards view (for screens under 'md') */}
        <div className="block md:hidden divide-y divide-stone-100 dark:divide-stone-900" style={{ direction: isUrdu ? 'rtl' : 'ltr' }}>
          {filteredOrders.length === 0 ? (
            <div className="py-16 text-center text-stone-400 font-bold text-xs">
              {isUrdu ? "کوئی مطابقت رکھنے والا آرڈر ریکارڈ نہیں ملا۔" : "No matching orders found."}
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="p-4 space-y-3.5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-xs font-black text-stone-900 dark:text-white block">
                      {order.orderNumber}
                    </span>
                    <span className="text-[10px] text-stone-400 font-bold block">
                      {order.timestamp}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${
                      order.status === 'completed' || order.status === 'served'
                        ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-500/20'
                        : order.status === 'cancelled'
                        ? 'bg-stone-500/10 text-stone-500 border-stone-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    }`}>
                      {isUrdu 
                        ? (order.status === 'new' ? "نیا آرڈر" : order.status === 'preparing' ? "تیار ہو رہا ہے" : order.status === 'ready' ? "تیار ہے" : order.status === 'served' ? "سرو ہو گیا" : order.status === 'completed' ? "مکمل" : "منسوخ")
                        : order.status
                      }
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${
                      order.paymentStatus === 'paid'
                        ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-red-800/10 text-red-800 dark:text-rose-400 border-red-800/20'
                    }`}>
                      {isUrdu 
                        ? (order.paymentStatus === 'paid' ? "ادا شدہ" : "غیر ادا شدہ")
                        : order.paymentStatus
                      }
                    </span>
                  </div>
                </div>

                {/* Table & Client details */}
                <div className="flex justify-between items-center text-[10px] font-bold bg-stone-50 dark:bg-stone-900/50 p-2 rounded-lg border border-stone-150 dark:border-stone-850">
                  <span className="text-red-800 dark:text-amber-400">
                    {isUrdu ? `ٹیبل نمبر ${order.tableNumber}` : `Table #${order.tableNumber}`}
                  </span>
                  {order.customerName && (
                    <span className="text-stone-700 dark:text-stone-300">
                      {isUrdu ? `کسٹمر: ${order.customerName}` : `Guest: ${order.customerName}`}
                    </span>
                  )}
                  <span className="text-stone-400">
                    {isUrdu ? `ویٹر: ${order.waiterName || 'کاؤنٹر'}` : `Waiter: ${order.waiterName || 'Counter'}`}
                  </span>
                </div>

                {/* Items breakdown list */}
                <div className="space-y-1 pl-1.5 pr-1.5 border-l-2 border-dashed border-stone-200 dark:border-stone-800">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-[11px] font-bold text-stone-600 dark:text-stone-400">
                      <span>{item.quantity} x {isUrdu ? item.nameUr : item.nameEn}</span>
                      <span className="font-mono text-[10px] text-stone-400">Rs.{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Total and Actions buttons */}
                <div className="flex justify-between items-center pt-2 border-t border-stone-100 dark:border-stone-900">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-stone-400">{isUrdu ? "میزان بل:" : "Grand Total:"}</span>
                    <span className="text-xs font-black text-red-850 dark:text-amber-400 font-mono">Rs.{order.grandTotal.toLocaleString()}</span>
                  </div>

                  {/* Actions row */}
                  <div className="flex items-center gap-1.5">
                    
                    {/* Mark paid / unpaid */}
                    {order.paymentStatus === 'pending' && order.status !== 'cancelled' ? (
                      <button
                        onClick={() => handleMarkAsPaid(order)}
                        className="p-1.5 rounded-lg bg-emerald-500 text-white cursor-pointer hover:bg-emerald-600 transition-all"
                        title={isUrdu ? "ادائیگی وصول کریں" : "Mark as Paid"}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    ) : order.paymentStatus === 'paid' && order.status !== 'cancelled' ? (
                      <button
                        onClick={() => handleMarkAsPending(order)}
                        className="p-1.5 rounded-lg bg-amber-500 text-stone-950 cursor-pointer hover:bg-amber-600 transition-all"
                        title={isUrdu ? "ادائیگی زیر التواء کریں" : "Revert to Pending"}
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    ) : null}

                    {/* Cancel Order */}
                    {order.status !== 'cancelled' && order.status !== 'completed' && order.status !== 'served' && (
                      <button
                        onClick={() => handleMarkAsCancelled(order)}
                        className="p-1.5 rounded-lg border border-red-800/30 text-red-800 dark:text-rose-400 cursor-pointer hover:bg-red-800/5 transition-all"
                        title={isUrdu ? "منسوخ کریں" : "Cancel Order"}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {/* Print Receipt */}
                    <button
                      onClick={() => printReceipt(order, '80mm', language)}
                      className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 transition-all inline-flex items-center gap-1 shadow-sm"
                      title={isUrdu ? "تھرمل رسید (80mm)" : "Thermal Receipt (80mm)"}
                    >
                      <Printer className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500" />
                    </button>

                    <button
                      onClick={() => printReceipt(order, 'a4', language)}
                      className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 cursor-pointer hover:text-red-800 dark:hover:text-red-400 transition-all inline-flex items-center gap-1 shadow-sm"
                      title={isUrdu ? "اے فور رسید (A4)" : "A4 Receipt"}
                    >
                      <FileText className="h-3.5 w-3.5 text-red-800 dark:text-red-400" />
                    </button>

                    {/* Delete Confirm */}
                    {confirmDeleteId === order.id ? (
                      <div className="flex items-center gap-1 bg-red-100 dark:bg-red-950/40 p-1 rounded-lg border border-red-200 dark:border-red-900 animate-pulse">
                        <button
                          onClick={() => handleDeleteTrigger(order.id)}
                          className="px-1.5 py-0.5 rounded text-[9px] font-black bg-red-600 text-white hover:bg-red-700 transition-all cursor-pointer"
                        >
                          {isUrdu ? "ہاں" : "Yes"}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-1.5 py-0.5 rounded text-[9px] font-black bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 cursor-pointer"
                        >
                          {isUrdu ? "ناں" : "No"}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(order.id)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/10 cursor-pointer transition-all"
                        title={isUrdu ? "حذف کریں" : "Delete Order Record"}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}

                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
}
