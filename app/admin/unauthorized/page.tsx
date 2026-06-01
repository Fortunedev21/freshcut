'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function Unauthorized() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <AlertTriangle size={64} className="mx-auto text-red-400 mb-6" />

        <h1 className="text-3xl font-bold text-white mb-3">Accès Refusé</h1>

        <p className="text-white/60 mb-6">
          Vous n'avez pas les permissions pour accéder à cette page.
        </p>

        {session && (
          <p className="text-white/40 text-sm mb-6">
            Votre rôle: <span className="font-semibold text-white">{(session.user as any)?.role}</span>
          </p>
        )}

        <div className="space-y-3">
          <Link
            href="/"
            className="block px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition"
          >
            Retour à l'accueil
          </Link>

          {session && (
            <Link
              href="/client"
              className="block px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition border border-white/20"
            >
              Mon Espace Client
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
