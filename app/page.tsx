"use client";

import { motion } from "motion/react";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Instagram, Heart, MessageCircle, ExternalLink, MapPin, Star, MessageSquarePlus, Clock, Phone } from "lucide-react";
import { formatPrice } from "@/utils/format";
import BoutiquePreview from "@/components/BoutiquePreview";
import ServicesList from "@/components/ServiceList";

// ============================================
// CONFIGURATIONS DATA (Statiques & Premium)
// ============================================

const GALLERY_IMAGES = [
  {
    image: "images/freshcut_1.jpeg",
    title: "Professionnalisme",
    category: "Coiffure"
  },
  {
    image: "images/freshcut_2.jpeg",
    title: "Contours Tracés & Barbe",
    category: "Barbe"
  },
  {
    image: "images/freshcut_3.jpeg",
    title: "Soin Visage & Vapeur Oasis",
    category: "Soins"
  },
  {
    image: "images/freshcut_4.jpeg",
    title: "Teinture & Design Graphique",
    category: "Coiffure"
  },
  {
    image: "images/freshcut_5.jpeg",
    title: "Coupe Classique Ciseaux",
    category: "Coiffure"
  },
  {
    image: "images/freshcut_6.jpeg",
    title: "Taille de Barbe Traditionnelle",
    category: "Barbe"
  }
];

const TESTIMONIALS = [
  {
    initiale: "A",
    prenom: "Arnaud",
    note: 5,
    texte: "Le meilleur salon de Cotonou sans hésiter. L'accueil est premium, la ponctualité est parfaite et le fondu est d'une précision chirurgicale."
  },
  {
    initiale: "M",
    prenom: "Marc-Aurèle",
    note: 5,
    texte: "Système de réservation en ligne super fluide. Payer l'avance fait gagner un temps fou. Ambiance tamisée très agréable."
  },
  {
    initiale: "K",
    prenom: "Kévin",
    note: 5,
    texte: "Un service haut de gamme, les coiffeurs sont à l'écoute et très professionnels. Les produits de soins pour la barbe sont top."
  }
];



interface ServiceData {
  id: string;
  nom: string;
  description: string;
  duree: number;
  categorie: string;
  badge?: string | null;
  prix: number;
}

export default function Home() {
  const [featuredServices, setFeaturedServices] = useState<ServiceData[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Récupération stricte de 3 services depuis la BD
  useEffect(() => {
    const fetchFeaturedServices = async () => {
      try {
        const response = await fetch("/api/services");
        if (response.ok) {
          const result = await response.json();
          const servicesArray = Array.isArray(result) ? result : result.data || [];
          setFeaturedServices(servicesArray.slice(0, 3));
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des prestations :", error);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchFeaturedServices();
  }, []);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { 
      duration: 0.6, 
      ease: [0.22, 1, 0.36, 1] as const
    }
  };

  const stagger = (i: number) => ({
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { 
      duration: 0.5, 
      delay: i * 0.1, 
      ease: [0.34, 1.56, 0.64, 1] as const
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
        <div className="absolute inset-0 z-0">
          <img 
            src="images/freshcut_face.jpeg" 
            className="w-full h-full object-cover"
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
          <Link href="/services" className="btn-secondary hidden sm:block">
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
              { val: "50+", label: "Clients" },
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

      {/* 3. FEATURED SERVICES (Remplacement des anciennes coupes complexes) */}
      <section className="py-24 px-5 max-w-7xl mx-auto w-full space-y-12">
        <div className="space-y-4">
          <h2 className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/30">À la carte</h2>
          <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter">Prestations Vedettes</h2>
        </div>

        {loadingServices ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass-card h-48 w-full animate-pulse rounded-2xl border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredServices.map((service) => {
              return (
                <motion.div key={service.id} {...fadeIn} className="glass-card p-6 border border-white/5 rounded-2xl flex flex-col justify-between hover:border-white/10 transition-all group relative overflow-hidden">
                  <div>
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <h3 className="text-lg font-semibold text-white tracking-tight group-hover:text-white transition-colors">{service.nom}</h3>
                      {service.badge && (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-white border border-amber-500/20">
                          {service.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/40 line-clamp-2 leading-relaxed mb-8">{service.description}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <span className="text-[11px] text-white/30 flex items-center gap-1.5 font-medium">
                      <Clock size={12} /> {service.duree} min
                    </span>
                    <span className="text-base font-bold text-white tracking-tight">
                      {formatPrice(service.prix)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3.5 FULL SERVICES LIST */}
      <Suspense fallback={
        <div className="py-16 text-center text-xs uppercase tracking-widest text-white/20 animate-pulse">
          Chargement des prestations...
        </div>
      }>
        <ServicesList />
      </Suspense>

      {/* 4. LOOKBOOK SECTION (Utilise maintenant la galerie locale d'images) */}
      <section className="py-24 px-5 max-w-7xl mx-auto w-full space-y-12">
        <div className="space-y-4">
          <h2 className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/30">Inspiration · Styles</h2>
          <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter">Lookbook Freshcut</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {GALLERY_IMAGES.slice(0, 4).map((item, i) => (
            <motion.div 
              key={i}
              {...fadeIn}
              transition={{ delay: i * 0.1 }}
              className="aspect-[4/5] overflow-hidden rounded-2xl group relative border border-white/5"
            >
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-full object-cover  transition-transform duration-700 group-hover:scale-110 group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                <span className="text-[9px] font-bold uppercase tracking-widest text-white mb-1">{item.category}</span>
                <span className="text-sm font-semibold text-white tracking-tight">{item.title}</span>
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
      </section>

      {/* 6.5 INSTAGRAM SECTION (Utilise proprement GALLERY_IMAGES à la place de COUPES) */}
      <section className="py-24 px-5 max-w-7xl mx-auto w-full space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white/30">
              <Instagram size={16} />
              <h2 className="text-[10px] uppercase font-bold tracking-[0.2em]">Instagram · Follow us</h2>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter leading-none">
              @freshcut
            </h2>
          </div>
          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-6 py-4 rounded-2xl border border-white/5 transition-all text-sm font-bold uppercase tracking-widest group"
          >
            Suivre le salon
            <ExternalLink size={14} className="text-white/40 group-hover:text-white transition-colors" />
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {GALLERY_IMAGES.map((post, i) => (
            <motion.div
              key={`ig-${i}`}
              {...fadeIn}
              transition={{ delay: i * 0.05 }}
              className="aspect-square rounded-xl grayscale overflow-hidden relative group cursor-pointer border border-white/5"
            >
              <img 
                src={post.image} 
                alt={post.title} 
                className="w-full h-full object-cover transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <div className="flex items-center gap-1.5 text-white/80 font-semibold text-xs">
                  <Heart size={14} fill="currentColor" />
                </div>
                <div className="flex items-center gap-1.5 text-white/80 font-semibold text-xs">
                  <MessageCircle size={14} fill="currentColor" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="pt-8 text-center">
          <p className="text-[10px] text-white/20 uppercase tracking-[0.25em] font-bold">
            Partagez votre coupe avec le hashtag #FRESHCUT
          </p>
        </div>
      </section>

      {/* 7. TESTIMONIALS SECTION AVEC GOOGLE REVIEWS BUTTON */}
      <section className="py-24 px-5 bg-bg-base border-t border-white/5 max-w-7xl mx-auto w-full space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <h2 className="text-[11px] uppercase tracking-[0.12em] text-white/35 font-medium">Avis Clients</h2>
            <h2 className="text-4xl font-bold uppercase tracking-tighter">Ils nous font confiance</h2>
          </div>
          
          <a
            href="https://g.page/r/votre-lien-google-review/review"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-white border border-amber-500/20 px-5 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all self-start md:self-auto"
          >
            <MessageSquarePlus size={16} />
            Laisser un avis sur Google
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={i} {...fadeIn} className="glass-card p-6 space-y-5 border border-white/5 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[11px] font-semibold text-white/60 text-center leading-none">
                  {t.initiale}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-white">{t.prenom}</div>
                  <div className="flex gap-0.5 mt-1">
                    {Array.from({ length: t.note }).map((_, star) => (
                      <Star key={star} size={10} className="fill-white text-white" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-[13px] text-white/40 leading-[1.6] font-medium italic select-text">« {t.texte} »</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 7.5 LOCALISATION & HÉBERGEMENT MAPS */}
      <section className="py-24 px-5 border-t border-white/5 bg-white/[0.01] w-full">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-3">
              <h2 className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/30">Rendez-nous visite</h2>
              <h2 className="text-4xl font-bold uppercase tracking-tighter">Le Salon à Cotonou</h2>
              <p className="text-sm text-white/40 leading-relaxed">
                Un espace moderne conçu pour l'homme d'affaires et le citadin exigeant. Confort, discrétion et soins premium vous attendent.
              </p>
            </div>

            <div className="space-y-4 text-sm border-t border-white/5 pt-6">
              <div className="flex items-start gap-4">
                <MapPin className="text-white shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="font-semibold text-white mb-0.5">Adresse</h4>
                  <p className="text-white/50 leading-relaxed">Avenue Jean-Paul II, Quartier Haie Vive,<br />Immeuble Premium, Cotonou, Bénin</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="text-white shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="font-semibold text-white mb-0.5">Horaires</h4>
                  <p className="text-white/50">Mardi — Samedi : 09h00 - 21h00</p>
                  <p className="text-white/50">Dimanche : 10h00 - 18h00</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="text-white shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="font-semibold text-white mb-0.5">Contact</h4>
                  <p className="text-white/50">+229 01 00 00 00 00</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 h-[380px] w-full rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63443.35320950471!2d2.328098048632812!3d6.366918300000006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1023556e77d9b28d%3A0x5a2b36eddffb8bae!2sFRESHCUT!5e0!3m2!1sfr!2sbj!4v1781101828671!5m2!1sfr!2sbj"
              className="w-full h-full border-0 grayscale invert contrast-125 opacity-70 hover:opacity-90 transition-opacity duration-500"
              allowFullScreen={false} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* 8. BOUTIQUE PREVIEW */}
      <section className="py-16 px-5 max-w-7xl mx-auto w-full">
        <BoutiquePreview />
      </section>
    </div>
  );
}