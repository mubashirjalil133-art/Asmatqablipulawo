/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Facebook, Youtube, Instagram, MessageCircle, Heart } from 'lucide-react';
import Logo from './Logo';
import { Language, Translation } from '../types';
import { translations } from '../data';

interface FooterProps {
  language: Language;
  onOpenRms?: () => void;
}

export default function Footer({ language, onOpenRms }: FooterProps) {
  const t: Translation = translations[language];
  const isUrdu = language === 'ur';

  const [nameEn, setNameEn] = useState("Asmat Kabuli Pulao & Hotel");
  const [nameUr, setNameUr] = useState("عصمت کابلی پلاؤ اینڈ ہوٹل");
  const [descEn, setDescEn] = useState("Asmat Kabuli Pulao & Hotel stands as a legendary culinary oasis on Main G.T. Road, Sarai Naurang, blending traditional wood-fired flavors with premium Pakistani hospitality.");
  const [descUr, setDescUr] = useState("عصمت کابلی پلاؤ اینڈ ہوٹل، پچھلے ۲۸ سال سے مین جی ٹی روڈ سرائے نورنگ پر لذیذ قابلی پلاؤ اور بہترین فیملی سروس کی علامت ہے۔");
  const [phone, setPhone] = useState("0302-8073204 / 0304-9767017");
  const [addressEn, setAddressEn] = useState("Main G.T. Road, Sarai Naurang");
  const [addressUr, setAddressUr] = useState("مین جی ٹی روڈ، سرائے نورنگ");

  const loadSettings = () => {
    const saved = localStorage.getItem('asmat_rms_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.nameEn) setNameEn(parsed.nameEn);
        if (parsed.nameUr) setNameUr(parsed.nameUr);
        if (parsed.descriptionEn) setDescEn(parsed.descriptionEn);
        if (parsed.descriptionUr) setDescUr(parsed.descriptionUr);
        if (parsed.phone) {
          setPhone(parsed.phone);
        }
        if (parsed.addressEn) setAddressEn(parsed.addressEn);
        if (parsed.addressUr) setAddressUr(parsed.addressUr);
      } catch (e) {}
    } else {
      setNameEn("Asmat Kabuli Pulao & Hotel");
      setNameUr("عصمت ہوٹل اینڈ ریسٹورنٹ");
      setDescEn("Asmat Kabuli Pulao & Hotel stands as a legendary culinary oasis on Main G.T. Road, Sarai Naurang, blending traditional wood-fired flavors with premium Pakistani hospitality.");
      setDescUr("عصمت کابلی پلاؤ اینڈ ہوٹل، پچھلے ۲۸ سال سے مین جی ٹی روڈ سرائے نورنگ پر لذیذ قابلی پلاؤ اور بہترین فیملی سروس کی علامت ہے۔");
      setPhone("0302-8073204 / 0304-9767017");
      setAddressEn("Main G.T. Road, Sarai Naurang");
      setAddressUr("مین جی ٹی روڈ، سرائے نورنگ");
    }
  };

  useEffect(() => {
    loadSettings();
    window.addEventListener('storage', loadSettings);
    return () => {
      window.removeEventListener('storage', loadSettings);
    };
  }, []);

  const getWhatsAppLink = () => {
    const firstNum = phone.split('/')[0].replace(/[^0-9]/g, '');
    const finalPhone = firstNum.startsWith('0') ? '92' + firstNum.substring(1) : firstNum;
    return `https://wa.me/${finalPhone || '923028073204'}`;
  };

  const socialLinks = [
    { icon: <Facebook className="h-4 w-4" />, href: "https://facebook.com", label: "Facebook" },
    { icon: <Youtube className="h-4 w-4" />, href: "https://youtube.com", label: "Youtube" },
    { icon: <Instagram className="h-4 w-4" />, href: "https://instagram.com", label: "Instagram" },
    { icon: <MessageCircle className="h-4 w-4" />, href: getWhatsAppLink(), label: "WhatsApp" }
  ];

  const quickLinks = [
    { label: t.home, id: "home-hero-section" },
    { label: t.about, id: "about-asmat-section" },
    { label: t.menu, id: "menu-dishes-section" },
    { label: t.gallery, id: "gallery-asmat-section" },
    { label: t.contact, id: "contact-asmat-section" }
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
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
  };

  return (
    <footer
      id="main-applet-footer"
      className="bg-stone-950 text-stone-400 border-t border-stone-900 pt-16 pb-8 font-sans"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 border-b border-stone-900 pb-12 mb-10" style={{ direction: isUrdu ? 'rtl' : 'ltr' }}>
          
          {/* Column 1: Brand & Bio (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <Logo className="h-10 w-10 sm:h-12 sm:w-12" inverted={true} />
            <p className={`text-xs sm:text-sm text-stone-500 leading-relaxed max-w-sm ${isUrdu ? 'text-right font-sans' : 'text-left'}`}>
              {isUrdu ? descUr : descEn}
            </p>
            {/* Social handles */}
            <div className={`flex gap-3 pt-2 ${isUrdu ? 'justify-start' : 'justify-start'}`}>
              {socialLinks.map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-stone-900 border border-stone-800 p-2.5 text-stone-400 hover:text-amber-400 hover:border-amber-500 hover:scale-105 transition-all"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links (3 cols) */}
          <div className="md:col-span-3 space-y-4">
            <h4 className={`text-xs font-black uppercase tracking-widest text-amber-500 ${isUrdu ? 'text-right' : 'text-left'}`}>
              {isUrdu ? 'فوری لنکس' : 'Explore links'}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {quickLinks.map((link) => (
                <li key={link.id} className={isUrdu ? 'text-right' : 'text-left'}>
                  <button
                    onClick={() => scrollToSection(link.id)}
                    className="hover:text-amber-400 transition-colors py-0.5 cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contacts & Schedule (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <h4 className={`text-xs font-black uppercase tracking-widest text-amber-500 ${isUrdu ? 'text-right' : 'text-left'}`}>
              {isUrdu ? 'معلومات و رابطہ' : 'Reach Us'}
            </h4>
            <div className={`space-y-3 text-xs sm:text-sm ${isUrdu ? 'text-right font-sans' : 'text-left'}`}>
              <div>
                <span className="block text-[10px] text-stone-600 uppercase font-black tracking-wider">
                  {t.locationLabel}
                </span>
                <span className="text-stone-300 font-medium block mt-1 leading-relaxed">
                  {isUrdu ? addressUr : addressEn}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-stone-600 uppercase font-black tracking-wider">
                  {isUrdu ? 'مدد و رابطہ' : 'Reservations Desk'}
                </span>
                <span className="text-amber-500 font-bold block mt-1 font-mono">
                  {phone}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-600">
          <div className="text-center sm:text-left flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span>&copy; 2026 {isUrdu ? nameUr : nameEn}. All Rights Reserved.</span>
            {onOpenRms && (
              <button
                onClick={onOpenRms}
                className="inline-flex items-center gap-1 text-stone-700 hover:text-amber-500/80 transition-colors bg-stone-900/40 hover:bg-stone-900 px-2 py-0.5 rounded cursor-pointer select-none border border-stone-900 hover:border-stone-850"
                title={isUrdu ? "عملہ لاگ ان پورٹل" : "Staff Secure Login Portal"}
              >
                <span>🔑</span>
                <span>{isUrdu ? "سٹاف ٹرمینل" : "Staff Portal"}</span>
              </button>
            )}
          </div>
          <p className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="h-3 w-3 text-red-800 fill-red-800" />
            <span>for Sarai Naurang, KP, Pakistan</span>
          </p>
        </div>

      </div>
    </footer>
  );
}
