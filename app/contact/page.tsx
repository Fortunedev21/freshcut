import { motion } from "motion/react";
import { Mail, Phone, MapPin, Instagram, Facebook } from "lucide-react";

export default function Contact() {
  return (
    <main className="pt-32 px-6 pb-20 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div className="space-y-12">
          <div className="space-y-6">
            <h1 className="text-6xl md:text-7xl font-bold uppercase tracking-tighter leading-none">Contactez <br /> Le Salon</h1>
            <p className="text-secondary text-lg">Nos barbiers vous accueillent du Mardi au Dimanche. Prenez rendez-vous ou passez nous voir.</p>
          </div>

          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                <MapPin size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted">Adresse</p>
                <p className="text-lg font-bold">Cotonou, Quartier Fidjrossè, <br />Rue pavée vers la plage</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                <Phone size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted">Téléphone</p>
                <p className="text-lg font-bold font-mono">+229 97 00 00 00</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                <Mail size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted">Email</p>
                <p className="text-lg font-bold">hello@freshcut229.com</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
             <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
               <Instagram size={20} />
             </a>
             <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
               <Facebook size={20} />
             </a>
          </div>
        </div>

        <div className="glass-card p-10 space-y-8">
          <h2 className="text-2xl font-bold uppercase tracking-tight">Envoyez un message</h2>
          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-muted ml-1">Nom</label>
                  <input type="text" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-white/30" />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-muted ml-1">Prénom</label>
                  <input type="text" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-white/30" />
               </div>
            </div>
            <div className="space-y-1.5">
               <label className="text-[10px] uppercase font-bold tracking-widest text-muted ml-1">Message</label>
               <textarea className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-white/30 h-32 resize-none" />
            </div>
            <button className="w-full btn-primary py-4 text-[11px]">Envoyer le message</button>
          </form>
        </div>
      </div>
    </main>
  );
}
