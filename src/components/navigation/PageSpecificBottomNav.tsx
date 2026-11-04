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
            navigate('/resume');
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
    case basePath === '/mobile/reels' || basePath === '/reels':
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
          action: () => navigate('/network/people'),
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

  console.log('PageSpecificBottomNav - isMobile:', isMobile, 'currentPath:', location.pathname);
  
  // Don't render on desktop or in certain contexts
  if (!isMobile) {
    console.log('PageSpecificBottomNav - Not mobile, returning null');
    return null;
  }

  const navigationItems = getPageNavigation(location.pathname, navigate);
  const isDefaultNav = location.pathname === '/';
  const isNetworkPage = location.pathname === '/network' || location.pathname.startsWith('/network/');

  return (
    <>
      {/* Transparent More Button for Default Navigation and Network Page */}
      {(isDefaultNav || isNetworkPage) && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowModulesLauncher(true)}
          className="fixed top-4 right-4 z-50 bg-black/20 backdrop-blur-sm border border-white/20 rounded-full p-3 text-white hover:bg-black/30 transition-all duration-300"
        >
          <Grid3X3 className="h-5 w-5" />
        </Button>
      )}

      {/* Modules Launcher Modal */}
      <ModulesLauncher 
        isOpen={showModulesLauncher} 
        onClose={() => setShowModulesLauncher(false)} 
      />

      {/* Apple-Style Sleek Mobile Bottom Tab Bar */}
      <nav 
        aria-label="Mobile Navigation"
        className={cn(
          "fixed bottom-0 left-0 right-0 z-[999]",
          "bg-white/85 dark:bg-[#121214]/85 backdrop-blur-xl",
          "border-t border-slate-200/80 dark:border-white/10",
          "shadow-[0_-1px_4px_rgba(0,0,0,0.04)]",
          "pb-[max(0.25rem,env(safe-area-inset-bottom))]",
          className
        )}
      >
        <div className="flex items-center justify-around px-2 max-w-md mx-auto h-[50px]">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                type="button"
                onClick={item.action}
                aria-label={item.label}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full py-0.5 transition-colors touch-manipulation select-none outline-none group",
                  item.isActive
                    ? "text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                {item.isPrimary ? (
                  <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full h-8 w-8 flex items-center justify-center shadow-xs group-active:scale-95 transition-transform -mt-1">
                    <Icon className="h-4 w-4 stroke-[2.2]" />
                  </div>
                ) : (
                  <>
                    <Icon className={cn(
                      "h-[20px] w-[20px] transition-transform group-active:scale-90",
                      item.isActive ? "stroke-[2.2]" : "stroke-[1.75]"
                    )} />
                    <span className="text-[10px] tracking-tight leading-none mt-1">
                      {item.label}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </nav>


    </>
  );
};
