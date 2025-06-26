
import { NavItem } from '@/types/routes';
import { ROUTES } from '@/constants/routes';
import { 
  HomeIcon, 
  TrendingUp, 
  FileText, 
  Briefcase, 
  Users, 
  BookOpen, 
  Wrench, 
  Brain, 
  Compass, 
  Building, 
  School,
  User
} from "lucide-react";

export const getNavigationItems = (userRole?: string): NavItem[] => {
  const baseItems: NavItem[] = [
    {
      title: "Home",
      path: ROUTES.HOME,
      icon: <HomeIcon className="h-4 w-4" />
    },
    {
      title: "Dashboard",
      path: ROUTES.DASHBOARD,
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      title: "Resume Builder",
      path: ROUTES.RESUME_BUILDER,
      icon: <FileText className="h-4 w-4" />
    },
    {
      title: "Jobs",
      path: ROUTES.JOBS,
      icon: <Briefcase className="h-4 w-4" />,
      children: [
        { title: "Browse Jobs", path: ROUTES.JOBS },
        { title: "Saved Jobs", path: ROUTES.JOBS_SAVED },
        { title: "Applied Jobs", path: ROUTES.JOBS_APPLIED },
        { title: "Job Categories", path: ROUTES.JOBS_CATEGORIES },
        { title: "Companies", path: ROUTES.JOBS_COMPANIES },
        { title: "Recommendations", path: ROUTES.JOBS_RECOMMENDATIONS },
        { title: "Job Alerts", path: ROUTES.JOBS_ALERTS },
        { title: "Analytics", path: ROUTES.JOB_ANALYTICS }
      ]
    },
    {
      title: "Network",
      path: ROUTES.NETWORK,
      icon: <Users className="h-4 w-4" />,
      children: [
        { title: "People", path: ROUTES.NETWORK_PEOPLE },
        { title: "Posts", path: ROUTES.NETWORK_POSTS },
        { title: "Groups", path: ROUTES.NETWORK_GROUPS },
        { title: "Events", path: ROUTES.NETWORK_EVENTS },
        { title: "Messages", path: ROUTES.NETWORK_MESSAGES },
        { title: "Notifications", path: ROUTES.NETWORK_NOTIFICATIONS }
      ]
    },
    {
      title: "Learning",
      path: ROUTES.LEARNING,
      icon: <BookOpen className="h-4 w-4" />,
      children: [
        { title: "Browse Courses", path: ROUTES.LEARNING },
        { title: "My Courses", path: ROUTES.LEARNING_MY_COURSES },
        { title: "Learning Paths", path: ROUTES.LEARNING_PATHS },
        { title: "Certificates", path: ROUTES.LEARNING_CERTIFICATES }
      ]
    },
    {
      title: "Tools",
      path: ROUTES.TOOLS,
      icon: <Wrench className="h-4 w-4" />,
      children: [
        { title: "Tools Dashboard", path: ROUTES.TOOLS_DASHBOARD },
        { title: "Resume Checker", path: ROUTES.TOOLS_RESUME_CHECK },
        { title: "Cover Letter", path: ROUTES.TOOLS_COVER_LETTER },
        { title: "Salary Analyzer", path: ROUTES.TOOLS_SALARY_ANALYZER },
        { title: "Interview Prep", path: ROUTES.TOOLS_INTERVIEW_PREP },
        { title: "AI Assistant", path: ROUTES.TOOLS_AI_ASSISTANT },
        { title: "Profile Score", path: ROUTES.TOOLS_PROFILE_SCORE },
        { title: "Market Insights", path: ROUTES.TOOLS_MARKET_INSIGHTS }
      ]
    },
    {
      title: "AI Assistant",
      path: ROUTES.AI_ASSISTANT,
      icon: <Brain className="h-4 w-4" />
    },
    {
      title: "Career Map",
      path: ROUTES.CAREER_MAP,
      icon: <Compass className="h-4 w-4" />,
      children: [
        { title: "Career Map", path: ROUTES.CAREER_MAP },
        { title: "Generate Map", path: ROUTES.CAREER_MAP_GENERATE },
        { title: "AI Roadmap Builder", path: ROUTES.CAREER_MAP_AI_ROADMAP },
        { title: "My Roadmaps", path: ROUTES.CAREER_MAP_MY_ROADMAPS },
        { title: "Skills Gap Analysis", path: ROUTES.CAREER_MAP_SKILLS_GAP },
        { title: "Recommendations", path: ROUTES.CAREER_MAP_RECOMMENDATIONS },
        { title: "Comparison", path: ROUTES.CAREER_MAP_COMPARISON }
      ]
    },
    {
      title: "Companies",
      path: ROUTES.COMPANIES,
      icon: <Building className="h-4 w-4" />
    },
    {
      title: "Colleges",
      path: ROUTES.COLLEGES,
      icon: <School className="h-4 w-4" />
    },
    {
      title: "Profile",
      path: ROUTES.PROFILE,
      icon: <User className="h-4 w-4" />,
      children: [
        { title: "View Profile", path: ROUTES.PROFILE },
        { title: "Edit Profile", path: ROUTES.PROFILE_EDIT },
        { title: "Resume", path: ROUTES.PROFILE_RESUME },
        { title: "Cover Letters", path: ROUTES.PROFILE_COVER_LETTER },
        { title: "Job Preferences", path: ROUTES.PROFILE_PREFERENCES },
        { title: "Media & Portfolio", path: ROUTES.PROFILE_MEDIA },
        { title: "Analytics", path: ROUTES.PROFILE_ANALYTICS },
        { title: "Documents", path: ROUTES.PROFILE_DOCUMENTS },
        { title: "Settings", path: ROUTES.PROFILE_SETTINGS }
      ]
    }
  ];

  // Add employer-specific items
  if (userRole === 'employer' || userRole === 'admin') {
    baseItems.splice(-1, 0, {
      title: "Employer Dashboard",
      path: ROUTES.EMPLOYER_DASHBOARD,
      icon: <Building className="h-4 w-4" />,
      roles: ['employer', 'admin'],
      children: [
        { title: "Dashboard", path: ROUTES.EMPLOYER_DASHBOARD },
        { title: "Profile", path: ROUTES.EMPLOYER_PROFILE },
        { title: "Post Job", path: ROUTES.JOBS_POST },
        { title: "Manage Jobs", path: ROUTES.JOBS_MANAGE }
      ]
    });
  }

  return baseItems;
};
