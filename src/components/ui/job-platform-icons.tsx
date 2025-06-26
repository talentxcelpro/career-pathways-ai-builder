
import React from 'react';
import { 
  TrendingUp, 
  Wifi, 
  Globe, 
  Star, 
  Badge, 
  Building, 
  Brain, 
  Sparkles, 
  Bell, 
  BarChart3 
} from 'lucide-react';
import { DashboardIcon } from './dashboard-icon';

export const jobPlatformIcons = {
  activeJobs: TrendingUp,
  remoteJobs: Wifi,
  globalJobs: Globe,
  featuredJobs: Star,
  premiumJobs: Badge,
  companies: Building,
  aiMatching: Brain,
  aiRecommendations: Sparkles,
  jobAlerts: Bell,
  analytics: BarChart3,
} as const;

export type JobPlatformIconKey = keyof typeof jobPlatformIcons;

interface JobPlatformIconProps {
  iconKey: JobPlatformIconKey;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'accent' | 'neutral';
  className?: string;
  animated?: boolean;
}

export const JobPlatformIcon: React.FC<JobPlatformIconProps> = ({
  iconKey,
  ...props
}) => {
  const IconComponent = jobPlatformIcons[iconKey];
  
  return <DashboardIcon icon={IconComponent} {...props} />;
};
