"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { formatPrice } from "@/utils/format";

interface ServicePriceData {
  id: string;
  clientType: "ADULTE" | "ETUDIANT" | "ENFANT";
  prix: number;
  instructions?: string;
}

interface ServiceData {
  id: string;
  nom: string;
  description: string;
  duree: number;
  categorie: string;
  badge?: string | null;
  prices: ServicePriceData[];
}

export default function ServicesList() {
  const [dbServices, setDbServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Par défaut sur ADULTE pour l'affichage rapide sur la page d'accueil
  const activeClientType: "ADULTE" | "ETUDIANT" | "ENFANT" = "ADULTE";

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

  const getPriceForType = (service: ServiceData, type: typeof activeClientType) => {
    const specificPrice = service.prices?.find((p) => p.clientType === type);
    if (specificPrice) return specificPrice;
    return service.prices?.find((p) => p.clientType === "ADULTE") || { prix: 0, instructions: "" };
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-white/40 text-sm tracking-wide animate-pulse">
        Chargement de la carte des services...
      </div>
    );
  }

  if (dbServices.length === 0) return null;

  const displayedServices = dbServices.slice(0, 4);

  return (
    <section id="services" className="py-16 px-5 max-w-7xl mx-auto w-full space-y-8">
      
      {/* EN-TÊTE DE LA SECTION */}
      <div className="flex justify-between items-end border-b border-white/[0.04] pb-4">
        <div className="space-y-1">
          <span className="text-[11px] uppercase tracking-[0.15em] text-white/30 font-medium">Prestations</span>
          <h2 className="text-xl font-semibold text-white tracking-tight uppercase">Nos services phares</h2>
        </div>
        <Link 
          href="/services" 
          className="text-[11px] uppercase tracking-wider text-white/50 hover:text-white transition-colors hidden md:block border-b border-white/0 hover:border-white/40 pb-0.5"
        >
          Voir toute la carte →
        </Link>
      </div>

      {/* GRILLE DÉCALQUÉE SUR LE DESIGN DES SERVICES (2 colonnes sur desktop comme ta structure) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {displayedServices.map((service, i) => {
          const tariff = getPriceForType(service, activeClientType);

          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="glass-card p-4.5 flex flex-col gap-1.5 h-full group hover:border-white/20 hover:bg-white/[0.07] transition-all duration-300"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-medium text-white uppercase tracking-tight">
                  {service.nom}
                </h3>
                {service.badge && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/14 text-white/80 font-bold uppercase tracking-widest">
                    {service.badge}
                  </span>
                )}
              </div>

              <p className="text-[12px] text-white/38 leading-[1.5] line-clamp-2">
                {service.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-1 underline-offset-4">
                <span className="text-[11px] text-white/30 font-medium">~ {service.duree} min</span>
                <span className="w-1 h-1 rounded-full bg-white/10" />
                <span className="text-base font-semibold text-white tracking-tight">
                  {formatPrice(tariff.prix)}{" "}
                  <span className="text-[10px] text-white/30 font-normal uppercase tracking-widest">FCFA</span>
                </span>
              </div>

              {tariff.instructions && (
                <p className="text-[10.5px] italic text-white/25 mt-1 border-l border-white/10 pl-2">
                  💡 {tariff.instructions}
                </p>
              )}

              <Link
                href={`/reserver?service=${service.id}&type=${activeClientType}`}
                className="mt-auto pt-3 border-t border-white/[0.07] text-[11px] text-white/38 hover:text-white/70 flex justify-between items-center transition-colors"
              >
                <span>Réserver ce service en tarif {activeClientType.toLowerCase()}</span>
                <span>→</span>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* PIED DE SECTION : AFFICHAGE DU LIEN "VOIR PLUS" */}
      {dbServices.length > 3 && (
        <div className="flex justify-center pt-4">
          <Link
            href="/services"
            className="px-6 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl text-xs uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all duration-300 font-medium"
          >
            Voir plus de prestations
          </Link>
        </div>
      )}
    </section>
  );
}