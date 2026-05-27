import { motion } from "motion/react";
import { Scissors, ShieldCheck, Heart, Users } from "lucide-react";

export default function About() {
  return (
    <main className="pt-32 px-6 pb-20 max-w-5xl mx-auto space-y-20">
      <header className="space-y-6 text-center">
        <h1 className="text-6xl md:text-7xl font-bold uppercase tracking-tighter leading-none">L'héritage <br /> Freshcut 229</h1>
        <p className="text-secondary text-lg max-w-2xl mx-auto">Plus qu'un salon, une institution du style à Cotonou depuis 2020. Nous allions tradition de barbier et modernité urbaine.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-10 space-y-6">
          <ShieldCheck size={32} className="text-white/20" />
          <h2 className="text-2xl font-bold uppercase tracking-tight">Qualité Premium</h2>
          <p className="text-secondary text-sm leading-relaxed">Nous utilisons les meilleurs produits internationaux et locaux pour garantir la santé de vos cheveux et de votre barbe.</p>
        </div>
        <div className="glass-card p-10 space-y-6">
          <Heart size={32} className="text-white/20" />
          <h2 className="text-2xl font-bold uppercase tracking-tight">Vibe Communautaire</h2>
          <p className="text-secondary text-sm leading-relaxed">Un espace de détente où l'on discute, boit un café et profite d'un moment privilégié entre gentlemen.</p>
        </div>
      </div>

      <section className="bg-white/[0.03] p-12 rounded-[40px] flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <h2 className="text-4xl font-bold uppercase tracking-tighter">Notre Équipe</h2>
          <p className="text-secondary text-sm leading-relaxed">Nos barbiers sont des artistes certifiés, passionnés par la précision et le détail. Chaque membre apporte son style unique à l'expérience Freshcut.</p>
          <div className="flex -space-x-4">
             {[1,2,3,4].map(i => (
               <div key={i} className="w-12 h-12 rounded-full bg-white/10 border-2 border-bg-base flex items-center justify-center">
                 <Users size={20} className="text-white/30" />
               </div>
             ))}
          </div>
        </div>
        <div className="flex-1 aspect-video rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden grayscale">
           <Scissors size={60} className="text-white/5 rotate-45" />
        </div>
      </section>
    </main>
  );
}
