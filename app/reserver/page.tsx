"use client";

import { useKKiaPay } from "kkiapay-react";
import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Scissors,
  User,
  CreditCard,
  ChevronLeft,
  CheckCircle2,
  Check,
} from "lucide-react";
import { useLoyalty } from "@/contexts/LoyaltyContext";

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import PhoneInput from "@/components/ui/PhoneInput";

// 1. Mise à jour des interfaces pour intégrer la grille tarifaire relationnelle
interface ServicePriceData {
  id: string;
  clientType: "ADULTE" | "ETUDIANT" | "ENFANT";
  prix: number;
  instructions?: string;
}

type SelectedService = {
  id: string;
  nom: string;
  duree: number;
  description?: string;
  badge?: string | null;
  prices: ServicePriceData[]; // 👈 Ajout du tableau des tarifs
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

const TIME_SLOTS = [
  "07:00", "08:00", "09:00", "10:00", "11:00",
  "14:00", "15:00", "16:00", "17:00", "18:00",
];

function formatFCA(value: number) {
  return `${new Intl.NumberFormat("fr-FR").format(value)} FCFA`;
}

function ReserverContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceParam = searchParams.get("service");
  const phoneParam = searchParams.get("phone");
  
  // Récupération sécurisée de la variante tarifaire depuis l'URL passée par la page services
  const urlClientType = (searchParams.get("type")?.toUpperCase() as "ADULTE" | "ETUDIANT" | "ENFANT") || "ADULTE";

  const [services, setServices] = useState<SelectedService[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [clientType] = useState<"ADULTE" | "ETUDIANT" | "ENFANT">(urlClientType);

  const [state, setState] = useState<BookingState>({
    step: 1,
    serviceId: null,
    date: null,
    time: null,
    client: { nom: "", prenom: "", telephone: phoneParam ?? "" },
  });

  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const { addBooking, setPhone, phone } = useLoyalty();
  const { openKkiapayWidget, addKkiapayListener, removeKkiapayListener } = useKKiaPay();

  const selectedServiceName = useMemo(() => {
    if (!serviceParam) return null;
    return SERVICE_SLUG_TO_NAME[serviceParam] ?? serviceParam;
  }, [serviceParam]);

  // Récupération des services en ligne
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); 
      try {
        const resServices = await fetch("/api/services");
        let fetchedServices: SelectedService[] = [];
        if (resServices.ok) {
          const payload = await resServices.json();
          fetchedServices = (payload.data || []) as SelectedService[];
          setServices(fetchedServices);
        }

        if (fetchedServices.length > 0) {
          const initialService = fetchedServices.find((s) => {
            const targetName = SERVICE_SLUG_TO_NAME[serviceParam ?? ""];
            if (targetName) {
              return s.nom.toLowerCase() === targetName.toLowerCase();
            }
            return s.id === serviceParam;
          }) ?? fetchedServices[0];

          if (initialService) {
            setState((prev) => ({
              ...prev,
              serviceId: initialService.id,
            }));
            setSelectedServiceIds([initialService.id]);
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données en ligne :", error);
      } finally {
        setLoading(false); 
      }
    };

    fetchData();
  }, [selectedServiceName, serviceParam]);

  const filteredServices = useMemo(() => {
    if (serviceParam) {
      const targetName = SERVICE_SLUG_TO_NAME[serviceParam];
      return services.filter((s) => {
        if (targetName) {
          return s.nom.toLowerCase() === targetName.toLowerCase();
        }
        return s.id === serviceParam;
      });
    }
    return services; 
  }, [services, serviceParam]);

  const handleServiceToggle = (id: string) => {
    setSelectedServiceIds([id]);
    setState((prev) => ({ ...prev, serviceId: id }));
    nextStep();
  };

  /**
   * Helper pour extraire de manière sécurisée le prix d'un service selon le profil client sélectionné.
   * Si le profil spécifique n'existe pas, il prend le tarif ADULTE par défaut.
   */
  const getServicePrice = (service: SelectedService, type: typeof clientType): number => {
    if (!service.prices || service.prices.length === 0) return 0;
    const targetPrice = service.prices.find((p) => p.clientType === type);
    if (targetPrice) return targetPrice.prix;
    return service.prices.find((p) => p.clientType === "ADULTE")?.prix || 0;
  };

  // 2. Calcul dynamique et corrigé du montant total
  const totalPrix = useMemo(() => {
    const prixServices = services
      .filter((s) => selectedServiceIds.includes(s.id))
      .reduce((sum, s) => sum + getServicePrice(s, clientType), 0);
    return prixServices;
  }, [services, selectedServiceIds, clientType]);

  const advanceAmount = useMemo(() => {
    return Math.max(500, Math.round(totalPrix * 0.5));
  }, [totalPrix]);

  function open() {
    if (totalPrix === 0) return;
    
    if (!state.client.nom || !state.client.prenom || !state.date || !state.time) {
      alert("Veuillez remplir correctement toutes vos informations avant de procéder au paiement.");
      setShowConfirmModal(false);
      setState(prev => ({ ...prev, step: 3 }));
      return;
    }

    openKkiapayWidget({
      amount: advanceAmount,
      reason: "Avance Réservation",
      phone: state.client.telephone,
      name: `${state.client.prenom} ${state.client.nom}`,
      callback: window.location.origin + "/client",
      publicAPIKey: process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY,
      sandbox: process.env.NEXT_PUBLIC_KKIAPAY_ENVIRONMENT === 'true' || process.env.NEXT_PUBLIC_KKIAPAY_ENVIRONMENT === 'test',
    });
  }

  function successHandler(response: any) {
    createBooking(response.transactionId);
  }

  function failureHandler(error: any) {
    console.error("Erreur de paiement:", error);
  }

  useEffect(() => {
    addKkiapayListener("success", successHandler);
    addKkiapayListener("failed", failureHandler);
    return () => {
      removeKkiapayListener("success");
      removeKkiapayListener("failed");
    };
  }, [addKkiapayListener, removeKkiapayListener, state, totalPrix, successHandler]);

  useEffect(() => {
    const activePhone = phone || phoneParam;
    if (activePhone) {
      setState((prev) => ({
        ...prev,
        client: { ...prev.client, telephone: activePhone },
      }));

      const fetchAndSetClient = async () => {
        try {
          const response = await fetch(`/api/clients?phone=${encodeURIComponent(activePhone)}`);
          if (response.ok) {
            const result = await response.json();
            const clientData = result.data;
            if (clientData) {
              setState((prev) => ({
                ...prev,
                client: {
                  ...prev.client,
                  nom: clientData.lastName,
                  prenom: clientData.firstName,
                },
              }));
            }
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données du client:", error);
        }
      };
      fetchAndSetClient();
    }
  }, [phone, phoneParam]);

  const nextStep = () => setState((prev) => ({ ...prev, step: prev.step + 1 }));
  const prevStep = () => setState((prev) => ({ ...prev, step: prev.step - 1 }));

  const handleCancel = () => {
    setShowCancelModal(false);
    window.location.href = "/";
  };

  const createBooking = useCallback(
    async (transactionId: string) => {
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
            serviceIds: selectedServiceIds,
            clientType, // On sauvegarde la variante choisie en base de données
            date: state.date,
            time: state.time,
            advanceAmount: advanceAmount,
            totalAmount: totalPrix,
            notes: `TransactionId: ${transactionId}; Profil: ${clientType.toLowerCase()}`,
            status: transactionId ? "PAID" : "PENDING",
          }),
        });

        if (!response.ok) throw new Error("Booking creation failed");

        if (!phone) setPhone(phoneNumber);

        addBooking("Services barbiers", totalPrix);
        alert("Réservation confirmée !");
        router.push("/client");
      } catch {
        alert("Impossible de confirmer la réservation pour le moment.");
      } finally {
        setSubmitting(false);
      }
    },
    [state, selectedServiceIds, phone, phoneParam, router, setPhone, addBooking, totalPrix, advanceAmount, clientType]
  );

  return (
    <main className="pt-32 px-6 pb-20 min-h-screen relative">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Progress Bar */}
        <div className="flex justify-between items-center px-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                  state.step >= i ? "bg-white text-black" : "glass-card text-muted"
                }`}
              >
                {state.step > i ? <CheckCircle2 size={16} /> : i}
              </div>
              {i < 4 && (
                <div className={`w-12 h-px mx-2 ${state.step > i ? "bg-white" : "bg-glass-border"}`} />
              )}
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
                {/* Petit indicateur discret du profil tarifaire actif */}
                <div className="text-[10px] uppercase tracking-widest text-white/40 font-medium">
                  Grille tarifaire appliquée : <span className="text-white font-bold">{clientType.toLowerCase()}</span>
                </div>
              </div>

              <div className="grid gap-4">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="glass-card p-6 h-24 w-full animate-pulse bg-white/5 border-glass-border" />
                  ))
                ) : filteredServices.length === 0 ? (
                  <p className="text-center text-muted text-sm py-8">Aucun service disponible pour le moment.</p>
                ) : (
                  filteredServices.map((s) => {
                    const isSelected = selectedServiceIds.includes(s.id);
                    // 3. Affichage correct du prix selon la variante sur la ligne
                    const displayPrice = formatFCA(getServicePrice(s, clientType));
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleServiceToggle(s.id)}
                        className={`glass-card p-6 flex items-center gap-6 text-left hover:border-white/40 transition-all ${
                          isSelected ? "border-white bg-white/5" : ""
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected ? "bg-white text-black" : "bg-white/5 text-white"
                        }`}>
                          {isSelected ? <Check size={22} /> : <Scissors size={24} />}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold uppercase tracking-tight">{s.nom}</h3>
                          <p className="text-secondary text-xs">{s.description || "Aucune description"}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{displayPrice}</div>
                        </div>
                      </button>
                    );
                  })
                )}
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
                <button
                  onClick={prevStep}
                  className="flex items-center gap-2 text-muted hover:text-white transition-colors text-xs uppercase tracking-widest font-bold"
                >
                  <ChevronLeft size={14} /> Retour
                </button>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="text-muted hover:text-red-400 transition-colors text-[10px] uppercase tracking-widest font-bold"
                >
                  Annuler la réservation
                </button>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold uppercase tracking-tighter">Disponibilités</h2>
                <p className="text-secondary text-sm">Le salon est ouvert du Lundi au Samedi.</p>
              </div>

              <div className="space-y-8">
                <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
                  <DayPicker
                    mode="single"
                    selected={state.date ? new Date(state.date) : undefined}
                    onSelect={(day) => {
                      if (day) {
                        setState((prev) => ({ ...prev, date: format(day, "yyyy-MM-dd") }));
                      }
                    }}
                    locale={fr}
                    disabled={{ before: new Date() }}
                    className="glass-card p-4 rounded-xl text-white shadow-lg p-5"
                    classNames={{
                      today: `border-white rounded-xl`,
                      selected: `bg-white rounded-4xl border-amber-500 text-black`,
                      chevron: `fill-white`
                    }}
                  />
                </div>

                {state.date && (
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_SLOTS.map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setState((prev) => ({ ...prev, time: t }));
                          nextStep();
                        }}
                        className={`py-3 glass-card text-xs font-bold uppercase tracking-widest ${
                          state.time === t ? "bg-white text-black" : ""
                        }`}
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
                <button
                  onClick={prevStep}
                  className="flex items-center gap-2 text-muted hover:text-white transition-colors text-xs uppercase tracking-widest font-bold"
                >
                  <ChevronLeft size={14} /> Retour
                </button>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="text-muted hover:text-red-400 transition-colors text-[10px] uppercase tracking-widest font-bold"
                >
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
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          client: { ...prev.client, nom: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Prénom</label>
                    <input
                      type="text"
                      className="w-full bg-glass-bg border border-glass-border p-4 rounded-xl focus:border-white transition-colors outline-none"
                      placeholder="John"
                      value={state.client.prenom}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          client: { ...prev.client, prenom: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  {/*<input
                    type="tel"
                    className="w-full bg-glass-bg border border-glass-border p-4 rounded-xl focus:border-white transition-colors outline-none"
                    placeholder="+229 XX XX XX XX"
                    value={state.client.telephone}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        client: { ...prev.client, telephone: e.target.value },
                      }))
                    }
                  />*/}
                  <PhoneInput
                    value={state.client.telephone}
                    onChange={(value) =>
                      setState((prev) => ({
                        ...prev,
                        client: { ...prev.client, telephone: value },
                      }))
                    }
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
                <button
                  onClick={prevStep}
                  className="flex items-center gap-2 text-muted hover:text-white transition-colors text-xs uppercase tracking-widest font-bold"
                >
                  <ChevronLeft size={14} /> Retour
                </button>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="text-muted hover:text-red-400 transition-colors text-[10px] uppercase tracking-widest font-bold"
                >
                  Annuler la réservation
                </button>
              </div>

              <div className="glass-card p-8 space-y-6">
                <div className="flex justify-between items-start border-b border-glass pb-6">
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-widest text-muted">Formule</div>
                    <div className="font-bold text-xl uppercase tracking-tighter">
                      {services.find(s => s.id === state.serviceId)?.nom || "Sur-mesure"}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-[10px] uppercase tracking-widest text-muted">Date & Heure</div>
                    <div className="font-bold uppercase tracking-tighter">
                      {state.date} @ {state.time}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 uppercase tracking-widest text-[10px] font-bold">
                  <div className="flex justify-between text-secondary">
                    <span>Prix Total ({clientType.toLowerCase()})</span>
                    <span>{formatFCA(totalPrix)}</span>
                  </div>
                  <div className="flex justify-between text-white text-sm">
                    <span>Avance à payer (50%)</span>
                    <span>{formatFCA(advanceAmount)}</span>
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
                  En payant l'avance, vous confirmez votre présence. <br />
                  Le solde sera réglé au salon.
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
                  <div className="text-[10px] uppercase font-bold text-muted tracking-widest mb-1">Détails Tarifs</div>
                  <div className="text-sm font-medium">
                    Total ({clientType.toLowerCase()}) : {formatFCA(totalPrix)}
                  </div>
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
              </div>

              <div className="bg-white/5 p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest">
                  <span className="text-muted">À payer immédiatement</span>
                  <span className="text-white">
                    {formatFCA(advanceAmount)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={open}
                  disabled={submitting}
                  className="btn-primary w-full py-4 text-xs font-bold disabled:opacity-50"
                >
                  {submitting ? "Confirmation..." : "Confirmer"}
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

export default function Reserver() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white/80"></div>
        <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Chargement...</p>
      </div>
    }>
      <ReserverContent />
    </Suspense>
  );
}