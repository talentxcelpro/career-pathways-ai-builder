
import { Users } from "lucide-react";
import NetworkMain from "../pages/Network";
import People from "../pages/network/People";
import Posts from "../pages/network/Posts";
import PostDetail from "../pages/network/PostDetail";
import Groups from "../pages/network/Groups";
import GroupDetail from "../pages/network/GroupDetail";
import Requests from "../pages/network/Requests";
import Events from "../pages/network/Events";
import EventDetail from "../pages/network/EventDetail";
import Messages from "../pages/network/Messages";
import MessageConversation from "../pages/network/MessageConversation";
import Notifications from "../pages/network/Notifications";
import Suggestions from "../pages/network/Suggestions";
import UserProfile from "../pages/network/UserProfile";

export const networkRoutes = [
  {
    title: "Network",
    to: "/network",
    icon: <Users className="h-4 w-4" />,
    page: <NetworkMain />,
  },
  {
    title: "Network People",
    to: "/network/people",
    page: <People />,
  },
  {
    title: "User Profile",
    to: "/network/people/:id",
    page: <UserProfile />,
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
    title: "Message Conversation",
    to: "/network/messages/:id",
    page: <MessageConversation />,
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
];
