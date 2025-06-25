
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

export const profileRoutes = [
  {
    title: "Profile",
    to: "/profile",
    icon: <User className="h-4 w-4" />,
    page: <Profile />,
  },
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
];
