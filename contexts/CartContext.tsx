"use client";
import React, { createContext, useContext, useState } from "react";

export interface CartItem {
  id: string;
  nom: string;
  categorie: string;
  prix: number;
  quantite: number;
  type?: "product" | "service" | "coupe"; // Type de l'article
  description?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: { id: string; nom: string; categorie: string ; prix: number; type?: string; description?: string }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product: { id: string; nom: string; categorie: string ; prix: number; type?: string; description?: string }) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantite: item.quantite + 1 } : item
        );
      }
      return [...prev, {
        id: product.id,
        nom: product.nom,
        categorie: product.categorie,
        prix: product.prix,
        quantite: 1,
        type: (product.type as "product" | "service" | "coupe") || "product",
        description: product.description
      }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantite + delta);
        return { ...item, quantite: newQty };
      }
      return item;
    }).filter(item => item.quantite > 0));
  };

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((acc, item) => acc + item.prix * item.quantite, 0);
  const itemCount = items.reduce((acc, item) => acc + item.quantite, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      total,
      itemCount,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
