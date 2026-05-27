"use client";
import { motion } from "motion/react";
import { useState, FormEvent } from "react";
import { useLoyalty } from "@/contexts/LoyaltyContext";
import { CheckCircle2, Scissors, History, LogOut } from "lucide-react";
import { formatPrice } from "@/utils/format";

export default function Profile() {
  const { phone, setPhone, points, history } = useLoyalty();
  const [inputPhone, setInputPhone] = useState("");

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (inputPhone.length >= 8) {
      setPhone(inputPhone);
    }
  };

  if (!phone) {
    return (
      <main className="pt-40 px-6 min-h-screen flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-10 w-full max-w-md space-y-8"
        >
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold uppercase tracking-tighter">Votre Espace</h1>
            <p className="text-secondary text-sm">Entrez votre numéro pour voir vos points de fidélité.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-muted ml-1">Numéro de téléphone</label>
              <input 
                type="tel"
                value={inputPhone}
                onChange={(e) => setInputPhone(e.target.value)}
                placeholder="Ex: 97 00 00 00"
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/10 focus:outline-none focus:border-white/30 transition-all font-mono"
              />
            </div>
            <button className="w-full btn-primary py-4 text-[11px]">Accéder à mon profil</button>
          </form>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="pt-32 px-6 pb-20 min-h-screen max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <header className="flex justify-between items-end">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold uppercase tracking-tighter">Salut !</h1>
          <p className="text-secondary font-medium tracking-wide">Membre Freshcut · {phone}</p>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem("fc_phone");
            window.location.reload();
          }}
          className="text-[10px] uppercase font-bold text-red-400/60 hover:text-red-400 transition-colors flex items-center gap-2 mb-2"
        >
          <LogOut size={14} /> Déconnexion
        </button>
      </header>

      {/* Loyalty Card */}
      <section className="glass-card p-10 bg-gradient-to-br from-white/[0.08] to-transparent relative overflow-hidden group">
        <div className="relative z-10 space-y-8">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold uppercase tracking-tighter">Carte de Fidélité</h2>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">La 10ème coupe est offerte</p>
            </div>
            <Scissors size={24} className="text-white/20 group-hover:scale-110 transition-transform duration-500" />
          </div>

          <div className="grid grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div 
                key={i}
                className={`aspect-square rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                  i < points 
                    ? "bg-white border-white text-black scale-100" 
                    : "border-white/10 text-white/5 opacity-50"
                }`}
              >
                {i < points ? <CheckCircle2 size={16} /> : <Scissors size={12} />}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-white/5">
            <p className="text-xs text-white/60">
              Plus que <span className="text-white font-bold">{10 - points} coupes</span> pour obtenir votre prestation gratuite !
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      </section>

      {/* History */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <History size={20} className="text-white/20" />
          <h3 className="text-xl font-bold uppercase tracking-tighter">Historique</h3>
        </div>

        <div className="space-y-3">
          {history.length === 0 ? (
            <p className="text-sm text-white/30 italic">Aucune réservation passée pour le moment.</p>
          ) : (
            history.map((item) => (
              <div key={item.id} className="glass-card p-6 flex justify-between items-center group hover:border-white/20 transition-all">
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-tight">{item.service}</div>
                  <div className="text-[10px] text-muted font-bold tracking-widest">{item.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{formatPrice(item.price)} F</div>
                  <div className="text-[9px] uppercase font-bold text-green-400/60 tracking-widest">+1 Point</div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
