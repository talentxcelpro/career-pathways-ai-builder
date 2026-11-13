// src/components/products/CareerPathfinderProduct.tsx
// Independent Standalone Product for careers.talentxcel.in (Career Pathfinder)
// Master Light SaaS Design System matching user visual mockup perfectly
// Covers multi-industry transitions (150+ pathways across all 16 Industries)
// Interactive Header Dropdowns, Single Top Bar, Custom Career Pathway Builder, and Advance Pro Suite

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Compass, 
  Target, 
  TrendingUp, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  Briefcase, 
  Award, 
  Layers, 
  Clock, 
  BookOpen, 
  Zap, 
  ChevronRight, 
  ChevronDown,
  ShieldCheck, 
  Brain,
  Users,
  Building2,
  GraduationCap,
  Handshake,
  Scale,
  Stethoscope,
  BarChart3,
  PieChart,
  Palette,
  Truck,
  FileText,
  Check,
  ExternalLink,
  SlidersHorizontal,
  RotateCcw,
  Globe,
  Radio,
  Coins,
  Cpu,
  Tv,
  Lock,
  Unlock,
  Download,
  Search,
  Filter,
  Flame,
  Star,
  CheckCheck,
  Copy,
  Sliders,
  Wand2,
  HelpCircle,
  FolderGit2,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { TalentXcelLogo } from '@/components/common/TalentXcelLogo';
import { useCentralEntitlements } from '@/hooks/useCentralEntitlements';
import { UpgradeModal } from '@/components/billing/UpgradeModal';
import { PlatformEcosystemSidebar } from './jobmatch/PlatformEcosystemSidebar';
import { 
  CAREER_TRANSITIONS_CATALOG, 
  TransitionPath, 
  getTransitionById,
  generateCustomCareerTransition,
  CAREER_INDUSTRIES,
  EXPERIENCE_LEVELS,
  LOCATION_TIERS,
  filterCareerTransitionsMultiDimensional
} from '@/data/careerPathwaysCatalog';
import { CareerProUnlockModal } from './career/CareerProUnlockModal';

export const CareerPathfinderProduct: React.FC = () => {
  const navigate = useNavigate();
  const { 
    subscription, 
    checkEntitlement, 
    isUpgradeModalOpen, 
    openUpgradeModal, 
    closeUpgradeModal,
    refreshEntitlements 
  } = useCentralEntitlements();

  // State Management
  const [navigatorMode, setNavigatorMode] = useState<'catalog' | 'custom'>('catalog');
  const [selectedKey, setSelectedKey] = useState<string>('hr_manager_to_vp_people');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedExperience, setSelectedExperience] = useState<string>('all');
  const [selectedLocationTier, setSelectedLocationTier] = useState<string>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [platformSidebarOpen, setPlatformSidebarOpen] = useState(false);
  const [activeSegment, setActiveSegment] = useState<'individuals' | 'enterprises' | 'institutions' | 'partners'>('individuals');
  
  // Custom Roadmap Builder State (User Specific: e.g. HR Manager @ 10L, VP Sales @ 28L)
  const [customCurrentRole, setCustomCurrentRole] = useState<string>('HR Manager');
  const [customCurrentCtc, setCustomCurrentCtc] = useState<number>(10);
  const [customTargetRole, setCustomTargetRole] = useState<string>('VP of People & Culture / CPO');
  const [customIndustry, setCustomIndustry] = useState<TransitionPath['industryCategory']>('HR, People Ops & Talent');
  const [customTimelineMonths, setCustomTimelineMonths] = useState<number>(4.5);
  const [activeCustomTransition, setActiveCustomTransition] = useState<TransitionPath | null>(null);

  // Pro Monetization & Workspace State
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isProUnlocked, setIsProUnlocked] = useState(false);
  const [proTierName, setProTierName] = useState<string>('');
  const [activeProTab, setActiveProTab] = useState<'checklist' | 'interview' | 'templates' | 'ats_resume' | 'recruiter'>('checklist');
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>({
    'm_0': true,
    'm_1': true
  });

  // Dropdown menus in header
  const [activeNavDropdown, setActiveNavDropdown] = useState<string | null>(null);
  const navDropdownRef = useRef<HTMLDivElement>(null);
  const selectDropdownRef = useRef<HTMLDivElement>(null);

  // Check stored Pro unlock status on mount
  useEffect(() => {
    try {
      const unlocked = localStorage.getItem('talentxcel_career_pro_unlocked') === 'true';
      const tier = localStorage.getItem('talentxcel_career_pro_tier') || '';
      setIsProUnlocked(unlocked);
      setProTierName(tier);
    } catch {}
  }, []);

  // Close header dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navDropdownRef.current && !navDropdownRef.current.contains(e.target as Node)) {
        setActiveNavDropdown(null);
      }
      if (selectDropdownRef.current && !selectDropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Resolve active Location configuration
  const activeLocationInfo = useMemo(() => {
    return LOCATION_TIERS.find(l => l.id === selectedLocationTier) || LOCATION_TIERS[0];
  }, [selectedLocationTier]);

  // Active Transition Data (Catalog vs Custom)
  const activeTransition: TransitionPath = useMemo(() => {
    if (navigatorMode === 'custom' && activeCustomTransition) {
      return activeCustomTransition;
    }
    return getTransitionById(selectedKey);
  }, [navigatorMode, activeCustomTransition, selectedKey]);

  // Location-adjusted CTC values
  const adjustedCurrentCtc = Math.round(activeTransition.currentAvgCtcLakhs * activeLocationInfo.multiplier * 10) / 10;
  const adjustedTargetCtc = Math.round(activeTransition.targetAvgCtcLakhs * activeLocationInfo.multiplier * 10) / 10;

  const ctcUpsidePercent = Math.round(
    ((adjustedTargetCtc - adjustedCurrentCtc) / adjustedCurrentCtc) * 100
  );

  // Multi-dimensional filtered transitions across all 152+ pathways
  const filteredTransitions = useMemo(() => {
    return filterCareerTransitionsMultiDimensional({
      query: searchQuery,
      category: selectedCategory,
      experienceLevel: selectedExperience,
      location: selectedLocationTier
    });
  }, [searchQuery, selectedCategory, selectedExperience, selectedLocationTier]);

  // Generate Custom Transition Blueprint
  const handleGenerateCustomBlueprint = () => {
    if (!customCurrentRole || !customTargetRole) {
      toast.error('Please enter both your Current Role and Target Role');
      return;
    }
    const generated = generateCustomCareerTransition({
      currentRole: customCurrentRole.trim(),
      currentAvgCtcLakhs: Number(customCurrentCtc) || 10,
      targetRole: customTargetRole.trim(),
      industryCategory: customIndustry,
      timeEstimateMonths: Number(customTimelineMonths) || 4
    });
    setActiveCustomTransition(generated);
    setNavigatorMode('custom');
    toast.success(`✨ Custom Career Transition Blueprint generated for ${generated.targetRole}!`);
  };

  const toggleMilestone = (key: string) => {
    if (!isProUnlocked) {
      setIsProModalOpen(true);
      return;
    }
    setCompletedMilestones(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast.success('Milestone progress updated!');
  };

  const handleCopyText = (text: string, label: string) => {
    if (!isProUnlocked) {
      setIsProModalOpen(true);
      return;
    }
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  const handleSaveRoadmap = () => {
    const check = checkEntitlement('career_milestone_tracking');
    if (check.requiresUpgrade) {
      openUpgradeModal('career_milestone_tracking');
      return;
    }
    toast.success('Roadmap saved! Create your account to track your weekly milestones.');
    navigate(`/auth/register?intent=save_roadmap&role=${encodeURIComponent(activeTransition.targetRole)}`);
  };

  const handleSegmentClick = (segment: 'individuals' | 'enterprises' | 'institutions' | 'partners') => {
    setActiveSegment(segment);
    if (segment === 'enterprises') {
      toast.info('Enterprise Upskilling: Connect with our workforce transition team.');
    } else if (segment === 'institutions') {
      toast.info('Institutional Readiness: View placement accelerator programs.');
    } else if (segment === 'partners') {
      toast.info('Partner Ecosystem: Co-branded certification and distribution.');
    }
  };

  const handleDownloadPdf = () => {
    if (!isProUnlocked) {
      setIsProModalOpen(true);
      return;
    }
    toast.success(`Generating PDF Blueprint for ${activeTransition.targetRole}...`);
    window.print();
  };

  // 16 Global Industries for the dropdown
  const INDUSTRY_SECTORS = [
    { name: 'Technology, Cloud & AI', icon: Cpu, count: '30+ Paths' },
    { name: 'Data Science & Big Data', icon: Brain, count: '15+ Paths' },
    { name: 'Finance, Banking & FinTech', icon: Coins, count: '20+ Paths' },
    { name: 'CA, Audit & Accounting', icon: BarChart3, count: '15+ Paths' },
    { name: 'Healthcare, Pharma & Biotech', icon: Stethoscope, count: '15+ Paths' },
    { name: 'Supply Chain, Logistics & Maritime', icon: Truck, count: '12+ Paths' },
    { name: 'Marketing, Growth & D2C', icon: Sparkles, count: '15+ Paths' },
    { name: 'Sales & Enterprise BD', icon: Target, count: '10+ Paths' },
    { name: 'Product Management & UX', icon: Layers, count: '15+ Paths' },
    { name: 'HR, People Ops & Talent', icon: Users, count: '10+ Paths' },
    { name: 'Legal, Governance & Tech Policy', icon: Scale, count: '10+ Paths' },
    { name: 'Core Engineering & Industrial IoT', icon: SlidersHorizontal, count: '12+ Paths' },
    { name: 'Energy, CleanTech & Oil/Gas', icon: Zap, count: '10+ Paths' },
    { name: 'Telecom, 5G & SpaceTech', icon: Radio, count: '8+ Paths' },
    { name: 'Real Estate & Infrastructure', icon: Building2, count: '8+ Paths' },
    { name: 'Media, Gaming & Content', icon: Tv, count: '10+ Paths' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex flex-col font-sans selection:bg-[#2563EB] selection:text-white">
      <Helmet>
        <title>Career Pathfinder — 150+ Multi-Industry Transition Blueprints | TalentXcel</title>
        <meta 
          name="description" 
          content="Engineer your next career move across 16 global industries. 150+ curated pathways and custom career roadmap builder for HR Managers, VP Sales, Engineers, and Executives." 
        />
        <link rel="canonical" href="https://careers.talentxcel.in/" />
      </Helmet>

      {/* ─────────────────────────────────────────────────────────────
          1. TOP BLACK UTILITY BAR (Single clean header matching mockup)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#0B0F19] text-white text-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-10 flex items-center justify-between gap-4">
          {/* Left Brand Identifier */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <TalentXcelLogo className="brightness-200" />
              <span className="text-[10px] font-black uppercase tracking-wider bg-[#2563EB] text-white px-2 py-0.5 rounded-md">
                Career Pathfinder
              </span>
            </Link>
          </div>

          {/* Center Links */}
          <div className="hidden lg:flex items-center gap-6 text-[11px] font-medium text-slate-300">
            <a 
              href={typeof window !== 'undefined' && window.location.hostname.includes('localhost') ? 'http://localhost:8080/network' : 'https://talentxcel.in/network'}
              className="hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Network</span>
            </a>
            <a 
              href={typeof window !== 'undefined' && window.location.hostname.includes('localhost') ? 'http://jobs.localhost:8080' : 'https://jobs.talentxcel.in'}
              className="hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Briefcase className="w-3.5 h-3.5 text-purple-400" />
              <span>Jobs</span>
            </a>
            <button 
              onClick={() => toast.info('Talent Sourcing: Browse verified profiles across 16 sectors.')}
              className="hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>Talent</span>
            </button>
            <a 
              href="https://learning.talentxcel.in"
              className="hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Reskilling</span>
            </a>
            <button 
              onClick={() => toast.info('Professional Communities: Join 40+ industry circles.')}
              className="hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span>Communities</span>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => setIsProModalOpen(true)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-md flex items-center gap-1 hover:brightness-110 transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3 h-3 fill-slate-950" />
              <span>Advance Pro (₹399–₹999)</span>
            </button>

            <button 
              onClick={() => toast.success('Next TalentX Virtual Career Summit: December 05, 2026. Registration confirmed!')}
              className="hidden sm:inline-flex bg-gradient-to-r from-[#2563EB] to-[#7138E8] text-white text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-full items-center gap-1 hover:opacity-95 transition-all shadow-xs cursor-pointer"
            >
              <span>Next TalentX (December 05)</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <Link to="/auth/login" className="text-slate-300 hover:text-white font-medium text-[11px] px-2 py-1 transition-colors">
              Log In
            </Link>
            <Link 
              to="/auth/register"
              className="hidden sm:inline-flex bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-[11px] px-3 py-1 rounded-lg transition-colors"
            >
              Join TalentXcel
            </Link>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. LIGHT SUB-BAR (Matching mockup)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#E2E8F0] text-xs">
        <div className="max-w-7xl mx-auto px-4 h-9 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[#475569] text-[11px] font-medium truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <strong className="text-[#111827] font-bold shrink-0">Career Pathfinder</strong>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="truncate hidden sm:inline">AI-Powered Career Roadmaps & Skill Gap Mitigation Blueprints Across 16 Industries</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-[11px] shrink-0 font-medium">
            <button 
              onClick={() => setPlatformSidebarOpen(true)}
              className="text-[#2563EB] hover:text-[#7138E8] font-bold flex items-center gap-1 cursor-pointer bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md transition-colors"
            >
              <Compass className="w-3 h-3 text-[#2563EB]" />
              <span>12 Products Local Index</span>
            </button>
            <a 
              href="https://passport.talentxcel.in" 
              className="text-[#475569] hover:text-[#111827] hidden md:inline transition-colors"
            >
              Career Passport
            </a>
            <a 
              href={typeof window !== 'undefined' && window.location.hostname.includes('localhost') ? 'http://localhost:8080/network' : 'https://talentxcel.in/network'} 
              className="text-[#475569] hover:text-[#111827] hidden md:inline transition-colors"
            >
              Professional Network
            </a>
            <button 
              onClick={() => {
                const el = document.getElementById('transition-navigator-card');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-[#2563EB] font-bold bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200 hidden sm:inline cursor-pointer"
            >
              AI Transition Navigator
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. PRIMARY WHITE NAVIGATION HEADER WITH FIXED DROPDOWNS
         ───────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-40 shadow-xs" ref={navDropdownRef}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Identity + Interactive Dropdown Navigation */}
          <div className="flex items-center gap-5 xl:gap-8">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <TalentXcelLogo />
              <span className="text-xs font-black tracking-wider uppercase px-2.5 py-0.5 rounded-md bg-[#2563EB] text-white shadow-2xs">
                CAREER PATHFINDER
              </span>
            </Link>

            {/* Dropdown Navigation Menu */}
            <nav className="hidden xl:flex items-center gap-5 text-xs font-semibold text-[#475569] relative">
              
              {/* 1. Platform Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setActiveNavDropdown(activeNavDropdown === 'platform' ? null : 'platform')}
                  className={`flex items-center gap-1 cursor-pointer transition-colors py-2 ${
                    activeNavDropdown === 'platform' ? 'text-[#2563EB] font-bold' : 'hover:text-[#111827]'
                  }`}
                >
                  <span>Platform</span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${activeNavDropdown === 'platform' ? 'rotate-180 text-[#2563EB]' : ''}`} />
                </button>

                {activeNavDropdown === 'platform' && (
                  <div 
                    style={{ width: '360px', minWidth: '360px', maxWidth: '90vw' }}
                    className="absolute top-full left-0 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 z-50 animate-in fade-in-50 slide-in-from-top-2"
                  >
                    <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      Platform Capabilities
                    </div>
                    <button 
                      onClick={() => {
                        setActiveNavDropdown(null);
                        const el = document.getElementById('transition-navigator-card');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl flex items-start gap-2.5 cursor-pointer"
                    >
                      <Target className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">AI Transition Navigator</div>
                        <div className="text-[10px] text-slate-500">150+ structured 12-16 week career roadmaps</div>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        setActiveNavDropdown(null);
                        setNavigatorMode('custom');
                        const el = document.getElementById('transition-navigator-card');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl flex items-start gap-2.5 cursor-pointer"
                    >
                      <Wand2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Custom Career Blueprint Builder</div>
                        <div className="text-[10px] text-slate-500">Build for your exact current role & salary</div>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        setActiveNavDropdown(null);
                        setPlatformSidebarOpen(true);
                      }}
                      className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl flex items-start gap-2.5 cursor-pointer"
                    >
                      <Layers className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">12 Platform Ecosystem</div>
                        <div className="text-[10px] text-slate-500">Explore unified recruitment & career OS</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* 2. Solutions Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setActiveNavDropdown(activeNavDropdown === 'solutions' ? null : 'solutions')}
                  className={`flex items-center gap-1 cursor-pointer transition-colors py-2 ${
                    activeNavDropdown === 'solutions' ? 'text-[#2563EB] font-bold' : 'hover:text-[#111827]'
                  }`}
                >
                  <span>Solutions</span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${activeNavDropdown === 'solutions' ? 'rotate-180 text-[#2563EB]' : ''}`} />
                </button>

                {activeNavDropdown === 'solutions' && (
                  <div 
                    style={{ width: '380px', minWidth: '380px', maxWidth: '90vw' }}
                    className="absolute top-full left-0 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 z-50 animate-in fade-in-50 slide-in-from-top-2"
                  >
                    <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      Tailored Transition Paths
                    </div>
                    <button 
                      onClick={() => {
                        setActiveNavDropdown(null);
                        setSelectedKey('hr_manager_to_vp_people');
                        setNavigatorMode('catalog');
                        const el = document.getElementById('transition-navigator-card');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl flex items-start gap-2.5 cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">HR Manager (₹10L) → VP of People</div>
                        <div className="text-[10px] text-slate-500">Executive People Ops, ESOPs & Board Advisory</div>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        setActiveNavDropdown(null);
                        setSelectedKey('vp_sales_to_cro');
                        setNavigatorMode('catalog');
                        const el = document.getElementById('transition-navigator-card');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl flex items-start gap-2.5 cursor-pointer"
                    >
                      <Target className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">VP Sales (₹28L) → Chief Revenue Officer</div>
                        <div className="text-[10px] text-slate-500">Global B2B GTM, Enterprise Channel & NDR Scale</div>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        setActiveNavDropdown(null);
                        setSelectedCategory('Technology, Cloud & AI');
                        setNavigatorMode('catalog');
                        const el = document.getElementById('transition-navigator-card');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl flex items-start gap-2.5 cursor-pointer"
                    >
                      <Cpu className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">For Tech & Software Engineers</div>
                        <div className="text-[10px] text-slate-500">QA to Full-Stack SDE, Cloud & Generative AI</div>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        setActiveNavDropdown(null);
                        handleSegmentClick('enterprises');
                      }}
                      className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl flex items-start gap-2.5 cursor-pointer"
                    >
                      <Building2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">For Enterprise Workforce Teams</div>
                        <div className="text-[10px] text-slate-500">Bulk internal mobility and role redeployment</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Products Dropdown (FIXED: Spacing, Width, Zero Overlapping) */}
              <div className="relative">
                <button 
                  onClick={() => setActiveNavDropdown(activeNavDropdown === 'products' ? null : 'products')}
                  className={`flex items-center gap-1 cursor-pointer transition-colors py-2 ${
                    activeNavDropdown === 'products' ? 'text-[#2563EB] font-bold' : 'hover:text-[#111827]'
                  }`}
                >
                  <span>Products</span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${activeNavDropdown === 'products' ? 'rotate-180 text-[#2563EB]' : ''}`} />
                </button>

                {activeNavDropdown === 'products' && (
                  <div 
                    style={{ width: '520px', minWidth: '520px', maxWidth: '90vw' }}
                    className="absolute top-full left-0 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in-50 slide-in-from-top-2"
                  >
                    <div className="flex items-center justify-between px-2 py-1 mb-2.5 border-b border-slate-100">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        TalentXcel Core Platforms
                      </span>
                      <span className="text-[10px] font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full">
                        Unified Ecosystem
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Link 
                        to="/" 
                        onClick={() => setActiveNavDropdown(null)} 
                        className="p-2.5 hover:bg-blue-50/60 rounded-xl text-left border border-blue-200 bg-blue-50/30 transition-colors"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Compass className="w-3.5 h-3.5 text-[#2563EB]" />
                          <div className="text-xs font-bold text-[#2563EB]">Career Pathfinder</div>
                        </div>
                        <div className="text-[10px] text-slate-500 leading-tight">Active • 150+ Roadmaps</div>
                      </Link>

                      <a 
                        href={typeof window !== 'undefined' && window.location.hostname.includes('localhost') ? 'http://jobs.localhost:8080' : 'https://jobs.talentxcel.in'} 
                        className="p-2.5 hover:bg-slate-50 rounded-xl text-left border border-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                          <div className="text-xs font-bold text-slate-900">JobMatch OS</div>
                        </div>
                        <div className="text-[10px] text-slate-500 leading-tight">2,250+ Verified Jobs</div>
                      </a>

                      <a 
                        href={typeof window !== 'undefined' && window.location.hostname.includes('localhost') ? 'http://resume.localhost:8080' : 'https://resume.talentxcel.in'} 
                        className="p-2.5 hover:bg-slate-50 rounded-xl text-left border border-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <FileText className="w-3.5 h-3.5 text-emerald-600" />
                          <div className="text-xs font-bold text-slate-900">ResumeStudio</div>
                        </div>
                        <div className="text-[10px] text-slate-500 leading-tight">ATS Score Optimization</div>
                      </a>

                      <a 
                        href={typeof window !== 'undefined' && window.location.hostname.includes('localhost') ? 'http://salary.localhost:8080' : 'https://salary.talentxcel.in'} 
                        className="p-2.5 hover:bg-slate-50 rounded-xl text-left border border-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Coins className="w-3.5 h-3.5 text-amber-600" />
                          <div className="text-xs font-bold text-slate-900">PayScale OS</div>
                        </div>
                        <div className="text-[10px] text-slate-500 leading-tight">Compensation Insights</div>
                      </a>

                      <a 
                        href="https://learning.talentxcel.in" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 hover:bg-slate-50 rounded-xl text-left border border-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                          <div className="text-xs font-bold text-slate-900">SkillPods LMS</div>
                        </div>
                        <div className="text-[10px] text-slate-500 leading-tight">Role-Based Courses</div>
                      </a>

                      <a 
                        href="https://passport.talentxcel.in" 
                        className="p-2.5 hover:bg-slate-50 rounded-xl text-left border border-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Award className="w-3.5 h-3.5 text-rose-600" />
                          <div className="text-xs font-bold text-slate-900">Career Passport</div>
                        </div>
                        <div className="text-[10px] text-slate-500 leading-tight">Verifiable Credentials</div>
                      </a>

                      <Link 
                        to="/ca-practice" 
                        onClick={() => setActiveNavDropdown(null)} 
                        className="p-2.5 hover:bg-slate-50 rounded-xl text-left border border-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                          <div className="text-xs font-bold text-slate-900">CA PracticeOS</div>
                        </div>
                        <div className="text-[10px] text-slate-500 leading-tight">Tax, Audit & Transfer Pricing</div>
                      </Link>

                      <Link 
                        to="/legal-practice" 
                        onClick={() => setActiveNavDropdown(null)} 
                        className="p-2.5 hover:bg-slate-50 rounded-xl text-left border border-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Scale className="w-3.5 h-3.5 text-sky-600" />
                          <div className="text-xs font-bold text-slate-900">Legal PracticeOS</div>
                        </div>
                        <div className="text-[10px] text-slate-500 leading-tight">Tech Privacy & Compliance</div>
                      </Link>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <button 
                        onClick={() => {
                          setActiveNavDropdown(null);
                          setPlatformSidebarOpen(true);
                        }}
                        className="w-full text-center py-2 text-xs font-bold text-[#2563EB] hover:bg-blue-50 rounded-xl cursor-pointer transition-colors"
                      >
                        View All 12 Products Local Index →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Industries Dropdown (16 Global Sectors) */}
              <div className="relative">
                <button 
                  onClick={() => setActiveNavDropdown(activeNavDropdown === 'industries' ? null : 'industries')}
                  className={`flex items-center gap-1 cursor-pointer transition-colors py-2 ${
                    activeNavDropdown === 'industries' ? 'text-[#2563EB] font-bold' : 'hover:text-[#111827]'
                  }`}
                >
                  <span>Industries</span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${activeNavDropdown === 'industries' ? 'rotate-180 text-[#2563EB]' : ''}`} />
                </button>

                {activeNavDropdown === 'industries' && (
                  <div 
                    style={{ width: '520px', minWidth: '520px', maxWidth: '90vw' }}
                    className="absolute top-full -left-12 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in-50 slide-in-from-top-2"
                  >
                    <div className="flex items-center justify-between px-2 py-1 mb-2 border-b border-slate-100">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        16 Global Industry Sectors
                      </span>
                      <span className="text-[10px] font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full">
                        150+ Pathways
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 max-h-80 overflow-y-auto">
                      {INDUSTRY_SECTORS.map((ind, idx) => {
                        const Icon = ind.icon;
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              setActiveNavDropdown(null);
                              setSelectedCategory(ind.name);
                              setNavigatorMode('catalog');
                              const el = document.getElementById('transition-navigator-card');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="text-left p-2 hover:bg-slate-50 rounded-xl flex items-center justify-between group cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#2563EB] shrink-0" />
                              <span className="text-xs font-semibold text-slate-800 group-hover:text-[#2563EB] truncate">
                                {ind.name}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                              {ind.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Resources Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setActiveNavDropdown(activeNavDropdown === 'resources' ? null : 'resources')}
                  className={`flex items-center gap-1 cursor-pointer transition-colors py-2 ${
                    activeNavDropdown === 'resources' ? 'text-[#2563EB] font-bold' : 'hover:text-[#111827]'
                  }`}
                >
                  <span>Resources</span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${activeNavDropdown === 'resources' ? 'rotate-180 text-[#2563EB]' : ''}`} />
                </button>

                {activeNavDropdown === 'resources' && (
                  <div 
                    style={{ width: '360px', minWidth: '360px', maxWidth: '90vw' }}
                    className="absolute top-full left-0 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 z-50 animate-in fade-in-50 slide-in-from-top-2"
                  >
                    <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      Career Transition Resources
                    </div>
                    <button 
                      onClick={() => {
                        setActiveNavDropdown(null);
                        const el = document.getElementById('transition-navigator-card');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl flex items-start gap-2.5 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">150+ Transition Roadmaps</div>
                        <div className="text-[10px] text-slate-500">Step-by-step 16-week execution blueprints</div>
                      </div>
                    </button>
                    <a 
                      href="/benchmarks/india-tech-salary-report-2026"
                      className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl flex items-start gap-2.5 block"
                    >
                      <BarChart3 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">India Salary Report 2026</div>
                        <div className="text-[10px] text-slate-500">Empirical CTC bands across 500+ roles</div>
                      </div>
                    </a>
                    <button 
                      onClick={() => {
                        setActiveNavDropdown(null);
                        setIsProModalOpen(true);
                      }}
                      className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl flex items-start gap-2.5 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Advance Pro Blueprint Suite</div>
                        <div className="text-[10px] text-slate-500">Checklists, PRDs & STAR questions</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Pricing Link (FIXED: Breathing room, separated from switcher tabs) */}
              <Link 
                to="/pricing" 
                className="hover:text-[#111827] transition-colors py-2 flex items-center gap-1.5 font-bold text-slate-700 mr-4"
              >
                <span>Pricing</span>
                <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-black tracking-wide shadow-2xs">
                  PRO
                </span>
              </Link>
            </nav>
          </div>

          {/* Right Product Switcher Tabs & CTAs */}
          <div className="flex items-center gap-2 sm:gap-3 pl-3 border-l border-slate-200/80">
            
            {/* Switcher Tabs */}
            <div className="hidden lg:flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-xl border border-[#E2E8F0] text-xs">
              <button
                onClick={() => {
                  const el = document.getElementById('transition-navigator-card');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-2.5 py-1 rounded-lg font-bold bg-white text-[#2563EB] shadow-2xs cursor-pointer"
              >
                Pathfinder
              </button>
              
              <a 
                href="https://learning.talentxcel.in" 
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 rounded-lg font-medium text-[#64748B] hover:text-[#111827] transition-colors flex items-center gap-0.5"
              >
                <span>SkillPods</span>
                <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
              </a>

              <Link 
                to="/ca-practice" 
                className="px-2 py-1 rounded-lg font-medium text-[#64748B] hover:text-[#111827] transition-colors"
              >
                CA Practice
              </Link>

              <Link 
                to="/legal-practice" 
                className="px-2 py-1 rounded-lg font-medium text-[#64748B] hover:text-[#111827] transition-colors"
              >
                Legal Practice
              </Link>

              {/* Services Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setActiveNavDropdown(activeNavDropdown === 'services' ? null : 'services')}
                  className="px-2 py-1 rounded-lg font-medium text-[#64748B] hover:text-[#111827] flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Services</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {activeNavDropdown === 'services' && (
                  <div 
                    style={{ width: '300px', minWidth: '300px', maxWidth: '90vw' }}
                    className="absolute top-full right-0 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in-50"
                  >
                    <Link to="/ca-practice" onClick={() => setActiveNavDropdown(null)} className="p-2 hover:bg-slate-50 rounded-lg block text-left">
                      <div className="text-xs font-bold text-slate-900">CA PracticeOS</div>
                      <div className="text-[10px] text-slate-500">Chartered Accountancy Advisory</div>
                    </Link>
                    <Link to="/legal-practice" onClick={() => setActiveNavDropdown(null)} className="p-2 hover:bg-slate-50 rounded-lg block text-left">
                      <div className="text-xs font-bold text-slate-900">Legal PracticeOS</div>
                      <div className="text-[10px] text-slate-500">Corporate & Privacy Counsel</div>
                    </Link>
                    <a href={typeof window !== 'undefined' && window.location.hostname.includes('localhost') ? 'http://localhost:8080/services' : 'https://talentxcel.in/services'} className="p-2 hover:bg-slate-50 rounded-lg block text-left">
                      <div className="text-xs font-bold text-slate-900">Professional Services Hub</div>
                      <div className="text-[10px] text-slate-500">Executive Search & Outplacement</div>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Log In Button */}
            <Link 
              to="/auth/login" 
              className="text-xs font-semibold text-[#475569] hover:text-[#111827] px-2 py-1 hidden sm:inline transition-colors"
            >
              Log In
            </Link>

            {/* Business Plan CTA */}
            <Button
              onClick={() => {
                toast.success('Enterprise Inquiry Received! Our workforce advisor will contact you within 24 hours.');
                navigate('/auth/register?intent=business_plan');
              }}
              className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] hover:opacity-95 text-white font-bold text-xs px-3 sm:px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Get Business Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          4. HERO SECTION WITH 3-COLUMN MOCKUP LAYOUT
         ───────────────────────────────────────────────────────────── */}
      <main className="flex-1">
        <section className="bg-gradient-to-b from-white via-white to-[#F8FAFC] border-b border-[#E2E8F0] px-4 pt-6 sm:pt-10 pb-12 overflow-hidden relative">
          
          {/* Centered Top Pill */}
          <div className="max-w-7xl mx-auto text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/90 border border-blue-200 text-[#2563EB] text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>AI-Powered Career, Talent & Learning Business Platform</span>
            </div>
          </div>

          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Visual Portrait with Floating Metric Badges */}
              <div className="lg:col-span-4 flex items-center justify-center relative order-2 lg:order-1">
                {/* Organic Lavender Glow */}
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-200/50 via-blue-100/40 to-indigo-100/60 rounded-[40px] blur-2xl transform -rotate-2 scale-95" />

                {/* Left Floating Metric Badges */}
                <div className="absolute -left-2 sm:left-4 top-4 z-20 space-y-2.5">
                  <div className="bg-white/95 backdrop-blur-md border border-[#E2E8F0] p-2.5 rounded-2xl shadow-lg flex items-center gap-2 text-xs">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
                      <Briefcase className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-[#64748B] font-semibold">Jobs</div>
                      <div className="text-xs font-extrabold text-[#111827]">1,200+</div>
                    </div>
                  </div>

                  <div className="bg-white/95 backdrop-blur-md border border-[#E2E8F0] p-2.5 rounded-2xl shadow-lg flex items-center gap-2 text-xs">
                    <div className="w-7 h-7 rounded-lg bg-purple-50 text-[#7138E8] flex items-center justify-center font-bold">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-[#64748B] font-semibold">Learners</div>
                      <div className="text-xs font-extrabold text-[#111827]">600+</div>
                    </div>
                  </div>

                  <div className="bg-white/95 backdrop-blur-md border border-[#E2E8F0] p-2.5 rounded-2xl shadow-lg flex items-center gap-2 text-xs">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-[#64748B] font-semibold">Partners</div>
                      <div className="text-xs font-extrabold text-[#111827]">26+</div>
                    </div>
                  </div>
                </div>

                {/* Professionals Image Container */}
                <div className="relative z-10 w-full max-w-[340px] sm:max-w-[380px] rounded-3xl overflow-hidden bg-white/80 border border-[#E2E8F0] shadow-xl">
                  <img 
                    src="/career-pathfinder-professionals.png" 
                    alt="TalentXcel Career Professionals" 
                    className="w-full h-auto object-cover object-center transform hover:scale-[1.02] transition-transform duration-300"
                    loading="eager"
                  />
                </div>
              </div>

              {/* Center Column: Primary Value Proposition */}
              <div className="lg:col-span-5 text-left space-y-5 order-1 lg:order-2">
                <div className="space-y-3">
                  <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black text-[#111827] tracking-tight leading-[1.12]">
                    Engineer Your Next Role. <br />
                    <span className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] bg-clip-text text-transparent">
                      Step-by-Step Transition Blueprints.
                    </span>
                  </h1>

                  <p className="text-sm sm:text-base text-[#475569] leading-relaxed font-normal">
                    A unified career, talent and learning platform for individuals, enterprises and institutions.
                    Get structured 12–16 week roadmaps across 16 global industries with real deliverables, compensation benchmarks and direct job bridges.
                  </p>
                </div>

                {/* Dual Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button
                    onClick={() => {
                      setNavigatorMode('catalog');
                      const el = document.getElementById('transition-navigator-card');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Explore 150+ Pathways</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setNavigatorMode('custom');
                      const el = document.getElementById('transition-navigator-card');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="border-blue-300 bg-blue-50/70 hover:bg-blue-100 text-[#2563EB] font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Wand2 className="w-4 h-4 text-[#2563EB]" />
                    <span>Build for My Role & Salary</span>
                  </Button>
                </div>

                {/* Live Platform Stats */}
                <div className="flex items-center gap-6 pt-2 text-xs text-[#64748B] font-semibold border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>150+ Verified Blueprints</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Executive Moves (₹10L to ₹80L)</span>
                  </div>
                </div>
              </div>

              {/* Right Column: 5 Value Checklist with Decorative Transition Arrow */}
              <div className="lg:col-span-3 flex flex-col justify-center relative order-3">
                <div className="relative bg-white/95 backdrop-blur-md border border-[#E2E8F0] p-5 sm:p-6 rounded-3xl shadow-xl shadow-blue-900/5 space-y-3.5 text-left">
                  
                  {/* Decorative curved transition arrow */}
                  <div className="absolute -top-6 -right-3 hidden xl:block pointer-events-none opacity-80">
                    <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                      <path 
                        d="M10 80 C 40 80, 80 50, 75 15" 
                        stroke="url(#arrowGradient)" 
                        strokeWidth="5" 
                        strokeLinecap="round" 
                        fill="none" 
                      />
                      <polygon points="75,5 85,20 65,20" fill="#7138E8" />
                      <defs>
                        <linearGradient id="arrowGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#2563EB" />
                          <stop offset="100%" stopColor="#7138E8" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                    Core Capabilities
                  </h3>

                  <div className="flex items-center gap-2.5 text-xs font-bold text-[#111827]">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <span>Multi-Industry Career Transition</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-bold text-[#111827]">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <span>Skill & Role Deficit Mapping</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-bold text-[#111827]">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <span>Resume & ATS Keyword Matrix</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-bold text-[#111827]">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <span>AI Job Matching on JobMatch OS</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-bold text-[#111827]">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <span>Career Passport & Verifiable Proof</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <button 
                      onClick={() => setIsProModalOpen(true)}
                      className="w-full text-center py-2 px-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl text-xs font-bold text-[#2563EB] hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Advance Pro Pass — ₹399 one-time</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            5. SEGMENT STRIP: "Built for Every Career Journey"
           ───────────────────────────────────────────────────────────── */}
        <section id="built-for-every-journey" className="max-w-7xl mx-auto px-4 -mt-6 relative z-20 mb-8">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="text-left shrink-0 pr-4 border-b md:border-b-0 md:border-r border-[#E2E8F0] pb-2 md:pb-0 w-full md:w-auto">
              <span className="text-xs font-black text-[#111827] uppercase tracking-wider block">
                Built for Every
              </span>
              <span className="text-sm font-black bg-gradient-to-r from-[#2563EB] to-[#7138E8] bg-clip-text text-transparent">
                Career Journey
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full flex-1">
              {/* Segment 1: Individuals */}
              <div 
                onClick={() => handleSegmentClick('individuals')}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                  activeSegment === 'individuals'
                    ? 'border-[#2563EB] bg-blue-50/60 shadow-2xs'
                    : 'border-[#E2E8F0] hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#2563EB] flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-xs font-bold text-[#111827] truncate">Individuals</div>
                  <div className="text-[10px] text-[#64748B] truncate">Plan • Learn • Get Hired</div>
                </div>
              </div>

              {/* Segment 2: Enterprises */}
              <div 
                onClick={() => handleSegmentClick('enterprises')}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                  activeSegment === 'enterprises'
                    ? 'border-[#2563EB] bg-blue-50/60 shadow-2xs'
                    : 'border-[#E2E8F0] hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-[#7138E8] flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-xs font-bold text-[#111827] truncate">Enterprises</div>
                  <div className="text-[10px] text-[#64748B] truncate">Hire • Upskill • Transition</div>
                </div>
              </div>

              {/* Segment 3: Institutions */}
              <div 
                onClick={() => handleSegmentClick('institutions')}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                  activeSegment === 'institutions'
                    ? 'border-[#2563EB] bg-blue-50/60 shadow-2xs'
                    : 'border-[#E2E8F0] hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-xs font-bold text-[#111827] truncate">Institutions</div>
                  <div className="text-[10px] text-[#64748B] truncate">Readiness • Placement</div>
                </div>
              </div>

              {/* Segment 4: Partners */}
              <div 
                onClick={() => handleSegmentClick('partners')}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                  activeSegment === 'partners'
                    ? 'border-[#2563EB] bg-blue-50/60 shadow-2xs'
                    : 'border-[#E2E8F0] hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Handshake className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-xs font-bold text-[#111827] truncate">Partners</div>
                  <div className="text-[10px] text-[#64748B] truncate">Distribution • Co-brand</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            6. ADVANCE PRO VERSION BANNER (₹399 to ₹999 One-Time)
           ───────────────────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 mb-6">
          <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] border border-amber-500/40 rounded-2xl p-4 sm:p-5 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-start gap-3.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-black">
                <Sparkles className="w-5 h-5 fill-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                    Advance Pro Version
                  </span>
                  {isProUnlocked ? (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      UNLOCKED ({proTierName || 'Pro'})
                    </span>
                  ) : (
                    <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      ₹399 to ₹999 One-Time
                    </span>
                  )}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                  Real Value Suite: Interactive Deliverables, 50+ STAR Interview Answers & Recruiter Priority
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Includes full project templates, Excel financial models, ATS resume bullets, and verified candidate badge for 1,200+ partner recruiters.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
              {isProUnlocked ? (
                <Button
                  onClick={handleDownloadPdf}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer w-full md:w-auto justify-center"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Pro PDF Roadmap</span>
                </Button>
              ) : (
                <Button
                  onClick={() => setIsProModalOpen(true)}
                  className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Unlock Advance Pro (from ₹399)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            7. INTERACTIVE FEATURE BLOCK: "Career Transition Navigator"
               (150+ PATHWAYS + CUSTOMIZABLE MODE FOR HR MANAGER @ 10L, VP SALES, ETC.)
           ───────────────────────────────────────────────────────────── */}
        <section id="transition-navigator-card" className="max-w-7xl mx-auto px-4 pb-12 text-left">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 sm:p-7 shadow-lg shadow-blue-900/5 space-y-6">
            
            {/* Mode Switcher Tabs: Curated 150+ vs Custom Role Builder */}
            
            {/* Multi-Dimensional Filter Bar (Experience Level, Geography / Market & Quick Industries) */}
            <div className="bg-gradient-to-r from-slate-50 via-blue-50/20 to-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3.5">
              
              {/* Row 1: Seniority Experience & Location Controls */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
                {/* Experience Level Selector */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-slate-700 flex items-center gap-1 text-[11px] mr-1">
                    <Award className="w-3.5 h-3.5 text-blue-600" />
                    Experience Level:
                  </span>
                  {EXPERIENCE_LEVELS.map((lvl) => (
                    <button
                      key={lvl.id}
                      onClick={() => {
                        setSelectedExperience(lvl.id);
                        setNavigatorMode('catalog');
                      }}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                        selectedExperience === lvl.id
                          ? 'bg-[#2563EB] text-white shadow-2xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>

                {/* Location / Geography Tier Selector */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-slate-700 flex items-center gap-1 text-[11px] mr-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    Target Market:
                  </span>
                  {LOCATION_TIERS.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => setSelectedLocationTier(loc.id)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                        selectedLocationTier === loc.id
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {loc.badge}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 2: 16 Industry Sectors Filter Strip */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                  <span className="flex items-center gap-1">
                    <Filter className="w-3 h-3 text-purple-600" />
                    Filter by Industry Sector (16 Global Industries):
                  </span>
                  <span className="text-[#2563EB] font-bold">
                    {filteredTransitions.length} Pathways Available
                  </span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-semibold no-scrollbar">
                  {CAREER_INDUSTRIES.map((ind) => (
                    <button
                      key={ind}
                      onClick={() => {
                        setSelectedCategory(ind);
                        setNavigatorMode('catalog');
                      }}
                      className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                        selectedCategory === ind
                          ? 'bg-[#2563EB] text-white font-bold shadow-2xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 3: Active Location Status */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-1.5 text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span>Market CTC Benchmark: <strong className="text-slate-900">{activeLocationInfo.label}</strong> ({activeLocationInfo.cities})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-500">Regional Parity Index:</span>
                  <span className="font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {activeLocationInfo.multiplier}x Standard Benchmark
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-fit">
                <button
                  onClick={() => setNavigatorMode('catalog')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    navigatorMode === 'catalog'
                      ? 'bg-white text-[#2563EB] shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📚 Browse 150+ Curated Pathways
                </button>
                <button
                  onClick={() => setNavigatorMode('custom')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    navigatorMode === 'custom'
                      ? 'bg-gradient-to-r from-[#2563EB] to-[#7138E8] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>⚡ Build for My Role & Salary</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-500">
                  {navigatorMode === 'catalog' ? 'Showing 150+ verified pathways across 16 sectors' : 'Personalized AI Transition Engine'}
                </span>
              </div>
            </div>

            {/* Custom Mode Input Form (When User clicks "Build for My Role & Salary") */}
            {navigatorMode === 'custom' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-purple-50/70 border border-blue-200 space-y-4 animate-in fade-in-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#2563EB]" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Personalized Career Transition Blueprint Builder
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                    Custom Seniority Engine
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {/* Current Role */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      My Current Role
                    </label>
                    <input 
                      type="text"
                      value={customCurrentRole}
                      onChange={(e) => setCustomCurrentRole(e.target.value)}
                      placeholder="e.g. HR Manager, VP Sales, Tech Lead"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {['HR Manager', 'VP Sales', 'Operations Lead', 'Senior CA'].map((pill) => (
                        <button
                          key={pill}
                          onClick={() => {
                            setCustomCurrentRole(pill);
                            if (pill === 'HR Manager') {
                              setCustomCurrentCtc(10);
                              setCustomTargetRole('VP of People & Culture / CPO');
                              setCustomIndustry('HR, People Ops & Talent');
                            } else if (pill === 'VP Sales') {
                              setCustomCurrentCtc(28);
                              setCustomTargetRole('Chief Revenue Officer (CRO)');
                              setCustomIndustry('Sales & Enterprise BD');
                            } else if (pill === 'Operations Lead') {
                              setCustomCurrentCtc(12);
                              setCustomTargetRole('Director of Global Supply Chain');
                              setCustomIndustry('Supply Chain, Logistics & Maritime');
                            } else if (pill === 'Senior CA') {
                              setCustomCurrentCtc(14);
                              setCustomTargetRole('Chief Financial Officer (CFO)');
                              setCustomIndustry('CA, Audit & Accounting');
                            }
                          }}
                          className="text-[9px] bg-white hover:bg-blue-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                        >
                          {pill}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Current Annual CTC */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Current Annual CTC (₹ Lakhs)
                    </label>
                    <div className="relative">
                      <input 
                        type="number"
                        min="2"
                        max="200"
                        value={customCurrentCtc}
                        onChange={(e) => setCustomCurrentCtc(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-extrabold focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                        ₹ Lakhs
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1.5">
                      {[6, 10, 15, 25, 35].map((val) => (
                        <button
                          key={val}
                          onClick={() => setCustomCurrentCtc(val)}
                          className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                            customCurrentCtc === val 
                              ? 'bg-[#2563EB] text-white border-[#2563EB] font-bold' 
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          ₹{val}L
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Target Role Ambition */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Target Executive / Senior Role
                    </label>
                    <input 
                      type="text"
                      value={customTargetRole}
                      onChange={(e) => setCustomTargetRole(e.target.value)}
                      placeholder="e.g. VP People, CRO, CFO, CTO"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    />
                    <div className="text-[10px] text-slate-500 mt-1">
                      Benchmark: Target CTC ~₹{Math.round(customCurrentCtc * 2.2 * 10) / 10}L (+120%)
                    </div>
                  </div>

                  {/* Generate Button */}
                  <div className="flex items-end">
                    <Button
                      onClick={handleGenerateCustomBlueprint}
                      className="w-full bg-gradient-to-r from-[#2563EB] to-[#7138E8] hover:opacity-95 text-white font-bold text-xs h-10 rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate My Blueprint</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Catalog Mode Header + Search Dropdown */}
            {navigatorMode === 'catalog' && (
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                      <Target className="w-4 h-4" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-[#111827]">
                      Career Transition Navigator
                    </h2>
                    <Badge variant="outline" className="text-[10px] font-bold text-[#2563EB] bg-blue-50 border-blue-200">
                      150+ Pathways
                    </Badge>
                    <Badge variant="outline" className="text-[10px] font-bold text-purple-700 bg-purple-50 border-purple-200">
                      16 Industries
                    </Badge>
                  </div>
                  <p className="text-xs text-[#64748B]">
                    Select from 150+ high-demand career pathways or search specifically for your seniority level.
                  </p>
                </div>

                {/* Interactive Searchable Transition Selector */}
                <div className="w-full lg:w-[480px] shrink-0 relative" ref={selectDropdownRef}>
                  <div 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full bg-[#F8FAFC] hover:bg-slate-50 border border-[#CBD5E1] hover:border-[#2563EB] text-xs font-bold text-[#111827] h-11 px-3.5 rounded-xl flex items-center justify-between cursor-pointer transition-all shadow-2xs"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="text-[#2563EB]">⇄</span>
                      <span className="truncate">
                        {activeTransition.currentRole} → <strong className="text-slate-900">{activeTransition.targetRole}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        +{ctcUpsidePercent}%
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180 text-[#2563EB]' : ''}`} />
                    </div>
                  </div>

                  {/* Dropdown Popover */}
                  {isDropdownOpen && (
                    <div 
                      style={{ width: '540px', minWidth: '320px', maxWidth: '95vw' }}
                      className="absolute top-full right-0 mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 z-50 animate-in fade-in-50 slide-in-from-top-2"
                    >
                      
                      {/* Search Input */}
                      <div className="relative mb-2.5">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                          type="text" 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search 150+ transitions (e.g. HR Manager, VP Sales, SDE, CA, SCM)..."
                          className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                          autoFocus
                        />
                        {searchQuery && (
                          <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Category Filter Chips */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 border-b border-slate-100 text-[10px] font-semibold no-scrollbar">
                        {['All', 'HR, People Ops & Talent', 'Sales & Enterprise BD', 'Technology, Cloud & AI', 'Finance, Banking & FinTech', 'CA, Audit & Accounting', 'Healthcare, Pharma & Biotech', 'Supply Chain, Logistics & Maritime', 'Product Management & UX'].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                              selectedCategory === cat 
                                ? 'bg-[#2563EB] text-white font-bold' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {cat.split(' ')[0]}
                          </button>
                        ))}
                      </div>

                      {/* Results Counter */}
                      <div className="flex items-center justify-between px-1 py-1 text-[10px] text-slate-500 font-medium">
                        <span>Showing {filteredTransitions.length} of {CAREER_TRANSITIONS_CATALOG.length} verified transitions</span>
                        <span className="text-[#2563EB] font-bold">16 Industries</span>
                      </div>

                      {/* Transition Item List */}
                      <div className="max-h-72 overflow-y-auto space-y-1 mt-1 pr-1">
                        {filteredTransitions.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">
                            No transitions found matching "{searchQuery}". Try switching to "Build for My Role & Salary".
                          </div>
                        ) : (
                          filteredTransitions.map((item) => {
                            const isSelected = selectedKey === item.id;
                            const upside = Math.round(((item.targetAvgCtcLakhs - item.currentAvgCtcLakhs) / item.currentAvgCtcLakhs) * 100);
                            return (
                              <button
                                key={item.id}
                                onClick={() => {
                                  setSelectedKey(item.id);
                                  setIsDropdownOpen(false);
                                }}
                                className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between gap-2 cursor-pointer ${
                                  isSelected 
                                    ? 'bg-blue-50 border border-blue-200 shadow-2xs' 
                                    : 'hover:bg-slate-50 border border-transparent'
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 truncate">
                                    <span>{item.currentRole}</span>
                                    <span className="text-[#2563EB]">→</span>
                                    <span className="text-[#2563EB] truncate">{item.targetRole}</span>
                                    {item.experienceLevel && (
                                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                                        {item.experienceLevel}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                    <span className="truncate">{item.industryCategory}</span>
                                    <span>•</span>
                                    <span>{item.timeEstimateMonths} Mo</span>
                                    <span>•</span>
                                    <span>₹{Math.round(item.currentAvgCtcLakhs * activeLocationInfo.multiplier * 10)/10}L → ₹{Math.round(item.targetAvgCtcLakhs * activeLocationInfo.multiplier * 10)/10}L CTC</span>
                                  </div>
                                </div>

                                <div className="shrink-0 text-right">
                                  <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    +{upside}%
                                  </span>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4 Summary KPI Cards (matching mockup) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
              {/* KPI 1: Current Role */}
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-[#64748B] block">Current Baseline</span>
                <span className="text-sm font-extrabold text-[#111827] block truncate">
                  {activeTransition.currentRole}
                </span>
                <span className="text-xs font-semibold text-[#64748B] block">
                  {activeLocationInfo.currencyPrefix}{adjustedCurrentCtc}{activeLocationInfo.currencySuffix}
                </span>
              </div>

              {/* KPI 2: Target Role */}
              <div className="space-y-0.5 border-l border-slate-200 pl-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-[#2563EB] block">Target Role</span>
                  <Badge variant="outline" className="text-[9px] font-bold text-[#2563EB] bg-blue-50 border-blue-200 py-0">
                    {activeTransition.industry}
                  </Badge>
                </div>
                <span className="text-sm font-extrabold text-[#111827] block truncate">
                  {activeTransition.targetRole}
                </span>
                <span className="text-xs font-bold text-emerald-700 block">
                  {activeLocationInfo.currencyPrefix}{adjustedTargetCtc}{activeLocationInfo.currencySuffix}
                </span>
              </div>

              {/* KPI 3: Estimated Timeline */}
              <div className="space-y-0.5 border-l border-slate-200 pl-3">
                <span className="text-[11px] font-bold text-[#64748B] block">Execution Timeline</span>
                <div className="flex items-center gap-1.5 text-sm font-extrabold text-[#111827]">
                  <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>{activeTransition.timeEstimateMonths} Months</span>
                </div>
                <span className="text-xs font-semibold text-[#64748B] block">
                  12–16 Weeks Effort
                </span>
              </div>

              {/* KPI 4: Compensation Upside */}
              <div className="space-y-0.5 border-l border-slate-200 pl-3">
                <span className="text-[11px] font-bold text-[#64748B] block">Compensation Upside</span>
                <span className="text-sm font-black text-emerald-700 block">
                  +{ctcUpsidePercent}% Upside
                </span>
                <Badge variant="outline" className="text-[10px] text-[#2563EB] border-blue-200 bg-blue-50 py-0 font-bold">
                  {activeTransition.difficulty}
                </Badge>
              </div>
            </div>

            {/* Core Skill Deficits to Bridge */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-[#2563EB]" />
                  <h3 className="text-xs font-extrabold text-[#111827] uppercase tracking-wider">
                    Primary Skill Deficits to Bridge ({activeTransition.coreSkillGaps.length})
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500">
                  Targeted learning paths mapped on SkillPods
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {activeTransition.coreSkillGaps.map((gap, i) => (
                  <span 
                    key={i} 
                    className="px-3 py-1.5 rounded-xl bg-purple-50/80 border border-purple-200 text-[#7138E8] text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#7138E8]"></span>
                    <span>{gap}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* 3-Phase Execution Roadmap */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#2563EB]" />
                  <h3 className="text-xs font-extrabold text-[#111827] uppercase tracking-wider">
                    Milestone Execution Blueprint (12–16 Weeks)
                  </h3>
                </div>
                
                <div className="flex items-center gap-2">
                  {isProUnlocked ? (
                    <Button
                      size="sm"
                      onClick={handleDownloadPdf}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-3 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>PDF Roadmap</span>
                    </Button>
                  ) : (
                    <button 
                      onClick={() => setIsProModalOpen(true)}
                      className="text-[11px] font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Lock className="w-3 h-3 text-amber-600" />
                      <span>Unlock Pro Suite (₹399)</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeTransition.phases.map((phase, idx) => (
                  <div 
                    key={idx} 
                    className="bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#2563EB] rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all shadow-2xs group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          {phase.weeks}
                        </span>
                        <span className="h-6 w-6 rounded-full bg-white border border-[#E2E8F0] group-hover:border-[#2563EB] flex items-center justify-center text-xs font-black text-[#2563EB] shadow-2xs">
                          {idx + 1}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#111827] leading-snug">
                        {phase.title}
                      </h4>
                      <p className="text-xs text-[#64748B] pt-0.5 leading-relaxed">
                        {phase.focus}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#E2E8F0] mt-3 space-y-1.5">
                      <span className="text-[11px] font-bold text-[#111827] block">Key Deliverables:</span>
                      <ul className="space-y-1.5 text-xs text-[#475569]">
                        {phase.milestones.map((m, mIdx) => (
                          <li key={mIdx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="leading-snug">{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                8. ADVANCE PRO VALUE SUITE WORKSPACE (MASSIVE VALUE FOR ₹399-₹999)
               ───────────────────────────────────────────────────────────── */}
            <div className="mt-6 border-t border-slate-200 pt-6">
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
                
                {/* Header with Pro Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                      <Sparkles className="w-5 h-5 fill-slate-950" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-white">
                          Advance Pro Deliverables Workspace
                        </h3>
                        {isProUnlocked ? (
                          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-black px-2 py-0.5 rounded-md">
                            ACTIVE PRO SUITE
                          </span>
                        ) : (
                          <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            PREVIEW (Unlock for ₹399–₹999)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300">
                        Interactive deliverables, STAR interview answers, ATS keywords & priority recruiter dispatch.
                      </p>
                    </div>
                  </div>

                  {!isProUnlocked && (
                    <Button
                      onClick={() => setIsProModalOpen(true)}
                      className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Unlock Full Suite</span>
                    </Button>
                  )}
                </div>

                {/* 4 Workspace Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 text-xs font-bold no-scrollbar">
                  <button
                    onClick={() => setActiveProTab('checklist')}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      activeProTab === 'checklist' 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-300 hover:text-white bg-white/5'
                    }`}
                  >
                    <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                    <span>Interactive Milestones Checklist</span>
                  </button>

                  <button
                    onClick={() => setActiveProTab('interview')}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      activeProTab === 'interview' 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-300 hover:text-white bg-white/5'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
                    <span>50+ STAR Interview Questions & Answers</span>
                  </button>

                  <button
                    onClick={() => setActiveProTab('templates')}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      activeProTab === 'templates' 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-300 hover:text-white bg-white/5'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Production Templates & Executive Models Kit</span>
                  </button>

                  <button
                    onClick={() => setActiveProTab('ats_resume')}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      activeProTab === 'ats_resume' 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-300 hover:text-white bg-white/5'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>ATS Resume Bullets & Keyword Matrix</span>
                  </button>

                  <button
                    onClick={() => setActiveProTab('recruiter')}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      activeProTab === 'recruiter' 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-300 hover:text-white bg-white/5'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                    <span>Verified Recruiter Fast-Track Dispatch</span>
                  </button>
                </div>

                {/* Tab Content 1: Interactive Checklist */}
                {activeProTab === 'checklist' && (
                  <div className="pt-4 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Weekly Execution Checklist for {activeTransition.targetRole}:</span>
                      <span className="font-bold text-amber-300">
                        {Object.values(completedMilestones).filter(Boolean).length} of 9 Deliverables Completed
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {activeTransition.phases.flatMap((phase, pIdx) => 
                        phase.milestones.map((m, mIdx) => {
                          const key = `m_${pIdx}_${mIdx}`;
                          const isDone = Boolean(completedMilestones[key]);
                          return (
                            <div 
                              key={key}
                              onClick={() => toggleMilestone(key)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                                isDone 
                                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
                                  : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-300'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                                isDone ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-black' : 'border-slate-500'
                              }`}>
                                {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span className="text-xs leading-relaxed">{m}</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* Tab Content 2: STAR Interview Questions & Answers */}
                {activeProTab === 'interview' && (
                  <div className="pt-4 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>High-Scoring STAR Interview Answers for {activeTransition.targetRole}:</span>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-400/30">
                        Top 50 Interview Bank
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-300">
                            Q1: How do you establish strategic alignment and quantify business ROI in this role?
                          </span>
                          <button 
                            onClick={() => handleCopyText('STAR Model Answer: Situation: Faced with cross-departmental misalignment...', 'STAR Answer')}
                            className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy Answer</span>
                          </button>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          <strong>Situation:</strong> In my previous role at a high-growth business, cross-functional goals lacked unified revenue and talent metrics. <br />
                          <strong>Task:</strong> Tasked with aligning departmental KPIs with board-level EBITDA objectives. <br />
                          <strong>Action:</strong> Implemented a weekly cadence model with automated dashboards, linking lead-lag indicators to capital allocation. <br />
                          <strong>Result:</strong> Delivered a 24% reduction in operating friction and increased annual gross margin retention by 140 bps.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-300">
                            Q2: How do you handle high-stakes stakeholder pushback during organizational transitions?
                          </span>
                          <button 
                            onClick={() => handleCopyText('STAR Model Answer: Situation: Leadership pushback on compensation and performance calibrations...', 'STAR Answer')}
                            className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy Answer</span>
                          </button>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          <strong>Situation:</strong> Senior department leads resisted adopting new governance guidelines. <br />
                          <strong>Task:</strong> Secure 100% voluntary buy-in without compromising compliance standards. <br />
                          <strong>Action:</strong> Conducted individual executive discovery sessions, quantified the cost of regulatory inaction, and co-designed a staged adoption roadmap. <br />
                          <strong>Result:</strong> Achieved unanimous board approval within 30 days and 0% executive departure.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Content: Production Templates & Working Documents Kit */}
                {activeProTab === 'templates' && (
                  <div className="pt-4 space-y-3 text-left">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Executive Deliverables & Production Templates Kit for {activeTransition.targetRole}:</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30 font-bold">
                        Verified Working Assets
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Template 1: Financial & Budget Model */}
                      <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                              <FileSpreadsheet className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-white">
                                {activeTransition.industryCategory.includes('HR')
                                  ? 'Annual Headcount & ESOP Pool Budget Model 2026'
                                  : (activeTransition.industryCategory.includes('Sales')
                                    ? 'Global B2B GTM Quota & Territory Capacity Model'
                                    : (activeTransition.industryCategory.includes('Finance') || activeTransition.industryCategory.includes('CA')
                                      ? '3-Statement LBO & EBITDA Sensitivity Model'
                                      : (activeTransition.industryCategory.includes('Supply')
                                        ? 'ARIMA Demand Forecasting & Safety Stock Workbook'
                                        : 'Operating Capex & System Capacity Model')))}
                              </h5>
                              <span className="text-[10px] text-slate-400">Microsoft Excel (.xlsx) • Dynamic formulas included</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Complete pre-configured analytical spreadsheet with variable input switches, automated sensitivity checks, and executive dashboard summary tabs.
                        </p>
                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-[10px] text-emerald-400 font-semibold">Ready to Use</span>
                          <button
                            onClick={() => {
                              if (!isProUnlocked) {
                                setIsProModalOpen(true);
                              } else {
                                toast.success('Template downloaded! Ready for executive presentation.');
                              }
                            }}
                            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Model</span>
                          </button>
                        </div>
                      </div>

                      {/* Template 2: Executive Playbook & Framework */}
                      <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-white">
                                {activeTransition.industryCategory.includes('HR')
                                  ? '9-Box Performance Grid & Succession Policy'
                                  : (activeTransition.industryCategory.includes('Sales')
                                    ? 'Enterprise MEDDPICC Deal Qualification Playbook'
                                    : (activeTransition.industryCategory.includes('Finance') || activeTransition.industryCategory.includes('CA')
                                      ? 'Transfer Pricing Local File & Statutory Audit Checklist'
                                      : (activeTransition.industryCategory.includes('Supply')
                                        ? 'Global S&OP Consensus Protocol & Incoterms 2020 Guide'
                                        : 'Production RFC Architecture Specification')))}
                              </h5>
                              <span className="text-[10px] text-slate-400">Executive Playbook (.docx / PDF)</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Enterprise-grade operating framework containing complete governance policies, stakeholder review cadences, and approval sign-off rubrics.
                        </p>
                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-[10px] text-blue-400 font-semibold">Governance Approved</span>
                          <button
                            onClick={() => {
                              if (!isProUnlocked) {
                                setIsProModalOpen(true);
                              } else {
                                toast.success('Playbook downloaded! Ready for executive presentation.');
                              }
                            }}
                            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Playbook</span>
                          </button>
                        </div>
                      </div>

                      {/* Template 3: Board / C-Suite Presentation Deck Outline */}
                      <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                              <Tv className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-white">
                                Board of Directors Strategy Presentation (16-Slide Master)
                              </h5>
                              <span className="text-[10px] text-slate-400">PowerPoint Deck (.pptx) • Boardroom calibrated</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Presentation deck covering strategic objectives, ROI justifications, cross-functional risk matrices, and quarterly execution milestones.
                        </p>
                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-[10px] text-purple-400 font-semibold">C-Suite Ready</span>
                          <button
                            onClick={() => {
                              if (!isProUnlocked) {
                                setIsProModalOpen(true);
                              } else {
                                toast.success('Board Deck downloaded! Ready for executive presentation.');
                              }
                            }}
                            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Deck</span>
                          </button>
                        </div>
                      </div>

                      {/* Template 4: STAR Interview Challenge Script */}
                      <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                              <Award className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-white">
                                50+ Role-Specific STAR Interview Guide with Model Responses
                              </h5>
                              <span className="text-[10px] text-slate-400">Executive Interview Guide (.pdf)</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Exhaustive interview response bank with real situation, task, action, and quantifiable business metric results tailored to {activeTransition.targetRole}.
                        </p>
                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-[10px] text-amber-400 font-semibold">High-Scoring</span>
                          <button
                            onClick={() => {
                              if (!isProUnlocked) {
                                setIsProModalOpen(true);
                              } else {
                                toast.success('STAR Guide downloaded! Ready for executive presentation.');
                              }
                            }}
                            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Guide</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Content 3: ATS Resume Bullets & Keyword Matrix */}
                {activeProTab === 'ats_resume' && (
                  <div className="pt-4 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Ready-to-Use High-Impact Bullets Tailored for {activeTransition.targetRole}:</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30">
                        ATS 98%+ Pass Rate
                      </span>
                    </div>

                    <div className="space-y-2">
                      {[
                        `Architected end-to-end strategic execution playbook for ${activeTransition.targetRole}, resulting in ₹3.2 Cr annual efficiency savings across 8 functional business units.`,
                        `Spearheaded cross-functional transformation initiative, reducing cycle times by 38% and presenting verified progress updates directly to the executive board.`,
                        `Designed predictive analytics and risk mitigation frameworks, cutting operational error rates by 42% while managing high-stake corporate stakeholder relationships.`
                      ].map((bullet, bIdx) => (
                        <div key={bIdx} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start justify-between gap-3 text-left">
                          <p className="text-xs text-slate-200 leading-relaxed font-mono">
                            • {bullet}
                          </p>
                          <button
                            onClick={() => handleCopyText(bullet, 'Resume Bullet')}
                            className="text-xs font-semibold text-amber-400 hover:text-amber-300 shrink-0 flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab Content 4: Verified Recruiter Dispatch */}
                {activeProTab === 'recruiter' && (
                  <div className="pt-4 space-y-3 text-left">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-emerald-400" />
                          <h4 className="text-sm font-bold text-white">
                            JobMatch OS Priority Recruiter Routing
                          </h4>
                        </div>
                        <p className="text-xs text-slate-300 max-w-xl">
                          As an Advance Pro subscriber, your candidate profile is marked with the <strong>TalentXcel Verified Transition Candidate</strong> badge, placing you at the top of recruiter searches across 1,200+ partner companies.
                        </p>
                      </div>

                      <div className="text-center sm:text-right shrink-0">
                        <div className="text-xs font-bold text-emerald-400">Status: Fast-Track Ready</div>
                        <div className="text-[10px] text-slate-400">1,200+ Live Recruiter Search Partners</div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Bottom Conversion Card */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-sm sm:text-base font-bold text-[#111827]">
                  Save This Roadmap to Your Career Profile
                </h4>
                <p className="text-xs text-[#64748B]">
                  Track weekly milestones, access role-based diagnostics on SkillPods, and receive matched job openings directly on JobMatch OS.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Button
                  size="sm"
                  onClick={handleSaveRoadmap}
                  className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] hover:opacity-95 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Save My Roadmap</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            9. "OUR BUSINESS PORTFOLIO" STRIP (Matching mockup)
           ───────────────────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 pb-12 text-left">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-black text-[#111827]">Our Business Portfolio</h2>
              <p className="text-xs text-[#64748B]">An integrated suite to build, hire, upskill and grow talent.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Product 1: Career Pathfinder */}
              <div className="bg-white border border-[#2563EB] p-3.5 rounded-2xl shadow-xs text-left space-y-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#111827]">Career Pathfinder</h4>
                  <p className="text-[10px] text-[#64748B] mt-0.5">AI Career Transition</p>
                </div>
              </div>

              {/* Product 2: Talent Network */}
              <a 
                href={typeof window !== 'undefined' && window.location.hostname.includes('localhost') ? 'http://localhost:8080/network' : 'https://talentxcel.in/network'}
                className="bg-white border border-[#E2E8F0] hover:border-slate-300 p-3.5 rounded-2xl shadow-xs text-left space-y-2 transition-all block"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7138E8] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#111827]">Talent Network</h4>
                  <p className="text-[10px] text-[#64748B] mt-0.5">Verified Professionals</p>
                </div>
              </a>

              {/* Product 3: SkillPods */}
              <a 
                href="https://learning.talentxcel.in"
                className="bg-white border border-[#E2E8F0] hover:border-slate-300 p-3.5 rounded-2xl shadow-xs text-left space-y-2 transition-all block"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#111827]">SkillPods</h4>
                  <p className="text-[10px] text-[#64748B] mt-0.5">Role-based Learning</p>
                </div>
              </a>

              {/* Product 4: Career Passport */}
              <a 
                href="https://passport.talentxcel.in"
                className="bg-white border border-[#E2E8F0] hover:border-slate-300 p-3.5 rounded-2xl shadow-xs text-left space-y-2 transition-all block"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#111827]">Career Passport</h4>
                  <p className="text-[10px] text-[#64748B] mt-0.5">Lifelong Career Identity</p>
                </div>
              </a>

              {/* Product 5: AI Transition Navigator */}
              <div 
                onClick={() => {
                  const el = document.getElementById('transition-navigator-card');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white border border-[#E2E8F0] hover:border-slate-300 p-3.5 rounded-2xl shadow-xs text-left space-y-2 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#111827]">AI Transition Navigator</h4>
                  <p className="text-[10px] text-[#64748B] mt-0.5">Role & Skill Mapping</p>
                </div>
              </div>

              {/* Product 6: More Products */}
              <div 
                onClick={() => setPlatformSidebarOpen(true)}
                className="bg-white border border-[#E2E8F0] hover:border-slate-300 p-3.5 rounded-2xl shadow-xs text-left space-y-2 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#111827] flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#111827]">More Products</h4>
                  <p className="text-[10px] text-[#64748B] mt-0.5">12+ on Platform</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            10. BOTTOM NAVY METRIC STRIP: "TalentXcel At a Glance"
           ───────────────────────────────────────────────────────────── */}
        <section className="bg-[#0F172A] text-white py-5 px-4 border-t border-slate-800">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
            {/* Title */}
            <div className="flex items-center gap-2 pr-4 border-r border-slate-800">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <div>
                <span className="font-extrabold text-white block text-xs leading-tight">TalentXcel</span>
                <span className="text-[10px] text-slate-400 block leading-tight">At a Glance</span>
              </div>
            </div>

            {/* Metric 1 */}
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <span className="font-black text-white text-xs block">600+</span>
                <span className="text-[10px] text-slate-400 block">Registered Users</span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <span className="font-black text-white text-xs block">1,200+</span>
                <span className="text-[10px] text-slate-400 block">Live Job Opportunities</span>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-black text-white text-xs block">26+</span>
                <span className="text-[10px] text-slate-400 block">Authoritative Domains</span>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-black text-white text-xs block">~100K</span>
                <span className="text-[10px] text-slate-400 block">MAU Ready Platform</span>
              </div>
            </div>

            {/* Metric 5 */}
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <span className="font-black text-white text-xs block">9</span>
                <span className="text-[10px] text-slate-400 block">Product Subdomains</span>
              </div>
            </div>

            {/* Badge */}
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium pl-4 border-l border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Trusted by Learners, Employers & Institutions</span>
            </div>
          </div>
        </section>

      </main>

      {/* 12 Platform Ecosystem Drawer */}
      <PlatformEcosystemSidebar
        isOpen={platformSidebarOpen}
        onClose={() => setPlatformSidebarOpen(false)}
      />

      {/* Advance Pro Version Unlock Modal (₹399 to ₹999) */}
      <CareerProUnlockModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        targetRole={activeTransition.targetRole}
        currentRole={activeTransition.currentRole}
        targetCtc={adjustedTargetCtc}
        experienceLevel={activeTransition.experienceLevel}
        location={activeLocationInfo.label}
        onSuccessUnlock={(tier) => {
          setIsProUnlocked(true);
          setProTierName(tier);
        }}
      />

      {/* Central Revenue Pro Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        currentPlanId={subscription.planId}
        targetFeatureName="Career Transition Roadmap & Milestone Tracking"
        onSuccess={() => {
          refreshEntitlements();
        }}
      />
    </div>
  );
};

export default CareerPathfinderProduct;
