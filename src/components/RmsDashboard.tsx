/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  LayoutDashboard, Utensils, ClipboardList, Receipt, Settings, 
  Trash2, Printer, FileText, Search, Calendar, Filter, X, TrendingUp, 
  DollarSign, Users, RefreshCw, Plus, Minus, ShoppingCart, User
} from 'lucide-react';
import { 
  Language, Dish, Order, Table as TableType, OrderStatus, 
  PaymentStatus, PaymentMethod, TableStatus, Category 
} from '../types';

import RmsMenuManager from './RmsMenuManager';
import RmsSettings from './RmsSettings';
import RmsSalesDashboard from './RmsSalesDashboard';
import { printReceipt } from '../utils/printReceipt';

interface RmsDashboardProps {
  language: Language;
  userRole?: string;
  dishes: Dish[];
  onAddDish: (dish: Dish) => void;
  onUpdateDish: (dish: Dish) => void;
  onDeleteDish: (dishId: string) => void;
  categories: Category[];
  onAddCategory: (category: Category) => void;
  onUpdateCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
  tables: TableType[];
  orders: Order[];
  onAddOrder: (order: Order) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onUpdateOrderPayment: (orderId: string, paymentStatus: PaymentStatus, method?: PaymentMethod, discountPercent?: number, taxPercent?: number) => void;
  onUpdateTableStatus: (tableId: string, status: TableStatus, currentOrderId?: string) => void;
  onResetDemoData: () => void;
  onDeleteOrder: (orderId: string) => void;
}

export default function RmsDashboard({
  language,
  userRole = 'admin',
  dishes,
  onAddDish,
  onUpdateDish,
  onDeleteDish,
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  tables,
  orders,
  onAddOrder,
  onUpdateOrderStatus,
  onUpdateOrderPayment,
  onUpdateTableStatus,
  onResetDemoData,
  onDeleteOrder
}: RmsDashboardProps) {
  const isUrdu = language === 'ur';

  // Manage active simplified tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Searching, Filtering & Confirmation States
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [tableFilter, setTableFilter] = useState('all');
  const [orderRecordTab, setOrderRecordTab] = useState<'active' | 'completed'>('active');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // New Order Creation States
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [newOrderTable, setNewOrderTable] = useState<number>(1);
  const [newOrderCustomer, setNewOrderCustomer] = useState('');
  const [newOrderWaiter, setNewOrderWaiter] = useState('');
  const [newOrderItems, setNewOrderItems] = useState<any[]>([]);
  const [newOrderDiscountPercent, setNewOrderDiscountPercent] = useState<number>(0);
  const [newOrderTaxPercent, setNewOrderTaxPercent] = useState<number>(5); // default 5% GST
  const [newOrderNotes, setNewOrderNotes] = useState('');
  const [newOrderPaymentMethod, setNewOrderPaymentMethod] = useState<PaymentMethod>('cash');
  const [newOrderPaymentStatus, setNewOrderPaymentStatus] = useState<PaymentStatus>('pending');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderSelectedCategory, setOrderSelectedCategory] = useState('all');
  const [selectedPosSizes, setSelectedPosSizes] = useState<Record<string, string>>({});

  // Cart Actions
  const handleAddToCart = (dish: Dish, selectedSizeName?: string) => {
    let finalDishId = dish.id;
    let nameEn = dish.nameEn;
    let nameUr = dish.nameUr;
    let price = dish.price;

    if (selectedSizeName && dish.sizes && dish.sizes.length > 0) {
      const selectedSize = dish.sizes.find(s => s.name === selectedSizeName);
      if (selectedSize) {
        finalDishId = `${dish.id}-${selectedSizeName}`;
        nameEn = `${dish.nameEn} (${selectedSizeName})`;
        const sizeUr = selectedSizeName === 'Small' ? 'چھوٹا' 
                     : selectedSizeName === 'Medium' ? 'درمیانہ' 
                     : selectedSizeName === 'Large' ? 'بڑا' 
                     : selectedSizeName === 'X-Large' ? 'فیملی' 
                     : selectedSizeName;
        nameUr = `${dish.nameUr} (${sizeUr})`;
        price = selectedSize.price;
      }
    }

    setNewOrderItems(prev => {
      const existing = prev.find(item => item.dishId === finalDishId);
      if (existing) {
        return prev.map(item => item.dishId === finalDishId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, {
        dishId: finalDishId,
        nameEn,
        nameUr,
        price,
        quantity: 1,
        notes: '',
        image: dish.image
      }];
    });
  };

  const handleUpdateCartQty = (dishId: string, delta: number) => {
    setNewOrderItems(prev => {
      return prev.map(item => {
        if (item.dishId === dishId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as any[];
    });
  };

  const handleRemoveFromCart = (dishId: string) => {
    setNewOrderItems(prev => prev.filter(item => item.dishId !== dishId));
  };

  // Save Order
  const handleSaveCreatedOrder = () => {
    if (newOrderItems.length === 0) {
      alert(isUrdu ? "برائے مہربانی کم از کم ایک آئٹم منتخب کریں۔" : "Please select at least one item to place order.");
      return;
    }

    const subtotal = newOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = Math.round(subtotal * (newOrderDiscountPercent / 105)); // Calculate correctly using standard percent division
    const calculatedDiscount = Math.round(subtotal * (newOrderDiscountPercent / 100));
    const calculatedTax = Math.round((subtotal - calculatedDiscount) * (newOrderTaxPercent / 100));
    const grandTotal = subtotal - calculatedDiscount + calculatedTax;

    const newOrderObj: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `ORD-${1000 + orders.length + 1}`,
      tableNumber: newOrderTable,
      waiterName: newOrderWaiter || (isUrdu ? "کاؤنٹر" : "Counter"),
      customerName: newOrderCustomer || undefined,
      items: newOrderItems,
      subtotal,
      discount: calculatedDiscount,
      discountPercent: newOrderDiscountPercent,
      tax: calculatedTax,
      taxPercent: newOrderTaxPercent,
      grandTotal,
      status: 'preparing',
      paymentStatus: newOrderPaymentStatus,
      paymentMethod: newOrderPaymentStatus === 'paid' ? newOrderPaymentMethod : undefined,
      timestamp: new Date().toLocaleString(),
      notes: newOrderNotes || undefined
    };

    onAddOrder(newOrderObj);

    // Update table status if table exists
    const targetTable = tables.find(t => t.number === newOrderTable);
    if (targetTable) {
      onUpdateTableStatus(targetTable.id, 'preparing', newOrderObj.id);
    }

    // Reset States
    setNewOrderTable(1);
    setNewOrderCustomer('');
    setNewOrderWaiter('');
    setNewOrderItems([]);
    setNewOrderDiscountPercent(0);
    setNewOrderTaxPercent(5);
    setNewOrderNotes('');
    setNewOrderPaymentStatus('pending');
    setNewOrderPaymentMethod('cash');
    setIsCreateOrderOpen(false);
  };

  // Helper: Get local current date in YYYY-MM-DD
  const getTodayDateString = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayString = getTodayDateString();

  // Helper: Match timestamp to search date
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

  const customerCount = new Set(
    orders
      .map(o => o.customerName?.trim() || o.orderNumber)
      .filter(Boolean)
  ).size;

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const query = searchTerm.toLowerCase();
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(query) ||
      (order.customerName && order.customerName.toLowerCase().includes(query));

    const matchesDateSelected = matchesDate(order.timestamp, dateFilter);
    const matchesTable = tableFilter === 'all' || order.tableNumber.toString() === tableFilter;

    // Separate active running orders from completed/cancelled/paid historical records
    const isActive = order.status !== 'completed' && order.status !== 'cancelled' && order.paymentStatus !== 'paid';
    const matchesTab = orderRecordTab === 'active' ? isActive : !isActive;

    return matchesSearch && matchesDateSelected && matchesTable && matchesTab;
  });

  // Dynamic calculation of POS cart totals for UI render
  const posCartSubtotal = newOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const posCartDiscount = Math.round(posCartSubtotal * (newOrderDiscountPercent / 100));
  const posCartTax = Math.round((posCartSubtotal - posCartDiscount) * (newOrderTaxPercent / 100));
  const posCartGrandTotal = posCartSubtotal - posCartDiscount + posCartTax;

  const tabItems = [
    { id: 'dashboard', labelEn: 'Dashboard', labelUr: 'ڈیش بورڈ', icon: LayoutDashboard },
    { id: 'menu', labelEn: 'Menu Management', labelUr: 'مینو مینیجر', icon: Utensils },
    { id: 'orders', labelEn: 'Orders', labelUr: 'آرڈرز', icon: ClipboardList },
    { id: 'receipts', labelEn: 'Receipts', labelUr: 'رسیدیں', icon: Receipt },
    { id: 'sales', labelEn: 'Product Sales', labelUr: 'الگ الگ فروخت', icon: TrendingUp },
    { id: 'settings', labelEn: 'Settings', labelUr: 'سیٹنگز پینل', icon: Settings },
  ];

  return (
    <div className="bg-stone-50 dark:bg-stone-900 min-h-screen py-6 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 font-sans">
        
        {/* Simplified Dashboard Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-tr from-red-800 to-amber-500 p-2.5 text-white shadow">
              <Utensils className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-red-800 dark:text-amber-500">
                {isUrdu ? "مینیجمنٹ سروسز" : "Digital Core Operations"}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white leading-tight font-serif">
                {isUrdu ? "عصمت ہوٹل اینڈ ریسٹورنٹ کنٹرول پینل" : "Asmat Restaurant Management System (RMS)"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateOrderOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-800 hover:bg-red-900 text-white px-3.5 py-1.5 text-xs font-black cursor-pointer transition-all active:scale-[0.98] shadow-sm hover:scale-[1.01]"
              id="btn-global-new-order"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{isUrdu ? "نیا آرڈر" : "New Order"}</span>
            </button>
            <button
              onClick={onResetDemoData}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-800/20 bg-red-800/10 hover:bg-red-800/20 px-3.5 py-1.5 text-xs font-bold text-red-800 dark:text-red-400 cursor-pointer transition-all active:scale-95"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>{isUrdu ? "سسٹم ری سیٹ کریں" : "Reset All System Data"}</span>
            </button>
          </div>
        </div>

        {/* Tab Selection Header bar */}
        <div className="mb-8 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex gap-2 min-w-max p-1 bg-white dark:bg-stone-950 rounded-2xl border border-stone-200/60 dark:border-stone-800/60 shadow-sm" style={{ direction: isUrdu ? 'rtl' : 'ltr' }}>
            {tabItems.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? 'bg-red-800 text-white dark:bg-amber-500 dark:text-stone-950 shadow-md scale-[1.02]' 
                      : 'text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900/50 hover:text-stone-800 dark:hover:text-white'
                  }`}
                  id={`rms-tab-${tab.id}`}
                >
                  <IconComponent className={`h-4 w-4 ${isActive ? 'scale-110' : 'text-stone-400 dark:text-stone-500'}`} />
                  <span>{isUrdu ? tab.labelUr : tab.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Panels */}
        <div className="space-y-6" style={{ direction: isUrdu ? 'rtl' : 'ltr' }}>
          
          {/* SECTION 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6" id="rms-section-dashboard">
              {/* Core metrics cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Metric 1: Today's Orders */}
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

                {/* Metric 2: Today's Sales */}
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

                {/* Metric 3: Total Revenue */}
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

                {/* Metric 4: Total Customers */}
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

              {/* Simple Clean Message */}
              <div className="bg-white dark:bg-stone-950 p-6 rounded-2xl border border-stone-200 dark:border-stone-850 shadow-sm">
                <h3 className="text-base font-black text-stone-900 dark:text-white mb-2">
                  {isUrdu ? "خوش آمدید!" : "Welcome back!"}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed max-w-3xl">
                  {isUrdu 
                    ? "یہ آپ کا آسان کردہ ریسٹورنٹ مینجمنٹ سسٹم ڈیش بورڈ ہے۔ آپ مینو کا انتظام کر سکتے ہیں، آرڈرز دیکھ سکتے ہیں، بل پرنٹ کر سکتے ہیں اور سسٹم سیٹنگز کو تبدیل کر سکتے ہیں۔" 
                    : "This is your simplified restaurant management system dashboard. From here, you can manage the menu, handle customer orders, instantly generate professional thermal receipts, and adjust business details."
                  }
                </p>
              </div>
            </div>
          )}

          {/* SECTION 2: MENU MANAGEMENT */}
          {activeTab === 'menu' && (
            <div id="rms-section-menu">
              <RmsMenuManager 
                language={language} 
                dishes={dishes} 
                onAddDish={onAddDish} 
                onUpdateDish={onUpdateDish} 
                onDeleteDish={onDeleteDish} 
                categories={categories}
                onAddCategory={onAddCategory}
                onUpdateCategory={onUpdateCategory}
                onDeleteCategory={onDeleteCategory}
              />
            </div>
          )}

          {/* SECTION 3: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6" id="rms-section-orders">
              
              {/* Search & Filter Controls */}
              <div className="bg-white dark:bg-stone-950 p-4 rounded-2xl border border-stone-200 dark:border-stone-850 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="w-full md:w-auto">
                  <h3 className="text-sm font-black text-stone-900 dark:text-white">
                    {isUrdu ? "آرڈرز کی مانیٹرنگ" : "Live Orders List"}
                  </h3>
                  <p className="text-[11px] text-stone-400 dark:text-stone-500 font-bold">
                    {isUrdu ? "آرڈرز کی تفصیلات اور صورتحال تبدیل کریں" : "Track active and past orders, modify statuses, or print receipts."}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  {/* Date Picker */}
                  <div className="relative">
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full sm:w-40 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 px-3 py-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 outline-none focus:ring-1 focus:ring-red-800"
                    />
                  </div>

                  {/* Table Selection */}
                  <select
                    value={tableFilter}
                    onChange={(e) => setTableFilter(e.target.value)}
                    className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 px-3 py-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 outline-none focus:ring-1 focus:ring-red-800 cursor-pointer"
                  >
                    <option value="all">{isUrdu ? "تمام ٹیبلز" : "All Tables"}</option>
                    {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num.toString()}>
                        {isUrdu ? `ٹیبل نمبر ${num}` : `Table #${num}`}
                      </option>
                    ))}
                  </select>

                  {/* Search Query */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={isUrdu ? "تلاش کریں..." : "Search by number/name..."}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full sm:w-48 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 px-3 py-1.5 text-xs text-stone-700 dark:text-stone-300 outline-none focus:ring-1 focus:ring-red-800 font-bold"
                    />
                  </div>

                  {/* Reset Filters */}
                  {(searchTerm || dateFilter || tableFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setDateFilter('');
                        setTableFilter('all');
                      }}
                      className="p-1.5 rounded-xl border border-red-800/20 bg-red-800/10 text-red-800 dark:text-amber-500 hover:bg-red-800/20 text-xs font-black cursor-pointer"
                    >
                      ✕
                    </button>
                  )}

                  {/* Create Order Button */}
                  <button
                    type="button"
                    onClick={() => setIsCreateOrderOpen(true)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-800 hover:bg-red-900 text-white font-black text-xs px-4 py-2 hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-md shadow-red-800/15"
                    id="btn-place-new-order"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{isUrdu ? "نیا آرڈر" : "New Order"}</span>
                  </button>
                </div>
              </div>

              {/* Grid or Table representing standard rows */}
              <div className="bg-white dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-850 overflow-hidden shadow-sm">
                
                {/* Segmented Sub-tabs for separating active and completed order records */}
                <div className="flex border-b border-stone-100 dark:border-stone-850 bg-stone-50/50 dark:bg-stone-900/10 p-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderRecordTab('active')}
                    className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer text-center ${
                      orderRecordTab === 'active'
                        ? 'bg-red-800 text-white shadow-sm shadow-red-800/10'
                        : 'text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    {isUrdu ? "جاری آرڈرز (Active Orders)" : "Active Orders"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderRecordTab('completed')}
                    className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer text-center ${
                      orderRecordTab === 'completed'
                        ? 'bg-red-800 text-white shadow-sm shadow-red-800/10'
                        : 'text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    {isUrdu ? "مکمل / ماضی کے آرڈرز (Completed / Past)" : "Completed / Past Orders"}
                  </button>
                </div>
                
                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-stone-200 dark:border-stone-850 bg-stone-50 dark:bg-stone-900/40 text-stone-500 text-[11px] font-black uppercase tracking-wider">
                        <th className="px-5 py-3.5 text-left">{isUrdu ? "آرڈر نمبر" : "Order Number"}</th>
                        <th className="px-5 py-3.5 text-left">{isUrdu ? "ٹیبل نمبر" : "Table Number"}</th>
                        <th className="px-5 py-3.5 text-left">{isUrdu ? "کسٹمر کا نام" : "Customer Name"}</th>
                        <th className="px-5 py-3.5 text-right">{isUrdu ? "میزان رقم" : "Total Amount"}</th>
                        <th className="px-5 py-3.5 text-center">{isUrdu ? "صورتحال" : "Status"}</th>
                        <th className="px-5 py-3.5 text-center w-36">{isUrdu ? "عملیات" : "Actions"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-900 text-xs">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-20 text-center text-stone-400 font-bold text-xs">
                            {isUrdu ? "کوئی مطابقت رکھنے والا آرڈر ریکارڈ نہیں ملا۔" : "No matching order records found."}
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-stone-50/40 dark:hover:bg-stone-900/10">
                            {/* Order Number */}
                            <td className="px-5 py-4 font-mono font-extrabold text-stone-900 dark:text-white">
                              {order.orderNumber}
                            </td>

                            {/* Table Number */}
                            <td className="px-5 py-4 font-bold text-stone-800 dark:text-stone-200">
                              {isUrdu ? `ٹیبل نمبر ${order.tableNumber}` : `Table #${order.tableNumber}`}
                            </td>

                            {/* Customer Name */}
                            <td className="px-5 py-4 font-bold text-stone-850 dark:text-stone-200">
                              {order.customerName || <span className="text-stone-300 dark:text-stone-700">—</span>}
                            </td>

                            {/* Total Amount */}
                            <td className="px-5 py-4 font-mono text-right font-black text-red-850 dark:text-amber-400 text-sm">
                              Rs.{order.grandTotal.toLocaleString()}
                            </td>

                            {/* Status Selector */}
                            <td className="px-5 py-4 text-center">
                              <select
                                value={order.paymentStatus === 'paid' ? 'paid' : order.status === 'cancelled' ? 'cancelled' : 'pending'}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === 'paid') {
                                    onUpdateOrderPayment(order.id, 'paid', 'cash');
                                    onUpdateOrderStatus(order.id, 'completed');
                                    const table = tables.find(t => t.number === order.tableNumber);
                                    if (table) onUpdateTableStatus(table.id, 'vacant');
                                  } else if (val === 'cancelled') {
                                    onUpdateOrderStatus(order.id, 'cancelled');
                                    const table = tables.find(t => t.number === order.tableNumber);
                                    if (table) onUpdateTableStatus(table.id, 'vacant');
                                  } else {
                                    onUpdateOrderPayment(order.id, 'pending');
                                    onUpdateOrderStatus(order.id, 'preparing');
                                    const table = tables.find(t => t.number === order.tableNumber);
                                    if (table) onUpdateTableStatus(table.id, 'preparing', order.id);
                                  }
                                }}
                                className="rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-2.5 py-1 text-xs font-semibold outline-none text-stone-700 dark:text-stone-300 focus:ring-1 focus:ring-red-800 cursor-pointer"
                              >
                                <option value="pending">{isUrdu ? "زیر التواء" : "Pending"}</option>
                                <option value="paid">{isUrdu ? "ادا شدہ" : "Paid"}</option>
                                <option value="cancelled">{isUrdu ? "منسوخ" : "Cancelled"}</option>
                              </select>
                            </td>

                            {/* Actions Column */}
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-center gap-2">
                                {/* Print Thermal Receipt */}
                                <button
                                  onClick={() => printReceipt(order, '80mm', language)}
                                  className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-200 dark:hover:bg-stone-800 transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm"
                                  title={isUrdu ? "تھرمل پرنٹ (80mm)" : "Thermal (80mm) Print"}
                                  id={`print-thermal-orders-${order.id}`}
                                >
                                  <Printer className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                                  <span className="text-[10px] hidden lg:inline">{isUrdu ? "تھرمل (80mm)" : "80mm Thermal"}</span>
                                </button>

                                {/* Print A4 Invoice */}
                                <button
                                  onClick={() => printReceipt(order, 'a4', language)}
                                  className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:text-red-800 dark:hover:text-red-400 hover:bg-stone-200 dark:hover:bg-stone-800 transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm"
                                  title={isUrdu ? "اے فور پرنٹ (A4)" : "A4 Print"}
                                  id={`print-a4-orders-${order.id}`}
                                >
                                  <FileText className="h-4 w-4 text-red-800 dark:text-red-400" />
                                  <span className="text-[10px] hidden lg:inline">{isUrdu ? "A4 پرنٹ" : "A4 Invoice"}</span>
                                </button>

                                {/* Delete order */}
                                {confirmDeleteId === order.id ? (
                                  <div className="flex items-center gap-1 bg-red-100 dark:bg-red-950/40 p-1 rounded-lg border border-red-200 dark:border-red-900">
                                    <button
                                      onClick={() => {
                                        onDeleteOrder(order.id);
                                        setConfirmDeleteId(null);
                                      }}
                                      className="px-1.5 py-0.5 rounded text-[10px] font-black bg-red-600 text-white hover:bg-red-700 transition-all cursor-pointer"
                                    >
                                      {isUrdu ? "ہاں" : "Yes"}
                                    </button>
                                    <button
                                      onClick={() => setConfirmDeleteId(null)}
                                      className="px-1.5 py-0.5 rounded text-[10px] font-black bg-stone-250 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 cursor-pointer"
                                    >
                                      {isUrdu ? "ناں" : "No"}
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setConfirmDeleteId(order.id)}
                                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/10 cursor-pointer transition-all"
                                    title={isUrdu ? "آرڈر حذف کریں" : "Delete Order"}
                                  >
                                    <Trash2 className="h-4 w-4" />
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

                {/* Mobile view */}
                <div className="block md:hidden divide-y divide-stone-100 dark:divide-stone-900">
                  {filteredOrders.length === 0 ? (
                    <div className="py-16 text-center text-stone-400 font-bold text-xs">
                      {isUrdu ? "کوئی مطابقت رکھنے والا آرڈر ریکارڈ نہیں ملا۔" : "No matching orders found."}
                    </div>
                  ) : (
                    filteredOrders.map((order) => (
                      <div key={order.id} className="p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-xs font-black text-stone-900 dark:text-white">
                            {order.orderNumber}
                          </span>
                          <span className="text-red-850 dark:text-amber-400 font-mono font-black text-xs">
                            Rs.{order.grandTotal.toLocaleString()}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-stone-600 dark:text-stone-400">
                          <div>
                            {isUrdu ? "ٹیبل:" : "Table:"} <span className="text-stone-900 dark:text-white">{order.tableNumber}</span>
                          </div>
                          <div>
                            {isUrdu ? "گاہک:" : "Guest:"} <span className="text-stone-900 dark:text-white">{order.customerName || "—"}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-stone-100 dark:border-stone-900">
                          {/* Status */}
                          <select
                            value={order.paymentStatus === 'paid' ? 'paid' : order.status === 'cancelled' ? 'cancelled' : 'pending'}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === 'paid') {
                                onUpdateOrderPayment(order.id, 'paid', 'cash');
                                onUpdateOrderStatus(order.id, 'completed');
                                const table = tables.find(t => t.number === order.tableNumber);
                                if (table) onUpdateTableStatus(table.id, 'vacant');
                              } else if (val === 'cancelled') {
                                onUpdateOrderStatus(order.id, 'cancelled');
                                const table = tables.find(t => t.number === order.tableNumber);
                                if (table) onUpdateTableStatus(table.id, 'vacant');
                              } else {
                                onUpdateOrderPayment(order.id, 'pending');
                                onUpdateOrderStatus(order.id, 'preparing');
                                const table = tables.find(t => t.number === order.tableNumber);
                                if (table) onUpdateTableStatus(table.id, 'preparing', order.id);
                              }
                            }}
                            className="rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-2 py-0.5 text-[11px] font-semibold outline-none text-stone-700 dark:text-stone-300 cursor-pointer"
                          >
                            <option value="pending">{isUrdu ? "زیر التواء" : "Pending"}</option>
                            <option value="paid">{isUrdu ? "ادا شدہ" : "Paid"}</option>
                            <option value="cancelled">{isUrdu ? "منسوخ" : "Cancelled"}</option>
                          </select>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => printReceipt(order, '80mm', language)}
                              className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-900 text-amber-600 dark:text-amber-500 hover:text-amber-700 hover:bg-stone-200 transition-all cursor-pointer"
                              title={isUrdu ? "تھرمل پرنٹ (80mm)" : "Thermal (80mm) Print"}
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </button>

                            <button
                              onClick={() => printReceipt(order, 'a4', language)}
                              className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-900 text-red-800 dark:text-red-400 hover:text-red-900 hover:bg-stone-200 transition-all cursor-pointer"
                              title={isUrdu ? "اے فور پرنٹ (A4)" : "A4 Print"}
                            >
                              <FileText className="h-3.5 w-3.5" />
                            </button>

                            {confirmDeleteId === order.id ? (
                              <div className="flex items-center gap-1 bg-red-100 dark:bg-red-950/40 p-1 rounded-lg border border-red-200 dark:border-red-900">
                                <button
                                  onClick={() => {
                                    onDeleteOrder(order.id);
                                    setConfirmDeleteId(null);
                                  }}
                                  className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                                >
                                  {isUrdu ? "ہاں" : "Yes"}
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 cursor-pointer"
                                >
                                  {isUrdu ? "ناں" : "No"}
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteId(order.id)}
                                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/10 cursor-pointer transition-all"
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
          )}

          {/* SECTION 4: RECEIPTS */}
          {activeTab === 'receipts' && (
            <div className="space-y-6" id="rms-section-receipts">
              
              {/* Receipts filtering */}
              <div className="bg-white dark:bg-stone-950 p-4 rounded-2xl border border-stone-200 dark:border-stone-850 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-stone-900 dark:text-white">
                    {isUrdu ? "رسیدوں کا آرکائیو" : "Receipts History"}
                  </h3>
                  <p className="text-[11px] text-stone-400 dark:text-stone-500 font-bold">
                    {isUrdu ? "تمام جاری کی گئی رسیدیں تلاش کریں اور پرنٹ کریں" : "Search past transaction receipts and reprint on-demand."}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 px-3 py-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 outline-none"
                  />
                  <input
                    type="text"
                    placeholder={isUrdu ? "سرچ کریں..." : "Search..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 px-3 py-1.5 text-xs text-stone-700 dark:text-stone-300 outline-none font-bold"
                  />
                  {(searchTerm || dateFilter) && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setDateFilter('');
                      }}
                      className="p-1.5 rounded-xl border border-red-800/20 bg-red-800/10 text-red-800 hover:bg-red-800/20 text-xs font-black cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Receipts Log List */}
              <div className="bg-white dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-850 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-stone-200 dark:border-stone-850 bg-stone-50 dark:bg-stone-900/40 text-stone-500 text-[11px] font-black uppercase tracking-wider">
                        <th className="px-5 py-3.5 text-left">{isUrdu ? "رسید نمبر" : "Receipt ID"}</th>
                        <th className="px-5 py-3.5 text-left">{isUrdu ? "تاریخ" : "Date & Time"}</th>
                        <th className="px-5 py-3.5 text-left">{isUrdu ? "ٹیبل" : "Table"}</th>
                        <th className="px-5 py-3.5 text-left">{isUrdu ? "گاہک" : "Guest"}</th>
                        <th className="px-5 py-3.5 text-center">{isUrdu ? "ادائیگی" : "Payment"}</th>
                        <th className="px-5 py-3.5 text-right">{isUrdu ? "میزان کل" : "Grand Total"}</th>
                        <th className="px-5 py-3.5 text-center w-28">{isUrdu ? "رسید" : "Print"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-900 text-xs font-bold">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-16 text-center text-stone-400">
                            {isUrdu ? "کوئی رسید ریکارڈ دستیاب نہیں ہے۔" : "No receipt records found."}
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-stone-50/40 dark:hover:bg-stone-900/10">
                            <td className="px-5 py-3.5 font-mono text-stone-900 dark:text-white font-black">{order.orderNumber}</td>
                            <td className="px-5 py-3.5 text-stone-500">{order.timestamp}</td>
                            <td className="px-5 py-3.5 text-stone-800 dark:text-stone-200">Table #{order.tableNumber}</td>
                            <td className="px-5 py-3.5 text-stone-800 dark:text-stone-300">{order.customerName || "—"}</td>
                            <td className="px-5 py-3.5 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                order.paymentStatus === 'paid'
                                  ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-400'
                                  : 'bg-red-800/10 text-red-800 dark:text-rose-400'
                              }`}>
                                {isUrdu ? (order.paymentStatus === 'paid' ? "ادا شدہ" : "غیر ادا") : order.paymentStatus}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right font-mono text-red-850 dark:text-amber-400">
                              Rs.{order.grandTotal.toLocaleString()}
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {/* Print Thermal Receipt */}
                                <button
                                  onClick={() => printReceipt(order, '80mm', language)}
                                  className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-200 dark:hover:bg-stone-800 transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm"
                                  title={isUrdu ? "تھرمل پرنٹ (80mm)" : "Thermal (80mm) Print"}
                                  id={`print-thermal-receipts-${order.id}`}
                                >
                                  <Printer className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                                  <span className="text-[10px] hidden lg:inline">{isUrdu ? "تھرمل" : "Thermal"}</span>
                                </button>

                                {/* Print A4 Invoice */}
                                <button
                                  onClick={() => printReceipt(order, 'a4', language)}
                                  className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:text-red-800 dark:hover:text-red-400 hover:bg-stone-200 dark:hover:bg-stone-800 transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm"
                                  title={isUrdu ? "اے فور پرنٹ (A4)" : "A4 Print"}
                                  id={`print-a4-receipts-${order.id}`}
                                >
                                  <FileText className="h-4 w-4 text-red-800 dark:text-red-400" />
                                  <span className="text-[10px] hidden lg:inline">{isUrdu ? "A4 پرنٹ" : "A4 Invoice"}</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* SECTION 5: PRODUCT SALES */}
          {activeTab === 'sales' && (
            <div id="rms-section-sales">
              <RmsSalesDashboard
                language={language}
                orders={orders}
                tables={tables}
                onUpdateOrderStatus={onUpdateOrderStatus}
                onUpdateOrderPayment={onUpdateOrderPayment}
                onUpdateTableStatus={onUpdateTableStatus}
                onDeleteOrder={onDeleteOrder}
              />
            </div>
          )}

          {/* SECTION 6: SETTINGS */}
          {activeTab === 'settings' && (
            <div id="rms-section-settings">
              <RmsSettings language={language} />
            </div>
          )}

        </div>

      </div>

      {/* =======================================================
         POS ORDER TAKING SYSTEM (CREATION MODAL)
         ======================================================= */}
      {isCreateOrderOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto" id="pos-order-taking-modal">
          <div className="bg-white dark:bg-stone-950 w-full max-w-6xl rounded-3xl border border-stone-200 dark:border-stone-850 shadow-2xl overflow-hidden flex flex-col md:flex-row h-[95vh] md:h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            
            {/* Left Column: Menu Items Selection (60% width) */}
            <div className="w-full md:w-3/5 p-4 sm:p-6 flex flex-col h-1/2 md:h-full border-b md:border-b-0 md:border-r border-stone-100 dark:border-stone-850">
              {/* Header */}
              <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-white flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-red-800" />
                    <span>{isUrdu ? "نیا آرڈر درج کریں" : "Place New POS Order"}</span>
                  </h2>
                  <p className="text-[11px] text-stone-400 dark:text-stone-500 font-bold">
                    {isUrdu ? "مینو سے پکوان منتخب کر کے کارٹ میں شامل کریں" : "Select delicious food items from our active restaurant menu"}
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={() => setIsCreateOrderOpen(false)}
                  className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Filters & Search */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {/* Search Bar */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400 dark:text-stone-500 pointer-events-none">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={orderSearchTerm}
                    onChange={(e) => setOrderSearchTerm(e.target.value)}
                    placeholder={isUrdu ? "ڈش تلاش کریں..." : "Search menu dishes..."}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs text-stone-700 dark:text-stone-200 outline-none focus:ring-1 focus:ring-red-800 font-bold"
                  />
                </div>

                {/* Category Dropdown/Tabs */}
                <select
                  value={orderSelectedCategory}
                  onChange={(e) => setOrderSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs text-stone-700 dark:text-stone-200 font-bold outline-none cursor-pointer focus:ring-1 focus:ring-red-800"
                >
                  <option value="all">{isUrdu ? "تمام کیٹیگریز" : "All Categories"}</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{isUrdu ? cat.nameUr : cat.nameEn}</option>
                  ))}
                </select>
              </div>

              {/* Scrollable Dishes Grid */}
              <div className="overflow-y-auto flex-grow pr-1 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {dishes
                    .filter(dish => {
                      const matchesSearch = 
                        dish.nameEn.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
                        dish.nameUr.includes(orderSearchTerm);
                      const matchesCategory = orderSelectedCategory === 'all' || dish.category === orderSelectedCategory;
                      return matchesSearch && matchesCategory;
                    })
                    .map(dish => {
                      const hasSizes = dish.sizes && dish.sizes.length > 0;
                      const selectedSize = hasSizes ? (selectedPosSizes[dish.id] || dish.sizes![0].name) : undefined;
                      const activePrice = hasSizes 
                        ? (dish.sizes!.find(s => s.name === selectedSize)?.price || dish.price)
                        : dish.price;
                      
                      const cartItemsOfDish = newOrderItems.filter(item => item.dishId === dish.id || item.dishId.startsWith(`${dish.id}-`));
                      const quantityInCart = cartItemsOfDish.reduce((sum, item) => sum + item.quantity, 0);
                      
                      return (
                        <div
                          key={dish.id}
                          onClick={() => handleAddToCart(dish, selectedSize)}
                          className={`relative overflow-hidden rounded-2xl border transition-all duration-200 select-none cursor-pointer flex flex-col justify-between min-h-[175px] h-auto ${
                            quantityInCart > 0 
                              ? 'bg-red-800/5 dark:bg-red-800/5 border-red-800 ring-1 ring-red-800' 
                              : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-red-800/50 hover:bg-stone-50 dark:hover:bg-stone-900/60 shadow-sm'
                          }`}
                        >
                          {quantityInCart > 0 && (
                            <span className="absolute top-2 right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-800 text-[10px] font-black text-white shadow-md animate-bounce">
                              {quantityInCart}
                            </span>
                          )}

                          {dish.image && (
                            <div className="h-24 w-full overflow-hidden bg-stone-100 dark:bg-stone-950 relative border-b border-stone-150 dark:border-stone-800">
                              <img
                                src={dish.image}
                                alt={isUrdu ? dish.nameUr : dish.nameEn}
                                referrerPolicy="no-referrer"
                                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                              />
                            </div>
                          )}

                          <div className="p-3.5 pb-2.5 flex-grow flex flex-col justify-between">
                            <div>
                              <span className="inline-block text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-850 text-stone-500 dark:text-stone-400 mb-1.5 tracking-wider">
                                {dish.category}
                              </span>
                              <h4 className="text-[12px] font-extrabold text-stone-900 dark:text-white line-clamp-1 leading-tight">
                                {dish.nameEn}
                              </h4>
                              <h5 className="text-[11px] text-stone-500 dark:text-stone-400 font-bold font-urdu mt-0.5 line-clamp-1">
                                {dish.nameUr}
                              </h5>

                              {hasSizes && (
                                <div className="flex gap-1 mt-1.5 flex-wrap">
                                  {dish.sizes!.map(sz => {
                                    const isSzSelected = selectedSize === sz.name;
                                    return (
                                      <button
                                        key={sz.name}
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedPosSizes(prev => ({ ...prev, [dish.id]: sz.name }));
                                        }}
                                        className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase border transition-all ${
                                          isSzSelected
                                            ? 'bg-red-800 text-white border-red-800'
                                            : 'bg-stone-50 dark:bg-stone-850 text-stone-500 border-stone-200 dark:border-stone-800 hover:border-stone-400'
                                        }`}
                                      >
                                        {sz.name}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between border-t border-stone-100 dark:border-stone-850 pt-2 mt-2">
                              <span className="text-xs font-black text-red-800 dark:text-red-400">
                                Rs.{activePrice.toLocaleString()}
                              </span>
                              <span className="text-[10px] font-black text-stone-400 group-hover:text-red-800">
                                {isUrdu ? "شامل کریں" : "+ Add"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Right Column: Checkout panel & cart summary (40% width) */}
            <div className="w-full md:w-2/5 bg-stone-50 dark:bg-stone-900/30 p-4 sm:p-6 flex flex-col h-1/2 md:h-full justify-between overflow-y-auto">
              
              <div className="flex flex-col flex-grow overflow-hidden">
                {/* Cart Header */}
                <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3 mb-4">
                  <h3 className="text-xs font-black text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <ShoppingCart className="h-4 w-4 text-red-800" />
                    <span>{isUrdu ? "منتخب کردہ پکوان" : "Selected Items"}</span>
                  </h3>
                  <span className="text-[10px] bg-red-800/10 text-red-800 font-extrabold px-2.5 py-1 rounded-full">
                    {newOrderItems.reduce((sum, i) => sum + i.quantity, 0)} {isUrdu ? "پکوان" : "items"}
                  </span>
                </div>

                {/* POS Details Forms */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <label className="block text-[10px] font-black text-stone-400 uppercase tracking-wider mb-1">
                      {isUrdu ? "ٹیبل نمبر" : "Seating Table"}
                    </label>
                    <select
                      value={newOrderTable}
                      onChange={(e) => setNewOrderTable(Number(e.target.value))}
                      className="w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl p-2 text-xs font-bold text-stone-800 dark:text-stone-200 outline-none cursor-pointer focus:ring-1 focus:ring-red-800"
                    >
                      {tables.map(t => (
                        <option key={t.id} value={t.number}>
                          {isUrdu ? `میز نمبر ${t.number}` : `Table #${t.number}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-stone-400 uppercase tracking-wider mb-1">
                      {isUrdu ? "ویٹر" : "Served By"}
                    </label>
                    <input
                      type="text"
                      value={newOrderWaiter}
                      onChange={(e) => setNewOrderWaiter(e.target.value)}
                      placeholder={isUrdu ? "ویٹر کا نام" : "Waiter Name"}
                      className="w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl p-2 text-xs text-stone-800 dark:text-stone-200 outline-none font-bold focus:ring-1 focus:ring-red-800"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-wider mb-1">
                    {isUrdu ? "کسٹمر کا نام" : "Guest / Customer Name"}
                  </label>
                  <input
                    type="text"
                    value={newOrderCustomer}
                    onChange={(e) => setNewOrderCustomer(e.target.value)}
                    placeholder={isUrdu ? "کسٹمر کا نام درج کریں (اختیاری)" : "Enter customer name (optional)"}
                    className="w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl p-2 text-xs text-stone-800 dark:text-stone-200 outline-none font-bold focus:ring-1 focus:ring-red-800"
                  />
                </div>

                {/* Selected Items Scrollable Container */}
                <div className="flex-grow overflow-y-auto mb-4 border border-stone-200 dark:border-stone-800 rounded-2xl bg-white dark:bg-stone-950 p-3 space-y-2.5">
                  {newOrderItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
                      <ShoppingCart className="h-8 w-8 mb-2 opacity-30 text-stone-400" />
                      <p className="text-[11px] font-bold">
                        {isUrdu ? "آرڈر کی ٹوکری خالی ہے۔" : "Order cart is empty."}
                      </p>
                      <p className="text-[9px] text-stone-400 mt-0.5">
                        {isUrdu ? "شامل کرنے کے لیے مینو آئٹمز پر کلک کریں" : "Click on dishes on the left to add."}
                      </p>
                    </div>
                  ) : (
                    newOrderItems.map(item => (
                      <div key={item.dishId} className="flex flex-col gap-1 pb-2 border-b border-stone-100 dark:border-stone-850 last:border-b-0 last:pb-0">
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex items-start gap-2 flex-1">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.nameEn}
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 object-cover rounded-lg border border-stone-100 dark:border-stone-850 flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-extrabold text-stone-800 dark:text-stone-200 truncate">
                                {item.nameEn}
                              </h4>
                              <h5 className="text-[10px] text-stone-500 font-urdu mt-0.5 leading-none truncate">
                                {item.nameUr}
                              </h5>
                            </div>
                          </div>
                          
                          <span className="text-xs font-black text-stone-800 dark:text-stone-100 whitespace-nowrap ml-2">
                            Rs.{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>

                        {/* Quantity adjust buttons, notes and delete */}
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <input
                            type="text"
                            placeholder={isUrdu ? "نوٹ لکھیں (جیسے کم مصالحہ)..." : "Special note (e.g., extra spicy)..."}
                            value={item.notes}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNewOrderItems(prev => prev.map(i => i.dishId === item.dishId ? { ...i, notes: val } : i));
                            }}
                            className="flex-1 bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-850 rounded-lg px-2 py-1 text-[9px] text-stone-600 dark:text-stone-300 outline-none"
                          />

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQty(item.dishId, -1)}
                              className="p-1 rounded-lg bg-stone-100 dark:bg-stone-850 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-xs font-black min-w-[12px] text-center text-stone-800 dark:text-stone-100">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQty(item.dishId, 1)}
                              className="p-1 rounded-lg bg-stone-100 dark:bg-stone-850 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => handleRemoveFromCart(item.dishId)}
                              className="p-1 rounded-lg text-red-800 hover:bg-red-800/10 transition-colors ml-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Summary and Confirmation Block */}
              <div className="border-t border-stone-200 dark:border-stone-800 pt-4 space-y-3 bg-stone-100/50 dark:bg-stone-950/20 p-4 rounded-2xl">
                
                {/* Discount and Tax configs */}
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <label className="block font-black text-stone-400 mb-0.5 uppercase tracking-wider">
                      {isUrdu ? "رعایت (%)" : "Discount (%)"}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newOrderDiscountPercent}
                      onChange={(e) => setNewOrderDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                      className="w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-1 px-2 text-xs font-bold text-stone-800 dark:text-stone-200"
                    />
                  </div>

                  <div>
                    <label className="block font-black text-stone-400 mb-0.5 uppercase tracking-wider">
                      {isUrdu ? "جی ایس ٹی ٹیکس (%)" : "GST Tax (%)"}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newOrderTaxPercent}
                      onChange={(e) => setNewOrderTaxPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                      className="w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-1 px-2 text-xs font-bold text-stone-800 dark:text-stone-200"
                    />
                  </div>
                </div>

                {/* Payment state selectors */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-black text-stone-400 mb-0.5 uppercase tracking-wider">
                      {isUrdu ? "ادائیگی کی صورتحال" : "Payment Status"}
                    </label>
                    <select
                      value={newOrderPaymentStatus}
                      onChange={(e) => setNewOrderPaymentStatus(e.target.value as PaymentStatus)}
                      className="w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-1.5 text-[11px] font-bold text-stone-800 dark:text-stone-200 cursor-pointer"
                    >
                      <option value="pending">{isUrdu ? "زیر التواء" : "Pending"}</option>
                      <option value="paid">{isUrdu ? "ادائیگی ہو گئی" : "Paid"}</option>
                    </select>
                  </div>

                  {newOrderPaymentStatus === 'paid' && (
                    <div>
                      <label className="block text-[10px] font-black text-stone-400 mb-0.5 uppercase tracking-wider">
                        {isUrdu ? "طریقہ کار" : "Payment Method"}
                      </label>
                      <select
                        value={newOrderPaymentMethod}
                        onChange={(e) => setNewOrderPaymentMethod(e.target.value as PaymentMethod)}
                        className="w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-1.5 text-[11px] font-bold text-stone-800 dark:text-stone-200 cursor-pointer"
                      >
                        <option value="cash">{isUrdu ? "کیش" : "Cash"}</option>
                        <option value="card">{isUrdu ? "کارڈ" : "Card"}</option>
                        <option value="easypaisa">EasyPaisa</option>
                        <option value="jazzcash">JazzCash</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Grand Total Row */}
                <div className="flex items-center justify-between border-t border-stone-200 dark:border-stone-800 pt-2.5 mt-2">
                  <div>
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider">
                      {isUrdu ? "میزان کل" : "Grand Total"}
                    </span>
                    <p className="text-[9px] text-stone-400 leading-none">
                      {isUrdu ? `سب ٹوٹل: Rs.${posCartSubtotal.toLocaleString()}` : `Subtotal: Rs.${posCartSubtotal.toLocaleString()}`}
                    </p>
                  </div>
                  <span className="text-lg sm:text-xl font-black text-red-800 dark:text-red-400">
                    Rs.{posCartGrandTotal.toLocaleString()}
                  </span>
                </div>

                {/* Dialog Confirm Controls */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsCreateOrderOpen(false)}
                    className="w-full rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-600 dark:text-stone-400 font-extrabold text-xs py-2.5 transition-colors cursor-pointer"
                  >
                    {isUrdu ? "منسوخ کریں" : "Cancel"}
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveCreatedOrder}
                    className="w-full rounded-xl bg-red-800 hover:bg-red-900 text-white font-extrabold text-xs py-2.5 transition-colors hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-md shadow-red-800/10"
                  >
                    {isUrdu ? "آرڈر بھیجیں" : "Confirm & Place"}
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
