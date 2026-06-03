import Link from 'next/link'
import React from 'react'

export default function Footer() {
  return (
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
  )
}
