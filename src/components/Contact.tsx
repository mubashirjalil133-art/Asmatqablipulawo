/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Phone, Clock, MessageSquare, PhoneCall, Send, Check } from 'lucide-react';
import { Language, Translation } from '../types';
import { translations } from '../data';

interface ContactProps {
  language: Language;
}

export default function Contact({ language }: ContactProps) {
  const t: Translation = translations[language];
  const isUrdu = language === 'ur';

  const [phone, setPhone] = useState("0302-8073204 / 0304-9767017");
  const [addressEn, setAddressEn] = useState("Main G.T. Road, Sarai Naurang, KP, Pakistan");
  const [addressUr, setAddressUr] = useState("مین جی ٹی روڈ، سرائے نورنگ، خیبر پختونخوا");

  const loadSettings = () => {
    const saved = localStorage.getItem('asmat_rms_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.phone) {
          setPhone(parsed.phone);
        }
        if (parsed.addressEn) setAddressEn(parsed.addressEn);
        if (parsed.addressUr) setAddressUr(parsed.addressUr);
      } catch (e) {}
    } else {
      setPhone("0302-8073204 / 0304-9767017");
      setAddressEn("Main G.T. Road, Sarai Naurang, KP, Pakistan");
      setAddressUr("مین جی ٹی روڈ، سرائے نورنگ، خیبر پختونخوا");
    }
  };

  useEffect(() => {
    loadSettings();
    window.addEventListener('storage', loadSettings);
    return () => {
      window.removeEventListener('storage', loadSettings);
    };
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  });

  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) return;

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSuccess(true);
      
      const currentInquiries = JSON.parse(localStorage.getItem('asmat_inquiries') || '[]');
      localStorage.setItem('asmat_inquiries', JSON.stringify([...currentInquiries, {
        ...formData,
        id: Date.now(),
        timestamp: new Date().toISOString()
      }]));

      setFormData({ name: '', phone: '', message: '' });
      setTimeout(() => setIsSuccess(false), 4000);
    }, 1500);
  };

  const handleWhatsApp = () => {
    const textEn = "Hello, I would like to reserve a table at Asmat Kabuli Pulao & Hotel. Please assist me.";
    const textUr = "اسلام علیکم، میں عصمت کابلی پلاؤ اینڈ ہوٹل میں ٹیبل بکنگ کے لیے رابطہ کر رہا ہوں۔ برائے مہربانی میری مدد کریں۔";
    const encodedText = encodeURIComponent(isUrdu ? textUr : textEn);
    const firstNum = phone.split('/')[0].replace(/[^0-9]/g, '');
    const finalPhone = firstNum.startsWith('0') ? '92' + firstNum.substring(1) : firstNum;
    window.open(`https://wa.me/${finalPhone || '923028073204'}?text=${encodedText}`, '_blank');
  };

  const handleCall = () => {
    const firstNum = phone.split('/')[0].replace(/[^0-9]/g, '');
    window.open(`tel:${firstNum || '03028073204'}`, '_self');
  };

  return (
    <section
      id="contact-asmat-section"
      className="relative bg-white py-20 dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-500">
            {isUrdu ? 'براہِ راست رابطہ' : 'Location & Contacts'}
          </span>
          <h2 
            className={`mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 dark:text-white leading-tight ${
              isUrdu ? 'font-sans' : 'font-serif'
            }`}
          >
            {t.contactTitle}
          </h2>
          <div className="mt-3 h-1 w-16 bg-red-800 rounded mx-auto" />
          <p className="mt-4 text-stone-500 dark:text-stone-400 text-sm sm:text-base leading-relaxed">
            {t.contactSubtitle}
          </p>
        </div>

        {/* Contact Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start" style={{ direction: isUrdu ? 'rtl' : 'ltr' }}>
          
          {/* Column 1: Info & Maps (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Address card */}
              <div className="rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 bg-stone-50 dark:bg-stone-950/40 flex items-start gap-4">
                <div className="rounded-xl bg-amber-500/10 p-3 text-amber-500 border border-amber-500/20 flex-shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className={`text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 ${isUrdu ? 'font-sans text-right' : ''}`}>
                    {t.locationLabel}
                  </h4>
                  <span className={`block mt-1.5 text-xs sm:text-sm font-bold text-stone-900 dark:text-white ${isUrdu ? 'font-sans leading-relaxed text-right' : ''}`}>
                    {isUrdu ? addressUr : addressEn}
                  </span>
                </div>
              </div>

              {/* Phone card */}
              <div className="rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 bg-stone-50 dark:bg-stone-950/40 flex items-start gap-4">
                <div className="rounded-xl bg-amber-500/10 p-3 text-amber-500 border border-amber-500/20 flex-shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className={`text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 ${isUrdu ? 'font-sans text-right' : ''}`}>
                    {t.phoneLabel}
                  </h4>
                  <div className="mt-1.5 flex flex-col gap-1 text-sm font-black text-stone-900 dark:text-white font-mono">
                    <a href={`tel:${phone}`} className="hover:text-red-800 dark:hover:text-amber-400 transition-colors">{phone}</a>
                  </div>
                </div>
              </div>

              {/* Hours card */}
              <div className="rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 bg-stone-50 dark:bg-stone-950/40 flex items-start gap-4 sm:col-span-2">
                <div className="rounded-xl bg-amber-500/10 p-3 text-amber-500 border border-amber-500/20 flex-shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className={`text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 ${isUrdu ? 'font-sans text-right' : ''}`}>
                    {t.hoursLabel}
                  </h4>
                  <span className={`block mt-1.5 text-xs sm:text-sm font-black text-stone-950 dark:text-white ${isUrdu ? 'font-sans text-right' : ''}`}>
                    {t.hoursValue}
                  </span>
                </div>
              </div>

            </div>

            {/* Premium G.T. Road Vector Map Illustration */}
            <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-950 p-6 shadow-md relative overflow-hidden">
              <div className="absolute top-4 right-4 z-10">
                <span className="rounded-full bg-amber-500 text-stone-950 text-[9px] font-extrabold px-3 py-1 uppercase tracking-wider">
                  Interactive Route Map
                </span>
              </div>
              
              <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-500" />
                <span>Sarai Naurang, Main G.T. Road Transit View</span>
              </h4>

              {/* Interactive Vector Map SVG */}
              <svg viewBox="0 0 500 200" fill="none" className="w-full h-auto bg-stone-900 rounded-xl p-2 border border-stone-800">
                {/* Gridlines */}
                <path d="M0 50 H500 M0 100 H500 M0 150 H500" stroke="#1C1917" strokeWidth="1" />
                <path d="M100 0 V200 M200 0 V200 M300 0 V200 M400 0 V200" stroke="#1C1917" strokeWidth="1" />

                {/* Main G.T. Road (Asphalt lanes) */}
                <path d="M0 100 H500" stroke="#3730A3" strokeWidth="32" opacity="0.15" />
                <path d="M0 100 H500" stroke="#444" strokeWidth="16" />
                <path d="M0 100 H500" stroke="#FFF" strokeWidth="1" strokeDasharray="6 6" />

                {/* Road label */}
                <text x="50" y="86" fill="#A8A29E" fontSize="9" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.1em">MAIN G.T. ROAD (TO PESHAWAR)</text>
                <text x="450" y="86" fill="#A8A29E" fontSize="9" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.1em" textAnchor="end">TO BANNU / LAKKI MARWAT</text>

                {/* Secondary Cross Road (Bannu Route / Naurang Bazaar Road) */}
                <path d="M250 0 V200" stroke="#292524" strokeWidth="12" />
                <text x="262" y="30" fill="#78716C" fontSize="8" fontWeight="bold" fontFamily="sans-serif" transform="rotate(90 262 30)">NAURANG BAZAAR RD</text>

                {/* River / Canal on the bottom */}
                <path d="M0 170 Q120 185 250 175 T500 180" stroke="#0369A1" strokeWidth="6" strokeLinecap="round" opacity="0.6" fill="none" />
                <text x="20" y="190" fill="#0284C7" fontSize="8" fontFamily="sans-serif">Gambila River Flow</text>

                {/* Landmarks */}
                <circle cx="120" cy="140" r="4" fill="#3F3F46" />
                <text x="130" y="143" fill="#71717A" fontSize="8" fontFamily="sans-serif">Naurang Police Post</text>

                <circle cx="380" cy="60" r="4" fill="#3F3F46" />
                <text x="390" y="63" fill="#71717A" fontSize="8" fontFamily="sans-serif">Bus Transit Hub</text>

                {/* Asmat Kabuli Pulao & Hotel Core Marker with radar pulse */}
                <circle cx="250" cy="100" r="12" stroke="#EF4444" strokeWidth="1.5" className="animate-ping" opacity="0.5" />
                <circle cx="250" cy="100" r="6" fill="#D4AF37" stroke="#800000" strokeWidth="2" />
                
                {/* Marker Callout */}
                <rect x="170" y="115" width="160" height="35" rx="6" fill="#800000" stroke="#D4AF37" strokeWidth="1.5" />
                <text x="250" y="129" fill="#FFF" fontSize="8" fontWeight="extrabold" fontFamily="sans-serif" textAnchor="middle">ASMAT KABULI PULAO & HOTEL</text>
                <text x="250" y="142" fill="#FBBF24" fontSize="7" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">Pulao, Karahi & Family Hotel</text>
              </svg>

              <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
                <span className="text-xs text-stone-400 font-sans">
                  * Coordinates: Main G.T. Road Crossing, Sarai Naurang, KP, Pakistan
                </span>
                
                {/* Launch Real Maps external link */}
                <a
                  href="https://maps.google.com/?q=Main+G.T.+Road+Sarai+Naurang+Khyber+Pakhtunkhwa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-amber-400 hover:text-white transition-colors underline flex items-center gap-1.5"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>

          </div>

          {/* Column 2: Send Message Form (5 cols) */}
          <div className="lg:col-span-5 bg-stone-50 dark:bg-stone-950 p-6 sm:p-8 rounded-2xl border border-stone-200 dark:border-stone-800">
            <h3 className={`text-xl font-bold text-stone-900 dark:text-white ${isUrdu ? 'font-sans' : 'font-serif'}`}>
              {isUrdu ? 'پیغام روانہ کریں' : 'Send an Inquiry'}
            </h3>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
              {isUrdu ? 'کوئی سوال یا بکنگ سے متعلق معلومات کے لیے پیغام بھیجیں' : 'Have a question or custom booking inquiry? Leave a message.'}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wide mb-1">
                  {t.formName} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t.namePlaceholder}
                  className={`w-full rounded-lg border border-stone-200 bg-white py-2.5 dark:border-stone-800 dark:bg-stone-900 text-sm outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 ${isUrdu ? 'text-right' : 'text-left'}`}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wide mb-1">
                  {t.formPhone} *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 0302-8073204"
                  className={`w-full rounded-lg border border-stone-200 bg-white py-2.5 dark:border-stone-800 dark:bg-stone-900 text-sm outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 ${isUrdu ? 'text-right' : 'text-left'}`}
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wide mb-1">
                  {t.formMessage} *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={isUrdu ? 'اپنا پیغام یہاں تفصیل سے تحریر کریں...' : 'Enter your details, dates, or custom menu requests...'}
                  className={`w-full rounded-lg border border-stone-200 bg-white py-2.5 dark:border-stone-800 dark:bg-stone-900 text-sm outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 ${isUrdu ? 'text-right' : 'text-left'}`}
                />
              </div>

              {/* Submit button with animation */}
              <button
                type="submit"
                disabled={isSending || isSuccess}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-stone-900 dark:bg-amber-500 hover:bg-stone-800 dark:hover:bg-amber-400 text-white dark:text-stone-950 py-3 text-sm font-bold shadow transition-all cursor-pointer disabled:opacity-75"
              >
                {isSending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>{isUrdu ? 'بھیجا جا رہا ہے...' : 'Sending message...'}</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>{isUrdu ? 'کامیابی سے بھیج دیا گیا!' : 'Sent Successfully!'}</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>{t.sendMessageBtn}</span>
                  </>
                )}
              </button>

              {/* Direct Instant Action Links */}
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800/80 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 py-3 text-xs font-bold transition-all cursor-pointer text-center"
                >
                  <MessageSquare className="h-4 w-4 text-emerald-500" />
                  <span>{t.whatsappChatBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCall}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-red-800/30 bg-red-800/10 hover:bg-red-800/20 text-red-800 dark:text-red-400 py-3 text-xs font-bold transition-all cursor-pointer text-center"
                >
                  <PhoneCall className="h-4 w-4 text-red-500" />
                  <span>{t.callNowBtn}</span>
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
