/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Clock, ShieldCheck } from 'lucide-react';
import { Language } from '../types';

interface HeroProps {
  language: Language;
  onOpenReservation: () => void;
}

export default function Hero({ language }: HeroProps) {
  const isUrdu = language === 'ur';

  const [logoSrc, setLogoSrc] = useState("/logo.png");
  const [nameEn, setNameEn] = useState("Asmat Hotel & Restaurant");
  const [nameUr, setNameUr] = useState("عصمت ہوٹل اینڈ ریسٹورنٹ");
  const [sloganEn, setSloganEn] = useState("The home of authentic traditional dining and premium hospitality on Main G.T. Road, Sarai Naurang, KP.");
  const [sloganUr, setSloganUr] = useState("سرائے نورنگ میں روایتی ذائقہ اور اعلیٰ ترین خاندانی ماحول کا امین۔");
  const [addressEn, setAddressEn] = useState("Main G.T. Road, Sarai Naurang");
  const [addressUr, setAddressUr] = useState("مین جی ٹی روڈ، سرائے نورنگ");

  const loadSettings = () => {
    const saved = localStorage.getItem('asmat_rms_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.nameEn) setNameEn(parsed.nameEn);
        if (parsed.nameUr) setNameUr(parsed.nameUr);
        if (parsed.logo) {
          setLogoSrc(parsed.logo);
        } else {
          setLogoSrc("/logo.png");
        }
        // Use slogan or description for the subtitle
        if (parsed.sloganEn) setSloganEn(parsed.sloganEn);
        else if (parsed.descriptionEn) setSloganEn(parsed.descriptionEn);
        
        if (parsed.sloganUr) setSloganUr(parsed.sloganUr);
        else if (parsed.descriptionUr) setSloganUr(parsed.descriptionUr);

        if (parsed.addressEn) setAddressEn(parsed.addressEn);
        if (parsed.addressUr) setAddressUr(parsed.addressUr);
      } catch (e) {
        // Fallback to default
      }
    } else {
      setNameEn("Asmat Hotel & Restaurant");
      setNameUr("عصمت ہوٹل اینڈ ریسٹورنٹ");
      setSloganEn("The home of authentic traditional dining and premium hospitality on Main G.T. Road, Sarai Naurang, KP.");
      setSloganUr("سرائے نورنگ میں روایتی ذائقہ اور اعلیٰ ترین خاندانی ماحول کا امین۔");
      setAddressEn("Main G.T. Road, Sarai Naurang");
      setAddressUr("مین جی ٹی روڈ، سرائے نورنگ");
      setLogoSrc("/logo.png");
    }
  };

  useEffect(() => {
    loadSettings();
    window.addEventListener('storage', loadSettings);
    return () => {
      window.removeEventListener('storage', loadSettings);
    };
  }, []);

  return (
    <div
      id="home-hero-section"
      className="relative flex min-h-[85vh] items-center justify-center overflow-hidden pt-24 pb-12 bg-stone-950"
    >
      {/* Dynamic Background with Elegant Grid & Lights */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-stone-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(139,92,26,0.15),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_400px,rgba(128,0,0,0.08),transparent)]" />
      </div>

      {/* Decorative Warm Accents */}
      <div className="absolute top-1/4 left-1/10 h-64 w-64 rounded-full bg-red-900/10 blur-[80px]" />
      <div className="absolute bottom-1/4 right-1/10 h-72 w-72 rounded-full bg-amber-500/5 blur-[100px]" />

      {/* Core Logo Presentation */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="flex flex-col items-center"
        >
          {/* Logo Frame: responsive, uncropped, high-quality */}
          <div className="p-4 bg-stone-900/40 border border-stone-800/60 rounded-3xl backdrop-blur-md mb-8 shadow-2xl transition-all duration-300 hover:scale-[1.02]">
            <img
              src={logoSrc}
              alt={`${isUrdu ? nameUr : nameEn} Official Logo`}
              className="max-h-[320px] sm:max-h-[420px] w-auto max-w-full object-contain pointer-events-none rounded-full"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = "/logo.png";
              }}
            />
          </div>

          {/* Clean, Simple Title and Subheading */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            {isUrdu ? nameUr : nameEn}
          </h1>
          <p className="text-stone-400 max-w-xl text-sm sm:text-base leading-relaxed font-medium">
            {isUrdu ? sloganUr : sloganEn}
          </p>

          <div className="mt-8 flex gap-4">
            <button
              onClick={() => {
                const menuSec = document.getElementById('menu-dishes-section');
                if (menuSec) menuSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="px-6 py-3 bg-gradient-to-r from-red-800 to-red-900 border border-amber-500/20 text-white rounded-xl text-sm font-bold shadow-lg hover:from-red-700 hover:to-red-800 transition-all cursor-pointer"
            >
              {isUrdu ? "مینیو دیکھیں" : "Explore Menu"}
            </button>
            <button
              onClick={() => {
                const contactSec = document.getElementById('contact-asmat-section');
                if (contactSec) contactSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="px-6 py-3 bg-stone-900 border border-stone-800 hover:border-amber-500/40 text-stone-300 hover:text-white rounded-xl text-sm font-bold transition-all cursor-pointer"
            >
              {isUrdu ? "رابطہ کریں" : "Contact Us"}
            </button>
          </div>
        </motion.div>

        {/* Highlights Row */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 0.9, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mt-12 pt-8 border-t border-stone-900/60 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full text-stone-400 text-xs sm:text-sm"
          style={{ direction: isUrdu ? 'rtl' : 'ltr' }}
        >
          {/* Highlight 1 */}
          <div className="flex items-center gap-3 bg-stone-900/30 border border-stone-900/50 p-3 rounded-xl">
            <div className="rounded-full bg-red-950 p-2 text-amber-500">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="text-left">
              <span className="block text-white font-semibold">
                {isUrdu ? "مقامِ خاص" : "Location"}
              </span>
              <span className="text-[10px] text-stone-400">
                {isUrdu ? addressUr : addressEn}
              </span>
            </div>
          </div>

          {/* Highlight 2 */}
          <div className="flex items-center gap-3 bg-stone-900/30 border border-stone-900/50 p-3 rounded-xl">
            <div className="rounded-full bg-red-950 p-2 text-amber-500">
              <Clock className="h-4 w-4" />
            </div>
            <div className="text-left">
              <span className="block text-white font-semibold">
                {isUrdu ? "اوقات کار" : "Open Hours"}
              </span>
              <span className="text-[10px] text-stone-400">
                {isUrdu ? "۲۴ گھنٹے سروس دستیاب ہے" : "Open 24/7 Everyday"}
              </span>
            </div>
          </div>

          {/* Highlight 3 */}
          <div className="flex items-center gap-3 bg-stone-900/30 border border-stone-900/50 p-3 rounded-xl">
            <div className="rounded-full bg-red-950 p-2 text-amber-500">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="text-left">
              <span className="block text-white font-semibold">
                {isUrdu ? "فیملی ماحول" : "Atmosphere"}
              </span>
              <span className="text-[10px] text-stone-400">
                {isUrdu ? "علیحدہ فیملی پردہ ہال" : "Private Family Dining Section"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
