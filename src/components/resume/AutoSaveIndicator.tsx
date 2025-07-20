
import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AutoSaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  status,
  lastSaved
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'idle':
        return <Clock className="h-3 w-3" />;
      case 'saving':
        return <Clock className="h-3 w-3 animate-spin" />;
      case 'saved':
        return <CheckCircle className="h-3 w-3" />;
      case 'error':
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'idle':
        return 'Ready to save';
      case 'saving':
        return 'Saving...';
      case 'saved':
        return lastSaved ? `Saved at ${lastSaved.toLocaleTimeString()}` : 'Saved';
      case 'error':
        return 'Save failed';
    }
  };

  const getVariant = () => {
    switch (status) {
      case 'idle':
        return 'outline';
      case 'saving':
        return 'secondary';
      case 'saved':
        return 'default';
      case 'error':
        return 'destructive';
    }
  };

  return (
    <Badge variant={getVariant()} className="flex items-center gap-1">
      {getStatusIcon()}
      <span className="text-xs">{getStatusText()}</span>
    </Badge>
  );
};
