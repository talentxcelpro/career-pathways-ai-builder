// src/components/products/jobmatch/JobPortalHeader.tsx
// Simple, clean public header for TalentXcel Jobs / JobMatch
// Master Light SaaS Design System (#FFFFFF, #F4F7FC, #2563EB, #7138E8, #111827, #E2E8F0)

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Search, 
  Building2, 
  Calculator, 
  FileText, 
  Plus, 
  User, 
  Bookmark, 
  Clock, 
  Menu, 
  X, 
  LogOut, 
  Sparkles,
  ChevronDown,
  Users,
  Compass,
  Layers,
  Bell,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { TalentXcelLogo } from '@/components/common/TalentXcelLogo';
import { PlatformEcosystemSidebar } from './PlatformEcosystemSidebar';
import { toast } from 'sonner';

interface JobPortalHeaderProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  savedJobsCount?: number;
  applicationsCount?: number;
}

export const JobPortalHeader: React.FC<JobPortalHeaderProps> = ({
  activeTab = 'find',
  onSelectTab,
  savedJobsCount = 0,
  applicationsCount = 0
}) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [ecosystemSidebarOpen, setEcosystemSidebarOpen] = useState(false);

  const handleNavClick = (tabKey: string, fallbackUrl?: string) => {
    setMobileMenuOpen(false);
    if (onSelectTab) {
      onSelectTab(tabKey);
    } else if (fallbackUrl) {
      navigate(fallbackUrl);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      setUserDropdownOpen(false);
      setMobileMenuOpen(false);
    } catch {
      toast.error('Error signing out');
    }
  };

  return (
    <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <TalentXcelLogo />
            <span className="text-xs font-black tracking-wider uppercase px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[#2563EB]">
              Jobs
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Global
            </span>
          </Link>

          {/* Desktop Primary Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => handleNavClick('find')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'find' || activeTab === 'discover'
                  ? 'text-[#2563EB] bg-blue-50'
                  : 'text-[#475569] hover:text-[#111827] hover:bg-slate-50'
              }`}
            >
              Find Jobs
            </button>
            <a
              href={typeof window !== 'undefined' && window.location.hostname.includes('localhost') ? 'http://localhost:8080/network' : 'https://talentxcel.in/network'}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#475569] hover:text-[#2563EB] hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Network</span>
            </a>
            <button
              onClick={() => handleNavClick('companies')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'companies'
                  ? 'text-[#2563EB] bg-blue-50'
                  : 'text-[#475569] hover:text-[#111827] hover:bg-slate-50'
              }`}
            >
              Companies
            </button>
            <button
              onClick={() => handleNavClick('categories')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                activeTab === 'categories'
                  ? 'text-[#2563EB] bg-blue-50'
                  : 'text-[#475569] hover:text-[#111827] hover:bg-slate-50'
              }`}
            >
              <span>Browse Categories</span>
              <ChevronDown className="w-3 h-3 text-[#64748B]" />
            </button>
            <a
              href="https://salary.talentxcel.in"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#475569] hover:text-[#111827] hover:bg-slate-50 transition-colors"
            >
              Salary Guide
            </a>
            <button
              onClick={() => handleNavClick('resources')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                activeTab === 'resources'
                  ? 'text-[#2563EB] bg-blue-50'
                  : 'text-[#475569] hover:text-[#111827] hover:bg-slate-50'
              }`}
            >
              <span>Career Resources</span>
              <ChevronDown className="w-3 h-3 text-[#64748B]" />
            </button>
            <button
              type="button"
              onClick={() => setEcosystemSidebarOpen(true)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#2563EB] bg-blue-50 hover:bg-blue-100 border border-blue-200/80 transition-all flex items-center gap-1.5 cursor-pointer ml-1"
              title="Explore all 12 TalentXcel platforms"
            >
              <Compass className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>12 Platforms</span>
            </button>
          </nav>
        </div>

        {/* Right: Actions & User Account */}
        <div className="hidden sm:flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => handleNavClick('post')}
            className="bg-white hover:bg-[#F4F7FC] text-[#2563EB] border border-blue-200 hover:border-[#2563EB] font-bold text-xs px-3.5 h-9 rounded-xl transition-all shadow-2xs"
          >
            <Building2 className="w-3.5 h-3.5 mr-1.5 text-[#2563EB]" />
            For Employers
          </Button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-[#E2E8F0] hover:border-[#2563EB] transition-colors bg-white text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#2563EB] to-[#7138E8] flex items-center justify-center text-white font-bold text-xs">
                  {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-bold text-[#111827] max-w-[120px] truncate">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
              </button>

              {userDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-52 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl p-1.5 z-50 text-xs"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <button
                    onClick={() => handleNavClick('profile')}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#F4F7FC] font-semibold text-[#111827] flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('applications')}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#F4F7FC] font-semibold text-[#111827] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#7138E8]" />
                      <span>My Applications</span>
                    </div>
                    {applicationsCount > 0 && (
                      <span className="text-[10px] bg-purple-50 text-[#7138E8] px-1.5 py-0.5 rounded-full font-bold">
                        {applicationsCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => handleNavClick('saved')}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#F4F7FC] font-semibold text-[#111827] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                      <span>Saved Jobs</span>
                    </div>
                    {savedJobsCount > 0 && (
                      <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">
                        {savedJobsCount}
                      </span>
                    )}
                  </button>
                  <div className="my-1 border-t border-[#E2E8F0]" />
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 font-semibold flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="/auth/login"
                className="text-xs font-bold text-[#475569] hover:text-[#111827] px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors shrink-0 whitespace-nowrap"
              >
                Sign In
              </a>
              <a
                href="/auth/register"
                className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] hover:opacity-95 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-all shrink-0 whitespace-nowrap"
              >
                Register
              </a>
            </div>
          )}
        </div>

        {/* Mobile Header Right Icons matching Image 1 */}
        <div className="flex md:hidden items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleNavClick('match')}
            className="p-1.5 rounded-lg text-slate-600 hover:text-[#2563EB] hover:bg-slate-50 transition-colors cursor-pointer"
            title="AI Match Assistant"
          >
            <MessageSquare className="w-4 h-4 text-slate-600" />
          </button>
          <button
            type="button"
            onClick={() => toast.success('Job alerts active: All notifications verified.')}
            className="p-1.5 rounded-lg text-slate-600 hover:text-[#2563EB] hover:bg-slate-50 transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#2563EB] rounded-full" />
          </button>
          {user ? (
            <button
              onClick={() => handleNavClick('profile')}
              className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#7138E8] text-white text-[11px] font-bold flex items-center justify-center border border-white shadow-xs cursor-pointer"
              title={user.email || 'My Profile'}
            >
              {(user.email || 'U').charAt(0).toUpperCase()}
            </button>
          ) : (
            <a
              href="/auth/login"
              className="px-2 py-1 rounded-lg text-[11px] font-bold text-[#2563EB] bg-blue-50 border border-blue-200"
            >
              Sign In
            </a>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 h-8 w-8 text-[#111827]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Logged-In User Context Sub-Bar (Subtle & Optional) */}
      {user && (
        <div className="bg-[#F4F7FC] border-t border-[#E2E8F0] px-4 sm:px-6 lg:px-8 py-1.5 hidden md:block">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleNavClick('profile')}
                className={`font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'profile' ? 'text-[#2563EB] font-bold' : 'text-[#64748B] hover:text-[#111827]'
                }`}
              >
                <User className="w-3 h-3" />
                <span>My Job Preferences</span>
              </button>
              <span>•</span>
              <button
                onClick={() => handleNavClick('applications')}
                className={`font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'applications' ? 'text-[#2563EB] font-bold' : 'text-[#64748B] hover:text-[#111827]'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>My Applications ({applicationsCount})</span>
              </button>
              <span>•</span>
              <button
                onClick={() => handleNavClick('saved')}
                className={`font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'saved' ? 'text-[#2563EB] font-bold' : 'text-[#64748B] hover:text-[#111827]'
                }`}
              >
                <Bookmark className="w-3 h-3" />
                <span>Saved Jobs ({savedJobsCount})</span>
              </button>
            </div>

            <div className="text-[11px] text-[#64748B]">
              Logged in as <strong className="text-[#111827]">{user.email}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-[#E2E8F0] px-4 py-4 space-y-3 text-xs">
          <div className="space-y-1">
            <button
              onClick={() => handleNavClick('find')}
              className="w-full text-left py-2 font-bold text-[#111827] border-b border-slate-100"
            >
              Find Jobs
            </button>
            <a
              href={typeof window !== 'undefined' && window.location.hostname.includes('localhost') ? 'http://localhost:8080/network' : 'https://talentxcel.in/network'}
              className="flex items-center justify-between py-2 font-semibold text-[#475569] border-b border-slate-100"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#2563EB]" />
                <span>Professional Network</span>
              </div>
              <span className="text-[10px] bg-purple-50 text-[#7138E8] font-bold px-1.5 py-0.5 rounded">Social</span>
            </a>
            <button
              onClick={() => handleNavClick('companies')}
              className="w-full text-left py-2 font-semibold text-[#475569] border-b border-slate-100"
            >
              Companies
            </button>
            <button
              onClick={() => handleNavClick('categories')}
              className="w-full text-left py-2 font-semibold text-[#475569] border-b border-slate-100"
            >
              Browse Categories
            </button>
            <a
              href="https://salary.talentxcel.in"
              className="block py-2 font-semibold text-[#475569] border-b border-slate-100"
            >
              Salary Guide
            </a>
            <button
              onClick={() => handleNavClick('resources')}
              className="w-full text-left py-2 font-semibold text-[#475569] border-b border-slate-100"
            >
              Career Resources
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setEcosystemSidebarOpen(true);
              }}
              className="w-full text-left py-2 font-bold text-[#2563EB] border-b border-slate-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#2563EB]" />
                <span>All 12 Platform Businesses</span>
              </div>
              <span className="text-[10px] bg-blue-50 text-[#2563EB] font-bold px-1.5 py-0.5 rounded">Ecosystem</span>
            </button>
            <button
              onClick={() => handleNavClick('post')}
              className="w-full text-left py-2 font-bold text-[#2563EB] border-b border-slate-100 flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>For Employers</span>
            </button>
          </div>

          {user ? (
            <div className="pt-2 border-t border-[#E2E8F0] space-y-2">
              <div className="text-[11px] text-[#64748B]">
                Account: <strong>{user.email}</strong>
              </div>
              <button
                onClick={() => handleNavClick('profile')}
                className="w-full text-left py-1.5 font-semibold text-[#111827]"
              >
                My Job Preferences
              </button>
              <button
                onClick={() => handleNavClick('applications')}
                className="w-full text-left py-1.5 font-semibold text-[#111827]"
              >
                My Applications ({applicationsCount})
              </button>
              <button
                onClick={() => handleNavClick('saved')}
                className="w-full text-left py-1.5 font-semibold text-[#111827]"
              >
                Saved Jobs ({savedJobsCount})
              </button>
              <button
                onClick={handleSignOut}
                className="w-full text-left py-1.5 font-semibold text-red-600"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-2 flex gap-2">
              <a
                href="/auth/login"
                className="flex-1 text-center py-2 rounded-xl border border-[#E2E8F0] font-bold text-[#111827]"
              >
                Sign In
              </a>
              <a
                href="/auth/register"
                className="flex-1 text-center py-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7138E8] text-white font-bold"
              >
                Register
              </a>
            </div>
          )}
        </div>
      )}

      {/* Slide-Out 12 Platform Ecosystem Navigation Sidebar */}
      <PlatformEcosystemSidebar 
        open={ecosystemSidebarOpen} 
        onOpenChange={setEcosystemSidebarOpen} 
      />
    </header>
  );
};
