import { lazy, Suspense } from 'react';

import { Users, Coins } from "lucide-react";
import { NetworkPage } from "../components/performance/LazyRoutes";
const People = lazy(() => import('../pages/network/People'));
const Posts = lazy(() => import('../pages/network/Posts'));
const PostDetail = lazy(() => import('../pages/network/PostDetail'));
const Groups = lazy(() => import('../pages/network/Groups'));
const GroupDetail = lazy(() => import('../pages/network/GroupDetail'));
const Requests = lazy(() => import('../pages/network/Requests'));
const Events = lazy(() => import('../pages/network/Events'));
const EventDetail = lazy(() => import('../pages/network/EventDetail'));
const Messages = lazy(() => import('../pages/network/Messages'));
const NewMessage = lazy(() => import('../pages/network/NewMessage'));
const MessageConversation = lazy(() => import('../pages/network/MessageConversation'));
const MessageRequests = lazy(() => import('../pages/network/MessageRequests'));
const ArchivedMessages = lazy(() => import('../pages/network/ArchivedMessages'));
const MessageSettings = lazy(() => import('../pages/network/MessageSettings'));
const Connections = lazy(() => import('../pages/network/Connections'));
const NetworkAnalytics = lazy(() => import('../pages/network/NetworkAnalytics'));

const ProfileAnalytics = lazy(() => import('../pages/profile/ProfileAnalytics'));
const Notifications = lazy(() => import('../pages/network/Notifications'));
const Suggestions = lazy(() => import('../pages/network/Suggestions'));
const UserProfile = lazy(() => import('../pages/network/UserProfile'));
const PublicUserProfile = lazy(() => import('../pages/network/PublicUserProfile'));
const Articles = lazy(() => import('../pages/network/Articles'));
const ArticleDetail = lazy(() => import('../pages/network/ArticleDetail'));
const MyNetwork = lazy(() => import('../pages/network/MyNetwork'));
const Discover = lazy(() => import('../pages/network/Discover'));
import ProfileUrlRedirect from "../components/profile/ProfileUrlRedirect";
import ComprehensiveMobileNetworkAnalysis from "../components/analysis/ComprehensiveMobileNetworkAnalysis";
const MobileNetwork = lazy(() => import('../pages/mobile/MobileNetwork').then(m => ({ default: m.MobileNetwork })));
const SkillSwap = lazy(() => import('../pages/network/SkillSwap'));
const VideoIntros = lazy(() => import('../pages/network/VideoIntros'));
const Verified = lazy(() => import('../pages/network/Verified'));
const Communities = lazy(() => import('../pages/network/Communities'));
const Leaderboards = lazy(() => import('../pages/network/Leaderboards'));

export const networkRoutes = [
  {
    title: "Network",
    to: "/network",
    icon: <Users className="h-4 w-4" />,
    page: <Suspense fallback={null}><NetworkPage /></Suspense>,
    isPublic: true,
  },
  {
    title: "TXC Mining",
    to: "/txc/mining",
    icon: <Coins className="h-4 w-4" />,
    page: <div>TXC Mining</div>,
    isPublic: true,
  },
  {
    title: "Network People",
    to: "/network/people",
    page: <Suspense fallback={null}><People /></Suspense>,
    isPublic: true,
  },
  {
    title: "My Connections",
    to: "/network/connections",
    page: <Suspense fallback={null}><Connections /></Suspense>,
  },
  {
    title: "Network Analytics",
    to: "/network/analytics",
    page: <Suspense fallback={null}><NetworkAnalytics /></Suspense>,
  },
  {
    title: "Discover",
    to: "/network/discover",
    page: <Suspense fallback={null}><Discover /></Suspense>,
  },
  {
    title: "User Profile (Redirect to Username)",
    to: "/network/people/:id",
    page: <Suspense fallback={null}><ProfileUrlRedirect /></Suspense>, // This will redirect to /profile/:username
  },
  {
    title: "Public User Profile",
    to: "/p/:id",
    page: <Suspense fallback={null}><PublicUserProfile /></Suspense>,
  },
  {
    title: "Network Posts",
    to: "/network/posts",
    page: <Suspense fallback={null}><Posts /></Suspense>,
  },
  {
    title: "Post Detail",
    to: "/network/posts/:id",
    page: <Suspense fallback={null}><PostDetail /></Suspense>,
  },
  {
    title: "Articles",
    to: "/network/articles",
    page: <Suspense fallback={null}><Articles /></Suspense>,
  },
  {
    title: "Article Detail",
    to: "/network/articles/:id",
    page: <Suspense fallback={null}><ArticleDetail /></Suspense>,
  },
  {
    title: "Network Groups",
    to: "/network/groups",
    page: <Suspense fallback={null}><Groups /></Suspense>,
  },
  {
    title: "Group Detail",
    to: "/network/groups/:id",
    page: <Suspense fallback={null}><GroupDetail /></Suspense>,
  },
  {
    title: "Network Requests",
    to: "/network/requests",
    page: <Suspense fallback={null}><Requests /></Suspense>,
  },
  {
    title: "Network Events",
    to: "/network/events",
    page: <Suspense fallback={null}><Events /></Suspense>,
  },
  {
    title: "Event Detail",
    to: "/network/events/:id",
    page: <Suspense fallback={null}><EventDetail /></Suspense>,
  },
  {
    title: "Network Messages",
    to: "/network/messages",
    page: <Suspense fallback={null}><Messages /></Suspense>,
  },
  {
    title: "New Message",
    to: "/network/messages/new",
    page: <Suspense fallback={null}><NewMessage /></Suspense>,
  },
  {
    title: "Message Conversation",
    to: "/network/messages/:id",
    page: <Suspense fallback={null}><MessageConversation /></Suspense>,
  },
  {
    title: "Message Requests",
    to: "/network/messages/requests",
    page: <Suspense fallback={null}><MessageRequests /></Suspense>,
  },
  {
    title: "Archived Messages",
    to: "/network/messages/archived",
    page: <Suspense fallback={null}><ArchivedMessages /></Suspense>,
  },
  {
    title: "Message Settings",
    to: "/network/messages/settings",
    page: <Suspense fallback={null}><MessageSettings /></Suspense>,
  },
  {
    title: "Profile Analytics",
    to: "/network/profile/analytics",
    page: <Suspense fallback={null}><ProfileAnalytics /></Suspense>,
    isPublic: true,
  },
  {
    title: "Network Notifications",
    to: "/network/notifications",
    page: <Suspense fallback={null}><Notifications /></Suspense>,
  },
  {
    title: "Network Suggestions",
    to: "/network/suggestions",
    page: <Suspense fallback={null}><Suggestions /></Suspense>,
  },
  {
    title: "Mobile Network Analysis",
    to: "/network/mobile-analysis",
    page: <Suspense fallback={null}><ComprehensiveMobileNetworkAnalysis /></Suspense>,
  },
  {
    title: "Skill Swap",
    to: "/network/skill-swap",
    page: <Suspense fallback={null}><SkillSwap /></Suspense>,
  },
  {
    title: "Video Introductions",
    to: "/network/video-intros",
    page: <Suspense fallback={null}><VideoIntros /></Suspense>,
  },
  {
    title: "Verified Professionals",
    to: "/network/verified",
    page: <Suspense fallback={null}><Verified /></Suspense>,
  },
  {
    title: "Communities",
    to: "/network/communities",
    page: <Suspense fallback={null}><Communities /></Suspense>,
  },
  {
    title: "Leaderboards",
    to: "/network/leaderboards",
    page: <Suspense fallback={null}><Leaderboards /></Suspense>,
  },
];
