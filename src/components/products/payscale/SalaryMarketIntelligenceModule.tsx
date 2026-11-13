// src/components/products/payscale/SalaryMarketIntelligenceModule.tsx
// Module 10: Salary Market Intelligence Engine (Industry Salary Trends, City Heatmaps & Emerging Skill Salary Premiums)

import React, { useState } from 'react';
import { 
  TrendingUp, 
  MapPin, 
  Cpu, 
  Sparkles, 
  BarChart3, 
  ShieldCheck, 
  ArrowUpRight,
  Globe,
  Radio,
  Coins,
  Layers
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SKILL_PREMIUMS = [
  { skill: 'Generative AI & LLM Fine-Tuning (LangChain/LlamaIndex)', premium: '+38% Premium', avgHike: '₹14L–₹35L Delta', demand: 'Hyper Growth', category: 'AI & Data' },
  { skill: 'Cloud FinOps & Infrastructure Cost Optimization', premium: '+28% Premium', avgHike: '₹8L–₹22L Delta', demand: 'High Demand', category: 'DevOps & Cloud' },
  { skill: 'Rust & High-Performance Distributed Systems', premium: '+26% Premium', avgHike: '₹10L–₹28L Delta', demand: 'Very High', category: 'Engineering' },
  { skill: 'Kubernetes Platform Engineering & Service Mesh', premium: '+22% Premium', avgHike: '₹6L–₹18L Delta', demand: 'High Demand', category: 'DevOps & Cloud' },
  { skill: 'Cybersecurity, Zero-Trust & SOC 2 Audits', premium: '+24% Premium', avgHike: '₹8L–₹20L Delta', demand: 'High Demand', category: 'Security' },
  { skill: 'Next.js 15 Server Components & React Full-Stack', premium: '+20% Premium', avgHike: '₹5L–₹15L Delta', demand: 'Consistent Demand', category: 'Frontend' }
];

const CITY_HEATMAP = [
  { city: 'Bengaluru', avgTechSalaryLpa: 19.8, cagrGrowth: '11.4%', livingCostIndex: 'High', hiringOpenings: '12,400+' },
  { city: 'Gurugram / Noida (NCR)', avgTechSalaryLpa: 18.2, cagrGrowth: '10.8%', livingCostIndex: 'Moderate-High', hiringOpenings: '9,800+' },
  { city: 'Hyderabad', avgTechSalaryLpa: 17.5, cagrGrowth: '12.2%', livingCostIndex: 'Moderate', hiringOpenings: '8,200+' },
  { city: 'Mumbai / Pune', avgTechSalaryLpa: 17.0, cagrGrowth: '9.6%', livingCostIndex: 'High', hiringOpenings: '7,400+' },
  { city: 'Chennai', avgTechSalaryLpa: 15.6, cagrGrowth: '9.2%', livingCostIndex: 'Moderate', hiringOpenings: '5,100+' },
  { city: 'Tier-2 Hubs (Ahmedabad, Kochi, Indore)', avgTechSalaryLpa: 11.2, cagrGrowth: '14.5%', livingCostIndex: 'Low', hiringOpenings: '3,800+' }
];

export const SalaryMarketIntelligenceModule: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-400/20 border border-purple-400/30 text-purple-200 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>Market Intelligence Radar • 2026 Salary Trends & Skill Premiums</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Track Salary Movement, Tech Premiums & Geography Heatmaps
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Real-time macroeconomic compensation data tracking skill premium multipliers, city cost-to-salary ratios, and year-on-year market growth rates.
          </p>
        </div>
      </div>

      {/* Emerging Skill Premiums */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Skill ROI Index</span>
          <h3 className="text-lg font-black text-slate-900">Highest-Paying Technical Skill Premiums in India (2026)</h3>
          <p className="text-xs text-slate-500 mt-0.5">Incremental compensation added to base pay when acquiring these specialized competencies.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SKILL_PREMIUMS.map((sp, i) => (
            <div key={i} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-purple-200 transition-all space-y-3">
              <div className="flex justify-between items-start gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{sp.category}</span>
                <Badge className="bg-purple-50 text-[#7138E8] border border-purple-200 font-black text-xs">
                  {sp.premium}
                </Badge>
              </div>
              <h4 className="text-xs font-black text-slate-900 leading-snug">{sp.skill}</h4>
              <div className="pt-2 border-t border-slate-200/80 flex justify-between text-xs">
                <span className="text-slate-500">Value Add:</span>
                <span className="font-bold text-emerald-600">{sp.avgHike}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* City Compensation Heatmap */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Geographic Heatmap</span>
          <h3 className="text-lg font-black text-slate-900">City-wise Compensation Levels & CAGR Growth</h3>
          <p className="text-xs text-slate-500 mt-0.5">Average salary benchmarks and annual growth rates across major Indian employment hubs.</p>
        </div>

        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 uppercase font-black tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">City / Region</th>
                <th className="p-3.5 text-right">Avg Tech CTC (LPA)</th>
                <th className="p-3.5 text-center">YoY Growth (CAGR)</th>
                <th className="p-3.5 text-center">Cost of Living</th>
                <th className="p-3.5 text-right">Active Tech Openings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {CITY_HEATMAP.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>{item.city}</span>
                  </td>
                  <td className="p-3.5 text-right font-black text-slate-900">₹{item.avgTechSalaryLpa}L</td>
                  <td className="p-3.5 text-center font-bold text-emerald-600">+{item.cagrGrowth}</td>
                  <td className="p-3.5 text-center text-slate-600">{item.livingCostIndex}</td>
                  <td className="p-3.5 text-right font-bold text-[#2563EB]">{item.hiringOpenings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
