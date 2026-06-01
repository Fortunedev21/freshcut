'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ChevronRight, CheckCircle, Clock, AlertCircle, Phone } from 'lucide-react';

interface Booking {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  time: string;
  date: string;
  status: string;
  service: {
    nom: string;
    prix: number;
    duree: number;
  };
  notes?: string;
}

export default function CoiffeurDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && !['COIFFEUR', 'ADMIN'].includes((session?.user as any)?.role)) {
      router.push('/admin/dashboard');
    } else {
      fetchTodayBookings();
    }
  }, [status, session]);

  const fetchTodayBookings = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/bookings?date=${today}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, action: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}?action=${action}`, {
        method: 'PATCH',
      });

      if (res.ok) {
        fetchTodayBookings();
        setSelectedBooking(null);
      }
    } catch (error) {
      console.error('Failed to update booking:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'IN_PROGRESS':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'COMPLETED':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'CANCELLED':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      CONFIRMED: 'Confirmé',
      IN_PROGRESS: 'En cours',
      COMPLETED: 'Terminé',
      CANCELLED: 'Annulé',
      NO_SHOW: 'Absent',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <main className='pt-32 px-6 pb-20 max-w-7xl mx-auto w-full'>
      <div className="min-h-screen bg-bg-base">
      {/* Header */}
      <div className="bg-linear-to-r from-white/5 to-transparent border-b border-white/10 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Tableau de Bord Coiffeur</h1>
          <p className="text-white/60">Gérez vos rendez-vous d'aujourd'hui</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <p className="text-white/60 text-sm mb-2">Rendez-vous aujourd'hui</p>
            <p className="text-4xl font-bold text-white">{bookings.length}</p>
          </div>
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <p className="text-white/60 text-sm mb-2">Confirmés</p>
            <p className="text-4xl font-bold text-green-400">
              {bookings.filter((b) => b.status === 'CONFIRMED').length}
            </p>
          </div>
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <p className="text-white/60 text-sm mb-2">En cours</p>
            <p className="text-4xl font-bold text-blue-400">
              {bookings.filter((b) => b.status === 'IN_PROGRESS').length}
            </p>
          </div>
        </div>

        {/* Bookings List */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Rendez-vous</h2>
          </div>

          <div className="divide-y divide-white/10">
            {bookings.length === 0 ? (
              <div className="p-6 text-center text-white/60">
                Aucun rendez-vous aujourd'hui
              </div>
            ) : (
              bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-6 hover:bg-white/5 transition cursor-pointer border-b border-white/5 last:border-b-0"
                  onClick={() => setSelectedBooking(booking)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {booking.firstName} {booking.lastName}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}
                        >
                          {getStatusLabel(booking.status)}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-white/60">
                          <strong className="text-white">{booking.service.nom}</strong> •{' '}
                          {booking.service.duree} min
                        </p>
                        <div className="flex items-center gap-4 text-white/40">
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {booking.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone size={14} />
                            {booking.phoneNumber}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-white/40 mt-1" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-bg-base border border-white/10 rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              {selectedBooking.firstName} {selectedBooking.lastName}
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-white/60 text-sm">Service</p>
                <p className="text-white font-semibold">{selectedBooking.service.nom}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/60 text-sm">Heure</p>
                  <p className="text-white font-semibold">{selectedBooking.time}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Durée</p>
                  <p className="text-white font-semibold">{selectedBooking.service.duree} min</p>
                </div>
              </div>
              <div>
                <p className="text-white/60 text-sm">Téléphone</p>
                <p className="text-white font-semibold">{selectedBooking.phoneNumber}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Statut actuel</p>
                <p className={`font-semibold ${getStatusColor(selectedBooking.status)}`}>
                  {getStatusLabel(selectedBooking.status)}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {selectedBooking.status === 'PENDING' && (
                <button
                  onClick={() => updateBookingStatus(selectedBooking.id, 'confirm')}
                  disabled={updating}
                  className="py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition disabled:opacity-50"
                >
                  Confirmer
                </button>
              )}
              {(selectedBooking.status === 'CONFIRMED' || selectedBooking.status === 'PENDING') && (
                <button
                  onClick={() => updateBookingStatus(selectedBooking.id, 'start')}
                  disabled={updating}
                  className="py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition disabled:opacity-50"
                >
                  Commencer
                </button>
              )}
              {selectedBooking.status === 'IN_PROGRESS' && (
                <button
                  onClick={() => updateBookingStatus(selectedBooking.id, 'complete')}
                  disabled={updating}
                  className="py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition disabled:opacity-50"
                >
                  Terminer
                </button>
              )}
              <button
                onClick={() => updateBookingStatus(selectedBooking.id, 'cancel')}
                disabled={updating}
                className="py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition disabled:opacity-50"
              >
                Annuler
              </button>
            </div>

            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full mt-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
    </main>
  );
}
