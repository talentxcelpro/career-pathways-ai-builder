import React, { lazy } from 'react';
const DirectMessaging = lazy(() => import("@/components/communication/DirectMessaging"));
const VideoConsultations = lazy(() => import("@/components/communication/VideoConsultations"));
const GroupChatSystem = lazy(() => import("@/components/communication/GroupChatSystem"));


export const communicationRoutes = [
  {
    path: "/communication/messages",
    element: <DirectMessaging />
  },
  {
    path: "/communication/video",
    element: <VideoConsultations />
  },
  {
    path: "/communication/groups",
    element: <GroupChatSystem />
  }
];