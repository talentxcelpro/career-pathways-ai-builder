import React from 'react';
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
  Gauge,
  Sparkles,
  Radio,
  FileText,
  PenTool,
  Play,
  Gift,
  Send
} from 'lucide-react';

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
          action: () => navigate('/career-os'),
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
          action: () => navigate('/communication/messages'),
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
          icon: Home,
          label: 'Home',
          action: () => navigate('/career-os'),
          isActive: false
        },
        {
          icon: Users,
          label: 'Pulse',
          action: () => navigate('/network'),
          isActive: true
        },
        {
          icon: PenTool,
          label: 'Post',
          action: () => {
            window.dispatchEvent(new CustomEvent('networkComposerFocus'));
          },
          isPrimary: true
        },
        {
          icon: Briefcase,
          label: 'Matches',
          action: () => navigate('/talent-beacon'),
          isActive: false
        },
        {
          icon: Sparkles,
          label: 'Navigator',
          action: () => navigate('/navigator'),
          isActive: false
        }
      ];

    // Learning Page Navigation
    case basePath === '/learning' || basePath.startsWith('/learning/'):
      return [
        {
          icon: Home,
          label: 'Home',
          action: () => navigate('/career-os'),
          isActive: false
        },
        {
          icon: BookOpen,
          label: 'Capability Hub',
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
          action: () => navigate('/communication/messages'),
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
          action: () => navigate('/career-os'),
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
          action: () => navigate('/career-os'),
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
          action: () => navigate('/communication/messages'),
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
          action: () => navigate('/career-os'),
          isActive: false
        },
        {
          icon: TrendingUp,
          label: 'Performance',
          action: () => navigate('/profile?tab=Performance'),
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
          action: () => navigate('/communication/messages'),
          isActive: false
        },
        {
          icon: Settings,
          label: 'Settings',
          action: () => navigate('/profile?tab=settings'),
          isActive: false
        }
      ];

    // Career CommandCenter Navigation
    case basePath === '/career-CommandCenter' || basePath.startsWith('/career-CommandCenter/'):
      return [
        {
          icon: Home,
          label: 'Home',
          action: () => navigate('/career-os'),
          isActive: false
        },
        {
          icon: TrendingUp,
          label: 'Ecosystem Intelligence',
          action: () => navigate('/career-CommandCenter?tab=insights'),
          isActive: false
        },
        {
          icon: Target,
          label: 'Goals',
          action: () => navigate('/career-CommandCenter?tab=goals'),
          isPrimary: true
        },
        {
          icon: Briefcase,
          label: 'Precision Matches',
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
          action: () => navigate('/career-os'),
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
          label: 'Identity Hub',
          action: () => {
            // Navigate to resume builder
            navigate('/resume');
          },
          isPrimary: true
        },
        {
          icon: MessageCircle,
          label: 'Messages',
          action: () => navigate('/communication/messages'),
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
          action: () => navigate('/career-os'),
          isActive: false
        },
        {
          icon: Briefcase,
          label: 'Precision Matches',
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
          action: () => navigate('/career-os'),
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
          action: () => navigate('/communication/messages'),
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
    case basePath === '/career-os':
    default:
      return [
        {
          icon: Home,
          label: 'Home',
          action: () => navigate('/career-os'),
          isActive: basePath === '/career-os' || basePath === '/'
        },
        {
          icon: Gauge,
          label: 'Score',
          action: () => navigate('/talent-score'),
          isActive: basePath === '/talent-score'
        },
        {
          icon: Briefcase,
          label: 'Matches',
          action: () => navigate('/talent-beacon'),
          isActive: basePath === '/talent-beacon' || basePath === '/jobs'
        },
        {
          icon: Users,
          label: 'Pulse',
          action: () => navigate('/network'),
          isActive: basePath === '/network'
        },
        {
          icon: Sparkles,
          label: 'Navigator',
          action: () => navigate('/navigator'),
          isActive: basePath === '/navigator'
        }
      ];
  }
};

export const PageSpecificBottomNav: React.FC<PageSpecificBottomNavProps> = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Don't render on desktop or in certain contexts
  if (!isMobile) {
    return null;
  }

  const navigationItems = getPageNavigation(location.pathname, navigate);
  const bottomNavStyle = {
    bottom: 'max(env(safe-area-inset-bottom), 0.75rem)',
    paddingBottom: 'max(env(safe-area-inset-bottom), 0.25rem)',
  } as const;

  return (
    <>
      <div className={cn(
        "fixed left-3 right-3 z-[999] rounded-[30px] border border-slate-200/70 bg-white/90 shadow-[0_18px_48px_rgba(15,23,42,0.12)] backdrop-blur-3xl",
        className
      )} style={bottomNavStyle}>
        <div className="mx-auto flex max-w-md items-center justify-between gap-1.5 px-2 py-2.5">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                size="icon"
                onClick={item.action}
                className={cn(
                  "touch-target relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 transition-all duration-200",
                  item.isPrimary 
                    ? "mx-auto h-14 w-14 flex-none bg-slate-950 !text-white shadow-lg hover:scale-105 hover:bg-slate-800 [&_*]:!text-white"
                    : item.isActive
                      ? "min-h-[62px] bg-blue-50 !text-blue-700 [&_*]:!text-blue-700"
                      : "min-h-[62px] text-slate-500 hover:text-slate-950 hover:bg-slate-100"
                )}
              >
                <Icon className={cn(
                  item.isPrimary ? "h-6 w-6" : "h-5 w-5",
                  item.isPrimary ? "!text-white" : item.isActive ? "!text-blue-700" : "text-slate-500"
                )} />
                {!item.isPrimary && (
                  <span
                    className={cn(
                      "w-full px-0.5 text-center text-[10px] font-apple-bold leading-tight whitespace-nowrap",
                      item.isActive ? "!text-blue-700" : "text-slate-600"
                    )}
                  >
                    {item.label}
                  </span>
                )}
                {item.isPrimary && (
                  <span className="sr-only">{item.label}</span>
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </>
  );
};
