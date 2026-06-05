"use client";

import React from "react";
import Input, { Country } from "react-phone-number-input";
import "react-phone-number-input/style.css";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export default function PhoneInput({ value, onChange, placeholder = "Numéro de téléphone", required = true }: PhoneInputProps) {
  return (
    <div className="space-y-2 global-phone-input">
      <label className="text-[10px] uppercase tracking-widest text-muted font-bold block">
        Téléphone (Format International)
      </label>
      
      <div className="relative">
        <Input
          international
          defaultCountry="BJ" // Par défaut sur le Bénin 🇧🇯
          value={value}
          onChange={(val) => onChange(val || "")}
          placeholder={placeholder}
          required={required}
          className="flex items-center gap-2 h-[54px] w-full glass-card border border-white/10 rounded px-4 text-sm text-white focus-within:border-white/30 transition-all duration-300"
        />
      </div>

      {/* Surcharge CSS inline pour forcer le thème sombre de la boutique sur le sélecteur */}
      <style jsx global>{`
        .global-phone-input .PhoneInputCountry {
          gap: 6px;
        }
        .global-phone-input .PhoneInputCountrySelect {
          background-color: #121212 !important;
          color: white !important;
          font-size: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 4px;
          border-radius: 4px;
        }
        .global-phone-input .PhoneInputInput {
          background: transparent !important;
          border: none !important;
          color: white !important;
          outline: none !important;
          font-family: inherit;
          width: 100%;
        }
        .global-phone-input .PhoneInputInput::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }
        .global-phone-input .PhoneInputCountrySelectArrow {
          color: rgba(255, 255, 255, 0.4);
          border-bottom-color: currentColor;
          border-right-color: currentColor;
        }
      `}</style>
    </div>
  );
}