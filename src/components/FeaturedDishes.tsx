/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, Translation, Dish, Category } from '../types';
import { translations } from '../data';

interface FeaturedDishesProps {
  language: Language;
  dishes: Dish[];
  categories: Category[];
}

export default function FeaturedDishes({
  language,
  dishes,
  categories,
}: FeaturedDishesProps) {
  const t: Translation = translations[language];
  const isUrdu = language === 'ur';

  const computedCategories = [
    { id: 'all', label: isUrdu ? 'تمام پکوان' : 'All Specialties' },
    ...categories.map(cat => ({
      id: cat.id,
      label: isUrdu ? cat.nameUr : cat.nameEn
    }))
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');

  // Selected sizes state
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  const getSelectedSizeName = (dish: Dish) => {
    if (!dish.sizes || dish.sizes.length === 0) return undefined;
    return selectedSizes[dish.id] || dish.sizes[0].name;
  };

  const getDishPrice = (dish: Dish) => {
    if (!dish.sizes || dish.sizes.length === 0) {
      return dish.discountPrice !== undefined ? dish.discountPrice : dish.price;
    }
    const selectedSizeName = getSelectedSizeName(dish);
    const size = dish.sizes.find(s => s.name === selectedSizeName);
    return size ? size.price : dish.price;
  };

  const filteredDishes = selectedCategory === 'all'
    ? dishes
    : dishes.filter(d => d.category === selectedCategory);

  return (
    <section
      id="menu-dishes-section"
      className="relative bg-white py-20 dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-500">
            {isUrdu ? 'ذیقہِ خاص' : 'Premium Selection'}
          </span>
          <h2 
            className={`mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 dark:text-white leading-tight ${
              isUrdu ? 'font-sans' : 'font-serif'
            }`}
          >
            {t.menuTitle}
          </h2>
          <div className="mt-3 h-1 w-16 bg-red-800 rounded mx-auto" />
          <p className="mt-4 text-stone-500 dark:text-stone-400 text-sm sm:text-base leading-relaxed">
            {t.menuSubtitle}
          </p>
        </div>

        {/* Category Tabs Grid */}
        <div className="flex justify-center flex-wrap gap-2 mb-10 border-b border-stone-100 dark:border-stone-800 pb-4 max-w-4xl mx-auto">
          {computedCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-full px-4 py-2 text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-red-800 to-red-900 text-white shadow-md border border-amber-500/20'
                  : 'border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/50'
              } ${isUrdu ? 'font-sans' : ''}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Food Menu Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredDishes.map((dish) => {
              const isOutOfStock = dish.isAvailable === false;
              const currentPrice = getDishPrice(dish);
              const selectedSizeName = getSelectedSizeName(dish);

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  key={dish.id}
                  className={`group flex flex-col rounded-2xl border ${
                    isOutOfStock 
                      ? 'border-stone-200 bg-stone-100/50 dark:border-stone-850 dark:bg-stone-950/20 opacity-70' 
                      : 'border-stone-150 bg-stone-50 dark:border-stone-800 dark:bg-stone-950/40'
                  } overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative`}
                  style={{ direction: isUrdu ? 'rtl' : 'ltr' }}
                >
                  {/* Special Tag badge */}
                  {((dish.tagEn && dish.tagUr) || isOutOfStock) && (
                    <div className={`absolute top-3 ${isUrdu ? 'right-3' : 'left-3'} z-10 flex flex-col gap-1.5`}>
                      {isOutOfStock ? (
                        <span className="rounded-full bg-red-600 text-white text-[9px] font-black px-2.5 py-1 uppercase shadow-md tracking-wider">
                          {isUrdu ? 'دستیاب نہیں' : 'Out of Stock'}
                        </span>
                      ) : (
                        <span className="rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 text-[10px] font-extrabold px-3 py-1 uppercase shadow-md tracking-wider">
                          {isUrdu ? dish.tagUr : dish.tagEn}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Card Thumbnail Image */}
                  <div className="aspect-[4/3] w-full overflow-hidden bg-stone-100 dark:bg-stone-900 relative">
                    <img
                      src={dish.image}
                      alt={isUrdu ? dish.nameUr : dish.nameEn}
                      referrerPolicy="no-referrer"
                      className={`h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ${isOutOfStock ? 'grayscale opacity-50' : ''}`}
                    />
                    {/* Subtle Red Overlay on hover */}
                    <div className="absolute inset-0 bg-red-950/10 group-hover:bg-red-950/0 transition-colors" />
                  </div>

                  {/* Card Info */}
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className={`text-base font-extrabold text-stone-900 dark:text-white group-hover:text-red-800 dark:group-hover:text-amber-400 transition-colors ${
                        isUrdu ? 'font-sans tracking-normal leading-snug' : 'font-serif'
                      }`}>
                        {isUrdu ? dish.nameUr : dish.nameEn}
                      </h3>
                      <p className={`mt-2 text-xs text-stone-500 dark:text-stone-400 line-clamp-3 leading-relaxed ${
                        isUrdu ? 'font-sans' : ''
                      }`}>
                        {isUrdu ? dish.descriptionUr : dish.descriptionEn}
                      </p>

                      {/* Sizes selector on card */}
                      {!isOutOfStock && dish.sizes && dish.sizes.length > 0 && (
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase block w-full mb-0.5">
                            {isUrdu ? "سائز منتخب کریں:" : "Choose Size:"}
                          </span>
                          {dish.sizes.map((size) => {
                            const isSelected = selectedSizeName === size.name;
                            return (
                              <button
                                key={size.name}
                                onClick={() => setSelectedSizes(prev => ({ ...prev, [dish.id]: size.name }))}
                                className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-red-800 border-red-800 text-white dark:bg-amber-500 dark:border-amber-500 dark:text-stone-950 shadow-sm'
                                    : 'bg-transparent border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-red-800 dark:hover:border-amber-500'
                                }`}
                              >
                                {size.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Pricing */}
                    <div className="mt-5 pt-4 border-t border-stone-200/60 dark:border-stone-800/60 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-stone-400 dark:text-stone-500 font-bold block uppercase tracking-wide">
                          {isUrdu ? 'قیمت' : 'Price'}
                        </span>
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="text-base font-extrabold text-red-800 dark:text-amber-400 font-mono">
                            {t.priceSymbol}{currentPrice}
                          </span>
                          {(!dish.sizes || dish.sizes.length === 0) && dish.discountPrice !== undefined && (
                            <span className="text-xs text-stone-400 dark:text-stone-500 line-through font-mono">
                              {t.priceSymbol}{dish.price}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Out of stock or active */}
                      {isOutOfStock ? (
                        <span className="rounded bg-stone-200 dark:bg-stone-800 px-3 py-1.5 text-[10px] font-black text-stone-400">
                          {isUrdu ? 'غیر دستیاب' : 'Unavailable'}
                        </span>
                      ) : (
                        <span className="rounded bg-emerald-100 dark:bg-emerald-950/40 px-3 py-1.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-400">
                          {isUrdu ? 'دستیاب ہے' : 'Available'}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
