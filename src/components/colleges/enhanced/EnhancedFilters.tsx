import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Star, Award, TrendingUp, DollarSign, Filter, X } from 'lucide-react';

interface EnhancedFiltersProps {
  filters: {
    collegeType: string;
    city: string;
    state: string;
    ranking: string;
    verifiedOnly: boolean;
    premiumOnly: boolean;
    placementRange: [number, number];
    feeRange: [number, number];
  };
  onFiltersChange: (filters: any) => void;
  filterOptions: {
    college_types: string[];
    cities: string[];
    states: string[];
  };
}

export const EnhancedFilters: React.FC<EnhancedFiltersProps> = ({
  filters,
  onFiltersChange,
  filterOptions
}) => {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      collegeType: 'all',
      city: 'all',
      state: 'all',
      ranking: 'all',
      verifiedOnly: false,
      premiumOnly: false,
      placementRange: [0, 100],
      feeRange: [0, 1000000]
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.collegeType && filters.collegeType !== 'all') count++;
    if (filters.city && filters.city !== 'all') count++;
    if (filters.state && filters.state !== 'all') count++;
    if (filters.ranking && filters.ranking !== 'all') count++;
    if (filters.verifiedOnly) count++;
    if (filters.premiumOnly) count++;
    if (filters.placementRange[0] > 0 || filters.placementRange[1] < 100) count++;
    if (filters.feeRange[0] > 0 || filters.feeRange[1] < 1000000) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-white/40">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Advanced Filters</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </span>
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select value={filters.collegeType} onValueChange={(value) => updateFilter('collegeType', value)}>
            <SelectTrigger className="bg-white/70">
              <SelectValue placeholder="College Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {filterOptions.college_types.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.state} onValueChange={(value) => updateFilter('state', value)}>
            <SelectTrigger className="bg-white/70">
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {filterOptions.states.map((state) => (
                <SelectItem key={state} value={state}>{state}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.city} onValueChange={(value) => updateFilter('city', value)}>
            <SelectTrigger className="bg-white/70">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {filterOptions.cities.map((city) => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Trust & Quality Filters */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Trust & Quality</span>
          </h4>
          
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={filters.verifiedOnly}
                onCheckedChange={(checked) => updateFilter('verifiedOnly', checked)}
              />
              <label 
                htmlFor="verified" 
                className="text-sm font-medium text-gray-700 flex items-center space-x-1 cursor-pointer"
              >
                <Shield className="h-3 w-3 text-green-600" />
                <span>Verified Colleges Only</span>
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="premium"
                checked={filters.premiumOnly}
                onCheckedChange={(checked) => updateFilter('premiumOnly', checked)}
              />
              <label 
                htmlFor="premium" 
                className="text-sm font-medium text-gray-700 flex items-center space-x-1 cursor-pointer"
              >
                <Star className="h-3 w-3 text-purple-600" />
                <span>Premium Colleges Only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Ranking Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            <Award className="h-4 w-4" />
            <span>National Ranking</span>
          </label>
          <Select value={filters.ranking} onValueChange={(value) => updateFilter('ranking', value)}>
            <SelectTrigger className="bg-white/70">
              <SelectValue placeholder="Any Ranking" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Ranking</SelectItem>
              <SelectItem value="1-10">Top 10</SelectItem>
              <SelectItem value="1-25">Top 25</SelectItem>
              <SelectItem value="1-50">Top 50</SelectItem>
              <SelectItem value="1-100">Top 100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Placement Rate Filter */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Placement Rate: {filters.placementRange[0]}% - {filters.placementRange[1]}%</span>
          </label>
          <Slider
            value={filters.placementRange}
            onValueChange={(value) => updateFilter('placementRange', value)}
            max={100}
            min={0}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Fee Range Filter */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>Annual Fees: ₹{(filters.feeRange[0] / 100000).toFixed(1)}L - ₹{(filters.feeRange[1] / 100000).toFixed(1)}L</span>
          </label>
          <Slider
            value={filters.feeRange}
            onValueChange={(value) => updateFilter('feeRange', value)}
            max={1000000}
            min={0}
            step={25000}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>₹0L</span>
            <span>₹10L+</span>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="pt-3 border-t">
            <div className="text-sm font-medium text-gray-700 mb-2">Active Filters:</div>
            <div className="flex flex-wrap gap-2">
              {filters.verifiedOnly && (
                <Badge variant="secondary" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified Only
                </Badge>
              )}
              {filters.premiumOnly && (
                <Badge variant="secondary" className="text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  Premium Only
                </Badge>
              )}
              {filters.collegeType && filters.collegeType !== 'all' && (
                <Badge variant="outline" className="text-xs">
                  {filters.collegeType}
                </Badge>
              )}
              {filters.state && filters.state !== 'all' && (
                <Badge variant="outline" className="text-xs">
                  {filters.state}
                </Badge>
              )}
              {filters.city && filters.city !== 'all' && (
                <Badge variant="outline" className="text-xs">
                  {filters.city}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};