import React from 'react';
import { MobileMessaging } from "@/components/mobile/MobileMessaging";
import { useIsMobile } from "@/hooks/use-mobile";
import DirectMessaging from "@/components/communication/DirectMessaging";

const Messages = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="h-screen bg-background overflow-hidden">
        <MobileMessaging />
      </div>
    );
  }

  // Desktop view - Fallback to a styled version of the hub or DirectMessaging
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8 tracking-tight">Messages</h1>
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
           <DirectMessaging />
        </div>
      </div>
    </div>
  );
};

export default Messages;
