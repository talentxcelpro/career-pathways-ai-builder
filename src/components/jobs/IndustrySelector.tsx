import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  COMPREHENSIVE_INDUSTRIES, 
  INDUSTRY_CATEGORIES, 
  TRENDING_INDUSTRIES, 
  HIGH_GROWTH_INDUSTRIES 
} from '@/data/industries';
import { TrendingUp, Star, Search, Filter } from 'lucide-react';

interface IndustrySelectorProps {
  selectedIndustries: string[];
  onIndustryChange: (industries: string[]) => void;
  maxSelections?: number;
  showTrending?: boolean;
  compact?: boolean;
}

export const IndustrySelector: React.FC<IndustrySelectorProps> = ({
  selectedIndustries,
  onIndustryChange,
  maxSelections = 5,
  showTrending = true,
  compact = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAll, setShowAll] = useState(false);

  const filteredIndustries = COMPREHENSIVE_INDUSTRIES.filter(industry => {
    const matchesSearch = industry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         industry.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || industry.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const displayedIndustries = showAll ? filteredIndustries : filteredIndustries.slice(0, compact ? 20 : 50);

  const handleIndustryToggle = (industryId: string) => {
    const isSelected = selectedIndustries.includes(industryId);
    
    if (isSelected) {
      onIndustryChange(selectedIndustries.filter(id => id !== industryId));
    } else if (selectedIndustries.length < maxSelections) {
      onIndustryChange([...selectedIndustries, industryId]);
    }
  };

  const trendingIndustriesData = COMPREHENSIVE_INDUSTRIES.filter(industry => 
    TRENDING_INDUSTRIES.includes(industry.id)
  );

  const highGrowthIndustriesData = COMPREHENSIVE_INDUSTRIES.filter(industry => 
    HIGH_GROWTH_INDUSTRIES.includes(industry.id)
  );

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search industries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All
          </Button>
          {INDUSTRY_CATEGORIES.slice(0, 3).map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Selected Industries */}
      {selectedIndustries.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">
            Selected ({selectedIndustries.length}/{maxSelections})
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedIndustries.map(industryId => {
              const industry = COMPREHENSIVE_INDUSTRIES.find(i => i.id === industryId);
              if (!industry) return null;
              
              return (
                <Badge
                  key={industryId}
                  variant="default"
                  className="cursor-pointer"
                  onClick={() => handleIndustryToggle(industryId)}
                >
                  {industry.name} ✕
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Trending Industries */}
      {showTrending && searchTerm === '' && selectedCategory === 'all' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-700">Trending Industries</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {trendingIndustriesData.slice(0, 8).map(industry => (
              <Button
                key={industry.id}
                variant={selectedIndustries.includes(industry.id) ? 'default' : 'outline'}
                size="sm"
                className="justify-start text-left h-auto p-3"
                onClick={() => handleIndustryToggle(industry.id)}
                disabled={!selectedIndustries.includes(industry.id) && selectedIndustries.length >= maxSelections}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium text-xs">{industry.name}</span>
                  <span className="text-xs text-muted-foreground">{industry.count.toLocaleString()} jobs</span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* High Growth Industries */}
      {showTrending && searchTerm === '' && selectedCategory === 'all' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-700">High Growth</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {highGrowthIndustriesData.slice(0, 8).map(industry => (
              <Button
                key={industry.id}
                variant={selectedIndustries.includes(industry.id) ? 'default' : 'outline'}
                size="sm"
                className="justify-start text-left h-auto p-3"
                onClick={() => handleIndustryToggle(industry.id)}
                disabled={!selectedIndustries.includes(industry.id) && selectedIndustries.length >= maxSelections}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium text-xs">{industry.name}</span>
                  <span className="text-xs text-muted-foreground">{industry.count.toLocaleString()} jobs</span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* All Industries */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            All Industries ({filteredIndustries.length})
          </span>
          {!showAll && filteredIndustries.length > displayedIndustries.length && (
            <Button
              variant="link"
              size="sm"
              onClick={() => setShowAll(true)}
            >
              Show All ({filteredIndustries.length})
            </Button>
          )}
        </div>

        <ScrollArea className={showAll ? "h-96" : "h-auto"}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {displayedIndustries.map(industry => (
              <Button
                key={industry.id}
                variant={selectedIndustries.includes(industry.id) ? 'default' : 'outline'}
                size="sm"
                className="justify-between text-left h-auto p-3"
                onClick={() => handleIndustryToggle(industry.id)}
                disabled={!selectedIndustries.includes(industry.id) && selectedIndustries.length >= maxSelections}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium text-xs">{industry.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      {industry.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {industry.count.toLocaleString()}
                    </span>
                  </div>
                </div>
                {TRENDING_INDUSTRIES.includes(industry.id) && (
                  <TrendingUp className="h-3 w-3 text-orange-500 ml-2" />
                )}
                {HIGH_GROWTH_INDUSTRIES.includes(industry.id) && (
                  <Star className="h-3 w-3 text-green-500 ml-2" />
                )}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Category Filter Pills */}
      {searchTerm === '' && (
        <div className="space-y-2">
          <span className="text-sm font-medium">Browse by Category</span>
          <div className="flex flex-wrap gap-2">
            {INDUSTRY_CATEGORIES.map(category => {
              const categoryCount = COMPREHENSIVE_INDUSTRIES.filter(i => i.category === category).length;
              return (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(selectedCategory === category ? 'all' : category)}
                >
                  {category} ({categoryCount})
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};