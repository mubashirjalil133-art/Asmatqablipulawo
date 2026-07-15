/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  inverted?: boolean;
}

export default function Logo({ className = "h-12 w-12", showText = true, inverted = false }: LogoProps) {
  const [logoSrc, setLogoSrc] = useState("/logo.png?v=3");
  const [nameEn, setNameEn] = useState("ASMAT HOTEL & RESTAURANT");
  const [sloganEn, setSloganEn] = useState("KABULI PULAO & HOTEL");

  const loadSettings = () => {
    const saved = localStorage.getItem('asmat_rms_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.nameEn) setNameEn(parsed.nameEn);
        if (parsed.sloganEn) setSloganEn(parsed.sloganEn);
        if (parsed.logo) {
          setLogoSrc(parsed.logo);
        } else {
          setLogoSrc("/logo.png?v=3");
        }
      } catch (e) {
        // Fallback to default
      }
    } else {
      setNameEn("ASMAT HOTEL & RESTAURANT");
      setSloganEn("KABULI PULAO & HOTEL");
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

  return (
    <div id="brand-logo-container" className="flex items-center gap-3 select-none">
      <img
        src={logoSrc}
        alt={nameEn}
        className={`${className} object-contain transition-transform duration-350 hover:scale-105 rounded-full`}
        referrerPolicy="no-referrer"
        onError={(e) => {
          // If custom logo fails, fallback to default
          e.currentTarget.src = "/logo.png?v=3";
        }}
      />

      {showText && (
        <div id="brand-text-block" className="flex flex-col">
          <span 
            id="brand-title-en" 
            className={`font-sans font-bold tracking-tight text-sm sm:text-base leading-tight ${
              inverted ? 'text-white' : 'text-stone-900 dark:text-white'
            }`}
          >
            {nameEn}
          </span>
          <span 
            id="brand-subtitle-en" 
            className="font-mono text-[9px] tracking-widest uppercase font-semibold text-amber-500 dark:text-amber-400 leading-none"
          >
            {sloganEn}
          </span>
        </div>
      )}
    </div>
  );
}
