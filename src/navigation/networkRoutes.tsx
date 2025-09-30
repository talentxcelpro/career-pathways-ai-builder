
import { Users, Coins } from "lucide-react";
import { NetworkPage } from "../components/performance/LazyRoutes";
import People from "../pages/network/People";
import Posts from "../pages/network/Posts";
import PostDetail from "../pages/network/PostDetail";
import Groups from "../pages/network/Groups";
import GroupDetail from "../pages/network/GroupDetail";
import Requests from "../pages/network/Requests";
import Events from "../pages/network/Events";
import EventDetail from "../pages/network/EventDetail";
import Messages from "../pages/network/Messages";
import NewMessage from "../pages/network/NewMessage";
import MessageConversation from "../pages/network/MessageConversation";
import MessageRequests from "../pages/network/MessageRequests";
import ArchivedMessages from "../pages/network/ArchivedMessages";
import MessageSettings from "../pages/network/MessageSettings";
import Connections from "../pages/network/Connections";
import NetworkAnalytics from "../pages/network/NetworkAnalytics";

import ProfileAnalytics from "../pages/profile/ProfileAnalytics";
import Notifications from "../pages/network/Notifications";
import Suggestions from "../pages/network/Suggestions";
import UserProfile from "../pages/network/UserProfile";
import PublicUserProfile from "../pages/network/PublicUserProfile";
import Articles from "../pages/network/Articles";
import ArticleDetail from "../pages/network/ArticleDetail";
import MyNetwork from "../pages/network/MyNetwork";
import Discover from "../pages/network/Discover";
import ProfileUrlRedirect from "../components/profile/ProfileUrlRedirect";
import ComprehensiveMobileNetworkAnalysis from "../components/analysis/ComprehensiveMobileNetworkAnalysis";
import { MobileNetwork } from "../pages/mobile/MobileNetwork";
import SkillSwap from "../pages/network/SkillSwap";
import VideoIntros from "../pages/network/VideoIntros";
import Verified from "../pages/network/Verified";
import Communities from "../pages/network/Communities";
import Leaderboards from "../pages/network/Leaderboards";

export const networkRoutes = [
  {
    title: "Network",
    to: "/network",
    icon: <Users className="h-4 w-4" />,
    page: <NetworkPage />,
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
    title: "Mobile Network",
    to: "/network/people",
    page: <MobileNetwork />,
    isPublic: true,
  },
  {
    title: "Network People",
    to: "/network/people",
    page: <People />,
  },
  {
    title: "My Connections",
    to: "/network/connections",
    page: <Connections />,
  },
  {
    title: "Network Analytics",
    to: "/network/analytics",
    page: <NetworkAnalytics />,
  },
  {
    title: "Discover",
    to: "/network/discover",
    page: <Discover />,
  },
  {
    title: "User Profile (Redirect to Username)",
    to: "/network/people/:id",
    page: <ProfileUrlRedirect />, // This will redirect to /profile/:username
  },
  {
    title: "Public User Profile",
    to: "/p/:id",
    page: <PublicUserProfile />,
  },
  {
    title: "Network Posts",
    to: "/network/posts",
    page: <Posts />,
  },
  {
    title: "Post Detail",
    to: "/network/posts/:id",
    page: <PostDetail />,
  },
  {
    title: "Articles",
    to: "/network/articles",
    page: <Articles />,
  },
  {
    title: "Article Detail",
    to: "/network/articles/:id",
    page: <ArticleDetail />,
  },
  {
    title: "Network Groups",
    to: "/network/groups",
    page: <Groups />,
  },
  {
    title: "Group Detail",
    to: "/network/groups/:id",
    page: <GroupDetail />,
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
  {
    title: "Event Detail",
    to: "/network/events/:id",
    page: <EventDetail />,
  },
  {
    title: "Network Messages",
    to: "/network/messages",
    page: <Messages />,
  },
  {
    title: "New Message",
    to: "/network/messages/new",
    page: <NewMessage />,
  },
  {
    title: "Message Conversation",
    to: "/network/messages/:id",
    page: <MessageConversation />,
  },
  {
    title: "Message Requests",
    to: "/network/messages/requests",
    page: <MessageRequests />,
  },
  {
    title: "Archived Messages",
    to: "/network/messages/archived",
    page: <ArchivedMessages />,
  },
  {
    title: "Message Settings",
    to: "/network/messages/settings",
    page: <MessageSettings />,
  },
  {
    title: "Profile Analytics",
    to: "/network/profile/analytics",
    page: <ProfileAnalytics />,
    isPublic: true,
  },
  {
    title: "Network Notifications",
    to: "/network/notifications",
    page: <Notifications />,
  },
  {
    title: "Network Suggestions",
    to: "/network/suggestions",
    page: <Suggestions />,
  },
  {
    title: "Mobile Network Analysis",
    to: "/network/mobile-analysis",
    page: <ComprehensiveMobileNetworkAnalysis />,
  },
  {
    title: "Skill Swap",
    to: "/network/skill-swap",
    page: <SkillSwap />,
  },
  {
    title: "Video Introductions",
    to: "/network/video-intros",
    page: <VideoIntros />,
  },
  {
    title: "Verified Professionals",
    to: "/network/verified",
    page: <Verified />,
  },
  {
    title: "Communities",
    to: "/network/communities",
    page: <Communities />,
  },
  {
    title: "Leaderboards",
    to: "/network/leaderboards",
    page: <Leaderboards />,
  },
];
