
import { User } from "lucide-react";
import { ProfilePage } from "../components/performance/LazyRoutes";
import ProfileEdit from "../pages/profile/ProfileEdit";
import ProfileResume from "../pages/profile/ProfileResume";
import ProfileCoverLetter from "../pages/profile/ProfileCoverLetter";
import ProfilePreferences from "../pages/profile/ProfilePreferences";
import ProfileSettings from "../pages/profile/ProfileSettings";
import ProfileMedia from "../pages/profile/ProfileMedia";
import ProfileAnalytics from "../pages/profile/ProfileAnalytics";
import ProfileDocuments from "../pages/profile/ProfileDocuments";
import ProfileBranding from "../pages/profile/ProfileBranding";
import PublicUserProfile from "../pages/network/PublicUserProfile";
import UsernameProfile from "../pages/profile/UsernameProfile";
import TalentXcelProfile from "../pages/TalentXcelProfile";
import ProfileUrlRedirect from "../components/profile/ProfileUrlRedirect";
import UserProfile from "../pages/UserProfile";
import TXCPricing from "../pages/TXCPricing";
import TXCMining from "../pages/TXCMining";
import SlugProfile from "../pages/SlugProfile";
import ProfileViewersList from "../pages/profile/ProfileViewersList";

export const profileRoutes = [
  {
    title: "TXC Pricing",
    to: "/txc/pricing",
    page: <TXCPricing />,
    isPublic: true,
  },
  {
    title: "TXC Mining",
    to: "/txc/mining",
    page: <TXCMining />,
    isPublic: true,
  },
  {
    title: "Profile by Username",
    to: "/:username",
    icon: "user",
    page: <SlugProfile />,
    description: "View user profile by username",
    isPublic: true
  },
  {
    title: "User Profile (Redirect)",
    to: "/user/:username",
    icon: "user",
    page: <ProfileUrlRedirect />, // Redirects to /:username or /:slug
    description: "Legacy user route - redirects to username",
    isPublic: true
  },
  {
    title: "TalentXcel Profile",
    to: "/profile/talentxcel",
    page: <TalentXcelProfile />,
    isPublic: true,
  },
  {
    title: "Profile",
    to: "/profile",
    icon: <User className="h-4 w-4" />,
    page: <ProfilePage />,
    isPublic: true,
  },
  {
    title: "Public Profile by Username",
    to: "/profile/:username",
    page: <UsernameProfile />,
    isPublic: true,
  },
  {
    title: "Profile Edit",
    to: "/profile/edit",
    page: <ProfileEdit />,
    isPublic: true,
  },
  {
    title: "Profile Resume",
    to: "/profile/resume",
    page: <ProfileResume />,
    isPublic: true,
  },
  {
    title: "Profile Cover Letter",
    to: "/profile/cover-letter",
    page: <ProfileCoverLetter />,
    isPublic: true,
  },
  {
    title: "Profile Preferences",
    to: "/profile/preferences",
    page: <ProfilePreferences />,
    isPublic: true,
  },
  {
    title: "Profile Settings",
    to: "/profile/settings",
    page: <ProfileSettings />,
    isPublic: true,
  },
  {
    title: "Profile Media",
    to: "/profile/media",
    page: <ProfileMedia />,
    isPublic: true,
  },
  {
    title: "Profile Analytics",
    to: "/profile/analytics",
    page: <ProfileAnalytics />,
    isPublic: true,
  },
  {
    title: "Profile Viewers",
    to: "/profile/viewers",
    page: <ProfileViewersList />,
    isPublic: true,
  },
  {
    title: "Profile Documents",
    to: "/profile/documents",
    page: <ProfileDocuments />,
    isPublic: true,
  },
  {
    title: "Profile Branding",
    to: "/profile/branding",
    page: <ProfileBranding />,
    isPublic: true,
  },
];
