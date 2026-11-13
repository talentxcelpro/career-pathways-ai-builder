// src/pages/passport/components/CareerPassportHeader.tsx
// Single Clean Header for Career Passport (Removed Dual Navbar)
// Master Light SaaS Design System (#FFFFFF, #F4F7FC, #2563EB, #7138E8, #111827, #E2E8F0)

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight,
  LogOut,
  User,
  Star,
  Globe
} from 'lucide-react';
import { TalentXcelLogo } from '@/components/common/TalentXcelLogo';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export const CareerPassportHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profileName, setProfileName] = useState<string>('');
  const [profileAvatar, setProfileAvatar] = useState<string>('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isLocal = typeof window !== 'undefined' && window.location.hostname.includes('localhost');
  const portStr = typeof window !== 'undefined' && window.location.port ? `:${window.location.port}` : ':8080';

  const getSubdomainUrl = (sub: string, fallbackPath: string) => {
    if (isLocal) {
      return `http://${sub}.localhost${portStr}`;
    }
    return `https://${sub}.talentxcel.in`;
  };

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
        // Fallback gracefully
      }
    };
    fetchProfile();
    return () => { isMounted = false; };
  }, [user?.id]);

  const displayName = profileName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member';

  const ecosystemLinks = [
    { key: 'jobs', label: 'Jobs', href: getSubdomainUrl('jobs', '/jobs') },
    { key: 'resume', label: 'Resume', href: getSubdomainUrl('resume', '/resume') },
    { key: 'salary', label: 'Salary', href: getSubdomainUrl('salary', '/salary') },
    { key: 'colleges', label: 'CampusOS', href: getSubdomainUrl('colleges', '/colleges') },
    { key: 'passport', label: 'Passport', href: getSubdomainUrl('passport', '/passport'), active: true },
    { key: 'government', label: 'SarkariHub', href: getSubdomainUrl('government', '/government-jobs') },
    { key: 'careers', label: 'Pathfinder', href: getSubdomainUrl('careers', '/career-map') },
    { key: 'learning', label: 'SkillPods', href: getSubdomainUrl('learning', '/courses') },
    { key: 'ca', label: 'CA Practice', href: getSubdomainUrl('ca', '/ca') },
    { key: 'legal', label: 'Legal Practice', href: getSubdomainUrl('legal', '/legal') },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-xs select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand with Logo & Purple Pill */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <TalentXcelLogo iconSize={26} textSize="text-base sm:text-lg" theme="light" />
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-[#2563EB] to-[#7138E8] text-white shadow-2xs">
                Career Passport
              </span>
            </Link>
          </div>

          {/* Ecosystem Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto no-scrollbar">
            {ecosystemLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  link.active
                    ? 'bg-blue-50 text-[#2563EB] font-bold border border-blue-200 shadow-2xs'
                    : 'text-[#64748B] hover:text-[#111827] hover:bg-slate-50'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Primary Action Buttons */}
          <div className="flex items-center gap-2.5">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors"
                >
                  {profileAvatar ? (
                    <img src={profileAvatar} alt={displayName} className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[10px] font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-[100px] truncate hidden sm:inline">{displayName}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1 text-slate-800 text-xs z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-bold truncate text-slate-900">{displayName}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 hover:bg-slate-50 font-semibold"
                    >
                      My Career Passport
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-red-600 font-semibold flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth/login"
                className="text-xs font-bold text-[#64748B] hover:text-[#111827] px-2 py-1.5 transition-colors hidden sm:inline"
              >
                Log In
              </Link>
            )}

            <Button
              size="sm"
              onClick={() => navigate('/auth/register?intent=passport')}
              className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <span>Create Your Passport</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>

        </div>
      </div>
    </header>
  );
};
