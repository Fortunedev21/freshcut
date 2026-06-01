'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BarChart3, TrendingUp, Users, Package, DollarSign, AlertTriangle } from 'lucide-react';

interface DashboardStats {
  bookingsToday: number;
  completedToday: number;
  totalRevenue: number;
  activeClients: number;
  lowStock: any[];
  monthRevenue: number;
}

export default function BossDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && !['BOSS', 'ADMIN'].includes((session?.user as any)?.role)) {
      router.push('/admin/coiffeur');
    } else {
      fetchDashboardStats();
    }
  }, [status, session]);

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      if (res.ok) {
        const data = await res.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return (price / 1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + 'K';
  };

  return (
    <main className='pt-32 px-6 pb-20 max-w-7xl mx-auto'>
      <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <div className="bg-gradient-to-r from-white/5 to-transparent border-b border-white/10 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Tableau de Bord Patron</h1>
          <p className="text-white/60">Gérez votre barbershop</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/60 text-sm mb-2">Rendez-vous (Aujourd'hui)</p>
                <p className="text-4xl font-bold text-white">{stats.bookingsToday}</p>
                <p className="text-green-400 text-sm mt-2">{stats.completedToday} complétés</p>
              </div>
              <BarChart3 size={32} className="text-white/20" />
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl border border-white/10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/60 text-sm mb-2">Revenus (Mois)</p>
                <p className="text-4xl font-bold text-white">{formatPrice(stats.monthRevenue)}</p>
                <p className="text-white/40 text-sm mt-2">FCFA</p>
              </div>
              <TrendingUp size={32} className="text-white/20" />
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl border border-white/10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/60 text-sm mb-2">Clients Actifs</p>
                <p className="text-4xl font-bold text-white">{stats.activeClients}</p>
                <p className="text-white/40 text-sm mt-2">Programme de fidélité</p>
              </div>
              <Users size={32} className="text-white/20" />
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl border border-white/10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/60 text-sm mb-2">Articles Bas Stock</p>
                <p className="text-4xl font-bold text-white">{stats.lowStock.length}</p>
                <p className="text-yellow-400 text-sm mt-2">À réapprovisionner</p>
              </div>
              <Package size={32} className="text-white/20" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 font-medium transition ${
              activeTab === 'overview'
                ? 'text-white border-b-2 border-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Aperçu
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-3 font-medium transition ${
              activeTab === 'appointments'
                ? 'text-white border-b-2 border-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Rendez-vous
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-3 font-medium transition ${
              activeTab === 'inventory'
                ? 'text-white border-b-2 border-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Inventaire
          </button>
          <button
            onClick={() => setActiveTab('financial')}
            className={`px-4 py-3 font-medium transition ${
              activeTab === 'financial'
                ? 'text-white border-b-2 border-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Finances
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Low Stock Alert */}
            {stats.lowStock.length > 0 && (
              <div className="glass-card p-6 rounded-xl border border-yellow-500/20">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle size={20} className="text-yellow-400" />
                  <h3 className="text-lg font-bold text-white">Articles Bas Stock</h3>
                </div>
                <div className="space-y-3">
                  {stats.lowStock.map((product) => (
                    <div
                      key={product.id}
                      className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-white">{product.nom}</p>
                          <p className="text-yellow-400 text-sm">{product.stock} en stock</p>
                        </div>
                        <p className="text-white/60 text-sm">{formatPrice(product.prix)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Revenue Summary */}
            <div className="glass-card p-6 rounded-xl border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <DollarSign size={20} />
                Résumé Financier
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/60">Revenu Total</span>
                  <span className="text-white font-semibold">{formatPrice(stats.totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Ce Mois</span>
                  <span className="text-green-400 font-semibold">{formatPrice(stats.monthRevenue)}</span>
                </div>
                <div className="h-px bg-white/10 my-2"></div>
                <div className="flex justify-between">
                  <span className="text-white/60">Avg. par RDV</span>
                  <span className="text-white font-semibold">
                    {stats.bookingsToday > 0
                      ? formatPrice(stats.monthRevenue / 30)
                      : '0'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Gestion des Rendez-vous</h3>
            <p className="text-white/60">
              Utilisez le dashboard du coiffeur pour gérer les rendez-vous. Cette section affichera
              un calendrier complet dans une mise à jour future.
            </p>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Gestion d'Inventaire</h3>
            <p className="text-white/60">
              Tableau de gestion de stock complet avec historique des mouvements (en développement).
            </p>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Rapport Financier</h3>
            <p className="text-white/60">
              Détails des paiements, factures et rapports financiers (en développement).
            </p>
          </div>
        )}
      </div>
    </div>
    </main>
  );
}
