import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Filter } from 'lucide-react';

interface AdvancedFiltersProps {
  verificationFilter: string;
  setVerificationFilter: (filter: string) => void;
  completionFilter: string;
  setCompletionFilter: (filter: string) => void;
  roleFilter: string;
  statusFilter: string;
  searchTerm: string;
  onClearFilters: () => void;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  verificationFilter,
  setVerificationFilter,
  completionFilter,
  setCompletionFilter,
  roleFilter,
  statusFilter,
  searchTerm,
  onClearFilters
}) => {
  const activeFiltersCount = [
    roleFilter !== 'all' ? 1 : 0,
    statusFilter !== 'all' ? 1 : 0,
    verificationFilter !== 'all' ? 1 : 0,
    completionFilter !== 'all' ? 1 : 0,
    searchTerm.trim() ? 1 : 0
  ].filter(Boolean).length;

  const getFilterLabel = (type: string, value: string) => {
    const labels: Record<string, Record<string, string>> = {
      role: {
        job_seeker: 'Job Seekers',
        employer: 'Employers',
        candidate: 'Candidates',
        admin: 'Admins'
      },
      status: {
        active: 'Active Users',
        inactive: 'Inactive Users'
      },
      verification: {
        verified: 'Verified Users',
        unverified: 'Unverified Users'
      },
      completion: {
        low: 'Low Completion (0-25%)',
        medium: 'Medium Completion (26-75%)',
        high: 'High Completion (76-100%)'
      }
    };
    return labels[type]?.[value] || value;
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Filter Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Advanced Filters</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFiltersCount} active
                </Badge>
              )}
            </div>
            {activeFiltersCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClearFilters}
                className="text-xs"
              >
                Clear All
              </Button>
            )}
          </div>

          {/* Quick Filter Tags */}
          <div className="flex flex-wrap gap-2">
            {/* Verification Status */}
            <div className="flex gap-1">
              <Badge 
                variant={verificationFilter === 'verified' ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => setVerificationFilter(verificationFilter === 'verified' ? 'all' : 'verified')}
              >
                ✅ Verified
              </Badge>
              <Badge 
                variant={verificationFilter === 'unverified' ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => setVerificationFilter(verificationFilter === 'unverified' ? 'all' : 'unverified')}
              >
                ❌ Unverified
              </Badge>
            </div>

            {/* Profile Completion */}
            <div className="flex gap-1">
              <Badge 
                variant={completionFilter === 'high' ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => setCompletionFilter(completionFilter === 'high' ? 'all' : 'high')}
              >
                🔥 High Completion
              </Badge>
              <Badge 
                variant={completionFilter === 'medium' ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => setCompletionFilter(completionFilter === 'medium' ? 'all' : 'medium')}
              >
                📊 Medium Completion
              </Badge>
              <Badge 
                variant={completionFilter === 'low' ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => setCompletionFilter(completionFilter === 'low' ? 'all' : 'low')}
              >
                📉 Low Completion
              </Badge>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {searchTerm.trim() && (
                <Badge variant="secondary" className="text-xs">
                  Search: "{searchTerm}"
                </Badge>
              )}
              {roleFilter !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  {getFilterLabel('role', roleFilter)}
                </Badge>
              )}
              {statusFilter !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  {getFilterLabel('status', statusFilter)}
                </Badge>
              )}
              {verificationFilter !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  {getFilterLabel('verification', verificationFilter)}
                </Badge>
              )}
              {completionFilter !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  {getFilterLabel('completion', completionFilter)}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};