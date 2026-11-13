// src/components/products/LegalPracticeProduct.tsx
// Independent Standalone Product for legal.talentxcel.in (Legal PracticeOS)
// Master Light SaaS Design System (#FFFFFF, #F4F7FC, #2563EB, #7138E8, #111827, #E2E8F0)

import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Scale, 
  BookOpen, 
  FileText, 
  Search, 
  ShieldCheck, 
  Plus, 
  Calendar, 
  Copy, 
  Printer, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Gavel
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductHeader } from '@/components/products/common/ProductHeader';
import { ProductFooter } from '@/components/products/common/ProductFooter';
import { toast } from 'sonner';

interface BareActSection {
  act: string;
  section: string;
  title: string;
  oldReference?: string;
  punishment: string;
  cognizable: string;
  bailable: string;
}

const BARE_ACTS_DATA: BareActSection[] = [
  { act: 'BNS 2023', section: 'Section 318(4)', title: 'Cheating and dishonestly inducing delivery of property', oldReference: 'IPC Section 420', punishment: 'Imprisonment up to 7 years + fine', cognizable: 'Cognizable', bailable: 'Non-Bailable' },
  { act: 'BNS 2023', section: 'Section 316', title: 'Criminal breach of trust by public servant, banker, or agent', oldReference: 'IPC Section 409', punishment: 'Imprisonment for life or up to 10 years + fine', cognizable: 'Cognizable', bailable: 'Non-Bailable' },
  { act: 'BNS 2023', section: 'Section 103(1)', title: 'Punishment for murder', oldReference: 'IPC Section 302', punishment: 'Death or imprisonment for life + fine', cognizable: 'Cognizable', bailable: 'Non-Bailable' },
  { act: 'BNS 2023', section: 'Section 115(2)', title: 'Voluntarily causing hurt', oldReference: 'IPC Section 323', punishment: 'Imprisonment up to 1 year or fine up to ₹10,000 or both', cognizable: 'Non-Cognizable', bailable: 'Bailable' },
  { act: 'BNS 2023', section: 'Section 351', title: 'Criminal Intimidation', oldReference: 'IPC Section 506', punishment: 'Imprisonment up to 2 years or fine or both', cognizable: 'Non-Cognizable', bailable: 'Bailable' },
  { act: 'BNSS 2023', section: 'Section 480', title: 'When bail may be taken in case of non-bailable offense', oldReference: 'CrPC Section 437', punishment: 'Statutory discretionary release', cognizable: 'N/A', bailable: 'Judicial discretion' },
  { act: 'BNSS 2023', section: 'Section 483', title: 'Special powers of High Court or Court of Session regarding bail', oldReference: 'CrPC Section 439', punishment: 'Statutory discretionary relief', cognizable: 'N/A', bailable: 'Judicial discretion' },
  { act: 'BSA 2023', section: 'Section 61', title: 'Admissibility of electronic records and digital certificates', oldReference: 'Evidence Act Section 65B', punishment: 'Admissibility criteria for digital logs', cognizable: 'N/A', bailable: 'N/A' },
  { act: 'Companies Act', section: 'Section 135', title: 'Corporate Social Responsibility (CSR) statutory obligations', oldReference: 'Companies Act 2013', punishment: 'Fine on company up to ₹1 Cr; officers ₹2 Lakhs', cognizable: 'Compoundable', bailable: 'N/A' },
  { act: 'Arbitration Act', section: 'Section 9', title: 'Interim measures by Court prior or during arbitral proceedings', oldReference: 'Arbitration Act 1996', punishment: 'Injunction / protective interim orders', cognizable: 'N/A', bailable: 'Civil remedy' },
];

export const LegalPracticeProduct: React.FC = () => {
  const [actSearch, setActSearch] = useState('');
  const [selectedActFilter, setSelectedActFilter] = useState<'All' | 'BNS 2023' | 'BNSS 2023' | 'BSA 2023' | 'Commercial'>('All');

  // Drafting State
  const [selectedTemplate, setSelectedTemplate] = useState<'nda' | 'cheque_notice' | 'retainer'>('nda');
  const [draftingData, setDraftingData] = useState({
    partyA: 'Acme Technologies Pvt Ltd',
    partyB: 'Apex Solutions LLP',
    jurisdiction: 'New Delhi',
    amount: '₹5,50,000',
    chequeNo: '489201',
    chequeDate: '2026-10-15',
    bankName: 'HDFC Bank Ltd'
  });

  // Matter Tracker State
  const [matters, setMatters] = useState<{ id: string; title: string; caseNo: string; forum: string; nextDate: string; stage: string }[]>([
    { id: 'm1', title: 'Paramount Exports vs State GST Dept', caseNo: 'WP(C) 1248/2026', forum: 'Delhi High Court', nextDate: '2026-11-28', stage: 'Final Arguments' },
    { id: 'm2', title: 'Designco Ltd vs TechVentures Corp', caseNo: 'ARB 491/2026', forum: 'Sole Arbitrator (NIRC)', nextDate: '2026-12-05', stage: 'Evidence of Claimant' },
    { id: 'm3', title: 'Sharma vs Apex Logistics Pvt Ltd', caseNo: 'CC 8821/2026', forum: 'Metropolitan Magistrate Court', nextDate: '2026-12-14', stage: 'Section 138 Summons' }
  ]);
  const [newMatterTitle, setNewMatterTitle] = useState('');
  const [newMatterCaseNo, setNewMatterCaseNo] = useState('');
  const [newMatterForum, setNewMatterForum] = useState('Delhi High Court');
  const [newMatterDate, setNewMatterDate] = useState('2026-12-20');
  const [newMatterStage, setNewMatterStage] = useState('Notice & Response');

  // Filter Bare Acts
  const filteredActs = useMemo(() => {
    let list = BARE_ACTS_DATA;
    if (selectedActFilter !== 'All') {
      if (selectedActFilter === 'Commercial') {
        list = list.filter(a => a.act === 'Companies Act' || a.act === 'Arbitration Act');
      } else {
        list = list.filter(a => a.act === selectedActFilter);
      }
    }
    if (actSearch.trim()) {
      const q = actSearch.toLowerCase().trim();
      list = list.filter(a => 
        a.section.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        (a.oldReference && a.oldReference.toLowerCase().includes(q))
      );
    }
    return list;
  }, [actSearch, selectedActFilter]);

  const generatedDraftText = useMemo(() => {
    if (selectedTemplate === 'nda') {
      return `MUTUAL NON-DISCLOSURE AGREEMENT

THIS AGREEMENT is entered into on this 12th day of November, 2026, by and between:
1. ${draftingData.partyA}, having its principal place of business at ${draftingData.jurisdiction} (hereinafter referred to as "Disclosing Party"); AND
2. ${draftingData.partyB}, having its principal place of business at ${draftingData.jurisdiction} (hereinafter referred to as "Receiving Party").

WHEREAS, the Parties wish to explore potential business collaboration and in connection therewith will exchange confidential, proprietary, and commercial information.

NOW, THEREFORE, THE PARTIES AGREE AS FOLLOWS:
1. Confidential Information: Includes all technical, financial, customer, source code, and commercial secrets disclosed in writing or electronically.
2. Non-Disclosure Obligations: The Receiving Party agrees to preserve confidentiality with at least reasonable care and shall not disclose such information to any third party without prior written consent.
3. Term: This Agreement shall remain in force for a period of two (2) years from the date hereof.
4. Governing Law & Dispute Resolution: This Agreement shall be governed by the laws of India, subject to the exclusive jurisdiction of the Courts at ${draftingData.jurisdiction}.

IN WITNESS WHEREOF, the Parties have executed this Mutual Non-Disclosure Agreement on the date first written above.

For ${draftingData.partyA}: ____________________
For ${draftingData.partyB}: ____________________`;
    }

    if (selectedTemplate === 'cheque_notice') {
      return `STATUTORY LEGAL DEMAND NOTICE
(Under Section 138 of the Negotiable Instruments Act, 1881)

REGISTERED POST WITH A.D. / SPEED POST
Date: 12th November, 2026

To:
${draftingData.partyB}
Resident / Having Office at: ${draftingData.jurisdiction}

Subject: Statutory Demand Notice under Section 138 read with Section 141 of the Negotiable Instruments Act, 1881 for dishonour of Cheque No. ${draftingData.chequeNo}.

Dear Sir / Madam,

Under instructions from and on behalf of my client, ${draftingData.partyA}, having office at ${draftingData.jurisdiction}, I hereby serve upon you this Statutory Legal Demand Notice:

1. That in discharge of your legally enforceable debt and commercial liability, you issued Cheque bearing No. ${draftingData.chequeNo} dated ${draftingData.chequeDate} drawn on ${draftingData.bankName} for a sum of ${draftingData.amount}.
2. That my client presented the said cheque for encashment, but the same was returned unpaid by the bank with the memo endorsed "Funds Insufficient / Exceeds Arrangement".
3. That by way of this notice, my client hereby calls upon you to make the full payment of ${draftingData.amount} within fifteen (15) days from the receipt of this statutory notice.
4. Take notice that in case of failure to remit the amount within the statutory period of 15 days, my client will be constrained to initiate criminal proceedings against you under Section 138 of the Negotiable Instruments Act, 1881 at your sole risk and costs.

Advocate for the Complainant
Bar Council Registration: D/XXXX/2026`;
    }

    return `LEGAL RETAINER & ENGAGEMENT AGREEMENT

This Agreement is made on 12th November 2026 between ${draftingData.partyA} ("Client") and Advocate Chamber of ${draftingData.partyB} ("Legal Counsel").

1. Scope of Retainer: Counsel shall advise Client on routine corporate contracts, statutory notices, regulatory compliance, and review commercial documents.
2. Professional Retainer Fee: Client shall pay an agreed monthly retainer fee payable on or before the 5th of each calendar month.
3. Jurisdiction: Courts at ${draftingData.jurisdiction} shall have exclusive jurisdiction over any disputes arising out of this retainer agreement.`;
  }, [selectedTemplate, draftingData]);

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(generatedDraftText);
    toast.success('Legal draft copied to clipboard');
  };

  const handleAddMatter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatterTitle || !newMatterCaseNo) {
      toast.error('Please enter Case Title and Case Number');
      return;
    }
    const newEntry = {
      id: `m_${Date.now()}`,
      title: newMatterTitle,
      caseNo: newMatterCaseNo,
      forum: newMatterForum,
      nextDate: newMatterDate,
      stage: newMatterStage
    };
    setMatters(prev => [newEntry, ...prev]);
    setNewMatterTitle('');
    setNewMatterCaseNo('');
    toast.success(`Matter ${newEntry.caseNo} added to court diary`);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-[#111827] flex flex-col font-sans selection:bg-[#2563EB] selection:text-white">
      <Helmet>
        <title>Legal PracticeOS by TalentXcel — Indian Bare Acts, Legal Drafting & Matter Management</title>
        <meta name="description" content="Dedicated legal operating system for Indian advocates and corporate counsels. Search Bharatiya Nyaya Sanhita (BNS), BNSS, BSA, draft NDAs & Section 138 notices, and track court hearings." />
        <link rel="canonical" href="https://legal.talentxcel.in/" />
      </Helmet>

      {/* Global Product Header */}
      <ProductHeader 
        productName="Legal PracticeOS" 
        activeNav="legal"
        badgeLabel="New Criminal Laws (BNS/BNSS/BSA) 2026"
        topBannerText="Indian Bare Acts Navigator • Automated Legal Drafter • Court Matter Diary"
        primaryActionLabel="Open Chamber Desk"
        primaryActionTo="/legal"
      />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white via-white to-[#F4F7FC] border-b border-[#E2E8F0] px-4 pt-10 pb-12">
          <div className="max-w-5xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Practice Operating System for Indian Advocates & Law Firms</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-[#111827] tracking-tight leading-tight">
              Indian Bare Acts & <span className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] bg-clip-text text-transparent">Court Practice OS</span>
            </h1>

            <p className="text-[#64748B] text-sm sm:text-base max-w-2xl mx-auto">
              Search New Criminal Laws (BNS, BNSS, BSA) with old IPC/CrPC cross-references, generate airtight legal drafting templates, and track court hearings without friction.
            </p>
          </div>
        </section>

        {/* Core Product Operating Surface */}
        <section className="px-4 max-w-5xl mx-auto py-10">
          <Tabs defaultValue="bare-acts" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="bg-white border border-[#E2E8F0] p-1.5 rounded-2xl shadow-xs flex flex-wrap justify-center gap-1 h-auto">
                <TabsTrigger 
                  value="bare-acts" 
                  className="text-xs font-bold px-4 py-2 rounded-xl text-[#64748B] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2563EB] data-[state=active]:to-[#7138E8] data-[state=active]:text-white transition-all flex items-center gap-2"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Bare Acts Navigator</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="drafting" 
                  className="text-xs font-bold px-4 py-2 rounded-xl text-[#64748B] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2563EB] data-[state=active]:to-[#7138E8] data-[state=active]:text-white transition-all flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Legal Drafter</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="matters" 
                  className="text-xs font-bold px-4 py-2 rounded-xl text-[#64748B] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2563EB] data-[state=active]:to-[#7138E8] data-[state=active]:text-white transition-all flex items-center gap-2"
                >
                  <Gavel className="w-3.5 h-3.5" />
                  <span>Court Matter Diary ({matters.length})</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: BARE ACTS NAVIGATOR */}
            <TabsContent value="bare-acts" className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs">
                <div className="flex-1 min-w-[240px] flex items-center gap-2 bg-[#F4F7FC] px-3 py-1.5 rounded-xl border border-[#E2E8F0]">
                  <Search className="w-4 h-4 text-[#64748B]" />
                  <Input 
                    type="text" 
                    placeholder="Search section number, offense, or old IPC/CrPC reference (e.g. 420, Cheating, Murder, Bail)..." 
                    value={actSearch}
                    onChange={(e) => setActSearch(e.target.value)}
                    className="border-0 bg-transparent text-xs p-0 text-[#111827] focus-visible:ring-0"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(['All', 'BNS 2023', 'BNSS 2023', 'BSA 2023', 'Commercial'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setSelectedActFilter(f)}
                      className={`text-xs px-3 py-1 rounded-lg font-semibold transition-colors ${
                        selectedActFilter === f 
                          ? 'bg-[#2563EB] text-white' 
                          : 'bg-[#F4F7FC] text-[#64748B] hover:text-[#111827] border border-[#E2E8F0]'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {filteredActs.map((item, idx) => (
                  <Card key={idx} className="bg-white border-[#E2E8F0] rounded-2xl shadow-xs p-4 hover:border-[#2563EB]/40 transition-all">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-[#2563EB] text-white text-[11px] font-bold">
                          {item.act}
                        </Badge>
                        <span className="font-mono text-sm font-black text-[#111827]">{item.section}</span>
                        {item.oldReference && (
                          <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-800 border-amber-200">
                            Formerly: {item.oldReference}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold">
                        <span className={`px-2 py-0.5 rounded-full ${item.bailable.includes('Non-Bailable') ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {item.bailable}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {item.cognizable}
                        </span>
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-[#111827] mb-1">{item.title}</h4>
                    <p className="text-xs text-[#64748B]"><strong className="text-[#111827]">Prescribed Punishment / Provision:</strong> {item.punishment}</p>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* TAB 2: LEGAL DRAFTER */}
            <TabsContent value="drafting" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Configuration Column */}
                <Card className="bg-white border-[#E2E8F0] rounded-2xl shadow-xs p-5 md:col-span-1 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#111827]">Legal Draft Configuration</h3>
                    <p className="text-xs text-[#64748B]">Generate standard Indian legal documents.</p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#111827] block mb-1">Document Template</label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value as any)}
                      className="w-full bg-[#F4F7FC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#111827]"
                    >
                      <option value="nda">Mutual Non-Disclosure Agreement (NDA)</option>
                      <option value="cheque_notice">Sec 138 NI Act Cheque Bounce Notice</option>
                      <option value="retainer">Corporate Legal Retainer Agreement</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-[#111827] block mb-1">Party A / Complainant</label>
                      <Input
                        type="text"
                        value={draftingData.partyA}
                        onChange={(e) => setDraftingData(prev => ({ ...prev, partyA: e.target.value }))}
                        className="bg-[#F4F7FC] border-[#E2E8F0] text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#111827] block mb-1">Party B / Respondent</label>
                      <Input
                        type="text"
                        value={draftingData.partyB}
                        onChange={(e) => setDraftingData(prev => ({ ...prev, partyB: e.target.value }))}
                        className="bg-[#F4F7FC] border-[#E2E8F0] text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#111827] block mb-1">Court Jurisdiction / City</label>
                      <Input
                        type="text"
                        value={draftingData.jurisdiction}
                        onChange={(e) => setDraftingData(prev => ({ ...prev, jurisdiction: e.target.value }))}
                        className="bg-[#F4F7FC] border-[#E2E8F0] text-xs font-medium"
                      />
                    </div>

                    {selectedTemplate === 'cheque_notice' && (
                      <>
                        <div>
                          <label className="text-xs font-semibold text-[#111827] block mb-1">Cheque Amount</label>
                          <Input
                            type="text"
                            value={draftingData.amount}
                            onChange={(e) => setDraftingData(prev => ({ ...prev, amount: e.target.value }))}
                            className="bg-[#F4F7FC] border-[#E2E8F0] text-xs font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-[#111827] block mb-1">Cheque Number</label>
                          <Input
                            type="text"
                            value={draftingData.chequeNo}
                            onChange={(e) => setDraftingData(prev => ({ ...prev, chequeNo: e.target.value }))}
                            className="bg-[#F4F7FC] border-[#E2E8F0] text-xs font-medium"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </Card>

                {/* Live Preview Column */}
                <Card className="bg-white border-[#E2E8F0] rounded-2xl shadow-xs p-5 md:col-span-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-[#111827]">Live Draft Preview</h3>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleCopyDraft}
                        className="text-xs border-[#E2E8F0] text-[#111827] flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5 text-[#2563EB]" />
                        <span>Copy Draft</span>
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => { window.print(); }}
                        className="text-xs bg-[#2563EB] text-white flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print</span>
                      </Button>
                    </div>
                  </div>

                  <pre className="p-4 bg-[#F4F7FC] rounded-xl border border-[#E2E8F0] text-[11px] font-mono text-[#111827] whitespace-pre-wrap leading-relaxed max-h-[460px] overflow-y-auto">
                    {generatedDraftText}
                  </pre>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 3: COURT MATTER DIARY */}
            <TabsContent value="matters" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Matter Entry Form */}
                <Card className="bg-white border-[#E2E8F0] rounded-2xl shadow-xs p-5 md:col-span-1">
                  <h3 className="text-sm font-bold text-[#111827] mb-1">Add Case to Chamber Diary</h3>
                  <p className="text-xs text-[#64748B] mb-4">Track court dates, cause lists, and hearing stages.</p>

                  <form onSubmit={handleAddMatter} className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-[#111827] block mb-1">Matter Title</label>
                      <Input
                        type="text"
                        value={newMatterTitle}
                        onChange={(e) => setNewMatterTitle(e.target.value)}
                        placeholder="e.g. Verma vs ABC Infra Ltd"
                        className="bg-[#F4F7FC] border-[#E2E8F0] text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#111827] block mb-1">Case Number</label>
                      <Input
                        type="text"
                        value={newMatterCaseNo}
                        onChange={(e) => setNewMatterCaseNo(e.target.value)}
                        placeholder="e.g. WP(C) 9021/2026"
                        className="bg-[#F4F7FC] border-[#E2E8F0] text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#111827] block mb-1">Court / Forum</label>
                      <select
                        value={newMatterForum}
                        onChange={(e) => setNewMatterForum(e.target.value)}
                        className="w-full bg-[#F4F7FC] border border-[#E2E8F0] rounded-md px-3 py-2 text-xs text-[#111827]"
                      >
                        <option value="Supreme Court of India">Supreme Court of India</option>
                        <option value="Delhi High Court">Delhi High Court</option>
                        <option value="Bombay High Court">Bombay High Court</option>
                        <option value="National Company Law Tribunal (NCLT)">NCLT</option>
                        <option value="District & Sessions Court">District & Sessions Court</option>
                        <option value="Arbitral Tribunal">Arbitral Tribunal</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#111827] block mb-1">Next Hearing Date</label>
                      <Input
                        type="date"
                        value={newMatterDate}
                        onChange={(e) => setNewMatterDate(e.target.value)}
                        className="bg-[#F4F7FC] border-[#E2E8F0] text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#111827] block mb-1">Hearing Stage</label>
                      <Input
                        type="text"
                        value={newMatterStage}
                        onChange={(e) => setNewMatterStage(e.target.value)}
                        placeholder="e.g. Arguments on Stay / Cross Examination"
                        className="bg-[#F4F7FC] border-[#E2E8F0] text-xs"
                      />
                    </div>

                    <Button type="submit" className="w-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-bold py-2 rounded-xl mt-2">
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add to Court Diary
                    </Button>
                  </form>
                </Card>

                {/* Matter List */}
                <Card className="bg-white border-[#E2E8F0] rounded-2xl shadow-xs p-5 md:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#111827]">Active Court Matters ({matters.length})</h3>
                      <p className="text-xs text-[#64748B]">Matter list stored in local chamber session.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {matters.map(m => (
                      <div key={m.id} className="p-3.5 bg-[#F4F7FC] rounded-xl border border-[#E2E8F0] flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="font-bold text-xs text-[#111827] block">{m.title}</span>
                          <span className="text-[11px] text-[#64748B] flex items-center gap-2">
                            <span>Case: <strong className="font-mono text-[#111827]">{m.caseNo}</strong></span>
                            <span>• Forum: <strong className="text-[#111827]">{m.forum}</strong></span>
                          </span>
                          <span className="text-[11px] text-[#2563EB] font-medium block">
                            Stage: {m.stage}
                          </span>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-[10px] bg-white border-blue-200 text-[#2563EB] font-bold">
                            Next: {m.nextDate}
                          </Badge>
                        </div>
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
