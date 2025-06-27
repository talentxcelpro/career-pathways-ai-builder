
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DataFreshnessProps {
  lastUpdated: Date;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export const DataFreshness: React.FC<DataFreshnessProps> = ({ 
  lastUpdated, 
  isRefreshing = false, 
  onRefresh 
}) => {
  const timeAgo = formatDistanceToNow(lastUpdated, { addSuffix: true });

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <Badge variant="outline" className="text-xs">
        Updated {timeAgo}
      </Badge>
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-1 hover:bg-gray-100 rounded"
          title="Refresh data"
        >
          <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      )}
    </div>
  );
};
