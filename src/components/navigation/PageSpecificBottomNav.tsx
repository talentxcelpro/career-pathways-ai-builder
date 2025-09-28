import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Home, 
  Search, 
  Briefcase, 
  MessageCircle, 
  User,
  Heart,
  Users,
  UserPlus,
  Plus,
  BookOpen,
  Settings,
  TrendingUp,
  Building,
  GraduationCap,
  Zap,
  Target,
  FileText,
  PenTool,
  Play,
  Gift,
  Send,
  Grid3X3
} from 'lucide-react';
import { ModulesLauncher } from '@/components/mobile/ModulesLauncher';

export interface BottomNavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  action: () => void;
  isActive?: boolean;
  isPrimary?: boolean;
}

interface PageSpecificBottomNavProps {
  className?: string;
}

const getPageNavigation = (currentPath: string, navigate: any): BottomNavItem[] => {
  const basePath = currentPath.split('?')[0]; // Remove query params
  
  switch (true) {
    // Jobs Page Navigation
    case basePath === '/jobs' || basePath.startsWith('/jobs/'):
      return [
        {
          icon: Home,
          label: 'Home',
          action: () => navigate('/'),
          isActive: false
        },
        {
          icon: Search,
          label: 'Search',
          action: () => navigate('/jobs?focus=search'),
          isActive: false
        },
        {
          icon: Zap,
          label: 'Quick Apply',
          action: () => {
            // Trigger quick apply modal or action
            const event = new CustomEvent('openQuickApply');
            window.dispatchEvent(event);
          },
          isPrimary: true
        },
        {
          icon: MessageCircle,
          label: 'Messages',
          action: () => navigate('/network/messages'),
          isActive: false
        },
        {
          icon: User,
          label: 'Profile',
          action: () => navigate('/profile'),
          isActive: false
        }
      ];

    // Network Page Navigation  
    case basePath === '/network' || basePath.startsWith('/network/'):
      return [
        {
          icon: Users,
          label: 'Network',
          action: () => navigate('/network'),
          isActive: true
        },
        {
          icon: Play,
          label: 'Reels',
          action: () => navigate('/mobile/reels'),
          isActive: false
        },
        {
          icon: Briefcase,
          label: 'Jobs',
          action: () => navigate('/jobs'),
          isActive: false
        },
        {
          icon: Gift,
          label: 'Rewards',
          action: () => navigate('/gamification'),
          isActive: false
        },
        {
          icon: Send,
          label: 'Refer',
          action: () => navigate('/refer-and-earn'),
          isActive: false
        }
      ];

    // Learning Page Navigation
    case basePath === '/learning' || basePath.startsWith('/learning/'):
      return [
        {
          icon: Home,
          label: 'Home',
          action: () => navigate('/'),
          isActive: false
        },
        {
          icon: BookOpen,
          label: 'Courses',
          action: () => navigate('/learning'),
          isActive: basePath === '/learning'
        },
        {
          icon: Plus,
          label: 'Enroll',
          action: () => {
            // Trigger course enrollment modal or navigate to learning
            navigate('/learning');
          },
          isPrimary: true
        },
        {
          icon: MessageCircle,
          label: 'Messages',
          action: () => navigate('/network/messages'),
          isActive: false
        },
        {
          icon: User,
          label: 'Profile',
          action: () => navigate('/profile'),
          isActive: false
        }
      ];

    // Companies Page Navigation
    case basePath === '/companies' || basePath.startsWith('/companies/'):
      return [
        {
          icon: Home,
          label: 'Home',
          action: () => navigate('/'),
          isActive: false
        },
        {
          icon: Search,
          label: 'Search',
          action: () => navigate('/companies'),
          isActive: false
        },
        {
          icon: Heart,
          label: 'Follow',
          action: () => {
            // Navigate to companies page to explore and follow
            navigate('/companies');
          },
          isPrimary: true
        },
        {
          icon: Building,
          label: 'Directory',
          action: () => navigate('/companies'),
          isActive: basePath === '/companies'
        },
        {
          icon: User,
          label: 'Profile',
          action: () => navigate('/profile'),
          isActive: false
        }
      ];

    // Colleges Page Navigation
    case basePath === '/colleges' || basePath.startsWith('/colleges/'):
      return [
        {
          icon: Home,
          label: 'Home',
          action: () => navigate('/'),
          isActive: false
        },
        {
          icon: Search,
          label: 'Search',
          action: () => navigate('/colleges'),
          isActive: false
        },
        {
          icon: GraduationCap,
          label: 'Apply',
          action: () => {
            // Navigate to colleges page to explore opportunities
            navigate('/colleges');
          },
          isPrimary: true
        },
        {
          icon: MessageCircle,
          label: 'Messages',
          action: () => navigate('/network/messages'),
          isActive: false
        },
        {
          icon: User,
          label: 'Profile',
          action: () => navigate('/profile'),
          isActive: false
        }
      ];

    // Profile Page Navigation
    case basePath === '/profile' || basePath.startsWith('/profile/'):
      return [
        {
          icon: Home,
          label: 'Home',
          action: () => navigate('/'),
          isActive: false
        },
        {
          icon: TrendingUp,
          label: 'Analytics',
          action: () => navigate('/profile?tab=analytics'),
          isActive: false
        },
        {
          icon: PenTool,
          label: 'Edit',
          action: () => navigate('/profile?edit=true'),
          isPrimary: true
        },
        {
          icon: MessageCircle,
          label: 'Messages',
          action: () => navigate('/network/messages'),
          isActive: false
        },
        {
          icon: Settings,
          label: 'Settings',
          action: () => navigate('/profile?tab=settings'),
          isActive: false
        }
      ];

    // Career Dashboard Navigation
    case basePath === '/career-dashboard' || basePath.startsWith('/career-dashboard/'):
      return [
        {
          icon: Home,
          label: 'Home',
          action: () => navigate('/'),
          isActive: false
        },
        {
          icon: TrendingUp,
          label: 'Insights',
          action: () => navigate('/career-dashboard?tab=insights'),
          isActive: false
        },
        {
          icon: Target,
          label: 'Goals',
          action: () => navigate('/career-dashboard?tab=goals'),
          isPrimary: true
        },
        {
          icon: Briefcase,
          label: 'Jobs',
          action: () => navigate('/jobs'),
          isActive: false
        },
        {
          icon: User,
          label: 'Profile',
          action: () => navigate('/profile'),
          isActive: false
        }
      ];

    // Resume Builder Navigation
    case basePath.includes('/resume') || basePath.includes('/tools'):
      return [
        {
          icon: Home,
          label: 'Home',
          action: () => navigate('/'),
          isActive: false
        },
        {
          icon: FileText,
          label: 'Templates',
          action: () => navigate('/resume/templates'),
          isActive: false
        },
        {
          icon: Zap,
          label: 'AI Build',
          action: () => {
            // Navigate to resume builder
            navigate('/tools/resume-builder');
          },
          isPrimary: true
        },
        {
          icon: MessageCircle,
          label: 'Messages',
          action: () => navigate('/network/messages'),
          isActive: false
        },
        {
          icon: User,
          label: 'Profile',
          action: () => navigate('/profile'),
          isActive: false
        }
      ];

    // Profile Network Page Navigation
    case basePath === '/profile/network' || basePath.startsWith('/profile/network/'):
      return [
        {
          icon: Home,
          label: 'Home',
          action: () => navigate('/'),
          isActive: false
        },
        {
          icon: Briefcase,
          label: 'Jobs',
          action: () => navigate('/jobs'),
          isActive: false
        },
        {
          icon: Play,
          label: 'Reels',
          action: () => navigate('/mobile/reels'),
          isPrimary: true
        },
        {
          icon: Gift,
          label: 'Reward',
          action: () => navigate('/gamification'),
          isActive: false
        },
        {
          icon: Send,
          label: 'Refer',
          action: () => navigate('/refer-and-earn'),
          isActive: false
        }
      ];

    // Mobile Reels (keep existing)
    case basePath === '/mobile/reels':
      return [
        {
          icon: Home,
          label: 'Home',
          action: () => navigate('/'),
          isActive: false
        },
        {
          icon: Heart,
          label: 'Activity',
          action: () => navigate('/mobile/network'),
          isActive: false
        },
        {
          icon: Plus,
          label: 'Create',
          action: () => {
            // Existing reels upload logic
            const event = new CustomEvent('openReelsUpload');
            window.dispatchEvent(event);
          },
          isPrimary: true
        },
        {
          icon: MessageCircle,
          label: 'Messages',
          action: () => navigate('/network/messages'),
          isActive: false
        },
        {
          icon: User,
          label: 'Profile',
          action: () => navigate('/mobile/profile'),
          isActive: false
        }
      ];

    // Default Navigation (for other pages)
    default:
      return [
        {
          icon: Users,
          label: 'Network',
          action: () => navigate('/network'),
          isActive: false
        },
        {
          icon: Play,
          label: 'Reels',
          action: () => navigate('/mobile/reels'),
          isActive: false
        },
        {
          icon: Briefcase,
          label: 'Jobs',
          action: () => navigate('/jobs'),
          isActive: false
        },
        {
          icon: Gift,
          label: 'Rewards',
          action: () => navigate('/gamification'),
          isActive: false
        },
        {
          icon: Send,
          label: 'Refer',
          action: () => navigate('/refer-and-earn'),
          isActive: false
        }
      ];
  }
};

export const PageSpecificBottomNav: React.FC<PageSpecificBottomNavProps> = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [showModulesLauncher, setShowModulesLauncher] = useState(false);

  // Don't render on desktop or in certain contexts
  if (!isMobile) return null;

  const navigationItems = getPageNavigation(location.pathname, navigate);
  const isDefaultNav = location.pathname === '/';

  return (
    <>
      {/* Transparent More Button for Default Navigation */}
      {isDefaultNav && (
        <div 
          onClick={() => setShowModulesLauncher(true)}
          className="fixed top-4 right-4 z-50 bg-black/20 backdrop-blur-sm border border-white/20 rounded-full p-3 text-white hover:bg-black/30 transition-all duration-300 cursor-pointer"
        >
          <Grid3X3 className="h-5 w-5" />
        </div>
      )}

      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black via-black/90 to-transparent backdrop-blur-md",
        "border-t border-white/10",
        className
      )}>
        <div className="flex items-center justify-around py-3 px-4 max-w-md mx-auto">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                size="icon"
                onClick={item.action}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all duration-200 min-h-[44px] touch-target",
                  item.isPrimary 
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 rounded-xl h-14 w-14 shadow-lg transform hover:scale-105" 
                    : item.isActive
                      ? "text-white bg-white/20 rounded-xl h-12 w-12"
                      : "text-white/70 hover:text-white hover:bg-white/10 rounded-xl h-12 w-12"
                )}
              >
                <Icon className={cn(
                  item.isPrimary ? "h-6 w-6" : "h-5 w-5"
                )} />
                {!item.isPrimary && (
                  <span className="text-xs font-medium">{item.label}</span>
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Modules Launcher Modal */}
      <ModulesLauncher 
        isOpen={showModulesLauncher}
        onClose={() => setShowModulesLauncher(false)}
      />
    </>
  );
};
