import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PRICING_PLANS } from '../../data/toolsData';
import { UserPlan } from '../../types';
import { Check, Sparkles, Crown, Zap, Shield } from 'lucide-react';

export const PricingSection: React.FC = () => {
  const { user, setIsUpgradeModalOpen, setSelectedUpgradePlan, t } = useApp();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const handleSelectPlan = (planId: string) => {
    if (planId === 'free') return;
    setSelectedUpgradePlan(planId as UserPlan);
    setIsUpgradeModalOpen(true);
  };

  const getLocalizedPlan = (plan: (typeof PRICING_PLANS)[0]) => {
    if (plan.id === 'free') {
      return {
        ...plan,
        name: t('plan_free_name'),
        badge: t('plan_free_badge'),
        description: t('plan_free_desc'),
        limitText: t('plan_free_limit'),
        cta: t('plan_free_cta'),
        features: [
          t('plan_free_f1'),
          t('plan_free_f2'),
          t('plan_free_f3'),
          t('plan_free_f4'),
          t('plan_free_f5'),
        ],
      };
    }
    if (plan.id === 'pro') {
      return {
        ...plan,
        name: t('plan_pro_name'),
        badge: t('plan_pro_badge'),
        description: t('plan_pro_desc'),
        limitText: t('plan_pro_limit'),
        cta: t('plan_pro_cta'),
        features: [
          t('plan_pro_f1'),
          t('plan_pro_f2'),
          t('plan_pro_f3'),
          t('plan_pro_f4'),
          t('plan_pro_f5'),
        ],
      };
    }
    if (plan.id === 'business') {
      return {
        ...plan,
        name: t('plan_biz_name'),
        badge: t('plan_biz_badge'),
        description: t('plan_biz_desc'),
        limitText: t('plan_biz_limit'),
        cta: t('plan_biz_cta'),
        features: [
          t('plan_biz_f1'),
          t('plan_biz_f2'),
          t('plan_biz_f3'),
          t('plan_biz_f4'),
          t('plan_biz_f5'),
        ],
      };
    }
    return plan;
  };

  const localizedPlans = PRICING_PLANS.map(getLocalizedPlan);

  return (
    <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-3 border border-indigo-200/60 dark:border-indigo-800/60">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>{t('pricing_badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t('pricing_title')}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2.5">
            {t('pricing_subtitle')}
          </p>

          {/* Monthly / Annual switch */}
          <div className="mt-8 inline-flex items-center bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('pricing_monthly_billing')}
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                billingCycle === 'annual'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{t('pricing_annual_billing')}</span>
              <span className="text-[10px] font-extrabold bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full">
                {t('pricing_save_22')}
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {localizedPlans.map((plan) => {
            const isCurrentPlan = user.plan === plan.id;
            const price = billingCycle === 'annual' ? (plan.annualPrice / 12).toFixed(2) : plan.monthlyPrice.toFixed(2);

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-200 ${
                  plan.highlight
                    ? 'bg-white dark:bg-slate-900 border-2 border-indigo-500 dark:border-indigo-500 shadow-2xl shadow-indigo-500/10 lg:-translate-y-2'
                    : 'bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-md'
                }`}
              >
                {/* Popular Badge */}
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {plan.name}
                    </h3>
                    {isCurrentPlan && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        {t('pricing_active_plan')}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 min-h-[32px] leading-relaxed">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mt-5 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                        ${price}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {t('pricing_per_month')}
                      </span>
                    </div>
                    {billingCycle === 'annual' && plan.annualPrice > 0 && (
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                        {t('pricing_billed_annually', {
                          annualPrice: plan.annualPrice,
                          savings: (plan.monthlyPrice * 12 - plan.annualPrice).toFixed(0),
                        })}
                      </p>
                    )}
                    <div className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {plan.limitText}
                    </div>
                  </div>

                  {/* Feature checklist */}
                  <div className="space-y-3">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {t('pricing_included_caps')}
                    </p>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <div className="mt-8 pt-4">
                  {isCurrentPlan ? (
                    <button
                      disabled
                      className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold text-center cursor-default"
                    >
                      {t('pricing_currently_active')}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSelectPlan(plan.id)}
                      className={`w-full py-3 rounded-xl text-xs font-extrabold transition-all shadow-md cursor-pointer ${
                        plan.highlight
                          ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-500/25 hover:scale-[1.02]'
                          : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900'
                      }`}
                    >
                      {plan.cta}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
