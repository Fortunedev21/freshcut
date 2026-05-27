"use client";
import { motion, AnimatePresence } from "motion/react";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";
import { formatPrice } from "@/utils/format";

export default function CartDrawer() {
  const { items, total, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-bg-base border-l border-white/[0.08] z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/[0.08] flex justify-between items-center bg-bg-base/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-white/40" />
                <h2 className="text-xl font-bold uppercase tracking-tighter">Votre Panier</h2>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                    <ShoppingBag size={24} className="text-white/20" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-white/60 font-medium">Votre panier est vide</p>
                    <Link 
                      href="/boutique" 
                      onClick={() => setIsCartOpen(false)}
                      className="text-xs text-white uppercase tracking-widest font-bold hover:underline"
                    >
                      Découvrir nos produits
                    </Link>
                  </div>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-20 h-24 bg-white/5 rounded-lg flex items-center justify-center text-white/20 uppercase text-[10px] font-bold tracking-widest text-center px-2">
                      {item.nom.split(' ')[0]}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold uppercase tracking-tight text-sm leading-tight">{item.nom}</h3>
                          <p className="text-xs text-white/40 mt-1">{formatPrice(item.prix)} FCFA</p>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-white/20 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center bg-white/5 rounded-full border border-white/5">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1.5 hover:text-white transition-colors text-white/40"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-xs font-bold">{item.quantite}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1.5 hover:text-white transition-colors text-white/40"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="text-sm font-bold">
                          {formatPrice(item.prix * item.quantite)} F
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-white/[0.08] bg-white/[0.02] space-y-4">
                <div className="flex justify-between items-end">
                  <div className="text-[10px] uppercase font-bold text-white/40 tracking-[0.2em]">Total</div>
                  <div className="text-2xl font-bold tracking-tighter">{formatPrice(total)} FCFA</div>
                </div>
                <button className="w-full btn-primary py-4 text-xs font-bold uppercase tracking-widest">
                  Commander maintenant
                </button>
                <p className="text-[10px] text-center text-white/30 uppercase tracking-widest">
                  Livraison à Cotonou disponible (24h-48h)
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
