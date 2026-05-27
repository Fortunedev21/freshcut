"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { PRODUCTS } from "@/data/boutique";
import { useCart } from "@/contexts/CartContext";
import { ChevronLeft, ShoppingBag, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { formatPrice } from "@/utils/format";

export default function ProductDetail() {
  const params = useParams();
  const id = params?.id as string;
  const product = PRODUCTS.find(p => p.id === id);
  const { addToCart } = useCart();

  if (!product) {
    return (
      <div className="pt-40 text-center">
        <h2 className="text-2xl font-bold">Produit non trouvé</h2>
        <Link href="/boutique" className="text-muted hover:text-white mt-4 block underline">Retour à la boutique</Link>
      </div>
    );
  }

  return (
    <main className="pt-32 px-6 pb-20 max-w-7xl mx-auto">
      <Link 
        href="/boutique" 
        className="flex items-center gap-2 text-muted hover:text-white transition-colors mb-12 text-[10px] uppercase font-bold tracking-widest"
      >
        <ChevronLeft size={14} /> Retour Boutique
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        {/* Placeholder Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="aspect-square glass-card flex items-center justify-center p-20"
        >
          <div className="w-full h-full border border-white/5 rotate-12 flex items-center justify-center opacity-20">
              <ShoppingBag size={120} strokeWidth={0.5} />
          </div>
        </motion.div>

        {/* Info */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <span className="text-[10px] uppercase font-bold text-muted tracking-[0.2em]">{product.categorie}</span>
            <h1 className="text-5xl md:text-6xl font-bold uppercase tracking-tighter leading-none">{product.nom}</h1>
            <p className="text-3xl font-bold text-white/90">{formatPrice(product.prix)} FCFA</p>
          </div>

          <p className="text-secondary leading-relaxed text-lg">
            {product.description}
          </p>

          <div className="pt-8 border-t border-white/5 space-y-6">
            <button 
              onClick={() => addToCart(product)}
              className="w-full btn-primary py-6 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-4 group"
            >
              Ajouter au panier
              <ShoppingBag size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <Truck size={20} className="text-white/20" />
                <span className="text-[9px] uppercase font-bold tracking-widest text-muted">Livraison 24h</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <ShieldCheck size={20} className="text-white/20" />
                <span className="text-[9px] uppercase font-bold tracking-widest text-muted">Original Garanti</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <RotateCcw size={20} className="text-white/20" />
                <span className="text-[9px] uppercase font-bold tracking-widest text-muted">Retrait Boutique</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
