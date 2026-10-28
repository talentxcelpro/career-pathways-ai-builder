import React, { lazy, Suspense } from 'react';

const DirectMessaging = lazy(() => import("@/components/communication/DirectMessaging"));
const VideoConsultations = lazy(() => import("@/components/communication/VideoConsultations"));
const GroupChatSystem = lazy(() => import("@/components/communication/GroupChatSystem"));

const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={null}>{children}</Suspense>
);

export const communicationRoutes = [
  {
    path: "/communication/messages",
    element: <S><DirectMessaging /></S>
  },
  {
    path: "/communication/video",
    element: <S><VideoConsultations /></S>
  },
  {
    path: "/communication/groups",
    element: <S><GroupChatSystem /></S>
  }
];