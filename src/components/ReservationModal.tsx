/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Users, Clock, MessageSquare, CheckCircle, Phone, User } from 'lucide-react';
import { Language, Translation } from '../types';
import { translations } from '../data';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export default function ReservationModal({ isOpen, onClose, language }: ReservationModalProps) {
  const t: Translation = translations[language];
  const isUrdu = language === 'ur';

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    guests: '4',
    date: '',
    time: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.date || !formData.time) {
      return;
    }

    setIsSubmitting(true);
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      // Save reservation to local storage for persistence
      const currentReservations = JSON.parse(localStorage.getItem('asmat_reservations') || '[]');
      localStorage.setItem('asmat_reservations', JSON.stringify([...currentReservations, {
        ...formData,
        id: Date.now(),
        timestamp: new Date().toISOString()
      }]));
    }, 1500);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      guests: '4',
      date: '',
      time: '',
      notes: ''
    });
    setIsSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="reservation-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-stone-900/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-amber-500/20 bg-white shadow-2xl dark:bg-stone-900 text-stone-900 dark:text-white"
            style={{ direction: isUrdu ? 'rtl' : 'ltr' }}
          >
            {/* Header Red/Gold Accent Line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-red-800 via-amber-500 to-red-800" />

            {/* Close Button */}
            <button
              onClick={handleClose}
              className={`absolute top-4 ${isUrdu ? 'left-4' : 'right-4'} rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-white transition-colors duration-200`}
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6 md:p-8">
              {!isSuccess ? (
                <>
                  <div className="mb-6">
                    <h3 
                      className={`text-2xl font-bold ${
                        isUrdu ? 'font-sans' : 'font-serif'
                      } text-stone-900 dark:text-white`}
                    >
                      {t.reservationTitle}
                    </h3>
                    <p className="mt-1.5 text-xs text-stone-500 dark:text-stone-400">
                      {isUrdu 
                        ? 'برائے مہربانی درج ذیل معلومات فراہم کریں تاکہ ہم آپ کا ٹیبل مخصوص کر سکیں' 
                        : 'Please provide the details below to reserve your luxury family table.'}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Input */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                        {t.formName} *
                      </label>
                      <div className="relative">
                        <span className={`absolute top-1/2 -translate-y-1/2 text-stone-400 ${isUrdu ? 'right-3' : 'left-3'}`}>
                          <User className="h-4 w-4" />
                        </span>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder={t.namePlaceholder}
                          className={`w-full rounded-lg border border-stone-200 bg-stone-50 py-2.5 dark:border-stone-800 dark:bg-stone-950 text-sm outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 ${
                            isUrdu ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Phone Input */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                        {t.formPhone} *
                      </label>
                      <div className="relative">
                        <span className={`absolute top-1/2 -translate-y-1/2 text-stone-400 ${isUrdu ? 'right-3' : 'left-3'}`}>
                          <Phone className="h-4 w-4" />
                        </span>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="e.g. 0302-8073204"
                          className={`w-full rounded-lg border border-stone-200 bg-stone-50 py-2.5 dark:border-stone-800 dark:bg-stone-950 text-sm outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 ${
                            isUrdu ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Guests and Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                          {t.resGuests}
                        </label>
                        <div className="relative">
                          <span className={`absolute top-1/2 -translate-y-1/2 text-stone-400 ${isUrdu ? 'right-3' : 'left-3'}`}>
                            <Users className="h-4 w-4" />
                          </span>
                          <select
                            value={formData.guests}
                            onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                            className={`w-full rounded-lg border border-stone-200 bg-stone-50 py-2.5 dark:border-stone-800 dark:bg-stone-950 text-sm outline-none appearance-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 ${
                              isUrdu ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'
                            }`}
                          >
                            <option value="1">1 {isUrdu ? 'شخص' : 'Guest'}</option>
                            <option value="2">2 {isUrdu ? 'افراد' : 'Guests'}</option>
                            <option value="4">4 {isUrdu ? 'افراد (فیملی)' : 'Guests (Family)'}</option>
                            <option value="6">6 {isUrdu ? 'افراد (فیملی)' : 'Guests (Family)'}</option>
                            <option value="8">8 {isUrdu ? 'افراد (فیملی)' : 'Guests (Family)'}</option>
                            <option value="12">12+ {isUrdu ? 'بڑا ہال' : 'Large Party'}</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                          {t.resDate} *
                        </label>
                        <div className="relative">
                          <span className={`absolute top-1/2 -translate-y-1/2 text-stone-400 ${isUrdu ? 'right-3' : 'left-3'}`}>
                            <Calendar className="h-4 w-4" />
                          </span>
                          <input
                            type="date"
                            required
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className={`w-full rounded-lg border border-stone-200 bg-stone-50 py-2.5 dark:border-stone-800 dark:bg-stone-950 text-sm outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 ${
                              isUrdu ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Time Input */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                        {t.resTime} *
                      </label>
                      <div className="relative">
                        <span className={`absolute top-1/2 -translate-y-1/2 text-stone-400 ${isUrdu ? 'right-3' : 'left-3'}`}>
                          <Clock className="h-4 w-4" />
                        </span>
                        <input
                          type="time"
                          required
                          value={formData.time}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                          className={`w-full rounded-lg border border-stone-200 bg-stone-50 py-2.5 dark:border-stone-800 dark:bg-stone-950 text-sm outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 ${
                            isUrdu ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Special Notes */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                        {t.resNotes}
                      </label>
                      <div className="relative">
                        <span className={`absolute top-3 text-stone-400 ${isUrdu ? 'right-3' : 'left-3'}`}>
                          <MessageSquare className="h-4 w-4" />
                        </span>
                        <textarea
                          rows={2}
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder={isUrdu ? 'کچھ خاص ہدایات جیسے فیملی ہال، کم مرچیں، بی بی کرسی وغیرہ...' : 'Describe any special requests...'}
                          className={`w-full rounded-lg border border-stone-200 bg-stone-50 py-2.5 dark:border-stone-800 dark:bg-stone-950 text-sm outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 ${
                            isUrdu ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-2 rounded-xl bg-gradient-to-r from-red-800 to-red-900 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-red-700 hover:to-red-800 hover:shadow-red-900/20 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 text-center"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>{isUrdu ? 'ٹیبل بک کی جا رہی ہے...' : 'Reserving your Table...'}</span>
                        </>
                      ) : (
                        <span>{t.resSubmit}</span>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="py-8 text-center flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                  >
                    <CheckCircle className="h-16 w-16 text-emerald-500 mb-4" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-2">
                    {isUrdu ? 'ٹیبل بکنگ کامیابی سے موصول ہوگئی!' : 'Reservation Request Received!'}
                  </h3>
                  <p className="text-sm text-stone-600 dark:text-stone-300 max-w-sm mb-6 leading-relaxed">
                    {t.resSuccess}
                  </p>

                  <div className="w-full rounded-xl bg-stone-50 dark:bg-stone-950 p-4 border border-stone-100 dark:border-stone-800 mb-6 text-left" style={{ direction: 'ltr' }}>
                    <p className="text-xs text-stone-500 font-semibold mb-2 uppercase tracking-wide border-b border-stone-100 dark:border-stone-800 pb-1.5 flex justify-between">
                      <span>Reservation Ticket</span>
                      <span className="text-amber-500">#{Math.floor(Math.random() * 9000 + 1000)}</span>
                    </p>
                    <div className="grid grid-cols-2 gap-y-1.5 text-xs">
                      <span className="text-stone-500">Name:</span>
                      <span className="font-semibold text-stone-800 dark:text-stone-200 text-right">{formData.name}</span>
                      
                      <span className="text-stone-500">Phone:</span>
                      <span className="font-semibold text-stone-800 dark:text-stone-200 text-right">{formData.phone}</span>
                      
                      <span className="text-stone-500">Guests:</span>
                      <span className="font-semibold text-stone-800 dark:text-stone-200 text-right">{formData.guests} Persons</span>
                      
                      <span className="text-stone-500">Date/Time:</span>
                      <span className="font-semibold text-stone-800 dark:text-stone-200 text-right">{formData.date} @ {formData.time}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleClose}
                    className="rounded-lg bg-stone-100 px-6 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700 transition-colors"
                  >
                    {isUrdu ? 'واپس ہوم پیج پر جائیں' : 'Back to Home'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
