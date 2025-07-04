import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Briefcase, 
  FileText, 
  Zap, 
  Building, 
  BookOpen, 
  Target, 
  User,
  Search,
  Filter,
  Volume2,
  VolumeX,
  AlertTriangle,
  Info,
  CheckCircle
} from 'lucide-react';

interface NotificationFiltersProps {
  filters: {
    module?: string;
    is_read?: boolean;
    priority?: string;
    search?: string;
  };
  onFiltersChange: (filters: any) => void;
  stats: {
    total: number;
    unread: number;
    byModule: Record<string, number>;
    byPriority: Record<string, number>;
    thisWeek: number;
  };
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
}

const MODULE_OPTIONS = [
  { value: 'network', label: 'Network', icon: Users, color: 'text-blue-600' },
  { value: 'jobs', label: 'Jobs', icon: Briefcase, color: 'text-green-600' },
  { value: 'resume', label: 'Resume', icon: FileText, color: 'text-purple-600' },
  { value: 'tools', label: 'Tools', icon: Zap, color: 'text-orange-600' },
  { value: 'companies', label: 'Companies', icon: Building, color: 'text-gray-600' },
  { value: 'learning', label: 'Learning', icon: BookOpen, color: 'text-indigo-600' },
  { value: 'career_map', label: 'Career Map', icon: Target, color: 'text-pink-600' },
  { value: 'employer', label: 'Employer', icon: User, color: 'text-red-600' }
];

const PRIORITY_OPTIONS = [
  { value: 'high', label: 'High Priority', icon: AlertTriangle, color: 'text-red-600' },
  { value: 'medium', label: 'Medium Priority', icon: Info, color: 'text-yellow-600' },
  { value: 'low', label: 'Low Priority', icon: CheckCircle, color: 'text-green-600' }
];

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  filters,
  onFiltersChange,
  stats,
  soundEnabled,
  onToggleSound
}) => {
  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' ? undefined : value
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).some(key => filters[key as keyof typeof filters] !== undefined);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-sm font-medium">Search Notifications</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by title or message..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Quick Filters</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filters.is_read === false ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange('is_read', filters.is_read === false ? undefined : false)}
              >
                Unread
                {stats.unread > 0 && (
                  <Badge className="ml-2 bg-blue-600 text-white">{stats.unread}</Badge>
                )}
              </Button>
              
              <Button
                variant={filters.is_read === true ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange('is_read', filters.is_read === true ? undefined : true)}
              >
                Read
              </Button>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-red-600 hover:text-red-700"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Module Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Filter by Module</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {MODULE_OPTIONS.map((module) => {
                const Icon = module.icon;
                const count = stats.byModule[module.value] || 0;
                const isActive = filters.module === module.value;
                
                return (
                  <Button
                    key={module.value}
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange('module', isActive ? undefined : module.value)}
                    className="justify-start h-10"
                    disabled={count === 0}
                  >
                    <Icon className={`h-4 w-4 mr-2 ${module.color}`} />
                    <span className="truncate">{module.label}</span>
                    {count > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {count}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Priority Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Filter by Priority</Label>
            <Select 
              value={filters.priority || 'all'} 
              onValueChange={(value) => handleFilterChange('priority', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {PRIORITY_OPTIONS.map((priority) => {
                  const Icon = priority.icon;
                  const count = stats.byPriority[priority.value] || 0;
                  
                  return (
                    <SelectItem key={priority.value} value={priority.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${priority.color}`} />
                        <span>{priority.label}</span>
                        {count > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {count}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Settings */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4 text-green-600" />
                ) : (
                  <VolumeX className="h-4 w-4 text-gray-400" />
                )}
                <Label htmlFor="sound-toggle" className="text-sm font-medium">
                  Notification Sounds
                </Label>
              </div>
              <Switch
                id="sound-toggle"
                checked={soundEnabled}
                onCheckedChange={onToggleSound}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};