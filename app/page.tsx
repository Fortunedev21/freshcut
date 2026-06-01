"use client";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Instagram, Heart, MessageCircle, ExternalLink } from "lucide-react";
import { services, testimonials, galleryPhotos } from "@/data/siteData";
import { COUPES } from "@/data/coupes";
import { formatPrice } from "@/utils/format";

export default function Home() {

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  };

const stagger = (i: number) => ({
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { 
    duration: 0.5, 
    delay: i * 0.1, 
    ease: [0.34, 1.56, 0.64, 1] as const // Courbe avec un léger rebond (overshoot)
  }
});

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  const greeting = getGreeting();

  return (
    <div className="flex flex-col select-none">
      {/* 2. HERO SECTION */}
      <section id="hero" className="h-[100svh] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
        {/* Background Image & Overlays */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop" 
            className="w-full h-full object-cover grayscale opacity-40"
            alt="Freshcut 229 Atmosphere"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-bg-base/40 to-bg-base" />
        </div>

        <motion.div {...stagger(0)} className="space-y-4 flex flex-col items-center relative z-10">
          <span className="text-[11px] tracking-[0.15em] uppercase text-white/35 font-medium">
            {greeting} — Barbershop premium — Cotonou
          </span>
          <h1 className="text-[clamp(40px,8vw,72px)] font-semibold leading-[1.05] tracking-[-0.02em] text-white">
            L'expérience coiffure <br /> premium
          </h1>
          <p className="text-sm text-white/45 max-w-[280px] leading-relaxed mx-auto">
            Réservez votre créneau en ligne, payez l'avance, on s'occupe du reste.
          </p>
        </motion.div>

        <motion.div {...stagger(3)} className="flex items-center gap-4 mt-8 z-15">
          <Link href="/reserver" className="btn-primary">
            Réserver maintenant
          </Link>
          <Link href="/services" className="btn-secondary">
            Voir les services
          </Link>
        </motion.div>
        
        <motion.span {...stagger(4)} className="text-[10px] text-white/20 mt-8 uppercase tracking-[0.2em] z-10">
          ↓ Défiler
        </motion.span>

        {/* Stats Row */}
        <div className="absolute bottom-0 w-full border-t border-white/[0.08] px-6 py-8">
          <div className="max-w-7xl mx-auto grid grid-cols-3 gap-4">
            {[
              { val: "500+", label: "Clients" },
              { val: "4.9", label: "Note moyenne" },
              { val: "3 ans", label: "D'expérience" }
            ].map((stat, i) => (
              <motion.div key={i} {...stagger(5 + i)} className="text-center">
                <div className="text-xl font-semibold text-white tracking-tight">{stat.val}</div>
                <div className="text-[10px] text-white/35 uppercase tracking-wider mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SERVICES SECTION */}
      <section id="services" className="py-16 px-5 max-w-7xl mx-auto w-full">
        <h2 className="text-[11px] uppercase tracking-[0.12em] text-white/35 mb-6 font-medium">Nos prestations</h2>
        <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-5 pb-4 snap-x snap-mandatory scrollbar-hide">
          {services.map((service, i) => (
            <motion.div 
              key={i} 
              {...fadeIn}
              className="glass-card min-w-[280px] md:min-w-0 snap-start p-5 flex flex-col group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center mb-4 group-hover:bg-white/12 transition-colors">
                <div className="w-3 h-3 border border-white/40" />
              </div>
              <h3 className="text-sm font-medium text-white mb-2 uppercase tracking-tight">{service.nom}</h3>
              <p className="text-[12px] text-white/40 leading-[1.5] mb-6 line-clamp-2">{service.desc}</p>
              <div className="mt-auto">
                <div className="text-base font-semibold text-white mb-4">
                  {formatPrice(service.prix)} <span className="text-[11px] text-white/35 font-normal">FCFA</span>
                </div>
                <Link href={service.href} className="text-[11px] text-white/40 pt-3 border-t border-white/[0.08] block hover:text-white transition-colors">
                  Réserver →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. LOOKBOOK SECTION */}
      <section className="py-24 px-5 max-w-7xl mx-auto w-full space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <h2 className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/30">Inspiration · Styles</h2>
            <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter">Lookbook Freshcut</h2>
          </div>
          <div className="flex flex-col items-start md:items-end gap-4">
            <p className="text-secondary max-w-sm text-sm text-left md:text-right">
              Découvrez les techniques et les finitions qui font notre renommée à Cotonou.
            </p>
            <Link href="/coupes" className="text-[10px] uppercase font-bold tracking-widest text-white hover:underline transition-all">
              Voir tout le catalogue →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1599351431247-f10b21ce5012?q=80&w=1974&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1622286332307-0c76572cgf0a?q=80&w=1974&auto=format&fit=crop",
          ].map((img, i) => (
            <motion.div 
              key={i}
              {...fadeIn}
              transition={{ delay: i * 0.1 }}
              className="aspect-[4/5] overflow-hidden rounded-2xl group relative"
            >
              <img 
                src={img} 
                alt={`Freshcut Style ${i + 1}`}
                className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-110 group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white">Style #{i + 1}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. CTA RESERVATION */}
      <section className="py-20 px-5 bg-white/[0.03] border-y border-white/[0.06] text-center flex flex-col items-center gap-4">
        <h2 className="text-[clamp(24px,5vw,40px)] font-semibold text-white tracking-tight leading-tight">
          Prêt pour votre prochaine <br /> coupe ?
        </h2>
        <p className="text-sm text-white/40 mb-4">Choisissez votre créneau, payez l'avance en ligne.</p>
        <Link href="/reserver" className="btn-primary scale-110">
          Réserver maintenant
        </Link>
        <span className="text-[11px] text-white/25 mt-4 tracking-wider">Avance de 500 FCFA seulement pour confirmer</span>
      </section>

      {/* 6.5 INSTAGRAM SECTION */}
      <section className="py-24 px-5 max-w-7xl mx-auto w-full space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white/30">
              <Instagram size={16} />
              <h2 className="text-[10px] uppercase font-bold tracking-[0.2em]">Instagram · Follow us</h2>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter leading-none">
              @freshcut229
            </h2>
          </div>
          <a 
            href="#" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-6 py-4 rounded-2xl border border-white/5 transition-all text-sm font-bold uppercase tracking-widest group"
          >
            Suivre le salon
            <ExternalLink size={14} className="text-white/40 group-hover:text-white transition-colors" />
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {COUPES.concat(COUPES.slice(0, 2)).map((post, i) => (
            <motion.div
              key={`ig-${i}`}
              {...fadeIn}
              transition={{ delay: i * 0.05 }}
              className="aspect-square rounded-xl overflow-hidden relative group cursor-pointer"
            >
              <img 
                src={post.image} 
                alt="Instagram post" 
                className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <div className="flex items-center gap-1.5 text-white/80">
                  <Heart size={14} fill="currentColor" />
                  
                </div>
                <div className="flex items-center gap-1.5 text-white/80">
                  <MessageCircle size={14} fill="currentColor" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="pt-8 text-center">
          <p className="text-[10px] text-white/20 uppercase tracking-[0.25em] font-bold">
            Partagez votre coupe avec le hashtag #FRESHCUT229
          </p>
        </div>
      </section>

      {/* 7. TESTIMONIALS SECTION */}
      <section className="py-16 px-5 bg-bg-base max-w-7xl mx-auto w-full">
        <h2 className="text-[11px] uppercase tracking-[0.12em] text-white/35 mb-10 font-medium">Ils nous font confiance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div key={i} {...fadeIn} className="glass-card p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center text-[11px] font-semibold text-white/60 text-center leading-none">
                  {t.initiale}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-white">{t.prenom}</div>
                  <div className="flex gap-0.5 mt-1">
                    {Array.from({ length: t.note }).map((_, star) => (
                      <span key={star} className="text-white/60 text-[10px] leading-none">★</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-[13px] text-white/40 leading-[1.6] font-medium italic select-text">« {t.texte} »</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 8. BOUTIQUE PREVIEW */}
      <section className="py-16 px-5 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-[11px] uppercase tracking-[0.12em] text-white/35 font-medium">Boutique</h2>
            <p className="text-[12px] text-white/35 mt-2">Cosmétiques & Merchandising</p>
          </div>
          <Link href="/boutique" className="text-[11px] text-white/30 hover:text-white transition-colors font-medium uppercase tracking-widest">Voir tout →</Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { nom: "Huile Barbe Signature", prix: 12500 },
            { nom: "Cire Coiffante Mate", prix: 8500 },
            { nom: "Peigne en Corne", prix: 5000 }
          ].map((item, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="aspect-square glass-card mb-4 overflow-hidden border-white/5 relative">
                <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                   <div className="w-16 h-16 border border-white rotate-45" />
                </div>
              </div>
              <div className="text-[12px] font-medium text-white mb-2 uppercase tracking-tight">{item.nom}</div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-semibold text-white/70 tracking-tight">{formatPrice(item.prix)} FCFA</span>
                <button className="text-[9px] uppercase tracking-[0.15em] font-bold text-white/40 border border-white/10 rounded-full px-3 py-1 hover:bg-white hover:text-black hover:border-white transition-all">Ajouter</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="bg-[#080808] border-t border-white/[0.06] pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:flex md:justify-between mb-16 gap-12">
          <div className="space-y-6">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Navigation</h4>
            <nav className="flex flex-col gap-4">
              <Link href="/" className="text-[11px] text-white/25 hover:text-white/60 transition-colors">Accueil</Link>
              <Link href="/services" className="text-[11px] text-white/25 hover:text-white/60 transition-colors">Services</Link>
              <Link href="/coupes" className="text-[11px] text-white/25 hover:text-white/60 transition-colors">Coupes</Link>
              <Link href="/boutique" className="text-[11px] text-white/25 hover:text-white/60 transition-colors">Boutique</Link>
              <Link href="/about" className="text-[11px] text-white/25 hover:text-white/60 transition-colors">À propos</Link>
              <Link href="/contact" className="text-[11px] text-white/25 hover:text-white/60 transition-colors">Contact</Link>
              <Link href="/admin" className="text-[11px] text-white/25 hover:text-white/60 transition-colors">Admin</Link>
            </nav>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Contact</h4>
            <div className="flex flex-col gap-4">
              <a href="#" className="text-[11px] text-white/25 hover:text-white/60 transition-colors">WhatsApp</a>
              <a href="#" className="text-[11px] text-white/25 hover:text-white/60 transition-colors">Instagram</a>
              <span className="text-[11px] text-white/25">Zone Résidentielle, Cotonou</span>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-white/[0.06] text-center">
          <p className="text-[10px] text-white/15 uppercase tracking-[0.3em] font-medium leading-loose max-w-xs mx-auto">
            © 2026 Freshcut 229 · Tous droits réservés
          </p>
        </div>
      </footer>
    </div>
  );
}
