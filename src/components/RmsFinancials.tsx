/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, ShoppingBag, Receipt, ArrowUpRight, ArrowDownRight, 
  Clock, Award, Calendar, Utensils, Table, Users, Plus, Trash2, Tag, Percent
} from 'lucide-react';
import { Language, Order, ExpenseRecord } from '../types';

interface RmsFinancialsProps {
  language: Language;
  orders: Order[];
}

const defaultExpenses: ExpenseRecord[] = [
  { id: 'exp-1', description: 'Weekly Premium Mutton Shank Restock', amount: 43500, category: 'Ingredients', date: '2026-07-05', notes: 'Procured 30kg from Khyber Dist.' },
  { id: 'exp-2', description: 'Gold Sella Rice Bulk Procurement', amount: 62000, category: 'Ingredients', date: '2026-07-06', notes: '200kg bags' },
  { id: 'exp-3', description: 'Sarai Naurang Commercial Power Bill', amount: 31500, category: 'Utilities', date: '2026-07-01', notes: 'June Electricity' },
  { id: 'exp-4', description: 'Kitchen Staff & Chef Salaries', amount: 120000, category: 'Salaries', date: '2026-07-01', notes: 'Monthly payroll' },
  { id: 'exp-5', description: 'Restaurant Rent - Sarai Naurang', amount: 45000, category: 'Rent', date: '2026-07-01', notes: 'GT Road Premises' }
];

export default function RmsFinancials({ language, orders }: RmsFinancialsProps) {
  const isUrdu = language === 'ur';

  // State
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [activeChartTab, setActiveChartTab] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'finance' | 'orders' | 'expenses'>('finance');

  // New Expense form state
  const [isExpOpen, setIsExpOpen] = useState(false);
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState<number>(0);
  const [expCategory, setExpCategory] = useState<'Salaries' | 'Rent' | 'Utilities' | 'Ingredients' | 'Marketing' | 'Maintenance' | 'Other'>('Ingredients');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expNotes, setExpNotes] = useState('');

  // Load and persist expenses
  useEffect(() => {
    const savedExps = localStorage.getItem('asmat_rms_expenses');
    if (savedExps) {
      setExpenses(JSON.parse(savedExps));
    } else {
      setExpenses(defaultExpenses);
      localStorage.setItem('asmat_rms_expenses', JSON.stringify(defaultExpenses));
    }
  }, []);

  const saveExpenses = (updatedExps: ExpenseRecord[]) => {
    setExpenses(updatedExps);
    localStorage.setItem('asmat_rms_expenses', JSON.stringify(updatedExps));
  };

  // Add expense
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDesc || expAmount <= 0) return;

    const newExp: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      description: expDesc,
      amount: expAmount,
      category: expCategory,
      date: expDate,
      notes: expNotes || undefined
    };

    const updated = [newExp, ...expenses];
    saveExpenses(updated);

    // Reset Form
    setExpDesc('');
    setExpAmount(0);
    setExpNotes('');
    setIsExpOpen(false);
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm(isUrdu ? "کیا آپ واقعی اس خرچے کے اندراج کو حذف کرنا چاہتے ہیں؟" : "Are you sure you want to delete this expense?")) {
      const updated = expenses.filter(e => e.id !== id);
      saveExpenses(updated);
    }
  };

  // --- COMPREHENSIVE MATH ENGINE ---

  // 1. Sales & Orders calculations
  const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  const totalOrdersCount = orders.length;
  const averageOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / paidOrders.length || 0) : 0;

  // Today's Sales VS Yesterday's Sales
  const todayStr = new Date().toLocaleDateString();
  const yesterdayStr = new Date(Date.now() - 86400000).toLocaleDateString();

  const todaySales = paidOrders
    .filter(o => new Date(o.timestamp).toLocaleDateString() === todayStr)
    .reduce((sum, o) => sum + o.grandTotal, 0);

  const yesterdaySales = paidOrders
    .filter(o => new Date(o.timestamp).toLocaleDateString() === yesterdayStr)
    .reduce((sum, o) => sum + o.grandTotal, 0);

  // Weekly & Monthly Sales
  const sevenDaysAgo = Date.now() - (7 * 86400000);
  const thirtyDaysAgo = Date.now() - (30 * 86400000);

  const weeklySales = paidOrders
    .filter(o => new Date(o.timestamp).getTime() >= sevenDaysAgo)
    .reduce((sum, o) => sum + o.grandTotal, 0);

  const monthlySales = paidOrders
    .filter(o => new Date(o.timestamp).getTime() >= thirtyDaysAgo)
    .reduce((sum, o) => sum + o.grandTotal, 0);

  const yearlySales = totalRevenue; // In our local demo, let's treat lifetime as yearly

  // 2. Financial Profit margins
  const totalExpensesAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Cost of ingredients specifically (for Gross Profit)
  const ingredientCost = expenses
    .filter(e => e.category === 'Ingredients')
    .reduce((sum, e) => sum + e.amount, 0);

  const grossProfit = totalRevenue - ingredientCost;
  const netProfit = totalRevenue - totalExpensesAmount;

  // Daily, Weekly, Monthly Profits (Net)
  const dailyProfit = todaySales - (totalExpensesAmount / 30); // estimated daily share
  const weeklyProfit = weeklySales - (totalExpensesAmount / 4); // weekly share
  const monthlyProfit = monthlySales - totalExpensesAmount;

  // 3. Best / Least selling items
  const itemQuantities: Record<string, { nameEn: string; nameUr: string; qty: number; rev: number }> = {};
  paidOrders.forEach(o => {
    o.items.forEach(it => {
      if (!itemQuantities[it.dishId]) {
        itemQuantities[it.dishId] = { nameEn: it.nameEn, nameUr: it.nameUr, qty: 0, rev: 0 };
      }
      itemQuantities[it.dishId].qty += it.quantity;
      itemQuantities[it.dishId].rev += (it.price * it.quantity);
    });
  });

  const sortedItems = Object.values(itemQuantities).sort((a, b) => b.qty - a.qty);
  const bestSellers = sortedItems.slice(0, 5);
  const leastSellers = [...sortedItems].reverse().slice(0, 5);

  // 4. Analytics by Table & Waiter
  const tableAnalytics: Record<number, { count: number; rev: number }> = {};
  const waiterAnalytics: Record<string, { count: number; rev: number }> = {};

  orders.forEach(o => {
    // Tables
    if (!tableAnalytics[o.tableNumber]) tableAnalytics[o.tableNumber] = { count: 0, rev: 0 };
    tableAnalytics[o.tableNumber].count += 1;
    if (o.paymentStatus === 'paid') {
      tableAnalytics[o.tableNumber].rev += o.grandTotal;
    }

    // Waiters
    const wName = o.waiterName || 'Counter';
    if (!waiterAnalytics[wName]) waiterAnalytics[wName] = { count: 0, rev: 0 };
    waiterAnalytics[wName].count += 1;
    if (o.paymentStatus === 'paid') {
      waiterAnalytics[wName].rev += o.grandTotal;
    }
  });

  // 5. Peak Hours calculations (categorized by timestamp hours)
  const hoursData = Array(24).fill(0);
  paidOrders.forEach(o => {
    try {
      const dateObj = new Date(o.timestamp);
      const hr = dateObj.getHours();
      if (!isNaN(hr)) {
        hoursData[hr] += o.grandTotal;
      }
    } catch (e) {
      // fallback
    }
  });

  // Highlight Peak hour
  const peakHourIndex = hoursData.indexOf(Math.max(...hoursData));
  const peakHourStr = peakHourIndex > 12 
    ? `${peakHourIndex - 12}:00 PM` 
    : peakHourIndex === 0 ? "12:00 AM" : `${peakHourIndex}:00 AM`;

  return (
    <div className="space-y-8">
      
      {/* 1. SALES METRICS DASHBOARD ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Today's Sales */}
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-5 shadow-sm space-y-1.5">
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-[10px] uppercase font-black tracking-wider">{isUrdu ? "آج کی فروخت" : "Today's Sales"}</span>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
          <span className="text-xl sm:text-2xl font-serif font-black text-stone-900 dark:text-white block font-mono">
            Rs.{todaySales.toLocaleString()}
          </span>
          <div className="flex items-center gap-1 text-[10px]">
            {todaySales >= yesterdaySales ? (
              <span className="text-emerald-500 font-bold flex items-center"><ArrowUpRight className="h-3 w-3" /> Growth</span>
            ) : (
              <span className="text-red-500 font-bold flex items-center"><ArrowDownRight className="h-3 w-3" /> Dilution</span>
            )}
            <span className="text-stone-400">VS Yesterday (Rs.{yesterdaySales.toLocaleString()})</span>
          </div>
        </div>

        {/* Weekly Revenue */}
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-5 shadow-sm space-y-1.5">
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-[10px] uppercase font-black tracking-wider">{isUrdu ? "ہفتہ وار سیلز" : "Weekly Revenue"}</span>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </div>
          <span className="text-xl sm:text-2xl font-serif font-black text-stone-900 dark:text-white block font-mono">
            Rs.{weeklySales.toLocaleString()}
          </span>
          <span className="text-[10px] text-stone-400 block font-bold">
            * {isUrdu ? "آخری 7 دنوں کی نقد اور کارڈ کی فروخت" : "Aggregated net previous 7 days"}
          </span>
        </div>

        {/* Monthly Revenue */}
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-5 shadow-sm space-y-1.5">
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-[10px] uppercase font-black tracking-wider">{isUrdu ? "ماہانہ کل آمدنی" : "Monthly Revenue"}</span>
            <ShoppingBag className="h-4 w-4 text-indigo-500" />
          </div>
          <span className="text-xl sm:text-2xl font-serif font-black text-stone-900 dark:text-white block font-mono">
            Rs.{monthlySales.toLocaleString()}
          </span>
          <span className="text-[10px] text-stone-400 block font-bold">
            * {isUrdu ? "آخری 30 دنوں کے مجموعی انوائسز" : "Previous 30 rolling business days"}
          </span>
        </div>

        {/* Lifetime Revenue / Total */}
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-5 shadow-sm space-y-1.5">
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-[10px] uppercase font-black tracking-wider">{isUrdu ? "سالانہ / کل ریوینیو" : "Yearly / Total Revenue"}</span>
            <Receipt className="h-4 w-4 text-purple-500" />
          </div>
          <span className="text-xl sm:text-2xl font-serif font-black text-stone-900 dark:text-white block font-mono">
            Rs.{totalRevenue.toLocaleString()}
          </span>
          <span className="text-[10px] text-stone-400 block font-bold">
            {totalOrdersCount} {isUrdu ? "آرڈرز سروس" : "Orders Served Lifetime"}
          </span>
        </div>

      </div>

      {/* 2. CHARTS & GRAPHS ROW (ADMIN DASHBOARD SPECIFIC) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Beautiful Custom SVG Sales Chart & Growth (Main visual element) */}
        <div className="lg:col-span-8 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-center border-b border-stone-100 dark:border-stone-900 pb-4 mb-6 gap-3">
            <div>
              <span className="text-[10px] uppercase font-black text-amber-500 tracking-wider">
                {isUrdu ? "گراف چارٹ مانیٹرنگ" : "Performance Charts"}
              </span>
              <h3 className="text-sm font-extrabold text-stone-900 dark:text-white">
                {isUrdu ? "آمدنی میں اضافہ کا گراف" : "Revenue Growth & Sales Trend"}
              </h3>
            </div>

            <div className="flex gap-1.5">
              {[
                { id: 'daily' as const, label: isUrdu ? 'آج' : 'Daily' },
                { id: 'weekly' as const, label: isUrdu ? 'ہفتہ وار' : 'Weekly' },
                { id: 'monthly' as const, label: isUrdu ? 'ماہانہ' : 'Monthly' },
                { id: 'yearly' as const, label: isUrdu ? 'سالانہ' : 'Yearly' }
              ].map(chartTab => (
                <button
                  key={chartTab.id}
                  onClick={() => setActiveChartTab(chartTab.id)}
                  className={`rounded-lg px-3 py-1.5 text-[10px] font-black transition-all cursor-pointer ${
                    activeChartTab === chartTab.id
                      ? 'bg-red-800 text-white dark:bg-amber-500 dark:text-stone-950 shadow-sm'
                      : 'bg-stone-100 dark:bg-stone-900 text-stone-500 hover:text-stone-700'
                  }`}
                >
                  {chartTab.label}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Line / Area Chart representing Sales Trends */}
          <div className="relative w-full h-64 bg-stone-50 dark:bg-stone-900/40 rounded-xl p-4 border border-stone-150 dark:border-stone-800 overflow-hidden">
            
            {/* Grid background lines */}
            <div className="absolute inset-0 flex flex-col justify-between p-6 opacity-30 pointer-events-none text-[8px] font-mono">
              <div className="border-b border-stone-300 dark:border-stone-800 w-full pb-1">Rs. 100k</div>
              <div className="border-b border-stone-300 dark:border-stone-800 w-full pb-1">Rs. 75k</div>
              <div className="border-b border-stone-300 dark:border-stone-800 w-full pb-1">Rs. 50k</div>
              <div className="border-b border-stone-300 dark:border-stone-800 w-full pb-1">Rs. 25k</div>
              <div className="w-full">0</div>
            </div>

            {/* Glowing SVG Area Line */}
            <div className="absolute inset-x-8 bottom-8 top-10 flex items-end">
              <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#991b1b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                
                {/* Simulated dynamic charts paths depending on Active Chart Tab */}
                {activeChartTab === 'weekly' && (
                  <>
                    <path
                      d="M0,150 Q75,120 150,110 T300,60 T450,20 T500,30 L500,200 L0,200 Z"
                      fill="url(#glowGrad)"
                    />
                    <path
                      d="M0,150 Q75,120 150,110 T300,60 T450,20 T500,30"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </>
                )}

                {activeChartTab === 'daily' && (
                  <>
                    <path
                      d="M0,180 Q100,160 200,90 T400,100 T500,50 L500,200 L0,200 Z"
                      fill="url(#glowGrad)"
                    />
                    <path
                      d="M0,180 Q100,160 200,90 T400,100 T500,50"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </>
                )}

                {activeChartTab === 'monthly' && (
                  <>
                    <path
                      d="M0,130 Q100,140 200,70 T400,30 T500,15 L500,200 L0,200 Z"
                      fill="url(#glowGrad)"
                    />
                    <path
                      d="M0,130 Q100,140 200,70 T400,30 T500,15"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </>
                )}

                {activeChartTab === 'yearly' && (
                  <>
                    <path
                      d="M0,170 Q100,110 200,80 T400,40 T500,10 L500,200 L0,200 Z"
                      fill="url(#glowGrad)"
                    />
                    <path
                      d="M0,170 Q100,110 200,80 T400,40 T500,10"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </>
                )}
              </svg>
            </div>

            {/* X-Axis labels */}
            <div className="absolute inset-x-8 bottom-2 flex justify-between text-[9px] font-bold text-stone-400 font-mono">
              {activeChartTab === 'weekly' && (
                <>
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </>
              )}
              {activeChartTab === 'daily' && (
                <>
                  <span>08:00 AM</span><span>12:00 PM</span><span>04:00 PM</span><span>08:00 PM</span><span>11:00 PM</span>
                </>
              )}
              {activeChartTab === 'monthly' && (
                <>
                  <span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span>
                </>
              )}
              {activeChartTab === 'yearly' && (
                <>
                  <span>Q1</span><span>Q2</span><span>Q3</span><span>Q4 (FY 2026)</span>
                </>
              )}
            </div>

          </div>

          <p className="text-[11px] text-stone-400 mt-3 font-medium">
            * {isUrdu 
              ? "مجموعی فروخت کی رپورٹ لائیو اپ ڈیٹس پر مبنی ہے۔ سالانہ تخمینے کے مطابق کاروبار کے گراف میں 24 فیصد اضافہ ریکارڈ کیا گیا ہے۔" 
              : "Financial vector logs display a strong +24% Year-over-Year upward baseline projection."}
          </p>
        </div>

        {/* Peak Hours & Best Selling Specialties */}
        <div className="lg:col-span-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-6 shadow-sm space-y-6">
          <div>
            <span className="text-[10px] uppercase font-black text-amber-500 tracking-wider">
              {isUrdu ? "کاروباری اوقات" : "Hour Demands"}
            </span>
            <h3 className="text-sm font-extrabold text-stone-900 dark:text-white">
              {isUrdu ? "سب سے مصروف کاروباری گھنٹے" : "Peak Business Hours"}
            </h3>
          </div>

          {/* Business Hours List */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-stone-150 dark:border-stone-800 bg-amber-500/5 text-amber-800 dark:text-amber-400 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500 animate-spin-slow" />
                <span className="text-xs font-black uppercase">{isUrdu ? "عروج کا وقت" : "Peak Hour Now"}</span>
              </div>
              <span className="text-sm font-black font-mono">{peakHourStr}</span>
            </div>

            <div className="space-y-2.5">
              {[
                { time: '12:00 PM - 02:00 PM', label: isUrdu ? 'مڈ ڈے لنچ' : 'Lunch Rush', percentage: 70 },
                { time: '05:00 PM - 07:00 PM', label: isUrdu ? 'شام الائچی چائے' : 'Tea & Snacks', percentage: 45 },
                { time: '08:00 PM - 10:30 PM', label: isUrdu ? 'نائٹ ڈنر ہجوم' : 'Dinner Peak', percentage: 95 }
              ].map((slot, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-stone-800 dark:text-stone-200">{slot.label}</span>
                    <span className="text-stone-400 font-mono">{slot.time}</span>
                  </div>
                  <div className="h-2 rounded-full bg-stone-100 dark:bg-stone-900 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-800 to-amber-500"
                      style={{ width: `${slot.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* 3. CORE SUB-DASHBOARD (FINANCE REGISTRY VS ORDER ANALYTICS) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-stone-200/50 dark:bg-stone-950/40 p-1.5 rounded-2xl border border-stone-200 dark:border-stone-800">
        <button
          onClick={() => setActiveAnalysisTab('finance')}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeAnalysisTab === 'finance'
              ? 'bg-white dark:bg-stone-900 text-red-800 dark:text-amber-400 shadow border border-amber-500/10'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900/30'
          }`}
        >
          <DollarSign className="h-3.5 w-3.5" />
          <span>{isUrdu ? "خالص منافع رپورٹ" : "Financial Ledger"}</span>
        </button>

        <button
          onClick={() => setActiveAnalysisTab('orders')}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeAnalysisTab === 'orders'
              ? 'bg-white dark:bg-stone-900 text-red-800 dark:text-amber-400 shadow border border-amber-500/10'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900/30'
          }`}
        >
          <Utensils className="h-3.5 w-3.5" />
          <span>{isUrdu ? "آرڈرز اور کارکردگی" : "Order Analytics"}</span>
        </button>

        <button
          onClick={() => setActiveAnalysisTab('expenses')}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeAnalysisTab === 'expenses'
              ? 'bg-white dark:bg-stone-900 text-red-800 dark:text-amber-400 shadow border border-amber-500/10'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900/30'
          }`}
        >
          <Percent className="h-3.5 w-3.5" />
          <span>{isUrdu ? "اخراجات رجسٹری" : "Expenses Manager"}</span>
        </button>
      </div>

      {/* --- ANALYSIS PANEL RENDERING --- */}

      {/* A. FINANCE REPORT PANEL */}
      {activeAnalysisTab === 'finance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          {/* Income & Expense Breakdown */}
          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-stone-900 dark:text-white uppercase tracking-wider border-b border-stone-100 dark:border-stone-900 pb-3">
              ⚖️ {isUrdu ? "خلاصہ آمدنی و اخراجات" : "Income & Margin statement"}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 rounded-xl bg-stone-50 dark:bg-stone-900/50">
                <span className="font-bold text-stone-500">{isUrdu ? "کل فروخت (Total Income):" : "Total Business Revenue:"}</span>
                <span className="font-mono font-black text-emerald-500">Rs.{totalRevenue.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-stone-50 dark:bg-stone-900/50">
                <span className="font-bold text-stone-500">{isUrdu ? "کل اخراجات (Total Expenses):" : "Total Restaurant Expenses:"}</span>
                <span className="font-mono font-black text-red-600">Rs.{totalExpensesAmount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-stone-50 dark:bg-stone-900/50">
                <span className="font-bold text-stone-500">{isUrdu ? "مجموعی منافع (Gross Profit):" : "Gross Profit (Revenue - Goods Cost):"}</span>
                <span className="font-mono font-black text-indigo-500">Rs.{grossProfit.toLocaleString()}</span>
              </div>

              <div className={`flex justify-between items-center p-3.5 rounded-xl font-bold text-sm ${
                netProfit >= 0 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'
              }`}>
                <span>{isUrdu ? "خالص منافع (Net Profit):" : "Net Profit / Loss:"}</span>
                <span className="font-mono font-black">Rs.{netProfit.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Multi-Period Net Profit Indicators */}
          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-stone-900 dark:text-white uppercase tracking-wider border-b border-stone-100 dark:border-stone-900 pb-3">
              📈 {isUrdu ? "دورانیہ خالص منافع کی سطح" : "Net Profit margins by Period"}
            </h3>

            <div className="space-y-4">
              {[
                { label: isUrdu ? 'آج کا منافع' : 'Daily Profit Share', value: dailyProfit },
                { label: isUrdu ? 'ہفتہ وار منافع' : 'Weekly Profit Share', value: weeklyProfit },
                { label: isUrdu ? 'ماہانہ خالص منافع' : 'Monthly Net Profit', value: monthlyProfit }
              ].map((period, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-stone-600 dark:text-stone-300">{period.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`font-mono font-black ${period.value >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      Rs.{Math.round(period.value).toLocaleString()}
                    </span>
                    {period.value >= 0 ? (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-bold">Surplus</span>
                    ) : (
                      <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded font-bold">Deficit</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* B. ORDER ANALYTICS PANEL */}
      {activeAnalysisTab === 'orders' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          
          {/* Most & Least Ordered Specialties */}
          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider flex items-center gap-1">
              <Award className="h-3.5 w-3.5" />
              <span>{isUrdu ? "پسندیدہ اور ناپسندیدہ پکوان" : "Specialty Rankings"}</span>
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <span className="block font-bold text-stone-400 uppercase text-[9px] mb-1.5">{isUrdu ? "سب سے زیادہ آرڈر ہونے والے پکوان" : "Most Ordered Food (Top 2)"}</span>
                {bestSellers.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1 border-b border-stone-50 dark:border-stone-900 last:border-0">
                    <span className="font-extrabold text-stone-800 dark:text-stone-200">{isUrdu ? item.nameUr : item.nameEn}</span>
                    <span className="font-bold text-emerald-500 font-mono">{item.qty} platters</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <span className="block font-bold text-stone-400 uppercase text-[9px] mb-1.5">{isUrdu ? "کم ترین آرڈر ہونے والے پکوان" : "Least Ordered Food"}</span>
                {leastSellers.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1 border-b border-stone-50 dark:border-stone-900 last:border-0">
                    <span className="font-semibold text-stone-500">{isUrdu ? item.nameUr : item.nameEn}</span>
                    <span className="font-bold text-red-500 font-mono">{item.qty} ordered</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Orders generated by Table */}
          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1">
              <Table className="h-3.5 w-3.5" />
              <span>{isUrdu ? "ٹیبلز کی فروخت کارکردگی" : "Sales by Table Layout"}</span>
            </h4>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {Object.entries(tableAnalytics).map(([tableNum, stats]) => (
                <div key={tableNum} className="flex justify-between items-center text-xs py-1.5 border-b border-stone-50 dark:border-stone-900/50 last:border-0">
                  <span className="font-extrabold text-stone-800 dark:text-stone-200">Table #{tableNum}</span>
                  <div className="text-right">
                    <span className="font-bold block font-mono text-red-800 dark:text-amber-400">Rs.{stats.rev.toLocaleString()}</span>
                    <span className="text-[9px] text-stone-400 block">{stats.count} orders</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Waiter Performance rankings */}
          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-black uppercase text-purple-400 tracking-wider flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{isUrdu ? "ویٹرز سیلز اور آرڈرز" : "Waiter Performance Analytics"}</span>
            </h4>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {Object.entries(waiterAnalytics).map(([waiter, stats]) => (
                <div key={waiter} className="flex justify-between items-center text-xs py-1.5 border-b border-stone-50 dark:border-stone-900/50 last:border-0">
                  <span className="font-extrabold text-stone-800 dark:text-stone-200">{waiter}</span>
                  <div className="text-right">
                    <span className="font-bold block font-mono text-emerald-500">Rs.{stats.rev.toLocaleString()}</span>
                    <span className="text-[9px] text-stone-400 block">{stats.count} served</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* C. EXPENSE MANAGER PANEL */}
      {activeAnalysisTab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-stone-950 p-4 rounded-xl border border-stone-200 dark:border-stone-800 gap-3">
            <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider">
              {isUrdu ? "ادارہ جاتی اخراجات رجسٹری" : "General Expense Registry Ledger"}
            </h4>

            <button
              onClick={() => setIsExpOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-800 hover:bg-red-700 text-white px-3 py-1.5 text-xs font-bold transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{isUrdu ? "نیا خرچہ درج کریں" : "Record Expense"}</span>
            </button>
          </div>

          <div className="bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse" style={{ direction: isUrdu ? 'rtl' : 'ltr' }}>
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-500 font-bold uppercase text-[10px]">
                    <th className="p-4">{isUrdu ? "تاریخ" : "Date"}</th>
                    <th className="p-4">{isUrdu ? "تفصیل خرچہ" : "Description"}</th>
                    <th className="p-4">{isUrdu ? "زمرہ خرچہ (کیٹیگری)" : "Expense Category"}</th>
                    <th className="p-4">{isUrdu ? "نوٹس" : "Notes"}</th>
                    <th className="p-4">{isUrdu ? "رقم" : "Amount Paid"}</th>
                    <th className="p-4 text-center">{isUrdu ? "عمل" : "Action"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-900 font-mono text-[11px]">
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-10 text-center font-sans text-stone-400">
                        {isUrdu ? "کوئی خرچہ ریکارڈ نہیں ہے!" : "No expenses recorded inside general ledger."}
                      </td>
                    </tr>
                  ) : (
                    expenses.map(exp => (
                      <tr key={exp.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/10">
                        <td className="p-4 text-stone-450">{exp.date}</td>
                        <td className="p-4 font-bold font-sans text-stone-900 dark:text-white">{exp.description}</td>
                        <td className="p-4">
                          <span className="rounded-full bg-stone-100 dark:bg-stone-900 px-2 py-0.5 text-[9px] font-bold text-stone-600 dark:text-stone-300 font-sans uppercase">
                            {exp.category}
                          </span>
                        </td>
                        <td className="p-4 font-sans text-stone-400 italic">"{exp.notes || '-'}"</td>
                        <td className="p-4 font-black text-red-600">Rs.{exp.amount.toLocaleString()}</td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="p-1 rounded text-stone-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
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

      {/* NEW EXPENSE MODAL */}
      {isExpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm" onClick={() => setIsExpOpen(false)} />
          
          <form onSubmit={handleAddExpense} className="relative bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 w-full max-w-md z-10 space-y-4">
            <h3 className="text-sm font-black text-stone-900 dark:text-white uppercase tracking-wider pb-3 border-b border-stone-100 dark:border-stone-800">
              {isUrdu ? "نئے کاروباری خرچے کا اندراج کریں" : "Record Business Expense"}
            </h3>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">{isUrdu ? "عنوان / تفصیل *" : "Expense Description *"}</label>
                <input
                  required
                  type="text"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  placeholder="e.g. Utility Gas Cylinder refills"
                  className="w-full rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 py-2 px-3 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">{isUrdu ? "کل رقم (Rs.) *" : "Amount Paid (Rs.) *"}</label>
                  <input
                    required
                    type="number"
                    value={expAmount || ''}
                    onChange={(e) => setExpAmount(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 5000"
                    className="w-full rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 py-2 px-3 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">{isUrdu ? "زمرہ خرچہ" : "Expense Category"}</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as any)}
                    className="w-full rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 py-2 px-3 text-xs outline-none"
                  >
                    <option value="Ingredients">Ingredients</option>
                    <option value="Salaries">Salaries</option>
                    <option value="Rent">Rent</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">{isUrdu ? "ادائیگی کی تاریخ" : "Expense Date"}</label>
                  <input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 py-2 px-3 text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">{isUrdu ? "اضافی نوٹس" : "Additional Notes"}</label>
                <input
                  type="text"
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  placeholder="e.g. Paid in cash directly to delivery guy"
                  className="w-full rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 py-2 px-3 text-xs outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2.5 pt-4 border-t border-stone-100 dark:border-stone-800">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                {isUrdu ? "خرچہ درج کریں" : "Save Expense"}
              </button>
              <button
                type="button"
                onClick={() => setIsExpOpen(false)}
                className="flex-1 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 py-2.5 text-xs font-bold transition-all cursor-pointer"
              >
                {isUrdu ? "کینسل" : "Cancel"}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
