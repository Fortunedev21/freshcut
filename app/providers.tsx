"use client";
import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/contexts/CartContext";
import { LoyaltyProvider } from "@/contexts/LoyaltyContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        <LoyaltyProvider>
          {children}
        </LoyaltyProvider>
      </CartProvider>
    </SessionProvider>
  );
}
