import React from 'react';
import { Users, MessageSquare } from 'lucide-react';
import { MobileNavWrapper } from "@/components/layout/MobileNavWrapper";
import { useMobileDetection } from "@/hooks/useMobileDetection";
import { useAuth } from "@/contexts/AuthContext";

// Lightweight Network component to prevent memory issues
const Network = () => {
  const { isMobile } = useMobileDetection();
  const { user } = useAuth();

  // Mobile interface - minimal to prevent memory issues
  if (isMobile) {
    return (
      <MobileNavWrapper>
        <div className="h-full flex flex-col bg-background">
          {/* Header */}
          <div className="bg-background border-b border-border/20 px-4 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-foreground">TalentXcel Network</h1>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-hidden p-4">
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold mb-2">Professional Network</h2>
              <p className="text-muted-foreground mb-4">Connect with professionals and grow your network</p>
              
              {user ? (
                <div className="space-y-3">
                  <button
                    onClick={() => window.location.href = '/mobile/network-enhanced'}
                    className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-medium"
                  >
                    Access Enhanced Network Features
                  </button>
                  <p className="text-sm text-muted-foreground">
                    Create posts, connect with professionals, and more
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => window.location.href = '/auth/login'}
                    className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-medium"
                  >
                    Sign In to Access Network
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </MobileNavWrapper>
    );
  }

  // Desktop interface - also minimal
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <Users className="h-16 w-16 mx-auto mb-6 text-primary" />
          <h1 className="text-3xl font-bold mb-4">Professional Network</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with professionals, share insights, and grow your career network
          </p>
          
          {user ? (
            <div className="space-y-4">
              <button
                onClick={() => window.location.href = '/network/people'}
                className="bg-primary text-primary-foreground py-3 px-8 rounded-lg font-medium mr-4"
              >
                Browse Network
              </button>
              <button
                onClick={() => window.location.href = '/mobile/network-enhanced'}
                className="bg-secondary text-secondary-foreground py-3 px-8 rounded-lg font-medium"
              >
                Mobile Network
              </button>
            </div>
          ) : (
            <button
              onClick={() => window.location.href = '/auth/login'}
              className="bg-primary text-primary-foreground py-3 px-8 rounded-lg font-medium"
            >
              Sign In to Access Network
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Network;