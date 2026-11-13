// src/components/products/common/ProductHeader.tsx
// Master Global Design System Header for all 9 TalentXcel Products

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TalentXcelLogo } from '@/components/common/TalentXcelLogo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Briefcase, 
  Award, 
  BookOpen, 
  GraduationCap, 
  ShieldCheck, 
  Compass, 
  HardHat, 
  Building2,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ProductHeaderProps {
  productName: string;
  badgeLabel?: string;
  topBannerText?: string;
  primaryActionLabel?: string;
  primaryActionTo?: string;
  primaryActionOnClick?: () => void;
  activeNav?: 'jobs' | 'resume' | 'salary' | 'colleges' | 'passport' | 'government' | 'careers' | 'learning' | 'employers';
}

export const ProductHeader: React.FC<ProductHeaderProps> = ({
  productName,
  badgeLabel,
  topBannerText,
  primaryActionLabel = 'Join Network',
  primaryActionTo = '/auth/register',
  primaryActionOnClick,
  activeNav
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isLocal = typeof window !== 'undefined' && window.location.hostname.includes('localhost');
  const portStr = typeof window !== 'undefined' && window.location.port ? `:${window.location.port}` : ':8080';

  const getSubdomainUrl = (sub: string, fallbackPath: string) => {
    if (isLocal) {
      return `http://${sub}.localhost${portStr}`;
    }
    return `https://${sub}.talentxcel.in`;
  };

  const navLinks = [
    { key: 'jobs', label: 'Jobs', to: getSubdomainUrl('jobs', '/jobs'), localPath: '/jobs' },
    { key: 'resume', label: 'Resume', to: getSubdomainUrl('resume', '/resume'), localPath: '/resume' },
    { key: 'salary', label: 'Salary', to: getSubdomainUrl('salary', '/salary'), localPath: '/salary' },
    { key: 'colleges', label: 'CampusOS', to: getSubdomainUrl('colleges', '/colleges'), localPath: '/colleges' },
    { key: 'passport', label: 'Passport', to: getSubdomainUrl('passport', '/passport'), localPath: '/passport' },
    { key: 'government', label: 'SarkariHub', to: getSubdomainUrl('government', '/government-jobs'), localPath: '/government-jobs' },
    { key: 'careers', label: 'Pathfinder', to: getSubdomainUrl('careers', '/career-map'), localPath: '/career-map' },
    { key: 'learning', label: 'SkillPods', to: getSubdomainUrl('learning', '/courses'), localPath: '/courses' },
    { key: 'ca', label: 'CA Practice', to: getSubdomainUrl('ca', '/ca'), localPath: '/ca' },
    { key: 'legal', label: 'Legal Practice', to: getSubdomainUrl('legal', '/legal'), localPath: '/legal' },
    { key: 'services', label: 'Services', to: getSubdomainUrl('services', '/services'), localPath: '/services' },
    { key: 'employers', label: 'Hire →', to: getSubdomainUrl('employers', '/hire'), localPath: '/hire', isEmployer: true },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E2E8F0] shadow-xs select-none">
      {/* Top Value Banner */}
      <div className="bg-[#F4F7FC] border-b border-[#E2E8F0] px-4 py-1.5 text-xs text-[#64748B]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-[#111827]">{productName}</span>
            <span className="text-[#64748B] hidden sm:inline">
              • {topBannerText || 'Part of the TalentXcel Global Career Ecosystem'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <Link to="/local-testing-index" className="text-[#2563EB] hover:underline font-bold flex items-center gap-1 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
              <Sparkles className="h-3 w-3" />
              <span>12 Products Local Index</span>
            </Link>
            <a href="https://passport.talentxcel.in" className="hover:text-[#2563EB] transition-colors hidden md:inline">
              Career Passport
            </a>
            <a href="https://talentxcel.in/network" className="hover:text-[#2563EB] transition-colors">
              Professional Network
            </a>
            {badgeLabel && (
              <Badge className="bg-blue-50 text-[#2563EB] border border-blue-200 text-[10px] font-bold py-0">
                {badgeLabel}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Clean Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Product Brand Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <TalentXcelLogo iconSize={26} textSize="text-base sm:text-lg" theme="light" />
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-[#2563EB] to-[#7138E8] text-white shadow-2xs">
                {productName}
              </span>
            </Link>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto no-scrollbar">
            {navLinks.map((link) => {
              const isActive = activeNav === link.key;
              if (link.isEmployer) {
                return (
                  <a
                    key={link.key}
                    href={link.to}
                    className="ml-2 px-3 py-1.5 rounded-xl text-xs font-bold text-[#2563EB] bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors whitespace-nowrap"
                  >
                    {link.label}
                  </a>
                );
              }
              return (
                <a
                  key={link.key}
                  href={link.to}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-50 text-[#2563EB] font-bold border border-blue-200'
                      : 'text-[#64748B] hover:text-[#111827] hover:bg-[#F4F7FC]'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/billing')}
                  className="text-xs font-bold text-[#2563EB] border-blue-200 bg-blue-50/50 hover:bg-blue-100/50 flex items-center gap-1"
                >
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  <span>Pro / Billing</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="text-xs font-bold text-[#111827] border-[#E2E8F0] hover:bg-[#F4F7FC]"
                >
                  My Account
                </Button>
              </div>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="text-xs font-bold text-[#64748B] hover:text-[#111827] px-2 py-1.5 transition-colors"
                >
                  Log In
                </Link>

                <Button
                  size="sm"
                  onClick={primaryActionOnClick || (() => navigate(primaryActionTo))}
                  className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] hover:opacity-95 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                >
                  <span>{primaryActionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
