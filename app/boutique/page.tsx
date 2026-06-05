"use client";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/utils/format";

type CategorieProduit = "BARBE" | "CHEVEUX" | "ACCESSOIRES" | "MERCHANDISING";

interface Product {
  id: string;
  nom: string;
  categorie: string; // Doit matcher le modèle Prisma (String)
  prix: number;
  description: string;
  image: string | null;
}

const CATEGORIES: { id: CategorieProduit | "TOUT"; label: string }[] = [
  { id: "TOUT", label: "Tous les produits" },
  { id: "BARBE", label: "Barbe" },
  { id: "CHEVEUX", label: "Cheveux" },
  { id: "ACCESSOIRES", label: "Accessoires" },
  { id: "MERCHANDISING", label: "Merch" },
];

export default function Boutique() {
  const [activeCategory, setActiveCategory] = useState<CategorieProduit | "TOUT">("TOUT");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    async function getProducts() {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Échec du chargement");
        
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data && Array.isArray(data.products)) {
          setProducts(data.products);
        } else if (data && Array.isArray(data.data)) {
          setProducts(data.data);
        }
      } catch (error) {
        console.error("Erreur Fetch Boutique:", error);
      } finally {
        setIsLoading(false);
      }
    }
    getProducts();
  }, []);

  const filteredProducts = activeCategory === "TOUT" 
    ? products 
    : products.filter(p => p.categorie?.toUpperCase() === activeCategory);

  return (
    <main className="pt-32 px-6  mx-auto pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter">La Boutique</h1>
            <p className="text-secondary max-w-md">Produits de soins premium et merchandising exclusif Freshcut 229.</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold rounded-full transition-all duration-300 ${
                  activeCategory === cat.id 
                    ? "bg-white text-black" 
                    : "glass-card text-muted hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout" initial={false}>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <motion.div 
                  key={`skeleton-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-card aspect-[3/4] p-6 flex flex-col"
                >
                  <Skeleton className="flex-1 mb-6" />
                  <div className="space-y-3">
                    <Skeleton width="40%" height={12} />
                    <Skeleton width="80%" height={24} />
                    <div className="pt-4 border-t border-glass flex justify-between items-center">
                      <Skeleton width="50%" height={24} />
                      <Skeleton width={32} height={32} circle />
                    </div>
                  </div>
                </motion.div>
              ))
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted text-sm uppercase tracking-wider">
                Aucun produit dans cette catégorie
              </div>
            ) : (
              filteredProducts.map((product) => (
                <motion.div
                  layout
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ 
                    opacity: { duration: 0.2 },
                    layout: { type: "spring", stiffness: 300, damping: 30 }
                  }}
                  className="glass-card aspect-[3/4] p-6 flex flex-col group cursor-pointer"
                  onClick={() => router.push(`/boutique/${product.id}`)}
                >
                  <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.nom} className="w-full h-full object-cover rounded transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-24 h-24 border border-white/20 rotate-45 opacity-20 group-hover:opacity-40 transition-opacity" />
                    )}
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted">{product.categorie}</div>
                    <h3 className="font-bold uppercase tracking-tight text-lg leading-tight group-hover:text-white transition-colors line-clamp-1">{product.nom}</h3>
                    <div className="pt-4 border-t border-white/[0.08] flex justify-between items-center">
                      <span className="font-bold text-xl">{formatPrice(product.prix)} FCFA</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); // Stop redirection
                          addToCart({ id: product.id, nom: product.nom, categorie: product.categorie, prix: product.prix });
                        }}
                        className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </main>
  );
}