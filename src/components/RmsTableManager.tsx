/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Grid, Plus, Trash2, Users, CheckCircle, Flame, 
  Layers, Edit2, Save, X
} from 'lucide-react';
import { Language, Table, TableStatus } from '../types';

interface RmsTableManagerProps {
  language: Language;
  tables: Table[];
  onUpdateTableStatus: (tableId: string, status: TableStatus, currentOrderId?: string) => void;
}

export default function RmsTableManager({ language, tables, onUpdateTableStatus }: RmsTableManagerProps) {
  const isUrdu = language === 'ur';
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTableNum, setNewTableNum] = useState<number>(tables.length > 0 ? Math.max(...tables.map(t => t.number)) + 1 : 1);
  const [newCapacity, setNewCapacity] = useState<number>(4);
  const [localTables, setLocalTables] = useState<Table[]>(tables);

  // Editing Table States
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [editTableNum, setEditTableNum] = useState<number>(0);
  const [editCapacity, setEditCapacity] = useState<number>(4);
  const [editStatus, setEditStatus] = useState<TableStatus>('vacant');

  React.useEffect(() => {
    setLocalTables(tables);
  }, [tables]);

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case 'vacant':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'preparing':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'served':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'bill-requested':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 animate-pulse';
      default:
        return 'bg-stone-500/10 text-stone-600 dark:text-stone-400 border-stone-500/20';
    }
  };

  const getStatusLabel = (status: TableStatus) => {
    if (isUrdu) {
      switch (status) {
        case 'vacant': return 'خالی';
        case 'preparing': return 'کھانا تیار ہو رہا ہے';
        case 'served': return 'کھانا پیش کر دیا گیا ہے';
        case 'bill-requested': return 'بل طلب کیا گیا ہے';
        default: return 'نامعلوم';
      }
    } else {
      switch (status) {
        case 'vacant': return 'Vacant';
        case 'preparing': return 'Food Preparing';
        case 'served': return 'Food Served';
        case 'bill-requested': return 'Bill Requested';
        default: return 'Unknown';
      }
    }
  };

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    const isExists = localTables.some(t => t.number === newTableNum);
    if (isExists) {
      alert(isUrdu ? "یہ ٹیبل نمبر پہلے سے موجود ہے!" : "This table number already exists!");
      return;
    }

    const newTable: Table = {
      id: `t-${Date.now()}`,
      number: newTableNum,
      status: 'vacant',
      capacity: newCapacity,
    };

    const updated = [...localTables, newTable].sort((a, b) => a.number - b.number);
    setLocalTables(updated);
    localStorage.setItem('asmat_rms_tables', JSON.stringify(updated));
    setNewTableNum(updated.length > 0 ? Math.max(...updated.map(t => t.number)) + 1 : 1);
    setShowAddForm(false);
    
    // Dispatch custom event to sync global App state
    window.dispatchEvent(new Event('storage'));
  };

  const handleDeleteTable = (id: string) => {
    if (confirm(isUrdu ? "کیا آپ واقعی یہ ٹیبل ہٹانا چاہتے ہیں؟" : "Are you sure you want to remove this table?")) {
      const updated = localTables.filter(t => t.id !== id);
      setLocalTables(updated);
      localStorage.setItem('asmat_rms_tables', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleStartEdit = (table: Table) => {
    setEditingTableId(table.id);
    setEditTableNum(table.number);
    setEditCapacity(table.capacity);
    setEditStatus(table.status);
  };

  const handleSaveEdit = (id: string) => {
    // Check collision with other tables
    const isCollision = localTables.some(t => t.id !== id && t.number === editTableNum);
    if (isCollision) {
      alert(isUrdu ? "یہ ٹیبل نمبر پہلے سے کسی اور میز کے لیے مخصوص ہے!" : "This table number is already assigned to another table!");
      return;
    }

    const updated = localTables.map(t => {
      if (t.id === id) {
        return { ...t, number: editTableNum, capacity: editCapacity, status: editStatus };
      }
      return t;
    }).sort((a, b) => a.number - b.number);

    setLocalTables(updated);
    localStorage.setItem('asmat_rms_tables', JSON.stringify(updated));
    setEditingTableId(null);
    window.dispatchEvent(new Event('storage'));
  };

  const handleDirectStatusChange = (tableId: string, status: TableStatus) => {
    const updated = localTables.map(t => {
      if (t.id === tableId) {
        return { ...t, status };
      }
      return t;
    });
    setLocalTables(updated);
    localStorage.setItem('asmat_rms_tables', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  // Top statistics helpers
  const totalTablesCount = localTables.length;
  const vacantTablesCount = localTables.filter(t => t.status === 'vacant').length;
  const occupiedTablesCount = totalTablesCount - vacantTablesCount;

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-md" style={{ direction: isUrdu ? 'rtl' : 'ltr' }}>
      
      {/* Title Header with stats and actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 border-b border-stone-100 dark:border-stone-800 pb-5">
        <div>
          <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-amber-500" />
            <span>{isUrdu ? "ٹیبل مینیجمنٹ پینل" : "Table Seating & Status Management"}</span>
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {isUrdu 
              ? "ہال مینیجمنٹ، ٹیبل کی حالت، اور گنجائش مانیٹر کریں۔" 
              : "Manage dining tables, seating capacities, and monitor layout statuses manually."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 w-full lg:w-auto">
          {/* Add Table Toggle */}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex-grow sm:flex-grow-0 inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-800 hover:bg-red-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-stone-950 px-4 py-2.5 text-xs font-black transition-all cursor-pointer shadow-sm active:scale-95"
          >
            {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            <span>{isUrdu ? "نیا ٹیبل شامل کریں" : "Add New Table"}</span>
          </button>
        </div>
      </div>

      {/* TOP ANALYTICS HIGHLIGHTS ROW */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl bg-stone-50 dark:bg-stone-950/40 p-3 border border-stone-150 dark:border-stone-850 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 block">{isUrdu ? "کل میزیں" : "Total Tables"}</span>
            <span className="text-lg font-extrabold text-stone-900 dark:text-white font-mono">{totalTablesCount}</span>
          </div>
          <Layers className="h-6 w-6 text-stone-400 hidden sm:block" />
        </div>

        <div className="rounded-xl bg-emerald-500/5 p-3 border border-emerald-500/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-600 block">{isUrdu ? "خالی میزیں" : "Vacant"}</span>
            <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{vacantTablesCount}</span>
          </div>
          <CheckCircle className="h-6 w-6 text-emerald-500 hidden sm:block" />
        </div>

        <div className="rounded-xl bg-amber-500/5 p-3 border border-amber-500/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-500 block">{isUrdu ? "فعال سروس" : "Active Service"}</span>
            <span className="text-lg font-extrabold text-amber-500 dark:text-amber-400 font-mono">{occupiedTablesCount}</span>
          </div>
          <Flame className="h-6 w-6 text-amber-500 hidden sm:block animate-pulse" />
        </div>
      </div>

      {/* Add Table Modal/Form inline */}
      {showAddForm && (
        <form onSubmit={handleAddTable} className="bg-stone-50 dark:bg-stone-950 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end animate-fade-in">
          <div>
            <label className="block text-[10px] font-black uppercase text-stone-500 mb-1">
              {isUrdu ? "ٹیبل نمبر *" : "Table Number *"}
            </label>
            <input 
              type="number" 
              required
              min={1}
              value={newTableNum}
              onChange={e => setNewTableNum(parseInt(e.target.value) || 1)}
              className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-amber-500 text-stone-950 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-stone-500 mb-1">
              {isUrdu ? "بیٹھنے کی گنجائش (افراد) *" : "Seat Capacity (Guests) *"}
            </label>
            <input 
              type="number" 
              required
              min={1}
              value={newCapacity}
              onChange={e => setNewCapacity(parseInt(e.target.value) || 4)}
              className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-amber-500 text-stone-950 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-xs font-bold cursor-pointer text-center transition-all shadow active:scale-95"
            >
              {isUrdu ? "محفوظ کریں" : "Save Table"}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-4 py-2.5 rounded-lg text-xs font-bold cursor-pointer"
            >
              {isUrdu ? "کینسل" : "Cancel"}
            </button>
          </div>
        </form>
      )}

      {/* Grid of Interactive Tables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {localTables.map(table => {
          const isEditing = editingTableId === table.id;

          return (
            <div 
              key={table.id}
              className={`rounded-2xl border p-5 bg-stone-50/40 dark:bg-stone-950/20 relative flex flex-col justify-between transition-all hover:shadow-md ${
                table.status === 'bill-requested' 
                  ? 'border-red-500 shadow-lg shadow-red-500/5' 
                  : 'border-stone-200 dark:border-stone-800'
              }`}
            >
              {/* Corner Badge */}
              <span className="absolute top-4 right-4 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-black text-amber-500 border border-amber-500/25">
                #{table.number}
              </span>

              {/* Table Detail Header */}
              <div className="text-right border-b border-stone-100 dark:border-stone-800 pb-2 mb-3">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block text-left">
                  {isUrdu ? "میز معلومات" : "Table Details"}
                </span>
                
                {isEditing ? (
                  <div className="mt-2 space-y-2">
                    <div>
                      <span className="block text-[8px] uppercase text-stone-400 font-bold mb-0.5 text-left">No.</span>
                      <input 
                        type="number"
                        value={editTableNum}
                        onChange={(e) => setEditTableNum(parseInt(e.target.value) || 1)}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-1 text-[11px] font-bold focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <span className="block text-[8px] uppercase text-stone-400 font-bold mb-0.5 text-left">Seats</span>
                      <input 
                        type="number"
                        value={editCapacity}
                        onChange={(e) => setEditCapacity(parseInt(e.target.value) || 4)}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-1 text-[11px] font-bold focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <span className="block text-[8px] uppercase text-stone-400 font-bold mb-0.5 text-left">Status</span>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as TableStatus)}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-1 text-[11px] font-bold text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="vacant">{getStatusLabel('vacant')}</option>
                        <option value="preparing">{getStatusLabel('preparing')}</option>
                        <option value="served">{getStatusLabel('served')}</option>
                        <option value="bill-requested">{getStatusLabel('bill-requested')}</option>
                      </select>
                    </div>
                    <div className="flex gap-1.5 pt-1">
                      <button
                        onClick={() => handleSaveEdit(table.id)}
                        className="flex-grow bg-emerald-600 text-white text-[10px] py-1 rounded font-bold cursor-pointer inline-flex items-center justify-center gap-1"
                      >
                        <Save className="h-3 w-3" />
                        <span>{isUrdu ? "محفوظ" : "Save"}</span>
                      </button>
                      <button
                        onClick={() => setEditingTableId(null)}
                        className="bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-[10px] px-2 py-1 rounded font-bold cursor-pointer"
                      >
                        {isUrdu ? "خارج" : "Cancel"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <h4 className="text-xl font-black text-stone-900 dark:text-white leading-none mt-1 text-left">
                    {isUrdu ? `میز نمبر ${table.number}` : `Table No. ${table.number}`}
                  </h4>
                )}
              </div>

              {/* Seating Capacity & Status info */}
              {!isEditing && (
                <div className="space-y-3 py-3 flex-grow flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300 text-xs font-bold">
                    <Users className="h-4 w-4 text-amber-500" />
                    <span>{isUrdu ? `${table.capacity} سیٹیں` : `${table.capacity} Guests Capacity`}</span>
                  </div>

                  <div className="flex items-center justify-between gap-1 mt-1.5 pt-2 border-t border-stone-100 dark:border-stone-900">
                    <span className="text-[9px] font-bold text-stone-400 uppercase">{isUrdu ? "موجودہ حالت:" : "Service Status:"}</span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full border ${getStatusColor(table.status)}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      <span>{getStatusLabel(table.status)}</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Quick Status Select and Edit/Delete Actions */}
              {!isEditing && (
                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-900 space-y-2">
                  <div>
                    <label className="block text-[8px] font-bold uppercase text-stone-400 mb-1">
                      {isUrdu ? "ٹیبل اسٹیٹس تبدیل کریں:" : "Change Status:"}
                    </label>
                    <select
                      value={table.status}
                      onChange={(e) => handleDirectStatusChange(table.id, e.target.value as TableStatus)}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-1.5 text-[10px] font-bold text-stone-800 dark:text-amber-400 focus:ring-1 focus:ring-amber-500 outline-none"
                    >
                      <option value="vacant">{getStatusLabel('vacant')}</option>
                      <option value="preparing">{getStatusLabel('preparing')}</option>
                      <option value="served">{getStatusLabel('served')}</option>
                      <option value="bill-requested">{getStatusLabel('bill-requested')}</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    <button
                      onClick={() => handleStartEdit(table)}
                      className="rounded border border-stone-200 dark:border-stone-850 hover:bg-stone-100 dark:hover:bg-stone-900 px-3 py-1.5 text-[10px] font-bold cursor-pointer text-stone-500 flex items-center gap-1"
                      title={isUrdu ? "تبدیل کریں" : "Edit Seating"}
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>{isUrdu ? "ایڈٹ کریں" : "Edit"}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteTable(table.id)}
                      className="rounded border border-stone-200 dark:border-stone-850 hover:bg-red-500/10 px-3 py-1.5 text-[10px] font-bold cursor-pointer text-red-500 flex items-center gap-1"
                      title={isUrdu ? "حذف کریں" : "Delete table"}
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>{isUrdu ? "حذف" : "Delete"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hall Sections Overview (Visual Blueprint Only) */}
      <div className="mt-10 pt-6 border-t border-stone-100 dark:border-stone-800">
        <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider mb-4">
          {isUrdu ? "ریسٹورنٹ کے مخصوص سیکشنز (لائیو زونز)" : "Active Restaurant Zones"}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl p-4 bg-stone-50 dark:bg-stone-950/40 border border-stone-200/60 dark:border-stone-800/60">
            <h5 className="text-xs font-black text-stone-900 dark:text-white flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>{isUrdu ? "مین ڈائننگ ہال (سرائے نورنگ)" : "Main Dining Hall"}</span>
            </h5>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1">
              {isUrdu ? "عام فیملیوں اور مسافروں کے بیٹھنے کے لیے ۶ بڑی اور ۴ اوسط میزیں۔" : "Standard dining space targeting casual guests and long-route travelers."}
            </p>
          </div>

          <div className="rounded-xl p-4 bg-stone-50 dark:bg-stone-950/40 border border-stone-200/60 dark:border-stone-800/60">
            <h5 className="text-xs font-black text-stone-900 dark:text-white flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-purple-500" />
              <span>{isUrdu ? "وی آئی پی پردہ فیملی کیبنز" : "VIP Family Purdah Cabins"}</span>
            </h5>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1">
              {isUrdu ? "مکمل پردے اور روایتی تکیوں کے ساتھ آرام دہ اور علیحدہ خاندانی حجرے۔" : "Separate, high-privacy cabins designed for family groups with comfortable floor seating."}
            </p>
          </div>

          <div className="rounded-xl p-4 bg-stone-50 dark:bg-stone-950/40 border border-stone-200/60 dark:border-stone-800/60">
            <h5 className="text-xs font-black text-stone-900 dark:text-white flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-800" />
              <span>{isUrdu ? "آؤٹ ڈور کوئلہ کارنر (BBQ)" : "Outdoor Charcoal Grills Zone"}</span>
            </h5>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1">
              {isUrdu ? "کوئلوں پر دہکتے کبابوں اور تازہ کڑاہی کی لائیو کوکنگ کے مناظر۔" : "Fresh charcoal embers boti and slow wok karahis cooked in front of open viewers."}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
