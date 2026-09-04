// src/components/admin/AdminSidebar.tsx
// Consolidated High-Productivity Admin OS Command Navigation
// 8 Functional Hubs: Command & Growth, Security, Jobs & Talent, Colleges, Claim #1 B2B, TXC Treasury, Content, and AI Agents.

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  Building2, 
  Home, 
  Network, 
  Briefcase, 
  FileText, 
  GraduationCap, 
  Map, 
  CreditCard, 
  BarChart3, 
  Lock,
  Settings,
  Brain,
  Crown,
  Bot,
  TrendingUp,
  Newspaper,
  Rocket,
  Search,
  Coins,
  Database,
  Globe,
  Zap,
  Target,
  Mail,
  Code,
  Gift,
  Trophy,
  Layers,
  Activity,
  Linkedin
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { useAdminStats } from '@/hooks/useAdminStats';

// 1. COMMAND & GROWTH ENGINE
const growthCommandItems = [
  {
    title: 'AI Growth Organization',
    url: '/admin/ai-organization',
    icon: Bot,
    description: 'AI CEO & Specialist Agents Control',
    badge: 'AI CEO'
  },
  {
    title: 'Growth Operations Center',
    url: '/admin/growth-operations',
    icon: TrendingUp,
    description: 'Empirical revenue & leak detection',
    badge: 'NEW'
  },
  {
    title: 'Autonomous Growth OS',
    url: '/admin/autonomous-os',
    icon: Rocket,
    description: '100M Keywords & GSC Governor',
    badge: 'LIVE'
  },
  {
    title: 'Analytics & Insights',
    url: '/admin/analytics',
    icon: BarChart3,
    description: 'Growth & user metrics'
  },
  {
    title: 'Feature Flags',
    url: '/admin/feature-flags',
    icon: Zap,
    description: 'Rollout controls & flags'
  }
];

// 2. USER & SECURITY CENTER
const securityItems = [
  {
    title: 'User Management',
    url: '/admin/users',
    icon: Users,
    description: 'All candidates & Pro accounts'
  },
  {
    title: 'Admin Management',
    url: '/admin/admins',
    icon: Settings,
    description: 'RBAC & administrator roles'
  },
  {
    title: 'Security & Multi-Sig Audit',
    url: '/admin/security',
    icon: Lock,
    description: 'SHA-256 ledger & 2-phone lock'
  }
];

// 3. JOBS & TALENT DATABASE
const talentJobsItems = [
  {
    title: 'Jobs Management',
    url: '/admin/jobs',
    icon: Briefcase,
    description: 'Manage verified job inventory'
  },
  {
    title: 'Talent Database',
    url: '/admin/talent-database',
    icon: Database,
    description: 'Verified candidate passports'
  },
  {
    title: 'Resume Diagnostics Hub',
    url: '/admin/resumes',
    icon: FileText,
    description: 'ATS templates & audit metrics'
  },
  {
    title: 'LinkedIn Importer',
    url: '/admin/linkedin-importer',
    icon: Linkedin,
    description: 'Profile import pipeline'
  }
];

// 4. COLLEGES & INSTITUTIONAL GATEWAYS
const collegeItems = [
  {
    title: '10,250 Colleges Directory',
    url: '/admin/colleges',
    icon: GraduationCap,
    description: 'Institutional verification'
  },
  {
    title: 'TPO Batch Cohorts Gateway',
    url: '/colleges/batch',
    icon: Target,
    description: 'College screening & circulars',
    badge: 'TPO'
  },
  {
    title: 'Career Pathways & Maps',
    url: '/admin/career-map',
    icon: Map,
    description: 'AI education pathways'
  },
  {
    title: 'Learning Courses',
    url: '/admin/learning',
    icon: Layers,
    description: 'Course pathways & curricula'
  }
];

// 5. CLAIM #1 & B2B SPONSORSHIPS
const b2bItems = [
  {
    title: 'Claim #1 Bidding & Rankings',
    url: '/admin/claim1',
    icon: Trophy,
    description: 'B2B rankings & bid moderation',
    badge: 'B2B'
  },
  {
    title: 'Employer Requests',
    url: '/admin/employer-requests',
    icon: Building2,
    description: 'Review employer onboarding',
    badge: 'dynamic'
  },
  {
    title: 'Companies & Verification',
    url: '/admin/companies',
    icon: Shield,
    description: 'Company profiles & badges'
  },
  {
    title: 'Enterprise Solutions',
    url: '/admin/enterprise-overview',
    icon: Crown,
    description: 'Enterprise accounts & billing'
  }
];

// 6. TXC TREASURY & MONETIZATION
const txcItems = [
  {
    title: 'TXC Treasury Management',
    url: '/admin/txc-tokens',
    icon: Coins,
    description: 'Token circulation & mining'
  },
  {
    title: 'TXC Awards & Multi-Sig',
    url: '/admin/txc-awards',
    icon: Gift,
    description: 'Tiered grants & dual control'
  },
  {
    title: 'Payment Gateways & Invoices',
    url: '/admin/payments',
    icon: CreditCard,
    description: 'Razorpay billing & revenue'
  }
];

// 7. CONTENT & COMMUNITY NETWORK
const contentItems = [
  {
    title: 'Network & Feed Moderation',
    url: '/admin/network',
    icon: Network,
    description: 'Social posts & community'
  },
  {
    title: 'News & Media Automation',
    url: '/admin/news-management',
    icon: Newspaper,
    description: 'Articles & verified sources'
  },
  {
    title: 'Email Automations',
    url: '/admin/email-automation',
    icon: Mail,
    description: 'Lifecycle triggers & circulars'
  },
  {
    title: 'Home Content CMS',
    url: '/admin/home',
    icon: Home,
    description: 'Homepage curation'
  }
];

// 8. AI AGENTS & INFRASTRUCTURE
const aiItems = [
  {
    title: 'AI Growth Organization',
    url: '/admin/ai-organization',
    icon: Bot,
    description: 'Master control plane & kill switch',
    badge: 'ONLINE'
  },
  {
    title: 'AI Agent Fleet Operations',
    url: '/admin/agent-operations',
    icon: Bot,
    description: '8 autonomous daemons'
  },
  {
    title: 'AI Management & Prompts',
    url: '/admin/ai-management',
    icon: Brain,
    description: 'Models, tokens & prompt rules'
  },
  {
    title: 'Edge Functions & API Monitor',
    url: '/admin/edge-functions-monitor',
    icon: Activity,
    description: 'Live runtime health & logs'
  }
];

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { stats } = useAdminStats();

  const renderGroup = (label: string, items: any[]) => (
    <SidebarGroup key={label} className="py-2">
      <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-0.5">
          {items.map((item) => {
            const isActive = location.pathname === item.url || (item.url !== '/admin' && location.pathname.startsWith(item.url));
            const Icon = item.icon;

            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <NavLink
                    to={item.url}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span className="truncate">{item.title}</span>
                    </div>

                    {item.badge === 'dynamic' ? (
                      stats?.pending_employers ? (
                        <Badge className="bg-rose-500 text-white text-[10px] px-1.5 py-0 h-4">
                          {stats.pending_employers}
                        </Badge>
                      ) : null
                    ) : item.badge ? (
                      <Badge className={`text-[9px] px-1.5 py-0 h-4 ${isActive ? 'bg-white text-blue-700' : 'bg-blue-100 text-blue-800'}`}>
                        {item.badge}
                      </Badge>
                    ) : null}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar className="border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <SidebarContent className="p-2 space-y-1">
        {renderGroup('Command & Growth', growthCommandItems)}
        {renderGroup('User & Security Center', securityItems)}
        {renderGroup('Jobs & Talent', talentJobsItems)}
        {renderGroup('Colleges & TPO Cohorts', collegeItems)}
        {renderGroup('Claim #1 & B2B Sponsors', b2bItems)}
        {renderGroup('TXC Treasury & Monetization', txcItems)}
        {renderGroup('Content & Community', contentItems)}
        {renderGroup('AI Agents & Infrastructure', aiItems)}
      </SidebarContent>
    </Sidebar>
  );
};
