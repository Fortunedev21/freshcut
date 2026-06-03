"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { faqs } from "@/data/faqs";
import { formatPrice } from "@/utils/format";

// Définition de l'interface pour typer tes services dynamiques
interface ServiceData {
  id: string;
  nom: string;
  description: string;
  prix: number;
  duree: number;
  categorie: string;
  badge?: string;
}

export default function Services() {
  // États pour les services de la BD et le chargement
  const [dbServices, setDbServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeCategory, setActiveCategory] = useState("Tout");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const categories = ["Tout", "Coupe", "Barbe", "Soins", "Combos"];

  // Récupération des services depuis l'API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/services"); // Ajuste l'URL selon ta route API
        if (response.ok) {
          const result = await response.json();
          // S'adapte si ton API renvoie { data: [...] } ou directement [...]
          setDbServices(result.data || result);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des services :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Filtrage basé sur les services de la BD
  const filteredServices = activeCategory === "Tout" 
    ? dbServices 
    : dbServices.filter(s => s.categorie === activeCategory);

  return (
    <main className="bg-bg-base min-h-screen selection:bg-white selection:text-black">
      {/* 1. Header de page */}
      <header className="pt-40 pb-12 px-5 max-w-7xl mx-auto w-full border-b border-white/[0.06]">
        <div className="space-y-4">
          <span className="text-[11px] uppercase tracking-[0.15em] text-white/30 font-medium">Prestations · Tarifs</span>
          <h1 className="text-[clamp(32px,6vw,56px)] font-semibold leading-tight text-white tracking-tight">Nos services</h1>
          <p className="text-sm text-white/40 max-w-md">Coupe, barbe, soin — tout ce qu'il faut pour être au top.</p>
          <div className="flex gap-4 pt-4">
            <Link href="/reserver" className="btn-primary">Réserver maintenant</Link>
            <a href="#services" className="btn-secondary">Voir les tarifs</a>
          </div>
        </div>
      </header>

      {/* 2. Info strip */}
      <section className="bg-[#090909] border-b border-white/[0.06] py-4 px-5">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-2.5">
          {[
            { label: "Horaires", valeur: "Lun–Sam · 9h–20h" },
            { label: "Durée moyenne", valeur: "30 à 60 min" },
            { label: "Avance", valeur: "500 FCFA" },
          ].map((info, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/[0.10] rounded-[10px] p-2.5">
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{info.label}</div>
              <div className="text-[12px] font-medium text-white/75">{info.valeur}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. ServicesGrid */}
      <section id="services" className="py-12 px-5 max-w-7xl mx-auto w-full">
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-[11px] font-medium transition-all duration-200 ease-out border ${
                activeCategory === cat 
                  ? "bg-white/12 text-white border-white/30" 
                  : "border-white/15 text-white/45 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          /* Squelette ou message de chargement */
          <div className="text-center py-20 text-white/40 text-sm tracking-wide animate-pulse">
            Chargement de la carte des services...
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-20 text-white/40 text-sm">
            Aucun service disponible dans cette catégorie pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {filteredServices.map((service) => (
              <div key={service.id} className="glass-card p-4.5 flex flex-col gap-1.5 h-full group hover:border-white/20 hover:bg-white/[0.07]">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-medium text-white uppercase tracking-tight">{service.nom}</h3>
                  {service.badge && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/14 text-white/80 font-bold uppercase tracking-widest">
                      {service.badge}
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-white/38 leading-[1.5] line-clamp-2">{service.description}</p>
                <div className="flex items-center gap-3 mt-1 underline-offset-4">
                  <span className="text-[11px] text-white/30 font-medium">~{service.duree} min</span>
                  <span className="w-1 h-1 rounded-full bg-white/10" />
                  <span className="text-base font-semibold text-white tracking-tight">
                    {formatPrice(service.prix)} <span className="text-[10px] text-white/30 font-normal uppercase tracking-widest">FCFA</span>
                  </span>
                </div>
                <Link 
                  href={"/reserver?service=" + service.id} 
                  className="mt-auto pt-2.5 border-t border-white/[0.07] text-[11px] text-white/38 hover:text-white/70 transition-colors"
                >
                  Réserver ce service →
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. FaqSection */}
      <section className="py-10 px-5 border-t border-white/[0.06] max-w-7xl mx-auto w-full">
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

      {/* 6. CTA final */}
      <section className="py-14 px-5 text-center bg-white/[0.02] border-t border-white/[0.06] flex flex-col items-center gap-3">
        <h2 className="text-[clamp(22px,4vw,36px)] font-semibold text-white tracking-tight">Prêt à réserver ?</h2>
        <p className="text-sm text-white/38">Choisissez votre service et bloquez votre créneau.</p>
        <Link href="/reserver" className="btn-primary mt-2">Réserver maintenant</Link>
        <span className="text-[11px] text-white/22 mt-4">Avance de 500 FCFA pour confirmer · Solde réglé au salon</span>
      </section>

    </main>
  );
}