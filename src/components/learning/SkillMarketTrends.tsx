import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, IndianRupee, Users, Target } from 'lucide-react';
import { useLearningJobIntegration } from '@/hooks/useLearningJobIntegration';

export const SkillMarketTrends: React.FC = () => {
  const { skillTrends, isLoading, fetchSkillTrends } = useLearningJobIntegration();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('India');

  const filteredTrends = skillTrends.filter(trend => {
    const matchesSearch = trend.skill_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trend.industry.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesIndustry = selectedIndustry === 'all' || trend.industry === selectedIndustry;
    
    return matchesSearch && matchesIndustry;
  });

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGrowthIcon = (growthRate: number) => {
    return growthRate > 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const formatSalary = (min: number, max: number) => {
    const formatAmount = (amount: number) => {
      if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)}Cr`;
      if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
      if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
      return amount.toString();
    };
    
    return `₹${formatAmount(min)} - ₹${formatAmount(max)}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold">Skill Market Trends</h2>
        <Badge variant="secondary" className="ml-2">
          {filteredTrends.length} skills
        </Badge>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Input
          placeholder="Search skills or industries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        
        <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
          <SelectTrigger>
            <SelectValue placeholder="Select Industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            <SelectItem value="Technology">Technology</SelectItem>
            <SelectItem value="Healthcare">Healthcare</SelectItem>
            <SelectItem value="Finance">Finance</SelectItem>
            <SelectItem value="Education">Education</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={selectedLocation} onValueChange={(value) => {
          setSelectedLocation(value);
          fetchSkillTrends(value);
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="India">India</SelectItem>
            <SelectItem value="Bangalore">Bangalore</SelectItem>
            <SelectItem value="Mumbai">Mumbai</SelectItem>
            <SelectItem value="Delhi">Delhi</SelectItem>
            <SelectItem value="Hyderabad">Hyderabad</SelectItem>
            <SelectItem value="Pune">Pune</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Trends Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTrends.map((trend) => (
          <Card key={trend.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{trend.skill_name}</CardTitle>
                <Badge 
                  variant="secondary" 
                  className={getDemandColor(trend.demand_level)}
                >
                  {trend.demand_level} demand
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{trend.industry}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Growth Rate */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Growth Rate</span>
                <div className="flex items-center gap-1">
                  {getGrowthIcon(trend.growth_rate)}
                  <span className={`font-medium ${trend.growth_rate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend.growth_rate > 0 ? '+' : ''}{trend.growth_rate.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Salary Range */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Salary Range</span>
                <div className="flex items-center gap-1">
                  <IndianRupee className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-600">
                    {formatSalary(trend.avg_salary_min, trend.avg_salary_max)}
                  </span>
                </div>
              </div>

              {/* Job Openings */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Job Openings</span>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-600">
                    {trend.job_openings_count.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Confidence Score */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Data Confidence</span>
                <Badge variant="outline" className="text-xs">
                  {trend.confidence_score}%
                </Badge>
              </div>

              {/* Related Skills */}
              {trend.related_skills && trend.related_skills.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm text-gray-600">Related Skills</span>
                  <div className="flex flex-wrap gap-1">
                    {trend.related_skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {trend.related_skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{trend.related_skills.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Data Source */}
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500">
                  Source: {trend.data_source} • Updated: {new Date(trend.trend_date).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTrends.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No trends found</h3>
          <p className="text-gray-500">
            Try adjusting your search criteria or location filter.
          </p>
        </div>
      )}
    </div>
  );
};