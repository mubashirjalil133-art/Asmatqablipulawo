/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, Info, Phone, Mail, MapPin, Image as ImageIcon, RotateCcw, CheckCircle } from 'lucide-react';
import { Language } from '../types';

interface RmsSettingsProps {
  language: Language;
}

export interface RestaurantSettings {
  logo: string;
  nameEn: string;
  nameUr: string;
  sloganEn: string;
  sloganUr: string;
  phone: string;
  addressEn: string;
  addressUr: string;
  email: string;
  descriptionEn: string;
  descriptionUr: string;
}

const DEFAULT_SETTINGS: RestaurantSettings = {
  logo: "/logo.png",
  nameEn: "ASMAT HOTEL & RESTAURANT",
  nameUr: "عصمت ہوٹل اینڈ ریسٹورنٹ",
  sloganEn: "KABULI PULAO & HOTEL",
  sloganUr: "کابلی پلاؤ اینڈ ہوٹل",
  phone: "0302-8073204 / 0304-9767017",
  addressEn: "Main G.T. Road, Sarai Naurang, KP, Pakistan",
  addressUr: "مین جی ٹی روڈ، سرائے نورنگ، خیبر پختونخوا",
  email: "info@asmathotel.com",
  descriptionEn: "Serving Authenticity & Comfort Since 1995. Experience the legendary taste of traditional Kabuli Pulao, sizzling Karahis, and premium family dining in Sarai Naurang, KP.",
  descriptionUr: "1995ء سے لذیذ اور معیاری روایتی پکوانوں کی خدمت۔ سرائے نورنگ، خیبر پختونخوا میں روایتی قابلی پلاؤ، کڑاہی اور بہترین فیملی سروس کا لطف اٹھائیں۔"
};

export default function RmsSettings({ language }: RmsSettingsProps) {
  const isUrdu = language === 'ur';
  const [settings, setSettings] = useState<RestaurantSettings>(DEFAULT_SETTINGS);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('asmat_rms_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (e) {
        setSettings(DEFAULT_SETTINGS);
      }
    }
  }, []);

  const handleInputChange = (field: keyof RestaurantSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        alert(isUrdu ? "فائل کا سائز بہت بڑا ہے! برائے مہربانی 1.5MB سے چھوٹی امیج اپ لوڈ کریں۔" : "Logo size is too large! Please upload an image under 1.5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          handleInputChange('logo', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('asmat_rms_settings', JSON.stringify(settings));
    
    // Dispatch storage event to let other components know the settings have changed
    window.dispatchEvent(new Event('storage'));
    
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    if (confirm(isUrdu ? "کیا آپ ترتیبات کو پہلے جیسی حالت (Default) پر لانا چاہتے ہیں؟" : "Are you sure you want to reset settings to original defaults?")) {
      setSettings(DEFAULT_SETTINGS);
      localStorage.setItem('asmat_rms_settings', JSON.stringify(DEFAULT_SETTINGS));
      window.dispatchEvent(new Event('storage'));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-md" style={{ direction: isUrdu ? 'rtl' : 'ltr' }}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-stone-150 dark:border-stone-800 pb-5">
        <div>
          <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-white flex items-center gap-2">
            <Info className="h-5 w-5 text-amber-500" />
            <span>{isUrdu ? "سسٹم اور ریسٹورنٹ سیٹنگز" : "Restaurant Profile & Information Settings"}</span>
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {isUrdu 
              ? "ریسٹورنٹ کا لوگو، نام، بنیادی معلومات، اور رابطے کی تفصیلات تبدیل کریں۔" 
              : "Update your restaurant logo, name, tagline, description, and contact details."}
          </p>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/50 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          <span>{isUrdu ? "ڈیفالٹ پر لائیں" : "Reset Default"}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl p-3 text-xs font-black flex items-center gap-2 justify-center"
          >
            <CheckCircle className="h-4 w-4" />
            <span>{isUrdu ? "تبدیلیاں کامیابی سے محفوظ ہو گئیں!" : "Settings saved successfully!"}</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Logo Upload Column */}
          <div className="space-y-4 bg-stone-50 dark:bg-stone-950/40 p-5 rounded-2xl border border-stone-150 dark:border-stone-850/60 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-black uppercase text-stone-400 tracking-wider">
              {isUrdu ? "ریسٹورنٹ کا آفیشل لوگو" : "Official Restaurant Logo"}
            </span>

            <div className="relative group w-32 h-32 rounded-full border-2 border-amber-500/30 bg-white dark:bg-stone-900 overflow-hidden flex items-center justify-center p-2 shadow-lg cursor-pointer">
              <img src={settings.logo || "/logo.png"} alt="Official Logo Preview" className="max-w-full max-h-full object-contain rounded-full" />
              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity duration-200">
                <ImageIcon className="h-6 w-6 text-white mb-1" />
                <span className="text-[10px] text-white font-bold">{isUrdu ? "تبدیل کریں" : "Change Logo"}</span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>

            <div className="w-full">
              <div className="block w-full text-center rounded-xl border border-dashed border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/40 p-4">
                <span className="text-xs font-black text-stone-800 dark:text-stone-100 block">
                  {isUrdu ? "لوگو تبدیل کریں" : "Upload Custom Logo"}
                </span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 block mt-1.5 leading-relaxed">
                  {isUrdu 
                    ? "نیا لوگو اپ لوڈ کرنے کے لیے تصویر پر کلک کریں۔" 
                    : "Click on the image above to select and upload a new system logo."}
                </span>
              </div>
            </div>
          </div>

          {/* Restaurant Names and Taglines */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-stone-400 mb-1">
                  {isUrdu ? "ریسٹورنٹ کا نام (انگریزی) *" : "Restaurant Name (English) *"}
                </label>
                <input 
                  type="text" 
                  required
                  value={settings.nameEn}
                  onChange={e => handleInputChange('nameEn', e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-950/40 border border-stone-200 dark:border-stone-850 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-stone-400 mb-1">
                  {isUrdu ? "ریسٹورنٹ کا نام (اردو) *" : "Restaurant Name (Urdu) *"}
                </label>
                <input 
                  type="text" 
                  required
                  value={settings.nameUr}
                  onChange={e => handleInputChange('nameUr', e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-950/40 border border-stone-200 dark:border-stone-850 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 dark:text-white font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-stone-400 mb-1">
                  {isUrdu ? "سلوگن / ذیلی عنوان (انگریزی)" : "Slogan / Tagline (English)"}
                </label>
                <input 
                  type="text" 
                  value={settings.sloganEn}
                  onChange={e => handleInputChange('sloganEn', e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-950/40 border border-stone-200 dark:border-stone-850 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-stone-400 mb-1">
                  {isUrdu ? "سلوگن / ذیلی عنوان (اردو)" : "Slogan / Tagline (Urdu)"}
                </label>
                <input 
                  type="text" 
                  value={settings.sloganUr}
                  onChange={e => handleInputChange('sloganUr', e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-950/40 border border-stone-200 dark:border-stone-850 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 dark:text-white font-sans"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Contact and Slogan Info block */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-stone-400 mb-1 flex items-center gap-1">
              <Phone className="h-3 w-3 text-stone-400" />
              <span>{isUrdu ? "فون نمبر *" : "Contact Phone *"}</span>
            </label>
            <input 
              type="text" 
              required
              value={settings.phone}
              onChange={e => handleInputChange('phone', e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-950/40 border border-stone-200 dark:border-stone-850 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-stone-400 mb-1 flex items-center gap-1">
              <Mail className="h-3 w-3 text-stone-400" />
              <span>{isUrdu ? "ای میل ایڈریس *" : "Contact Email *"}</span>
            </label>
            <input 
              type="email" 
              required
              value={settings.email}
              onChange={e => handleInputChange('email', e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-950/40 border border-stone-200 dark:border-stone-850 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-stone-400 mb-1 flex items-center gap-1">
              <MapPin className="h-3 w-3 text-stone-400" />
              <span>{isUrdu ? "مکمل پتہ (انگریزی) *" : "Address (English) *"}</span>
            </label>
            <input 
              type="text" 
              required
              value={settings.addressEn}
              onChange={e => handleInputChange('addressEn', e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-950/40 border border-stone-200 dark:border-stone-850 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-stone-400 mb-1">
              {isUrdu ? "تفصیلی پتہ (اردو) *" : "Address (Urdu) *"}
            </label>
            <input 
              type="text" 
              required
              value={settings.addressUr}
              onChange={e => handleInputChange('addressUr', e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-950/40 border border-stone-200 dark:border-stone-850 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 dark:text-white font-sans"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-stone-400 mb-1">
              {isUrdu ? "ہمارے بارے میں تفصیل (انگریزی)" : "About Information Description (English)"}
            </label>
            <textarea 
              rows={2}
              value={settings.descriptionEn}
              onChange={e => handleInputChange('descriptionEn', e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-950/40 border border-stone-200 dark:border-stone-850 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 dark:text-white resize-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase text-stone-400 mb-1">
            {isUrdu ? "ہمارے بارے میں تفصیل (اردو)" : "About Information Description (Urdu)"}
          </label>
          <textarea 
            rows={2}
            value={settings.descriptionUr}
            onChange={e => handleInputChange('descriptionUr', e.target.value)}
            className="w-full bg-stone-50 dark:bg-stone-950/40 border border-stone-200 dark:border-stone-850 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 dark:text-white font-sans resize-none"
          />
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-stone-150 dark:border-stone-800 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-800 hover:bg-red-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-stone-950 px-6 py-3 text-xs font-black transition-all cursor-pointer shadow active:scale-95"
          >
            <Save className="h-4 w-4" />
            <span>{isUrdu ? "ترتیبات محفوظ کریں" : "Save Settings"}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
