
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from 'react-router-dom';
import { toast } from "sonner";
import { User, Settings, LogOut, Bell, Search, Briefcase, BookOpen, Users, Target, Building, GraduationCap, Wrench, Brain, Map, FileText, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    setProfile(data);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const navigationItems = [
    {
      title: "Jobs",
      href: "/jobs",
      icon: Briefcase,
      description: "Find and apply to opportunities",
      items: [
        { title: "Browse Jobs", href: "/jobs", description: "Search and filter job listings" },
        { title: "Saved Jobs", href: "/jobs/saved", description: "Your bookmarked positions" },
        { title: "Applied Jobs", href: "/jobs/applied", description: "Track your applications" },
        { title: "Post Job", href: "/jobs/post", description: "Post a new job opening" },
        { title: "Job Categories", href: "/jobs/categories", description: "Browse by category" },
        { title: "Manage Jobs", href: "/jobs/manage", description: "Employer job management" },
      ]
    },
    {
      title: "Network",
      href: "/network",
      icon: Users,
      description: "Connect with professionals",
      items: [
        { title: "People", href: "/network/people", description: "Find and connect with professionals" },
        { title: "Posts", href: "/network/posts", description: "Share and discover content" },
        { title: "Groups", href: "/network/groups", description: "Join professional communities" },
        { title: "Events", href: "/network/events", description: "Attend industry events" },
        { title: "Messages", href: "/network/messages", description: "Chat with connections" },
        { title: "Requests", href: "/network/requests", description: "Manage connection requests" },
      ]
    },
    {
      title: "Learning",
      href: "/learning",
      icon: BookOpen,
      description: "Develop your skills",
      items: [
        { title: "Browse Courses", href: "/learning", description: "Discover new skills" },
        { title: "My Courses", href: "/learning/my-courses", description: "Track your progress" },
        { title: "Learning Paths", href: "/learning/paths", description: "Structured skill development" },
        { title: "Certificates", href: "/learning/certificates", description: "View earned credentials" },
      ]
    },
    {
      title: "Career Map",
      href: "/career-map",
      icon: Map,
      description: "Plan your career journey",
      items: [
        { title: "Career Planner", href: "/career-map", description: "Interactive 5-year planning" },
        { title: "Generate Roadmap", href: "/career-map/generate", description: "AI-powered career paths" },
        { title: "Skills Gap Analysis", href: "/career-map/skills-gap", description: "Identify missing skills" },
        { title: "Career Recommendations", href: "/career-map/recommendations", description: "Personalized suggestions" },
        { title: "Career Comparison", href: "/career-map/comparison", description: "Compare different paths" },
      ]
    },
    {
      title: "Tools",
      href: "/tools",
      icon: Wrench,
      description: "AI-powered career tools",
      items: [
        { title: "Resume Builder", href: "/resume-builder", description: "Create ATS-friendly resumes" },
        { title: "Resume Check", href: "/tools/resume-check", description: "Optimize your resume" },
        { title: "Cover Letter", href: "/tools/cover-letter", description: "AI-powered cover letters" },
        { title: "AI Assistant", href: "/ai-assistant", description: "Smart career guidance" },
        { title: "AI Optimizer", href: "/ai-optimizer", description: "Profile optimization" },
      ]
    },
    {
      title: "More",
      href: "#",
      icon: Building,
      description: "Additional resources",
      items: [
        { title: "Companies", href: "/companies", description: "Explore employers" },
        { title: "Colleges", href: "/colleges", description: "Educational institutions" },
        { title: "Marketplace", href: "/marketplace", description: "Professional services" },
        { title: "Employer Dashboard", href: "/employer", description: "Employer tools" },
      ]
    }
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/9868d726-8a25-4c3f-a63e-fd765a142896.png" 
                alt="TalentXcel" 
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8 flex items-center">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search jobs, people, companies..."
                className="pl-10 bg-gray-50 border-gray-200"
              />
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Navigation Menu */}
                <NavigationMenu className="hidden lg:flex">
                  <NavigationMenuList>
                    {navigationItems.map((item) => (
                      <NavigationMenuItem key={item.title}>
                        <NavigationMenuTrigger className="text-sm font-medium text-gray-700 hover:text-gray-900">
                          <item.icon className="h-4 w-4 mr-1" />
                          {item.title}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                            {item.items.map((subItem) => (
                              <li key={subItem.title}>
                                <NavigationMenuLink asChild>
                                  <Link
                                    className={cn(
                                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                    )}
                                    to={subItem.href}
                                  >
                                    <div className="text-sm font-medium leading-none">{subItem.title}</div>
                                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                      {subItem.description}
                                    </p>
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                </NavigationMenu>

                {/* Mobile Navigation - Simple Links */}
                <div className="flex lg:hidden space-x-2">
                  <Link to="/jobs">
                    <Button variant="ghost" size="sm">
                      <Briefcase className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/network">
                    <Button variant="ghost" size="sm">
                      <Users className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/learning">
                    <Button variant="ghost" size="sm">
                      <BookOpen className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                {/* AI Assistant Quick Access */}
                <Link to="/ai-assistant">
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    <Brain className="h-4 w-4" />
                  </Button>
                </Link>

                {/* Notifications */}
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.profile_picture_url} alt={profile?.full_name || user.email} />
                        <AvatarFallback>
                          {profile?.full_name ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : user.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{profile?.full_name || 'User'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <Target className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/auth/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/auth/register">
                  <Button>Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
