'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, BookOpen, Phone, Award, History, Calendar, ShoppingBag, Package, MapPin, Truck, Store } from 'lucide-react';
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

interface BoutiqueProduct {
  nom: string;
  image?: string | null;
}

interface BoutiqueOrderItem {
  id: string;
  productId: string;
  product: BoutiqueProduct;
  quantite: number;
  prix: number;
}

interface BoutiquePayment {
  id: string;
  transactionId: string;
  amount: number;
  status: string;
}

interface BoutiqueOrder {
  id: string;
  clientPhone: string;
  firstName: string;
  lastName: string;
  adresse: string | null;
  ville: string | null;
  shippingMethod: string;
  shippingCost: number;
  totalAmount: number;
  finalAmount: number;
  status: string;
  createdAt: string;
  items: BoutiqueOrderItem[];
  payment: BoutiquePayment | null;
}

const getOrderStatusBadge = (status: string) => {
  switch (status) {
    case 'PENDING':
      return { class: 'bg-yellow-500/20 text-yellow-400', label: 'En attente' };
    case 'PAID':
      return { class: 'bg-green-500/20 text-green-400', label: 'Payée' };
    case 'SHIPPED':
      return { class: 'bg-indigo-500/20 text-indigo-400', label: 'Expédiée' };
    case 'DELIVERED':
      return { class: 'bg-blue-500/20 text-blue-400', label: 'Livrée' };
    case 'CANCELLED':
      return { class: 'bg-red-500/20 text-red-400', label: 'Annulée' };
    default:
      return { class: 'bg-gray-500/20 text-gray-400', label: status };
  }
};

export default function ClientDashboard() {
  const router = useRouter();
  const [client, setClient] = useState<ClientData | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<BoutiqueOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');

  useEffect(() => {
    const phone = localStorage.getItem('clientPhone');
    if (!phone) {
      router.push('/register');
      return;
    }
    
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchClientData(phone),
          fetchBookings(phone),
          fetchOrders(phone)
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && ['bookings', 'loyalty', 'profile', 'orders'].includes(tab)) {
        setActiveTab(tab);
      }
    }
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
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition whitespace-nowrap ${
              activeTab === 'orders'
                ? 'text-white border-b-2 border-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <ShoppingBag size={18} />
            Mes Achats
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
                      <span>📅 {new Date(booking.date).toLocaleDateString('fr-FR')}</span>
                      <span>🕐 {booking.time}</span>
                      <span>💰 {formatPrice(booking.totalAmount)} FCFA</span>
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
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Mes Achats</h2>
              <Link
                href="/boutique"
                className="px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition text-sm font-medium"
              >
                Aller à la Boutique
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="glass-card p-12 rounded-xl border border-white/10 text-center">
                <ShoppingBag size={48} className="mx-auto text-white/20 mb-4" />
                <p className="text-white/60 mb-4">Vous n'avez pas encore effectué d'achats</p>
                <Link href="/boutique" className="text-white hover:underline font-medium">
                  Visiter la boutique
                </Link>
              </div>
            ) : (
              <div className="grid gap-6">
                {orders.map((order) => {
                  const statusInfo = getOrderStatusBadge(order.status);
                  return (
                    <div
                      key={order.id}
                      className="glass-card p-6 rounded-xl border border-white/10 hover:border-white/20 transition flex flex-col md:flex-row justify-between gap-6"
                    >
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xs text-white/45 font-mono">
                            Réf: #{order.id.slice(-8).toUpperCase()}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusInfo.class}`}>
                            {statusInfo.label}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white/80 flex items-center gap-1">
                            {order.shippingMethod === 'DELIVERY' ? (
                              <>
                                <Truck size={12} />
                                Livraison
                              </>
                            ) : (
                              <>
                                <Store size={12} />
                                Retrait Salon
                              </>
                            )}
                          </span>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-3 pt-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {item.product?.image ? (
                                  <img
                                    src={item.product.image}
                                    alt={item.product.nom}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package size={20} className="text-white/40" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm truncate">
                                  {item.product?.nom || 'Produit'}
                                </p>
                                <p className="text-white/60 text-xs mt-0.5">
                                  {formatPrice(item.prix)} FCFA x {item.quantite}
                                </p>
                              </div>
                              <div className="text-white font-semibold text-sm whitespace-nowrap">
                                {formatPrice(item.prix * item.quantite)} FCFA
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Delivery address / Info */}
                        {order.shippingMethod === 'DELIVERY' && order.adresse && (
                          <div className="text-xs text-white/60 bg-white/5 p-3 rounded-lg border border-white/5 flex items-start gap-2">
                            <MapPin size={14} className="text-white/40 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-white/85">Adresse de livraison :</p>
                              <p className="mt-0.5">{order.adresse}, {order.ville}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="md:w-64 md:border-l md:border-white/10 md:pl-6 flex flex-col justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-white/60">
                            <span>Date de commande</span>
                            <span>{new Date(order.createdAt).toLocaleDateString('fr-FR')}</span>
                          </div>
                          {order.payment && (
                            <div className="flex justify-between text-xs text-white/60 flex-wrap">
                              <span>Transaction ID</span>
                              <span className="font-mono text-[10px] break-all">{order.payment.transactionId}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-xs text-white/60">
                            <span>Frais de port</span>
                            <span>{order.shippingCost > 0 ? `${formatPrice(order.shippingCost)} FCFA` : 'Gratuit'}</span>
                          </div>
                        </div>

                        <div className="border-t border-white/10 pt-4 flex justify-between items-baseline">
                          <span className="text-sm font-semibold text-white">Total</span>
                          <span className="text-xl font-bold text-white">
                            {formatPrice(order.finalAmount)} FCFA
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
