// src/pages/passport/components/CareerPassportPricingSection.tsx
// Career Passport Commercial & Pricing Section
// Free-to-Create, Pay-to-Upgrade Lifetime Model (₹0, ₹399, ₹699, ₹999)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  QrCode, 
  FileCheck, 
  HelpCircle, 
  Building2, 
  GraduationCap, 
  ChevronDown, 
  ChevronUp,
  Award,
  Lock,
  Globe,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CAREER_PASSPORT_EDITIONS, 
  PassportEditionId, 
  VERIFICATION_ENTITLEMENT_MATRIX,
  VERIFICATION_STATUS_TIERS,
  B2B_REVENUE_MODELS,
  PASSPORT_FAQS
} from '@/services/passport/passportPricingCatalogue';
import { CareerPassportUpgradeModal } from './CareerPassportUpgradeModal';

export const CareerPassportPricingSection: React.FC = () => {
  const navigate = useNavigate();
  const [selectedUpgradeEdition, setSelectedUpgradeEdition] = useState<PassportEditionId | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handlePlanCta = (editionId: PassportEditionId) => {
    if (editionId === 'basic') {
      navigate('/auth/register?intent=passport');
    } else {
      setSelectedUpgradeEdition(editionId);
    }
  };

  const editions: PassportEditionId[] = ['basic', 'essential', 'professional', 'elite'];

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F4F7FC] via-white to-[#F4F7FC] border-t border-[#E2E8F0] text-left">
      <div className="max-w-7xl mx-auto space-y-10 sm:space-y-12">

        {/* ─────────────────────────────────────────────────────────────
            1. SECTION HEADER
           ───────────────────────────────────────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Simple, Transparent Pricing</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-[#111827] tracking-tight">
            Your Professional Identity. <br />
            <span className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] bg-clip-text text-transparent">
              Your Lifetime Asset.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
            Start free. Upgrade when you're ready. No recurring subscription required for your passport edition.
          </p>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. THE FOUR PRICING CARDS
           ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {editions.map((id) => {
            const ed = CAREER_PASSPORT_EDITIONS[id];
            const isPopular = ed.popular;
            const isFree = ed.priceINR === 0;

            return (
              <div
                key={id}
                className={`relative rounded-3xl flex flex-col justify-between p-6 sm:p-7 transition-all ${
                  isPopular
                    ? 'bg-white border-2 border-[#2563EB] shadow-xl ring-4 ring-blue-100/70 -translate-y-2'
                    : 'bg-white border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-slate-300'
                }`}
              >
                {/* Popular / Best Badge */}
                {isPopular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#2563EB] to-[#7138E8] text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                    Most Popular
                  </span>
                )}

                {ed.badge && !isPopular && (
                  <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
                    {ed.badge}
                  </span>
                )}

                <div className="space-y-4">
                  {/* Plan Name & Tagline */}
                  <div>
                    <h3 className="text-lg font-black text-[#111827]">
                      {ed.name.replace('Career Passport ', '')}
                    </h3>
                    <p className="text-xs text-[#64748B] mt-0.5 font-medium">
                      {ed.tagline}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-[#111827]">
                        {ed.priceFormatted}
                      </span>
                      <span className="text-xs text-[#64748B] font-semibold">
                        {isFree ? '/ forever' : 'one-time'}
                      </span>
                    </div>
                    <span className="inline-block mt-1 text-[11px] font-bold text-[#2563EB]">
                      {isFree ? 'No credit card required' : 'Lifetime passport ownership'}
                    </span>
                  </div>

                  {/* Verification Highlight Pill */}
                  <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    isFree 
                      ? 'bg-slate-50 text-slate-700 border border-slate-200' 
                      : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  }`}>
                    <FileCheck className={`w-4 h-4 shrink-0 ${isFree ? 'text-slate-400' : 'text-emerald-600'}`} />
                    <span>
                      {isFree 
                        ? 'Self-declared credentials' 
                        : `${ed.verificationRequests} Verification requests included`}
                    </span>
                  </div>

                  {/* Feature Bullets */}
                  <div className="space-y-2.5 pt-2 text-xs">
                    {ed.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[#334155]">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card CTA */}
                <div className="pt-6 mt-6 border-t border-slate-100">
                  <Button
                    onClick={() => handlePlanCta(id)}
                    className={`w-full font-bold text-xs py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 ${
                      isPopular
                        ? 'bg-gradient-to-r from-[#2563EB] to-[#7138E8] hover:opacity-95 text-white shadow-blue-500/25'
                        : isFree
                        ? 'bg-slate-900 hover:bg-slate-800 text-white'
                        : 'bg-white border-2 border-[#2563EB] text-[#2563EB] hover:bg-blue-50'
                    }`}
                  >
                    <span>{ed.ctaLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Currency & Tax Disclaimer */}
        <p className="text-xs text-center text-[#64748B] font-medium">
          Prices in INR. Applicable taxes, if any, shown at checkout. No automatic renewal.
        </p>

        {/* ─────────────────────────────────────────────────────────────
            3. VERIFICATION ENTITLEMENT POLICY TABLE
           ───────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2563EB] text-[11px] font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Authoritative Verification Policy</span>
              </div>
              <h3 className="text-xl font-black text-[#111827]">
                Feature & Verification Entitlement Matrix
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Verification is the foundation of Career Passport's credibility. Review exact entitlements across each edition.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs text-[#2563EB] max-w-sm">
              💡 <strong>Universal Rule:</strong> Anyone can verify a passport for free via QR scan. Paid entitlements cover submitting records for authoritative verification.
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F8FAFC] text-[#475569] uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Feature / Capability</th>
                  <th className="p-3.5 text-center">Basic (₹0)</th>
                  <th className="p-3.5 text-center">Essential (₹399)</th>
                  <th className="p-3.5 text-center bg-blue-50/70 text-[#2563EB]">Professional (₹699)</th>
                  <th className="p-3.5 text-center">Elite (₹999)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[#1E293B]">
                {VERIFICATION_ENTITLEMENT_MATRIX.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-[#111827]">{row.featureName}</div>
                      <div className="text-[11px] text-[#64748B] mt-0.5">{row.description}</div>
                    </td>
                    <td className="p-3.5 text-center font-medium">{row.basic}</td>
                    <td className="p-3.5 text-center font-semibold text-slate-800">{row.essential}</td>
                    <td className="p-3.5 text-center font-black text-[#2563EB] bg-blue-50/30">{row.professional}</td>
                    <td className="p-3.5 text-center font-black text-purple-700">{row.elite}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            4. THREE TRUST & CREDIBILITY STATUSES
           ───────────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
          <div className="max-w-3xl space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-300">
              Zero Tolerance for Credential Fraud
            </span>
            <h3 className="text-2xl font-black tracking-tight">
              3 Distinct Verification Trust Statuses
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Never automatically mark a credential as verified simply because it was uploaded. We maintain complete transparency with employers and institutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {VERIFICATION_STATUS_TIERS.map((tier, idx) => (
              <div 
                key={idx} 
                className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-2.5 text-left"
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${tier.badgeClass}`}>
                    {tier.status}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Stage 0{idx + 1}</span>
                </div>
                <h4 className="text-sm font-bold text-white">{tier.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {tier.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            5. ADDITIONAL B2B / INSTITUTIONAL REVENUE ENGINES
           ───────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-[#7138E8] text-[11px] font-bold uppercase tracking-wider mb-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>Institutional & Enterprise Ecosystem</span>
            </div>
            <h3 className="text-xl font-black text-[#111827]">
              Career Passport for Institutions, Employers & Enterprise
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Affordable lifetime ownership for individuals; powerful verification and batch infrastructure for businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {B2B_REVENUE_MODELS.map((b2b, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#2563EB]">
                    {b2b.customer}
                  </span>
                  <h4 className="text-sm font-bold text-[#111827]">{b2b.revenueModel}</h4>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {b2b.description}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/auth/register?intent=enterprise')}
                  className="w-full text-xs font-bold border-[#E2E8F0] hover:bg-white text-[#111827]"
                >
                  {b2b.cta} →
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            6. COMPREHENSIVE FAQS ACCORDION
           ───────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl font-black text-[#111827]">
              Frequently Asked Questions
            </h3>
            <p className="text-xs text-[#64748B]">
              Everything you need to know about pricing, verification entitlements, and lifetime portability.
            </p>
          </div>

          <div className="max-w-3xl mx-auto divide-y divide-slate-100">
            {PASSPORT_FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="py-4">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left gap-4 font-bold text-sm text-[#111827] hover:text-[#2563EB] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#2563EB] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <p className="text-xs text-[#64748B] leading-relaxed mt-2.5 animate-in fade-in duration-150">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Interactive Upgrade Modal */}
      <CareerPassportUpgradeModal
        isOpen={!!selectedUpgradeEdition}
        onClose={() => setSelectedUpgradeEdition(null)}
        initialEditionId={selectedUpgradeEdition || 'professional'}
      />
    </section>
  );
};
