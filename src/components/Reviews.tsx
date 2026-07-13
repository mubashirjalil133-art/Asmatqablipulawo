/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MessageSquarePlus, User, Check, Sparkles } from 'lucide-react';
import { Language, Translation, Testimonial } from '../types';
import { translations, testimonialsData } from '../data';

interface ReviewsProps {
  language: Language;
}

export default function Reviews({ language }: ReviewsProps) {
  const t: Translation = translations[language];
  const isUrdu = language === 'ur';

  const [reviews, setReviews] = useState<Testimonial[]>(testimonialsData);
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // New Review Form State
  const [newName, setNewName] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newText, setNewText] = useState('');

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newText) return;

    const newReview: Testimonial = {
      id: `review-custom-${Date.now()}`,
      nameEn: newName,
      nameUr: newName, // simple fallback
      rating: newRating,
      textEn: newText,
      textUr: newText, // simple fallback
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      roleEn: 'Verified Patron',
      roleUr: 'مصدقہ گاہک (پینڈنگ)'
    };

    setReviews(prev => [newReview, ...prev]);
    setSuccessMsg(true);
    
    // Reset Form
    setNewName('');
    setNewRating(5);
    setNewText('');
    
    // Collapse Form after a delay
    setTimeout(() => {
      setSuccessMsg(false);
      setShowAddForm(false);
    }, 4000);
  };

  return (
    <section
      id="reviews-asmat-section"
      className="relative bg-stone-50 py-20 dark:bg-stone-950/60 border-t border-stone-100 dark:border-stone-800"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-500">
            {isUrdu ? 'مخلصانہ رائیں' : 'Trusted Guest Feedback'}
          </span>
          <h2 
            className={`mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 dark:text-white leading-tight ${
              isUrdu ? 'font-sans' : 'font-serif'
            }`}
          >
            {t.reviewsTitle}
          </h2>
          <div className="mt-3 h-1 w-16 bg-red-800 rounded mx-auto" />
          <p className="mt-4 text-stone-500 dark:text-stone-400 text-sm sm:text-base leading-relaxed">
            {t.reviewsSubtitle}
          </p>
        </div>

        {/* Call to action for adding review */}
        <div className="flex justify-center mb-10">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-5 py-2.5 text-xs font-bold text-stone-800 dark:text-stone-200 shadow-sm hover:border-amber-500 hover:text-red-800 dark:hover:text-amber-400 transition-all cursor-pointer"
          >
            <MessageSquarePlus className="h-4 w-4" />
            <span>{showAddForm ? (isUrdu ? 'فارم بند کریں' : 'Close Review Form') : t.addReviewBtn}</span>
          </button>
        </div>

        {/* Expandable Review Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden max-w-xl mx-auto mb-12"
            >
              <div className="rounded-2xl border border-amber-500/25 bg-white dark:bg-stone-900 p-6 md:p-8 shadow-lg" style={{ direction: isUrdu ? 'rtl' : 'ltr' }}>
                {!successMsg ? (
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <h3 className={`text-lg font-bold text-stone-900 dark:text-white ${isUrdu ? 'font-sans' : 'font-serif'}`}>
                      {isUrdu ? 'اپنا تجربہ شیئر کریں' : 'Share Your Authentic Experience'}
                    </h3>

                    {/* Name Input */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wide mb-1">
                        {isUrdu ? 'آپ کا نام' : 'Your Name'}
                      </label>
                      <input
                        type="text"
                        required
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder={t.namePlaceholder}
                        className={`w-full rounded-lg border border-stone-200 bg-stone-50 py-2.5 dark:border-stone-800 dark:bg-stone-950 text-sm outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 ${isUrdu ? 'text-right' : 'text-left'}`}
                      />
                    </div>

                    {/* Rating Select */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wide mb-1">
                        {t.ratingLabel}
                      </label>
                      <div className="flex items-center gap-1.5 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= newRating ? 'text-amber-400 fill-amber-400' : 'text-stone-300 dark:text-stone-700'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comment text */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wide mb-1">
                        {isUrdu ? 'تبصرہ لکھیں' : 'Your Review Details'}
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        placeholder={t.reviewPlaceholder}
                        className={`w-full rounded-lg border border-stone-200 bg-stone-50 py-2.5 dark:border-stone-800 dark:bg-stone-950 text-sm outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 ${isUrdu ? 'text-right' : 'text-left'}`}
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-gradient-to-r from-red-800 to-red-900 px-5 py-3 text-sm font-semibold text-white shadow hover:from-red-700 transition-all cursor-pointer text-center"
                    >
                      {t.submitReview}
                    </button>
                  </form>
                ) : (
                  <div className="py-6 text-center flex flex-col items-center">
                    <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-500 border border-emerald-500/20 mb-3 animate-bounce">
                      <Check className="h-8 w-8" />
                    </div>
                    <h4 className="text-base font-bold text-stone-900 dark:text-white mb-1.5">
                      {isUrdu ? 'شکریہ! تبصرہ موصول ہوا' : 'Review Submitted!'}
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm leading-relaxed">
                      {t.reviewSuccess}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="flex flex-col justify-between rounded-2xl border border-stone-200/60 bg-white dark:border-stone-800/80 dark:bg-stone-950/40 p-6 shadow-sm hover:shadow-md transition-all relative"
              style={{ direction: isUrdu ? 'rtl' : 'ltr' }}
            >
              {/* Top Row: Stars and Date */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200 dark:text-stone-800'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {rev.date}
                  </span>
                </div>

                {/* Review Text */}
                <p className={`text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed mb-6 italic ${
                  isUrdu ? 'font-sans' : ''
                }`}>
                  "{isUrdu ? rev.textUr : rev.textEn}"
                </p>
              </div>

              {/* Bottom Row: Guest details */}
              <div className="flex items-center gap-3 border-t border-stone-100 dark:border-stone-900 pt-4 mt-auto">
                <div className="rounded-full bg-stone-100 dark:bg-stone-900 p-2 text-stone-500 dark:text-stone-400 border border-stone-200/35 dark:border-stone-800/35">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <h4 className={`text-xs sm:text-sm font-extrabold text-stone-900 dark:text-white leading-none ${
                    isUrdu ? 'font-sans' : 'font-serif'
                  }`}>
                    {isUrdu ? rev.nameUr : rev.nameEn}
                  </h4>
                  <span className={`text-[10px] text-amber-500 dark:text-amber-400 font-bold block mt-1 ${isUrdu ? 'font-sans' : 'font-mono'}`}>
                    {isUrdu ? rev.roleUr : rev.roleEn}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
