"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface BookingRecord {
  id: string;
  date: string;
  service: string;
  price: number;
}

interface LoyaltyContextType {
  points: number;
  history: BookingRecord[];
  addBooking: (service: string, price: number) => void;
  phone: string | null;
  setPhone: (phone: string) => void;
}

const LoyaltyContext = createContext<LoyaltyContextType | undefined>(undefined);

export const LoyaltyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [phone, setPhoneState] = useState<string | null>(null);
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState<BookingRecord[]>([]);

  useEffect(() => {
    // Initialize from localStorage on client side only
    const savedPhone = localStorage.getItem("fc_phone");
    if (savedPhone) {
      setPhoneState(savedPhone);
    }
  }, []);

  useEffect(() => {
    if (phone) {
      const savedData = localStorage.getItem(`fc_loyalty_${phone}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setPoints(parsed.points || 0);
        setHistory(parsed.history || []);
      } else {
        // Reset if new phone
        setPoints(0);
        setHistory([]);
      }
    }
  }, [phone]);

  const setPhone = (newPhone: string) => {
    setPhoneState(newPhone);
    localStorage.setItem("fc_phone", newPhone);
  };

  const addBooking = (service: string, price: number) => {
    if (!phone) return;

    const newBooking: BookingRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString("fr-FR"),
      service,
      price,
    };

    const newHistory = [newBooking, ...history];
    const newPoints = (points + 1) % 10;

    setPoints(newPoints);
    setHistory(newHistory);

    localStorage.setItem(`fc_loyalty_${phone}`, JSON.stringify({
      points: newPoints,
      history: newHistory
    }));
  };

  return (
    <LoyaltyContext.Provider value={{ points, history, addBooking, phone, setPhone }}>
      {children}
    </LoyaltyContext.Provider>
  );
};

export const useLoyalty = () => {
  const context = useContext(LoyaltyContext);
  if (!context) throw new Error("useLoyalty must be used within a LoyaltyProvider");
  return context;
};
