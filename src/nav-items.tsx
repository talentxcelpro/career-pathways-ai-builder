
import { HomeIcon, Briefcase, Users, BookOpen, Map, Settings, User, MessageCircle, Calendar, Bell, UserPlus, Sparkles, FileText, Settings2 } from "lucide-react";
import Index from "./pages/Index.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Jobs from "./pages/Jobs.jsx";
import Network from "./pages/Network.jsx";
import Learning from "./pages/Learning.jsx";
import ResumeBuilder from "./pages/ResumeBuilder.jsx";
import Profile from "./pages/Profile.jsx";

// Network pages
import NetworkPeople from "./pages/network/People.jsx";
import NetworkPosts from "./pages/network/Posts.jsx";
import NetworkGroups from "./pages/network/Groups.jsx";
import NetworkEvents from "./pages/network/Events.jsx";
import NetworkMessages from "./pages/network/Messages.jsx";
import NetworkRequests from "./pages/network/Requests.jsx";
import NetworkNotifications from "./pages/network/Notifications.jsx";
import NetworkSuggestions from "./pages/network/Suggestions.jsx";

// Profile pages
import ProfileEdit from "./pages/profile/ProfileEdit.jsx";
import ProfileResume from "./pages/profile/ProfileResume.jsx";
import ProfileCoverLetter from "./pages/profile/ProfileCoverLetter.jsx";
import ProfilePreferences from "./pages/profile/ProfilePreferences.jsx";
import ProfileMedia from "./pages/profile/ProfileMedia.jsx";
import ProfileAnalytics from "./pages/profile/ProfileAnalytics.jsx";
import ProfileDocuments from "./pages/profile/ProfileDocuments.jsx";
import ProfileSettings from "./pages/profile/ProfileSettings.jsx";

// Auth pages
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";

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
    icon: <HomeIcon className="h-4 w-4" />,
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
    page: <Network />,
  },
  {
    title: "Learning",
    to: "/learning",
    icon: <BookOpen className="h-4 w-4" />,
    page: <Learning />,
  },
  {
    title: "Resume Builder",
    to: "/resume-builder",
    icon: <FileText className="h-4 w-4" />,
    page: <ResumeBuilder />,
  },
  {
    title: "Profile",
    to: "/profile",
    icon: <User className="h-4 w-4" />,
    page: <Profile />,
  },

  // Network sub-pages
  {
    title: "Find People",
    to: "/network/people",
    page: <NetworkPeople />,
  },
  {
    title: "Posts",
    to: "/network/posts", 
    page: <NetworkPosts />,
  },
  {
    title: "Groups",
    to: "/network/groups",
    page: <NetworkGroups />,
  },
  {
    title: "Events", 
    to: "/network/events",
    page: <NetworkEvents />,
  },
  {
    title: "Messages",
    to: "/network/messages",
    page: <NetworkMessages />,
  },
  {
    title: "Connection Requests",
    to: "/network/requests", 
    page: <NetworkRequests />,
  },
  {
    title: "Notifications",
    to: "/network/notifications",
    page: <NetworkNotifications />,
  },
  {
    title: "AI Suggestions",
    to: "/network/suggestions",
    page: <NetworkSuggestions />,
  },

  // Profile sub-pages
  {
    title: "Edit Profile",
    to: "/profile/edit",
    page: <ProfileEdit />,
  },
  {
    title: "Resume",
    to: "/profile/resume",
    page: <ProfileResume />,
  },
  {
    title: "Cover Letters",
    to: "/profile/cover-letter",
    page: <ProfileCoverLetter />,
  },
  {
    title: "Job Preferences",
    to: "/profile/preferences",
    page: <ProfilePreferences />,
  },
  {
    title: "Media & Portfolio",
    to: "/profile/media",
    page: <ProfileMedia />,
  },
  {
    title: "Profile Analytics",
    to: "/profile/analytics",
    page: <ProfileAnalytics />,
  },
  {
    title: "Documents",
    to: "/profile/documents",
    page: <ProfileDocuments />,
  },
  {
    title: "Account Settings",
    to: "/profile/settings",
    page: <ProfileSettings />,
  },

  // Auth pages
  {
    title: "Login",
    to: "/login",
    page: <Login />,
  },
  {
    title: "Register", 
    to: "/register",
    page: <Register />,
  },
];
