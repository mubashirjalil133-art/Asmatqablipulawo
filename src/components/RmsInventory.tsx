/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Minus, AlertTriangle, ShieldAlert, History, Users, 
  Search, Trash2, Edit2, Calendar, Clipboard, Download, ShoppingBag, PlusCircle, MinusCircle, FileText
} from 'lucide-react';
import { Language, InventoryItem, Supplier, PurchaseRecord } from '../types';

interface RmsInventoryProps {
  language: Language;
}

// Initial seed data for a rich out-of-the-box demo experience
const defaultSuppliers: Supplier[] = [
  { id: 'sup-1', name: 'Khyber Premium Meat Dist.', contactPerson: 'Haji Gul Khan', phone: '0300-5921822', email: 'khybermeat@gmail.com', address: 'Main Bazar, Peshawar' },
  { id: 'sup-2', name: 'Sarhad Rice & Grains Mill', contactPerson: 'Muhammad Afridi', phone: '0312-8762110', email: 'sarhadgrain@yahoo.com', address: 'Industrial Zone, Bannu' },
  { id: 'sup-3', name: 'Peshawar Spice Palace', contactPerson: 'Saeed Jan', phone: '0345-9871122', email: 'spicepalace@outlook.com', address: 'Kissa Khwani Bazar, Peshawar' }
];

const defaultInventory: InventoryItem[] = [
  { id: 'inv-1', nameEn: 'Mutton Shank (Premium)', nameUr: 'مٹن شینک (ران اور دست)', sku: 'INV-MUT-01', stock: 12, minStock: 25, unit: 'kg', category: 'Meat', supplierId: 'sup-1', lastUpdated: '2026-07-07 10:00 AM' },
  { id: 'inv-2', nameEn: 'Sella Golden Rice (1121)', nameUr: 'سیلہ گولڈن چاول', sku: 'INV-RIC-01', stock: 320, minStock: 100, unit: 'kg', category: 'Grains', supplierId: 'sup-2', lastUpdated: '2026-07-06 04:30 PM' },
  { id: 'inv-3', nameEn: 'Pure Kashmiri Saffron (Zafran)', nameUr: 'خالص کشمیری زعفران', sku: 'INV-SAF-01', stock: 0.15, minStock: 0.5, unit: 'kg', category: 'Spices', supplierId: 'sup-3', lastUpdated: '2026-07-08 09:15 AM' },
  { id: 'inv-4', nameEn: 'Fresh Chicken Breast', nameUr: 'تازہ چکن چیسٹ', sku: 'INV-CHK-01', stock: 45, minStock: 30, unit: 'kg', category: 'Meat', supplierId: 'sup-1', lastUpdated: '2026-07-08 11:30 AM' },
  { id: 'inv-5', nameEn: 'Hardwood Charcoal (Coila)', nameUr: 'سخت لکڑی کا کوئلہ', sku: 'INV-COL-01', stock: 0, minStock: 10, unit: 'bags', category: 'Fuel', supplierId: 'sup-2', lastUpdated: '2026-07-05 02:15 PM' },
  { id: 'inv-6', nameEn: 'Premium Elaichi Cardamom', nameUr: 'سبز الائچی پریمیم', sku: 'INV-CRD-01', stock: 3.5, minStock: 2.0, unit: 'kg', category: 'Spices', supplierId: 'sup-3', lastUpdated: '2026-07-07 11:00 AM' },
  { id: 'inv-7', nameEn: 'Mozzarella Pizza Cheese', nameUr: 'موزاریلا پیزا چیز', sku: 'INV-CHS-01', stock: 4, minStock: 15, unit: 'kg', category: 'Dairy', supplierId: 'sup-1', lastUpdated: '2026-07-08 12:00 PM' }
];

const defaultPurchases: PurchaseRecord[] = [
  { id: 'pur-1', itemId: 'inv-1', itemName: 'Mutton Shank (Premium)', quantity: 30, unit: 'kg', costPrice: 1450, totalCost: 43500, type: 'stock-in', date: '2026-07-05 10:30 AM', supplierName: 'Khyber Premium Meat Dist.', notes: 'Weekly delivery for Pulao' },
  { id: 'pur-2', itemId: 'inv-2', itemName: 'Sella Golden Rice (1121)', quantity: 200, unit: 'kg', costPrice: 310, totalCost: 62000, type: 'stock-in', date: '2026-07-06 02:00 PM', supplierName: 'Sarhad Rice & Grains Mill', notes: 'Sourced high quality sella' },
  { id: 'pur-3', itemId: 'inv-5', itemName: 'Hardwood Charcoal (Coila)', quantity: 5, unit: 'bags', costPrice: 850, totalCost: 4250, type: 'stock-out', date: '2026-07-07 05:00 PM', supplierName: 'Sarhad Rice & Grains Mill', notes: 'Depleted for BBQ station' }
];

export default function RmsInventory({ language }: RmsInventoryProps) {
  const isUrdu = language === 'ur';

  // State Management with Persistence
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);

  // Sub Tab Navigation
  type SubTab = 'items' | 'stock-in-out' | 'suppliers' | 'history';
  const [subTab, setSubTab] = useState<SubTab>('items');

  // UI state for forms
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Modals / Dropdowns
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isStockAdjustOpen, setIsStockAdjustOpen] = useState(false);
  const [selectedAdjustItem, setSelectedAdjustItem] = useState<InventoryItem | null>(null);

  // New Item Form state
  const [newItemNameEn, setNewItemNameEn] = useState('');
  const [newItemNameUr, setNewItemNameUr] = useState('');
  const [newItemSku, setNewItemSku] = useState('');
  const [newItemStock, setNewItemStock] = useState<number>(0);
  const [newItemMinStock, setNewItemMinStock] = useState<number>(5);
  const [newItemUnit, setNewItemUnit] = useState('kg');
  const [newItemCategory, setNewItemCategory] = useState('Meat');
  const [newItemSupplier, setNewItemSupplier] = useState('');

  // New Supplier Form state
  const [newSupName, setNewSupName] = useState('');
  const [newSupContact, setNewSupContact] = useState('');
  const [newSupPhone, setNewSupPhone] = useState('');
  const [newSupEmail, setNewSupEmail] = useState('');
  const [newSupAddress, setNewSupAddress] = useState('');

  // Stock Adjust Form state
  const [adjustType, setAdjustType] = useState<'stock-in' | 'stock-out'>('stock-in');
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustPrice, setAdjustPrice] = useState<number>(0);
  const [adjustNotes, setAdjustNotes] = useState('');

  // --- EDIT STOCK STATE ---
  const [isEditItemOpen, setIsEditItemOpen] = useState(false);
  const [selectedEditItem, setSelectedEditItem] = useState<InventoryItem | null>(null);
  const [editItemNameEn, setEditItemNameEn] = useState('');
  const [editItemNameUr, setEditItemNameUr] = useState('');
  const [editItemSku, setEditItemSku] = useState('');
  const [editItemStock, setEditItemStock] = useState<number>(0);
  const [editItemMinStock, setEditItemMinStock] = useState<number>(5);
  const [editItemUnit, setEditItemUnit] = useState('kg');
  const [editItemCategory, setEditItemCategory] = useState('Meat');
  const [editItemSupplier, setEditItemSupplier] = useState('');

  // Load state on mount and keep synced
  const loadState = () => {
    const savedInv = localStorage.getItem('asmat_rms_inventory');
    const savedSups = localStorage.getItem('asmat_rms_suppliers');
    const savedPurchases = localStorage.getItem('asmat_rms_purchases');

    if (savedInv && savedSups && savedPurchases) {
      setItems(JSON.parse(savedInv));
      setSuppliers(JSON.parse(savedSups));
      setPurchases(JSON.parse(savedPurchases));
    } else {
      setItems(defaultInventory);
      setSuppliers(defaultSuppliers);
      setPurchases(defaultPurchases);

      localStorage.setItem('asmat_rms_inventory', JSON.stringify(defaultInventory));
      localStorage.setItem('asmat_rms_suppliers', JSON.stringify(defaultSuppliers));
      localStorage.setItem('asmat_rms_purchases', JSON.stringify(defaultPurchases));
    }
  };

  useEffect(() => {
    loadState();
    
    // Auto-sync across component actions
    window.addEventListener('storage', loadState);
    return () => {
      window.removeEventListener('storage', loadState);
    };
  }, []);

  // Save utility helper
  const saveState = (updatedInv: InventoryItem[], updatedSups: Supplier[], updatedPurchs: PurchaseRecord[]) => {
    setItems(updatedInv);
    setSuppliers(updatedSups);
    setPurchases(updatedPurchs);
    localStorage.setItem('asmat_rms_inventory', JSON.stringify(updatedInv));
    localStorage.setItem('asmat_rms_suppliers', JSON.stringify(updatedSups));
    localStorage.setItem('asmat_rms_purchases', JSON.stringify(updatedPurchs));
  };

  // Add Item handler
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemNameEn || newItemStock < 0) return;

    const added: InventoryItem = {
      id: `inv-${Date.now()}`,
      nameEn: newItemNameEn,
      nameUr: newItemNameUr || newItemNameEn,
      sku: newItemSku || `INV-${newItemCategory.substring(0,3).toUpperCase()}-${Math.floor(100+Math.random()*900)}`,
      stock: newItemStock,
      minStock: newItemMinStock,
      unit: newItemUnit,
      category: newItemCategory,
      supplierId: newItemSupplier || (suppliers[0]?.id || ''),
      lastUpdated: new Date().toLocaleString()
    };

    const updatedInv = [...items, added];
    
    // Add to transaction logs if starting stock is entered
    let updatedPurchs = [...purchases];
    if (newItemStock > 0) {
      const selectedSup = suppliers.find(s => s.id === added.supplierId);
      updatedPurchs.unshift({
        id: `pur-${Date.now()}`,
        itemId: added.id,
        itemName: added.nameEn,
        quantity: newItemStock,
        unit: added.unit,
        costPrice: 0,
        totalCost: 0,
        type: 'stock-in',
        date: new Date().toLocaleString(),
        supplierName: selectedSup?.name || 'Initial Seeding',
        notes: 'Initial stock load'
      });
    }

    saveState(updatedInv, suppliers, updatedPurchs);
    
    // Reset Form
    setNewItemNameEn('');
    setNewItemNameUr('');
    setNewItemSku('');
    setNewItemStock(0);
    setNewItemMinStock(5);
    setNewItemUnit('kg');
    setNewItemCategory('Meat');
    setNewItemSupplier('');
    setIsAddItemOpen(false);
  };

  // Add Supplier handler
  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupName || !newSupPhone) return;

    const added: Supplier = {
      id: `sup-${Date.now()}`,
      name: newSupName,
      contactPerson: newSupContact,
      phone: newSupPhone,
      email: newSupEmail,
      address: newSupAddress
    };

    const updatedSups = [...suppliers, added];
    saveState(items, updatedSups, purchases);

    // Reset Form
    setNewSupName('');
    setNewSupContact('');
    setNewSupPhone('');
    setNewSupEmail('');
    setNewSupAddress('');
    setIsAddSupplierOpen(false);
  };

  // Stock Adjustment handle
  const handleStockAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdjustItem || adjustQty <= 0) return;

    const updatedInv = items.map(item => {
      if (item.id === selectedAdjustItem.id) {
        const nextStock = adjustType === 'stock-in' 
          ? item.stock + adjustQty 
          : Math.max(0, item.stock - adjustQty);
        return {
          ...item,
          stock: nextStock,
          lastUpdated: new Date().toLocaleString()
        };
      }
      return item;
    });

    const activeSup = suppliers.find(s => s.id === selectedAdjustItem.supplierId);
    const cost = adjustPrice > 0 ? adjustPrice : 0;

    const newRecord: PurchaseRecord = {
      id: `pur-${Date.now()}`,
      itemId: selectedAdjustItem.id,
      itemName: selectedAdjustItem.nameEn,
      quantity: adjustQty,
      unit: selectedAdjustItem.unit,
      costPrice: cost,
      totalCost: cost * adjustQty,
      type: adjustType,
      date: new Date().toLocaleString(),
      supplierName: activeSup?.name || 'Counter Warehouse',
      notes: adjustNotes || (adjustType === 'stock-in' ? 'Manual stock input' : 'Manual stock release')
    };

    const updatedPurchs = [newRecord, ...purchases];
    saveState(updatedInv, suppliers, updatedPurchs);

    // Reset Adjust form
    setAdjustQty(0);
    setAdjustPrice(0);
    setAdjustNotes('');
    setIsStockAdjustOpen(false);
    setSelectedAdjustItem(null);
  };

  // Delete inventory item helper
  const handleDeleteItem = (itemId: string) => {
    if (confirm(isUrdu ? "کیا آپ واقعی اس چیز کو ہٹانا چاہتے ہیں؟" : "Are you sure you want to remove this item?")) {
      const updated = items.filter(item => item.id !== itemId);
      saveState(updated, suppliers, purchases);
    }
  };

  // Open Edit Stock Dialog Helper
  const handleOpenEditItem = (item: InventoryItem) => {
    setSelectedEditItem(item);
    setEditItemNameEn(item.nameEn);
    setEditItemNameUr(item.nameUr || '');
    setEditItemSku(item.sku);
    setEditItemStock(item.stock);
    setEditItemMinStock(item.minStock);
    setEditItemUnit(item.unit);
    setEditItemCategory(item.category);
    setEditItemSupplier(item.supplierId || '');
    setIsEditItemOpen(true);
  };

  // Submit Edit Stock Form
  const handleEditItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEditItem || !editItemNameEn || !editItemSku) return;

    const updatedInv = items.map(item => {
      if (item.id === selectedEditItem.id) {
        return {
          ...item,
          nameEn: editItemNameEn,
          nameUr: editItemNameUr || editItemNameEn,
          sku: editItemSku,
          stock: editItemStock,
          minStock: editItemMinStock,
          unit: editItemUnit,
          category: editItemCategory,
          supplierId: editItemSupplier,
          lastUpdated: new Date().toLocaleString()
        };
      }
      return item;
    });

    saveState(updatedInv, suppliers, purchases);
    setIsEditItemOpen(false);
    setSelectedEditItem(null);
  };

  // Alerts logic
  const outOfStock = items.filter(item => item.stock === 0);
  const lowStock = items.filter(item => item.stock > 0 && item.stock <= item.minStock);

  // Filtered Items logic
  const filteredItems = items.filter(item => {
    const matchesSearch = item.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.nameUr.includes(searchTerm) || 
                          item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Dynamic Alerts Banner */}
      {(outOfStock.length > 0 || lowStock.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {outOfStock.length > 0 && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-red-800 dark:text-red-400 flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider">{isUrdu ? "خام مال ختم ہے!" : "OUT OF STOCK CRITICAL"}</h4>
                <p className="text-[11px] opacity-90 mt-1">
                  {isUrdu 
                    ? `مندرجہ ذیل سامان ختم ہوچکا ہے: ${outOfStock.map(i => i.nameUr).join(', ')}`
                    : `Please restock: ${outOfStock.map(i => i.nameEn).join(', ')}`
                  }
                </p>
              </div>
            </div>
          )}

          {lowStock.length > 0 && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-amber-800 dark:text-amber-400 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider">{isUrdu ? "اسٹاک کی کمی کا الرٹ" : "LOW STOCK WARNING"}</h4>
                <p className="text-[11px] opacity-90 mt-1">
                  {isUrdu 
                    ? `${lowStock.length} اشیاء کم ترین مقررہ حد پر پہنچ چکی ہیں۔`
                    : `${lowStock.length} ingredients are running below safety threshold. Restock recommended.`
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Primary Section Header & Tab Switcher */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white dark:bg-stone-950 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 gap-4">
        <div>
          <span className="text-[10px] uppercase font-black text-red-800 dark:text-amber-500 tracking-wider">
            {isUrdu ? "انوینٹری کنٹرول پینل" : "Warehouse Logistics"}
          </span>
          <h3 className="text-sm font-extrabold text-stone-900 dark:text-white">
            {isUrdu ? "اسٹاک اور سپلائرز مینجمنٹ" : "Stock, Procurement & Supplier Registry"}
          </h3>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {[
            { id: 'items' as const, label: isUrdu ? 'اسٹاک لسٹ' : 'Inventory List', icon: Package },
            { id: 'suppliers' as const, label: isUrdu ? 'سپلائرز لسٹ' : 'Suppliers List', icon: Users },
            { id: 'history' as const, label: isUrdu ? 'ٹرانزیکشن لاگ' : 'Transaction History', icon: History }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id)}
                className={`flex-1 md:flex-initial rounded-xl px-4 py-2 text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  subTab === tab.id
                    ? 'bg-red-800 text-white dark:bg-amber-500 dark:text-stone-950 shadow'
                    : 'bg-stone-100 dark:bg-stone-900 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content 1: Inventory List */}
      {subTab === 'items' && (
        <div className="space-y-4">
          
          {/* Filters Rail */}
          <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-stone-950 p-4 rounded-xl border border-stone-200 dark:border-stone-800">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isUrdu ? "سامان کا نام یا SKU تلاش کریں..." : "Search ingredients, SKU, name..."}
                className="w-full rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 py-2 pl-9 pr-4 text-xs outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 dark:text-white"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 py-2 px-3 text-xs outline-none text-stone-700 dark:text-stone-300 font-bold"
              >
                <option value="all">{isUrdu ? "تمام کیٹیگریز" : "All Categories"}</option>
                <option value="Meat">{isUrdu ? "گوشت (Meat)" : "Meat"}</option>
                <option value="Grains">{isUrdu ? "اجناس (Grains)" : "Grains"}</option>
                <option value="Spices">{isUrdu ? "مصالحہ جات (Spices)" : "Spices"}</option>
                <option value="Fuel">{isUrdu ? "ایندھن / کوئلہ" : "Fuel/Firewood"}</option>
                <option value="Dairy">{isUrdu ? "ڈیری پروڈکٹس" : "Dairy"}</option>
              </select>

              <button
                onClick={() => setIsAddItemOpen(true)}
                className="rounded-lg bg-red-800 hover:bg-red-700 text-white dark:bg-amber-500 dark:text-stone-950 py-2 px-4 text-xs font-black flex items-center gap-1 transition-all cursor-pointer shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{isUrdu ? "نیا سامان شامل کریں" : "Add Item"}</span>
              </button>
            </div>
          </div>

          {/* Table list */}
          <div className="bg-white dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-100 dark:bg-stone-900 text-stone-400 font-black uppercase text-[10px] tracking-wider border-b border-stone-200 dark:border-stone-800">
                    <th className="p-4">SKU</th>
                    <th className="p-4">{isUrdu ? "نام (انگریزی / اردو)" : "Ingredient Details"}</th>
                    <th className="p-4">{isUrdu ? "درجہ (Category)" : "Category"}</th>
                    <th className="p-4">{isUrdu ? "موجودہ اسٹاک" : "In Hand Stock"}</th>
                    <th className="p-4">{isUrdu ? "محفوظ حدِ کم" : "Safety Stock Limit"}</th>
                    <th className="p-4">{isUrdu ? "منسک سپلائر" : "Linked Supplier"}</th>
                    <th className="p-4">{isUrdu ? "آخری اپ ڈیٹ" : "Last Adjusted"}</th>
                    <th className="p-4 text-center">{isUrdu ? "کارروائی" : "Operations Control"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-900 text-stone-700 dark:text-stone-300">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-stone-400">
                        {isUrdu ? "انوینٹری میں کوئی اشیاء نہیں ملیں۔" : "No raw materials found matching your search."}
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map(item => {
                      const isOut = item.stock === 0;
                      const isLow = item.stock > 0 && item.stock <= item.minStock;
                      const activeSup = suppliers.find(s => s.id === item.supplierId);
                      
                      return (
                        <tr key={item.id} className="hover:bg-stone-50/40 dark:hover:bg-stone-900/10">
                          <td className="p-4 font-mono font-black text-stone-400">{item.sku}</td>
                          <td className="p-4">
                            <div className="font-bold text-stone-900 dark:text-white">{item.nameEn}</div>
                            <div className="text-[10px] text-stone-400 mt-0.5">{item.nameUr}</div>
                          </td>
                          <td className="p-4 font-black">
                            <span className="rounded-md bg-stone-100 dark:bg-stone-900 px-2 py-0.5 text-[10px]">
                              {item.category}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              <span className={`font-black font-mono text-sm ${
                                isOut ? 'text-red-600' : isLow ? 'text-amber-500' : 'text-stone-900 dark:text-white'
                              }`}>
                                {item.stock} {item.unit}
                              </span>
                              {isOut && (
                                <span className="rounded bg-red-600/10 text-red-600 font-extrabold px-1.5 py-0.5 text-[9px] uppercase">
                                  {isUrdu ? "بالکل ختم" : "Out"}
                                </span>
                              )}
                              {isLow && !isOut && (
                                <span className="rounded bg-amber-500/10 text-amber-500 font-extrabold px-1.5 py-0.5 text-[9px] uppercase">
                                  {isUrdu ? "کم" : "Low"}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 font-semibold text-stone-400 font-mono">{item.minStock} {item.unit}</td>
                          <td className="p-4 text-stone-600 dark:text-stone-300 font-bold">{activeSup?.name || 'Local Warehouse'}</td>
                          <td className="p-4 text-stone-400 font-mono">{item.lastUpdated}</td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedAdjustItem(item);
                                  setAdjustType('stock-in');
                                  setIsStockAdjustOpen(true);
                                }}
                                className="rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] px-2 py-1 font-bold cursor-pointer"
                              >
                                {isUrdu ? "اسٹاک ان" : "Stock In"}
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedAdjustItem(item);
                                  setAdjustType('stock-out');
                                  setIsStockAdjustOpen(true);
                                }}
                                className="rounded bg-red-800 hover:bg-red-700 text-white text-[10px] px-2 py-1 font-bold cursor-pointer"
                              >
                                {isUrdu ? "اسٹاک آؤٹ" : "Stock Out"}
                              </button>
                              <button
                                onClick={() => handleOpenEditItem(item)}
                                className="p-1 rounded text-stone-400 hover:text-amber-500 cursor-pointer"
                                title={isUrdu ? "ترمیم کریں" : "Edit Stock details"}
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-1 rounded text-stone-400 hover:text-red-500 cursor-pointer"
                                title={isUrdu ? "حذف کریں" : "Delete Item"}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Suppliers List */}
      {subTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white dark:bg-stone-950 p-4 rounded-xl border border-stone-200 dark:border-stone-800">
            <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider">
              {isUrdu ? "منظور شدہ ہول سیل وینڈرز" : "Approved Procurement Suppliers"}
            </h4>

            <button
              onClick={() => setIsAddSupplierOpen(true)}
              className="rounded-lg bg-red-800 hover:bg-red-700 text-white dark:bg-amber-500 dark:text-stone-950 py-2 px-4 text-xs font-black flex items-center gap-1 transition-all cursor-pointer active:scale-95 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{isUrdu ? "نیا سپلائر درج کریں" : "Add Supplier"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.length === 0 ? (
              <div className="col-span-full text-center py-10 text-stone-400 text-xs bg-white dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800">
                {isUrdu ? "کوئی سپلائر رجسٹرڈ نہیں ہے۔" : "No suppliers added to database."}
              </div>
            ) : (
              suppliers.map(sup => {
                const supItems = items.filter(i => i.supplierId === sup.id);
                return (
                  <div key={sup.id} className="bg-white dark:bg-stone-950 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4 shadow-sm text-left">
                    <div className="border-b border-stone-100 dark:border-stone-900 pb-3 flex justify-between items-start gap-2">
                      <div>
                        <h4 className="text-sm font-black text-stone-900 dark:text-white leading-tight">{sup.name}</h4>
                        <p className="text-[10px] text-stone-400 mt-1 font-bold uppercase tracking-wider">Contact: {sup.contactPerson || 'Direct Line'}</p>
                      </div>
                      <span className="rounded bg-red-800/10 text-red-800 dark:bg-amber-500/10 dark:text-amber-500 px-2 py-0.5 text-[9px] font-black shrink-0 font-mono">
                        {supItems.length} {isUrdu ? "خام مال" : "Items"}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs font-medium text-stone-500 dark:text-stone-400">
                      <div className="flex justify-between">
                        <span>{isUrdu ? "فون نمبر:" : "Phone:"}</span>
                        <span className="font-bold font-mono text-stone-900 dark:text-white">{sup.phone}</span>
                      </div>
                      {sup.email && (
                        <div className="flex justify-between">
                          <span>{isUrdu ? "ای میل:" : "Email:"}</span>
                          <span className="font-mono text-stone-700 dark:text-stone-300">{sup.email}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-start gap-4">
                        <span className="shrink-0">{isUrdu ? "پتہ:" : "Address:"}</span>
                        <span className="text-right text-stone-700 dark:text-stone-300 truncate max-w-[180px]">{sup.address || '-'}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab Content 3: Transaction Log / Audit Log */}
      {subTab === 'history' && (
        <div className="bg-white dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-stone-100 dark:border-stone-900 flex justify-between items-center bg-stone-50/50 dark:bg-stone-900/10">
            <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider">
              📝 {isUrdu ? "اسٹاک لوڈنگ اور اخراج کا مکمل ریکارڈ" : "Inventory Transaction Audit Registry"}
            </h4>
            <span className="text-[10px] bg-stone-200 dark:bg-stone-800 px-2.5 py-1 rounded font-mono font-black">
              {purchases.length} {isUrdu ? "کل لاگز" : "entries logged"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-100 dark:bg-stone-900 text-stone-400 font-black uppercase text-[10px] tracking-wider border-b border-stone-150 dark:border-stone-800">
                  <th className="p-4">{isUrdu ? "تاریخ و وقت" : "Timestamp"}</th>
                  <th className="p-4">{isUrdu ? "خام مال" : "Ingredient Name"}</th>
                  <th className="p-4">{isUrdu ? "نوعیت" : "Transaction Type"}</th>
                  <th className="p-4 text-center">{isUrdu ? "مقدار" : "Quantity"}</th>
                  <th className="p-4 text-right">{isUrdu ? "یونٹ قیمت" : "Cost Price"}</th>
                  <th className="p-4 text-right">{isUrdu ? "کل لاگت" : "Total Cost"}</th>
                  <th className="p-4">{isUrdu ? "منسک ادارہ" : "Entity/Supplier"}</th>
                  <th className="p-4">{isUrdu ? "تفصیل / نوٹس" : "Audit description / notes"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-900 text-stone-700 dark:text-stone-300">
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-stone-400">
                      {isUrdu ? "کوئی ریکارڈ دستیاب نہیں ہے۔" : "No logistics records in this period."}
                    </td>
                  </tr>
                ) : (
                  purchases.map(pur => (
                    <tr key={pur.id} className="hover:bg-stone-50/20 dark:hover:bg-stone-900/10">
                      <td className="p-4 font-mono font-medium text-stone-400">{pur.date}</td>
                      <td className="p-4 font-bold text-stone-900 dark:text-white">{pur.itemName}</td>
                      <td className="p-4">
                        <span className={`rounded-md px-2.5 py-0.5 text-[10px] font-black uppercase inline-block ${
                          pur.type === 'stock-in' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' 
                            : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400'
                        }`}>
                          {pur.type === 'stock-in' ? (isUrdu ? "اسٹاک ان" : "STOCK IN") : (isUrdu ? "اسٹاک آؤٹ" : "STOCK OUT")}
                        </span>
                      </td>
                      <td className="p-4 text-center font-black font-mono">{pur.quantity} {pur.unit}</td>
                      <td className="p-4 text-right font-bold font-mono text-stone-400">Rs.{pur.costPrice.toLocaleString()}</td>
                      <td className="p-4 text-right font-black font-mono text-stone-900 dark:text-white">Rs.{pur.totalCost.toLocaleString()}</td>
                      <td className="p-4 font-semibold">{pur.supplierName || 'System Auto'}</td>
                      <td className="p-4 font-sans text-stone-400 italic">"{pur.notes || '-'}"</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD INVENTORY ITEM */}
      {isAddItemOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm" onClick={() => setIsAddItemOpen(false)} />
          
          <form onSubmit={handleAddItem} className="relative bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 w-full max-w-md z-10 space-y-4">
            <h3 className="text-sm font-black text-stone-900 dark:text-white uppercase tracking-wider pb-3 border-b border-stone-100 dark:border-stone-800">
              {isUrdu ? "نیا خام مال اسٹاک میں شامل کریں" : "Add New Raw Material"}
            </h3>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">{isUrdu ? "آئٹم کا نام (English) *" : "Item Name (English) *"}</label>
                <input
                  required
                  type="text"
                  value={newItemNameEn}
                  onChange={(e) => setNewItemNameEn(e.target.value)}
                  placeholder="e.g. Sella Golden Rice"
                  className="w-full rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 py-2 px-3 text-xs outline-none text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">{isUrdu ? "آئٹم کا نام (Urdu) *" : "Item Name (Urdu) *"}</label>
                <input
                  type="text"
                  value={newItemNameUr}
                  onChange={(e) => setNewItemNameUr(e.target.value)}
                  placeholder="مثال: سیلہ گولڈن چاول"
                  className="w-full rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 py-2 px-3 text-xs outline-none text-right text-stone-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">{isUrdu ? "ابتدائی اسٹاک مقدار" : "Initial Stock Qty"}</label>
                  <input
                    required
                    type="number"
                    step="any"
                    value={newItemStock}
                    onChange={(e) => setNewItemStock(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 py-2 px-3 text-xs outline-none text-stone-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">{isUrdu ? "یونٹ پیمائش" : "Unit"}</label>
                  <select
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="w-full rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 py-2 px-3 text-xs outline-none text-stone-700 dark:text-stone-300 font-bold"
                  >
                    <option value="kg">kg</option>
                    <option value="liters">liters</option>
                    <option value="units">units</option>
                    <option value="bags">bags</option>
                    <option value="grams">grams</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">{isUrdu ? "کم سے کم حد (الرٹ)" : "Low Stock Limit"}</label>
                  <input
                    required
                    type="number"
                    value={newItemMinStock}
                    onChange={(e) => setNewItemMinStock(parseInt(e.target.value) || 0)}
                    className="w-full rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 py-2 px-3 text-xs outline-none text-stone-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">{isUrdu ? "آئٹم کوڈ / SKU" : "SKU Code"}</label>
                  <input
                    type="text"
                    value={newItemSku}
                    onChange={(e) => setNewItemSku(e.target.value)}
                    placeholder="e.g. INV-RIC-01"
                    className="w-full rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 py-2 px-3 text-xs outline-none text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">{isUrdu ? "درجہ (Category)" : "Category"}</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 py-2 px-3 text-xs outline-none text-stone-700 dark:text-stone-300 font-bold"
                  >
                    <option value="Meat">Meat</option>
                    <option value="Grains">Grains</option>
                    <option value="Spices">Spices</option>
                    <option value="Fuel">Fuel</option>
                    <option value="Dairy">Dairy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">{isUrdu ? "منسک سپلائر" : "Supplier"}</label>
                  <select
                    value={newItemSupplier}
                    onChange={(e) => setNewItemSupplier(e.target.value)}
                    className="w-full rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 py-2 px-3 text-xs outline-none text-stone-700 dark:text-stone-300 font-bold"
                  >
                    <option value="">{isUrdu ? "کوئی نہیں" : "None (Local)"}</option>
                    {suppliers.map(sup => (
                      <option key={sup.id} value={sup.id}>{sup.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 pt-4 border-t border-stone-100 dark:border-stone-800">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-red-800 hover:bg-red-700 text-white py-2.5 text-xs font-bold transition-all cursor-pointer shadow-md text-center active:scale-95"
              >
                🔐 {isUrdu ? "محفوظ کریں" : "Save Item"}
              </button>
              <button
                type="button"
                onClick={() => setIsAddItemOpen(false)}
                className="flex-1 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 py-2.5 text-xs font-bold transition-all cursor-pointer text-center"
              >
                {isUrdu ? "کینسل" : "Cancel"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: EDIT INVENTORY ITEM */}
      {isEditItemOpen && selectedEditItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm" onClick={() => { setIsEditItemOpen(false); setSelectedEditItem(null); }} />
          
          <form onSubmit={handleEditItemSubmit} className="relative bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 w-full max-w-md z-10 space-y-4">
            <h3 className="text-sm font-black text-stone-900 dark:text-white uppercase tracking-wider pb-3 border-b border-stone-100 dark:border-stone-800">
              {isUrdu ? "خام مال کی معلومات میں ترمیم کریں" : "Edit Stock Specifications"}
            </h3>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">{isUrdu ? "آئٹم کا نام (English) *" : "Item Name (English) *"}</label>
                <input
                  required
                  type="text"
                  value={editItemNameEn}
                  onChange={(e) => setEditItemNameEn(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 py-2 px-3 text-xs outline-none text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">{isUrdu ? "آئٹم کا نام (Urdu) *" : "Item Name (Urdu) *"}</label>
                <input
                  type="text"
                  value={editItemNameUr}
                  onChange={(e) => setEditItemNameUr(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 py-2 px-3 text-xs outline-none text-right text-stone-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">{isUrdu ? "موجودہ اسٹاک مقدار" : "Stock Quantity"}</label>
                  <input
                    required
                    type="number"
                    step="any"
                    value={editItemStock}
                    onChange={(e) => setEditItemStock(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 py-2 px-3 text-xs outline-none text-stone-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">{isUrdu ? "یونٹ پیمائش" : "Unit"}</label>
                  <select
                    value={editItemUnit}
                    onChange={(e) => setEditItemUnit(e.target.value)}
                    className="w-full rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 py-2 px-3 text-xs outline-none text-stone-700 dark:text-stone-300 font-bold"
                  >
                    <option value="kg">kg</option>
                    <option value="liters">liters</option>
                    <option value="units">units</option>
                    <option value="bags">bags</option>
                    <option value="grams">grams</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">{isUrdu ? "کم سے کم حد (الرٹ)" : "Low Stock Limit"}</label>
                  <input
                    required
                    type="number"
                    value={editItemMinStock}
                    onChange={(e) => setEditItemMinStock(parseInt(e.target.value) || 0)}
                    className="w-full rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 py-2 px-3 text-xs outline-none text-stone-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">{isUrdu ? "آئٹم کوڈ / SKU *" : "SKU Code *"}</label>
                  <input
                    required
                    type="text"
                    value={editItemSku}
                    onChange={(e) => setEditItemSku(e.target.value)}
                    className="w-full rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 py-2 px-3 text-xs outline-none text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">{isUrdu ? "درجہ (Category)" : "Category"}</label>
                  <select
                    value={editItemCategory}
                    onChange={(e) => setEditItemCategory(e.target.value)}
                    className="w-full rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 py-2 px-3 text-xs outline-none text-stone-700 dark:text-stone-300 font-bold"
                  >
                    <option value="Meat">Meat</option>
                    <option value="Grains">Grains</option>
                    <option value="Spices">Spices</option>
                    <option value="Fuel">Fuel</option>
                    <option value="Dairy">Dairy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">{isUrdu ? "منسک سپلائر" : "Supplier"}</label>
                  <select
                    value={editItemSupplier}
                    onChange={(e) => setEditItemSupplier(e.target.value)}
                    className="w-full rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 py-2 px-3 text-xs outline-none text-stone-700 dark:text-stone-300 font-bold"
                  >
                    <option value="">{isUrdu ? "کوئی نہیں" : "None (Local)"}</option>
                    {suppliers.map(sup => (
                      <option key={sup.id} value={sup.id}>{sup.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 pt-4 border-t border-stone-100 dark:border-stone-800">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-red-800 hover:bg-red-700 text-white py-2.5 text-xs font-bold transition-all cursor-pointer shadow-md text-center active:scale-95"
              >
                🔐 {isUrdu ? "اپ ڈیٹ کریں" : "Update Details"}
              </button>
              <button
                type="button"
                onClick={() => { setIsEditItemOpen(false); setSelectedEditItem(null); }}
                className="flex-1 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 py-2.5 text-xs font-bold transition-all cursor-pointer text-center"
              >
                {isUrdu ? "کینسل" : "Cancel"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: ADD SUPPLIER */}
      {isAddSupplierOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm" onClick={() => setIsAddSupplierOpen(false)} />
          
          <form onSubmit={handleAddSupplier} className="relative bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 w-full max-w-md z-10 space-y-4">
            <h3 className="text-sm font-black text-stone-900 dark:text-white uppercase tracking-wider pb-3 border-b border-stone-100 dark:border-stone-800">
              {isUrdu ? "نیا ہول سیل وینڈر درج کریں" : "Add New Supplier"}
            </h3>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">{isUrdu ? "کمپنی / سپلائر کا نام *" : "Company Name *"}</label>
                <input
                  required
                  type="text"
                  value={newSupName}
                  onChange={(e) => setNewSupName(e.target.value)}
                  placeholder="e.g. Khyber Flour Mills"
                  className="w-full rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 py-2 px-3 text-xs outline-none text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">{isUrdu ? "رابطہ کار شخص (Contact Person)" : "Contact Person"}</label>
                <input
                  type="text"
                  value={newSupContact}
                  onChange={(e) => setNewSupContact(e.target.value)}
                  placeholder="e.g. Haji Gul Jan"
                  className="w-full rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 py-2 px-3 text-xs outline-none text-stone-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">{isUrdu ? "موبائل نمبر *" : "Mobile Phone *"}</label>
                  <input
                    required
                    type="tel"
                    value={newSupPhone}
                    onChange={(e) => setNewSupPhone(e.target.value)}
                    placeholder="e.g. 0300-1234567"
                    className="w-full rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 py-2 px-3 text-xs outline-none text-stone-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">{isUrdu ? "ای میل ایڈریس" : "Email Address"}</label>
                  <input
                    type="email"
                    value={newSupEmail}
                    onChange={(e) => setNewSupEmail(e.target.value)}
                    placeholder="vendor@mail.com"
                    className="w-full rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 py-2 px-3 text-xs outline-none text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">{isUrdu ? "دفتر / فیکٹری کا پتہ" : "Factory/Office Address"}</label>
                <input
                  type="text"
                  value={newSupAddress}
                  onChange={(e) => setNewSupAddress(e.target.value)}
                  placeholder="e.g. Industrial Zone, Peshawar"
                  className="w-full rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 py-2 px-3 text-xs outline-none text-stone-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-2.5 pt-4 border-t border-stone-100 dark:border-stone-800">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-red-800 hover:bg-red-700 text-white py-2.5 text-xs font-bold transition-all cursor-pointer shadow-md text-center active:scale-95"
              >
                🔐 {isUrdu ? "اندراج کریں" : "Register Vendor"}
              </button>
              <button
                type="button"
                onClick={() => setIsAddSupplierOpen(false)}
                className="flex-1 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 py-2.5 text-xs font-bold transition-all cursor-pointer text-center"
              >
                {isUrdu ? "کینسل" : "Cancel"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: STOCK ADJUSTMENT (IN/OUT) */}
      {isStockAdjustOpen && selectedAdjustItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm" onClick={() => { setIsStockAdjustOpen(false); setSelectedAdjustItem(null); }} />
          
          <form onSubmit={handleStockAdjustSubmit} className="relative bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 w-full max-w-sm z-10 space-y-4">
            <div className="border-b border-stone-100 dark:border-stone-800 pb-3">
              <span className={`text-[9px] font-black uppercase rounded-sm px-1.5 py-0.5 inline-block ${
                adjustType === 'stock-in' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400'
              }`}>
                {adjustType === 'stock-in' ? (isUrdu ? "اسٹاک کی آمد (In)" : "Stock-In Operation") : (isUrdu ? "اسٹاک کا اخراج (Out)" : "Stock-Out Operation")}
              </span>
              <h3 className="text-sm font-black text-stone-900 dark:text-white mt-1 leading-tight">
                {selectedAdjustItem.nameEn} <span className="text-[10px] text-stone-400">({selectedAdjustItem.sku})</span>
              </h3>
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">
                    {isUrdu ? "مقدار (Quantity) *" : "Quantity *"}
                  </label>
                  <div className="relative">
                    <input
                      required
                      type="number"
                      step="any"
                      min="0.001"
                      value={adjustQty || ''}
                      onChange={(e) => setAdjustQty(parseFloat(e.target.value) || 0)}
                      placeholder="0.0"
                      className="w-full rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 py-2 px-3 text-xs outline-none text-stone-900 dark:text-white"
                    />
                    <span className="absolute right-3 top-2 text-[10px] font-bold text-stone-400">{selectedAdjustItem.unit}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">
                    {isUrdu ? "موجودہ سطح" : "Current Level"}
                  </label>
                  <div className="rounded-lg bg-stone-100 dark:bg-stone-950/50 py-2 px-3 text-xs font-mono font-black text-stone-600 dark:text-stone-300">
                    {selectedAdjustItem.stock} {selectedAdjustItem.unit}
                  </div>
                </div>
              </div>

              {adjustType === 'stock-in' && (
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">
                    {isUrdu ? "قیمت خرید (فی یونٹ) (روپے) *" : "Purchase Cost (per unit) (Rs.) *"}
                  </label>
                  <input
                    type="number"
                    value={adjustPrice || ''}
                    onChange={(e) => setAdjustPrice(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 1450"
                    className="w-full rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 py-2 px-3 text-xs outline-none text-stone-900 dark:text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">
                  {isUrdu ? "تفصیل / وجہ نوٹ" : "Adjustment Description/Notes"}
                </label>
                <input
                  type="text"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder={adjustType === 'stock-in' ? "e.g. Weekly bulk restock" : "e.g. Used in Saturday service"}
                  className="w-full rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 py-2 px-3 text-xs outline-none text-stone-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-2.5 pt-4 border-t border-stone-100 dark:border-stone-800">
              <button
                type="submit"
                className={`flex-1 rounded-xl text-white py-2.5 text-xs font-bold transition-all active:scale-95 cursor-pointer text-center shadow ${
                  adjustType === 'stock-in' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-800 hover:bg-red-700'
                }`}
              >
                {adjustType === 'stock-in' 
                  ? (isUrdu ? "لوڈ اسٹاک" : "Process Stock In")
                  : (isUrdu ? "خارج کریں" : "Process Stock Out")
                }
              </button>
              <button
                type="button"
                onClick={() => { setIsStockAdjustOpen(false); setSelectedAdjustItem(null); }}
                className="flex-1 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 py-2.5 text-xs font-bold transition-all cursor-pointer text-center"
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
