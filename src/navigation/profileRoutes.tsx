import { lazy } from "react";
import { User } from "lucide-react";

// Use existing ProfilePage or convert others to lazy
import { ProfilePage } from "../components/performance/LazyRoutes";
const ProfileEdit = lazy(() => import("../pages/profile/ProfileEdit"));
const ProfileResume = lazy(() => import("../pages/profile/ProfileResume"));
const ProfileCoverLetter = lazy(() => import("../pages/profile/ProfileCoverLetter"));
const ProfilePreferences = lazy(() => import("../pages/profile/ProfilePreferences"));
const ProfileSettings = lazy(() => import("../pages/profile/ProfileSettings"));
const ProfileMedia = lazy(() => import("../pages/profile/ProfileMedia"));
const ProfileCareerAnalytics = lazy(() => import("../pages/profile/ProfileAnalytics"));
const ProfileDocuments = lazy(() => import("../pages/profile/ProfileDocuments"));
const ProfileBranding = lazy(() => import("../pages/profile/ProfileBranding"));
const PublicUserProfile = lazy(() => import("../pages/network/PublicUserProfile"));
const UsernameProfile = lazy(() => import("../pages/profile/UsernameProfile"));
const TalentXcelProfile = lazy(() => import("../pages/TalentXcelProfile"));
const UserProfile = lazy(() => import("../pages/UserProfile"));
const TXCPricing = lazy(() => import("../pages/TXCPricing"));
const TXCMining = lazy(() => import("../pages/TXCMining"));
const SlugProfile = lazy(() => import("../pages/SlugProfile"));
const ProfileViewersList = lazy(() => import("../pages/profile/ProfileViewersList"));

import ProfileUrlRedirect from "../components/profile/ProfileUrlRedirect";


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
    title: "Profile Career Analytics",
    to: "/profile/career-analytics",
    page: <ProfileCareerAnalytics />,
    isPublic: true,
  },
  {
    title: "Profile Viewers",
    to: "/profile/viewers",
    page: <ProfileViewersList />,
    isPublic: true,
  },
  {
    title: "Profile Branding",
    to: "/profile/branding",
    page: <ProfileBranding />,
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
];




