import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
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
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export const CampusOSProduct: React.FC = () => {
  const navigate = useNavigate();
  const [cohortCode, setCohortCode] = useState('');
  const [collegeSearch, setCollegeSearch] = useState('');

  const handleCohortSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = cohortCode.trim().toUpperCase();
    if (!clean) {
      toast.error('Please enter your institutional cohort code.');
      return;
    }
    navigate(`/b/${clean}`);
  };

  const featuredColleges = [
    { name: 'COEP Technological University', city: 'Pune, Maharashtra', nirf: '73 (Engg)', avgPackage: '₹11.2 LPA', code: 'COEP-2027' },
    { name: 'Veermata Jijabai Technological Institute (VJTI)', city: 'Mumbai, Maharashtra', nirf: 'State Top 3', avgPackage: '₹13.5 LPA', code: 'VJTI-2027' },
    { name: 'RV College of Engineering (RVCE)', city: 'Bangalore, Karnataka', nirf: '89 (Engg)', avgPackage: '₹14.8 LPA', code: 'RVCE-2027' },
    { name: 'Chaitanya Bharathi Institute of Tech (CBIT)', city: 'Hyderabad, Telangana', nirf: 'Top 100', avgPackage: '₹9.4 LPA', code: 'CBIT-2027' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      <Helmet>
        <title>CampusOS by TalentXcel — College Placement & Student Readiness Portal</title>
        <meta name="description" content="Campus placement readiness testing, TPO cohort management, and comprehensive cutoff intelligence across 10,250+ Indian higher education institutions." />
        <link rel="canonical" href="https://colleges.talentxcel.in/" />
      </Helmet>

      {/* Product Banner */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border-b border-indigo-500/20 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="font-semibold text-indigo-300">CampusOS Placement Gateway</span>
            <span className="text-slate-400 hidden sm:inline">• 10,250+ Accredited Colleges Cataloged</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/directory" className="text-slate-300 hover:text-white text-xs font-medium">
              Browse Directory →
            </Link>
          </div>
        </div>
      </div>

      {/* Hero & Cohort Access Form */}
      <section className="px-4 pt-10 pb-12 max-w-5xl mx-auto text-center">
        <Badge className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-xs px-3 py-1 mb-4">
          Institutional Placement Gateway & TPO Workspace
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">
          Prepare Your Campus for <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Corporate Placement Drives</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto mb-8">
          Students enter your official college cohort code below to unlock batch placement tests, resume readiness audits, and campus recruitment links.
        </p>

        {/* Cohort Code Gateway Box */}
        <div className="max-w-xl mx-auto bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-6 backdrop-blur shadow-xl mb-12">
          <form onSubmit={handleCohortSubmit} className="space-y-4">
            <div className="text-left">
              <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                Enter Institutional Cohort Code:
              </label>
              <div className="flex gap-2">
                <Input 
                  type="text" 
                  placeholder="e.g. COEP-2027, RVCE-2027" 
                  value={cohortCode}
                  onChange={(e) => setCohortCode(e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white font-mono uppercase text-sm focus:border-indigo-500"
                />
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-6 rounded-xl shrink-0">
                  Enter Cohort
                </Button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Provided by your Training & Placement Officer (TPO) or Campus Placement Cell.
              </p>
            </div>
          </form>
        </div>

        {/* Featured Campus Cohorts */}
        <div className="text-left max-w-4xl mx-auto">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Active Placement Readiness Cohorts:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {featuredColleges.map((col, idx) => (
              <div 
                key={idx}
                onClick={() => navigate(`/b/${col.code}`)}
                className="bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {col.name}
                  </h4>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                    <span>{col.city}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-medium">Avg: {col.avgPackage}</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-indigo-300 border-indigo-500/30 font-mono text-[10px]">
                  {col.code}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sourced Data Disclosure */}
      <footer className="border-t border-slate-900 bg-slate-950 px-4 py-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-semibold text-slate-400">CampusOS</span> is an institutional education & placement portal of TalentXcel.
          </div>
          <div className="flex gap-4">
            <Link to="https://jobs.talentxcel.in" className="hover:text-slate-300">Jobs</Link>
            <Link to="https://resume.talentxcel.in" className="hover:text-slate-300">Resume</Link>
            <Link to="https://salary.talentxcel.in" className="hover:text-slate-300">Salary</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
