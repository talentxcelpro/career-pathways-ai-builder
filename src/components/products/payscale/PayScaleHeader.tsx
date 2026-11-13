// src/components/products/payscale/PayScaleHeader.tsx
// Pixel-Perfect Header for TalentXcel PayScale matching user visual mockup
// 3-tier header: Top Global Network Bar, Sub-Utility Bar, Main Navigation Bar with Dropdowns
// Real Authenticated User Integration (Zero hardcoded names)

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BadgeDollarSign, 
  Sparkles, 
  Building2, 
  User, 
  Compass, 
  Layers, 
  ShieldCheck, 
  ExternalLink,
  ChevronDown,
  Bell,
  Search,
  Globe,
  Briefcase,
  Users,
  Play,
  ArrowRight,
  Calculator,
  FileText,
  TrendingUp,
  Percent,
  SlidersHorizontal,
  DollarSign,
  Crown,
  LogOut,
  Settings
} from 'lucide-react';
import { TalentXcelLogo } from '@/components/common/TalentXcelLogo';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export type PayScaleSegment = 'individual' | 'employer';

interface PayScaleHeaderProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  userSegment: PayScaleSegment;
  onSegmentChange: (segment: PayScaleSegment) => void;
  onOpenProModal: () => void;
  onOpenEcosystem: () => void;
  isProUnlocked?: boolean;
}

export const PayScaleHeader: React.FC<PayScaleHeaderProps> = ({
  activeTab,
  onSelectTab,
  userSegment,
  onSegmentChange,
  onOpenProModal,
  onOpenEcosystem,
  isProUnlocked = false,
}) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profileName, setProfileName] = useState<string>('');
  const [profileAvatar, setProfileAvatar] = useState<string>('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Fetch real profile details from Supabase if authenticated
  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, username, avatar_url')
          .eq('id', user.id)
          .maybeSingle();
        if (isMounted && data) {
          if (data.full_name) setProfileName(data.full_name);
          else if (data.username) setProfileName(data.username);
          if (data.avatar_url) setProfileAvatar(data.avatar_url);
        }
      } catch {
        // Fallback gracefully to user metadata
      }
    };
    fetchProfile();
    return () => { isMounted = false; };
  }, [user?.id]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDropdownSelect = (tabId: string) => {
    setActiveDropdown(null);
    onSelectTab(tabId);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      setUserMenuOpen(false);
    } catch {
      toast.error('Error signing out');
    }
  };

  // Resolve real display name, email & avatar (zero mock fallback)
  const realDisplayName = 
    profileName || 
    user?.user_metadata?.full_name || 
    user?.user_metadata?.name || 
    (user?.email ? user.email.split('@')[0] : '') || 
    '';
  const realEmail = user?.email || '';
  const initial = (realDisplayName.charAt(0) || realEmail.charAt(0) || 'U').toUpperCase();
  const avatarUrl = profileAvatar || user?.user_metadata?.avatar_url || '';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] shadow-xs" ref={navRef}>
      {/* ─────────────────────────────────────────────────────────────
          BAR 1: TOP GLOBAL NETWORK UTILITY BAR (#0B0F19)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#0B0F19] text-white border-b border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-10 flex items-center justify-between gap-4">
          {/* Left Brand Identity */}
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/" onClick={() => onSelectTab('overview')} className="flex items-center gap-2">
              <TalentXcelLogo className="brightness-200" />
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#7138E8] text-white shadow-xs">
                PayScale
              </span>
            </Link>
          </div>

          {/* Center Universe Links */}
          <nav className="hidden lg:flex items-center gap-6 text-[11px] font-medium text-slate-300">
            <a 
              href={typeof window !== 'undefined' && window.location.hostname.includes('localhost') ? 'http://localhost:8080/network' : 'https://talentxcel.in/network'}
              className="hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Network</span>
            </a>
            <a 
              href={typeof window !== 'undefined' && window.location.hostname.includes('localhost') ? 'http://jobs.localhost:8080' : 'https://jobs.talentxcel.in'}
              className="hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Briefcase className="w-3.5 h-3.5 text-[#7138E8]" />
              <span>Jobs</span>
            </a>
            <a 
              href={typeof window !== 'undefined' && window.location.hostname.includes('localhost') ? 'http://careers.localhost:8080' : 'https://careers.talentxcel.in'}
              className="hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Talent</span>
            </a>
            <a 
              href={typeof window !== 'undefined' && window.location.hostname.includes('localhost') ? 'http://localhost:8080/reels' : 'https://talentxcel.in/reels'}
              className="hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-rose-400 fill-rose-400/30" />
              <span>Reels</span>
            </a>
            <a 
              href={typeof window !== 'undefined' && window.location.hostname.includes('localhost') ? 'http://localhost:8080/network?tab=communities' : 'https://talentxcel.in/network?tab=communities'}
              className="hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Communities</span>
            </a>
          </nav>

          {/* Right Action Buttons & Real Authenticated User */}
          <div className="flex items-center gap-3 shrink-0">
            <a 
              href={typeof window !== 'undefined' && window.location.hostname.includes('localhost') ? 'http://employers.localhost:8080' : 'https://employers.talentxcel.in'}
              className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 hover:opacity-95 transition-all shadow-xs"
            >
              <Sparkles className="w-3 h-3 text-white" />
              <span>Hire Talent (Recruiter OS)</span>
              <ArrowRight className="w-3 h-3 ml-0.5" />
            </a>

            {/* Notification Bell */}
            <button 
              onClick={() => toast.success('Notifications: Salary benchmark updates and annual appraisal alerts active.')}
              className="text-slate-400 hover:text-white relative p-1 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-1.5 h-1.5 bg-[#2563EB] rounded-full absolute top-1 right-1" />
            </button>

            {/* Real User Avatar & Display Name */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 cursor-pointer py-0.5 px-1.5 rounded-full hover:bg-slate-800 transition-all"
                  title={realDisplayName || 'My Account'}
                >
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt={realDisplayName} 
                      className="w-6 h-6 rounded-full object-cover border border-[#2563EB]"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#7138E8] text-white font-bold text-[11px] flex items-center justify-center border border-white/40">
                      {initial}
                    </div>
                  )}
                  {realDisplayName && (
                    <span className="text-[11px] font-bold text-white max-w-[110px] truncate hidden md:inline">
                      {realDisplayName}
                    </span>
                  )}
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white text-slate-800 rounded-2xl shadow-2xl border border-[#E2E8F0] p-2 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <div className="font-bold text-slate-900 truncate">{realDisplayName}</div>
                      {realEmail && <div className="text-[10px] text-slate-500 truncate">{realEmail}</div>}
                    </div>
                    
                    <button 
                      onClick={() => { setUserMenuOpen(false); onOpenProModal(); }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl font-bold text-[#2563EB] flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                      <span>PayScale PRO Status</span>
                    </button>

                    <Link 
                      to="/profile" 
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl text-slate-700 font-semibold flex items-center gap-2 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Profile</span>
                    </Link>

                    <button 
                      onClick={() => { setUserMenuOpen(false); onSelectTab('calculator'); }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl text-slate-700 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Calculator className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Salary Calculations</span>
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    <button 
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-2 hover:bg-red-50 rounded-xl text-red-600 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  to="/auth/login" 
                  className="text-slate-300 hover:text-white font-bold text-[11px] px-2 py-1 transition-colors"
                >
                  Log In
                </Link>
                <Link 
                  to="/auth/register" 
                  className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-[11px] px-2.5 py-1 rounded-md transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          BAR 2: SUB-UTILITY BAR (Matching Mockup)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#FFFFFF] border-b border-[#E2E8F0] text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-9 flex items-center justify-between gap-4">
          {/* Left Info & Compliance Tag */}
          <div className="flex items-center gap-2 text-[#475569] text-[11px] font-medium truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <strong className="text-[#111827] font-bold shrink-0">TalentXcel PayScale</strong>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-[#64748B] truncate hidden md:inline">
              Salary Intelligence, Tax Planning & Enterprise Compensation Management Platform
            </span>
            <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full ml-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>FY 2026–27 Compliant</span>
            </span>
          </div>

          {/* Right Links & Segment Tabs */}
          <div className="flex items-center gap-4 text-[11px] font-medium shrink-0">
            <button 
              onClick={onOpenEcosystem}
              className="text-[#2563EB] hover:text-[#7138E8] font-bold flex items-center gap-1 cursor-pointer bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-0.5 rounded-full transition-colors"
            >
              <Compass className="w-3 h-3 text-[#2563EB]" />
              <span>12 Products Local Index</span>
            </button>
            <a 
              href="https://passport.talentxcel.in" 
              className="text-[#475569] hover:text-[#111827] hidden lg:inline transition-colors"
            >
              Career Passport
            </a>
            <a 
              href={typeof window !== 'undefined' && window.location.hostname.includes('localhost') ? 'http://jobs.localhost:8080' : 'https://jobs.talentxcel.in'} 
              className="text-[#475569] hover:text-[#111827] hidden sm:inline transition-colors"
            >
              Live Jobs
            </a>

            {/* Segment Switcher Links (Individuals vs Employers) */}
            <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
              <button
                type="button"
                onClick={() => onSegmentChange('individual')}
                className={`transition-colors cursor-pointer font-bold ${
                  userSegment === 'individual'
                    ? 'text-[#111827] border-b-2 border-[#2563EB] pb-0.5'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Individuals
              </button>
              <button
                type="button"
                onClick={() => onSegmentChange('employer')}
                className={`transition-colors cursor-pointer font-bold ${
                  userSegment === 'employer'
                    ? 'text-[#111827] border-b-2 border-[#7138E8] pb-0.5'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Employers
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          BAR 3: PRIMARY WHITE NAVIGATION HEADER WITH DROPDOWNS
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-5 xl:gap-8">
            <Link to="/" onClick={() => onSelectTab('overview')} className="flex items-center gap-2 shrink-0">
              <TalentXcelLogo />
              <span className="text-xs font-black tracking-wider uppercase px-2.5 py-0.5 rounded-md bg-[#2563EB] text-white shadow-2xs">
                PAYSCALE
              </span>
            </Link>

            {/* Navigation Menu with Dropdowns */}
            <nav className="hidden xl:flex items-center gap-5 text-xs font-bold text-[#475569] relative">
              {/* 1. Overview */}
              <button
                onClick={() => onSelectTab('overview')}
                className={`py-2 transition-colors cursor-pointer ${
                  activeTab === 'overview'
                    ? 'text-[#2563EB] border-b-2 border-[#2563EB] font-black'
                    : 'hover:text-[#111827]'
                }`}
              >
                Overview
              </button>

              {/* 2. Salary Calculator Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'calculator' ? null : 'calculator')}
                  className={`flex items-center gap-1 py-2 cursor-pointer transition-colors ${
                    activeTab === 'calculator' ? 'text-[#2563EB]' : 'hover:text-[#111827]'
                  }`}
                >
                  <span>Salary Calculator</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${activeDropdown === 'calculator' ? 'rotate-180 text-[#2563EB]' : ''}`} />
                </button>

                {activeDropdown === 'calculator' && (
                  <div 
                    style={{ width: '380px', minWidth: '380px' }}
                    className="absolute top-full left-0 bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] p-3 z-50 animate-in fade-in-50 slide-in-from-top-1"
                  >
                    <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      Calculator Intelligence
                    </div>
                    <button
                      onClick={() => handleDropdownSelect('calculator')}
                      className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl flex items-start gap-2.5 cursor-pointer"
                    >
                      <Calculator className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">CTC to Net In-Hand Calculator</div>
                        <div className="text-[10px] text-slate-500">Full itemized monthly & annual breakdown</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDropdownSelect('documents')}
                      className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl flex items-start gap-2.5 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Printable Payslip Generator</div>
                        <div className="text-[10px] text-slate-500">PDF salary slips with earnings & deductions</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDropdownSelect('documents')}
                      className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl flex items-start gap-2.5 cursor-pointer"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-[#7138E8] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Salary Structure Builder</div>
                        <div className="text-[10px] text-slate-500">Design compliant 50% Basic CTC architectures</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Tax Planning Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'tax' ? null : 'tax')}
                  className={`flex items-center gap-1 py-2 cursor-pointer transition-colors ${
                    activeTab === 'tax' ? 'text-[#2563EB]' : 'hover:text-[#111827]'
                  }`}
                >
                  <span>Tax Planning</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${activeDropdown === 'tax' ? 'rotate-180 text-[#2563EB]' : ''}`} />
                </button>

                {activeDropdown === 'tax' && (
                  <div 
                    style={{ width: '380px', minWidth: '380px' }}
                    className="absolute top-full left-0 bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] p-3 z-50 animate-in fade-in-50 slide-in-from-top-1"
                  >
                    <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      Tax Regimes & Deductions
                    </div>
                    <button
                      onClick={() => handleDropdownSelect('tax')}
                      className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl flex items-start gap-2.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Old vs New Tax Regime Planner</div>
                        <div className="text-[10px] text-slate-500">Section 115BAC comparison for FY 2025–26 & 2026–27</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDropdownSelect('tax')}
                      className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl flex items-start gap-2.5 cursor-pointer"
                    >
                      <Percent className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Section 10(13A) HRA Calculator</div>
                        <div className="text-[10px] text-slate-500">Least of 3 conditions metro/non-metro rules</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDropdownSelect('tax')}
                      className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl flex items-start gap-2.5 cursor-pointer"
                    >
                      <DollarSign className="w-4 h-4 text-[#7138E8] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Chapter VI-A Deductions Simulator</div>
                        <div className="text-[10px] text-slate-500">80C, 80D, 80CCD(1B) NPS & 24b Home Loan</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* 4. Benchmark Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'benchmark' ? null : 'benchmark')}
                  className={`flex items-center gap-1 py-2 cursor-pointer transition-colors ${
                    activeTab === 'benchmark' || activeTab === 'trends' ? 'text-[#2563EB]' : 'hover:text-[#111827]'
                  }`}
                >
                  <span>Benchmark</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${activeDropdown === 'benchmark' ? 'rotate-180 text-[#2563EB]' : ''}`} />
                </button>

                {activeDropdown === 'benchmark' && (
                  <div 
                    style={{ width: '400px', minWidth: '400px' }}
                    className="absolute top-full left-0 bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] p-3 z-50 animate-in fade-in-50 slide-in-from-top-1"
                  >
                    <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      Market Salary Intelligence
                    </div>
                    <button
                      onClick={() => handleDropdownSelect('benchmark')}
                      className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl flex items-start gap-2.5 cursor-pointer"
                    >
                      <TrendingUp className="w-4 h-4 text-[#7138E8] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Percentile Benchmarks (P10–P90)</div>
                        <div className="text-[10px] text-slate-500">By role, experience, city and company tier</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDropdownSelect('benchmark')}
                      className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl flex items-start gap-2.5 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">"Am I Underpaid?" Diagnostic Tool</div>
                        <div className="text-[10px] text-slate-500">Instant market placement & upside calculation</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDropdownSelect('trends')}
                      className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl flex items-start gap-2.5 cursor-pointer"
                    >
                      <Globe className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">City Heatmaps & Skill Premiums</div>
                        <div className="text-[10px] text-slate-500">GenAI (+38%), FinOps (+28%), Rust (+26%)</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* 5. Compensation Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'compensation' ? null : 'compensation')}
                  className={`flex items-center gap-1 py-2 cursor-pointer transition-colors ${
                    activeTab === 'bands' || activeTab === 'increments' || activeTab === 'recruiter' ? 'text-[#2563EB]' : 'hover:text-[#111827]'
                  }`}
                >
                  <span>Compensation</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${activeDropdown === 'compensation' ? 'rotate-180 text-[#2563EB]' : ''}`} />
                </button>

                {activeDropdown === 'compensation' && (
                  <div 
                    style={{ width: '420px', minWidth: '420px' }}
                    className="absolute top-full left-0 bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] p-3 z-50 animate-in fade-in-50 slide-in-from-top-1"
                  >
                    <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      Enterprise & Employer Workspaces
                    </div>
                    <button
                      onClick={() => handleDropdownSelect('bands')}
                      className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl flex items-start gap-2.5 cursor-pointer"
                    >
                      <Building2 className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Enterprise Grade Bands (L1–L7)</div>
                        <div className="text-[10px] text-slate-500">Department payroll analytics & compa-ratio audits</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDropdownSelect('increments')}
                      className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl flex items-start gap-2.5 cursor-pointer"
                    >
                      <Layers className="w-4 h-4 text-[#7138E8] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Merit Matrix & Increment Planner</div>
                        <div className="text-[10px] text-slate-500">9-box performance hikes & flight risk alerts</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDropdownSelect('recruiter')}
                      className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl flex items-start gap-2.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Recruiter Offer Competitiveness</div>
                        <div className="text-[10px] text-slate-500">Candidate acceptance likelihood scoring (0–100%)</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* 6. Growth Planner Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'growth' ? null : 'growth')}
                  className={`flex items-center gap-1 py-2 cursor-pointer transition-colors ${
                    activeTab === 'growth' || activeTab === 'negotiation' || activeTab === 'planning' ? 'text-[#2563EB]' : 'hover:text-[#111827]'
                  }`}
                >
                  <span>Growth Planner</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${activeDropdown === 'growth' ? 'rotate-180 text-[#2563EB]' : ''}`} />
                </button>

                {activeDropdown === 'growth' && (
                  <div 
                    style={{ width: '400px', minWidth: '400px' }}
                    className="absolute top-full left-0 bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] p-3 z-50 animate-in fade-in-50 slide-in-from-top-1"
                  >
                    <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      Career Earnings & Financial Roadmaps
                    </div>
                    <button
                      onClick={() => handleDropdownSelect('growth')}
                      className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl flex items-start gap-2.5 cursor-pointer"
                    >
                      <Compass className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Career Salary Growth Navigator</div>
                        <div className="text-[10px] text-slate-500">Bridge target roles to SkillPods & TalentXcel Jobs</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDropdownSelect('negotiation')}
                      className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl flex items-start gap-2.5 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-[#7138E8] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">AI Salary Negotiation Coach</div>
                        <div className="text-[10px] text-slate-500">Evaluate offers & copy 4 executive email scripts</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDropdownSelect('planning')}
                      className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl flex items-start gap-2.5 cursor-pointer"
                    >
                      <DollarSign className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">50/30/20 Budget & EPF Simulator</div>
                        <div className="text-[10px] text-slate-500">Compounding retirement wealth at 8.25% p.a.</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* 7. Resources Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'resources' ? null : 'resources')}
                  className={`flex items-center gap-1 py-2 cursor-pointer transition-colors ${
                    activeTab === 'ai_assistant' ? 'text-[#2563EB]' : 'hover:text-[#111827]'
                  }`}
                >
                  <span>Resources</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${activeDropdown === 'resources' ? 'rotate-180 text-[#2563EB]' : ''}`} />
                </button>

                {activeDropdown === 'resources' && (
                  <div 
                    style={{ width: '380px', minWidth: '380px' }}
                    className="absolute top-full right-0 bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] p-3 z-50 animate-in fade-in-50 slide-in-from-top-1"
                  >
                    <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      Guidance & AI Support
                    </div>
                    <button
                      onClick={() => handleDropdownSelect('ai_assistant')}
                      className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl flex items-start gap-2.5 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">PayScale AI Assistant</div>
                        <div className="text-[10px] text-slate-500">Ask anything about your payslip, tax & offers</div>
                      </div>
                    </button>
                    <a
                      href="https://learning.talentxcel.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl flex items-start gap-2.5"
                    >
                      <ExternalLink className="w-4 h-4 text-[#7138E8] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">SkillPods Academy</div>
                        <div className="text-[10px] text-slate-500">Role-based upskilling for salary jumps</div>
                      </div>
                    </a>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            {/* PayScale PRO Button */}
            <button
              type="button"
              onClick={onOpenProModal}
              className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black text-xs px-3 sm:px-4 py-2 rounded-xl flex items-center gap-1.5 hover:brightness-105 transition-all shadow-xs cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5 fill-slate-950" />
              <span>PayScale PRO (from ₹199)</span>
            </button>

            {/* Real User Button & Account Menu */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="inline-flex items-center gap-2 p-1.5 px-3 rounded-xl border border-[#E2E8F0] hover:border-[#2563EB] bg-slate-50 hover:bg-white transition-colors cursor-pointer shadow-2xs"
                >
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt={realDisplayName} 
                      className="w-6 h-6 rounded-full object-cover border border-[#2563EB]"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#7138E8] text-white font-black text-[11px] flex items-center justify-center shadow-2xs">
                      {initial}
                    </div>
                  )}
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-black text-[#111827] max-w-[120px] truncate leading-tight">
                      {realDisplayName || 'My Account'}
                    </div>
                    <div className="text-[9px] font-semibold text-slate-500 leading-tight">
                      Verified Member
                    </div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white text-slate-800 rounded-2xl shadow-2xl border border-[#E2E8F0] p-2 z-50 text-xs animate-in fade-in-50 slide-in-from-top-1">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <div className="font-bold text-slate-900 truncate">{realDisplayName || 'My Account'}</div>
                      {realEmail && <div className="text-[10px] text-slate-500 truncate">{realEmail}</div>}
                    </div>
                    
                    <button 
                      onClick={() => { setUserMenuOpen(false); onOpenProModal(); }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl font-bold text-[#2563EB] flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                      <span>PayScale PRO Status</span>
                    </button>

                    <Link 
                      to="/profile" 
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl text-slate-700 font-semibold flex items-center gap-2 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Profile</span>
                    </Link>

                    <button 
                      onClick={() => { setUserMenuOpen(false); onSelectTab('calculator'); }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl text-slate-700 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Calculator className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Salary Calculations</span>
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    <button 
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-2 hover:bg-red-50 rounded-xl text-red-600 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth/login"
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 px-2 py-1 hidden sm:inline transition-colors"
                >
                  Log In
                </Link>

                <Link
                  to="/auth/register"
                  className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1 transition-all shadow-xs"
                >
                  <span>Sign Up Free</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
