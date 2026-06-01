"use client";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Scissors, Star, Timer, ArrowRight, X, Maximize2 } from "lucide-react";

interface Coupe {
  id: string;
  nom: string;
  description: string;
  tempsEstimation: string;
  difficulte: number;
  image: string;
  conseils: string[];
}

export default function Coupes() {
  const [coupes, setCoupes] = useState<Coupe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoupes = async () => {
      try {
        const response = await fetch('/api/coupes');
        if (response.ok) {
          const data = await response.json();
          setCoupes(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch coupes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupes();
  }, []);

  if (loading) {
    return (
      <main className="pt-32 px-6 pb-20 max-w-7xl mx-auto">
        <div className="text-center text-white/60">Chargement des coupes...</div>
      </main>
    );
  }

  return (
    <main className="pt-32 px-6 pb-20 max-w-7xl mx-auto space-y-24">
      <header className="space-y-6 max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-bold uppercase tracking-tighter leading-none">Lookbook <br /><span className="text-white/20 hover:text-white transition-colors cursor-default">Signature Styles</span></h1>
        <p className="text-secondary text-lg">Découvrez les coupes qui définissent l'excellence chez Freshcut 229. Choisissez votre style, nous nous occupons de la perfection.</p>
      </header>

      {/* Main Styles List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {coupes.map((coupe, i) => (
          <motion.div
            key={coupe.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative"
          >
            <Link href={`/coupes/${coupe.id}`} className="block glass-card overflow-hidden rounded-3xl">
              <div className="aspect-[16/9] relative overflow-hidden">
                <img
                  src={coupe.image}
                  alt={coupe.nom}
                  className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-transparent to-transparent opacity-60" />

                <div className="absolute top-6 left-6 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-white/10">
                  <Timer size={12} className="text-white/60" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{coupe.tempsEstimation}</span>
                </div>
              </div>

              <div className="p-8 flex justify-between items-end">
                <div className="space-y-3">
                  <h3 className="text-3xl font-bold uppercase tracking-tighter group-hover:translate-x-2 transition-transform duration-500">{coupe.nom}</h3>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        size={10}
                        className={idx < coupe.difficulte ? "text-white fill-white" : "text-white/10"}
                      />
                    ))}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                  <ArrowRight size={18} />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Galerie de Coupes Section */}
      <section className="space-y-12">
        <div className="space-y-4">
          <h2 className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/30">L'Art du Détail</h2>
          <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter">Galerie de coupes</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {coupes.map((coupe, i) => (
            <motion.div
              key={`gallery-${coupe.id}`}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl cursor-zoom-in"
              onClick={() => setSelectedImage(coupe.image)}
            >
              <img
                src={coupe.image}
                alt={coupe.nom}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/20 scale-50 group-hover:scale-100 transition-transform duration-500">
                  <Maximize2 size={20} />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white">{coupe.nom}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative z-10 w-full max-w-5xl aspect-video rounded-3xl overflow-hidden bg-white/5 border border-white/10"
            >
              <img
                src={selectedImage}
                alt="Enlarged Cut"
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full border border-white/10 transition-colors"
              >
                <X size={24} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-white/[0.03] p-12 rounded-3xl text-center space-y-6">
        <Scissors size={40} className="mx-auto text-white/10" />
        <h2 className="text-2xl font-bold uppercase tracking-tighter">Prêt pour votre transformation ?</h2>
        <Link href="/reserver" className="btn-primary px-12 py-4 inline-block text-[11px]">Prendre rendez-vous</Link>
      </div>
    </main>
  );
}

