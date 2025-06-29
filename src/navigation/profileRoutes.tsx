
import { User } from "lucide-react";
import Profile from "../pages/Profile";
import ProfileEdit from "../pages/profile/ProfileEdit";
import ProfileResume from "../pages/profile/ProfileResume";
import ProfileCoverLetter from "../pages/profile/ProfileCoverLetter";
import ProfilePreferences from "../pages/profile/ProfilePreferences";
import ProfileSettings from "../pages/profile/ProfileSettings";
import ProfileMedia from "../pages/profile/ProfileMedia";
import ProfileAnalytics from "../pages/profile/ProfileAnalytics";
import ProfileDocuments from "../pages/profile/ProfileDocuments";
import PublicUserProfile from "../pages/network/PublicUserProfile";

export const profileRoutes = [
  {
    title: "Profile",
    to: "/profile",
    icon: <User className="h-4 w-4" />,
    page: <Profile />,
    requiresAuth: true,
  },
  {
    title: "Public Profile",
    to: "/profile/:id",
    page: <PublicUserProfile />,
    requiresAuth: false, // This route should be publicly accessible
  },
  {
    title: "Profile Edit",
    to: "/profile/edit",
    page: <ProfileEdit />,
    requiresAuth: true,
  },
  {
    title: "Profile Resume",
    to: "/profile/resume",
    page: <ProfileResume />,
    requiresAuth: true,
  },
  {
    title: "Profile Cover Letter",
    to: "/profile/cover-letter",
    page: <ProfileCoverLetter />,
    requiresAuth: true,
  },
  {
    title: "Profile Preferences",
    to: "/profile/preferences",
    page: <ProfilePreferences />,
    requiresAuth: true,
  },
  {
    title: "Profile Settings",
    to: "/profile/settings",
    page: <ProfileSettings />,
    requiresAuth: true,
  },
  {
    title: "Profile Media",
    to: "/profile/media",
    page: <ProfileMedia />,
    requiresAuth: true,
  },
  {
    title: "Profile Analytics",
    to: "/profile/analytics",
    page: <ProfileAnalytics />,
    requiresAuth: true,
  },
  {
    title: "Profile Documents",
    to: "/profile/documents",
    page: <ProfileDocuments />,
    requiresAuth: true,
  },
];
