import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserPlan } from '../../types';
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
  Check,
} from 'lucide-react';

export const UpgradeModal: React.FC = () => {
  const {
    isUpgradeModalOpen,
    setIsUpgradeModalOpen,
    selectedUpgradePlan,
    setSelectedUpgradePlan,
    upgradeSubscription,
    user,
    quota,
    t,
  } = useApp();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState(user.name || '');

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

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      upgradeSubscription(selectedUpgradePlan, billingCycle);
      setIsProcessing(false);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in-50">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        {/* Close button */}
        <button
          onClick={() => setIsUpgradeModalOpen(false)}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
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
              ].map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-200">
                  <div className="shrink-0">{feat.icon}</div>
                  <span>{feat.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('upgrade_ssl_guarantee')}</span>
            </div>
            <span>{t('upgrade_cancel_anytime')}</span>
          </div>
        </div>

        {/* Right column: Checkout & Payment details */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Billing Toggle (Monthly / Annual) */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t('upgrade_billing_cycle')}
              </span>
              <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
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
                    {billingCycle === 'annual' ? '/ year ($7.00/mo billed annually)' : '/ month'}
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

            {/* Simulated Payment Form */}
            <form onSubmit={handleSubmitPayment} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {t('upgrade_cardholder')}
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {t('upgrade_card_number')}
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    {t('upgrade_expiration')}
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    required
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    {t('upgrade_cvc')}
                  </label>
                  <input
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    required
                    placeholder="CVC"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t('upgrade_processing')}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>{t('upgrade_pay_btn', { total: finalTotal.toFixed(2) })}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
