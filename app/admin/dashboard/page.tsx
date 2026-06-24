'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BarChart3, Users, Package, DollarSign, ShieldPlus, UserPlus, LogOut, ShoppingBag, Eye } from 'lucide-react';

interface DashboardStats {
  bookingsToday: number;
  completedToday: number;
  totalRevenue: number;
  activeClients: number;
  lowStock: any[];
  monthRevenue: number;
  pendingOrders?: number;
}

interface StaffMember {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

interface OrderItem {
  id: string;
  product: {
    nom: string;
  };
  quantite: number;
  prix: number;
}

interface Order {
  id: string;
  clientNom: string;
  clientPrenom: string;
  clientTelephone: string;
  clientEmail: string | null;
  adresse: string | null;
  ville: string | null;
  shippingMethod: string;
  shippingCost: number;
  totalAmount: number;
  finalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'staff' | 'orders'>('orders'); // Default to orders to manage shop
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
        const [statsResponse, staffResponse, ordersResponse] = await Promise.all([
          fetch('/api/admin/dashboard'),
          fetch('/api/admin/users'),
          fetch('/api/admin/orders'),
        ]);

        if (statsResponse.ok) {
          const data = await statsResponse.json();
          setStats(data.data);
        }

        if (staffResponse.ok) {
          const data = await staffResponse.json();
          setStaff(data.data || []);
        }

        if (ordersResponse.ok) {
          const data = await ordersResponse.json();
          setOrders(data.data || []);
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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        const result = await response.json();
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? result.data : o))
        );
        
        // Reload dashboard stats
        const statsResponse = await fetch('/api/admin/dashboard');
        if (statsResponse.ok) {
          const data = await statsResponse.json();
          setStats(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
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
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ShieldPlus size={24} />
              <h1 className="text-3xl font-bold">Dashboard Super Admin</h1>
            </div>
            <p className="text-white/60">Gérez les coiffeurs et la boutique Freshcut.</p>
          </div>

          {/* Bouton de déconnexion */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors text-sm font-medium self-start sm:self-center"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/60 text-sm mb-2">Commandes en attente</p>
                <p className="text-4xl font-bold">{stats.pendingOrders || 0}</p>
              </div>
              <ShoppingBag size={32} className="text-white/20" />
            </div>
          </div>
        </section>

        {/* Tabs navigation */}
        <div className="flex border-b border-white/10 pb-2 gap-4">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 text-sm font-semibold uppercase tracking-wider transition ${
              activeTab === 'orders' ? 'text-white border-b-2 border-white' : 'text-white/40 hover:text-white/70'
            }`}
          >
            Commandes Boutique ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-4 py-2 text-sm font-semibold uppercase tracking-wider transition ${
              activeTab === 'staff' ? 'text-white border-b-2 border-white' : 'text-white/40 hover:text-white/70'
            }`}
          >
            Coiffeurs & Staff ({staff.length})
          </button>
        </div>

        {activeTab === 'staff' && (
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
        )}

        {activeTab === 'orders' && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} />
              <h2 className="text-xl font-bold">Toutes les Commandes</h2>
            </div>
            {orders.length === 0 ? (
              <div className="glass-card p-12 text-center text-white/40 text-sm uppercase tracking-wider">
                Aucune commande enregistrée pour le moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {orders.map((order) => (
                  <div key={order.id} className="glass-card p-6 rounded-xl border border-white/10 space-y-4 hover:border-white/20 transition duration-300">
                    <div className="flex justify-between items-start flex-wrap gap-4 border-b border-white/5 pb-4">
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-bold uppercase tracking-tight text-white text-base">
                            {order.clientPrenom} {order.clientNom}
                          </span>
                          <span className="text-[10px] text-white/30 font-mono">ID: {order.id}</span>
                        </div>
                        <p className="text-xs text-white/50 mt-1.5">
                          Téléphone : <a href={`tel:${order.clientTelephone}`} className="hover:underline text-white font-medium">{order.clientTelephone}</a>
                          {order.clientEmail && ` · Email : ${order.clientEmail}`}
                        </p>
                        <p className="text-[10px] text-white/30 mt-1">
                          Date : {new Date(order.createdAt).toLocaleString('fr-FR')}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-white/30 font-semibold"
                        >
                          <option value="PENDING" className="bg-[#0A0A0A] text-yellow-500">PENDING</option>
                          <option value="PAID" className="bg-[#0A0A0A] text-emerald-500">PAID (Payé)</option>
                          <option value="PREPARING" className="bg-[#0A0A0A] text-orange-500">PREPARING (En préparation)</option>
                          <option value="SHIPPED" className="bg-[#0A0A0A] text-blue-500">SHIPPED (Expédié)</option>
                          <option value="DELIVERED" className="bg-[#0A0A0A] text-green-500">DELIVERED (Livré)</option>
                          <option value="CANCELLED" className="bg-[#0A0A0A] text-red-500">CANCELLED (Annulé)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Produits commandés :</div>
                      <div className="grid gap-2 border-b border-white/[0.04] pb-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-white/80">{item.product.nom} <span className="text-xs text-white/40">x{item.quantite}</span></span>
                            <span className="font-semibold text-white/90">{formatPrice(item.prix * item.quantite)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs flex-wrap gap-2">
                      <div>
                        <span className="text-white/40 uppercase tracking-widest text-[9px] mr-2">Mode de retrait :</span>
                        <span className="font-bold text-white uppercase">{order.shippingMethod === 'SALON' ? 'Retrait Salon' : 'Livraison'}</span>
                        {order.shippingMethod === 'DELIVERY' && order.adresse && (
                          <span className="text-white/60 ml-2">({order.adresse}, {order.ville})</span>
                        )}
                      </div>
                      <div className="text-sm font-bold text-white">
                        Net à payer : {formatPrice(order.finalAmount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}