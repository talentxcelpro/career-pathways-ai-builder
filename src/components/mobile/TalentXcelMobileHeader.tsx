import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  Search, 
  MessageCircle, 
  Bell, 
  UserPlus,
  QrCode
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TalentXcelMobileHeaderProps {
  showSearch?: boolean;
}

export const TalentXcelMobileHeader: React.FC<TalentXcelMobileHeaderProps> = ({ 
  showSearch = true 
}) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left - Menu */}
        <Button 
          variant="ghost" 
          size="icon"
          className="rounded-full hover:bg-gray-100"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Center - TalentXcel Logo */}
        <div className="flex-1 flex justify-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            TalentXcel
          </h1>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-1">
          {showSearch && (
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full hover:bg-gray-100"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full hover:bg-gray-100"
            onClick={() => navigate('/messages')}
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full hover:bg-gray-100 relative"
            onClick={() => navigate('/mobile/notifications')}
          >
            <Bell className="h-5 w-5" />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></div>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full hover:bg-gray-100"
            onClick={() => navigate('/mobile/qr-scanner')}
          >
            <QrCode className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};