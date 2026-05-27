"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, User, Menu, X, Scissors } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { motion, AnimatePresence } from "motion/react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { itemCount, setIsCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Accueil", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Coupes", href: "/coupes" },
    { name: "Boutique", href: "/boutique" },
    { name: "À propos", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-[#0A0A0A]/85 backdrop-blur-md border-b border-white/[0.06] py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Scissors size={18} className="text-white rotate-45 transition-transform duration-500 group-hover:rotate-90" />
            <span className="font-bold tracking-[0.25em] text-sm text-white uppercase">
              Freshcut <span className="text-white/40">229</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-[11px] font-medium uppercase tracking-[0.15em] transition-all duration-200 relative py-1 hover:text-white ${
                    isActive ? "text-white" : "text-white/45"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[1px] bg-white"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full hover:bg-white/5 transition-all text-white/70 hover:text-white flex items-center justify-center cursor-pointer"
              aria-label="Voir le panier"
            >
              <ShoppingBag size={18} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-white text-[#0A0A0A] rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Profile Link */}
            <Link
              href="/profile"
              className="p-2.5 rounded-full hover:bg-white/5 transition-all text-white/70 hover:text-white flex items-center justify-center"
              aria-label="Mon profil"
            >
              <User size={18} />
            </Link>

            {/* Book Button */}
            <Link href="/reserver" className="btn-primary py-2.5 px-5 hidden sm:inline-flex">
              Réserver
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-full hover:bg-white/5 transition-all text-white md:hidden flex items-center justify-center cursor-pointer"
              aria-label="Menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-[#0A0A0A] pt-28 px-8 pb-10 flex flex-col justify-between md:hidden"
          >
            <nav className="flex flex-col gap-6 mt-8">
              {navLinks.map((link, i) => {
                const isActive = pathname === link.href;
                return (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className={`text-2xl font-bold uppercase tracking-tight ${
                        isActive ? "text-white" : "text-white/40"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <Link href="/reserver" className="w-full btn-primary py-4 text-xs font-bold uppercase tracking-widest text-center block">
                Réserver en ligne
              </Link>
              <div className="pt-6 border-t border-white/[0.08] flex justify-between text-[11px] text-white/40 uppercase tracking-wider">
                <span>WhatsApp: +229 XX XX XX XX</span>
                <span>Cotonou</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
