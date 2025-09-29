import React from 'react';
import { EnhancedMobileFeed } from './EnhancedMobileFeed';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';


export const EnhancedMobileNetwork: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  if (!isMobile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">This view is optimized for mobile devices.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border/20 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">TalentXcel</h1>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/mobile/search')}
              className="p-2 hover:bg-muted/50"
            >
              <Search className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/network/notifications')}
              className="p-2 hover:bg-muted/50"
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>

      {/* Professional Feed */}
      <div className="flex-1 overflow-hidden">
        <EnhancedMobileFeed />
      </div>
    </div>
  );
};