import React, { useState } from 'react';
import { EnhancedMobileFeed } from './EnhancedMobileFeed';
import { MobileCreatePost } from './MobileCreatePost';
import { useIsMobile } from '@/hooks/use-mobile';
import { Search, Bell, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { UserAvatar } from '@/components/common/UserAvatar';
import { getUserAvatarProps } from '@/utils/avatarUtils';
import { useAuth } from '@/contexts/AuthContext';


export const EnhancedMobileNetwork: React.FC = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  if (!isMobile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">This view is optimized for mobile devices.</p>
      </div>
    );
  }

  const handleCreatePost = () => {
    setIsCreatePostOpen(false);
  };

  return (
    <div className="h-full flex flex-col bg-background relative">
      {/* Header */}
      <div className="bg-background border-b border-border/20 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">TalentXcel</h1>
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Bell className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Create Post Prompt */}
      <div className="px-4 py-3 border-b border-border/10">
        <div 
          className="flex items-center gap-3 p-3 bg-muted/30 rounded-2xl cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setIsCreatePostOpen(true)}
        >
          <UserAvatar 
            {...getUserAvatarProps(user)}
            size="sm"
            className="ring-1 ring-border"
          />
          <p className="text-sm text-muted-foreground flex-1">What's on your mind?</p>
          <Button 
            size="sm" 
            variant="ghost"
            className="h-8 w-8 p-0 rounded-full bg-primary/10 hover:bg-primary/20"
          >
            <Plus className="h-4 w-4 text-primary" />
          </Button>
        </div>
      </div>

      {/* Professional Feed */}
      <div className="flex-1 overflow-hidden">
        <EnhancedMobileFeed />
      </div>

      {/* Floating Action Button */}
      <Button
        onClick={() => setIsCreatePostOpen(true)}
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-50"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Create Post Sheet */}
      <Sheet open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl border-0">
          <SheetHeader className="pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg font-semibold">Create Post</SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCreatePostOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>
          <div className="h-full overflow-y-auto">
            <MobileCreatePost 
              onPostCreate={handleCreatePost}
              className="border-0 shadow-none bg-transparent mx-0 mb-0"
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};