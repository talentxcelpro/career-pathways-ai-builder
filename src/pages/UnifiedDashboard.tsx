import React, { useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import CommandCenter from '@/pages/CommandCenter';
import { EmployerDashboard } from '@/components/dashboard/EmployerDashboard';
import { CollegeDashboard } from '@/components/dashboard/CollegeDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { Briefcase, UserCheck, Shield, GraduationCap } from 'lucide-react';

export default function UnifiedDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { dashboardType, isLoading: roleLoading } = useUserRole();
  const [searchParams, setSearchParams] = useSearchParams();

  const isPrivileged = Boolean(dashboardType && dashboardType !== 'student' && dashboardType !== 'default');
  const requestedView = searchParams.get('view');
  const [activeView, setActiveView] = useState<'role' | 'candidate'>(() => {
    if (requestedView === 'candidate') return 'candidate';
    if (requestedView === 'role') return 'role';
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('txc_dashboard_view_preference');
      if (saved === 'candidate' || saved === 'role') return saved;
    }
    return isPrivileged ? 'role' : 'candidate';
  });

  const handleToggleView = (view: 'role' | 'candidate') => {
    setActiveView(view);
    if (typeof window !== 'undefined') {
      localStorage.setItem('txc_dashboard_view_preference', view);
    }
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (view === 'candidate') {
        next.set('view', 'candidate');
      } else {
        next.delete('view');
      }
      return next;
    });
  };

  // Show loading state while determining user role
  if (authLoading || roleLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-32 bg-muted rounded"></div>
              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 bg-muted rounded"></div>
                ))}
              </div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // For multi-role users (Employer, Admin, College Admin): allow 1-click toggle between Role Portal and Candidate CommandCenter
  const getRoleLabel = () => {
    switch (dashboardType) {
      case 'admin': return { name: 'Admin Control Center', icon: Shield };
      case 'college_admin': return { name: 'College Portal', icon: GraduationCap };
      case 'employer': default: return { name: 'Employer Portal', icon: Briefcase };
    }
  };

  const roleInfo = getRoleLabel();
  const RoleIcon = roleInfo.icon;

  const roleSwitchBanner = (
    <div className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 hidden sm:inline">Active Workspace:</span>
          <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
            <button
              onClick={() => handleToggleView('role')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all ${
                activeView === 'role'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <RoleIcon className="h-3.5 w-3.5" />
              <span>{roleInfo.name}</span>
            </button>
            <button
              onClick={() => handleToggleView('candidate')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all ${
                activeView === 'candidate'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>Candidate CommandCenter</span>
            </button>
          </div>
        </div>

        <div className="text-slate-400 text-[11px] hidden md:block">
          {activeView === 'role'
            ? 'Manage hiring, jobs & applicants'
            : 'Explore career tools, TalentScore & job matches'}
        </div>
      </div>
    </div>
  );

  if (activeView === 'candidate') {
    return (
      <div className="min-h-screen bg-[var(--tx-bg,#f4f6fb)]">
        {roleSwitchBanner}
        <CommandCenter />
      </div>
    );
  }

  // Render role-specific dashboards with standard container
  const renderDashboard = () => {
    switch (dashboardType) {
      case 'admin':
        return <AdminDashboard />;
      case 'college_admin':
        return <CollegeDashboard />;
      case 'employer':
      default:
        return <EmployerDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {roleSwitchBanner}
      <div className="container mx-auto p-6">
        {renderDashboard()}
      </div>
    </div>
  );
}