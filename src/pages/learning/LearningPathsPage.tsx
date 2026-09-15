import React, { useState } from 'react';
import { LearningHeader } from '@/components/learning/LearningHeader';
import { LearningPathCard } from '@/components/learning/LearningPathCard';
import { useLearningData } from '@/hooks/useLearningData';
import { updateMetaTags } from '@/utils/metaTags';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Search, Filter } from 'lucide-react';

const LearningPathsPage = () => {
  const { learningPaths, isLoading } = useLearningData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');

  React.useEffect(() => {
    updateMetaTags({
      title: 'Learning Paths | TalentXcel Learning',
      description: 'Structured learning journeys designed to help you master specific skills and achieve career goals.'
    });
  }, []);

  // Filter learning paths based on search and filters
  const filteredPaths = learningPaths?.filter(path => {
    const matchesSearch = path.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         path.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         path.target_role?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDifficulty = selectedDifficulty === 'all' || path.difficulty_level === selectedDifficulty;
    
    const matchesDuration = selectedDuration === 'all' || 
      (selectedDuration === 'short' && path.estimated_duration_weeks <= 4) ||
      (selectedDuration === 'medium' && path.estimated_duration_weeks > 4 && path.estimated_duration_weeks <= 12) ||
      (selectedDuration === 'long' && path.estimated_duration_weeks > 12);
    
    return matchesSearch && matchesDifficulty && matchesDuration;
  }) || [];

  const pathStats = [
    {
      label: 'Total Paths',
      value: learningPaths?.length || 0,
      color: 'text-blue-600'
    },
    {
      label: 'Beginner Friendly',
      value: learningPaths?.filter(p => p.difficulty_level === 'beginner').length || 0,
      color: 'text-green-600'
    },
    {
      label: 'Career Focused',
      value: learningPaths?.filter(p => p.target_role).length || 0,
      color: 'text-purple-600'
    },
    {
      label: 'Quick Paths',
      value: learningPaths?.filter(p => p.estimated_duration_weeks <= 4).length || 0,
      color: 'text-orange-600'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LearningHeader />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LearningHeader />
        
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Learning Paths</h1>
              <p className="text-gray-600">
                Structured journeys to master skills and achieve your career goals
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">
            {filteredPaths.length} paths available
          </Badge>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {pathStats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search learning paths..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger>
              <SelectValue placeholder="Difficulty Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedDuration} onValueChange={setSelectedDuration}>
            <SelectTrigger>
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Durations</SelectItem>
              <SelectItem value="short">Short (1-4 weeks)</SelectItem>
              <SelectItem value="medium">Medium (5-12 weeks)</SelectItem>
              <SelectItem value="long">Long (12+ weeks)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Learning Paths Grid */}
        {filteredPaths.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No learning paths found</h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search criteria or browse different categories.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {filteredPaths.map((path) => (
              <LearningPathCard key={path.id} path={path} />
            ))}
          </div>
        )}

        {/* Featured Learning Path Categories */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Popular Learning Tracks</h2>
          <p className="text-gray-600 mb-6">
            Discover curated learning paths designed by industry experts
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-lg font-semibold text-blue-600 mb-2">Web Development</div>
                <div className="text-sm text-gray-600">Frontend & Backend skills</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-lg font-semibold text-green-600 mb-2">Data Science</div>
                <div className="text-sm text-gray-600">Analytics & Machine Learning</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-lg font-semibold text-purple-600 mb-2">Digital Marketing</div>
                <div className="text-sm text-gray-600">SEO, Social Media & Content</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPathsPage;