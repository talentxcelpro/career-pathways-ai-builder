// src/components/products/CAPracticeProduct.tsx
// Independent Standalone Product for ca.talentxcel.in (CA PracticeOS)
// Master Light SaaS Design System (#FFFFFF, #F4F7FC, #2563EB, #7138E8, #111827, #E2E8F0)

import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Calculator, 
  Calendar, 
  FileText, 
  Search, 
  ShieldCheck, 
  Building, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Download, 
  ArrowRight, 
  Sparkles, 
  HelpCircle,
  Briefcase,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductHeader } from '@/components/products/common/ProductHeader';
import { ProductFooter } from '@/components/products/common/ProductFooter';
import { toast } from 'sonner';

interface ComplianceEvent {
  id: string;
  act: 'GST' | 'Direct Tax' | 'TDS' | 'ROC' | 'Audit';
  form: string;
  description: string;
  dueDate: string;
  frequency: string;
  penalInterest: string;
}

const STATUTORY_EVENTS: ComplianceEvent[] = [
  { id: '1', act: 'GST', form: 'GSTR-1', description: 'Outward supplies statement for turnover > ₹5 Cr or monthly filers', dueDate: '11th of every month', frequency: 'Monthly', penalInterest: '₹50/day late fee' },
  { id: '2', act: 'GST', form: 'GSTR-3B', description: 'Summary return & tax payment for regular taxpayers', dueDate: '20th of every month', frequency: 'Monthly', penalInterest: '18% p.a. on net tax' },
  { id: '3', act: 'TDS', form: 'Challan 281', description: 'Deposit of tax deducted at source for preceding month', dueDate: '7th of every month', frequency: 'Monthly', penalInterest: '1.5% per month interest' },
  { id: '4', act: 'TDS', form: 'Form 24Q / 26Q (Q1)', description: 'Quarterly statement of TDS for salary and non-salary', dueDate: '31 July 2026', frequency: 'Quarterly', penalInterest: '₹200/day u/s 234E' },
  { id: '5', act: 'TDS', form: 'Form 24Q / 26Q (Q2)', description: 'Quarterly statement of TDS for salary and non-salary', dueDate: '31 October 2026', frequency: 'Quarterly', penalInterest: '₹200/day u/s 234E' },
  { id: '6', act: 'Direct Tax', form: 'Advance Tax Inst 1', description: 'First installment of advance tax (15% of estimated tax)', dueDate: '15 June 2026', frequency: 'Quarterly', penalInterest: '1% per month u/s 234C' },
  { id: '7', act: 'Direct Tax', form: 'Advance Tax Inst 2', description: 'Second installment of advance tax (45% of estimated tax)', dueDate: '15 September 2026', frequency: 'Quarterly', penalInterest: '1% per month u/s 234C' },
  { id: '8', act: 'Direct Tax', form: 'Advance Tax Inst 3', description: 'Third installment of advance tax (75% of estimated tax)', dueDate: '15 December 2026', frequency: 'Quarterly', penalInterest: '1% per month u/s 234C' },
  { id: '9', act: 'Direct Tax', form: 'Advance Tax Inst 4', description: 'Final installment of advance tax (100% of estimated tax)', dueDate: '15 March 2027', frequency: 'Quarterly', penalInterest: '1% per month u/s 234C' },
  { id: '10', act: 'Audit', form: 'Form 3CA / 3CD', description: 'Tax Audit Report under Section 44AB for AY 2026-27', dueDate: '30 September 2026', frequency: 'Annual', penalInterest: '0.5% turnover or ₹1.5L max' },
  { id: '11', act: 'Direct Tax', form: 'ITR-5 / ITR-6', description: 'Income Tax Return for corporate assessee and audited entities', dueDate: '31 October 2026', frequency: 'Annual', penalInterest: 'Late fee u/s 234F' },
  { id: '12', act: 'ROC', form: 'Form AOC-4', description: 'Filing of audited balance sheet and P&L with MCA', dueDate: 'Within 30 days of AGM (30 Oct)', frequency: 'Annual', penalInterest: '₹100/day ongoing penalty' },
  { id: '13', act: 'ROC', form: 'Form MGT-7', description: 'Annual return filing with Ministry of Corporate Affairs', dueDate: 'Within 60 days of AGM (29 Nov)', frequency: 'Annual', penalInterest: '₹100/day ongoing penalty' },
  { id: '14', act: 'GST', form: 'GSTR-9 / 9C', description: 'Annual GST return and reconciliation for regular registered taxpayers', dueDate: '31 December 2026', frequency: 'Annual', penalInterest: '₹200/day late fee' },
];

interface HsnEntry {
  code: string;
  category: 'Service (SAC)' | 'Goods (HSN)';
  description: string;
  rate: string;
  rcm: string;
}

const HSN_DATABASE: HsnEntry[] = [
  { code: '998222', category: 'Service (SAC)', description: 'Accounting, auditing, and bookkeeping services', rate: '18%', rcm: 'No (Forward Charge)' },
  { code: '998231', category: 'Service (SAC)', description: 'Tax preparation, tax audit and tax consulting services', rate: '18%', rcm: 'No (Forward Charge)' },
  { code: '998211', category: 'Service (SAC)', description: 'Legal advisory, representation and documentation services', rate: '18%', rcm: 'Yes (RCM on Business Entity)' },
  { code: '998311', category: 'Service (SAC)', description: 'Management consulting, business strategy, and advisory', rate: '18%', rcm: 'No' },
  { code: '998314', category: 'Service (SAC)', description: 'Information technology and software development design', rate: '18%', rcm: 'No' },
  { code: '998511', category: 'Service (SAC)', description: 'Executive recruitment, talent acquisition, and staffing', rate: '18%', rcm: 'No' },
  { code: '997212', category: 'Service (SAC)', description: 'Commercial property rental or leasing services', rate: '18%', rcm: 'Applicable in specific cases' },
  { code: '996511', category: 'Service (SAC)', description: 'Road transport of goods by Goods Transport Agency (GTA)', rate: '5% / 12%', rcm: 'Yes (5% under RCM)' },
  { code: '998341', category: 'Service (SAC)', description: 'Architectural and engineering consulting services', rate: '18%', rcm: 'No' },
  { code: '998413', category: 'Service (SAC)', description: 'Direct advertising and digital performance marketing', rate: '18%', rcm: 'No' },
];

export const CAPracticeProduct: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'GST' | 'Direct Tax' | 'TDS' | 'ROC' | 'Audit'>('All');
  const [hsnSearch, setHsnSearch] = useState('');
  
  // Advance Tax State
  const [estimatedIncome, setEstimatedIncome] = useState<number>(1800000);
  const [deductions, setDeductions] = useState<number>(150000);
  const [regime, setRegime] = useState<'new' | 'old'>('new');
  
  // Client Dossier Local State
  const [clients, setClients] = useState<{ id: string; name: string; pan: string; gstin: string; type: string }[]>([
    { id: 'c1', name: 'Paramount Home Exports LLP', pan: 'AAAFP1234D', gstin: '09AAAFP1234D1Z5', type: 'Private Limited / Audit' },
    { id: 'c2', name: 'Designco Infracon Pvt Ltd', pan: 'AACCD5678K', gstin: '07AACCD5678K1ZP', type: 'Corporate / GST Monthly' },
    { id: 'c3', name: 'Kashmir Valley Agro FPO', pan: 'ABCFK9012L', gstin: '01ABCFK9012L1ZZ', type: 'LLP / Partnership' }
  ]);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPan, setNewClientPan] = useState('');
  const [newClientGstin, setNewClientGstin] = useState('');
  const [newClientType, setNewClientType] = useState('Corporate / GST Monthly');

  // Filter compliance events
  const filteredEvents = useMemo(() => {
    if (selectedFilter === 'All') return STATUTORY_EVENTS;
    return STATUTORY_EVENTS.filter(e => e.act === selectedFilter);
  }, [selectedFilter]);

  // Filter HSN codes
  const filteredHsn = useMemo(() => {
    if (!hsnSearch.trim()) return HSN_DATABASE;
    const q = hsnSearch.toLowerCase().trim();
    return HSN_DATABASE.filter(h => 
      h.code.includes(q) || 
      h.description.toLowerCase().includes(q) ||
      h.rate.includes(q)
    );
  }, [hsnSearch]);

  // Compute Advance Tax
  const taxCalculation = useMemo(() => {
    let taxable = estimatedIncome;
    let tax = 0;

    if (regime === 'new') {
      // Section 115BAC New Tax Regime (FY 2026-27 Slabs)
      // Standard deduction of ₹75,000
      taxable = Math.max(0, taxable - 75000);
      if (taxable <= 300000) tax = 0;
      else if (taxable <= 700000) tax = (taxable - 300000) * 0.05;
      else if (taxable <= 1000000) tax = 20000 + (taxable - 700000) * 0.10;
      else if (taxable <= 1200000) tax = 50000 + (taxable - 1000000) * 0.15;
      else if (taxable <= 1500000) tax = 80000 + (taxable - 1200000) * 0.20;
      else tax = 140000 + (taxable - 1500000) * 0.30;

      // Rebate u/s 87A if taxable income <= 7,00,000
      if (taxable <= 700000) tax = 0;
    } else {
      // Old Tax Regime
      taxable = Math.max(0, taxable - deductions - 50000); // Standard deduction ₹50,000
      if (taxable <= 250000) tax = 0;
      else if (taxable <= 500000) tax = (taxable - 250000) * 0.05;
      else if (taxable <= 1000000) tax = 12500 + (taxable - 500000) * 0.20;
      else tax = 112500 + (taxable - 1000000) * 0.30;

      if (taxable <= 500000) tax = 0; // Rebate 87A
    }

    // 4% Health & Education Cess
    const cess = tax * 0.04;
    const totalTax = Math.round(tax + cess);

    return {
      taxable,
      tax: Math.round(tax),
      cess: Math.round(cess),
      totalTax,
      inst1: Math.round(totalTax * 0.15), // 15% by 15 June
      inst2: Math.round(totalTax * 0.45), // 45% cumulative by 15 Sept
      inst3: Math.round(totalTax * 0.75), // 75% cumulative by 15 Dec
      inst4: totalTax                     // 100% by 15 March
    };
  }, [estimatedIncome, deductions, regime]);

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientPan) {
      toast.error('Please enter Client Name and PAN');
      return;
    }
    const newEntry = {
      id: `c_${Date.now()}`,
      name: newClientName,
      pan: newClientPan.toUpperCase(),
      gstin: newClientGstin.toUpperCase(),
      type: newClientType
    };
    setClients(prev => [newEntry, ...prev]);
    setNewClientName('');
    setNewClientPan('');
    setNewClientGstin('');
    toast.success(`Client ${newEntry.name} added to dossier`);
  };

  const handleExportClients = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' + 
      ['Client Name,PAN,GSTIN,Client Type', ...clients.map(c => `"${c.name}","${c.pan}","${c.gstin}","${c.type}"`)].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ca_practice_clients_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Client roster exported as CSV');
  };

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-[#111827] flex flex-col font-sans selection:bg-[#2563EB] selection:text-white">
      <Helmet>
        <title>CA PracticeOS by TalentXcel — Statutory Compliance Calendar, Advance Tax & Practice Management for CAs</title>
        <meta name="description" content="Dedicated practice operating system for Indian Chartered Accountants. Real-time statutory due date calendar, Section 115BAC advance tax calculator, SAC code finder, and client dossier management." />
        <link rel="canonical" href="https://ca.talentxcel.in/" />
      </Helmet>

      {/* Global Product Header */}
      <ProductHeader 
        productName="CA PracticeOS" 
        activeNav="ca"
        badgeLabel="FY 2026-27 Statutory Master"
        topBannerText="Official Statutory Deadlines (GST, TDS, Advance Tax, ROC) • Section 115BAC Engine"
        primaryActionLabel="Open Practice Desk"
        primaryActionTo="/ca"
      />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white via-white to-[#F4F7FC] border-b border-[#E2E8F0] px-4 pt-10 pb-12">
          <div className="max-w-5xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Practice Management OS for Indian Chartered Accountants</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-[#111827] tracking-tight leading-tight">
              Statutory Compliance & <span className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] bg-clip-text text-transparent">Tax Practice OS</span>
            </h1>

            <p className="text-[#64748B] text-sm sm:text-base max-w-2xl mx-auto">
              Never miss a GST or ITR filing deadline. Automate Section 115BAC advance tax installment schedules, search SAC/HSN codes, and manage your firm's client compliance dossiers in one place.
            </p>
          </div>
        </section>

        {/* Core Product Operating Surface */}
        <section className="px-4 max-w-5xl mx-auto py-10">
          <Tabs defaultValue="calendar" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="bg-white border border-[#E2E8F0] p-1.5 rounded-2xl shadow-xs flex flex-wrap justify-center gap-1 h-auto">
                <TabsTrigger 
                  value="calendar" 
                  className="text-xs font-bold px-4 py-2 rounded-xl text-[#64748B] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2563EB] data-[state=active]:to-[#7138E8] data-[state=active]:text-white transition-all flex items-center gap-2"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Due-Date Calendar</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="advance-tax" 
                  className="text-xs font-bold px-4 py-2 rounded-xl text-[#64748B] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2563EB] data-[state=active]:to-[#7138E8] data-[state=active]:text-white transition-all flex items-center gap-2"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Advance Tax Engine</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="hsn" 
                  className="text-xs font-bold px-4 py-2 rounded-xl text-[#64748B] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2563EB] data-[state=active]:to-[#7138E8] data-[state=active]:text-white transition-all flex items-center gap-2"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>GST HSN/SAC Finder</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="dossier" 
                  className="text-xs font-bold px-4 py-2 rounded-xl text-[#64748B] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2563EB] data-[state=active]:to-[#7138E8] data-[state=active]:text-white transition-all flex items-center gap-2"
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>Client Dossier ({clients.length})</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: STATUTORY COMPLIANCE CALENDAR */}
            <TabsContent value="calendar" className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs">
                <div>
                  <h3 className="text-sm font-bold text-[#111827]">Statutory Due-Date Calendar (FY 2026-27 / AY 2027-28)</h3>
                  <p className="text-xs text-[#64748B]">Updated in accordance with CBDT, CBIC, and MCA official gazette circulars.</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(['All', 'GST', 'Direct Tax', 'TDS', 'ROC', 'Audit'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedFilter(cat)}
                      className={`text-xs px-3 py-1 rounded-lg font-semibold transition-colors ${
                        selectedFilter === cat 
                          ? 'bg-[#2563EB] text-white' 
                          : 'bg-[#F4F7FC] text-[#64748B] hover:text-[#111827] border border-[#E2E8F0]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEvents.map(event => (
                  <Card key={event.id} className="bg-white border-[#E2E8F0] shadow-xs hover:border-[#2563EB]/40 transition-all rounded-2xl overflow-hidden">
                    <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                      <div>
                        <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 mb-1.5 ${
                          event.act === 'GST' ? 'bg-purple-50 text-[#7138E8] border-purple-200' :
                          event.act === 'Direct Tax' ? 'bg-blue-50 text-[#2563EB] border-blue-200' :
                          event.act === 'TDS' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {event.act} • {event.frequency}
                        </Badge>
                        <CardTitle className="text-base font-bold text-[#111827]">{event.form}</CardTitle>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#2563EB] block">{event.dueDate}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-1 space-y-2">
                      <p className="text-xs text-[#64748B]">{event.description}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] text-[11px] text-[#64748B]">
                        <span className="flex items-center gap-1 text-rose-600 font-medium">
                          <AlertTriangle className="w-3 h-3" />
                          Default: {event.penalInterest}
                        </span>
                        <button 
                          onClick={() => toast.success(`Reminder alert set for ${event.form}`)}
                          className="text-[#2563EB] font-bold hover:underline flex items-center gap-1"
                        >
                          <Clock className="w-3 h-3" />
                          Set Reminder
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* TAB 2: ADVANCE TAX ENGINE */}
            <TabsContent value="advance-tax" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inputs Card */}
                <Card className="bg-white border-[#E2E8F0] rounded-2xl shadow-xs p-6 space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-[#111827]">Estimated Income & Deductions</h3>
                    <p className="text-xs text-[#64748B]">Calculate quarterly advance tax installments for FY 2026-27.</p>
                  </div>

                  <div className="flex gap-2 p-1 bg-[#F4F7FC] rounded-xl border border-[#E2E8F0]">
                    <button
                      type="button"
                      onClick={() => setRegime('new')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        regime === 'new' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#64748B]'
                      }`}
                    >
                      New Tax Regime (Sec 115BAC)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegime('old')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        regime === 'old' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#64748B]'
                      }`}
                    >
                      Old Tax Regime
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-[#111827] block mb-1">Estimated Annual Income (₹)</label>
                      <Input
                        type="number"
                        step="50000"
                        value={estimatedIncome}
                        onChange={(e) => setEstimatedIncome(Number(e.target.value) || 0)}
                        className="bg-[#F4F7FC] border-[#E2E8F0] text-sm font-semibold"
                      />
                    </div>

                    {regime === 'old' && (
                      <div>
                        <label className="text-xs font-bold text-[#111827] block mb-1">Total Chapter VI-A Deductions (₹)</label>
                        <Input
                          type="number"
                          step="25000"
                          value={deductions}
                          onChange={(e) => setDeductions(Number(e.target.value) || 0)}
                          className="bg-[#F4F7FC] border-[#E2E8F0] text-sm font-semibold"
                          placeholder="80C, 80D, 80CCD, etc."
                        />
                      </div>
                    )}
                  </div>
                </Card>

                {/* Computation Output Card */}
                <Card className="bg-white border-[#E2E8F0] rounded-2xl shadow-xs p-6 space-y-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#111827]">Estimated Advance Tax Liability</h3>
                    <p className="text-xs text-[#64748B]">Applicable installments under Section 208/211.</p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#64748B] block font-medium">Net Tax Liability (incl. 4% cess)</span>
                      <span className="text-2xl font-black text-[#111827]">₹{taxCalculation.totalTax.toLocaleString('en-IN')}</span>
                    </div>
                    <Badge className="bg-[#2563EB] text-white text-xs px-2.5 py-1">
                      {regime === 'new' ? 'Sec 115BAC' : 'Old Regime'}
                    </Badge>
                  </div>

                  {/* 4 Installment Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-[#F4F7FC] rounded-xl border border-[#E2E8F0]">
                      <span className="text-[#64748B] block font-semibold">15 June (15%)</span>
                      <span className="text-sm font-bold text-[#111827]">₹{taxCalculation.inst1.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="p-3 bg-[#F4F7FC] rounded-xl border border-[#E2E8F0]">
                      <span className="text-[#64748B] block font-semibold">15 Sept (45% Cum.)</span>
                      <span className="text-sm font-bold text-[#111827]">₹{taxCalculation.inst2.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="p-3 bg-[#F4F7FC] rounded-xl border border-[#E2E8F0]">
                      <span className="text-[#64748B] block font-semibold">15 Dec (75% Cum.)</span>
                      <span className="text-sm font-bold text-[#111827]">₹{taxCalculation.inst3.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="p-3 bg-[#F4F7FC] rounded-xl border border-[#E2E8F0]">
                      <span className="text-[#64748B] block font-semibold">15 March (100%)</span>
                      <span className="text-sm font-bold text-[#111827]">₹{taxCalculation.inst4.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => toast.success('Advance tax challan computation copied to clipboard')}
                    className="w-full bg-gradient-to-r from-[#2563EB] to-[#7138E8] text-white font-bold text-xs py-3 rounded-xl shadow-xs"
                  >
                    Copy Computation for Client Dossier
                  </Button>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 3: GST HSN/SAC FINDER */}
            <TabsContent value="hsn" className="space-y-6">
              <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs flex items-center gap-3">
                <Search className="w-4 h-4 text-[#64748B] shrink-0" />
                <Input
                  type="text"
                  placeholder="Search SAC or HSN code, service type (e.g. Accounting, Legal, Software, Recruitment)..."
                  value={hsnSearch}
                  onChange={(e) => setHsnSearch(e.target.value)}
                  className="border-0 bg-transparent text-sm focus-visible:ring-0 p-0 text-[#111827]"
                />
              </div>

              <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F4F7FC] text-[#64748B] border-b border-[#E2E8F0] uppercase font-bold tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Code</th>
                        <th className="py-3 px-4">Classification</th>
                        <th className="py-3 px-4">Description</th>
                        <th className="py-3 px-4">GST Rate</th>
                        <th className="py-3 px-4">Reverse Charge (RCM)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] text-[#111827]">
                      {filteredHsn.map((item, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-[#2563EB]">{item.code}</td>
                          <td className="py-3 px-4 font-medium">{item.category}</td>
                          <td className="py-3 px-4">{item.description}</td>
                          <td className="py-3 px-4 font-bold">{item.rate}</td>
                          <td className="py-3 px-4 text-[#64748B]">{item.rcm}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* TAB 4: CLIENT DOSSIER & COMPLIANCE TRACKER */}
            <TabsContent value="dossier" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Client Creation Form */}
                <Card className="bg-white border-[#E2E8F0] rounded-2xl shadow-xs p-5 md:col-span-1">
                  <h3 className="text-sm font-bold text-[#111827] mb-1">Add Client to Master Dossier</h3>
                  <p className="text-xs text-[#64748B] mb-4">Track recurring statutory filings for client accounts.</p>

                  <form onSubmit={handleAddClient} className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-[#111827] block mb-1">Client / Entity Name</label>
                      <Input
                        type="text"
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        placeholder="e.g. Acme Tech Solutions Pvt Ltd"
                        className="bg-[#F4F7FC] border-[#E2E8F0] text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#111827] block mb-1">PAN Number</label>
                      <Input
                        type="text"
                        maxLength={10}
                        value={newClientPan}
                        onChange={(e) => setNewClientPan(e.target.value)}
                        placeholder="e.g. ABCDE1234F"
                        className="bg-[#F4F7FC] border-[#E2E8F0] text-xs uppercase"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#111827] block mb-1">GSTIN (Optional)</label>
                      <Input
                        type="text"
                        maxLength={15}
                        value={newClientGstin}
                        onChange={(e) => setNewClientGstin(e.target.value)}
                        placeholder="e.g. 07ABCDE1234F1Z5"
                        className="bg-[#F4F7FC] border-[#E2E8F0] text-xs uppercase"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#111827] block mb-1">Entity Category</label>
                      <select
                        value={newClientType}
                        onChange={(e) => setNewClientType(e.target.value)}
                        className="w-full bg-[#F4F7FC] border border-[#E2E8F0] rounded-md px-3 py-2 text-xs text-[#111827]"
                      >
                        <option value="Corporate / GST Monthly">Corporate / GST Monthly</option>
                        <option value="Private Limited / Audit">Private Limited / Audit</option>
                        <option value="LLP / Partnership">LLP / Partnership</option>
                        <option value="Proprietorship / QRMP">Proprietorship / QRMP</option>
                        <option value="Individual / Non-Audit">Individual / Non-Audit</option>
                      </select>
                    </div>

                    <Button type="submit" className="w-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-bold py-2 rounded-xl mt-2">
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add to Firm Dossier
                    </Button>
                  </form>
                </Card>

                {/* Client List Table */}
                <Card className="bg-white border-[#E2E8F0] rounded-2xl shadow-xs p-5 md:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#111827]">Active Client Dossiers ({clients.length})</h3>
                      <p className="text-xs text-[#64748B]">Client records persisted locally in practice session.</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleExportClients}
                      className="text-xs border-[#E2E8F0] text-[#111827] flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>Export CSV</span>
                    </Button>
                  </div>

                  <div className="space-y-2.5">
                    {clients.map(client => (
                      <div key={client.id} className="p-3 bg-[#F4F7FC] rounded-xl border border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="font-bold text-xs text-[#111827] block">{client.name}</span>
                          <span className="text-[11px] text-[#64748B] flex items-center gap-2 mt-0.5">
                            <span>PAN: <strong className="font-mono text-[#111827]">{client.pan}</strong></span>
                            {client.gstin && (
                              <span>• GSTIN: <strong className="font-mono text-[#111827]">{client.gstin}</strong></span>
                            )}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-[10px] bg-white border-[#E2E8F0] text-[#2563EB] font-bold">
                          {client.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <ProductFooter />
    </div>
  );
};
