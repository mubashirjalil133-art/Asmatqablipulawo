/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon, Globe, PhoneCall, ShieldAlert, MonitorCheck } from 'lucide-react';
import Logo from './Logo';
import { Language, Translation } from '../types';
import { translations } from '../data';

interface NavbarProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onOpenReservation: () => void;
  viewMode: 'customer' | 'rms';
  setViewMode: (mode: 'customer' | 'rms') => void;
}

export default function Navbar({
  language,
  setLanguage,
  darkMode,
  setDarkMode,
  onOpenReservation,
  viewMode,
  setViewMode,
}: NavbarProps) {
  const t: Translation = translations[language];
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ur' : 'en');
  };

  const isUrdu = language === 'ur';

  // Navigation Links based on active view mode
  const baseLinks = [
    { label: t.home, id: "home-hero-section", type: 'anchor' },
    { label: t.about, id: "about-asmat-section", type: 'anchor' },
    { label: t.menu, id: "menu-dishes-section", type: 'anchor' },
    { label: t.gallery, id: "gallery-asmat-section", type: 'anchor' },
    { label: t.contact, id: "contact-asmat-section", type: 'anchor' },
    { label: isUrdu ? "انتظام" : "Management", id: "management-panel", type: 'toggle-rms' }
  ];

  const navLinks = viewMode === 'customer' ? baseLinks : [
    { label: isUrdu ? "← کسٹمر ویب سائٹ" : "← Customer Website", id: "customer-view", type: 'toggle-customer' }
  ];

  const handleLinkClick = (link: typeof navLinks[0]) => {
    setIsOpen(false);
    if (link.type === 'toggle-rms') {
      setViewMode('rms');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (link.type === 'toggle-customer') {
      setViewMode('customer');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (link.type === 'anchor') {
      setViewMode('customer');
      setTimeout(() => {
        const element = document.getElementById(link.id);
        if (element) {
          const offset = 80;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = element.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  };

  return (
    <nav
      id="main-sticky-navigation"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled || viewMode === 'rms'
          ? 'bg-white/90 dark:bg-stone-950/95 shadow-lg backdrop-blur-md border-b border-stone-200/50 dark:border-stone-800/50 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex-shrink-0 cursor-pointer flex items-center gap-2" onClick={() => { setViewMode('customer'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <Logo className="h-10 w-10 sm:h-12 sm:w-12" inverted={!scrolled && viewMode !== 'rms' && false} />
            {viewMode === 'rms' && (
              <span className="hidden sm:inline-flex rounded bg-red-800 text-white text-[9px] font-extrabold px-2 py-0.5 uppercase tracking-wide">
                Staff RMS
              </span>
            )}
          </div>

          {/* Desktop Navigation Link Menu */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2" style={{ direction: isUrdu ? 'rtl' : 'ltr' }}>
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link)}
                className={`rounded-lg px-3 py-2 text-sm font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                  link.type === 'toggle-rms' 
                    ? 'text-red-800 dark:text-amber-400 border border-red-800/20 bg-red-800/5 hover:bg-red-800/10'
                    : link.type === 'toggle-customer'
                    ? 'text-stone-700 dark:text-stone-300 hover:text-red-800 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800'
                    : 'text-stone-700 hover:text-red-800 dark:text-stone-300 dark:hover:text-amber-400 hover:bg-stone-50 dark:hover:bg-stone-900/50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Actions - Language, Dark Mode, CTA Table Booking */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Language Toggle Button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 px-3 py-1.5 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:border-amber-500 hover:text-red-800 dark:hover:text-amber-400 transition-all cursor-pointer"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{language === 'en' ? 'اردو' : 'English'}</span>
            </button>

            {/* Dark Mode Switcher */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 p-2 text-stone-700 dark:text-stone-300 hover:border-amber-500 hover:text-red-800 dark:hover:text-amber-400 transition-all cursor-pointer"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>


          </div>

          {/* Mobile Right Controls Menu */}
          <div className="flex lg:hidden items-center gap-2">


            {/* Compact Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 px-2 py-1 text-xs font-bold text-stone-800 dark:text-stone-200 cursor-pointer"
            >
              <Globe className="h-3.5 w-3.5" />
              <span className="text-[10px]">{language === 'en' ? 'اردو' : 'EN'}</span>
            </button>

            {/* Compact Dark Mode */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 p-1.5 text-stone-700 dark:text-stone-300 cursor-pointer"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-lg bg-stone-100 p-2 text-stone-700 dark:bg-stone-900 dark:text-stone-300 cursor-pointer"
              aria-label="Main menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <div
        id="mobile-navigation-drawer"
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white dark:bg-stone-950 border-t border-stone-100 dark:border-stone-900 ${
          isOpen ? 'max-h-screen border-b border-stone-200 dark:border-stone-800' : 'max-h-0'
        }`}
      >
        <div className="space-y-1.5 px-4 pt-3 pb-6 flex flex-col" style={{ direction: isUrdu ? 'rtl' : 'ltr' }}>
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link)}
              className="w-full text-start rounded-lg px-3 py-3 text-base font-medium text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-900 hover:text-red-800 dark:hover:text-amber-400 transition-colors"
            >
              {link.label}
            </button>
          ))}

        </div>
      </div>
    </nav>
  );
}
