/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'en' | 'ur';

export interface Translation {
  // Navigation
  home: string;
  about: string;
  menu: string;
  rms: string;
  gallery: string;
  contact: string;
  comingSoon: string;
  reserveTable: string;

  // Hero
  heroWelcome: string;
  heroTitle: string;
  heroSubheading: string;
  viewMenuBtn: string;
  reserveTableBtn: string;

  // About
  aboutTitle: string;
  aboutSubtitle: string;
  aboutP1: string;
  aboutP2: string;
  aboutP3: string;
  aboutStatExperience: string;
  aboutStatExperienceLabel: string;
  aboutStatDishes: string;
  aboutStatDishesLabel: string;
  aboutStatGuests: string;
  aboutStatGuestsLabel: string;

  // Dishes / Menu
  menuTitle: string;
  menuSubtitle: string;
  allCategories: string;
  pulaoCategory: string;
  karahiCategory: string;
  bbqCategory: string;
  fastFoodCategory: string;
  teaCategory: string;
  priceSymbol: string;
  viewFullMenu: string;

  // Gallery
  galleryTitle: string;
  gallerySubtitle: string;
  galleryAll: string;
  galleryFood: string;
  galleryDining: string;

  // Testimonials
  reviewsTitle: string;
  reviewsSubtitle: string;
  verifiedGuest: string;
  addReviewBtn: string;
  namePlaceholder: string;
  ratingLabel: string;
  reviewPlaceholder: string;
  submitReview: string;
  reviewSuccess: string;

  // Contact
  contactTitle: string;
  contactSubtitle: string;
  businessName: string;
  locationLabel: string;
  locationValue: string;
  phoneLabel: string;
  hoursLabel: string;
  hoursValue: string;
  sendMessageBtn: string;
  callNowBtn: string;
  whatsappChatBtn: string;
  formName: string;
  formPhone: string;
  formMessage: string;
  formSuccess: string;

  // Reservation Modal
  reservationTitle: string;
  resGuests: string;
  resDate: string;
  resTime: string;
  resNotes: string;
  resSubmit: string;
  resSuccess: string;
}

export interface DishSize {
  name: string; // e.g., 'Small', 'Medium', 'Large', 'X-Large'
  price: number;
}

export interface Dish {
  id: string;
  nameEn: string;
  nameUr: string;
  descriptionEn: string;
  descriptionUr: string;
  price: number; // base price (or Small price)
  discountPrice?: number; // Optional discount price
  category: string; // 'pulao' | 'pizza' | 'bbq' | 'karahi' | 'fastfood' | 'drinks' | 'tea' or string
  image: string;
  isFeatured: boolean;
  tagEn?: string;
  tagUr?: string;
  isAvailable?: boolean; // Available vs Out of Stock
  sizes?: DishSize[]; // Multi-size support (e.g., Pizza)
}

export interface Category {
  id: string;
  nameEn: string;
  nameUr: string;
}

export interface Testimonial {
  id: string;
  nameEn: string;
  nameUr: string;
  rating: number;
  textEn: string;
  textUr: string;
  date: string;
  roleEn: string;
  roleUr: string;
}

export interface GalleryItem {
  id: string;
  titleEn: string;
  titleUr: string;
  category: 'food' | 'dining';
  image: string;
}

// RESTAURANT MANAGEMENT SYSTEM (RMS) ENTITIES

export type TableStatus = 'vacant' | 'occupied' | 'ordering' | 'preparing' | 'ready' | 'served' | 'bill-requested';

export interface Table {
  id: string;
  number: number;
  status: TableStatus;
  capacity: number;
  currentOrderId?: string;
}

export type OrderStatus = 'new' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';

export type PaymentStatus = 'pending' | 'paid';

export type PaymentMethod = 'cash' | 'card' | 'easypaisa' | 'jazzcash';

export interface OrderItem {
  dishId: string;
  nameEn: string;
  nameUr: string;
  price: number;
  quantity: number;
  notes?: string;
  image?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  tableNumber: number;
  waiterName?: string;
  customerName?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number; // percentage or fixed amount, we'll store final calculated discount value
  discountPercent?: number; // raw input percentage
  tax: number; // calculated GST value
  taxPercent?: number; // raw input percentage
  grandTotal: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  timestamp: string; // ISO or human-readable format
  notes?: string;
}

export interface Waiter {
  id: string;
  nameEn: string;
  nameUr: string;
  phone: string;
}

// --- NEW COMPREHENSIVE RMS TYPES ---

export interface InventoryItem {
  id: string;
  nameEn: string;
  nameUr: string;
  sku: string;
  stock: number;
  minStock: number; // Low stock alert threshold
  unit: string; // e.g. "kg", "liters", "units", "bags"
  category: string; // e.g. "Meat", "Spices", "Rice", "Beverages", "Dairy"
  supplierId: string;
  lastUpdated: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
}

export interface PurchaseRecord {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  costPrice: number;
  totalCost: number;
  type: 'stock-in' | 'stock-out';
  date: string;
  supplierName?: string;
  notes?: string;
}

export interface ExpenseRecord {
  id: string;
  description: string;
  amount: number;
  category: 'Salaries' | 'Rent' | 'Utilities' | 'Ingredients' | 'Marketing' | 'Maintenance' | 'Other';
  date: string;
  notes?: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  notes?: string;
}

export type StaffRole = 'admin' | 'manager' | 'cashier' | 'waiter' | 'kitchen';

export interface StaffMember {
  id: string;
  nameEn: string;
  nameUr: string;
  role: StaffRole;
  phone: string;
  pin: string; // 4-digit PIN for login
  status: 'active' | 'inactive';
  assignedTables?: number[]; // waiter assigned table numbers
  assignedSection?: string; // e.g. "Main Hall", "BBQ", "Tandoor", "Pulao Station"
  joinedDate: string;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffNameEn: string;
  staffNameUr: string;
  role: StaffRole;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'late' | 'half-day';
  checkIn?: string; // HH:MM AM/PM
  checkOut?: string; // HH:MM AM/PM
  notes?: string;
}


