"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/utils/format";

interface Product {
  id: string;
  nom: string;
  categorie: string;
  prix: number;
  image: string | null;
}

export default function BoutiquePreview() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    async function fetchPreviewProducts() {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Erreur réseau");
        
        const data = await response.json();
        
        // Extraction sécurisée
        let rawProducts: Product[] = [];
        if (Array.isArray(data)) rawProducts = data;
        else if (data && Array.isArray(data.products)) rawProducts = data.products;
        else if (data && Array.isArray(data.data)) rawProducts = data.data;

        setProducts(rawProducts.slice(0, 3));
      } catch (error) {
        console.error("Erreur Fetch Preview:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPreviewProducts();
  }, []);

  return (
    <section className="py-16 px-5 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-[11px] uppercase tracking-[0.12em] text-white/35 font-medium">Boutique</h2>
          <p className="text-[12px] text-white/35 mt-2">Cosmétiques & Merchandising</p>
        </div>
        <Link href="/boutique" className="text-[11px] text-white/30 hover:text-white transition-colors font-medium uppercase tracking-widest">
          Voir tout →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card aspect-square animate-pulse p-6 flex flex-col justify-between opacity-40">
              <div className="w-full h-2/3 bg-white/5 rounded" />
              <div className="space-y-2">
                <div className="h-3 bg-white/10 rounded w-1/3" />
                <div className="h-4 bg-white/10 rounded w-3/4" />
              </div>
            </div>
          ))
        ) : products.length === 0 ? (
          <div className="col-span-full text-center py-8 text-white/20 text-xs tracking-wider uppercase">
            Aucun produit disponible
          </div>
        ) : (
          products.map((product) => (
            <div 
              key={product.id} 
              className="group cursor-pointer"
              onClick={() => router.push(`/boutique/${product.id}`)}
            >
              <div className="aspect-square glass-card mb-4 overflow-hidden border-white/5 relative flex items-center justify-center">
                {product.image ? (
                  <img src={product.image} alt={product.nom} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <>
                    <div className="w-full h-full absolute inset-0 bg-gradient-to-br from-white/5 to-transparent transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity">
                      <div className="w-16 h-16 border border-white rotate-45" />
                    </div>
                  </>
                )}
              </div>

              <div className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1">{product.categorie}</div>
              <div className="text-[14px] font-bold text-white mb-2 uppercase tracking-tight group-hover:text-white/80 transition-colors line-clamp-1">{product.nom}</div>

              <div className="flex justify-between items-center pt-2 border-t border-white/[0.05]">
                <span className="text-[14px] font-semibold text-white tracking-tight">{formatPrice(product.prix)} FCFA</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart({ id: product.id, nom: product.nom, categorie: product.categorie, prix: product.prix });
                  }}
                  className="text-[9px] uppercase tracking-[0.15em] font-bold text-white/40 border border-white/10 rounded-full px-3 py-1 hover:bg-white hover:text-black hover:border-white transition-all"
                >
                  Ajouter
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}