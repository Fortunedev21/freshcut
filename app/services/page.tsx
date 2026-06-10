"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { faqs } from "@/data/faqs";
import { formatPrice } from "@/utils/format";

interface ServiceData {
  id: string;
  nom: string;
  description: string;
  duree: number;
  categorie: string;
  badge?: string | null;
  prix: number;
}

export default function Services() {
  const [dbServices, setDbServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Tout");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const categories = ["Tout", "COIFFURE_BARBE", "TRESSES_NATTES"];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/services");
        if (response.ok) {
          const result = await response.json();
          const servicesArray = Array.isArray(result) ? result : result.data || [];
          setDbServices(servicesArray);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des services :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const filteredServices = activeCategory === "Tout" 
    ? dbServices 
    : dbServices.filter(s => s.categorie?.toUpperCase() === activeCategory.toUpperCase());

  return (
    <main className="bg-bg-base min-h-screen selection:bg-white selection:text-black">
      <header className="pt-40 pb-12 px-5 max-w-7xl mx-auto w-full border-b border-white/[0.06]">
        <div className="space-y-4">
          <span className="text-[11px] uppercase tracking-[0.15em] text-white/30 font-medium">Prestations · Tarifs</span>
          <h1 className="text-[clamp(32px,6vw,56px)] font-semibold leading-tight text-white tracking-tight">Nos services</h1>
          <p className="text-sm text-white/40 max-w-md">Découvrez notre carte de soins, coupes et tresses sur-mesure ajustée à votre profil.</p>
          <div className="flex gap-4 pt-4">
            <Link href="/reserver" className="btn-primary">Réserver maintenant</Link>
            <a href="#services" className="btn-secondary">Voir les tarifs</a>
          </div>
        </div>
      </header>

      <section className="bg-[#090909] border-b border-white/[0.06] py-4 px-5">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-2.5">
          {[
            { label: "Horaires", valeur: "Lun–Sam · 9h–20h" },
            { label: "Durée moyenne", valeur: "20 à 120 min" },
            { label: "Réservation", valeur: "Acompte requis" },
          ].map((info, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/[0.10] rounded-[10px] p-2.5">
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{info.label}</div>
              <div className="text-[12px] font-medium text-white/75">{info.valeur}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="services" className="pt-12 px-5 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.04] pb-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-[11px] font-medium transition-all duration-200 ease-out border ${
                  activeCategory === cat 
                    ? "bg-white/12 text-white border-white/30" 
                    : "border-white/15 text-white/45 hover:text-white"
                }`}
              >
                {cat === "COIFFURE_BARBE" ? "Coiffure & Barbe" : cat === "TRESSES_NATTES" ? "Tresses & Nattes" : cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-white/40 text-sm tracking-wide animate-pulse">
            Chargement de la carte des services...
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-20 text-white/40 text-sm">
            Aucun service disponible dans cette catégorie pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {filteredServices.map((service) => {
              return (
                <div key={service.id} className="glass-card p-4.5 flex flex-col gap-1.5 h-full group hover:border-white/20 hover:bg-white/[0.07] transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-medium text-white uppercase tracking-tight">{service.nom}</h3>
                    {service.badge && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/14 text-white/80 font-bold uppercase tracking-widest">
                        {service.badge}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-[12px] text-white/38 leading-[1.5] line-clamp-2">{service.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-1 underline-offset-4">
                    <span className="text-[11px] text-white/30 font-medium">~ {service.duree} min</span>
                    <span className="w-1 h-1 rounded-full bg-white/10" />
                    <span className="text-base font-semibold text-white tracking-tight">
                      {formatPrice(service.prix)} <span className="text-[10px] text-white/30 font-normal uppercase tracking-widest">FCFA</span>
                    </span>
                  </div>
                  
                  <Link 
                    href={`/reserver?service=${service.id}`} 
                    className="mt-auto pt-3 border-t border-white/[0.07] text-[11px] text-white/38 hover:text-white/70 flex justify-between items-center transition-colors"
                  >
                    <span>Réserver ce service</span>
                    <span>→</span>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="py-20 px-5 border-t border-white/[0.06] max-w-7xl mx-auto w-full mt-12">
        <h2 className="text-[11px] uppercase tracking-[0.12em] text-white/35 mb-6 font-medium">FAQ</h2>
        <div className="max-w-2xl mx-auto">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className="border-b border-white/[0.07] py-3.5 cursor-pointer"
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <div className="flex justify-between items-center text-sm font-medium text-white transition-colors">
                <span>{faq.q}</span>
                <span className="text-white/30 text-lg leading-none">{openFaq === i ? "−" : "+"}</span>
              </div>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="text-[13px] text-white/38 leading-[1.6] pt-2.5">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      <section className="py-14 px-5 text-center bg-white/[0.02] border-t border-white/[0.06] flex flex-col items-center gap-3">
        <h2 className="text-[clamp(22px,4vw,36px)] font-semibold text-white tracking-tight">Prêt à réserver ?</h2>
        <p className="text-sm text-white/38">Choisissez votre service et bloquez votre créneau.</p>
        <Link href="/reserver" className="btn-primary mt-2">Réserver maintenant</Link>
        <span className="text-[11px] text-white/22 mt-4">Solde ou acompte réglé en ligne ou en salon</span>
      </section>
    </main>
  );
}