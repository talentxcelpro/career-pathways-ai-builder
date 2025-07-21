
import React from 'react';
import { 
  Sidebar,
  SidebarContent, 
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Building2, 
  GraduationCap, 
  Network, 
  Wrench, 
  FileText, 
  Map,
  UserCheck,
  Shield,
  BarChart3,
  Settings,
  Crown,
  UserPlus
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';

interface SidebarItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: keyof import('@/types/admin').AdminPermissions;
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
    permission: 'canAccessDashboard'
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
    permission: 'canAccessUsers'
  },
  {
    title: "Jobs",
    url: "/admin/jobs",
    icon: Briefcase,
    permission: 'canAccessJobs'
  },
  {
    title: "Companies",
    url: "/admin/companies",
    icon: Building2,
    permission: 'canAccessCompanies'
  },
  {
    title: "Learning",
    url: "/admin/learning",
    icon: GraduationCap,
    permission: 'canAccessLearning'
  },
  {
    title: "Network",
    url: "/admin/network",
    icon: Network,
    permission: 'canAccessNetwork'
  },
  {
    title: "Tools",
    url: "/admin/tools",
    icon: Wrench,
    permission: 'canAccessTools'
  },
  {
    title: "Resumes",
    url: "/admin/resumes",
    icon: FileText,
    permission: 'canAccessResumes'
  },
  {
    title: "Career Map",
    url: "/admin/career-map",
    icon: Map,
    permission: 'canAccessCareerMap'
  },
  {
    title: "Employer Requests",
    url: "/admin/employer-requests",
    icon: UserCheck,
    permission: 'canAccessEmployerRequests'
  }
];

const managementItems: SidebarItem[] = [
  {
    title: "Admin Management",
    url: "/admin/admins",
    icon: Shield,
    permission: 'canAccessAdmins'
  },
  {
    title: "Bulk Admin Creation",
    url: "/admin/bulk-create",
    icon: UserPlus,
    permission: 'canAccessAdmins'
  },
  {
    title: "Analytics",
    url: "/admin/analytics",
    icon: BarChart3,
    permission: 'canAccessAnalytics'
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
    permission: 'canAccessSecurity'
  }
];

export const AdminSidebar = () => {
  const location = useLocation();
  const { hasPermission } = useAdminPermissions();

  const isActive = (url: string) => {
    if (url === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(url);
  };

  const filteredSidebarItems = sidebarItems.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  const filteredManagementItems = managementItems.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  return (
    <Sidebar className="border-r bg-white">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <Crown className="h-6 w-6 text-yellow-500" />
          <span className="font-bold text-lg">TalentXcel Admin</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredSidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={isActive(item.url)}
                  >
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {filteredManagementItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredManagementItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      isActive={isActive(item.url)}
                    >
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};
