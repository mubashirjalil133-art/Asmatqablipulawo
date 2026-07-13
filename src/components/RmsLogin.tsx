/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, AlertCircle, Eye, EyeOff, CheckCircle2, ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import Logo from './Logo';

interface RmsLoginProps {
  language: 'en' | 'ur';
  onSuccess: (role: string) => void;
  onCancel: () => void;
}

export default function RmsLogin({ language, onSuccess, onCancel }: RmsLoginProps) {
  const isUrdu = language === 'ur';
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load dynamic staff list for custom logins
  const [dynamicStaff, setDynamicStaff] = useState<any[]>([]);
  React.useEffect(() => {
    const savedStaff = localStorage.getItem('asmat_rms_staff');
    if (savedStaff) {
      setDynamicStaff(JSON.parse(savedStaff));
    }
  }, []);

  // Define valid PINs - Restricted to Admin only as requested
  const pins: { [key: string]: { role: string; labelEn: string; labelUr: string } } = {
    '1234': { role: 'admin', labelEn: 'Administrator', labelUr: 'ایڈمنسٹریٹر' },
  };

  const handleKeyPress = (num: string) => {
    setError('');
    if (pin.length < 4) {
      setPin(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    setError('');
    if (pin.length > 0) {
      setPin(prev => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    setError('');
    setPin('');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin.length < 4) {
      setError(isUrdu ? "برائے مہربانی ۴ ہندسوں کا پن کوڈ درج کریں۔" : "Please enter a valid 4-digit PIN code.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Only Admin is allowed to access
      if (pin === '1234') {
        onSuccess('admin');
      } else if (pins[pin]) {
        onSuccess(pins[pin].role);
      } else {
        const matchedStaff = dynamicStaff.find(s => s.pin === pin);
        if (matchedStaff && matchedStaff.role === 'admin') {
          if (matchedStaff.status === 'inactive') {
            setError(isUrdu ? "یہ ایڈمن اکاؤنٹ معطل ہے!" : "This admin account is suspended!");
            setPin('');
            setLoading(false);
            return;
          }
          onSuccess('admin');
        } else {
          setError(isUrdu ? "غلط پن کوڈ! صرف ایڈمنسٹریٹر کو رسائی حاصل ہے۔" : "Incorrect PIN! Only the Administrator can access this area.");
          setPin('');
          setLoading(false);
        }
      }
    }, 600);
  };

  return (
    <div id="rms-login-screen-root" className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6" style={{ direction: isUrdu ? 'rtl' : 'ltr' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-stone-900/95 border-2 border-amber-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-white text-center"
      >
        {/* Background glow effects */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-red-800/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex justify-center mb-6">
          <Logo className="h-16 w-16" showText={false} />
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight">
          {isUrdu ? "سٹاف پورٹل سیکیور لاگ ان" : "Staff RMS Access Portal"}
        </h2>
        <p className="text-xs text-stone-400 mt-2 max-w-sm mx-auto leading-relaxed">
          {isUrdu 
            ? "عصمت کابلی پلاؤ اینڈ ہوٹل سرائے نورنگ۔ یہ مینیجمنٹ ڈیش بورڈ صرف مجاز عملے کے لیے مخصوص ہے۔"
            : "Asmat Kabuli Pulao & Hotel Sarai Naurang. This terminal is strictly reserved for authorized personnel."}
        </p>

        {/* PIN Entry Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="relative">
            {/* Displaying PIN dots or numbers */}
            <div className="flex items-center justify-center gap-3 bg-stone-950/70 py-4 px-6 rounded-2xl border border-stone-800/80 relative">
              <Lock className="h-4 w-4 text-amber-500 absolute left-4" />
              
              <div className="flex justify-center items-center gap-4 py-1">
                {[0, 1, 2, 3].map((index) => {
                  const hasValue = pin.length > index;
                  return (
                    <motion.div
                      key={index}
                      animate={hasValue ? { scale: [1, 1.2, 1] } : {}}
                      className={`h-4 w-4 rounded-full border-2 transition-all ${
                        hasValue 
                          ? 'bg-amber-500 border-amber-500 shadow-md shadow-amber-500/40' 
                          : 'bg-transparent border-stone-700'
                      }`}
                    />
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-4 text-stone-500 hover:text-stone-300 transition-colors p-1"
                title={showPin ? "Hide PIN" : "Show PIN"}
              >
                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Read-only PIN text representation when toggled */}
            {showPin && pin.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-amber-400 font-mono text-sm mt-2 font-bold tracking-widest text-center"
              >
                {pin}
              </motion.div>
            )}
          </div>

          {/* Feedback/Error Message */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-xs text-left justify-center"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="font-semibold">{error}</span>
            </motion.div>
          )}

          {/* Customized Keypad (Numeric layout) */}
          <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                disabled={loading}
                onClick={() => handleKeyPress(num)}
                className="h-14 rounded-xl bg-stone-800 hover:bg-stone-700 active:bg-amber-500 active:text-stone-950 text-stone-100 font-mono text-xl font-bold transition-all border border-stone-800 shadow-md cursor-pointer flex items-center justify-center disabled:opacity-50"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              disabled={loading}
              onClick={handleClear}
              className="h-14 rounded-xl bg-stone-950 hover:bg-stone-900 text-stone-400 text-xs font-black uppercase transition-all border border-stone-800/40 cursor-pointer flex items-center justify-center disabled:opacity-50"
            >
              {isUrdu ? "صاف کریں" : "Clear"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleKeyPress('0')}
              className="h-14 rounded-xl bg-stone-800 hover:bg-stone-700 active:bg-amber-500 active:text-stone-950 text-stone-100 font-mono text-xl font-bold transition-all border border-stone-800 shadow-md cursor-pointer flex items-center justify-center disabled:opacity-50"
            >
              0
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleBackspace}
              className="h-14 rounded-xl bg-stone-950 hover:bg-stone-900 text-stone-400 text-xs font-black uppercase transition-all border border-stone-800/40 cursor-pointer flex items-center justify-center disabled:opacity-50"
            >
              {isUrdu ? "مٹائیں" : "Delete"}
            </button>
          </div>

          {/* Main Action Buttons */}
          <div className="pt-2 flex flex-col gap-3">
            <button
              type="button"
              disabled={loading || pin.length < 4}
              onClick={() => handleSubmit()}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-red-800 to-red-950 hover:from-red-700 hover:to-red-800 border border-amber-500/20 text-stone-100 text-sm font-black shadow-lg shadow-red-950/40 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>{isUrdu ? "تصدیق کی جا رہی ہے..." : "Authenticating..."}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>{isUrdu ? "آئی ڈی لاگ ان کریں" : "Confirm Passcode"}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2.5 rounded-xl text-stone-400 hover:text-stone-200 text-xs font-black transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{isUrdu ? "← واپس گاہک مینیو پر جائیں" : "← Cancel & Go Back to Menu"}</span>
            </button>
          </div>
        </form>

        {/* Quick Simulation Help Card */}
        <div className="mt-8 pt-6 border-t border-stone-800 text-center">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block mb-2">
            🔒 {isUrdu ? "انتظامی لاگ ان معلومات" : "ADMINISTRATOR PASSCODE"}
          </span>
          <div className="inline-block bg-stone-950/40 px-4 py-2 rounded-xl border border-stone-800/50 text-[11px] text-stone-300">
            {isUrdu ? "ٹیٹنگ کے لیے ایڈمن پن کوڈ درج کریں: " : "For testing, enter Admin PIN: "}
            <span className="font-extrabold text-amber-400 font-mono text-xs">1234</span>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
