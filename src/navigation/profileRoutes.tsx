import { lazy, Suspense } from 'react';

import { User } from "lucide-react";
const ProfilePage = lazy(() => import('../components/performance/LazyRoutes').then(m => ({ default: m.ProfilePage })));
const ProfileEdit = lazy(() => import('../pages/profile/ProfileEdit'));
const ProfileResume = lazy(() => import('../pages/profile/ProfileResume'));
const ProfileCoverLetter = lazy(() => import('../pages/profile/ProfileCoverLetter'));
const ProfilePreferences = lazy(() => import('../pages/profile/ProfilePreferences'));
const ProfileSettings = lazy(() => import('../pages/profile/ProfileSettings'));
const ProfileMedia = lazy(() => import('../pages/profile/ProfileMedia'));
const ProfileAnalytics = lazy(() => import('../pages/profile/ProfileAnalytics'));
const ProfileDocuments = lazy(() => import('../pages/profile/ProfileDocuments'));
const ProfileBranding = lazy(() => import('../pages/profile/ProfileBranding'));
const PublicUserProfile = lazy(() => import('../pages/network/PublicUserProfile'));
const UsernameProfile = lazy(() => import('../pages/profile/UsernameProfile'));
const TalentXcelProfile = lazy(() => import('../pages/TalentXcelProfile'));
const ProfileUrlRedirect = lazy(() => import('../components/profile/ProfileUrlRedirect'));
const UserProfile = lazy(() => import('../pages/UserProfile'));
const TXCPricing = lazy(() => import('../pages/TXCPricing'));
const TXCMining = lazy(() => import('../pages/TXCMining'));
const SlugProfile = lazy(() => import('../pages/SlugProfile'));
const ProfileViewersList = lazy(() => import('../pages/profile/ProfileViewersList'));
import UniversalProfileRouteHandler from '../components/profile/UniversalProfileRouteHandler';

export const profileRoutes = [
  {
    title: "TXC Pricing",
    to: "/txc/pricing",
    page: <Suspense fallback={null}><TXCPricing /></Suspense>,
    isPublic: true,
  },
  {
    title: "TXC Mining",
    to: "/txc/mining",
    page: <Suspense fallback={null}><TXCMining /></Suspense>,
    isPublic: true,
  },
  {
    title: "User Profile (Redirect)",
    to: "/user/:username",
    icon: "user",
    page: <Suspense fallback={null}><ProfileUrlRedirect /></Suspense>, // Redirects to /:username or /:slug
    description: "Legacy user route - redirects to username",
    isPublic: true
  },
  {
    title: "TalentXcel Profile",
    to: "/profile/talentxcel",
    page: <Suspense fallback={null}><TalentXcelProfile /></Suspense>,
    isPublic: true,
  },
  {
    title: "Profile",
    to: "/profile",
    icon: <User className="h-4 w-4" />,
    page: <Suspense fallback={null}><ProfilePage /></Suspense>,
    isPublic: true,
  },
  {
    title: "Public Profile by Username",
    to: "/profile/:username",
    page: <UniversalProfileRouteHandler />,
    isPublic: true,
  },
  {
    title: "Profile Edit",
    to: "/profile/edit",
    page: <Suspense fallback={null}><ProfileEdit /></Suspense>,
    isPublic: true,
  },
  {
    title: "Profile Resume",
    to: "/profile/resume",
    page: <Suspense fallback={null}><ProfileResume /></Suspense>,
    isPublic: true,
  },
  {
    title: "Profile Cover Letter",
    to: "/profile/cover-letter",
    page: <Suspense fallback={null}><ProfileCoverLetter /></Suspense>,
    isPublic: true,
  },
  {
    title: "Profile Preferences",
    to: "/profile/preferences",
    page: <Suspense fallback={null}><ProfilePreferences /></Suspense>,
    isPublic: true,
  },
  {
    title: "Profile Settings",
    to: "/profile/settings",
    page: <Suspense fallback={null}><ProfileSettings /></Suspense>,
    isPublic: true,
  },
  {
    title: "Profile Media",
    to: "/profile/media",
    page: <Suspense fallback={null}><ProfileMedia /></Suspense>,
    isPublic: true,
  },
  {
    title: "Profile Analytics",
    to: "/profile/analytics",
    page: <Suspense fallback={null}><ProfileAnalytics /></Suspense>,
    isPublic: true,
  },
  {
    title: "Profile Viewers",
    to: "/profile/viewers",
    page: <Suspense fallback={null}><ProfileViewersList /></Suspense>,
    isPublic: true,
  },
  {
    title: "Profile Documents",
    to: "/profile/documents",
    page: <Suspense fallback={null}><ProfileDocuments /></Suspense>,
    isPublic: true,
  },
  {
    title: "Profile Branding",
    to: "/profile/branding",
    page: <Suspense fallback={null}><ProfileBranding /></Suspense>,
    isPublic: true,
  },
];
