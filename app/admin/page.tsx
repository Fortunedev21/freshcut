'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const userRole = (session?.user as any)?.role;

    if (userRole === 'SUPER_ADMIN') {
      router.push('/admin/super');
    } else if (userRole === 'ADMIN') {
      router.push('/admin/coiffeur');
    } else {
      router.push('/login');
    }
  }, [status, session, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
      <div className="text-white text-center">
        <h1 className="text-2xl font-bold mb-2">Redirection...</h1>
        <p className="text-white/60">En cours de chargement de votre tableau de bord</p>
      </div>
    </div>
  );
}
