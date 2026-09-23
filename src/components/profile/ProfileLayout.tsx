
import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, User, Settings, FileText, MessageSquare, Heart, Camera, BarChart3, FolderOpen, Bell } from "lucide-react";

interface ProfileLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

const ProfileLayout = ({ children, title, description }: ProfileLayoutProps) => {
  const location = useLocation();

  const navigationItems = [
    { path: '/profile', label: 'View Profile', icon: User },
    { path: '/profile/edit', label: 'Edit Profile', icon: Settings },
    { path: '/profile/resume', label: 'Resume', icon: FileText },
    { path: '/profile/cover-letter', label: 'Cover Letters', icon: MessageSquare },
    { path: '/profile/preferences', label: 'Job Preferences', icon: Heart },
    { path: '/profile/media', label: 'Media & Portfolio', icon: Camera },
    { path: '/profile/analytics', label: 'Profile Analytics', icon: BarChart3 },
    { path: '/profile/documents', label: 'Documents', icon: FolderOpen },
    { path: '/profile/settings', label: 'Account Settings', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link 
              to="/dashboard" 
              className="inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 h-8 px-3 transition-colors shadow-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Dashboard
            </Link>
            <div className="border-l border-slate-200 dark:border-slate-800 pl-3">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">{title}</h1>
              {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-xs rounded-2xl overflow-hidden">
              <CardContent className="p-3">
                <nav className="space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center w-full px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive 
                            ? 'bg-blue-600 text-white shadow-xs font-bold' 
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <Icon className={`h-3.5 w-3.5 mr-2.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;
