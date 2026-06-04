"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useCart } from "@/contexts/CartContext";
import { ChevronLeft, ShoppingBag, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { formatPrice } from "@/utils/format";

interface Product {
  id: string;
  nom: string;
  categorie: string;
  prix: number;
  description: string;
  image: string | null;
}

export default function ProductDetail() {
  const params = useParams();
  const id = params?.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!id) return;
    
    async function getSingleProduct() {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error("Produit introuvable");
        
        const responseJson = await res.json();
        
        // C'est ici qu'on extrait la clé "data" de ta réponse API
        if (responseJson && responseJson.success && responseJson.data) {
          setProduct(responseJson.data);
        } else {
          // Au cas où le format varie ou s'il s'agit d'un retour direct
          setProduct(responseJson);
        }
      } catch (error) {
        console.error("Erreur Fetch Detail Produit:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    getSingleProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="pt-40 text-center text-muted uppercase text-xs tracking-widest animate-pulse">
        Chargement du produit...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-40 text-center">
        <h2 className="text-2xl font-bold uppercase tracking-tight">Produit non trouvé</h2>
        <Link href="/boutique" className="text-muted hover:text-white mt-4 block underline text-xs font-bold uppercase tracking-widest">
          Retour à la boutique
        </Link>
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
        {/* Affichage de l'image réelle ou du placeholder */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="aspect-square glass-card flex items-center justify-center overflow-hidden"
        >
          {product.image ? (
            <img src={product.image} alt={product.nom} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full border border-white/5 rotate-12 flex items-center justify-center opacity-20">
              <ShoppingBag size={120} strokeWidth={0.5} />
            </div>
          )}
        </motion.div>

        {/* Informations */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <span className="text-[10px] uppercase font-bold text-muted tracking-[0.2em]">{product.categorie}</span>
            <h1 className="text-5xl md:text-6xl font-bold uppercase tracking-tighter leading-none">{product.nom}</h1>
            {/* Utilisation sécurisée avec fallback à 0 si le prix venait à manquer */}
            <p className="text-3xl font-bold text-white/90">{formatPrice(product.prix ?? 0)} FCFA</p>
          </div>

          <p className="text-secondary leading-relaxed text-lg">
            {product.description}
          </p>

          <div className="pt-8 border-t border-white/5 space-y-6">
            <button 
              onClick={() => addToCart({ id: product.id, nom: product.nom, categorie: product.categorie, prix: product.prix })}
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