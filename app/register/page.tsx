'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Phone, LogIn, Scissors } from 'lucide-react';
import PhoneInput from '@/components/ui/PhoneInput';

export default function ClientLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Erreur de connexion');
        return;
      }

      localStorage.setItem('clientPhone', phone.trim());
      localStorage.setItem('clientName', firstName || 'Client');

      router.push('/client');
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4 pt-32 sm:pt-0">
      <div className="w-full max-w-md">
        <div className="glass-card p-8 rounded-xl border flex flex-col border-white/10">
                    <Link href="/" className=" w-full items-center justify-center flex gap-2 group">
                      <img 
                        src="/freshcut.svg" 
                        alt="Freshcut Logo" 
                        className="h-5 w-auto transition-transform duration-500 group-hover:scale-105" 
                      />
                    </Link>

          <p className="text-white/60 text-center mb-8 mt-2 text-xs">
            Connexion Client
          </p>

          <form onSubmit={handlePhoneLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Phone Input */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Numéro de téléphone *
              </label>
              <PhoneInput
                value={phone}
                onChange={setPhone}
              />
              <p className="text-white/40 text-xs mt-1">
                Utilisé pour retrouver votre compte et vos réservations
              </p>
            </div>

            {/* First Name Input */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Prénom <span className="text-white/40">(optionnel)</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Votre prénom"
                disabled={loading}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/40 disabled:opacity-50"
              />
            </div>

            {/* Last Name Input */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Nom <span className="text-white/40">(optionnel)</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Votre nom"
                disabled={loading}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/40 disabled:opacity-50"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !phone}
              className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              <LogIn size={18} />
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {
            /*

            <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-white/60 text-center text-sm mb-4">
              Vous êtes un coiffeur?
            </p>
            <Link
              href="/login"
              className="block text-center text-white/40 hover:text-white transition-colors text-sm font-medium"
            >
              Accès administrateur →
            </Link>
          </div>
            */
          }
        </div>

        <div className="mt-8 text-center">
          <p className="text-white/30 text-xs">
            © 2026 Freshcut 229 · Cotonou, Bénin
          </p>
        </div>
      </div>
    </div>
  );
}
