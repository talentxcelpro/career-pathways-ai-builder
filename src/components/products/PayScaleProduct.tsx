// src/components/products/PayScaleProduct.tsx
// Flagship Salary Intelligence & Compensation Planning Platform for salary.talentxcel.in
// Master Light SaaS Design System (#FFFFFF, #F4F7FC, #2563EB, #7138E8, #111827, #E2E8F0)
// Complete 12-Module Suite across B2C Individuals, B2B Enterprise & AI Ecosystem

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { PayScaleHeader } from './payscale/PayScaleHeader';
import { PayScaleProModal } from './payscale/PayScaleProModal';
import { PayScaleOverview } from './payscale/PayScaleOverview';
import { SmartSalaryCalculatorModule } from './payscale/SmartSalaryCalculatorModule';
import { TaxPlanningIntelligenceModule } from './payscale/TaxPlanningIntelligenceModule';
import { SalaryBenchmarkModule } from './payscale/SalaryBenchmarkModule';
import { PayslipAndDocumentsModule } from './payscale/PayslipAndDocumentsModule';
import { AISalaryNegotiationCoachModule } from './payscale/AISalaryNegotiationCoachModule';
import { FinancialPlanningModule } from './payscale/FinancialPlanningModule';
import { EnterpriseCompensationModule } from './payscale/EnterpriseCompensationModule';
import { IncrementAppraisalPlannerModule } from './payscale/IncrementAppraisalPlannerModule';
import { RecruiterCompensationModule } from './payscale/RecruiterCompensationModule';
import { SalaryMarketIntelligenceModule } from './payscale/SalaryMarketIntelligenceModule';
import { CareerSalaryGrowthNavigator } from './payscale/CareerSalaryGrowthNavigator';
import { PayScaleAIAssistantModule } from './payscale/PayScaleAIAssistantModule';
import { PlatformEcosystemSidebar } from './jobmatch/PlatformEcosystemSidebar';
import { Compass, Sparkles, ShieldCheck, Heart } from 'lucide-react';
import { toast } from 'sonner';

export const PayScaleProduct: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [userSegment, setUserSegment] = useState<'individual' | 'employer'>('individual');
  const [isProModalOpen, setIsProModalOpen] = useState<boolean>(false);
  const [ecosystemSidebarOpen, setEcosystemSidebarOpen] = useState<boolean>(false);

  // Sync tab with URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSegmentChange = (seg: 'individual' | 'employer') => {
    setUserSegment(seg);
    if (seg === 'employer') {
      if (['calculator', 'tax', 'negotiation', 'planning'].includes(activeTab)) {
        setActiveTab('bands');
        setSearchParams({ tab: 'bands' });
      }
    } else {
      if (['bands', 'increments', 'recruiter'].includes(activeTab)) {
        setActiveTab('calculator');
        setSearchParams({ tab: 'calculator' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex flex-col font-sans selection:bg-[#2563EB] selection:text-white">
      <Helmet>
        <title>PayScale — Salary Intelligence & Compensation Planning | TalentXcel</title>
        <meta 
          name="description" 
          content="India's leading Salary Intelligence platform. Smart CTC to in-hand calculator, Old vs New Tax Regime optimization (FY 2025-26 & 2026-27), role benchmarks, and enterprise compensation bands." 
        />
        <link rel="canonical" href="https://salary.talentxcel.in/" />
      </Helmet>

      {/* Dedicated Header for PayScale Universe (Zero double navbar) */}
      <PayScaleHeader
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        userSegment={userSegment}
        onSegmentChange={handleSegmentChange}
        onOpenProModal={() => setIsProModalOpen(true)}
        onOpenEcosystem={() => setEcosystemSidebarOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'overview' && (
          <PayScaleOverview
            onNavigateTab={handleTabChange}
            onOpenProModal={() => setIsProModalOpen(true)}
            userSegment={userSegment}
            onSegmentChange={handleSegmentChange}
          />
        )}

        {activeTab === 'calculator' && <SmartSalaryCalculatorModule />}
        {activeTab === 'tax' && <TaxPlanningIntelligenceModule />}
        {activeTab === 'benchmark' && <SalaryBenchmarkModule />}
        {activeTab === 'documents' && <PayslipAndDocumentsModule />}
        {activeTab === 'negotiation' && <AISalaryNegotiationCoachModule />}
        {activeTab === 'planning' && <FinancialPlanningModule />}
        {activeTab === 'bands' && <EnterpriseCompensationModule />}
        {activeTab === 'increments' && <IncrementAppraisalPlannerModule />}
        {activeTab === 'recruiter' && <RecruiterCompensationModule />}
        {activeTab === 'trends' && <SalaryMarketIntelligenceModule />}
        {activeTab === 'growth' && <CareerSalaryGrowthNavigator />}
        {activeTab === 'ai_assistant' && <PayScaleAIAssistantModule />}
      </main>

      {/* Ecosystem 12 Platforms Drawer */}
      <PlatformEcosystemSidebar
        isOpen={ecosystemSidebarOpen}
        onClose={() => setEcosystemSidebarOpen(false)}
      />

      {/* Pro Monetization Modal */}
      <PayScaleProModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
      />

      {/* Public Light Footer */}
      <footer className="bg-white border-t border-[#E2E8F0] mt-16 text-xs text-slate-500 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 tracking-wider">TALENTXCEL PAYSCALE</span>
              <span className="text-slate-300">•</span>
              <span>Finance Act FY 2025–26 & FY 2026–27 Verified Engine</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-600">
              <button onClick={() => handleTabChange('calculator')} className="hover:text-[#2563EB]">Calculator</button>
              <button onClick={() => handleTabChange('tax')} className="hover:text-[#2563EB]">Tax Regime</button>
              <button onClick={() => handleTabChange('benchmark')} className="hover:text-[#2563EB]">Benchmarks</button>
              <button onClick={() => handleTabChange('bands')} className="hover:text-[#2563EB]">Grade Bands</button>
              <button onClick={() => setIsProModalOpen(true)} className="text-[#2563EB] font-bold">Pricing</button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <div>
              © 2026 TalentXcel Technologies India Pvt Ltd. All salary benchmarks and tax computations are illustrative and statutory compliant.
            </div>
            <div className="flex items-center gap-3">
              <a 
                href={typeof window !== 'undefined' && window.location.hostname.includes('localhost') ? 'http://jobs.localhost:8080' : 'https://jobs.talentxcel.in'} 
                className="hover:text-slate-700 transition-colors"
              >
                Jobs Portal
              </a>
              <span>•</span>
              <a 
                href={typeof window !== 'undefined' && window.location.hostname.includes('localhost') ? 'http://careers.localhost:8080' : 'https://careers.talentxcel.in'} 
                className="hover:text-slate-700 transition-colors"
              >
                Career Pathfinder
              </a>
              <span>•</span>
              <a 
                href="https://learning.talentxcel.in" 
                className="hover:text-slate-700 transition-colors"
              >
                SkillPods LMS
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PayScaleProduct;
