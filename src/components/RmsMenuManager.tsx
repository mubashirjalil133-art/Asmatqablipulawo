/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, Edit2, Trash2, Search, CheckCircle, XCircle, Tag, Layers, 
  DollarSign, Image as ImageIcon, Eye, EyeOff, Sparkles, Check, AlertTriangle
} from 'lucide-react';
import { Language, Dish, DishSize, Category } from '../types';

interface RmsMenuManagerProps {
  language: Language;
  dishes: Dish[];
  onAddDish: (dish: Dish) => void;
  onUpdateDish: (dish: Dish) => void;
  onDeleteDish: (dishId: string) => void;
  categories: Category[];
  onAddCategory: (category: Category) => void;
  onUpdateCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
}

// Beautiful stock images for quick selection so the admin doesn't need to hunt for URLs
const PRESET_IMAGES = [
  { labelEn: "Kabuli Pulao", labelUr: "قابلی پلاؤ", url: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80" },
  { labelEn: "BBQ Tikka", labelUr: "چکن تکہ", url: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=800&q=80" },
  { labelEn: "Mutton Karahi", labelUr: "مٹن کڑاہی", url: "https://images.unsplash.com/photo-1601356616077-695728ecf769?auto=format&fit=crop&w=800&q=80" },
  { labelEn: "Pizza Point", labelUr: "پیزا", url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80" },
  { labelEn: "Zinger Burger", labelUr: "زنگر برگر", url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80" },
  { labelEn: "French Fries", labelUr: "فرنچ فرائز", url: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80" },
  { labelEn: "Soft Drink", labelUr: "سافٹ ڈرنک", url: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80" },
  { labelEn: "Sweet Lassi", labelUr: "میٹھی لسی", url: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80" },
  { labelEn: "Zafrani Chai", labelUr: "زعفرانی چائے", url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80" },
  { labelEn: "Green Qahwa", labelUr: "پشاوری قہوہ", url: "https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?auto=format&fit=crop&w=800&q=80" }
];

export default function RmsMenuManager({
  language,
  dishes,
  onAddDish,
  onUpdateDish,
  onDeleteDish,
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory
}: RmsMenuManagerProps) {
  const isUrdu = language === 'ur';

  // Navigation & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);

  // Form fields
  const [foodName, setFoodName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [image, setImage] = useState('');

  // Category Manager State
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [newCatNameUr, setNewCatNameUr] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  const formattedCategories = categories.map(cat => ({
    id: cat.id,
    label: isUrdu ? cat.nameUr : cat.nameEn
  }));

  const allCategoryOptions = [
    { id: 'all', label: isUrdu ? 'تمام کیٹیگریز' : 'All Categories' },
    ...formattedCategories
  ];

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatNameEn.trim() || !newCatNameUr.trim()) {
      alert(isUrdu ? "برائے مہربانی انگریزی اور اردو دونوں نام درج کریں!" : "Please provide names in both English and Urdu!");
      return;
    }

    if (editingCatId) {
      onUpdateCategory({
        id: editingCatId,
        nameEn: newCatNameEn.trim(),
        nameUr: newCatNameUr.trim()
      });
      setEditingCatId(null);
    } else {
      const generatedId = newCatNameEn.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_');
      const finalId = categories.some(c => c.id === generatedId)
        ? `${generatedId}_${Date.now()}`
        : generatedId;
      onAddCategory({
        id: finalId,
        nameEn: newCatNameEn.trim(),
        nameUr: newCatNameUr.trim()
      });
    }

    setNewCatNameEn('');
    setNewCatNameUr('');
  };

  const handleEditCategory = (cat: Category) => {
    setEditingCatId(cat.id);
    setNewCatNameEn(cat.nameEn);
    setNewCatNameUr(cat.nameUr);
  };

  const handleDeleteCategoryClick = (catId: string, name: string) => {
    const confirmMsg = isUrdu
      ? `کیا آپ واقعی کیٹیگری "${name}" کو حذف کرنا چاہتے ہیں؟ اس کیٹیگری کے پکوان حذف نہیں ہوں گے مگر وہ کیٹیگری سے محروم ہو جائیں گے۔`
      : `Are you sure you want to delete the category "${name}"? Dishes in this category will not be deleted but they will lose their category association.`;
    if (confirm(confirmMsg)) {
      onDeleteCategory(catId);
      if (selectedCategory === catId) {
        setSelectedCategory('all');
      }
    }
  };

  const handleOpenAdd = () => {
    setEditingDish(null);
    setFoodName('');
    setCategory('');
    setPrice(350);
    setImage(PRESET_IMAGES[0].url);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (dish: Dish) => {
    setEditingDish(dish);
    setFoodName(dish.nameEn || dish.nameUr || '');
    
    const catObj = categories.find(c => c.id === dish.category);
    setCategory(catObj ? (isUrdu ? catObj.nameUr : catObj.nameEn) : dish.category);
    
    setPrice(dish.price);
    setImage(dish.image);
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!foodName.trim()) {
      alert(isUrdu ? "برائے مہربانی پکوان کا نام درج کریں!" : "Please provide a Food Name!");
      return;
    }

    if (!category.trim()) {
      alert(isUrdu ? "برائے مہربانی کیٹیگری درج کریں!" : "Please provide a Category!");
      return;
    }

    const typedCategoryName = category.trim();
    const generateSlug = (text: string) => {
      return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_') || 'custom';
    };
    const slug = generateSlug(typedCategoryName);
    
    const existingCat = categories.find(c => 
      c.id === slug ||
      c.nameEn.toLowerCase() === typedCategoryName.toLowerCase() ||
      c.nameUr.toLowerCase() === typedCategoryName.toLowerCase()
    );

    let finalCategoryId = slug;
    if (existingCat) {
      finalCategoryId = existingCat.id;
    } else {
      onAddCategory({
        id: slug,
        nameEn: typedCategoryName,
        nameUr: typedCategoryName
      });
    }

    const dishData: Dish = {
      id: editingDish ? editingDish.id : `dish-${Date.now()}`,
      nameEn: foodName.trim(),
      nameUr: foodName.trim(),
      descriptionEn: editingDish ? editingDish.descriptionEn : "",
      descriptionUr: editingDish ? editingDish.descriptionUr : "",
      price: Number(price),
      discountPrice: editingDish ? editingDish.discountPrice : undefined,
      category: finalCategoryId,
      image: image || PRESET_IMAGES[0].url,
      isFeatured: editingDish ? editingDish.isFeatured : false,
      tagEn: editingDish ? editingDish.tagEn : undefined,
      tagUr: editingDish ? editingDish.tagUr : undefined,
      isAvailable: editingDish ? (editingDish.isAvailable !== false) : true,
      sizes: editingDish ? editingDish.sizes : undefined
    };

    if (editingDish) {
      onUpdateDish(dishData);
    } else {
      onAddDish(dishData);
    }

    setIsFormOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    const confirmMsg = isUrdu 
      ? `کیا آپ واقعی "${name}" کو مینو سے حذف کرنا چاہتے ہیں؟`
      : `Are you sure you want to delete "${name}" from the menu?`;
    if (confirm(confirmMsg)) {
      onDeleteDish(id);
    }
  };

  const toggleAvailability = (dish: Dish) => {
    const updatedDish: Dish = {
      ...dish,
      isAvailable: dish.isAvailable === false ? true : false
    };
    onUpdateDish(updatedDish);
  };

  const filteredDishes = dishes.filter(dish => {
    const matchesSearch = 
      dish.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dish.nameUr.includes(searchTerm) ||
      dish.descriptionEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dish.descriptionUr.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || dish.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Controls: Search, Category, and Add Button */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-150 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className={`absolute top-2.5 ${isUrdu ? 'right-3' : 'left-3'} h-4 w-4 text-stone-400`} />
            <input
              type="text"
              placeholder={isUrdu ? "مینو میں تلاش کریں..." : "Search menu items..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 py-2 ${isUrdu ? 'pr-9 pl-4 text-right' : 'pl-9 pr-4 text-left'} text-xs outline-none focus:border-amber-500`}
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-48 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 py-2 px-3 text-xs outline-none focus:border-amber-500"
          >
            {allCategoryOptions.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Manage Categories Button */}
          <button
            type="button"
            onClick={() => setIsCategoryManagerOpen(true)}
            className="w-full sm:w-auto rounded-xl border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-850 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Layers className="h-4 w-4 text-amber-500" />
            <span>{isUrdu ? "کیٹیگریز مینیج کریں" : "Manage Categories"}</span>
          </button>

          {/* Add Button */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-red-800 to-red-900 border border-amber-400/20 text-white px-4 py-2.5 text-xs font-black shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>{isUrdu ? "نیا پکوان شامل کریں" : "Add New Dish"}</span>
          </button>
        </div>
      </div>

      {/* Main Dishes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDishes.length === 0 ? (
          <div className="col-span-full py-16 text-center border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl bg-white dark:bg-stone-900 text-stone-400">
            <Layers className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-bold">
              {isUrdu ? "کوئی آئٹم نہیں ملا" : "No menu items match your search criteria."}
            </p>
          </div>
        ) : (
          filteredDishes.map((dish) => {
            const hasSizesConfig = dish.sizes && dish.sizes.length > 0;
            return (
              <div
                key={dish.id}
                className={`group rounded-2xl border ${dish.isAvailable === false ? 'border-stone-200 bg-stone-100/50 dark:border-stone-850 dark:bg-stone-950/20 opacity-75' : 'border-stone-150 bg-white dark:border-stone-800 dark:bg-stone-950/40'} overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 relative flex flex-col justify-between`}
              >
                {/* Visual Status Badges */}
                <div className="absolute top-3 left-3 z-10 flex gap-1.5">
                  {dish.isAvailable === false && (
                    <span className="rounded-full bg-red-600 text-white text-[9px] font-black px-2.5 py-1 shadow-md uppercase tracking-wide">
                      {isUrdu ? "دستیاب نہیں" : "Out of Stock"}
                    </span>
                  )}
                  {dish.isFeatured && (
                    <span className="rounded-full bg-amber-500 text-stone-950 text-[9px] font-black px-2.5 py-1 shadow-md uppercase tracking-wide flex items-center gap-0.5">
                      <Sparkles className="h-2.5 w-2.5" />
                      {isUrdu ? "خصوصی" : "Featured"}
                    </span>
                  )}
                </div>

                {/* Header Image */}
                <div className="aspect-[16/10] w-full overflow-hidden bg-stone-100 dark:bg-stone-900 relative">
                  <img
                    src={dish.image}
                    alt={dish.nameEn}
                    className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${dish.isAvailable === false ? 'grayscale opacity-50' : ''}`}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-stone-950/20" />
                </div>

                {/* Details */}
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    {/* Category Label */}
                    <span className="text-[9px] font-extrabold text-red-800 dark:text-amber-500 uppercase tracking-widest block mb-1">
                      {formattedCategories.find(c => c.id === dish.category)?.label || dish.category}
                    </span>

                    {/* Urdu & English Titles */}
                    <h3 className="text-sm font-black text-stone-900 dark:text-white leading-snug">
                      {dish.nameUr}
                    </h3>
                    <h4 className="text-xs font-bold text-stone-600 dark:text-stone-300 leading-snug mt-0.5">
                      {dish.nameEn}
                    </h4>

                    {/* Description */}
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-2 line-clamp-2 leading-relaxed">
                      {isUrdu ? dish.descriptionUr : dish.descriptionEn}
                    </p>

                    {/* Sizes Detail if configured */}
                    {hasSizesConfig && dish.sizes && (
                      <div className="mt-3 p-2 rounded-xl bg-stone-100 dark:bg-stone-900/50 border border-stone-200/40 dark:border-stone-850 space-y-1">
                        <span className="text-[9px] font-extrabold text-stone-400 block uppercase">
                          {isUrdu ? "سائز پرائزنگ:" : "Size Pricing:"}
                        </span>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] font-mono">
                          {dish.sizes.map(sz => (
                            <div key={sz.name} className="flex justify-between border-b border-stone-200/30 pb-0.5 last:border-0 text-stone-600 dark:text-stone-400">
                              <span>{sz.name}:</span>
                              <span className="font-bold text-red-800 dark:text-amber-400">Rs.{sz.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-900/60 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-stone-400 uppercase tracking-wide block font-extrabold">
                        {isUrdu ? "بنیادی قیمت" : "Base Price"}
                      </span>
                      <span className="text-sm font-extrabold text-red-800 dark:text-amber-400 font-mono">
                        Rs.{dish.price}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Availability Toggle */}
                      <button
                        onClick={() => toggleAvailability(dish)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          dish.isAvailable !== false
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                            : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100'
                        }`}
                        title={dish.isAvailable !== false ? (isUrdu ? "آؤٹ آف اسٹاک کریں" : "Set Out of Stock") : (isUrdu ? "دستیاب کریں" : "Set Available")}
                      >
                        {dish.isAvailable !== false ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEdit(dish)}
                        className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:border-amber-500 hover:text-amber-500 transition-colors cursor-pointer"
                        title={isUrdu ? "تبدیل کریں" : "Edit Item"}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(dish.id, isUrdu ? dish.nameUr : dish.nameEn)}
                        className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-400 hover:border-red-500 hover:text-red-500 transition-colors cursor-pointer"
                        title={isUrdu ? "حذف کریں" : "Delete Item"}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Slide-over Form Overlay Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />

          <div 
            className="relative w-full max-w-2xl bg-white dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scale-up"
            style={{ direction: isUrdu ? 'rtl' : 'ltr' }}
          >
            {/* Header */}
            <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/30">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-black text-stone-950 dark:text-white">
                  {editingDish 
                    ? (isUrdu ? `پکوان تبدیل کریں: ${editingDish.nameUr}` : `Edit Dish: ${editingDish.nameEn}`)
                    : (isUrdu ? "نیا لذیذ پکوان مینو میں شامل کریں" : "Add New Delicious Dish")
                  }
                </h3>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-400 hover:text-stone-700 dark:hover:text-white transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Body Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Food Name Field */}
              <div>
                <label className="block text-[11px] font-extrabold text-stone-500 uppercase mb-1">
                  {isUrdu ? "پکوان کا نام *" : "Food Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder={isUrdu ? "مثلاً چکن کڑاہی" : "e.g. Chicken Karahi"}
                  className="w-full rounded-xl border border-stone-200 dark:border-stone-850 bg-stone-50 dark:bg-stone-900 py-2.5 px-3 text-xs outline-none focus:border-amber-500 font-sans"
                />
              </div>

              {/* Category & Price Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-stone-500 uppercase mb-1">
                    {isUrdu ? "کیٹیگری *" : "Category *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder={isUrdu ? "مثلاً کڑاہی، پیزا، برگر، مشروبات" : "e.g. Karahi, Pizza, Burger, Drinks"}
                    className="w-full rounded-xl border border-stone-200 dark:border-stone-850 bg-stone-50 dark:bg-stone-900 py-2.5 px-3 text-xs outline-none focus:border-amber-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-stone-500 uppercase mb-1">
                    {isUrdu ? "قیمت (Rs) *" : "Price (Rs) *"}
                  </label>
                  <div className="relative">
                    <span className={`absolute inset-y-0 ${isUrdu ? 'left-3' : 'right-3'} flex items-center text-xs font-bold text-stone-400 font-mono`}>Rs</span>
                    <input
                      type="number"
                      required
                      min={0}
                      value={price || ''}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      placeholder="e.g. 650"
                      className="w-full rounded-xl border border-stone-200 dark:border-stone-850 bg-stone-50 dark:bg-stone-900 py-2.5 px-3 text-xs outline-none focus:border-amber-500 font-mono text-left"
                    />
                  </div>
                </div>
              </div>

              {/* Image Selection Section */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* File Upload Option */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-stone-500 uppercase mb-1">
                      {isUrdu ? "تصویر اپ لوڈ کریں (Upload Local Image)" : "Upload Local Image"}
                    </label>
                    <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-stone-200 dark:border-stone-850 hover:border-amber-500 dark:hover:border-amber-500 rounded-xl p-3 bg-stone-50 dark:bg-stone-900/50 transition-colors cursor-pointer min-h-[90px]">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                setImage(reader.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <ImageIcon className="h-5 w-5 text-stone-400 mb-1" />
                      <span className="text-[10px] font-bold text-stone-600 dark:text-stone-300">
                        {isUrdu ? "تصویر منتخب کریں" : "Choose Image File"}
                      </span>
                      <span className="text-[8px] text-stone-400">
                        {isUrdu ? "یا یہاں ڈریگ کریں" : "or drag and drop here"}
                      </span>
                    </div>
                  </div>

                  {/* URL / Preview Option */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-extrabold text-stone-500 uppercase mb-1">
                      {isUrdu ? "یا تصویر کا یو آر ایل درج کریں" : "Or Enter Image URL"}
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-stone-400"><ImageIcon className="h-4 w-4" /></span>
                      <input
                        type="url"
                        value={image && !image.startsWith('data:') ? image : ''}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full rounded-xl border border-stone-200 dark:border-stone-850 bg-stone-50 dark:bg-stone-900 py-2.5 pl-9 pr-3 text-xs outline-none focus:border-amber-500 text-left font-mono"
                      />
                    </div>
                    {image && (
                      <div className="flex items-center gap-2 bg-stone-50 dark:bg-stone-900 p-1.5 rounded-lg border border-stone-200/50 dark:border-stone-850">
                        <img 
                          src={image} 
                          alt="Preview" 
                          className="h-8 w-12 object-cover rounded border border-stone-200 dark:border-stone-800"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-[9px] font-bold text-stone-500 truncate flex-1">
                          {image.startsWith('data:') ? (isUrdu ? "لوکل تصویر منتخب ہے" : "Local uploaded image") : image}
                        </span>
                        <button
                          type="button"
                          onClick={() => setImage('')}
                          className="p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-800 text-red-600 cursor-pointer"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Presets Selection */}
                <div>
                  <span className="block text-[9px] font-extrabold text-stone-400 dark:text-stone-500 uppercase mb-1.5">
                    {isUrdu ? "فوری خوبصورت تصویر کا انتخاب کریں:" : "Choose from preset gorgeous visuals:"}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_IMAGES.map((preset) => (
                      <button
                        type="button"
                        key={preset.labelEn}
                        onClick={() => setImage(preset.url)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                          image === preset.url
                            ? 'bg-amber-500/10 border-amber-500 text-amber-500 font-extrabold'
                            : 'bg-transparent border-stone-200 dark:border-stone-850 text-stone-500 hover:border-stone-400'
                        }`}
                      >
                        {preset.url === image && <Check className="h-3 w-3" />}
                        <span>{isUrdu ? preset.labelUr : preset.labelEn}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-stone-50 dark:bg-stone-900/30 rounded-2xl border border-stone-150 dark:border-stone-850/60 flex items-center justify-end gap-3 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 px-4 py-2 text-xs font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900 cursor-pointer"
                >
                  {isUrdu ? "منسوخ کریں" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-red-800 to-red-900 border border-amber-400/25 px-5 py-2 text-xs font-black text-white shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  {isUrdu ? "محفوظ کریں" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {isCategoryManagerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={() => {
            setIsCategoryManagerOpen(false);
            setEditingCatId(null);
            setNewCatNameEn('');
            setNewCatNameUr('');
          }} />

          <div 
            className="relative w-full max-w-lg bg-white dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-scale-up"
            style={{ direction: isUrdu ? 'rtl' : 'ltr' }}
          >
            {/* Header */}
            <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/30">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-black text-stone-950 dark:text-white">
                  {isUrdu ? "کیٹیگریز کی تفصیل اور انتظام" : "Manage Menu Categories"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCategoryManagerOpen(false);
                  setEditingCatId(null);
                  setNewCatNameEn('');
                  setNewCatNameUr('');
                }}
                className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-400 hover:text-stone-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Category Add/Edit Form Section */}
              <form onSubmit={handleSaveCategory} className="bg-stone-50 dark:bg-stone-900/40 border border-stone-150 dark:border-stone-850 p-4 rounded-2xl space-y-4">
                <h4 className="text-xs font-black text-stone-800 dark:text-amber-500 uppercase">
                  {editingCatId ? (isUrdu ? "کیٹیگری تبدیل کریں" : "Edit Category") : (isUrdu ? "نئی کیٹیگری شامل کریں" : "Add New Category")}
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-extrabold text-stone-500 uppercase mb-1">
                      {isUrdu ? "نام (اردو) *" : "Name (Urdu) *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={newCatNameUr}
                      onChange={(e) => setNewCatNameUr(e.target.value)}
                      placeholder="مثلاً کڑاہی"
                      className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 py-2 px-3 text-xs outline-none focus:border-amber-500 text-right font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-stone-500 uppercase mb-1">
                      {isUrdu ? "نام (انگریزی) *" : "Name (English) *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={newCatNameEn}
                      onChange={(e) => setNewCatNameEn(e.target.value)}
                      placeholder="e.g. Karahi"
                      className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 py-2 px-3 text-xs outline-none focus:border-amber-500 text-left"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  {editingCatId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCatId(null);
                        setNewCatNameEn('');
                        setNewCatNameUr('');
                      }}
                      className="rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 px-3 py-1.5 text-[11px] font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-50 cursor-pointer"
                    >
                      {isUrdu ? "منسوخ" : "Cancel"}
                    </button>
                  )}
                  <button
                    type="submit"
                    className="rounded-lg bg-gradient-to-r from-red-800 to-red-900 border border-amber-400/25 px-4 py-1.5 text-[11px] font-black text-white shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    {editingCatId ? (isUrdu ? "تبدیل کریں" : "Update") : (isUrdu ? "شامل کریں" : "Add Category")}
                  </button>
                </div>
              </form>

              {/* List of Existing Categories */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-black text-stone-500 uppercase tracking-wider">
                  {isUrdu ? "موجودہ فعال کیٹیگریز" : "Existing Categories"}
                </h4>

                <div className="divide-y divide-stone-100 dark:divide-stone-900 border border-stone-150 dark:border-stone-800 rounded-2xl bg-white dark:bg-stone-950/60 overflow-hidden">
                  {categories.map((cat) => (
                    <div key={cat.id} className="p-3.5 flex items-center justify-between hover:bg-stone-50/50 dark:hover:bg-stone-900/20 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-stone-900 dark:text-white">{cat.nameUr}</span>
                          <span className="text-stone-300 dark:text-stone-700">•</span>
                          <span className="text-xs font-bold text-stone-600 dark:text-stone-300">{cat.nameEn}</span>
                        </div>
                        <span className="text-[10px] text-stone-400 font-mono block mt-0.5">ID: {cat.id}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEditCategory(cat)}
                          className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-850 text-stone-600 dark:text-stone-400 hover:text-amber-500 hover:border-amber-500 transition-colors cursor-pointer"
                          title={isUrdu ? "تبدیل کریں" : "Edit"}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategoryClick(cat.id, isUrdu ? cat.nameUr : cat.nameEn)}
                          className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-850 text-stone-450 hover:text-red-500 hover:border-red-500 transition-colors cursor-pointer"
                          title={isUrdu ? "حذف کریں" : "Delete"}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
