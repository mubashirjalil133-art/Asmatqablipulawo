/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Award, Users, Star } from 'lucide-react';
import { Language, Translation } from '../types';
import { translations } from '../data';

interface AboutProps {
  language: Language;
}

export default function About({ language }: AboutProps) {
  const t: Translation = translations[language];
  const isUrdu = language === 'ur';

  const [logoSrc, setLogoSrc] = useState("/logo.png?v=3");
  const [descEn, setDescEn] = useState("");
  const [descUr, setDescUr] = useState("");

  const loadSettings = () => {
    const saved = localStorage.getItem('asmat_rms_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.descriptionEn) setDescEn(parsed.descriptionEn);
        if (parsed.descriptionUr) setDescUr(parsed.descriptionUr);
        if (parsed.logo) {
          setLogoSrc(parsed.logo);
        } else {
          setLogoSrc("/logo.png?v=3");
        }
      } catch (e) {}
    } else {
      setDescEn("");
      setDescUr("");
      setLogoSrc("/logo.png?v=3");
    }
  };

  useEffect(() => {
    loadSettings();
    window.addEventListener('storage', loadSettings);
    return () => {
      window.removeEventListener('storage', loadSettings);
    };
  }, []);

  const stats = [
    {
      value: t.aboutStatExperience,
      label: t.aboutStatExperienceLabel,
      icon: <Award className="h-5 w-5 text-amber-500" />
    },
    {
      value: t.aboutStatDishes,
      label: t.aboutStatDishesLabel,
      icon: <Users className="h-5 w-5 text-amber-500" />
    },
    {
      value: t.aboutStatGuests,
      label: t.aboutStatGuestsLabel,
      icon: <Star className="h-5 w-5 text-amber-500" fill="#D4AF37" />
    }
  ];

  const customDesc = isUrdu ? descUr : descEn;

  return (
    <section
      id="about-asmat-section"
      className="relative overflow-hidden bg-stone-50 py-20 dark:bg-stone-950/60 border-t border-stone-100 dark:border-stone-900"
    >
      {/* Decorative vector overlays */}
      <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-br from-amber-500/5 to-transparent blur-3xl" />
      <div className="absolute bottom-0 left-0 h-40 w-40 bg-gradient-to-tr from-red-800/5 to-transparent blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Official Logo Showcase */}
          <div className="lg:col-span-5 order-2 lg:order-1 relative flex justify-center items-center">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-8 flex flex-col items-center justify-center w-full aspect-square max-w-[400px]">
              {/* Gold corners */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-500" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-500" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-500" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-500" />

              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={logoSrc}
                  alt="Asmat Hotel & Restaurant Official Logo"
                  className="max-h-full max-w-full object-contain pointer-events-none transition-transform duration-300 hover:scale-105 rounded-full"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = "/logo.png?v=3";
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Text Story Content */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="max-w-xl lg:max-w-none text-stone-800 dark:text-stone-100" style={{ direction: isUrdu ? 'rtl' : 'ltr' }}>
              
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-500">
                  {t.aboutSubtitle}
                </span>
                <h2 
                  className={`mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 dark:text-white leading-tight ${
                    isUrdu ? 'font-sans leading-[1.3]' : 'font-serif'
                  }`}
                >
                  {t.aboutTitle}
                </h2>
                <div className="mt-3 h-1 w-16 bg-red-800 rounded" />
              </div>

              {/* Story Paragraphs */}
              <div className={`space-y-4 text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed ${isUrdu ? 'leading-[1.8] font-sans' : ''}`}>
                {customDesc ? (
                  <p className="whitespace-pre-wrap">{customDesc}</p>
                ) : (
                  <>
                    <p>{t.aboutP1}</p>
                    <p>{t.aboutP2}</p>
                    <p>{t.aboutP3}</p>
                  </>
                )}
              </div>

              {/* Stats Counters Grid */}
              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-stone-200 dark:border-stone-800 pt-8 text-center">
                {stats.map((stat, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="rounded-full bg-amber-500/10 dark:bg-amber-500/5 p-2.5 mb-2.5">
                      {stat.icon}
                    </div>
                    <span className="text-lg sm:text-2xl font-extrabold text-stone-900 dark:text-white leading-none">
                      {stat.value}
                    </span>
                    <span className="mt-1 text-[10px] sm:text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide leading-tight">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
