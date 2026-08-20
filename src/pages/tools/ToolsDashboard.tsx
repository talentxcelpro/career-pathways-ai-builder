import { useState } from 'react';
import { useToolsData, ADMIN_EMAILS } from '@/hooks/useToolsData';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Star, 
  ArrowRight, 
  Filter, 
  ShieldCheck, 
  Briefcase, 
  MessageSquare, 
  FileText, 
  Brain, 
  Users, 
  User, 
  BarChart3, 
  Award,
  Crown,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ToolsDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { displayName } = useCurrentUserProfile();
  const {
    tools,
    filteredTools,
    toolCategories,
    usageStats,
    isLoading,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    isAdmin
  } = useToolsData();

  // Extract first name from displayName or email
  const getFirstName = () => {
    if (displayName && displayName !== 'Learner') {
      return displayName.split(' ')[0];
    }
    if (user?.email) {
      const emailBase = user.email.split('@')[0];
      return emailBase.replace(/[._-]+/g, ' ').trim().replace(/\b\w/g, (c) => c.toUpperCase()).split(' ')[0];
    }
    return null;
  };

  const firstName = getFirstName();

  const categories = [
    { value: 'all', label: 'All Tools', count: tools.length, icon: Sparkles },
    { value: 'Analytics', label: 'Analytics', count: toolCategories['Analytics'] || 3, icon: BarChart3 },
    { value: 'Career', label: 'Career', count: toolCategories['Career'] || 4, icon: TrendingUp },
    { value: 'Interview', label: 'Interview', count: toolCategories['Interview'] || 4, icon: MessageSquare },
    { value: 'JobSearch', label: 'JobSearch', count: toolCategories['JobSearch'] || 3, icon: Briefcase },
    { value: 'Networking', label: 'Networking', count: toolCategories['Networking'] || 3, icon: Users },
    { value: 'Profile', label: 'Profile', count: toolCategories['Profile'] || 3, icon: User },
    { value: 'Resume', label: 'Resume', count: toolCategories['Resume'] || 3, icon: FileText },
    { value: 'Skills', label: 'Skills', count: toolCategories['Skills'] || 3, icon: Brain }
  ];

  const getIconComponent = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent && typeof IconComponent === 'function' ? IconComponent : Icons.Wrench;
  };

  const handleToolClick = (toolSlug: string) => {
    navigate(`/tools/${toolSlug}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
          <p className="text-slate-400 text-sm">Loading 26 Career Intelligence Tools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Admin Access Banner if logged in as admin */}
        {isAdmin && (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                  Admin Full Access Active
                  <Badge className="bg-amber-500 text-slate-950 font-bold text-[10px] uppercase">Admin</Badge>
                </h3>
                <p className="text-xs text-slate-300">
                  Logged in as <span className="text-amber-300 font-mono">{user?.email}</span> — All 26 Professional Tools fully unlocked.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10 text-xs px-3 py-1">
                <CheckCircle className="h-3 w-3 mr-1 inline" /> 26 / 26 Tools Unlocked
              </Badge>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>TalentXcel AI Career Intelligence Suite</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            {user && firstName ? `Welcome back, ${firstName}!` : 'Professional Career Tools'}
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            26 purpose-built AI tools across Analytics, Career, Interview Prep, Job Search, Networking, Profile, Resume, and Skills.
          </p>
        </div>

        {/* Top 8 Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.value.toLowerCase();
            const Icon = cat.icon;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                  isSelected ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              type="text"
              placeholder="Search across all 26 tools by keyword, function, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-900/90 border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Tools Grid — 26 Tool Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTools.map((tool) => {
            const Icon = getIconComponent(tool.icon_name);
            return (
              <Card
                key={tool.id}
                onClick={() => handleToolClick(tool.slug)}
                className="group relative bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="border-slate-700 text-slate-400 bg-slate-950/60 text-[10px] font-mono capitalize">
                      {tool.category}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors mb-1.5 line-clamp-1">
                    {tool.name}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4">
                    {tool.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400 font-medium text-[11px]">
                    <CheckCircle className="h-3 w-3" /> Unlocked
                  </span>
                  <span className="inline-flex items-center gap-1 text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform text-xs">
                    Launch <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Empty Search State */}
        {filteredTools.length === 0 && (
          <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
            <Search className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white mb-1">No matching tools found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              Try adjusting your search query or select another category from the top bar.
            </p>
            <Button 
              variant="outline" 
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Reset Filters
            </Button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ToolsDashboard;
