"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useKKiaPay } from "kkiapay-react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, MapPin, ChevronLeft, CheckCircle2, Store, Truck, CreditCard, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext"; 
import { formatPrice } from "@/utils/format";
import PhoneInput from "@/components/ui/PhoneInput";

interface CheckoutState {
  step: number;
  shippingMethod: "SALON" | "DELIVERY";
  client: {
    nom: string;
    prenom: string;
    telephone: string;
    adresse: string;
    ville: string;
  };
}

export default function Checkout() {
  const router = useRouter();
  const { items: cartItems, total: totalAmount, clearCart } = useCart();
  const { openKkiapayWidget, addKkiapayListener, removeKkiapayListener } = useKKiaPay();
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);

  const [state, setState] = useState<CheckoutState>({
    step: 1,
    shippingMethod: "SALON",
    client: { nom: "", prenom: "", telephone: "", adresse: "", ville: "" },
  });

  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const shippingCost = state.shippingMethod === "DELIVERY" ? 1000 : 0;
  const finalTotal = totalAmount + shippingCost;

  useEffect(() => {
    async function fetchClientProfile() {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          setState((prev) => ({
            ...prev,
            client: {
              ...prev.client,
              nom: data.nom || "",
              prenom: data.prenom || "",
              telephone: data.telephone || "",
            },
          }));
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du profil :", error);
      } finally {
        setLoadingUser(false);
      }
    }
    fetchClientProfile();
  }, []);

  const triggerKkiapayPayment = useCallback(() => {
    if (finalTotal === 0) return;
    
    openKkiapayWidget({
      amount: Math.round(finalTotal),
      reason: "Paiement Commande Boutique",
      name: `${state.client.prenom} ${state.client.nom}`,
      callback: window.location.origin + "/boutique/confirmation",
      publicAPIKey: process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY,
      sandbox: process.env.NEXT_PUBLIC_KKIAPAY_ENVIRONMENT === 'true' || process.env.NEXT_PUBLIC_KKIAPAY_ENVIRONMENT === 'test',
    });
    /*
        openKkiapayWidget({
      amount: Math.round(finalTotal),
      reason: "Paiement Commande Boutique",
      phone: state.client.telephone,
      name: `${state.client.prenom} ${state.client.nom}`,
      callback: window.location.origin + "/boutique/confirmation",
      publicAPIKey: process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY,
      sandbox: process.env.NEXT_PUBLIC_KKIAPAY_ENVIRONMENT,
    }); */
  }, [finalTotal, state.client, openKkiapayWidget]);

  useEffect(() => {
    if (state.step === 2 && finalTotal > 0) {
      triggerKkiapayPayment();
    }
  }, [state.step, finalTotal, triggerKkiapayPayment]);

  const createOrder = useCallback(
    async (transactionId: string) => {
      setSubmitting(true);
      try {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client: state.client,
            items: cartItems.map(({ id, quantite, prix }) => ({ id, quantite, prix })),
            totalAmount: totalAmount,
            shippingCost: shippingCost,
            shippingMethod: state.shippingMethod,
            finalAmount: finalTotal,
            transactionId: transactionId,
            status: "PAID",
          }),
        });

       if (!response.ok) throw new Error("Order creation failed");

        clearCart();
        // Au lieu de router.push, on passe au step 3
        setState(prev => ({ ...prev, step: 3 }));
        setIsOrderConfirmed(true);
      } catch (error) {
        alert("Impossible de finaliser votre commande. Contactez le support.");
      } finally {
        setSubmitting(false);
      }
    },
    [state, cartItems, totalAmount, shippingCost, finalTotal, clearCart]
  );


  useEffect(() => {
    function successHandler(response: any) {
      createOrder(response.transactionId);
    }
    function failureHandler(error: any) {
      console.log("Échec du paiement :", error);
    }

    addKkiapayListener("success", successHandler);
    addKkiapayListener("failed", failureHandler);
    
    return () => {
      removeKkiapayListener("success");
      removeKkiapayListener("failed");
    };
  }, [addKkiapayListener, removeKkiapayListener, createOrder]);

  const nextStep = () => setState((prev) => ({ ...prev, step: prev.step + 1 }));
  const prevStep = () => setState((prev) => ({ ...prev, step: prev.step - 1 }));

  const isFormValid = () => {
    const { nom, prenom, telephone, adresse, ville } = state.client;
    if (!nom || !prenom || !telephone) return false;
    if (state.shippingMethod === "DELIVERY" && (!adresse || !ville)) return false;
    return true;
  };

  if (cartItems.length === 0 && state.step === 1) {
    return (
      <main className="pt-32 px-6 text-center max-w-md mx-auto space-y-4">
        <ShoppingBag className="mx-auto text-white/20" size={48} />
        <h2 className="text-2xl font-bold uppercase tracking-tighter">Votre panier est vide</h2>
        <button onClick={() => router.push("/boutique")} className="w-full btn-primary py-4 text-xs font-bold uppercase tracking-widest">
          Retour à la boutique
        </button>
      </main>
    );
  }

  return (
    <main className="pt-32 px-6 pb-20 min-h-screen relative">
      <div className="max-w-xl mx-auto space-y-8">
        
        <div className="flex justify-center items-center gap-4 px-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${state.step >= i ? "bg-white text-black" : "glass-card text-muted"}`}>
                {state.step > i ? <CheckCircle2 size={16} /> : i}
              </div>
              {i < 3 && <div className={`w-16 h-px mx-4 ${state.step > i ? "bg-white" : "bg-glass-border"}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {state.step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold uppercase tracking-tighter">Mode de réception</h2>
                <p className="text-secondary text-sm">Choisissez comment récupérer vos produits.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setState(p => ({ ...p, shippingMethod: "SALON" }))}
                  className={`p-5 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                    state.shippingMethod === "SALON" 
                      ? "border-white bg-white/5 text-white" 
                      : "border-white/[0.08] bg-transparent text-muted hover:text-white"
                  }`}
                >
                  <Store size={24} />
                  <div className="text-center">
                    <p className="text-xs font-bold uppercase tracking-wider">Retrait au Salon</p>
                    <p className="text-[10px] text-emerald-400 mt-0.5">Gratuit</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setState(p => ({ ...p, shippingMethod: "DELIVERY" }))}
                  className={`p-5 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                    state.shippingMethod === "DELIVERY" 
                      ? "border-white bg-white/5 text-white" 
                      : "border-white/[0.08] bg-transparent text-muted hover:text-white"
                  }`}
                >
                  <Truck size={24} />
                  <div className="text-center">
                    <p className="text-xs font-bold uppercase tracking-wider">Livraison à domicile</p>
                    <p className="text-[10px] text-white/60 mt-0.5">+1 000 FCFA</p>
                  </div>
                </button>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/[0.08] relative">
                {loadingUser && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 flex items-center justify-center">
                    <Loader2 className="animate-spin text-white" size={24} />
                  </div>
                )}
                
                <div className="text-[10px] uppercase tracking-widest text-muted font-bold mb-2">Informations personnelles</div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Nom *" className="w-full bg-glass-bg border border-glass-border p-4 rounded-xl outline-none" value={state.client.nom} onChange={(e) => setState(p => ({ ...p, client: { ...p.client, nom: e.target.value } }))} />
                  <input type="text" placeholder="Prénom *" className="w-full bg-glass-bg border border-glass-border p-4 rounded-xl outline-none" value={state.client.prenom} onChange={(e) => setState(p => ({ ...p, client: { ...p.client, prenom: e.target.value } }))} />
                </div>
                    <PhoneInput
                    value={state.client.telephone}
                    onChange={(value) =>
                        setState((p) => ({
                        ...p,
                        client: { ...p.client, telephone: value },
                        }))
                    }
                    />                
                <AnimatePresence>
                  {state.shippingMethod === "DELIVERY" && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                      <div className="text-[10px] uppercase tracking-widest text-muted font-bold mt-2">Adresse de livraison</div>
                      <input type="text" placeholder="Adresse complète (Quartier, repères...) *" className="w-full bg-glass-bg border border-glass-border p-4 rounded-xl outline-none" value={state.client.adresse} onChange={(e) => setState(p => ({ ...p, client: { ...p.client, adresse: e.target.value } }))} />
                      <input type="text" placeholder="Ville *" className="w-full bg-glass-bg border border-glass-border p-4 rounded-xl outline-none" value={state.client.ville} onChange={(e) => setState(p => ({ ...p, client: { ...p.client, ville: e.target.value } }))} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <button disabled={!isFormValid() || loadingUser} onClick={nextStep} className="w-full btn-primary mt-6 disabled:opacity-50 flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-widest">
                  Passer au paiement ({formatPrice(finalTotal)} F) <MapPin size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {state.step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
              <div className="flex justify-between items-center">
                <button onClick={prevStep} disabled={submitting} className="flex items-center gap-2 text-muted hover:text-white transition-colors text-xs uppercase font-bold disabled:opacity-30"><ChevronLeft size={14} /> Retour</button>
                <button onClick={() => setShowCancelModal(true)} disabled={submitting} className="text-muted hover:text-red-400 transition-colors text-[10px] uppercase font-bold disabled:opacity-30">Annuler</button>
              </div>

              <div className="glass-card p-8 space-y-6 relative overflow-hidden">
                {submitting && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="animate-spin text-white" size={32} />
                    <span className="text-xs uppercase tracking-widest font-bold">Validation de votre commande...</span>
                  </div>
                )}

                <div className="border-b border-white/[0.08] pb-4 space-y-2">
                  <div className="text-[10px] uppercase tracking-widest text-muted">Articles</div>
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-white/80">{item.nom} <span className="text-xs text-white/40">x{item.quantite}</span></span>
                      <span className="font-bold">{formatPrice(item.prix * item.quantite)} F</span>
                    </div>
                  ))}
                </div>

                <div className="border-b border-white/[0.08] pb-4 text-sm space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-white/60">Sous-total panier</span>
                    <span>{formatPrice(totalAmount)} F</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Mode de réception</span>
                    <span className="text-xs font-bold uppercase">{state.shippingMethod === "SALON" ? "Retrait Salon" : "Livraison"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Frais de port</span>
                    <span className={shippingCost > 0 ? "text-white" : "text-emerald-400"}>
                      {shippingCost > 0 ? `${formatPrice(shippingCost)} F` : "Gratuit"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center uppercase text-xs font-bold text-white pt-2">
                  <span>Net à payer</span>
                  <span className="text-lg text-white">{formatPrice(finalTotal)} FCFA</span>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/[0.08]">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                    <p className="text-xs text-white/80 animate-pulse flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={14} /> Fenêtre de paiement Kkiapay active...
                    </p>
                  </div>

                  <button
                    onClick={triggerKkiapayPayment}
                    type="button"
                    className="w-full btn-secondary border-white/20 hover:border-white/40 flex items-center justify-center gap-3 py-4 text-xs font-bold uppercase tracking-widest"
                  >
                    <span>Relancer le guichet de paiement</span>
                    <CreditCard size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {state.step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 glass-card p-8"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 size={36} />
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-bold uppercase tracking-tighter text-white">Commande validée !</h2>
                <p className="text-secondary text-sm">Merci pour votre achat. Votre commande a bien été enregistrée.</p>
              </div>

              <div className="border-t border-b border-white/[0.08] py-4 text-left text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/60">Destinataire</span>
                  <span className="font-medium text-white">{state.client.prenom} {state.client.nom}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Mode de retrait</span>
                  <span className="font-medium text-white uppercase">{state.shippingMethod === "SALON" ? "Retrait Salon" : "Livraison"}</span>
                </div>
                {state.shippingMethod === "DELIVERY" && (
                  <div className="flex justify-between">
                    <span className="text-white/60">Adresse</span>
                    <span className="font-medium text-white text-right max-w-xs">{state.client.adresse}, {state.client.ville}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-white/[0.08] pt-2 font-bold">
                  <span className="text-white">Montant payé</span>
                  <span className="text-white">{formatPrice(finalTotal)} FCFA</span>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <p className="text-xs text-white/50">
                  {state.shippingMethod === "SALON" 
                    ? "Vous pouvez passer récupérer vos produits au salon Freshcut pendant nos horaires d'ouverture."
                    : "Notre service de livraison vous contactera au numéro fourni sous 24h à 48h."}
                </p>
                <button
                  onClick={() => router.push('/boutique')}
                  className="w-full btn-primary py-4 text-xs font-bold uppercase tracking-widest"
                >
                  Retour à la boutique
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}