import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Target,
  Brain,
  TrendingUp,
  Zap,
  Briefcase,
  BarChart3,
  Users,
  Award,
  Home,
  Search,
  GraduationCap,
  Building,
  Globe,
  PlayCircle
} from 'lucide-react';

const mainNavItems = [
  { title: "Learning Hub", url: "/learning", icon: Home },
  { title: "All Courses", url: "/learning/courses", icon: BookOpen, badge: "7K+" },
  { title: "My Learning", url: "/learning/my-courses", icon: Target },
  { title: "Search", url: "/learning/search", icon: Search },
];

const learningFeatures = [
  { title: "Learning Paths", url: "/learning/paths", icon: TrendingUp, badge: "AI" },
  { title: "Quick Learn", url: "/learning/quick-learn", icon: Zap, badge: "Fast" },
  { title: "Skill Assessment", url: "/learning/skill-assessment", icon: Brain, badge: "New" },
  { title: "Community", url: "/learning/community", icon: Users },
];

const careerTools = [
  { title: "Employment Bridge", url: "/learning/employment-bridge", icon: Briefcase, badge: "Jobs" },
  { title: "Career Analytics", url: "/learning/career-analytics", icon: BarChart3 },
  { title: "Certificates", url: "/learning/certificates", icon: Award },
];

const audienceLinks = [
  { title: "For Individuals", url: "/learning/individuals", icon: Users },
  { title: "For Businesses", url: "/learning/businesses", icon: Building },
  { title: "For Universities", url: "/learning/universities", icon: GraduationCap },
  { title: "For Governments", url: "/learning/governments", icon: Globe },
];

export function LearningAppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"}>
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent className="p-2">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} className={getNavCls({ isActive: isActive(item.url) })}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && (
                        <div className="flex items-center justify-between w-full">
                          <span>{item.title}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Learning Features */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Learning
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {learningFeatures.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} className={getNavCls({ isActive: isActive(item.url) })}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && (
                        <div className="flex items-center justify-between w-full">
                          <span>{item.title}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Career Tools */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Career
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {careerTools.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} className={getNavCls({ isActive: isActive(item.url) })}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && (
                        <div className="flex items-center justify-between w-full">
                          <span>{item.title}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Audience */}
        {!isCollapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Solutions
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {audienceLinks.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={item.url} className={getNavCls({ isActive: isActive(item.url) })}>
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
}