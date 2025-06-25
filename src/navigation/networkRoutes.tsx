
import { Users } from "lucide-react";
import NetworkMain from "../pages/Network";
import People from "../pages/network/People";
import Posts from "../pages/network/Posts";
import Groups from "../pages/network/Groups";
import Requests from "../pages/network/Requests";
import Events from "../pages/network/Events";
import Messages from "../pages/network/Messages";
import Notifications from "../pages/network/Notifications";
import Suggestions from "../pages/network/Suggestions";

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
    title: "Network Posts",
    to: "/network/posts",
    page: <Posts />,
  },
  {
    title: "Network Groups",
    to: "/network/groups",
    page: <Groups />,
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
    title: "Network Messages",
    to: "/network/messages",
    page: <Messages />,
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
