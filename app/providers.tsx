"use client";
import { CartProvider } from "@/contexts/CartContext";
import { LoyaltyProvider } from "@/contexts/LoyaltyContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <LoyaltyProvider>
        {children}
      </LoyaltyProvider>
    </CartProvider>
  );
}
