/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Language, Order, Table, OrderStatus } from '../types';
import { Search, CheckCircle, XCircle, Clock, Play, UserCheck, Shield, ChevronRight, Printer, FileText } from 'lucide-react';
import { printReceipt } from '../utils/printReceipt';

interface RmsAdminOrdersProps {
  language: Language;
  orders: Order[];
  tables: Table[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onUpdateTableStatus: (tableId: string, status: any, currentOrderId?: string) => void;
}

export default function RmsAdminOrders({
  language,
  orders,
  tables,
  onUpdateOrderStatus,
  onUpdateTableStatus
}: RmsAdminOrdersProps) {
  const isUrdu = language === 'ur';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `table ${order.tableNumber}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.waiterName && order.waiterName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return 'bg-red-800/10 text-red-800 dark:text-red-400 border-red-800/30';
      case 'preparing':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'ready':
        return 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-500/30';
      case 'served':
        return 'bg-indigo-500/10 text-indigo-800 dark:text-indigo-400 border-indigo-500/30';
      case 'cancelled':
        return 'bg-stone-500/10 text-stone-500 border-stone-500/30';
      default:
        return 'bg-stone-500/10 text-stone-500 border-stone-500/30';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    if (isUrdu) {
      switch (status) {
        case 'new': return 'نیا آرڈر';
        case 'preparing': return 'تیار ہو رہا ہے';
        case 'ready': return 'تیار ہے';
        case 'served': return 'سرو ہو گیا';
        case 'cancelled': return 'منسوخ شدہ';
        default: return status;
      }
    } else {
      switch (status) {
        case 'new': return 'New Order';
        case 'preparing': return 'Preparing';
        case 'ready': return 'Ready';
        case 'served': return 'Served';
        case 'cancelled': return 'Cancelled';
        default: return status;
      }
    }
  };

  // Accept Order: Set status to preparing and update table status
  const handleAcceptOrder = (orderId: string, tableNumber: number) => {
    onUpdateOrderStatus(orderId, 'preparing');
    const table = tables.find(t => t.number === tableNumber);
    if (table) {
      onUpdateTableStatus(table.id, 'preparing');
    }
  };

  // Cancel Order: Set status to cancelled and update table status to vacant
  const handleCancelOrder = (orderId: string, tableNumber: number) => {
    onUpdateOrderStatus(orderId, 'cancelled');
    const table = tables.find(t => t.number === tableNumber);
    if (table) {
      onUpdateTableStatus(table.id, 'vacant');
    }
  };

  // General Update Status
  const handleUpdateStatus = (orderId: string, tableNumber: number, newStatus: OrderStatus) => {
    onUpdateOrderStatus(orderId, newStatus);
    const table = tables.find(t => t.number === tableNumber);
    if (table) {
      if (newStatus === 'cancelled') {
        onUpdateTableStatus(table.id, 'vacant');
      } else if (newStatus === 'served') {
        onUpdateTableStatus(table.id, 'served');
      } else {
        onUpdateTableStatus(table.id, newStatus);
      }
    }
  };

  return (
    <div className="space-y-6" id="rms-admin-orders-manager">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-stone-950 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 gap-4">
        <div className="w-full sm:w-auto">
          <span className="text-[10px] uppercase font-black text-red-800 dark:text-amber-500 tracking-wider">
            {isUrdu ? "آرڈر کنٹرول سینٹر" : "Order Control Center"}
          </span>
          <h3 className="text-sm font-extrabold text-stone-900 dark:text-white">
            {isUrdu ? "تمام لائیو آرڈرز کی نگرانی اور انتظام" : "Live Order Dispatch & Operations Board"}
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
          {/* Search bar */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute top-1/2 -translate-y-1/2 left-3 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder={isUrdu ? "آرڈر یا ٹیبل تلاش کریں..." : "Search orders or tables..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 py-1.5 pl-9 pr-4 text-xs outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 dark:text-white"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 px-3 py-1.5 text-xs outline-none text-stone-700 dark:text-stone-300 w-full sm:w-auto font-bold"
          >
            <option value="all">{isUrdu ? "تمام آرڈرز" : "All Orders"}</option>
            <option value="new">{isUrdu ? "نیا آرڈر" : "New"}</option>
            <option value="preparing">{isUrdu ? "تیاری جاری ہے" : "Preparing"}</option>
            <option value="ready">{isUrdu ? "تیار ہے" : "Ready"}</option>
            <option value="served">{isUrdu ? "سرو ہو چکا" : "Served"}</option>
            <option value="cancelled">{isUrdu ? "منسوخ شدہ" : "Cancelled"}</option>
          </select>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full py-20 text-center rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 text-stone-400 bg-white dark:bg-stone-950">
            <Clock className="h-12 w-12 mx-auto text-stone-300 mb-3" />
            <p className="text-sm font-bold">
              {isUrdu ? "کوئی مطابقت رکھنے والا آرڈر نہیں ملا۔" : "No matching orders found."}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className={`rounded-2xl border bg-white dark:bg-stone-950 p-5 shadow-md flex flex-col justify-between gap-4 transition-all hover:shadow-lg hover:border-amber-500/20`}
            >
              <div>
                {/* Meta details */}
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-900 pb-3 mb-3">
                  <div>
                    <span className="text-xs font-black text-stone-900 dark:text-white block font-mono">
                      {order.orderNumber}
                    </span>
                    <span className="text-[10px] text-stone-400 font-bold block">
                      {order.timestamp}
                    </span>
                  </div>
                  
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                {/* Table and Waiter metadata */}
                <div className="flex justify-between items-center bg-stone-50 dark:bg-stone-900/40 p-2 rounded-xl border border-stone-100 dark:border-stone-900 text-[10px] text-stone-600 dark:text-stone-400 font-bold mb-3.5">
                  <span>{isUrdu ? `ٹیبل نمبر ${order.tableNumber}` : `Table #${order.tableNumber}`}</span>
                  <span>{isUrdu ? `ویٹر: ${order.waiterName || 'کاؤنٹر'}` : `Waiter: ${order.waiterName || 'Counter'}`}</span>
                </div>

                {/* Items checklist */}
                <div className="space-y-2.5">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start text-xs border-b border-dashed border-stone-100 dark:border-stone-900 pb-1.5 last:border-0 last:pb-0 gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={isUrdu ? item.nameUr : item.nameEn}
                            referrerPolicy="no-referrer"
                            className="w-7 h-7 object-cover rounded border border-stone-100 dark:border-stone-800 flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="font-extrabold text-stone-900 dark:text-white leading-tight block">
                            {item.quantity} x {isUrdu ? item.nameUr : item.nameEn}
                          </span>
                          {item.notes && (
                            <span className="block text-[9px] text-red-800 dark:text-amber-400 italic mt-0.5 font-bold">
                              📝 {item.notes}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-stone-500 whitespace-nowrap ml-2">
                        Rs.{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Extra order-level notes */}
                {order.notes && (
                  <div className="bg-stone-50 dark:bg-stone-900/60 p-2.5 rounded-xl border border-stone-150 dark:border-stone-800 mt-4 text-[10px] text-stone-500">
                    <span className="font-bold block uppercase text-[8px] text-stone-400 mb-0.5">Special Directions:</span>
                    "{order.notes}"
                  </div>
                )}
              </div>

              {/* Order total & Control operations */}
              <div className="border-t border-stone-100 dark:border-stone-900 pt-4 mt-auto">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-stone-500">{isUrdu ? "کل میزان بل:" : "Grand Total:"}</span>
                  <span className="text-sm font-black text-red-850 dark:text-amber-400 font-mono">Rs.{order.grandTotal.toLocaleString()}</span>
                </div>

                {/* Print Receipt Section */}
                <div className="mb-3 pt-2 border-t border-dashed border-stone-100 dark:border-stone-900">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase text-stone-400">
                      {isUrdu ? "رسید پرنٹنگ:" : "Receipt Printing:"}
                    </span>
                    <div className="flex gap-1.5 flex-grow justify-end">
                      <button
                        type="button"
                        onClick={() => printReceipt(order, '80mm', language)}
                        className="rounded-lg bg-stone-100 dark:bg-stone-900 hover:bg-amber-500 hover:text-stone-950 dark:hover:bg-amber-500 dark:hover:text-stone-950 px-2.5 py-1.5 text-[10px] font-extrabold text-stone-700 dark:text-stone-300 transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm"
                        id={`print-receipt-thermal-${order.id}`}
                      >
                        <Printer className="h-3.5 w-3.5 text-amber-500" />
                        <span>{isUrdu ? "تھرمل (80mm)" : "80mm Thermal"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => printReceipt(order, 'a4', language)}
                        className="rounded-lg bg-stone-100 dark:bg-stone-900 hover:bg-amber-500 hover:text-stone-950 dark:hover:bg-amber-500 dark:hover:text-stone-950 px-2.5 py-1.5 text-[10px] font-extrabold text-stone-700 dark:text-stone-300 transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm"
                        id={`print-receipt-a4-${order.id}`}
                      >
                        <FileText className="h-3.5 w-3.5 text-red-800" />
                        <span>{isUrdu ? "A4 پیپر" : "A4 Invoice"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Core operational trigger buttons */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Accept Order button (only for New) */}
                    <button
                      type="button"
                      onClick={() => handleAcceptOrder(order.id, order.tableNumber)}
                      disabled={order.status !== 'new'}
                      className={`flex-1 rounded-xl py-2 text-xs font-black transition-all cursor-pointer text-center inline-flex items-center justify-center gap-1.5 ${
                        order.status === 'new'
                          ? 'bg-red-800 hover:bg-red-700 text-white shadow'
                          : 'bg-stone-100 dark:bg-stone-900 text-stone-400 cursor-not-allowed border border-stone-100 dark:border-stone-900'
                      }`}
                    >
                      <Play className="h-3 w-3" />
                      <span>{isUrdu ? "آرڈر منظور کریں" : "Accept Order"}</span>
                    </button>

                    {/* Cancel Order button (only for pending/active orders) */}
                    <button
                      type="button"
                      onClick={() => handleCancelOrder(order.id, order.tableNumber)}
                      disabled={order.status === 'served' || order.status === 'cancelled'}
                      className={`flex-1 rounded-xl py-2 text-xs font-black transition-all cursor-pointer text-center inline-flex items-center justify-center gap-1.5 ${
                        order.status !== 'served' && order.status !== 'cancelled'
                          ? 'border border-red-800/30 bg-red-800/5 text-red-800 dark:text-red-400 hover:bg-red-800/10'
                          : 'bg-stone-100 dark:bg-stone-900 text-stone-400 cursor-not-allowed border border-stone-100 dark:border-stone-900'
                      }`}
                    >
                      <XCircle className="h-3 w-3" />
                      <span>{isUrdu ? "منسوخ کریں" : "Cancel Order"}</span>
                    </button>
                  </div>

                  {/* Manual Status Overrides dropdown */}
                  <div className="flex items-center gap-2 border-t border-stone-100 dark:border-stone-900 pt-2.5 mt-1">
                    <label className="text-[10px] font-bold text-stone-400 whitespace-nowrap uppercase">
                      {isUrdu ? "اسٹیٹس تبدیل کریں:" : "Change Status:"}
                    </label>
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateStatus(order.id, order.tableNumber, e.target.value as OrderStatus)}
                      className="flex-grow rounded-lg border border-stone-200 dark:border-stone-850 bg-stone-50 dark:bg-stone-900 px-2.5 py-1 text-[11px] outline-none text-stone-700 dark:text-stone-300 font-bold"
                    >
                      <option value="new">{isUrdu ? "نیا آرڈر (New)" : "New"}</option>
                      <option value="preparing">{isUrdu ? "تیاری جاری ہے (Preparing)" : "Preparing"}</option>
                      <option value="ready">{isUrdu ? "تیار ہے (Ready)" : "Ready"}</option>
                      <option value="served">{isUrdu ? "سرو ہو چکا (Served)" : "Served"}</option>
                      <option value="cancelled">{isUrdu ? "منسوخ شدہ (Cancelled)" : "Cancelled"}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
