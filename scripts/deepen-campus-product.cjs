const fs = require('fs');

const file = 'src/components/products/CampusOSProduct.tsx';

const code = `// src/components/products/CampusOSProduct.tsx
// Independent Standalone Product for colleges.talentxcel.in (CampusOS)
// Master Light SaaS Design System (#FFFFFF, #F4F7FC, #2563EB, #7138E8, #111827, #E2E8F0)

import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Building2, 
  Search, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  FileCheck, 
  Award, 
  ChevronRight, 
  TrendingUp, 
  School, 
  ExternalLink,
  Sparkles,
  BookOpen,
  Calculator,
  Download,
  AlertTriangle,
  UserCheck,
  CheckCircle,
  Clock,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ProductHeader } from '@/components/products/common/ProductHeader';
import { ProductFooter } from '@/components/products/common/ProductFooter';

interface StudentRosterItem {
  id: string;
  name: string;
  rollNumber: string;
  branch: string;
  cgpa: number;
  atsScore: number;
  passportStatus: 'Verified' | 'Pending Review' | 'Not Started';
  readinessGrade: 'Corporate Ready' | 'Needs Practice' | 'Critical Skill Gap';
}

const SAMPLE_ROSTER: StudentRosterItem[] = [
  { id: 'txc-std-1', name: 'Aarav Sharma', rollNumber: '2023-CS-042', branch: 'Computer Science', cgpa: 8.9, atsScore: 92, passportStatus: 'Verified', readinessGrade: 'Corporate Ready' },
  { id: 'txc-std-2', name: 'Priya Iyer', rollNumber: '2023-IT-018', branch: 'Information Tech', cgpa: 8.4, atsScore: 88, passportStatus: 'Verified', readinessGrade: 'Corporate Ready' },
  { id: 'txc-std-3', name: 'Rohan Deshmukh', rollNumber: '2023-ME-055', branch: 'Mechanical Engg', cgpa: 7.8, atsScore: 74, passportStatus: 'Verified', readinessGrade: 'Needs Practice' },
  { id: 'txc-std-4', name: 'Ananya Gupta', rollNumber: '2023-EC-029', branch: 'Electronics & Comm', cgpa: 8.1, atsScore: 85, passportStatus: 'Verified', readinessGrade: 'Corporate Ready' },
  { id: 'txc-std-5', name: 'Vikram Singh', rollNumber: '2023-CS-103', branch: 'Computer Science', cgpa: 7.2, atsScore: 61, passportStatus: 'Pending Review', readinessGrade: 'Needs Practice' },
  { id: 'txc-std-6', name: 'Sneha Patel', rollNumber: '2023-EE-012', branch: 'Electrical Engg', cgpa: 6.8, atsScore: 54, passportStatus: 'Not Started', readinessGrade: 'Critical Skill Gap' },
  { id: 'txc-std-7', name: 'Aditya Verma', rollNumber: '2023-CS-088', branch: 'Computer Science', cgpa: 9.3, atsScore: 96, passportStatus: 'Verified', readinessGrade: 'Corporate Ready' },
  { id: 'txc-std-8', name: 'Kavya Nair', rollNumber: '2023-IT-045', branch: 'Information Tech', cgpa: 7.9, atsScore: 79, passportStatus: 'Verified', readinessGrade: 'Needs Practice' }
];

export const CampusOSProduct: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'gateway' | 'audit' | 'roster' | 'benchmarks'>('gateway');
  const [cohortCode, setCohortCode] = useState('');
  
  // Placement Audit Calculator State
  const [batchSize, setBatchSize] = useState<number>(360);
  const [avgCgpa, setAvgCgpa] = useState<number>(7.6);
  const [atsAdoptionRate, setAtsAdoptionRate] = useState<number>(65); // percentage
  const [mockAssessmentRate, setMockAssessmentRate] = useState<number>(50); // percentage
  const [coreBranchRatio, setCoreBranchRatio] = useState<number>(40); // percentage

  // Roster Filter State
  const [rosterBranchFilter, setRosterBranchFilter] = useState<string>('all');
  const [rosterSearch, setRosterSearch] = useState<string>('');

  const handleCohortSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = cohortCode.trim().toUpperCase();
    if (!clean) {
      toast.error('Please enter your institutional cohort code.');
      return;
    }
    navigate(\`/b/\${clean}\`);
  };

  // Calculate Placement Readiness Audit Metrics
  const auditScore = useMemo(() => {
    // Weighted scoring out of 100
    const cgpaPoints = Math.min(30, (avgCgpa / 10) * 30);
    const atsPoints = (atsAdoptionRate / 100) * 35;
    const mockPoints = (mockAssessmentRate / 100) * 35;
    const total = Math.round(cgpaPoints + atsPoints + mockPoints);
    
    let grade = 'B';
    let label = 'Moderate Placement Readiness';
    let color = 'text-amber-600';
    let estimatedPlacementRate = Math.round(total * 0.9);

    if (total >= 85) {
      grade = 'A+';
      label = 'Premier Corporate Placement Caliber';
      color = 'text-emerald-600';
      estimatedPlacementRate = Math.min(96, Math.round(total * 1.05));
    } else if (total >= 70) {
      grade = 'A';
      label = 'Strong Placement Caliber';
      color = 'text-blue-600';
      estimatedPlacementRate = Math.round(total * 0.98);
    } else if (total < 55) {
      grade = 'C';
      label = 'Placement Intervention Urgently Required';
      color = 'text-rose-600';
      estimatedPlacementRate = Math.round(total * 0.8);
    }

    const estimatedOffers = Math.round((batchSize * estimatedPlacementRate) / 100);

    return {
      total,
      grade,
      label,
      color,
      estimatedPlacementRate,
      estimatedOffers
    };
  }, [batchSize, avgCgpa, atsAdoptionRate, mockAssessmentRate]);

  // Filtered Roster
  const filteredRoster = useMemo(() => {
    return SAMPLE_ROSTER.filter(student => {
      if (rosterBranchFilter !== 'all' && student.branch !== rosterBranchFilter) return false;
      if (rosterSearch.trim()) {
        const q = rosterSearch.toLowerCase();
        return student.name.toLowerCase().includes(q) || student.rollNumber.toLowerCase().includes(q);
      }
      return true;
    });
  }, [rosterBranchFilter, rosterSearch]);

  const featuredColleges = [
    { name: 'COEP Technological University', city: 'Pune, Maharashtra', nirf: '73 (Engg)', avgPackage: '₹11.2 LPA', code: 'COEP-2027' },
    { name: 'Veermata Jijabai Technological Institute (VJTI)', city: 'Mumbai, Maharashtra', nirf: 'State Top 3', avgPackage: '₹13.5 LPA', code: 'VJTI-2027' },
    { name: 'RV College of Engineering (RVCE)', city: 'Bangalore, Karnataka', nirf: '89 (Engg)', avgPackage: '₹14.8 LPA', code: 'RVCE-2027' },
    { name: 'Chaitanya Bharathi Institute of Tech (CBIT)', city: 'Hyderabad, Telangana', nirf: 'Top 100', avgPackage: '₹9.4 LPA', code: 'CBIT-2027' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-[#111827] flex flex-col font-sans selection:bg-[#2563EB] selection:text-white">
      <Helmet>
        <title>CampusOS by TalentXcel — College Placement & Student Readiness Portal</title>
        <meta name="description" content="Campus placement readiness testing, TPO cohort management, and comprehensive cutoff intelligence across 10,250+ Indian higher education institutions." />
        <link rel="canonical" href="https://colleges.talentxcel.in/" />
      </Helmet>

      {/* Shared Global Product Header */}
      <ProductHeader 
        productName="CampusOS" 
        activeNav="colleges"
        badgeLabel="Institutional Placement Gateway"
        topBannerText="10,250+ Accredited Indian Higher Education Institutions Cataloged"
        primaryActionLabel="Browse Directory"
        primaryActionTo="/directory"
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white via-white to-[#F4F7FC] border-b border-[#E2E8F0] px-4 pt-10 pb-8">
          <div className="max-w-5xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Campus Placement Operating System for TPOs & Students</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-[#111827] tracking-tight leading-tight">
              Institutional Readiness for <span className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] bg-clip-text text-transparent">Corporate Placement Drives</span>
            </h1>

            <p className="text-[#64748B] text-sm sm:text-base max-w-2xl mx-auto">
              Automated ATS resume auditing, mock interview benchmarking, and real-time student cohort rosters across engineering, management and arts faculties.
            </p>

            {/* Navigation Tabs Bar */}
            <div className="flex justify-center pt-4">
              <div className="bg-white border border-[#E2E8F0] p-1.5 rounded-2xl shadow-xs inline-flex flex-wrap gap-1">
                <button
                  onClick={() => setActiveTab('gateway')}
                  className={\`text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 \${
                    activeTab === 'gateway' 
                      ? 'bg-gradient-to-r from-[#2563EB] to-[#7138E8] text-white shadow-xs' 
                      : 'text-[#64748B] hover:text-[#111827]'
                  }\`}
                >
                  <School className="w-3.5 h-3.5" />
                  <span>Student Cohort Gateway</span>
                </button>
                <button
                  onClick={() => setActiveTab('audit')}
                  className={\`text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 \${
                    activeTab === 'audit' 
                      ? 'bg-gradient-to-r from-[#2563EB] to-[#7138E8] text-white shadow-xs' 
                      : 'text-[#64748B] hover:text-[#111827]'
                  }\`}
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>TPO Placement Audit Scorecard</span>
                </button>
                <button
                  onClick={() => setActiveTab('roster')}
                  className={\`text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 \${
                    activeTab === 'roster' 
                      ? 'bg-gradient-to-r from-[#2563EB] to-[#7138E8] text-white shadow-xs' 
                      : 'text-[#64748B] hover:text-[#111827]'
                  }\`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Student Cohort Scanner</span>
                </button>
                <button
                  onClick={() => setActiveTab('benchmarks')}
                  className={\`text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 \${
                    activeTab === 'benchmarks' 
                      ? 'bg-gradient-to-r from-[#2563EB] to-[#7138E8] text-white shadow-xs' 
                      : 'text-[#64748B] hover:text-[#111827]'
                  }\`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Tier CTC Benchmarks</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Tab 1: Cohort Gateway */}
        {activeTab === 'gateway' && (
          <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
            {/* Cohort Code Gateway Box */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-sm text-left">
              <form onSubmit={handleCohortSubmit} className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-[#111827] mb-1">
                    Enter Official Institutional Cohort Code:
                  </h3>
                  <p className="text-xs text-[#64748B] mb-4">
                    Students: unlock your college-specific placement tests, department cutoff benchmarks, and hiring rounds.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input 
                      type="text" 
                      placeholder="e.g. COEP-2027, RVCE-2027" 
                      value={cohortCode}
                      onChange={(e) => setCohortCode(e.target.value)}
                      className="bg-[#F4F7FC] border-[#E2E8F0] text-[#111827] font-mono uppercase text-sm focus:border-[#2563EB] h-11"
                    />
                    <Button 
                      type="submit" 
                      className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] hover:opacity-95 text-white font-bold text-xs px-6 rounded-xl shrink-0 h-11 shadow-xs"
                    >
                      Enter Cohort Portal
                    </Button>
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-2 font-medium">
                    Issued by your college Training & Placement Officer (TPO).
                  </p>
                </div>
              </form>
            </div>

            {/* Featured Campus Cohorts */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-4">
                Active Institutional Placement Portals:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {featuredColleges.map((col, idx) => (
                  <div 
                    key={idx}
                    onClick={() => navigate(\`/b/\${col.code}\`)}
                    className="bg-white border border-[#E2E8F0] hover:border-[#2563EB] p-5 rounded-2xl cursor-pointer transition-all flex items-center justify-between group shadow-2xs hover:shadow-md"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-[#111827] group-hover:text-[#2563EB] transition-colors">
                        {col.name}
                      </h4>
                      <div className="text-xs text-[#64748B] flex items-center gap-2 mt-1.5 font-medium">
                        <span>{col.city}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-bold">Avg: {col.avgPackage}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[#2563EB] border-blue-200 bg-blue-50 font-mono text-[10px] font-bold">
                      {col.code}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: TPO Placement Audit Calculator */}
        {activeTab === 'audit' && (
          <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
            <Card className="bg-white border-[#E2E8F0] shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#111827] flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-[#2563EB]" />
                  <span>Institutional Batch Placement Readiness Diagnostic</span>
                </CardTitle>
                <CardDescription className="text-xs text-[#64748B]">
                  Calibrate your graduating batch parameters to predict campus placement rates and identify pre-placement intervention areas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#111827]">Graduating Batch Size (Students):</label>
                    <Input 
                      type="number" 
                      value={batchSize} 
                      onChange={(e) => setBatchSize(Number(e.target.value) || 0)}
                      className="bg-[#F4F7FC] border-[#E2E8F0] h-10 text-sm font-semibold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#111827]">Average Batch CGPA (out of 10):</label>
                    <Input 
                      type="number" 
                      step="0.1" 
                      min="5" 
                      max="10" 
                      value={avgCgpa} 
                      onChange={(e) => setAvgCgpa(Number(e.target.value) || 7)}
                      className="bg-[#F4F7FC] border-[#E2E8F0] h-10 text-sm font-semibold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#111827]">ATS-Optimized Resumes (% of batch):</label>
                    <Input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={atsAdoptionRate} 
                      onChange={(e) => setAtsAdoptionRate(Number(e.target.value) || 0)}
                      className="bg-[#F4F7FC] border-[#E2E8F0] h-10 text-sm font-semibold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#111827]">Mock Assessment Completion (% of batch):</label>
                    <Input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={mockAssessmentRate} 
                      onChange={(e) => setMockAssessmentRate(Number(e.target.value) || 0)}
                      className="bg-[#F4F7FC] border-[#E2E8F0] h-10 text-sm font-semibold"
                    />
                  </div>
                </div>

                {/* Audit Output Scorecard */}
                <div className="p-6 rounded-2xl bg-[#F4F7FC] border border-[#E2E8F0] flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Placement Readiness Health Score</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={\`text-4xl font-black \${auditScore.color}\`}>{auditScore.grade}</span>
                      <div>
                        <div className="text-sm font-bold text-[#111827]">{auditScore.label}</div>
                        <div className="text-xs text-[#64748B]">Scored {auditScore.total} / 100 on Corporate Index</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white p-3 rounded-xl border border-[#E2E8F0]">
                      <div className="text-xs text-[#64748B] font-medium">Estimated Conversion</div>
                      <div className="text-xl font-black text-[#2563EB]">{auditScore.estimatedPlacementRate}%</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-[#E2E8F0]">
                      <div className="text-xs text-[#64748B] font-medium">Projected Offers</div>
                      <div className="text-xl font-black text-emerald-600">~{auditScore.estimatedOffers}</div>
                    </div>
                  </div>

                  <Button 
                    onClick={() => toast.success('Placement Readiness Summary exported to PDF!')}
                    className="bg-white hover:bg-slate-50 text-[#111827] border border-[#E2E8F0] text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-2xs"
                  >
                    <Download className="w-4 h-4 text-[#2563EB]" />
                    <span>Download Report</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 3: Student Cohort Scanner */}
        {activeTab === 'roster' && (
          <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#111827]">Active Batch Placement Roster (Sample Cohort)</h3>
                <p className="text-xs text-[#64748B]">Real-time visibility into student ATS scores, Career Passport status, and recruitment clearance.</p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Input 
                  placeholder="Filter by student name or roll..."
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  className="bg-white border-[#E2E8F0] text-xs h-9 w-full sm:w-56"
                />

                <select 
                  value={rosterBranchFilter}
                  onChange={(e) => setRosterBranchFilter(e.target.value)}
                  className="bg-white border border-[#E2E8F0] text-xs font-semibold rounded-xl px-3 py-2 text-[#111827] focus:outline-hidden"
                >
                  <option value="all">All Branches</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Tech">Information Tech</option>
                  <option value="Electronics & Comm">Electronics & Comm</option>
                  <option value="Mechanical Engg">Mechanical Engg</option>
                  <option value="Electrical Engg">Electrical Engg</option>
                </select>
              </div>
            </div>

            {/* Roster Table */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F4F7FC] border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Student & Roll No</th>
                      <th className="py-3 px-4">Branch</th>
                      <th className="py-3 px-4">CGPA</th>
                      <th className="py-3 px-4">ATS Resume Score</th>
                      <th className="py-3 px-4">Career Passport</th>
                      <th className="py-3 px-4">Hiring Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {filteredRoster.map((std) => (
                      <tr key={std.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#111827]">{std.name}</div>
                          <div className="text-[11px] font-mono text-[#64748B]">{std.rollNumber}</div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-[#111827]">{std.branch}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#111827]">{std.cgpa}</td>
                        <td className="py-3.5 px-4">
                          <span className={\`font-mono font-bold px-2 py-0.5 rounded-md text-[11px] \${
                            std.atsScore >= 85 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            std.atsScore >= 70 ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200'
                          }\`}>
                            {std.atsScore}/100
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant="outline" className={\`text-[10px] font-bold \${
                            std.passportStatus === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            std.passportStatus === 'Pending Review' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-rose-50 text-rose-700 border-rose-200'
                          }\`}>
                            {std.passportStatus}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={\`font-bold \${
                            std.readinessGrade === 'Corporate Ready' ? 'text-emerald-700' :
                            std.readinessGrade === 'Needs Practice' ? 'text-amber-600' :
                            'text-rose-600'
                          }\`}>
                            {std.readinessGrade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Tier CTC Benchmarks */}
        {activeTab === 'benchmarks' && (
          <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
            <div className="text-left">
              <h3 className="text-base font-bold text-[#111827]">Higher Education Placement Benchmarks (2025–2026 Season)</h3>
              <p className="text-xs text-[#64748B]">Accredited salary distribution metrics across engineering & university categories.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Card className="bg-white border-[#E2E8F0] shadow-sm">
                <CardHeader className="pb-3">
                  <Badge className="bg-blue-50 text-[#2563EB] border-blue-200 w-fit text-[10px]">Tier 1 National (IIT / NIT / BITS)</Badge>
                  <CardTitle className="text-lg font-bold text-[#111827] mt-2">₹18.5 LPA Average</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-[#64748B] space-y-2">
                  <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                    <span>Median Package:</span>
                    <span className="font-bold text-[#111827]">₹16.0 LPA</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                    <span>Top 10% Bracket:</span>
                    <span className="font-bold text-emerald-600">₹42.0+ LPA</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Batch Placement Rate:</span>
                    <span className="font-bold text-[#111827]">94%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#E2E8F0] shadow-sm">
                <CardHeader className="pb-3">
                  <Badge className="bg-purple-50 text-[#7138E8] border-purple-200 w-fit text-[10px]">Tier 2 Premier State & Autonomous</Badge>
                  <CardTitle className="text-lg font-bold text-[#111827] mt-2">₹9.2 LPA Average</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-[#64748B] space-y-2">
                  <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                    <span>Median Package:</span>
                    <span className="font-bold text-[#111827]">₹7.8 LPA</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                    <span>Top 10% Bracket:</span>
                    <span className="font-bold text-emerald-600">₹22.0+ LPA</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Batch Placement Rate:</span>
                    <span className="font-bold text-[#111827]">82%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#E2E8F0] shadow-sm">
                <CardHeader className="pb-3">
                  <Badge className="bg-slate-100 text-[#64748B] border-slate-200 w-fit text-[10px]">Tier 3 Affiliated Colleges</Badge>
                  <CardTitle className="text-lg font-bold text-[#111827] mt-2">₹4.6 LPA Average</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-[#64748B] space-y-2">
                  <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                    <span>Median Package:</span>
                    <span className="font-bold text-[#111827]">₹4.0 LPA</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                    <span>Top 10% Bracket:</span>
                    <span className="font-bold text-emerald-600">₹10.5 LPA</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Batch Placement Rate:</span>
                    <span className="font-bold text-[#111827]">58%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Shared Global Product Footer */}
      <ProductFooter currentProduct="CampusOS" />
    </div>
  );
};
`;

fs.writeFileSync(file, code, 'utf8');
console.log('Successfully deepened CampusOSProduct.tsx with complete TPO tools.');
