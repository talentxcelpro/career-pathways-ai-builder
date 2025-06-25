import { HomeIcon, Users, BookOpen, TrendingUp, User, Briefcase, Settings, Calendar, MessageSquare, Bell, Heart, FileText, BarChart3, Building2, Sparkles, Plus, Search, Target, Compass } from "lucide-react";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import ResumeBuilder from "./pages/ResumeBuilder";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Learning from "./pages/Learning";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Network pages
import NetworkMain from "./pages/Network";
import People from "./pages/network/People";
import Posts from "./pages/network/Posts";
import Groups from "./pages/network/Groups";
import Requests from "./pages/network/Requests";
import Events from "./pages/network/Events";

// Profile pages
import ProfileEdit from "./pages/profile/ProfileEdit";
import ProfileResume from "./pages/profile/ProfileResume";
import ProfileCoverLetter from "./pages/profile/ProfileCoverLetter";
import ProfilePreferences from "./pages/profile/ProfilePreferences";
import ProfileSettings from "./pages/profile/ProfileSettings";
import ProfileMedia from "./pages/profile/ProfileMedia";
import ProfileAnalytics from "./pages/profile/ProfileAnalytics";
import ProfileDocuments from "./pages/profile/ProfileDocuments";

// Job pages
import JobDetails from "./pages/jobs/JobDetails";
import JobApply from "./pages/jobs/JobApply";
import SavedJobs from "./pages/jobs/SavedJobs";

// Learning pages
import CourseDetail from "./pages/learning/CourseDetail";
import MyCourses from "./pages/learning/MyCourses";
import LearningPaths from "./pages/learning/LearningPaths";

// Career Map pages
import CareerMap from "./pages/CareerMap";
import Generate from "./pages/career-map/Generate";
import SkillsGap from "./pages/career-map/SkillsGap";
import Recommendations from "./pages/career-map/Recommendations";
import Comparison from "./pages/career-map/Comparison";

// Tools pages
import Tools from "./pages/Tools";
import ResumeCheck from "./pages/tools/ResumeCheck";
import CoverLetter from "./pages/tools/CoverLetter";

// Companies pages
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/companies/CompanyDetail";

// Colleges pages
import Colleges from "./pages/Colleges";
import CollegeDetail from "./pages/colleges/CollegeDetail";

// Marketplace pages
import Marketplace from "./pages/Marketplace";
import ServiceDetail from "./pages/marketplace/ServiceDetail";
import PostService from "./pages/marketplace/PostService";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: <TrendingUp className="h-4 w-4" />,
    page: <Dashboard />,
  },
  {
    title: "Jobs",
    to: "/jobs",
    icon: <Briefcase className="h-4 w-4" />,
    page: <Jobs />,
  },
  {
    title: "Network",
    to: "/network",
    icon: <Users className="h-4 w-4" />,
    page: <NetworkMain />,
  },
  {
    title: "Learning",
    to: "/learning",
    icon: <BookOpen className="h-4 w-4" />,
    page: <Learning />,
  },
  {
    title: "Career Map",
    to: "/career-map",
    icon: <Compass className="h-4 w-4" />,
    page: <CareerMap />,
  },
  {
    title: "Profile",
    to: "/profile",
    icon: <User className="h-4 w-4" />,
    page: <Profile />,
  },
  {
    title: "Resume Builder",
    to: "/resume-builder",
    icon: <FileText className="h-4 w-4" />,
    page: <ResumeBuilder />,
  },
  
  // Auth pages
  {
    title: "Login",
    to: "/auth/login",
    page: <Login />,
  },
  {
    title: "Register", 
    to: "/auth/register",
    page: <Register />,
  },

  // Network sub-pages
  {
    title: "Network People",
    to: "/network/people",
    page: <People />,
  },
  {
    title: "Network Posts",
    to: "/network/posts",
    page: <Posts />,
  },
  {
    title: "Network Groups",
    to: "/network/groups",
    page: <Groups />,
  },
  {
    title: "Network Requests",
    to: "/network/requests",
    page: <Requests />,
  },
  {
    title: "Network Events",
    to: "/network/events",
    page: <Events />,
  },

  // Profile sub-pages
  {
    title: "Profile Edit",
    to: "/profile/edit",
    page: <ProfileEdit />,
  },
  {
    title: "Profile Resume",
    to: "/profile/resume",
    page: <ProfileResume />,
  },
  {
    title: "Profile Cover Letter",
    to: "/profile/cover-letter",
    page: <ProfileCoverLetter />,
  },
  {
    title: "Profile Preferences",
    to: "/profile/preferences",
    page: <ProfilePreferences />,
  },
  {
    title: "Profile Settings",
    to: "/profile/settings",
    page: <ProfileSettings />,
  },
  {
    title: "Profile Media",
    to: "/profile/media",
    page: <ProfileMedia />,
  },
  {
    title: "Profile Analytics",
    to: "/profile/analytics",
    page: <ProfileAnalytics />,
  },
  {
    title: "Profile Documents",
    to: "/profile/documents",
    page: <ProfileDocuments />,
  },

  // Job sub-pages
  {
    title: "Job Details",
    to: "/jobs/:id",
    page: <JobDetails />,
  },
  {
    title: "Job Apply",
    to: "/jobs/:id/apply",
    page: <JobApply />,
  },
  {
    title: "Saved Jobs",
    to: "/jobs/saved",
    page: <SavedJobs />,
  },

  // Learning sub-pages
  {
    title: "Course Detail",
    to: "/learning/:id",
    page: <CourseDetail />,
  },
  {
    title: "My Courses",
    to: "/learning/my-courses",
    page: <MyCourses />,
  },
  {
    title: "Learning Paths",
    to: "/learning/paths",
    page: <LearningPaths />,
  },

  // Career Map sub-pages
  {
    title: "Generate Career Map",
    to: "/career-map/generate",
    page: <Generate />,
  },
  {
    title: "Skills Gap Analysis",
    to: "/career-map/skills-gap",
    page: <SkillsGap />,
  },
  {
    title: "Career Recommendations",
    to: "/career-map/recommendations",
    page: <Recommendations />,
  },
  {
    title: "Career Comparison",
    to: "/career-map/comparison",
    page: <Comparison />,
  },

  // Tools main page
  {
    title: "Tools",
    to: "/tools",
    page: <Tools />,
  },

  // Tools sub-pages
  {
    title: "Resume Checker",
    to: "/tools/resume-check",
    page: <ResumeCheck />,
  },
  {
    title: "Cover Letter Generator",
    to: "/tools/cover-letter",
    page: <CoverLetter />,
  },

  // Companies pages
  {
    title: "Companies",
    to: "/companies",
    page: <Companies />,
  },
  {
    title: "Company Detail",
    to: "/companies/:id",
    page: <CompanyDetail />,
  },

  // Colleges pages
  {
    title: "Colleges",
    to: "/colleges",
    page: <Colleges />,
  },
  {
    title: "College Detail",
    to: "/colleges/:id",
    page: <CollegeDetail />,
  },

  // Marketplace pages
  {
    title: "Marketplace",
    to: "/marketplace",
    page: <Marketplace />,
  },
  {
    title: "Service Detail",
    to: "/marketplace/:id",
    page: <ServiceDetail />,
  },
  {
    title: "Post Service",
    to: "/marketplace/post-service",
    page: <PostService />,
  },

  // Catch all 404
  {
    title: "Not Found",
    to: "*",
    page: <NotFound />,
  },
];
