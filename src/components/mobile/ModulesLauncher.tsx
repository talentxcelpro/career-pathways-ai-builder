import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  X, 
  Briefcase, 
  Users, 
  GraduationCap, 
  Building2,
  BookOpen,
  Trophy,
  Gift,
  Settings,
  User,
  MessageSquare,
  Play,
  QrCode,
  MapPin,
  TrendingUp,
  PenTool,
  BarChart3,
  Zap,
  Lightbulb,
  Target,
  Rocket,
  Shield,
  CreditCard,
  FileText,
  Grid3X3,
  Layers,
  Radio,
  Activity,
  Cpu,
  Mail,
  Newspaper,
  Layout,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';

interface ModuleItem {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  category: 'core' | 'career' | 'social' | 'tools' | 'business' | 'mobile' | 'admin';
  requiresAuth?: boolean;
  isNew?: boolean;
  isPro?: boolean;
}

const modules: ModuleItem[] = [
  // Core Modules
  {
    id: 'jobs',
    name: 'TalentXcel Jobs',
    description: 'Find your next career opportunity',
    icon: Briefcase,
    route: '/jobs',
    category: 'core'
  },
  {
    id: 'talent-score',
    name: 'Performance Index',
    description: 'Track your career performance index',
    icon: BarChart3,
    route: '/talent-score',
    category: 'core',
    requiresAuth: true,
    isNew: true
  },
  {
    id: 'navigator',
    name: 'TalentXcel Navigator',
    description: 'Personalized professional strategist',
    icon: Lightbulb,
    route: '/navigator',
    category: 'core',
    requiresAuth: true,
    isNew: true
  },
  {
    id: 'network',
    name: 'Network Pulse',
    description: 'Connect with elite professionals',
    icon: Users,
    route: '/network',
    category: 'social'
  },

  // Growth & Tools
  {
    id: 'messages',
    name: 'Talent Messages',
    description: 'Secure professional communication',
    icon: MessageSquare,
    route: '/communication/messages',
    category: 'social'
  },
  {
    id: 'referral',
    name: 'TalentXcel Growth Engine',
    description: 'Invite and earn professional rewards',
    icon: Gift,
    route: '/refer-and-earn',
    category: 'social'
  },
  {
    id: 'creator-studio',
    name: 'TalentXcel Creator Studio',
    description: 'AI-assisted professional content',
    icon: PenTool,
    route: '/content-studio',
    category: 'tools'
  },

  // Performance & Admin
  {
    id: 'linkedin-pro',
    name: 'LinkedIn Pro Hub',
    description: 'Advanced networking automation',
    icon: Shield,
    route: '/admin/linkedin-tools',
    category: 'tools',
    isPro: true
  },
  {
    id: 'resume-analytics',
    name: 'Resume Insights',
    description: 'Real-time performance tracking',
    icon: Activity,
    route: '/resume/analytics',
    category: 'career'
  },
  {
    id: 'ats-check',
    name: 'ATS Optimizer',
    description: 'Algorithm-ready resume verification',
    icon: Cpu,
    route: '/resume/ats-check',
    category: 'career'
  },

  // Business & Edu
  {
    id: 'companies',
    name: 'TalentXcel Organizations',
    description: 'Explore high-velocity companies',
    icon: Building2,
    route: '/companies',
    category: 'business'
  },
  {
    id: 'colleges',
    name: 'TalentXcel Institutions',
    description: 'Top-tier educational partners',
    icon: GraduationCap,
    route: '/colleges',
    category: 'business'
  }
];

const categoryLabels = {
  core: 'Core OS',
  career: 'Performance Hub',
  social: 'Talent Network',
  tools: 'Pro Tools',
  business: 'Ecosystem',
  mobile: 'Mobile Features',
  admin: 'System Ops'
};

const categoryColors = {
  core: 'from-blue-500 to-blue-600',
  career: 'from-green-500 to-green-600',
  tools: 'from-purple-500 to-purple-600',
  business: 'from-orange-500 to-orange-600',
  social: 'from-pink-500 to-pink-600',
  mobile: 'from-indigo-500 to-indigo-600',
  admin: 'from-slate-700 to-slate-900'
};

interface ModulesLauncherProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModulesLauncher: React.FC<ModulesLauncherProps> = ({
  isOpen,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useOptimizedAuth();

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? module.category === selectedCategory : true;
    const hasAccess = module.requiresAuth ? !!user : true;
    return matchesSearch && matchesCategory && hasAccess;
  });

  const groupedModules = filteredModules.reduce((acc, module) => {
    if (!acc[module.category]) acc[module.category] = [];
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, ModuleItem[]>);

  const categories = Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden rounded-[32px] border-white/20 bg-slate-50/90 backdrop-blur-2xl">
        <DialogHeader className="p-8 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-3xl font-apple-heavy text-slate-950">TalentXcel Hub</DialogTitle>
              <p className="text-slate-500 mt-1 font-apple-medium">
                Access all high-performance professional modules
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-200">
              <X className="h-6 w-6" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-8 pb-4">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search TalentXcel modules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 bg-white/50 border-slate-200 rounded-2xl font-apple-medium text-lg focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className={cn("whitespace-nowrap rounded-xl px-6", selectedCategory === null ? "bg-slate-950" : "bg-white/50")}
            >
              All TalentXcel
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={cn("whitespace-nowrap rounded-xl px-6", selectedCategory === category ? "bg-slate-950" : "bg-white/50")}
              >
                {categoryLabels[category]}
              </Button>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1 px-8 pb-8 h-[50vh]">
          <div className="space-y-10">
            {Object.entries(groupedModules).map(([category, categoryModules]) => (
              <div key={category}>
                <h3 className="text-sm font-apple-heavy text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                  <Badge variant="secondary" className="ml-2 bg-slate-200 text-slate-600">
                    {categoryModules.length}
                  </Badge>
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryModules.map((module) => {
                    const Icon = module.icon;
                    return (
                      <Button
                        key={module.id}
                        variant="outline"
                        className="h-auto p-6 flex flex-col items-start text-left bg-white/60 border-slate-100 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 rounded-[24px] group relative overflow-hidden"
                        onClick={() => {
                          navigate(module.route);
                          onClose();
                        }}
                      >
                        <div className="flex items-center justify-between w-full mb-4">
                          <div className={cn(
                            "p-3 rounded-2xl bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform duration-500",
                            categoryColors[module.category]
                          )}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex gap-1">
                            {module.isNew && (
                              <Badge className="bg-blue-500 text-white border-0 text-[10px] rounded-lg">NEW</Badge>
                            )}
                            {module.isPro && (
                              <Badge className="bg-slate-900 text-white border-0 text-[10px] rounded-lg">PRO</Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="w-full relative z-10">
                          <h4 className="font-apple-heavy text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                            {module.name}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-2 font-apple-medium">
                            {module.description}
                          </p>
                        </div>
                        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Zap className="h-4 w-4 text-blue-500/30" />
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
