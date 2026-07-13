/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Maximize2, ChevronLeft, ChevronRight, Image } from 'lucide-react';
import { Language, Translation, GalleryItem } from '../types';
import { translations, galleryData } from '../data';

interface GalleryProps {
  language: Language;
}

export default function Gallery({ language }: GalleryProps) {
  const t: Translation = translations[language];
  const isUrdu = language === 'ur';

  const [filter, setFilter] = useState<'all' | 'food' | 'dining'>('all');
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  const filterTabs = [
    { id: 'all' as const, label: t.galleryAll },
    { id: 'food' as const, label: t.galleryFood },
    { id: 'dining' as const, label: t.galleryDining }
  ];

  const filteredItems = filter === 'all'
    ? galleryData
    : galleryData.filter(item => item.category === filter);

  const openLightbox = (item: GalleryItem) => {
    const originalIndex = galleryData.findIndex(g => g.id === item.id);
    setActiveImageIndex(originalIndex);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeImageIndex === null) return;
    setActiveImageIndex((activeImageIndex + 1) % galleryData.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeImageIndex === null) return;
    setActiveImageIndex((activeImageIndex - 1 + galleryData.length) % galleryData.length);
  };

  const lightboxItem = activeImageIndex !== null ? galleryData[activeImageIndex] : null;

  return (
    <section
      id="gallery-asmat-section"
      className="relative bg-white py-20 dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-500">
            {isUrdu ? 'حسین مناظر' : 'Visual Highlights'}
          </span>
          <h2 
            className={`mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 dark:text-white leading-tight ${
              isUrdu ? 'font-sans' : 'font-serif'
            }`}
          >
            {t.galleryTitle}
          </h2>
          <div className="mt-3 h-1 w-16 bg-red-800 rounded mx-auto" />
          <p className="mt-4 text-stone-500 dark:text-stone-400 text-sm sm:text-base leading-relaxed">
            {t.gallerySubtitle}
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex justify-center flex-wrap gap-2 mb-10 max-w-2xl mx-auto border-b border-stone-100 dark:border-stone-800 pb-4">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold tracking-wide transition-all cursor-pointer ${
                filter === tab.id
                  ? 'bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-950 shadow'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              } ${isUrdu ? 'font-sans' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                key={item.id}
                onClick={() => openLightbox(item)}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-950 border border-stone-150 dark:border-stone-800 cursor-pointer shadow-sm"
              >
                {/* Thumbnail Image */}
                <img
                  src={item.image}
                  alt={isUrdu ? item.titleUr : item.titleEn}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Dark Hover Overlay */}
                <div className="absolute inset-0 bg-stone-950/0 group-hover:bg-stone-950/60 transition-colors duration-300 flex flex-col items-center justify-center p-4 text-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <Maximize2 className="h-6 w-6 text-amber-400 mb-2.5" />
                    <span className={`text-white text-xs sm:text-sm font-bold line-clamp-1 ${isUrdu ? 'font-sans' : 'font-serif'}`}>
                      {isUrdu ? item.titleUr : item.titleEn}
                    </span>
                    <span className="mt-1 text-[9px] uppercase tracking-wider text-amber-500 font-semibold font-mono">
                      {item.category}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>

      {/* FULL SCREEN LIGHTBOX MODAL */}
      <AnimatePresence>
        {lightboxItem && (
          <div id="gallery-lightbox" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveImageIndex(null)}
              className="fixed inset-0 bg-stone-950/95"
            />

            {/* Lightbox controls */}
            <button
              onClick={() => setActiveImageIndex(null)}
              className="absolute top-6 right-6 z-10 rounded-full bg-stone-900/60 border border-stone-800 p-2.5 text-stone-300 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              aria-label="Close Lightbox"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Left Nav Button */}
            <button
              onClick={handlePrev}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-10 rounded-full bg-stone-900/60 border border-stone-800 p-3 text-stone-300 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              aria-label="Previous Image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Right Nav Button */}
            <button
              onClick={handleNext}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-10 rounded-full bg-stone-900/60 border border-stone-800 p-3 text-stone-300 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              aria-label="Next Image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Lightbox Content Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-4xl max-h-[80vh] flex flex-col items-center select-none"
            >
              <img
                src={lightboxItem.image}
                alt={isUrdu ? lightboxItem.titleUr : lightboxItem.titleEn}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[70vh] object-contain rounded-xl border border-stone-800 shadow-2xl"
              />
              
              {/* Image Description Block */}
              <div className="mt-4 text-center">
                <span className="inline-flex rounded-full bg-amber-500/10 border border-amber-500/25 px-3 py-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-2 font-mono">
                  {lightboxItem.category}
                </span>
                <h4 className={`text-base sm:text-lg font-bold text-white ${isUrdu ? 'font-sans' : 'font-serif'}`}>
                  {isUrdu ? lightboxItem.titleUr : lightboxItem.titleEn}
                </h4>
                <p className="mt-1 text-xs text-stone-400 font-sans">
                  Image {activeImageIndex !== null ? activeImageIndex + 1 : 0} of {galleryData.length}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
