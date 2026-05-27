"use client";
import { motion } from "motion/react";
import { useState } from "react";
import { Users, ShoppingBag, Calendar, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"rdv" | "stocks" | "finance">("rdv");

  const appointments = [
    { id: 1, client: "Boris K.", service: "Dégradé", heure: "09:00", statut: "Terminé" },
    { id: 2, client: "Samuel L.", service: "Combo", heure: "10:30", statut: "En cours" },
    { id: 3, client: "Femi A.", service: "Barbe", heure: "14:00", statut: "Confirmé" },
    { id: 4, client: "Jean M.", service: "Coupe enfant", heure: "16:00", statut: "Confirmé" },
  ];

  const stocks = [
    { id: 1, nom: "Huile Barbe", quantite: 12, seuil: 5 },
    { id: 2, nom: "Cire Mate", quantite: 3, seuil: 5, alerte: true },
    { id: 3, nom: "Peigne Corne", quantite: 8, seuil: 3 },
  ];

  return (
    <main className="pt-32 px-6 pb-20 min-h-screen max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold uppercase tracking-tighter">Tableau de bord</h1>
          <p className="text-secondary text-sm font-medium">Bon travail, l'équipe. Voici l'état du salon aujourd'hui.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="glass-card px-6 py-3 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40">
              <Calendar size={20} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-muted tracking-widest leading-none">Rendez-vous</div>
              <div className="text-xl font-bold tracking-tight mt-1">14</div>
            </div>
          </div>
          <div className="glass-card px-6 py-3 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40">
              <ShoppingBag size={20} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-muted tracking-widest leading-none">Ventes</div>
              <div className="text-xl font-bold tracking-tight mt-1">125 K</div>
            </div>
          </div>
        </div>
      </header>

      {/* TABS */}
      <div className="flex gap-2 mb-8 border-b border-white/[0.08] pb-4">
        {[
          { id: "rdv", label: "Rendez-vous", icon: Users },
          { id: "stocks", label: "Stocks & Boutique", icon: ShoppingBag },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? "bg-white text-black" 
                : "text-white/40 hover:text-white"
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {activeTab === "rdv" ? (
            <div className="glass-card overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                    <th className="p-4 text-[10px] uppercase font-bold text-muted tracking-widest">Client</th>
                    <th className="p-4 text-[10px] uppercase font-bold text-muted tracking-widest">Service</th>
                    <th className="p-4 text-[10px] uppercase font-bold text-muted tracking-widest">Heure</th>
                    <th className="p-4 text-[10px] uppercase font-bold text-muted tracking-widest">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.08]">
                  {appointments.map((rdv) => (
                    <tr key={rdv.id} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="p-4 text-sm font-bold uppercase tracking-tight">{rdv.client}</td>
                      <td className="p-4 text-xs text-white/40 uppercase font-medium">{rdv.service}</td>
                      <td className="p-4 text-sm font-bold">{rdv.heure}</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
                          rdv.statut === "Terminé" ? "bg-green-500/10 text-green-400" :
                          rdv.statut === "En cours" ? "bg-blue-500/10 text-blue-400" :
                          "bg-white/10 text-white/60"
                        }`}>
                          {rdv.statut}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stocks.map((item) => (
                <div key={item.id} className={`glass-card p-6 flex justify-between items-center ${item.alerte ? "border-red-500/50" : ""}`}>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold uppercase tracking-tight">{item.nom}</h4>
                    <p className="text-[10px] text-muted uppercase font-bold tracking-widest">Seuil min: {item.seuil}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${item.alerte ? "text-red-400" : "text-white"}`}>{item.quantite}</div>
                    {item.alerte && <div className="text-[9px] text-red-400 font-bold uppercase tracking-widest flex items-center gap-1"><AlertCircle size={8} /> Stock bas</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h4 className="text-[10px] uppercase font-bold text-muted tracking-widest border-b border-white/[0.08] pb-3 mb-4">Actions Rapides</h4>
            <button className="w-full btn-primary text-[10px] py-4">Nouveau RDV</button>
            <button className="w-full btn-secondary text-[10px] py-4">Fermer la caisse</button>
          </div>

          <div className="glass-card p-6 space-y-4 bg-white/[0.03]">
            <h4 className="text-[10px] uppercase font-bold text-muted tracking-widest">Note d'équipe</h4>
            <p className="text-xs text-white/40 leading-relaxed italic">
              "N'oubliez pas de proposer le nouveau baume à chaque fin de service combo."
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
