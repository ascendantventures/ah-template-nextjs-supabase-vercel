'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { PRICING_TIERS } from '@/lib/copy';
import { cn } from '@/lib/utils';

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section
      id="pricing"
      className="py-24 px-6 bg-[#0E0D0B]"
      aria-labelledby="pricing-heading"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-4">
            Pricing
          </span>
          <h2
            id="pricing-heading"
            className="font-bold text-white tracking-tight mb-4"
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              letterSpacing: '-0.02em',
            }}
          >
            Simple, transparent pricing
          </h2>
          <p
            className="text-white/60 max-w-xl mx-auto text-lg leading-relaxed font-editorial"
            style={{ fontFamily: "'Newsreader', 'Georgia', serif" }}
          >
            Start free. Scale as you grow. No hidden fees, no surprises.
          </p>
        </div>

        {/* Billing toggle */}
        <div
          className="flex items-center justify-center gap-4 mb-10"
          role="group"
          aria-label="Billing period toggle"
        >
          <span
            className={cn(
              'text-sm font-medium transition-colors duration-150',
              !isAnnual ? 'text-white' : 'text-white/50'
            )}
          >
            Monthly
          </span>
          <Switch
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
            aria-label="Toggle annual billing"
          />
          <span
            className={cn(
              'text-sm font-medium transition-colors duration-150',
              isAnnual ? 'text-white' : 'text-white/50'
            )}
          >
            Annual
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400">
              Save 20%
            </span>
          </span>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PRICING_TIERS.map((tier) => {
            const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
            const isFree = price === 0;

            return (
              <div
                key={tier.name}
                className={cn(
                  'relative rounded-2xl border p-8 transition-all duration-200',
                  tier.highlighted
                    ? 'ring-2 ring-indigo-500 border-indigo-500/50 bg-indigo-950/30 scale-105 shadow-xl shadow-indigo-500/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/[0.08] hover:border-white/20'
                )}
              >
                {/* Badge */}
                {tier.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-500 text-white shadow-lg shadow-indigo-500/30">
                      {tier.badge}
                    </span>
                  </div>
                )}

                {/* Tier name */}
                <h3 className="text-xl font-bold text-white mb-1 tracking-tight">
                  {tier.name}
                </h3>
                <p
                  className="text-sm text-white/50 mb-6 font-editorial"
                  style={{ fontFamily: "'Newsreader', 'Georgia', serif" }}
                >
                  {tier.description}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-white tracking-tight">
                    {isFree ? 'Free' : `$${price}`}
                  </span>
                  {!isFree && (
                    <span className="text-white/50 text-sm">/mo</span>
                  )}
                </div>
                {isAnnual && !isFree && (
                  <p className="text-xs text-white/40 mb-6">
                    Billed annually (${price * 12}/yr)
                  </p>
                )}
                {(!isAnnual || isFree) && (
                  <p className="text-xs text-white/40 mb-6">
                    {isFree ? 'Free forever' : 'Billed monthly'}
                  </p>
                )}

                {/* CTA button */}
                <a
                  href="#signup"
                  className={cn(
                    'w-full flex items-center justify-center px-6 py-3.5 text-sm font-semibold rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E0D0B] mb-8 min-h-[44px]',
                    tier.highlighted
                      ? 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/10 hover:border-white/20'
                  )}
                >
                  {tier.cta}
                </a>

                {/* Feature list */}
                <ul className="space-y-3" aria-label={`${tier.name} plan features`}>
                  {tier.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check
                          className="w-4 h-4 text-green-400 shrink-0 mt-0.5"
                          aria-label="Included"
                          aria-hidden="true"
                        />
                      ) : (
                        <X
                          className="w-4 h-4 text-gray-600 shrink-0 mt-0.5"
                          aria-label="Not included"
                          aria-hidden="true"
                        />
                      )}
                      <span
                        className={cn(
                          'text-sm',
                          feature.included ? 'text-white/70' : 'text-white/30'
                        )}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
