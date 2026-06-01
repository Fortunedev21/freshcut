"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Scissors, Calendar as CalendarIcon, Clock, User, CreditCard, ChevronLeft, CheckCircle2 } from "lucide-react";
import { useLoyalty } from "@/contexts/LoyaltyContext";
import { services as serviceCatalog } from "@/data/services";
import { COUPES } from "@/data/coupes";

type SelectedService = {
  id: string;
  nom: string;
  prix: number;
  duree: number;
  badge?: string | null;
};

interface BookingState {
  step: number;
  serviceId: string | null;
  date: string | null;
  time: string | null;
  client: {
    nom: string;
    prenom: string;
    telephone: string;
  };
}

const SERVICE_SLUG_TO_NAME: Record<string, string> = {
  degrade: "Dégradé",
  plat: "Coupe plat",
  barbe: "Barbe",
  combo: "Combo",
  enfant: "Enfant",
  "soin-visage": "Soin visage",
};

const TIME_SLOTS = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

function formatFCA(value: number) {
  return `${new Intl.NumberFormat("fr-FR").format(value)} FCFA`;
}

export default function Reserver() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const coupeParam = searchParams.get("coupe");
  const serviceParam = searchParams.get("service");
  const phoneParam = searchParams.get("phone");
  const selectedCoupe = useMemo(() => COUPES.find((coupe) => coupe.id === coupeParam) ?? null, [coupeParam]);
  const selectedServiceName = useMemo(() => {
    if (!serviceParam) return null;
    return SERVICE_SLUG_TO_NAME[serviceParam] ?? serviceParam;
  }, [serviceParam]);

  const [state, setState] = useState<BookingState>({
    step: 1,
    serviceId: null,
    date: null,
    time: null,
    client: { nom: "", prenom: "", telephone: phoneParam ?? "" },
  });
  const [services, setServices] = useState<SelectedService[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const { addBooking, setPhone, phone } = useLoyalty();

  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await fetch("/api/services");
        if (!response.ok) return;

        const payload = await response.json();
        const fetchedServices = (payload.data || []) as Array<{ id: string; nom: string; prix: number; duree: number; badge?: string | null }>;
        setServices(fetchedServices);

        const initialService =
          fetchedServices.find((service) => service.nom === selectedServiceName) ??
          fetchedServices[0] ??
          null;

        if (initialService) {
          setState((prev) => ({
            ...prev,
            serviceId: prev.serviceId ?? initialService.id,
          }));
        }
      } catch {
        setServices([]);
      }
    };

    loadServices();
  }, [selectedServiceName]);

  useEffect(() => {
    if (!phoneParam || phone) return;
    setPhone(phoneParam);
    setState((prev) => ({ ...prev, client: { ...prev.client, telephone: phoneParam } }));
  }, [phoneParam, phone, setPhone]);

  const nextStep = () => setState(prev => ({ ...prev, step: prev.step + 1 }));
  const prevStep = () => setState(prev => ({ ...prev, step: prev.step - 1 }));

  const handleCancel = () => {
    setShowCancelModal(false);
    // Redirige vers l'accueil ou réinitialise
    window.location.href = "/";
  };

  const currentService = services.find((service) => service.id === state.serviceId) ?? services[0] ?? null;

  useEffect(() => {
    if (!state.serviceId && currentService) {
      setState((prev) => ({ ...prev, serviceId: currentService.id }));
    }
  }, [state.serviceId, currentService]);

  const selectedServiceDisplay = currentService ?? null;
  const selectedCoupeSummary = selectedCoupe
    ? `${selectedCoupe.nom} · ${selectedCoupe.tempsEstimation}`
    : null;

  const createBooking = async () => {
    if (!selectedServiceDisplay) return;

    const phoneNumber = state.client.telephone || phone || phoneParam;
    if (!phoneNumber) {
      alert("Veuillez renseigner votre numéro de téléphone.");
      return;
    }

    if (!state.client.nom || !state.client.prenom || !state.date || !state.time) {
      alert("Veuillez compléter votre réservation.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          firstName: state.client.prenom,
          lastName: state.client.nom,
          serviceId: selectedServiceDisplay.id,
          ...(selectedCoupe && { coupeId: selectedCoupe.id }),
          date: state.date,
          time: state.time,
          advanceAmount: Math.max(500, Math.round(selectedServiceDisplay.prix * 0.2)),
          totalAmount: selectedServiceDisplay.prix,
          notes: selectedCoupe ? `Coiffure choisie: ${selectedCoupe.nom}` : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Booking creation failed");
      }

      if (!phone) {
        setPhone(phoneNumber);
      }

      addBooking(selectedServiceDisplay.nom, selectedServiceDisplay.prix);
      alert("Réservation confirmée !");
      router.push("/client");
    } catch {
      alert("Impossible de confirmer la réservation pour le moment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="pt-32 px-6 pb-20 min-h-screen relative">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* Progress Bar */}
        <div className="flex justify-between items-center px-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                state.step >= i ? "bg-white text-black" : "glass-card text-muted"
              }`}>
                {state.step > i ? <CheckCircle2 size={16} /> : i}
              </div>
              {i < 4 && <div className={`w-12 h-px mx-2 ${state.step > i ? "bg-white" : "bg-glass-border"}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: SERVICE */}
          {state.step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold uppercase tracking-tighter">Votre Service</h2>
                <p className="text-secondary text-sm">Choisissez votre expérience Freshcut.</p>
                {selectedCoupeSummary && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-white/70">
                    Coiffure choisie: {selectedCoupeSummary}
                  </div>
                )}
              </div>
              <div className="grid gap-4">
                {serviceCatalog.map((s) => {
                  const serviceRecord = services.find((service) => service.nom === s.nom);
                  const resolvedPrice = serviceRecord?.prix ?? s.prix;
                  const displayPrice = formatFCA(resolvedPrice);
                  const displayAdvance = formatFCA(Math.max(500, Math.round(resolvedPrice * 0.2)));
                  return (
                  <button
                    key={s.id}
                    onClick={() => { setState(prev => ({ ...prev, serviceId: serviceRecord?.id ?? prev.serviceId })); nextStep(); }}
                    className={`glass-card p-6 flex items-center gap-6 text-left hover:border-white/40 transition-all ${state.serviceId === serviceRecord?.id ? "border-white" : ""}`}
                  >
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                      <Scissors size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold uppercase tracking-tight">{s.nom}</h3>
                      <p className="text-secondary text-xs">{s.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{displayPrice}</div>
                      <div className="text-[10px] text-muted uppercase tracking-widest">Avance {displayAdvance}</div>
                    </div>
                  </button>
                )})}
              </div>
            </motion.div>
          )}

          {/* STEP 2: DATE & TIME */}
          {state.step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <button onClick={prevStep} className="flex items-center gap-2 text-muted hover:text-white transition-colors text-xs uppercase tracking-widest font-bold">
                  <ChevronLeft size={14} /> Retour
                </button>
                <button onClick={() => setShowCancelModal(true)} className="text-muted hover:text-red-400 transition-colors text-[10px] uppercase tracking-widest font-bold">
                  Annuler la réservation
                </button>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold uppercase tracking-tighter">Disponibilités</h2>
                <p className="text-secondary text-sm">Le salon est ouvert du Lundi au Samedi.</p>
              </div>
              
              <div className="space-y-8">
                {/* Simple Day Picker (Next 4 days for demo) */}
                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                  {["Lun 29", "Mar 30", "Mer 01", "Jeu 02"].map((d) => (
                    <button
                      key={d}
                      onClick={() => setState(prev => ({ ...prev, date: d }))}
                      className={`shrink-0 w-24 h-24 glass-card flex flex-col items-center justify-center gap-2 ${state.date === d ? "bg-white text-black" : ""}`}
                    >
                      <CalendarIcon size={20} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{d}</span>
                    </button>
                  ))}
                </div>

                {state.date && (
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_SLOTS.map((t) => (
                      <button
                        key={t}
                        onClick={() => { setState(prev => ({ ...prev, time: t })); nextStep(); }}
                        className={`py-3 glass-card text-xs font-bold uppercase tracking-widest ${state.time === t ? "bg-white text-black" : ""}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 3: INFOS CLIENT */}
          {state.step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <button onClick={prevStep} className="flex items-center gap-2 text-muted hover:text-white transition-colors text-xs uppercase tracking-widest font-bold">
                  <ChevronLeft size={14} /> Retour
                </button>
                <button onClick={() => setShowCancelModal(true)} className="text-muted hover:text-red-400 transition-colors text-[10px] uppercase tracking-widest font-bold">
                  Annuler la réservation
                </button>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold uppercase tracking-tighter">Vos Infos</h2>
                <p className="text-secondary text-sm">Nous vous contacterons par WhatsApp si besoin.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Nom</label>
                    <input 
                      type="text"
                      className="w-full bg-glass-bg border border-glass-border p-4 rounded-xl focus:border-white transition-colors outline-none"
                      placeholder="Doe"
                      value={state.client.nom}
                      onChange={(e) => setState(prev => ({ ...prev, client: { ...prev.client, nom: e.target.value } }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Prénom</label>
                    <input 
                      type="text" 
                      className="w-full bg-glass-bg border border-glass-border p-4 rounded-xl focus:border-white transition-colors outline-none"
                      placeholder="John"
                      value={state.client.prenom}
                      onChange={(e) => setState(prev => ({ ...prev, client: { ...prev.client, prenom: e.target.value } }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Téléphone (MTN/Moov)</label>
                  <input 
                    type="tel" 
                    className="w-full bg-glass-bg border border-glass-border p-4 rounded-xl focus:border-white transition-colors outline-none"
                    placeholder="+229 XX XX XX XX"
                    value={state.client.telephone}
                    onChange={(e) => setState(prev => ({ ...prev, client: { ...prev.client, telephone: e.target.value } }))}
                  />
                </div>
                <button 
                  disabled={!state.client.nom || !state.client.telephone}
                  onClick={nextStep}
                  className="w-full btn-primary mt-4 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-2"
                >
                  Suivant <User size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: PAIEMENT */}
          {state.step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <button onClick={prevStep} className="flex items-center gap-2 text-muted hover:text-white transition-colors text-xs uppercase tracking-widest font-bold">
                  <ChevronLeft size={14} /> Retour
                </button>
                <button onClick={() => setShowCancelModal(true)} className="text-muted hover:text-red-400 transition-colors text-[10px] uppercase tracking-widest font-bold">
                  Annuler la réservation
                </button>
              </div>

              <div className="glass-card p-8 space-y-6">
                <div className="flex justify-between items-start border-b border-glass pb-6">
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-widest text-muted">Service</div>
                    <div className="font-bold text-xl uppercase tracking-tighter">
                      {selectedServiceDisplay?.nom}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-[10px] uppercase tracking-widest text-muted">Date & Heure</div>
                    <div className="font-bold uppercase tracking-tighter">{state.date} @ {state.time}</div>
                  </div>
                </div>

                {selectedCoupeSummary && (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                    <div className="text-[10px] uppercase tracking-widest text-muted">Coiffure sélectionnée</div>
                    <div className="font-semibold uppercase tracking-tight">{selectedCoupeSummary}</div>
                  </div>
                )}

                <div className="space-y-4 uppercase tracking-widest text-[10px] font-bold">
                  <div className="flex justify-between text-secondary">
                    <span>Total Service</span>
                    <span>{selectedServiceDisplay ? formatFCA(selectedServiceDisplay.prix) : "—"}</span>
                  </div>
                  <div className="flex justify-between text-white text-sm">
                    <span>Avance à payer (Maintenant)</span>
                    <span>{selectedServiceDisplay ? formatFCA(Math.max(500, Math.round(selectedServiceDisplay.prix * 0.2))) : "—"}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setShowConfirmModal(true)}
                  className="w-full btn-primary flex items-center justify-center gap-3 py-6 group"
                >
                  <span className="text-lg">PAYER VIA KKIA PAY</span>
                  <CreditCard size={24} className="group-hover:rotate-12 transition-transform" />
                </button>
                <p className="text-[9px] text-center text-muted uppercase tracking-[0.2em] leading-relaxed px-4">
                  En payant l'avance, vous confirmez votre présence. <br />Le solde sera réglé au salon.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-md p-8 space-y-8 relative z-10 border-white/20 bg-bg-base/90"
            >
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold uppercase tracking-tighter">Confirmer la réservation</h3>
                <p className="text-secondary text-sm">Veuillez vérifier vos informations avant de procéder au paiement.</p>
              </div>

              <div className="space-y-4 divide-y divide-white/5">
                <div className="pt-0">
                  <div className="text-[10px] uppercase font-bold text-muted tracking-widest mb-1">Service</div>
                  <div className="text-sm font-medium">{selectedServiceDisplay?.nom} — {selectedServiceDisplay ? formatFCA(selectedServiceDisplay.prix) : "—"}</div>
                </div>
                <div className="pt-4">
                  <div className="text-[10px] uppercase font-bold text-muted tracking-widest mb-1">Rendez-vous</div>
                  <div className="text-sm font-medium">{state.date} à {state.time}</div>
                </div>
                <div className="pt-4">
                  <div className="text-[10px] uppercase font-bold text-muted tracking-widest mb-1">Client</div>
                  <div className="text-sm font-medium">{state.client.prenom} {state.client.nom}</div>
                  <div className="text-[11px] text-secondary mt-1">{state.client.telephone}</div>
                </div>
                {selectedCoupeSummary && (
                  <div className="pt-4">
                    <div className="text-[10px] uppercase font-bold text-muted tracking-widest mb-1">Coiffure</div>
                    <div className="text-sm font-medium">{selectedCoupeSummary}</div>
                  </div>
                )}
              </div>

              <div className="bg-white/5 p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest">
                  <span className="text-muted">À payer immédiatement</span>
                  <span className="text-white">{selectedServiceDisplay ? formatFCA(Math.max(500, Math.round(selectedServiceDisplay.prix * 0.2))) : "—"}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={createBooking}
                  disabled={submitting}
                  className="btn-primary w-full py-4 text-xs font-bold disabled:opacity-50"
                >
                  {submitting ? "Confirmation..." : "Confirmer sans paiement"}
                </button>
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="btn-secondary w-full py-4 text-xs font-bold"
                >
                  Modifier les détails
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {/* Cancellation Confirmation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-110 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCancelModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-md p-8 space-y-8 relative z-10 border-red-500/20 bg-bg-base/90"
            >
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold uppercase tracking-tighter text-red-400">Annuler ?</h3>
                <p className="text-secondary text-sm">Êtes-vous sûr de vouloir abandonner votre réservation ?</p>
              </div>

              <div className="bg-red-500/5 p-5 rounded-2xl border border-red-500/10 space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-200">Conditions de remboursement</h4>
                <p className="text-[12px] text-red-200/60 leading-relaxed italic">
                  « L'avance est remboursée intégralement si l'annulation intervient plus de 2h avant le créneau. Passé ce délai, elle n'est plus remboursable. »
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleCancel}
                  className="bg-red-500 text-white w-full py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors"
                >
                  Oui, annuler
                </button>
                <button 
                  onClick={() => setShowCancelModal(false)}
                  className="btn-secondary w-full py-4 text-xs font-bold uppercase tracking-widest border-white/10"
                >
                  Continuer la réservation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}