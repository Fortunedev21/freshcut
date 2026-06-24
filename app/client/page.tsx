'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, BookOpen, Phone, Award, History, Calendar, ShoppingBag } from 'lucide-react';
import { formatPrice } from '@/utils/format';

interface ClientData {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  points: number;
  totalSpent: number;
}

interface Booking {
  id: string;
  firstName: string;
  lastName: string;
  service: {
    nom: string;
    prix: number;
  };
  date: string;
  time: string;
  status: string;
  totalAmount: number;
}

interface OrderItemData {
  id: string;
  product: {
    nom: string;
    image: string | null;
  };
  quantite: number;
  prix: number;
}

interface OrderData {
  id: string;
  shippingMethod: string;
  shippingCost: number;
  finalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItemData[];
}

export default function ClientDashboard() {
  const router = useRouter();
  const [client, setClient] = useState<ClientData | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');

  useEffect(() => {
    const phone = localStorage.getItem('clientPhone');
    if (!phone) {
      router.push('/register');
      return;
    }
    
    fetchClientData(phone);
    fetchBookings(phone);
    fetchOrders(phone);
  }, []);

  const fetchClientData = async (phone: string) => {
    try {
      const response = await fetch(`/api/clients?phone=${encodeURIComponent(phone)}`);
      if (response.ok) {
        const data = await response.json();
        setClient(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch client:', error);
    }
  };

  const fetchBookings = async (phone: string) => {
    try {
      const response = await fetch(`/api/bookings?phone=${encodeURIComponent(phone)}`);
      if (response.ok) {
        const data = await response.json();
        setBookings(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async (phone: string) => {
    try {
      const response = await fetch(`/api/orders?phone=${encodeURIComponent(phone)}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('clientPhone');
    localStorage.removeItem('clientName');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
        <div className="text-white text-lg">Chargement...</div>
      </div>
    );
  }

  if (!client) return null;

  const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
  const nextFreeAt = 10 - (client.points % 10);

  return (
    <main className="pt-32 px-6 pb-20 max-w-7xl w-full mx-auto flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-white/5 to-transparent border-b border-white/10 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Mon Espace Freshcut</h1>
            <p className="text-white/60 mt-1">
              Bienvenue, {client.firstName} {client.lastName}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-4 rounded-xl border border-white/10">
            <div className="text-white/60 text-sm">Téléphone</div>
            <div className="text-white font-semibold text-lg mt-1">{client.phone}</div>
          </div>
          <div className="glass-card p-4 rounded-xl border border-white/10">
            <div className="text-white/60 text-sm">Réservations</div>
            <div className="text-white font-semibold text-lg mt-1">{completedBookings} complétées</div>
          </div>
          <div className="glass-card p-4 rounded-xl border border-white/10">
            <div className="text-white/60 text-sm">Dépense totale</div>
            <div className="text-white font-semibold text-lg mt-1">{formatPrice(client.totalSpent)} FCFA</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition whitespace-nowrap ${
              activeTab === 'bookings'
                ? 'text-white border-b-2 border-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Calendar size={18} />
            Mes Réservations
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition whitespace-nowrap ${
              activeTab === 'orders'
                ? 'text-white border-b-2 border-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <ShoppingBag size={18} />
            Mes Commandes
          </button>
          <button
            onClick={() => setActiveTab('loyalty')}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition whitespace-nowrap ${
              activeTab === 'loyalty'
                ? 'text-white border-b-2 border-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Award size={18} />
            Fidélité
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition whitespace-nowrap ${
              activeTab === 'profile'
                ? 'text-white border-b-2 border-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Phone size={18} />
            Profil
          </button>
        </div>

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Mes Réservations</h2>
              <Link
                href="/reserver"
                className="px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition"
              >
                + Nouvelle Réservation
              </Link>
            </div>

            {bookings.length === 0 ? (
              <div className="glass-card p-12 rounded-xl border border-white/10 text-center">
                <BookOpen size={48} className="mx-auto text-white/20 mb-4" />
                <p className="text-white/60 mb-4">Vous n'avez pas encore de réservation</p>
                <Link href="/reserver" className="text-white hover:underline font-medium">
                  Réserver maintenant
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="glass-card p-6 rounded-xl border border-white/10 hover:border-white/20 transition"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {booking.service.nom}
                        </h3>
                        <p className="text-white/60 text-sm mt-1">
                          {booking.firstName} {booking.lastName}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                        booking.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-400' :
                        booking.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                        booking.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-400' :
                        booking.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {booking.status === 'COMPLETED' && '✓ '}
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex gap-6 text-white/60 text-sm flex-wrap">
                      <span>Date : {new Date(booking.date).toLocaleDateString('fr-FR')}</span>
                      <span>a {booking.time}</span>
                      <span> {formatPrice(booking.totalAmount)} FCFA</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Loyalty Tab */}
        {activeTab === 'loyalty' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Programme de Fidélité</h2>

            <div className="glass-card p-8 rounded-xl border border-white/10">
              <div className="text-center mb-8">
                <Award size={48} className="mx-auto text-yellow-400 mb-4" />
                <h3 className="text-3xl font-bold text-white mb-2">Carte de Fidélité</h3>
                <p className="text-white/60">Chaque coupe vous rapproche d'une coupe gratuite!</p>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-lg p-6">
                  <p className="text-white/60 text-sm mb-2">Points Accumulés</p>
                  <div className="text-5xl font-bold text-yellow-400 mb-2">
                    {client.points}/10
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div 
                      className="bg-yellow-400 h-3 rounded-full transition-all" 
                      style={{ width: `${(client.points % 10) * 10}%` }}
                    ></div>
                  </div>
                  <p className="text-white/60 text-sm mt-2">
                    {nextFreeAt === 10 ? '🎉 Vous avez gagné une coupe gratuite!' : `Plus que ${nextFreeAt} points pour une coupe gratuite!`}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-white font-semibold mb-3">Comment ça marche?</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-white/60">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">1</div>
                      <span>Chaque service = 1 point</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/60">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">2</div>
                      <span>10 points = Coupe gratuite</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/60">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">3</div>
                      <span>Points réinitialisés après chaque coupe gratuite</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Mes Commandes Boutique</h2>

            {orders.length === 0 ? (
              <div className="glass-card p-12 rounded-xl border border-white/10 text-center">
                <ShoppingBag size={48} className="mx-auto text-white/20 mb-4" />
                <p className="text-white/60 mb-4">Vous n'avez pas encore passé de commande en boutique</p>
                <Link href="/boutique" className="text-white hover:underline font-medium">
                  Visiter la boutique
                </Link>
              </div>
            ) : (
              <div className="grid gap-6">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="glass-card p-6 rounded-xl border border-white/10 hover:border-white/20 transition space-y-4"
                  >
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <div className="text-xs text-white/40 font-bold uppercase tracking-wider">
                          Commande #{order.id.slice(-6).toUpperCase()}
                        </div>
                        <div className="text-white/60 text-xs mt-1">
                          Passée le : {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                        order.status === 'DELIVERED' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'SHIPPED' ? 'bg-blue-500/20 text-blue-400' :
                        order.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' :
                        order.status === 'PREPARING' ? 'bg-yellow-500/20 text-yellow-400' :
                        order.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="border-t border-b border-white/[0.04] py-4 space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <span className="text-white/80">
                            {item.product.nom} <span className="text-xs text-white/40">x{item.quantite}</span>
                          </span>
                          <span className="font-bold text-white/90">
                            {formatPrice(item.prix * item.quantite)} F
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-white/40 uppercase tracking-widest text-[10px]">
                        {order.shippingMethod === 'SALON' ? 'Retrait Salon' : 'Livraison à domicile'}
                      </span>
                      <span className="text-white text-base">
                        Total : {formatPrice(order.finalAmount)} FCFA
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Profil</h2>

            <div className="glass-card p-8 rounded-xl border border-white/10 max-w-md">
              <div className="space-y-4">
                <div>
                  <label className="block text-white/60 text-sm mb-1">Prénom</label>
                  <p className="text-white font-medium">{client.firstName}</p>
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-1">Nom</label>
                  <p className="text-white font-medium">{client.lastName}</p>
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-1">Téléphone</label>
                  <p className="text-white font-medium">{client.phone}</p>
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-1">Dépense totale</label>
                  <p className="text-white font-medium">{formatPrice(client.totalSpent)} FCFA</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full mt-6 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition font-medium"
              >
                Déconnexion
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
