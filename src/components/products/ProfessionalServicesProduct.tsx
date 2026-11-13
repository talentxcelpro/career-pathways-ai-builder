// src/components/products/ProfessionalServicesProduct.tsx
// Independent Standalone Product for services.talentxcel.in (Professional ServicesOS)
// Master Light SaaS Design System (#FFFFFF, #F4F7FC, #2563EB, #7138E8, #111827, #E2E8F0)

import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Briefcase, 
  Search, 
  Star, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Copy, 
  Printer, 
  Filter,
  DollarSign,
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

interface ProfessionalExpert {
  id: string;
  name: string;
  title: string;
  vertical: 'CA' | 'Legal' | 'CFO' | 'HR';
  regNumber: string;
  location: string;
  experienceYrs: number;
  hourlyRate: string;
  rating: number;
  completedEngagements: number;
  skills: string[];
}

const EXPERTS_DATABASE: ProfessionalExpert[] = [
  { id: 'exp1', name: 'CA Rohan Singhania, FCA', title: 'Senior Tax & Statutory Audit Partner', vertical: 'CA', regNumber: 'ICAI M.No: 512891', location: 'New Delhi / Gurugram', experienceYrs: 14, hourlyRate: '₹3,500 / hr', rating: 4.9, completedEngagements: 148, skills: ['Tax Audit 44AB', 'Transfer Pricing', 'GSTR-9C', 'Corporate Tax'] },
  { id: 'exp2', name: 'Adv. Meenakshi Sundaram', title: 'Commercial & M&A Legal Counsel', vertical: 'Legal', regNumber: 'Bar Council: D/1920/2012', location: 'Bengaluru / Remote', experienceYrs: 12, hourlyRate: '₹4,500 / hr', rating: 5.0, completedEngagements: 94, skills: ['Contract Negotiation', 'Arbitration', 'BNS/BNSS Compliance', 'Term Sheets'] },
  { id: 'exp3', name: 'Vikramaditya Rao, CFA', title: 'Fractional CFO & FP&A Strategist', vertical: 'CFO', regNumber: 'CFA Institute: 894012', location: 'Mumbai / Pune', experienceYrs: 16, hourlyRate: '₹6,000 / hr', rating: 4.8, completedEngagements: 62, skills: ['Cash Flow Modeling', 'Series A/B Diligence', 'ERP Migration', 'Board Packs'] },
  { id: 'exp4', name: 'CA Priya Balasubramanian', title: 'GST Specialist & Litigator', vertical: 'CA', regNumber: 'ICAI M.No: 489102', location: 'Chennai / Hyderabad', experienceYrs: 9, hourlyRate: '₹3,000 / hr', rating: 4.9, completedEngagements: 112, skills: ['GST Litigation', 'Input Tax Credit Audit', 'Customs HSN', 'SEZ Filings'] },
  { id: 'exp5', name: 'Siddharth Sen', title: 'Headhunter & HR Governance Partner', vertical: 'HR', regNumber: 'SHRM-SCP: 710291', location: 'Noida / Delhi-NCR', experienceYrs: 11, hourlyRate: '₹2,500 / hr', rating: 4.7, completedEngagements: 85, skills: ['Executive Hiring', 'POSH Compliance', 'ESOP Structures', 'Org Design'] },
];

export const ProfessionalServicesProduct: React.FC = () => {
  const [selectedVertical, setSelectedVertical] = useState<'All' | 'CA' | 'Legal' | 'CFO' | 'HR'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Booking State
  const [selectedExpert, setSelectedExpert] = useState<ProfessionalExpert | null>(EXPERTS_DATABASE[0]);
  const [bookingDate, setBookingDate] = useState('2026-11-20');
  const [bookingTime, setBookingTime] = useState('11:00 AM');
  const [bookingNotes, setBookingNotes] = useState('Review draft vendor contract and advise on GST liability.');
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

  // SOW Builder State
  const [sowClient, setSowClient] = useState('Paramount Tech Solutions Pvt Ltd');
  const [sowProject, setSowProject] = useState('Statutory Tax Audit & FY 2026-27 GST Review');
  const [sowTimeline, setSowTimeline] = useState('4 Weeks (Ending 15 Dec 2026)');
  const [sowFee, setSowFee] = useState('₹85,000 + GST');
  const [sowDeliverables, setSowDeliverables] = useState('1. Form 3CA/3CD Tax Audit Filing\n2. GSTR-9/9C Reconciliation\n3. Input Tax Credit (ITC) Ledger Verification\n4. Executive Summary Report to Management');

  // Filter experts
  const filteredExperts = useMemo(() => {
    let list = EXPERTS_DATABASE;
    if (selectedVertical !== 'All') {
      list = list.filter(e => e.vertical === selectedVertical);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(e => 
        e.name.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.skills.some(s => s.toLowerCase().includes(q))
      );
    }
    return list;
  }, [selectedVertical, searchQuery]);

  const handleBookSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpert) return;
    const bookingRef = `TXC-${Date.now().toString().slice(-6)}`;
    setConfirmedBookingId(bookingRef);
    toast.success(`Consultation confirmed with ${selectedExpert.name}! Reference: ${bookingRef}`);
  };

  const handleCopySow = () => {
    const fullSow = `SCOPE OF WORK (SOW) ENGAGEMENT PROPOSAL

CLIENT: ${sowClient}
PROJECT TITLE: ${sowProject}
ENGAGEMENT TIMELINE: ${sowTimeline}
PROFESSIONAL FEE: ${sowFee}

SCOPE & KEY DELIVERABLES:
${sowDeliverables}

PAYMENT TERMS:
- 50% Advance upon execution of engagement agreement.
- 50% upon delivery of final report and statutory acknowledgments.

Issued via TalentXcel Professional ServicesOS
Official Verification Platform: https://services.talentxcel.in`;

    navigator.clipboard.writeText(fullSow);
    toast.success('Scope of Work proposal copied to clipboard');
  };

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-[#111827] flex flex-col font-sans selection:bg-[#2563EB] selection:text-white">
      <Helmet>
        <title>Professional ServicesOS by TalentXcel — Verified CA, Legal & Executive Advisory Network</title>
        <meta name="description" content="Discover and book verified Chartered Accountants, Legal Counsels, Fractional CFOs, and HR Advisers. Transparent hourly rates, instant consultation booking, and automated SOW proposal builder." />
        <link rel="canonical" href="https://services.talentxcel.in/" />
      </Helmet>

      {/* Global Product Header */}
      <ProductHeader 
        productName="ServicesOS" 
        activeNav="services"
        badgeLabel="100% ICAI & Bar Council Verified"
        topBannerText="Verified Chartered Accountants • Corporate Counsels • Fractional CFOs"
        primaryActionLabel="Find an Expert"
        primaryActionTo="/services"
      />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white via-white to-[#F4F7FC] border-b border-[#E2E8F0] px-4 pt-10 pb-12">
          <div className="max-w-5xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Verified Multi-Industry Professional Advisory Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-[#111827] tracking-tight leading-tight">
              Verified CA, Legal & <span className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] bg-clip-text text-transparent">Executive Advisory</span>
            </h1>

            <p className="text-[#64748B] text-sm sm:text-base max-w-2xl mx-auto">
              Work with vetted Chartered Accountants, Legal Counsels, and Fractional CFOs. Transparent consultation benchmarks, direct calendar scheduling, and airtight Scope of Work proposals.
            </p>
          </div>
        </section>

        {/* Operating Tabs */}
        <section className="px-4 max-w-5xl mx-auto py-10">
          <Tabs defaultValue="directory" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="bg-white border border-[#E2E8F0] p-1.5 rounded-2xl shadow-xs flex flex-wrap justify-center gap-1 h-auto">
                <TabsTrigger 
                  value="directory" 
                  className="text-xs font-bold px-4 py-2 rounded-xl text-[#64748B] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2563EB] data-[state=active]:to-[#7138E8] data-[state=active]:text-white transition-all flex items-center gap-2"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Verified Experts</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="booking" 
                  className="text-xs font-bold px-4 py-2 rounded-xl text-[#64748B] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2563EB] data-[state=active]:to-[#7138E8] data-[state=active]:text-white transition-all flex items-center gap-2"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Consultation</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="sow" 
                  className="text-xs font-bold px-4 py-2 rounded-xl text-[#64748B] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2563EB] data-[state=active]:to-[#7138E8] data-[state=active]:text-white transition-all flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>SOW Proposal Builder</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="benchmarks" 
                  className="text-xs font-bold px-4 py-2 rounded-xl text-[#64748B] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2563EB] data-[state=active]:to-[#7138E8] data-[state=active]:text-white transition-all flex items-center gap-2"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Fee Benchmarks</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: EXPERTS DIRECTORY */}
            <TabsContent value="directory" className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs">
                <div className="flex-1 min-w-[240px] flex items-center gap-2 bg-[#F4F7FC] px-3 py-1.5 rounded-xl border border-[#E2E8F0]">
                  <Search className="w-4 h-4 text-[#64748B]" />
                  <Input 
                    type="text" 
                    placeholder="Search by name, specialty, skill (e.g. GST, Transfer Pricing, M&A, POSH)..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 bg-transparent text-xs p-0 text-[#111827] focus-visible:ring-0"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(['All', 'CA', 'Legal', 'CFO', 'HR'] as const).map(v => (
                    <button
                      key={v}
                      onClick={() => setSelectedVertical(v)}
                      className={`text-xs px-3 py-1 rounded-lg font-semibold transition-colors ${
                        selectedVertical === v 
                          ? 'bg-[#2563EB] text-white' 
                          : 'bg-[#F4F7FC] text-[#64748B] hover:text-[#111827] border border-[#E2E8F0]'
                      }`}
                    >
                      {v === 'All' ? 'All Verticals' : v === 'CA' ? 'Chartered Accountants' : v === 'Legal' ? 'Legal Counsels' : v === 'CFO' ? 'Fractional CFOs' : 'HR Advisers'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredExperts.map(expert => (
                  <Card key={expert.id} className="bg-white border-[#E2E8F0] rounded-2xl shadow-xs p-5 hover:border-[#2563EB]/40 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-bold text-[#111827]">{expert.name}</h4>
                            <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                          </div>
                          <span className="text-xs text-[#64748B] block mt-0.5">{expert.title}</span>
                          <span className="text-[10px] font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-1 border border-emerald-100">
                            {expert.regNumber}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs font-bold text-[#2563EB] bg-blue-50 border-blue-200">
                          {expert.hourlyRate}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B] my-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                          {expert.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
                          {expert.experienceYrs} yrs experience
                        </span>
                        <span className="flex items-center gap-1 text-amber-600 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {expert.rating} ({expert.completedEngagements} briefs)
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {expert.skills.map(s => (
                          <span key={s} className="text-[10px] font-medium bg-[#F4F7FC] text-[#64748B] px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Button 
                      onClick={() => {
                        setSelectedExpert(expert);
                        toast.success(`Selected ${expert.name} for booking consultation`);
                      }}
                      className="w-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-bold py-2 rounded-xl"
                    >
                      Book 1-on-1 Consultation
                    </Button>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* TAB 2: CONSULTATION SCHEDULER */}
            <TabsContent value="booking" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white border-[#E2E8F0] rounded-2xl shadow-xs p-6 space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-[#111827]">Schedule Advisory Consultation</h3>
                    <p className="text-xs text-[#64748B]">Book video or in-person advisory with verified practitioner.</p>
                  </div>

                  <form onSubmit={handleBookSession} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-[#111827] block mb-1">Selected Expert</label>
                      <select
                        value={selectedExpert?.id || ''}
                        onChange={(e) => {
                          const exp = EXPERTS_DATABASE.find(x => x.id === e.target.value);
                          if (exp) setSelectedExpert(exp);
                        }}
                        className="w-full bg-[#F4F7FC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#111827]"
                      >
                        {EXPERTS_DATABASE.map(exp => (
                          <option key={exp.id} value={exp.id}>
                            {exp.name} ({exp.title} — {exp.hourlyRate})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-[#111827] block mb-1">Preferred Date</label>
                        <Input
                          type="date"
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="bg-[#F4F7FC] border-[#E2E8F0] text-xs font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-[#111827] block mb-1">Time Slot</label>
                        <select
                          value={bookingTime}
                          onChange={(e) => setBookingTime(e.target.value)}
                          className="w-full bg-[#F4F7FC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-medium text-[#111827]"
                        >
                          <option value="10:00 AM">10:00 AM IST</option>
                          <option value="11:00 AM">11:00 AM IST</option>
                          <option value="02:30 PM">02:30 PM IST</option>
                          <option value="04:00 PM">04:00 PM IST</option>
                          <option value="06:00 PM">06:00 PM IST</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#111827] block mb-1">Scope of Inquiry / Client Brief</label>
                      <textarea
                        rows={3}
                        value={bookingNotes}
                        onChange={(e) => setBookingNotes(e.target.value)}
                        className="w-full bg-[#F4F7FC] border border-[#E2E8F0] rounded-xl p-3 text-xs text-[#111827] focus:outline-hidden"
                        placeholder="Describe your tax, legal or finance query..."
                      />
                    </div>

                    <Button type="submit" className="w-full bg-gradient-to-r from-[#2563EB] to-[#7138E8] text-white font-bold text-xs py-3 rounded-xl shadow-xs">
                      Confirm Consultation Booking
                    </Button>
                  </form>
                </Card>

                {/* Booking Status Card */}
                <Card className="bg-white border-[#E2E8F0] rounded-2xl shadow-xs p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#111827] mb-1">Booking Overview</h3>
                    <p className="text-xs text-[#64748B] mb-5">Zero booking fees. Transparent direct billing.</p>

                    {confirmedBookingId ? (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                        <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <span>Consultation Confirmed</span>
                        </div>
                        <p className="text-xs text-emerald-900">
                          Your appointment with <strong>{selectedExpert?.name}</strong> has been secured.
                        </p>
                        <div className="text-xs space-y-1 text-emerald-800 font-medium">
                          <div>Reference Code: <strong className="font-mono">{confirmedBookingId}</strong></div>
                          <div>Scheduled Time: <strong>{bookingDate} at {bookingTime}</strong></div>
                          <div>Hourly Benchmark: <strong>{selectedExpert?.hourlyRate}</strong></div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-[#F4F7FC] border border-[#E2E8F0] rounded-xl space-y-3 text-xs text-[#64748B]">
                        <p>Select your expert on the left and submit the booking request to receive your verified engagement pass.</p>
                        <div className="space-y-1.5 text-[11px] text-[#111827]">
                          <div>• Direct calendar sync with Google Calendar & Microsoft Teams</div>
                          <div>• Confidential encrypted consultation link</div>
                          <div>• Verified credential guarantee under TalentXcel Trust Mark</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-[#64748B] border-t border-[#E2E8F0] pt-4 mt-6">
                    Professional fees are settled directly or held securely in escrow based on client contract terms.
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 3: SOW BUILDER */}
            <TabsContent value="sow" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border-[#E2E8F0] rounded-2xl shadow-xs p-5 md:col-span-1 space-y-3">
                  <h3 className="text-sm font-bold text-[#111827]">SOW Parameters</h3>
                  <div>
                    <label className="text-xs font-semibold text-[#111827] block mb-1">Client Entity Name</label>
                    <Input
                      type="text"
                      value={sowClient}
                      onChange={(e) => setSowClient(e.target.value)}
                      className="bg-[#F4F7FC] border-[#E2E8F0] text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#111827] block mb-1">Project Scope Title</label>
                    <Input
                      type="text"
                      value={sowProject}
                      onChange={(e) => setSowProject(e.target.value)}
                      className="bg-[#F4F7FC] border-[#E2E8F0] text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#111827] block mb-1">Estimated Timeline</label>
                    <Input
                      type="text"
                      value={sowTimeline}
                      onChange={(e) => setSowTimeline(e.target.value)}
                      className="bg-[#F4F7FC] border-[#E2E8F0] text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#111827] block mb-1">Agreed Professional Fee</label>
                    <Input
                      type="text"
                      value={sowFee}
                      onChange={(e) => setSowFee(e.target.value)}
                      className="bg-[#F4F7FC] border-[#E2E8F0] text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#111827] block mb-1">Deliverables Breakdown</label>
                    <textarea
                      rows={4}
                      value={sowDeliverables}
                      onChange={(e) => setSowDeliverables(e.target.value)}
                      className="w-full bg-[#F4F7FC] border border-[#E2E8F0] rounded-xl p-2.5 text-xs text-[#111827] font-medium"
                    />
                  </div>
                </Card>

                <Card className="bg-white border-[#E2E8F0] rounded-2xl shadow-xs p-5 md:col-span-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-[#111827]">Generated Scope of Work Proposal</h3>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleCopySow} className="text-xs border-[#E2E8F0] text-[#111827] flex items-center gap-1.5">
                        <Copy className="w-3.5 h-3.5 text-[#2563EB]" />
                        <span>Copy Proposal</span>
                      </Button>
                      <Button size="sm" onClick={() => window.print()} className="text-xs bg-[#2563EB] text-white flex items-center gap-1.5">
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print SOW</span>
                      </Button>
                    </div>
                  </div>

                  <div className="p-5 bg-[#F4F7FC] rounded-xl border border-[#E2E8F0] space-y-4 text-xs">
                    <div className="border-b border-[#E2E8F0] pb-3">
                      <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider block">Scope of Work (SOW) Agreement</span>
                      <h2 className="text-base font-bold text-[#111827] mt-0.5">{sowProject}</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>Client: <strong className="text-[#111827]">{sowClient}</strong></div>
                      <div>Timeline: <strong className="text-[#111827]">{sowTimeline}</strong></div>
                      <div>Total Fee: <strong className="text-[#111827]">{sowFee}</strong></div>
                      <div>Standard Terms: <strong className="text-[#111827]">50% Advance / 50% on Completion</strong></div>
                    </div>

                    <div>
                      <span className="font-bold text-[#111827] block mb-1">Key Deliverables & Responsibilities:</span>
                      <pre className="font-sans text-[#64748B] whitespace-pre-wrap leading-relaxed">
                        {sowDeliverables}
                      </pre>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 4: FEE BENCHMARKS */}
            <TabsContent value="benchmarks" className="space-y-6">
              <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
                <div className="p-4 bg-[#F4F7FC] border-b border-[#E2E8F0]">
                  <h3 className="text-sm font-bold text-[#111827]">India Professional Advisory Fee Benchmarks (FY 2026-27)</h3>
                  <p className="text-xs text-[#64748B]">Aggregated from verified marketplace contracts across tier-1 and tier-2 Indian cities.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[#64748B] uppercase font-bold tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Professional Domain</th>
                        <th className="py-3 px-4">Average Hourly Rate</th>
                        <th className="py-3 px-4">Standard Monthly Retainer</th>
                        <th className="py-3 px-4">Typical Project Scope</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] text-[#111827]">
                      <tr className="hover:bg-blue-50/40">
                        <td className="py-3 px-4 font-bold text-[#2563EB]">Chartered Accountant (Tax & Audit)</td>
                        <td className="py-3 px-4">₹2,500 – ₹5,000 / hr</td>
                        <td className="py-3 px-4">₹25,000 – ₹75,000 / mo</td>
                        <td className="py-3 px-4 text-[#64748B]">Tax Audit 44AB, GST Reconciliation, ITR-6 Corporate</td>
                      </tr>
                      <tr className="hover:bg-blue-50/40">
                        <td className="py-3 px-4 font-bold text-[#2563EB]">Commercial Legal Counsel</td>
                        <td className="py-3 px-4">₹3,500 – ₹8,000 / hr</td>
                        <td className="py-3 px-4">₹40,000 – ₹1,20,000 / mo</td>
                        <td className="py-3 px-4 text-[#64748B]">Contracts, Term Sheets, Injunctions, Sec 138 NI Notices</td>
                      </tr>
                      <tr className="hover:bg-blue-50/40">
                        <td className="py-3 px-4 font-bold text-[#2563EB]">Fractional CFO</td>
                        <td className="py-3 px-4">₹5,000 – ₹12,000 / hr</td>
                        <td className="py-3 px-4">₹75,000 – ₹2,50,000 / mo</td>
                        <td className="py-3 px-4 text-[#64748B]">Financial Modeling, Due Diligence, Board Governance</td>
                      </tr>
                      <tr className="hover:bg-blue-50/40">
                        <td className="py-3 px-4 font-bold text-[#2563EB]">HR Advisory & Leadership Staffing</td>
                        <td className="py-3 px-4">₹2,000 – ₹4,000 / hr</td>
                        <td className="py-3 px-4">₹30,000 – ₹60,000 / mo</td>
                        <td className="py-3 px-4 text-[#64748B]">POSH Policies, ESOP Design, Executive Retained Search</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <ProductFooter />
    </div>
  );
};
