import { lazy } from "react";
import { Users, Coins } from "lucide-react";

// Use existing LazyRoutes or convert others to lazy
import { NetworkPage } from "../components/performance/LazyRoutes";
const People = lazy(() => import("../pages/network/People"));
const Posts = lazy(() => import("../pages/network/Posts"));
const PostDetail = lazy(() => import("../pages/network/PostDetail"));
const Groups = lazy(() => import("../pages/network/Groups"));
const GroupDetail = lazy(() => import("../pages/network/GroupDetail"));
const Requests = lazy(() => import("../pages/network/Requests"));
const Events = lazy(() => import("../pages/network/Events"));
const EventDetail = lazy(() => import("../pages/network/EventDetail"));
const Messages = lazy(() => import("../pages/network/Messages"));
const NewMessage = lazy(() => import("../pages/network/NewMessage"));
const MessageConversation = lazy(() => import("../pages/network/MessageConversation"));
const MessageRequests = lazy(() => import("../pages/network/MessageRequests"));
const ArchivedMessages = lazy(() => import("../pages/network/ArchivedMessages"));
const MessageSettings = lazy(() => import("../pages/network/MessageSettings"));
const TalentNetwork = lazy(() => import("../pages/network/MyNetwork"));
const NetworkCareerAnalytics = lazy(() => import("../pages/network/NetworkAnalytics"));

const ProfileCareerAnalytics = lazy(() => import("../pages/profile/ProfileAnalytics"));
const Notifications = lazy(() => import("../pages/network/Notifications"));
const Suggestions = lazy(() => import("../pages/network/Suggestions"));
const UserProfile = lazy(() => import("../pages/network/UserProfile"));
const PublicUserProfile = lazy(() => import("../pages/network/PublicUserProfile"));
const Articles = lazy(() => import("../pages/network/Articles"));
const ArticleDetail = lazy(() => import("../pages/network/ArticleDetail"));
const MyNetwork = lazy(() => import("../pages/network/MyNetwork"));
const Discover = lazy(() => import("../pages/network/Discover"));
const ProfileUrlRedirect = lazy(() => import("../components/profile/ProfileUrlRedirect"));
const ComprehensiveMobileNetworkAnalysis = lazy(() => import("../components/analysis/ComprehensiveMobileNetworkAnalysis").then(m => ({ default: m.default })));
const MobileNetwork = lazy(() => import("../pages/mobile/MobileNetwork").then(m => ({ default: m.MobileNetwork })));
const SkillSwap = lazy(() => import("../pages/network/SkillSwap"));
const VideoIntros = lazy(() => import("../pages/network/VideoIntros"));
const Verified = lazy(() => import("../pages/network/Verified"));
const Communities = lazy(() => import("../pages/network/Communities"));
const Leaderboards = lazy(() => import("../pages/network/Leaderboards"));


export const networkRoutes = [
  {
    title: "Ecosystem Sync",
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
    title: "Network People",
    to: "/network/people",
    page: <People />,
    isPublic: true,
  },
  {
    title: "Ecosystem Hub",
    to: "/network/talent-network",
    page: <TalentNetwork />,
  },
  {
    title: "Intelligence Matrix",
    to: "/network/career-analytics",
    page: <NetworkCareerAnalytics />,
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
    title: "Profile Career Analytics",
    to: "/network/profile/career-analytics",
    page: <ProfileCareerAnalytics />,
    isPublic: true,
  },
  {
    title: "Network Notifications",
    to: "/network/notifications",
    page: <Notifications />,
  },
  {
    title: "Network Smart Moves",
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





