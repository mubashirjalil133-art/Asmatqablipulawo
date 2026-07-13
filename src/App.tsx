/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import FeaturedDishes from './components/FeaturedDishes';
import Gallery from './components/Gallery';
import Reviews from './components/Reviews';
import Contact from './components/Contact';
import Footer from './components/Footer';

// Point of Sale and RMS components
import RmsDashboard from './components/RmsDashboard';
import RmsLogin from './components/RmsLogin';

// Modals
import ReservationModal from './components/ReservationModal';

// Static Data and Types
import { Language, Dish, Table, Order, TableStatus, OrderStatus, PaymentStatus, PaymentMethod, Category } from './types';
import { defaultTables, dishesData } from './data';
import { MonitorCheck, Smartphone, Sparkles, UtensilsCrossed } from 'lucide-react';

// Live Orders Seeder for initial deployment
const getSeedOrders = (): Order[] => [
  {
    id: 'ord-1008',
    orderNumber: 'ORD-1008',
    tableNumber: 6,
    waiterName: 'مبشر جلیل',
    customerName: 'احمد',
    items: [
      { dishId: 'dish-1', nameEn: 'Special Kabuli Pulao (Sella Rice & Mutton Shank)', nameUr: 'کابلی پلاؤ', price: 1150, quantity: 1 },
      { dishId: 'dish-naan', nameEn: 'Tandoori Naan', nameUr: 'نان', price: 90, quantity: 2 },
      { dishId: 'dish-9', nameEn: 'Chilled Soft Drinks (Pepsi / Coca-Cola)', nameUr: 'کولڈ ڈرنک', price: 120, quantity: 1 }
    ],
    subtotal: 1450,
    discount: 0,
    discountPercent: 0,
    tax: 0,
    taxPercent: 0,
    grandTotal: 1450,
    status: 'new',
    paymentStatus: 'pending',
    timestamp: new Date().toLocaleString()
  },
  {
    id: 'ord-seed-1',
    orderNumber: 'ORD-1001',
    tableNumber: 3,
    waiterName: 'Asif Khan',
    items: [
      { dishId: 'dish-1', nameEn: 'Special Kabuli Pulao (Sella Rice & Mutton Shank)', nameUr: 'خصوصی مٹن قابلی پلاؤ (سیلہ چاول اور مٹن شینک)', price: 1150, quantity: 2 }
    ],
    subtotal: 2300,
    discount: 115,
    discountPercent: 5,
    tax: 109,
    taxPercent: 5,
    grandTotal: 2294,
    status: 'served',
    paymentStatus: 'paid',
    paymentMethod: 'cash',
    timestamp: new Date(Date.now() - 4 * 3600000).toLocaleString() // 4 hours ago
  },
  {
    id: 'ord-seed-2',
    orderNumber: 'ORD-1002',
    tableNumber: 1,
    waiterName: 'Bilal Afridi',
    items: [
      { dishId: 'dish-2', nameEn: 'Asmat Special Peshawari Mutton Karahi', nameUr: 'عصمت سپیشل پشاور مٹن کڑاہی', price: 2800, quantity: 1 },
      { dishId: 'dish-4', nameEn: 'Signature Charcoal Seekh Kabab (Beef/Chicken)', nameUr: 'روایتی کوئلہ سیخ کباب (بیف یا چکن)', price: 900, quantity: 1 }
    ],
    subtotal: 3700,
    discount: 370,
    discountPercent: 10,
    tax: 167,
    taxPercent: 5,
    grandTotal: 3497,
    status: 'served',
    paymentStatus: 'paid',
    paymentMethod: 'card',
    timestamp: new Date(Date.now() - 2 * 3600000).toLocaleString() // 2 hours ago
  },
  {
    id: 'ord-seed-3',
    orderNumber: 'ORD-1003',
    tableNumber: 5,
    waiterName: 'Tariq Jan',
    items: [
      { dishId: 'dish-1', nameEn: 'Special Kabuli Pulao (Sella Rice & Mutton Shank)', nameUr: 'خصوصی مٹن قابلی پلاؤ (سیلہ چاول اور مٹن شینک)', price: 1150, quantity: 1 },
      { dishId: 'dish-7', nameEn: 'Zafrani Elaichi Chai (Saffron Tea)', nameUr: 'زعفرانی الائچی چائے', price: 180, quantity: 1 }
    ],
    subtotal: 1330,
    discount: 0,
    discountPercent: 0,
    tax: 67,
    taxPercent: 5,
    grandTotal: 1397,
    status: 'preparing',
    paymentStatus: 'pending',
    timestamp: new Date(Date.now() - 30 * 60000).toLocaleString() // 30 mins ago
  },
  {
    id: 'ord-seed-4',
    orderNumber: 'ORD-1004',
    tableNumber: 2,
    waiterName: 'Saeed Ahmad',
    items: [
      { dishId: 'dish-6', nameEn: 'Asmat Specialty Chicken Fajita Pizza', nameUr: 'عصمت سپیشل چکن فجیتا پیزا', price: 1200, quantity: 1 }
    ],
    subtotal: 1200,
    discount: 0,
    discountPercent: 0,
    tax: 60,
    taxPercent: 5,
    grandTotal: 1260,
    status: 'new',
    paymentStatus: 'pending',
    timestamp: new Date(Date.now() - 10 * 60000).toLocaleString() // 10 mins ago
  }
];

// --- RECIPES CONFIGURATION FOR AUTOMATIC STOCK DEDUCTION ---
const RECIPES: Record<string, { sku: string; qty: number }[]> = {
  'dish-1': [ // Special Kabuli Pulao
    { sku: 'INV-RIC-01', qty: 0.5 }, // Sella Golden Rice: 0.5 kg
    { sku: 'INV-MUT-01', qty: 0.4 }, // Mutton Shank: 0.4 kg
    { sku: 'INV-SAF-01', qty: 0.001 } // Kashmiri Saffron: 0.001 kg
  ],
  'dish-2': [ // Peshawari Mutton Karahi
    { sku: 'INV-MUT-01', qty: 0.8 }, // Mutton: 0.8 kg
    { sku: 'INV-COL-01', qty: 0.1 }  // Hardwood Charcoal: 0.1 bags
  ],
  'dish-4': [ // Charcoal Seekh Kabab
    { sku: 'INV-CHK-01', qty: 0.3 }, // Fresh Chicken Breast: 0.3 kg
    { sku: 'INV-COL-01', qty: 0.05 } // Hardwood Charcoal: 0.05 bags
  ],
  'dish-6': [ // Chicken Fajita Pizza
    { sku: 'INV-CHK-01', qty: 0.25 }, // Fresh Chicken Breast: 0.25 kg
    { sku: 'INV-CHS-01', qty: 0.2 }   // Mozzarella Pizza Cheese: 0.2 kg
  ],
  'dish-7': [ // Zafrani Elaichi Chai
    { sku: 'INV-SAF-01', qty: 0.0005 }, // Pure Kashmiri Saffron: 0.0005 kg
    { sku: 'INV-CRD-01', qty: 0.01 }    // Premium Elaichi Cardamom: 0.01 kg
  ],
  'dish-naan': [ // Tandoori Naan
    { sku: 'INV-RIC-01', qty: 0.1 } // Flour / Grains (let's use Rice/Grains item SKU)
  ],
  'dish-roghni': [ // Special Roghni Naan
    { sku: 'INV-RIC-01', qty: 0.12 },
    { sku: 'INV-CHS-01', qty: 0.02 }
  ]
};

// Automatic Stock Deduction Engine
const deductStockForOrder = (order: Order) => {
  try {
    const savedInvStr = localStorage.getItem('asmat_rms_inventory');
    const savedPurchStr = localStorage.getItem('asmat_rms_purchases');
    
    if (!savedInvStr) return; // if inventory hasn't been initialized yet, do nothing
    
    let inventory: any[] = JSON.parse(savedInvStr);
    let purchases: any[] = savedPurchStr ? JSON.parse(savedPurchStr) : [];
    let stockChanged = false;

    order.items.forEach(item => {
      // Find the base dish ID (e.g., split custom appended sizes like dish-1-Large)
      const baseId = item.dishId.split('-')[0];
      let recipe = RECIPES[item.dishId] || RECIPES[baseId];

      // Dynamic naming fallbacks to match custom user-created dishes!
      if (!recipe) {
        const nameLower = item.nameEn.toLowerCase();
        if (nameLower.includes('pulao')) {
          recipe = RECIPES['dish-1'];
        } else if (nameLower.includes('karahi')) {
          recipe = RECIPES['dish-2'];
        } else if (nameLower.includes('kabab') || nameLower.includes('tikka') || nameLower.includes('chicken')) {
          recipe = RECIPES['dish-4'];
        } else if (nameLower.includes('pizza') || nameLower.includes('cheese')) {
          recipe = RECIPES['dish-6'];
        } else if (nameLower.includes('chai') || nameLower.includes('tea') || nameLower.includes('cardamom') || nameLower.includes('elaichi')) {
          recipe = RECIPES['dish-7'];
        } else if (nameLower.includes('naan') || nameLower.includes('roti')) {
          recipe = RECIPES['dish-naan'];
        }
      }

      if (recipe) {
        recipe.forEach(ingredient => {
          // Find matching item in inventory by SKU
          const invItemIdx = inventory.findIndex(inv => inv.sku === ingredient.sku);
          if (invItemIdx !== -1) {
            const invItem = inventory[invItemIdx];
            const deductionAmt = ingredient.qty * item.quantity;
            
            // Deduct from stock but don't drop below 0
            const oldStock = invItem.stock;
            const newStock = Math.max(0, parseFloat((oldStock - deductionAmt).toFixed(4)));
            
            invItem.stock = newStock;
            invItem.lastUpdated = new Date().toLocaleString();
            stockChanged = true;

            // Log a transaction record of type 'stock-out'
            purchases.unshift({
              id: `pur-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              itemId: invItem.id,
              itemName: invItem.nameEn,
              quantity: parseFloat(deductionAmt.toFixed(4)),
              unit: invItem.unit,
              costPrice: 0,
              totalCost: 0,
              type: 'stock-out',
              date: new Date().toLocaleString(),
              supplierName: 'POS System',
              notes: `Auto deduction for ${order.orderNumber} (Qty x${item.quantity})`
            });
          }
        });
      }
    });

    if (stockChanged) {
      localStorage.setItem('asmat_rms_inventory', JSON.stringify(inventory));
      localStorage.setItem('asmat_rms_purchases', JSON.stringify(purchases));
      
      // Fire storage event so other open tabs/windows re-render instantly!
      window.dispatchEvent(new Event('storage'));
    }
  } catch (err) {
    console.error("Error in automatic stock deduction:", err);
  }
};

// Permanent Product Sales Ledger Recorder
const recordCompletedOrderItems = (order: Order) => {
  const isCompleted = order.status === 'completed' || order.status === 'served' || order.paymentStatus === 'paid';
  if (!isCompleted) return;

  const savedLedger = localStorage.getItem('asmat_rms_product_sales_ledger');
  let ledger: Array<{
    id: string;
    orderId: string;
    nameEn: string;
    nameUr: string;
    quantity: number;
    price: number;
    timestamp: string;
    image?: string;
  }> = [];

  if (savedLedger) {
    try {
      ledger = JSON.parse(savedLedger);
    } catch (e) {
      ledger = [];
    }
  }

  // To prevent duplicate recording of the exact same order items, check by orderId
  const alreadyRecorded = ledger.some(item => item.orderId === order.id);
  if (alreadyRecorded) return;

  const orderDate = order.timestamp || new Date().toLocaleString();

  order.items.forEach((item, index) => {
    ledger.push({
      id: `${order.id}-${index}-${Date.now()}`,
      orderId: order.id,
      nameEn: item.nameEn,
      nameUr: item.nameUr || item.nameEn,
      quantity: item.quantity || 1,
      price: item.price || 0,
      timestamp: orderDate,
      image: item.image
    });
  });

  localStorage.setItem('asmat_rms_product_sales_ledger', JSON.stringify(ledger));
};

// Initializer to pre-populate the ledger with existing completed historical orders
const initializeLedgerIfEmpty = (ordersList: Order[]) => {
  const savedLedger = localStorage.getItem('asmat_rms_product_sales_ledger');
  if (!savedLedger || savedLedger === '[]') {
    const ledger: Array<{
      id: string;
      orderId: string;
      nameEn: string;
      nameUr: string;
      quantity: number;
      price: number;
      timestamp: string;
      image?: string;
    }> = [];

    const recordedOrderIds = new Set<string>();

    ordersList.forEach(order => {
      const isCompleted = order.status === 'completed' || order.status === 'served' || order.paymentStatus === 'paid';
      if (!isCompleted || recordedOrderIds.has(order.id)) return;
      recordedOrderIds.add(order.id);

      const orderDate = order.timestamp || new Date().toLocaleString();
      order.items.forEach((item, index) => {
        ledger.push({
          id: `${order.id}-${index}-${Date.now()}`,
          orderId: order.id,
          nameEn: item.nameEn,
          nameUr: item.nameUr || item.nameEn,
          quantity: item.quantity || 1,
          price: item.price || 0,
          timestamp: orderDate,
          image: item.image
        });
      });
    });

    localStorage.setItem('asmat_rms_product_sales_ledger', JSON.stringify(ledger));
  }
};

export default function App() {
  const [language, setLanguage] = useState<Language>('ur');
  const [darkMode, setDarkMode] = useState<boolean>(true); // high-end luxury dark theme default
  const [viewMode, setViewMode] = useState<'customer' | 'rms'>('customer');
  const [isRmsAuthenticated, setIsRmsAuthenticated] = useState<boolean>(false);
  const [rmsUserRole, setRmsUserRole] = useState<string>('admin');

  // Core RMS States
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Modals visibility state
  const [isReservationOpen, setIsReservationOpen] = useState(false);

  // Reset authentication when exiting RMS to secure the system
  useEffect(() => {
    if (viewMode === 'customer') {
      setIsRmsAuthenticated(false);
    }
  }, [viewMode]);

  // Sync state from localStorage when custom 'storage' event is dispatched
  useEffect(() => {
    const handleStorageSync = () => {
      const savedOrders = localStorage.getItem('asmat_rms_orders');
      const savedTables = localStorage.getItem('asmat_rms_tables');
      const savedDishes = localStorage.getItem('asmat_rms_dishes');
      const savedCategories = localStorage.getItem('asmat_rms_categories');
      if (savedOrders) setOrders(JSON.parse(savedOrders));
      if (savedTables) setTables(JSON.parse(savedTables));
      if (savedDishes) setDishes(JSON.parse(savedDishes));
      if (savedCategories) setCategories(JSON.parse(savedCategories));
    };

    window.addEventListener('storage', handleStorageSync);
    return () => {
      window.removeEventListener('storage', handleStorageSync);
    };
  }, []);

  // Load and seed initial states
  useEffect(() => {
    // Migration for stale localStorage settings to ensure correct phone and default logo are present
    const rawSettings = localStorage.getItem('asmat_rms_settings');
    if (rawSettings) {
      try {
        const parsed = JSON.parse(rawSettings);
        let changed = false;
        if (!parsed.phone || parsed.phone.includes("1234567") || parsed.phone.includes("123-4567") || parsed.phone.includes("+92 300") || parsed.phone === "0302-8073204") {
          parsed.phone = "0302-8073204 / 0304-9767017";
          changed = true;
        }
        if (!parsed.logo || parsed.logo === "") {
          parsed.logo = "/logo.png";
          changed = true;
        }
        if (changed) {
          localStorage.setItem('asmat_rms_settings', JSON.stringify(parsed));
          window.dispatchEvent(new Event('storage'));
        }
      } catch (e) {
        // ignore
      }
    } else {
      const defaultSettings = {
        logo: "/logo.png",
        nameEn: "ASMAT HOTEL & RESTAURANT",
        nameUr: "عصمت ہوٹل اینڈ ریسٹورنٹ",
        sloganEn: "KABULI PULAO & HOTEL",
        sloganUr: "کابلی پلاؤ اینڈ ہوٹل",
        phone: "0302-8073204 / 0304-9767017",
        addressEn: "Main G.T. Road, Sarai Naurang, KP, Pakistan",
        addressUr: "مین جی ٹی روڈ، سرائے نورنگ، خیبر پختونخوا",
        email: "info@asmathotel.com",
        descriptionEn: "Serving Authenticity & Comfort Since 1995. Experience the legendary taste of traditional Kabuli Pulao, sizzling Karahis, and premium family dining in Sarai Naurang, KP.",
        descriptionUr: "1995ء سے لذیذ اور معیاری روایتی پکوانوں کی خدمت۔ سرائے نورنگ، خیبر پختونخوا میں روایتی قابلی پلاؤ، کڑاہی اور بہترین فیملی سروس کا لطف اٹھائیں۔"
      };
      localStorage.setItem('asmat_rms_settings', JSON.stringify(defaultSettings));
    }

    const savedOrders = localStorage.getItem('asmat_rms_orders');
    const savedTables = localStorage.getItem('asmat_rms_tables');
    const savedDishes = localStorage.getItem('asmat_rms_dishes');

    if (savedDishes) {
      setDishes(JSON.parse(savedDishes));
    } else {
      setDishes(dishesData);
      localStorage.setItem('asmat_rms_dishes', JSON.stringify(dishesData));
    }

    const savedCategories = localStorage.getItem('asmat_rms_categories');
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      const defaultCategories: Category[] = [
        { id: 'pulao', nameEn: 'Kabuli Pulao', nameUr: 'قابلی پلاؤ' },
        { id: 'pizza', nameEn: 'Pizza', nameUr: 'پیزا' },
        { id: 'bbq', nameEn: 'BBQ', nameUr: 'باربی کیو' },
        { id: 'drinks', nameEn: 'Cold Drinks', nameUr: 'ٹھنڈے مشروبات' },
        { id: 'roti_naan', nameEn: 'Roti & Naan', nameUr: 'روٹی اور نان' }
      ];
      setCategories(defaultCategories);
      localStorage.setItem('asmat_rms_categories', JSON.stringify(defaultCategories));
    }

    if (savedOrders && savedTables) {
      const parsedOrders = JSON.parse(savedOrders) as Order[];
      const has1008 = parsedOrders.some(o => o.orderNumber === 'ORD-1008');
      if (!has1008) {
        const order1008: Order = {
          id: 'ord-1008',
          orderNumber: 'ORD-1008',
          tableNumber: 6,
          waiterName: 'مبشر جلیل',
          customerName: 'احمد',
          items: [
            { dishId: 'dish-1', nameEn: 'Special Kabuli Pulao (Sella Rice & Mutton Shank)', nameUr: 'کابلی پلاؤ', price: 1150, quantity: 1 },
            { dishId: 'dish-naan', nameEn: 'Tandoori Naan', nameUr: 'نان', price: 90, quantity: 2 },
            { dishId: 'dish-9', nameEn: 'Chilled Soft Drinks (Pepsi / Coca-Cola)', nameUr: 'کولڈ ڈرنک', price: 120, quantity: 1 }
          ],
          subtotal: 1450,
          discount: 0,
          discountPercent: 0,
          tax: 0,
          taxPercent: 0,
          grandTotal: 1450,
          status: 'new',
          paymentStatus: 'pending',
          timestamp: new Date().toLocaleString()
        };
        parsedOrders.unshift(order1008);
        localStorage.setItem('asmat_rms_orders', JSON.stringify(parsedOrders));
      }
      const parsedTables = JSON.parse(savedTables) as Table[];
      let updatedTablesNeeded = false;
      for (let num = 1; num <= 20; num++) {
        const hasTable = parsedTables.some(t => t.number === num);
        if (!hasTable) {
          const defaultCapacity = num === 15 ? 12 : (num === 5 || num === 14 || num === 20 ? 8 : (num % 4 === 0 || num % 4 === 3 ? 6 : (num === 6 || num === 16 ? 2 : 4)));
          parsedTables.push({ id: `t${num}`, number: num, status: 'vacant', capacity: defaultCapacity });
          updatedTablesNeeded = true;
        }
      }
      const table6 = parsedTables.find(t => t.number === 6);
      if (table6 && !has1008) {
        table6.status = 'preparing';
        table6.currentOrderId = 'ord-1008';
        updatedTablesNeeded = true;
      }
      if (updatedTablesNeeded) {
        // Sort table list numerically before saving
        parsedTables.sort((a, b) => a.number - b.number);
        localStorage.setItem('asmat_rms_tables', JSON.stringify(parsedTables));
      }
      setOrders(parsedOrders);
      setTables(parsedTables);
      initializeLedgerIfEmpty(parsedOrders);
    } else {
      // Seed default active tables and historical orders
      const seedOrders = getSeedOrders();
      const seedTables = [...defaultTables];
      
      // Mark tables as preparing/ordering for pending seed orders
      const tbl5 = seedTables.find(t => t.number === 5);
      if (tbl5) {
        tbl5.status = 'preparing';
        tbl5.currentOrderId = seedOrders[3].id;
      }
      
      const tbl2 = seedTables.find(t => t.number === 2);
      if (tbl2) {
        tbl2.status = 'preparing';
        tbl2.currentOrderId = seedOrders[4].id;
      }

      const tbl6 = seedTables.find(t => t.number === 6);
      if (tbl6) {
        tbl6.status = 'preparing';
        tbl6.currentOrderId = seedOrders[0].id;
      }

      setOrders(seedOrders);
      setTables(seedTables);

      localStorage.setItem('asmat_rms_orders', JSON.stringify(seedOrders));
      localStorage.setItem('asmat_rms_tables', JSON.stringify(seedTables));
      initializeLedgerIfEmpty(seedOrders);
    }
  }, []);

  // Sync state changes on Dark Mode
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // --- STATE MUTATORS FOR DIRECT INTEGRATION ---

  const handleAddOrder = (newOrder: Order) => {
    setOrders(prev => {
      const updated = [newOrder, ...prev];
      localStorage.setItem('asmat_rms_orders', JSON.stringify(updated));
      return updated;
    });
    // Trigger automatic stock deduction after every order
    deductStockForOrder(newOrder);
    // Record completed item sales
    recordCompletedOrderItems(newOrder);
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => {
      const updated = prev.map(o => {
        if (o.id === orderId) {
          const updatedOrder = { ...o, status };
          recordCompletedOrderItems(updatedOrder);
          return updatedOrder;
        }
        return o;
      });
      localStorage.setItem('asmat_rms_orders', JSON.stringify(updated));
      return updated;
    });
  };

  const handleUpdateOrderPayment = (
    orderId: string, 
    paymentStatus: PaymentStatus, 
    method?: PaymentMethod,
    discountPercent?: number,
    taxPercent?: number
  ) => {
    setOrders(prev => {
      const updated = prev.map(o => {
        if (o.id === orderId) {
          const discPercent = discountPercent !== undefined ? discountPercent : (o.discountPercent || 0);
          const txPercent = taxPercent !== undefined ? taxPercent : (o.taxPercent || 0);
          const calculatedDiscount = Math.round(o.subtotal * (discPercent / 100));
          const remaining = o.subtotal - calculatedDiscount;
          const calculatedTax = Math.round(remaining * (txPercent / 100));
          const calculatedTotal = remaining + calculatedTax;

          const updatedOrder = {
            ...o,
            paymentStatus,
            paymentMethod: method || o.paymentMethod,
            discount: calculatedDiscount,
            discountPercent: discPercent,
            tax: calculatedTax,
            taxPercent: txPercent,
            grandTotal: calculatedTotal,
            status: 'completed' as OrderStatus // Auto mark completed on paid
          };

          recordCompletedOrderItems(updatedOrder);
          return updatedOrder;
        }
        return o;
      });
      localStorage.setItem('asmat_rms_orders', JSON.stringify(updated));
      return updated;
    });
  };

  const handleUpdateTableStatus = (tableId: string, status: TableStatus, currentOrderId?: string) => {
    setTables(prev => {
      const updated = prev.map(t => {
        if (t.id === tableId) {
          return {
            ...t,
            status,
            currentOrderId: currentOrderId || (status === 'vacant' ? undefined : t.currentOrderId)
          };
        }
        return t;
      });
      localStorage.setItem('asmat_rms_tables', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders(prev => {
      const updated = prev.filter(o => o.id !== orderId);
      localStorage.setItem('asmat_rms_orders', JSON.stringify(updated));
      return updated;
    });
    setTimeout(() => {
      window.dispatchEvent(new Event('storage'));
    }, 0);
  };

  const handleAddDish = (newDish: Dish) => {
    setDishes(prev => {
      const updated = [...prev, newDish];
      localStorage.setItem('asmat_rms_dishes', JSON.stringify(updated));
      return updated;
    });
    setTimeout(() => {
      window.dispatchEvent(new Event('storage'));
    }, 0);
  };

  const handleUpdateDish = (updatedDish: Dish) => {
    setDishes(prev => {
      const updated = prev.map(d => d.id === updatedDish.id ? updatedDish : d);
      localStorage.setItem('asmat_rms_dishes', JSON.stringify(updated));
      return updated;
    });
    setTimeout(() => {
      window.dispatchEvent(new Event('storage'));
    }, 0);
  };

  const handleDeleteDish = (dishId: string) => {
    setDishes(prev => {
      const updated = prev.filter(d => d.id !== dishId);
      localStorage.setItem('asmat_rms_dishes', JSON.stringify(updated));
      return updated;
    });
    setTimeout(() => {
      window.dispatchEvent(new Event('storage'));
    }, 0);
  };

  const handleAddCategory = (newCat: Category) => {
    setCategories(prev => {
      const updated = [...prev, newCat];
      localStorage.setItem('asmat_rms_categories', JSON.stringify(updated));
      return updated;
    });
    setTimeout(() => {
      window.dispatchEvent(new Event('storage'));
    }, 0);
  };

  const handleUpdateCategory = (updatedCat: Category) => {
    setCategories(prev => {
      const updated = prev.map(c => c.id === updatedCat.id ? updatedCat : c);
      localStorage.setItem('asmat_rms_categories', JSON.stringify(updated));
      return updated;
    });
    setTimeout(() => {
      window.dispatchEvent(new Event('storage'));
    }, 0);
  };

  const handleDeleteCategory = (catId: string) => {
    setCategories(prev => {
      const updated = prev.filter(c => c.id !== catId);
      localStorage.setItem('asmat_rms_categories', JSON.stringify(updated));
      return updated;
    });
    setTimeout(() => {
      window.dispatchEvent(new Event('storage'));
    }, 0);
  };

  const handleResetDemoData = () => {
    localStorage.removeItem('asmat_rms_orders');
    localStorage.removeItem('asmat_rms_tables');
    localStorage.removeItem('asmat_rms_dishes');
    localStorage.removeItem('asmat_rms_categories');
    localStorage.removeItem('asmat_rms_product_sales_ledger');

    const seedOrders = getSeedOrders();
    const seedTables = defaultTables.map(t => ({ ...t, status: 'vacant' as TableStatus, currentOrderId: undefined }));

    seedTables.find(t => t.number === 5)!.status = 'preparing';
    seedTables.find(t => t.number === 5)!.currentOrderId = seedOrders[2].id;
    seedTables.find(t => t.number === 2)!.status = 'preparing';
    seedTables.find(t => t.number === 2)!.currentOrderId = seedOrders[3].id;

    const defaultCategories: Category[] = [
      { id: 'pulao', nameEn: 'Kabuli Pulao', nameUr: 'قابلی پلاؤ' },
      { id: 'pizza', nameEn: 'Pizza', nameUr: 'پیزا' },
      { id: 'bbq', nameEn: 'BBQ', nameUr: 'باربی کیو' },
      { id: 'drinks', nameEn: 'Cold Drinks', nameUr: 'ٹھنڈے مشروبات' },
      { id: 'roti_naan', nameEn: 'Roti & Naan', nameUr: 'روٹی اور نان' }
    ];

    setOrders(seedOrders);
    setTables(seedTables);
    setDishes(dishesData);
    setCategories(defaultCategories);

    localStorage.setItem('asmat_rms_orders', JSON.stringify(seedOrders));
    localStorage.setItem('asmat_rms_tables', JSON.stringify(seedTables));
    localStorage.setItem('asmat_rms_dishes', JSON.stringify(dishesData));
    localStorage.setItem('asmat_rms_categories', JSON.stringify(defaultCategories));
    initializeLedgerIfEmpty(seedOrders);

    alert(language === 'ur' ? "سسٹم کا ڈیٹا دوبارہ ترتیب دے دیا گیا ہے!" : "Demo data has been successfully restored!");
  };

  const handleOpenReservation = () => {
    setIsReservationOpen(true);
  };

  const isUrdu = language === 'ur';

  return (
    <div 
      id="root-viewport-wrapper" 
      className="min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-300 pb-20"
      lang={language}
    >
      {/* Header Sticky Navigation */}
      <Navbar
        language={language}
        setLanguage={setLanguage}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenReservation={handleOpenReservation}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Main Render Stream */}
      <main id="main-content-stream" className="pt-20">
        {viewMode === 'customer' ? (
          <>
            {/* Full-screen Hero Section */}
            <Hero language={language} onOpenReservation={handleOpenReservation} />

            {/* Legacy Story Section */}
            <About language={language} />

            {/* Traditional & Western Menu */}
            <FeaturedDishes 
              language={language} 
              dishes={dishes}
              categories={categories}
            />

            {/* Immersive Photo Gallery */}
            <Gallery language={language} />

            {/* Verified Patron Testimonials */}
            <Reviews language={language} />

            {/* Contact Info & Vector Route Map */}
            <Contact language={language} />

            {/* Footer Details */}
            <Footer 
              language={language} 
              onOpenRms={() => {
                setViewMode('rms');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </>
        ) : !isRmsAuthenticated ? (
          <RmsLogin
            language={language}
            onSuccess={(role) => {
              setIsRmsAuthenticated(true);
              setRmsUserRole(role || 'admin');
            }}
            onCancel={() => setViewMode('customer')}
          />
        ) : (
          /* POINT OF SALE & RESTAURANT MANAGEMENT DASHBOARD */
          <RmsDashboard
            language={language}
            userRole={rmsUserRole}
            dishes={dishes}
            onAddDish={handleAddDish}
            onUpdateDish={handleUpdateDish}
            onDeleteDish={handleDeleteDish}
            categories={categories}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            tables={tables}
            orders={orders}
            onAddOrder={handleAddOrder}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdateOrderPayment={handleUpdateOrderPayment}
            onUpdateTableStatus={handleUpdateTableStatus}
            onResetDemoData={handleResetDemoData}
            onDeleteOrder={handleDeleteOrder}
          />
        )}
      </main>

      {/* MODALS PERSISTENCE LAYER */}
      <ReservationModal
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        language={language}
      />
    </div>
  );
}
