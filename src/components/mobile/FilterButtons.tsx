import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TrendingUp, Users, Globe } from 'lucide-react';

export type FilterType = 'all' | 'connections' | 'trending';

interface FilterButtonsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  className?: string;
}

const filters = [
  {
    id: 'all' as FilterType,
    label: 'All',
    icon: Globe,
    description: 'All public posts'
  },
  {
    id: 'connections' as FilterType,
    label: 'Connections',
    icon: Users,
    description: 'Posts from your network'
  },
  {
    id: 'trending' as FilterType,
    label: 'Trending',
    icon: TrendingUp,
    description: 'Popular right now'
  }
];

export const FilterButtons: React.FC<FilterButtonsProps> = ({
  activeFilter,
  onFilterChange,
  className
}) => {
  return (
    <div className={cn("flex items-center space-x-2 px-4 py-3 bg-white", className)}>
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeFilter === filter.id;
        
        return (
          <Button
            key={filter.id}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(filter.id)}
            className={cn(
              "flex items-center space-x-2 transition-all duration-200 hover-scale",
              isActive 
                ? "bg-blue-600 text-white shadow-md hover:bg-blue-700" 
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium">{filter.label}</span>
          </Button>
        );
      })}
    </div>
  );
};