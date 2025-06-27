
import React from 'react';
import { Clock } from "lucide-react";

interface ConversationMetadataProps {
  timestamp: string;
}

export const ConversationMetadata: React.FC<ConversationMetadataProps> = ({
  timestamp
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="flex items-center space-x-1 text-xs text-gray-500">
      <Clock className="h-3 w-3" />
      <span>{formatTime(timestamp)}</span>
    </div>
  );
};
