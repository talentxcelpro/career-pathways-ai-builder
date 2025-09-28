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
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';

interface ModuleItem {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  category: 'core' | 'career' | 'social' | 'tools' | 'business' | 'mobile';
  requiresAuth?: boolean;
  isNew?: boolean;
  isPro?: boolean;
}

const modules: ModuleItem[] = [
  // Core Modules
  {
    id: 'jobs',
    name: 'Jobs',
    description: 'Find your next career opportunity',
    icon: Briefcase,
    route: '/jobs',
    category: 'core'
  },
  {
    id: 'network',
    name: 'Network',
    description: 'Connect with professionals',
    icon: Users,
    route: '/network',
    category: 'core'
  },
  {
    id: 'profile',
    name: 'Profile',
    description: 'Manage your professional profile',
    icon: User,
    route: '/profile',
    category: 'core',
    requiresAuth: true
  },

  // Career Modules
  {
    id: 'learning',
    name: 'Learning',
    description: 'Courses and skill development',
    icon: BookOpen,
    route: '/learning',
    category: 'career'
  },
  {
    id: 'career-dashboard',
    name: 'Career Dashboard',
    description: 'Track your career progress',
    icon: TrendingUp,
    route: '/career-dashboard',
    category: 'career',
    requiresAuth: true
  },
  {
    id: 'skills-assessment',
    name: 'Skills Assessment',
    description: 'Evaluate your skills',
    icon: Target,
    route: '/skills-assessment',
    category: 'career'
  },
  {
    id: 'passport',
    name: 'Career Passport',
    description: 'Your professional journey',
    icon: CreditCard,
    route: '/passport',
    category: 'career',
    requiresAuth: true
  },

  // Tools Modules
  {
    id: 'resume-builder',
    name: 'Resume Builder',
    description: 'Create professional resumes',
    icon: FileText,
    route: '/tools/resume-builder',
    category: 'tools'
  },
  {
    id: 'tools',
    name: 'Career Tools',
    description: 'Professional development tools',
    icon: PenTool,
    route: '/tools',
    category: 'tools'
  },
  {
    id: 'ai-career-hub',
    name: 'AI Career Hub',
    description: 'AI-powered career assistance',
    icon: Zap,
    route: '/ai-career-hub',
    category: 'tools',
    isNew: true
  },

  // Business Modules
  {
    id: 'companies',
    name: 'Companies',
    description: 'Explore organizations',
    icon: Building2,
    route: '/companies',
    category: 'business'
  },
  {
    id: 'colleges',
    name: 'Colleges',
    description: 'Educational institutions',
    icon: GraduationCap,
    route: '/colleges',
    category: 'business'
  },

  // Social & Engagement
  {
    id: 'gamification',
    name: 'Rewards',
    description: 'Earn points and achievements',
    icon: Trophy,
    route: '/gamification',
    category: 'social'
  },
  {
    id: 'refer-earn',
    name: 'Refer & Earn',
    description: 'Invite friends and earn rewards',
    icon: Gift,
    route: '/refer-and-earn',
    category: 'social'
  },
  {
    id: 'reels',
    name: 'Career Reels',
    description: 'Short-form career content',
    icon: Play,
    route: '/mobile/reels',
    category: 'social'
  },

  // Mobile Features
  {
    id: 'qr-scanner',
    name: 'QR Networking',
    description: 'Quick connect via QR codes',
    icon: QrCode,
    route: '/mobile/qr-scanner',
    category: 'mobile'
  },
  {
    id: 'nearby',
    name: 'Nearby',
    description: 'Find professionals nearby',
    icon: MapPin,
    route: '/mobile/nearby',
    category: 'mobile'
  },
  {
    id: 'hubs',
    name: 'TalentXcel Hubs',
    description: 'Organization communities',
    icon: Layers,
    route: '/mobile/hubs',
    category: 'mobile'
  }
];

const categoryLabels = {
  core: 'Core Features',
  career: 'Career Development',
  tools: 'Professional Tools',
  business: 'Organizations',
  social: 'Social & Engagement',
  mobile: 'Mobile Features'
};

const categoryColors = {
  core: 'from-blue-500 to-blue-600',
  career: 'from-green-500 to-green-600',
  tools: 'from-purple-500 to-purple-600',
  business: 'from-orange-500 to-orange-600',
  social: 'from-pink-500 to-pink-600',
  mobile: 'from-indigo-500 to-indigo-600'
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

  // Filter modules based on search and auth
  const filteredModules = modules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory ? module.category === selectedCategory : true;
    
    const hasAccess = module.requiresAuth ? !!user : true;
    
    return matchesSearch && matchesCategory && hasAccess;
  });

  // Group modules by category
  const groupedModules = filteredModules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, ModuleItem[]>);

  const handleModuleClick = (module: ModuleItem) => {
    navigate(module.route);
    onClose();
  };

  const categories = Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">All Modules</DialogTitle>
              <p className="text-muted-foreground mt-1">
                Access all TalentXcel features and tools
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 pb-4">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search modules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="whitespace-nowrap"
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {categoryLabels[category]}
              </Button>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1 px-6 pb-6">
          <div className="space-y-8">
            {Object.entries(groupedModules).map(([category, categoryModules]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <div className={cn(
                    "w-3 h-3 rounded-full bg-gradient-to-r",
                    categoryColors[category as keyof typeof categoryColors]
                  )} />
                  {categoryLabels[category as keyof typeof categoryLabels]}
                  <Badge variant="secondary" className="ml-2">
                    {categoryModules.length}
                  </Badge>
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryModules.map((module) => {
                    const Icon = module.icon;
                    return (
                      <Button
                        key={module.id}
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-start text-left hover:shadow-md transition-all duration-200 group"
                        onClick={() => handleModuleClick(module)}
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <div className={cn(
                            "p-2 rounded-lg bg-gradient-to-r group-hover:scale-110 transition-transform",
                            categoryColors[module.category]
                          )}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex gap-1">
                            {module.isNew && (
                              <Badge variant="default" className="text-xs">
                                New
                              </Badge>
                            )}
                            {module.isPro && (
                              <Badge variant="secondary" className="text-xs">
                                Pro
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="w-full">
                          <h4 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">
                            {module.name}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {module.description}
                          </p>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {filteredModules.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No modules found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};