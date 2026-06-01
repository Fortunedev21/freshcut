"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { ChevronLeft, Scissors, Star, Timer, CheckCircle2, Calendar } from "lucide-react";

interface Coupe {
  id: string;
  nom: string;
  description: string;
  tempsEstimation: string;
  difficulte: number;
  image: string;
  conseils: string[];
}

export default function CutDetail() {
  const params = useParams();
  const id = params?.id as string;
  const [coupe, setCoupe] = useState<Coupe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoupe = async () => {
      try {
        const response = await fetch(`/api/coupes/${id}`);
        if (response.ok) {
          const data = await response.json();
          setCoupe(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch coupe:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCoupe();
  }, [id]);

  if (loading) {
    return (
      <main className="pt-32 px-6 pb-20 max-w-7xl mx-auto">
        <div className="text-center text-white/60">Chargement des détails...</div>
      </main>
    );
  }

  if (!coupe) {
    return (
      <div className="pt-40 text-center">
        <h2 className="text-2xl font-bold">Style non trouvé</h2>
        <Link href="/coupes" className="text-white/60 hover:text-white mt-4 block underline">Retour au lookbook</Link>
      </div>
    );
  }

  return (
    <main className="pt-32 px-6 pb-20 max-w-7xl mx-auto flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-12">
        <Link
          href="/coupes"
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-[10px] uppercase font-bold tracking-widest"
        >
          <ChevronLeft size={14} /> Retour au Lookbook
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Main Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-7 aspect-[4/5] overflow-hidden rounded-[40px]"
          >
            <img src={coupe.image} alt={coupe.nom} className="w-full h-full object-cover" />
          </motion.div>

          {/* Details Side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 space-y-10"
          >
            <div className="space-y-4">
              <h1 className="text-6xl font-bold uppercase tracking-tighter leading-none">{coupe.nom}</h1>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-white/60">
                    <Timer size={14} />
                    <span className="text-xs uppercase font-bold tracking-widest">{coupe.tempsEstimation}</span>
                </div>
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
            </div>

            <p className="text-white/60 text-lg leading-relaxed">
              {coupe.description}
            </p>

            <div className="space-y-6">
                <h3 className="text-xs uppercase font-bold tracking-[0.25em] text-white/30">Conseils d'expert</h3>
                <div className="space-y-4">
                    {coupe.conseils.map((conseil, i) => (
                        <div key={i} className="flex gap-4 items-start">
                            <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-white/5 flex items-center justify-center">
                                <CheckCircle2 size={12} className="text-white/40" />
                            </div>
                            <p className="text-sm text-white/80">{conseil}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-8 border-t border-white/5 flex flex-col gap-4">
                <Link href="/reserver" className="btn-primary py-6 text-center text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3">
                    Réserver ce style
                    <Calendar size={18} />
                </Link>
                <div className="text-center text-[10px] text-white/60 uppercase font-bold tracking-widest">
                    Consultation gratuite incluse
                </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

