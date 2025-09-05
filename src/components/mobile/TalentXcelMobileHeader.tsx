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
import talentxcelLogo from '@/assets/talentxcel-logo.png';

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
          <img 
            src="/lovable-uploads/92d46ee5-0b5a-4272-905d-72a40b1c8bdc.png" 
            alt="TalentXcel" 
            className="h-8 w-auto"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/lovable-uploads/1a30569a-4f31-4bd4-abe8-79d630d989f9.png'; }}
          />
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-1">
          {showSearch && (
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full hover:bg-gray-100"
              onClick={() => navigate('/mobile/search')}
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full hover:bg-gray-100"
            onClick={() => navigate('/network/messages')}
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