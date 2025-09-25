import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  COMPREHENSIVE_INDUSTRIES, 
  INDUSTRY_CATEGORIES, 
  TRENDING_INDUSTRIES, 
  HIGH_GROWTH_INDUSTRIES 
} from '@/data/industries';
import { 
  TrendingUp, Star, Building, Search, ArrowRight, 
  Users, MapPin, DollarSign, Clock, Sparkles 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HundredsOfIndustriesSection = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredIndustries = COMPREHENSIVE_INDUSTRIES.filter(industry => {
    const matchesSearch = industry.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || industry.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const trendingIndustries = COMPREHENSIVE_INDUSTRIES.filter(industry => 
    TRENDING_INDUSTRIES.includes(industry.id)
  );

  const highGrowthIndustries = COMPREHENSIVE_INDUSTRIES.filter(industry => 
    HIGH_GROWTH_INDUSTRIES.includes(industry.id)
  );

  const topIndustriesByJobs = [...COMPREHENSIVE_INDUSTRIES]
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const handleIndustryClick = (industryId: string) => {
    navigate(`/jobs?industry=${industryId}`);
  };

  const totalJobs = COMPREHENSIVE_INDUSTRIES.reduce((sum, industry) => sum + industry.count, 0);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-4 py-2 rounded-full">
          <Sparkles className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">100+ Industries Available</span>
        </div>
        <h2 className="text-3xl font-bold">
          Explore Jobs Across <span className="text-blue-600">Every Industry</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          From cutting-edge tech to traditional manufacturing, find opportunities in 
          <span className="font-semibold text-blue-600"> {COMPREHENSIVE_INDUSTRIES.length} industries</span> with 
          <span className="font-semibold text-green-600"> {totalJobs.toLocaleString()} active jobs</span>
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <Building className="h-8 w-8 mx-auto mb-2 text-blue-500" />
          <div className="text-2xl font-bold">{COMPREHENSIVE_INDUSTRIES.length}</div>
          <div className="text-sm text-muted-foreground">Industries</div>
        </Card>
        <Card className="p-4 text-center">
          <Users className="h-8 w-8 mx-auto mb-2 text-green-500" />
          <div className="text-2xl font-bold">{totalJobs.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Active Jobs</div>
        </Card>
        <Card className="p-4 text-center">
          <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-500" />
          <div className="text-2xl font-bold">{TRENDING_INDUSTRIES.length}</div>
          <div className="text-sm text-muted-foreground">Trending</div>
        </Card>
        <Card className="p-4 text-center">
          <Star className="h-8 w-8 mx-auto mb-2 text-purple-500" />
          <div className="text-2xl font-bold">{HIGH_GROWTH_INDUSTRIES.length}</div>
          <div className="text-sm text-muted-foreground">High Growth</div>
        </Card>
      </div>

      {/* Search and Category Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search from 100+ industries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All Categories
          </Button>
          {INDUSTRY_CATEGORIES.slice(0, 5).map(category => (
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

      {/* Trending Industries */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <h3 className="text-xl font-semibold">🔥 Trending Industries</h3>
          </div>
          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
            High Demand
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {trendingIndustries.slice(0, 8).map(industry => (
            <Card 
              key={industry.id}
              className="p-4 hover:shadow-lg transition-all cursor-pointer group border-orange-200"
              onClick={() => handleIndustryClick(industry.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                    {industry.category}
                  </Badge>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-orange-500 transition-colors" />
              </div>
              <h4 className="font-medium mb-2 group-hover:text-orange-600 transition-colors">
                {industry.name}
              </h4>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{industry.count.toLocaleString()} jobs</span>
                <span className="text-orange-600 font-medium">+15% growth</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* High Growth Industries */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-green-500" />
            <h3 className="text-xl font-semibold">⚡ High Growth Industries</h3>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Fast Growing
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {highGrowthIndustries.slice(0, 8).map(industry => (
            <Card 
              key={industry.id}
              className="p-4 hover:shadow-lg transition-all cursor-pointer group border-green-200"
              onClick={() => handleIndustryClick(industry.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-green-500" />
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                    {industry.category}
                  </Badge>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-green-500 transition-colors" />
              </div>
              <h4 className="font-medium mb-2 group-hover:text-green-600 transition-colors">
                {industry.name}
              </h4>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{industry.count.toLocaleString()} jobs</span>
                <span className="text-green-600 font-medium">+25% growth</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Top Industries by Job Count */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-500" />
            <h3 className="text-xl font-semibold">💼 Most In-Demand Industries</h3>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            Highest Job Count
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {topIndustriesByJobs.map(industry => (
            <Card 
              key={industry.id}
              className="p-4 hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => handleIndustryClick(industry.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <Badge variant="secondary" className="text-xs">
                  {industry.category}
                </Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
              </div>
              <h4 className="font-medium mb-2 group-hover:text-blue-600 transition-colors">
                {industry.name}
              </h4>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{industry.count.toLocaleString()} jobs</span>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span className="text-blue-600 font-medium">Popular</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* All Industries Grid (if searching or category selected) */}
      {(searchTerm || selectedCategory !== 'all') && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">
            {searchTerm ? `Search Results (${filteredIndustries.length})` : 
             `${selectedCategory} Industries (${filteredIndustries.length})`}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredIndustries.map(industry => (
              <Card 
                key={industry.id}
                className="p-4 hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => handleIndustryClick(industry.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {TRENDING_INDUSTRIES.includes(industry.id) && (
                      <TrendingUp className="h-3 w-3 text-orange-500" />
                    )}
                    {HIGH_GROWTH_INDUSTRIES.includes(industry.id) && (
                      <Star className="h-3 w-3 text-green-500" />
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {industry.category}
                    </Badge>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h4 className="font-medium mb-2 group-hover:text-primary transition-colors">
                  {industry.name}
                </h4>
                <div className="text-sm text-muted-foreground">
                  {industry.count.toLocaleString()} jobs available
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Browse All Button */}
      {!searchTerm && selectedCategory === 'all' && (
        <div className="text-center">
          <Button
            size="lg"
            onClick={() => setSelectedCategory('Tech')}
            className="px-8"
          >
            Browse All {COMPREHENSIVE_INDUSTRIES.length} Industries
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};