import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  CheckCircle2,
  Crown,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Lock,
  Tag,
  Zap,
  Clock,
  Infinity as InfinityIcon,
  Smartphone,
  Globe2,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';

interface BillingConfigResponse {
  activeProviderId: string;
  activeProviderName: string;
  supportedProviders: Array<{
    id: string;
    name: string;
    description: string;
    configured: boolean;
  }>;
}

export const UpgradeModal: React.FC = () => {
  const {
    isUpgradeModalOpen,
    setIsUpgradeModalOpen,
    selectedUpgradePlan,
    setSelectedUpgradePlan,
    upgradeSubscription,
    user,
    t,
  } = useApp();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('stripe');
  const [billingConfig, setBillingConfig] = useState<BillingConfigResponse | null>(null);

  useEffect(() => {
    if (isUpgradeModalOpen) {
      fetch('/api/billing/config')
        .then((res) => res.json())
        .then((data: BillingConfigResponse) => {
          setBillingConfig(data);
          if (data.activeProviderId && data.activeProviderId !== 'sandbox') {
            setSelectedProvider(data.activeProviderId);
          } else {
            setSelectedProvider('lemonsqueezy'); // Default recommendation for global/Africa
          }
        })
        .catch(() => {
          // Fallback
          setSelectedProvider('stripe');
        });
    }
  }, [isUpgradeModalOpen]);

  if (!isUpgradeModalOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === 'LAUNCH50') {
      setAppliedDiscount(0.5);
      setPromoMessage('50% Special Launch discount applied!');
    } else if (code === 'STUDENT30') {
      setAppliedDiscount(0.3);
      setPromoMessage('30% Student & Educator discount applied!');
    } else if (code === 'VIPFREE' || code === 'DOCUPULSE100') {
      setAppliedDiscount(1.0);
      setPromoMessage('100% Free Pro Pass applied!');
    } else {
      setPromoMessage('Invalid coupon code. Try "LAUNCH50"');
    }
  };

  const isPro = selectedUpgradePlan === 'pro';
  const baseMonthly = isPro ? 9 : 24;
  const baseAnnual = isPro ? 84 : 228; // $7/mo vs $19/mo

  const rawTotal = billingCycle === 'annual' ? baseAnnual : baseMonthly;
  const discountAmount = rawTotal * appliedDiscount;
  const finalTotal = Math.max(0, rawTotal - discountAmount);

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await upgradeSubscription(selectedUpgradePlan, billingCycle, selectedProvider);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in-50">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        {/* Close button */}
        <button
          onClick={() => setIsUpgradeModalOpen(false)}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left column: Benefits & Plan Selector */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 bg-gradient-to-br from-indigo-900/90 via-slate-900 to-slate-950 text-white flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>{t('upgrade_modal_power')}</span>
            </div>

            <h3 className="text-2xl font-extrabold tracking-tight">
              {t('upgrade_modal_title')}
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              {t('upgrade_modal_desc')}
            </p>

            {/* Plan selection buttons */}
            <div className="grid grid-cols-2 gap-2 mt-5 p-1 bg-slate-800/80 rounded-2xl border border-slate-700/50">
              <button
                type="button"
                onClick={() => setSelectedUpgradePlan('pro')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedUpgradePlan === 'pro'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('upgrade_plan_pro_btn')}
              </button>
              <button
                type="button"
                onClick={() => setSelectedUpgradePlan('business')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedUpgradePlan === 'business'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('upgrade_plan_biz_btn')}
              </button>
            </div>

            {/* Feature List */}
            <div className="space-y-2.5 mt-6">
              {[
                { text: t('upgrade_feat_1'), icon: <InfinityIcon className="w-4 h-4 text-emerald-400" /> },
                { text: t('upgrade_feat_2'), icon: <Zap className="w-4 h-4 text-amber-400" /> },
                { text: t('upgrade_feat_3'), icon: <CheckCircle2 className="w-4 h-4 text-indigo-400" /> },
                { text: t('upgrade_feat_4'), icon: <Sparkles className="w-4 h-4 text-pink-400" /> },
                { text: t('upgrade_feat_5'), icon: <Clock className="w-4 h-4 text-cyan-400" /> },
                { text: t('upgrade_feat_6'), icon: <ShieldCheck className="w-4 h-4 text-emerald-400" /> },
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-slate-200">
                  <div className="p-1 rounded-md bg-white/10 shrink-0">{feat.icon}</div>
                  <span>{feat.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Garantie satisfait ou remboursé 14 jours</span>
            </span>
            <span>Résiliation en 1 clic</span>
          </div>
        </div>

        {/* Right column: Checkout & Decoupled Payment Method details */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 bg-white dark:bg-slate-900 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t('upgrade_summary')}
              </span>

              {/* Billing Cycle Switch */}
              <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    billingCycle === 'monthly'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t('pricing_monthly')}
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('annual')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    billingCycle === 'annual'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{t('pricing_annual')}</span>
                  <span className="text-[9px] font-extrabold bg-amber-400 text-slate-950 px-1 rounded-full">
                    -22%
                  </span>
                </button>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 mb-5">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    ${finalTotal.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5">
                    {billingCycle === 'annual' ? '/ an ($7.00/mois facturé annuellement)' : '/ mois'}
                  </span>
                </div>
                {appliedDiscount > 0 && (
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                    {appliedDiscount * 100}% OFF
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {t('upgrade_charge_notice', { total: finalTotal.toFixed(2) })}
              </p>
            </div>

            {/* Promo Code input */}
            <form onSubmit={handleApplyPromo} className="mb-5">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder={t('upgrade_coupon_placeholder')}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                >
                  {t('upgrade_apply')}
                </button>
              </div>
              {promoMessage && (
                <p className={`text-[11px] mt-1 font-medium ${appliedDiscount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                  {promoMessage}
                </p>
              )}
            </form>

            {/* Decoupled Payment Method Selector (Prompt 5) */}
            <div className="mb-5">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Moyen de paiement sécurisé
              </label>

              <div className="space-y-2">
                {/* 1. Lemon Squeezy (Merchant of Record / Global & Africa) */}
                <button
                  type="button"
                  onClick={() => setSelectedProvider('lemonsqueezy')}
                  className={`w-full p-3 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                    selectedProvider === 'lemonsqueezy'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-100 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <Globe2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Lemon Squeezy (International & PayPal)
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-extrabold px-1.5 py-0.2 rounded-full">
                          Recommandé
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        Revendeur officiel mondial : accepte CB & PayPal, gère la TVA, reversement Payoneer/Wise (compatible Guinée / Afrique).
                      </p>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    selectedProvider === 'lemonsqueezy' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                  }`}>
                    {selectedProvider === 'lemonsqueezy' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>

                {/* 2. Stripe (Cartes Bancaires Internationales) */}
                <button
                  type="button"
                  onClick={() => setSelectedProvider('stripe')}
                  className={`w-full p-3 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                    selectedProvider === 'stripe'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-100 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Carte Bancaire (Stripe)
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        Cartes internationales Visa, Mastercard, American Express, Apple Pay, Google Pay.
                      </p>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    selectedProvider === 'stripe' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                  }`}>
                    {selectedProvider === 'stripe' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>

                {/* 3. Mobile Money (Orange Money Guinée / MTN) */}
                <button
                  type="button"
                  onClick={() => setSelectedProvider('cinetpay')}
                  className={`w-full p-3 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                    selectedProvider === 'cinetpay'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-100 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <Smartphone className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Mobile Money (Orange Money Guinée / MTN)
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        Paiement direct en Franc Guinéen (GNF) via Orange Money, MTN Mobile Money et Wave.
                      </p>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    selectedProvider === 'cinetpay' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                  }`}>
                    {selectedProvider === 'cinetpay' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>

                {/* 4. Sandbox Test Mode (Dev & Evaluation) */}
                <button
                  type="button"
                  onClick={() => setSelectedProvider('sandbox')}
                  className={`w-full p-3 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                    selectedProvider === 'sandbox'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-100 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Mode Test / Sandbox (Développement & Évaluation)
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        Valide l'activation instantanée du forfait avec session serveur sans carte réelle requise.
                      </p>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    selectedProvider === 'sandbox' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                  }`}>
                    {selectedProvider === 'sandbox' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <form onSubmit={handleSubmitPayment}>
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Connexion à la passerelle de paiement...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Payer ${finalTotal.toFixed(2)} et Activer l'Abonnement</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-3 text-center">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
                <Lock className="w-3 h-3 text-emerald-500" />
                <span>Paiement crypté SSL 256-bit — Détection et annulation en 1 clic</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
