import React from 'react';
import { ArrowLeft, Search, MoreVertical, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface MobileTalentXcelHubHeaderProps {
  hubName: string;
  isVerified?: boolean;
  onShare?: () => void;
  onSearch?: () => void;
}

export const MobileTalentXcelHubHeader: React.FC<MobileTalentXcelHubHeaderProps> = ({
  hubName,
  isVerified = false,
  onShare,
  onSearch
}) => {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-apple border-b border-border/20 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Back button */}
        <Button
          variant="ghost"
          size="sm"
          className="p-2 h-auto"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* Center: Hub name */}
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold truncate max-w-[200px] mx-auto">
            {hubName}
            {isVerified && (
              <span className="ml-1 text-primary">✓</span>
            )}
          </h1>
        </div>

        {/* Right: Action buttons */}
        <div className="flex items-center space-x-2">
          {onSearch && (
            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-auto"
              onClick={onSearch}
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
          
          {onShare && (
            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-auto"
              onClick={onShare}
            >
              <Share2 className="h-5 w-5" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="p-2 h-auto"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};