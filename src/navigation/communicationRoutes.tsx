import React from 'react';
import { lazy, Suspense } from 'react';
import DirectMessaging from "@/components/communication/DirectMessaging";
import VideoConsultations from "@/components/communication/VideoConsultations";
import GroupChatSystem from "@/components/communication/GroupChatSystem";

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