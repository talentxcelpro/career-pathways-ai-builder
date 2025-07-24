import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Briefcase,
  Building,
  FileText,
  Zap,
  BookOpen,
  GraduationCap,
  MessageSquare,
  Search,
  BarChart3
} from 'lucide-react';

export interface NotificationPillar {
  key: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  count?: number;
  description: string;
}

export const NOTIFICATION_PILLARS: NotificationPillar[] = [
  {
    key: 'all',
    label: 'All',
    icon: MessageSquare,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    description: 'All your career notifications in one place'
  },
  {
    key: 'network',
    label: 'Network',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: 'Connections, messages, and network insights'
  },
  {
    key: 'jobs',
    label: 'Jobs',
    icon: Briefcase,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    description: 'Job matches, applications, and opportunities'
  },
  {
    key: 'companies',
    label: 'Companies',
    icon: Building,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    description: 'Company updates, posts, and employer alerts'
  },
  {
    key: 'resume',
    label: 'Resume',
    icon: FileText,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    description: 'Resume feedback, downloads, and optimization tips'
  },
  {
    key: 'tools',
    label: 'Tools',
    icon: Zap,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    description: 'AI tools, insights, and career services'
  },
  {
    key: 'learning',
    label: 'Learning',
    icon: BookOpen,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    description: 'Courses, certifications, and skill updates'
  },
  {
    key: 'colleges',
    label: 'Colleges',
    icon: GraduationCap,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    description: 'Campus events, alumni, and university updates'
  },
  {
    key: 'career_feed',
    label: 'Career Feed',
    icon: MessageSquare,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
    description: 'Posts, articles, and trending career content'
  },
  {
    key: 'discover',
    label: 'Discover',
    icon: Search,
    color: 'text-rose-600',
    bgColor: 'bg-rose-100',
    description: 'New opportunities, analytics, and AI insights'
  }
];

interface NotificationPillarsProps {
  activePillar: string;
  onPillarChange: (pillar: string) => void;
  stats: Record<string, number>;
}

export const NotificationPillars: React.FC<NotificationPillarsProps> = ({
  activePillar,
  onPillarChange,
  stats
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2 p-4 bg-background/50 backdrop-blur-sm border-b">
      {NOTIFICATION_PILLARS.map((pillar) => {
        const Icon = pillar.icon;
        const isActive = activePillar === pillar.key;
        const count = stats[pillar.key] || 0;
        
        return (
          <Button
            key={pillar.key}
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onPillarChange(pillar.key)}
            className={`
              flex flex-col items-center gap-1 h-auto py-2 px-2 transition-all duration-200
              ${isActive 
                ? 'ring-2 ring-primary/20 shadow-lg' 
                : 'hover:bg-accent/50'
              }
            `}
            title={pillar.description}
          >
            <div className={`
              p-2 rounded-full transition-colors
              ${isActive ? 'bg-primary-foreground' : pillar.bgColor}
            `}>
              <Icon className={`
                h-4 w-4 transition-colors
                ${isActive ? 'text-primary' : pillar.color}
              `} />
            </div>
            <span className={`
              text-xs font-medium truncate w-full text-center
              ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}
            `}>
              {pillar.label}
            </span>
            {count > 0 && (
              <Badge 
                variant={isActive ? 'secondary' : 'outline'} 
                className="text-xs min-w-[20px] h-5 px-1"
              >
                {count > 99 ? '99+' : count}
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
};