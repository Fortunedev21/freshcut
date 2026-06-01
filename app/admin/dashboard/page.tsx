'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BarChart3, Users, Package, DollarSign, ShieldPlus, UserPlus } from 'lucide-react';

interface DashboardStats {
  bookingsToday: number;
  completedToday: number;
  totalRevenue: number;
  activeClients: number;
  lowStock: any[];
  monthRevenue: number;
}

interface StaffMember {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const userRole = (session?.user as any)?.role;
    if (status === 'authenticated' && userRole !== 'SUPER_ADMIN') {
      router.push('/admin/coiffeur');
      return;
    }

    const load = async () => {
      try {
        const [statsResponse, staffResponse] = await Promise.all([
          fetch('/api/admin/dashboard'),
          fetch('/api/admin/users'),
        ]);

        if (statsResponse.ok) {
          const data = await statsResponse.json();
          setStats(data.data);
        }

        if (staffResponse.ok) {
          const data = await staffResponse.json();
          setStaff(data.data || []);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [status, session, router]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const createStaff = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error('create failed');
      }

      setForm({ name: '', email: '', password: '' });
      const data = await response.json();
      setStaff((prev) => [data.data, ...prev]);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-base">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-32 bg-bg-base text-white">
      <div className="bg-linear-to-r from-white/5 to-transparent border-b border-white/10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <ShieldPlus size={24} />
            <h1 className="text-3xl font-bold">Dashboard Super Admin</h1>
          </div>
          <p className="text-white/60">Gérez les coiffeurs, la boutique et les coupes.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/60 text-sm mb-2">Rendez-vous aujourd'hui</p>
                <p className="text-4xl font-bold">{stats.bookingsToday}</p>
              </div>
              <BarChart3 size={32} className="text-white/20" />
            </div>
          </div>
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <p className="text-white/60 text-sm mb-2">Revenus du mois</p>
            <p className="text-4xl font-bold">{formatPrice(stats.monthRevenue)}</p>
          </div>
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <p className="text-white/60 text-sm mb-2">Clients actifs</p>
            <p className="text-4xl font-bold">{stats.activeClients}</p>
          </div>
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <p className="text-white/60 text-sm mb-2">Bas stock</p>
            <p className="text-4xl font-bold">{stats.lowStock.length}</p>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-xl border border-white/10 space-y-4">
            <div className="flex items-center gap-2">
              <UserPlus size={18} />
              <h2 className="text-xl font-bold">Créer un coiffeur</h2>
            </div>
            <form onSubmit={createStaff} className="space-y-4">
              <input
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white outline-none"
                placeholder="Nom complet"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
              <input
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white outline-none"
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              />
              <input
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white outline-none"
                placeholder="Mot de passe temporaire"
                type="password"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              />
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-3 disabled:opacity-50"
              >
                {submitting ? 'Création...' : 'Créer le coiffeur'}
              </button>
            </form>
          </div>

          <div className="glass-card p-6 rounded-xl border border-white/10 space-y-4">
            <div className="flex items-center gap-2">
              <Users size={18} />
              <h2 className="text-xl font-bold">Équipe</h2>
            </div>
            <div className="space-y-3 max-h-105 overflow-auto pr-1">
              {staff.map((member) => (
                <div key={member.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">{member.name}</p>
                      <p className="text-sm text-white/60">{member.email}</p>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-white/60 border border-white/10 rounded-full px-3 py-1">
                      {member.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}