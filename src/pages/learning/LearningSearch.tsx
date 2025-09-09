import React, { useState } from 'react';
import { LearningHeader } from '@/components/learning/LearningHeader';
import { updateMetaTags } from '@/utils/metaTags';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, Clock, Star, Users, BookOpen, Play, MapPin } from 'lucide-react';

const LearningSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  React.useEffect(() => {
    updateMetaTags({
      title: 'Learning Search | TalentXcel Learning',
      description: 'Search and discover courses, learning paths, and educational content tailored to your needs.'
    });
  }, []);

  // Mock search results data
  const searchResults = [
    {
      id: 1,
      type: 'course',
      title: 'React Advanced Patterns and Performance',
      description: 'Master advanced React concepts including performance optimization, advanced patterns, and best practices',
      instructor: 'Sarah Johnson',
      rating: 4.8,
      students: 2847,
      duration: '8 hours',
      difficulty: 'Advanced',
      category: 'Frontend Development',
      price: 'Free',
      tags: ['React', 'Performance', 'Patterns', 'JavaScript'],
      thumbnail: '/placeholder-course.jpg'
    },
    {
      id: 2,
      type: 'learning-path',
      title: 'Full Stack Web Developer Path',
      description: 'Complete journey from frontend to backend development with modern technologies',
      courses: 12,
      duration: '120 hours',
      difficulty: 'Intermediate',
      category: 'Full Stack',
      price: 'Premium',
      tags: ['JavaScript', 'React', 'Node.js', 'Databases', 'Full Stack'],
      thumbnail: '/placeholder-path.jpg'
    },
    {
      id: 3,
      type: 'course',
      title: 'Python Data Science Fundamentals',
      description: 'Learn data analysis, visualization, and machine learning basics with Python',
      instructor: 'Dr. Michael Chen',
      rating: 4.9,
      students: 5632,
      duration: '15 hours',
      difficulty: 'Beginner',
      category: 'Data Science',
      price: 'Free',
      tags: ['Python', 'Data Science', 'Machine Learning', 'Pandas'],
      thumbnail: '/placeholder-course.jpg'
    },
    {
      id: 4,
      type: 'course',
      title: 'AWS Cloud Architecture Essentials',
      description: 'Design and implement scalable cloud solutions using AWS services',
      instructor: 'Jessica Rodriguez',
      rating: 4.7,
      students: 1923,
      duration: '12 hours',
      difficulty: 'Intermediate',
      category: 'Cloud Computing',
      price: 'Premium',
      tags: ['AWS', 'Cloud', 'Architecture', 'DevOps'],
      thumbnail: '/placeholder-course.jpg'
    },
    {
      id: 5,
      type: 'learning-path',
      title: 'Data Scientist Career Track',
      description: 'Comprehensive path covering statistics, machine learning, and data visualization',
      courses: 18,
      duration: '200 hours',
      difficulty: 'Intermediate',
      category: 'Data Science',
      price: 'Premium',
      tags: ['Python', 'Statistics', 'Machine Learning', 'Data Visualization'],
      thumbnail: '/placeholder-path.jpg'
    },
    {
      id: 6,
      type: 'course',
      title: 'Cybersecurity Fundamentals',
      description: 'Essential security concepts, threat analysis, and protection strategies',
      instructor: 'David Kim',
      rating: 4.6,
      students: 3421,
      duration: '10 hours',
      difficulty: 'Beginner',
      category: 'Cybersecurity',
      price: 'Free',
      tags: ['Security', 'Networking', 'Ethical Hacking', 'Risk Management'],
      thumbnail: '/placeholder-course.jpg'
    }
  ];

  const categories = [
    'Frontend Development',
    'Backend Development',
    'Full Stack',
    'Data Science',
    'Machine Learning',
    'Cloud Computing',
    'Cybersecurity',
    'Mobile Development',
    'DevOps',
    'UI/UX Design'
  ];

  const popularSearches = [
    'React', 'Python', 'JavaScript', 'Machine Learning', 'AWS',
    'Node.js', 'Data Science', 'TypeScript', 'Docker', 'Kubernetes'
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-700 bg-green-100';
      case 'Intermediate': return 'text-blue-700 bg-blue-100';
      case 'Advanced': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course': return <BookOpen className="h-4 w-4" />;
      case 'learning-path': return <MapPin className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LearningHeader />
        
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <Search className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Learning Search</h1>
            <p className="text-gray-600">
              Discover courses, learning paths, and content tailored to your needs
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search for courses, skills, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => setShowFilters(!showFilters)} variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button>Search</Button>
            </div>

            {/* Popular Searches */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Popular searches:</p>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((search, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-blue-100 hover:text-blue-700"
                    onClick={() => setSearchQuery(search)}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Content Type */}
                <div>
                  <h3 className="font-medium mb-3">Content Type</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="courses" />
                      <label htmlFor="courses" className="text-sm">Courses</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="paths" />
                      <label htmlFor="paths" className="text-sm">Learning Paths</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="projects" />
                      <label htmlFor="projects" className="text-sm">Projects</label>
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <h3 className="font-medium mb-3">Category</h3>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category.toLowerCase().replace(/\s+/g, '-')}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty */}
                <div>
                  <h3 className="font-medium mb-3">Difficulty</h3>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration */}
                <div>
                  <h3 className="font-medium mb-3">Duration</h3>
                  <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any Duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Duration</SelectItem>
                      <SelectItem value="short">0-3 hours</SelectItem>
                      <SelectItem value="medium">3-10 hours</SelectItem>
                      <SelectItem value="long">10+ hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price */}
                <div>
                  <h3 className="font-medium mb-3">Price</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="free" />
                      <label htmlFor="free" className="text-sm">Free</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="premium" />
                      <label htmlFor="premium" className="text-sm">Premium</label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3 space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                Showing {searchResults.length} results {searchQuery && `for "${searchQuery}"`}
              </p>
              <Select defaultValue="relevance">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Sort by Relevance</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results List */}
            <div className="space-y-4">
              {searchResults.map((result) => (
                <Card key={result.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="w-32 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                        {getTypeIcon(result.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {result.type === 'learning-path' ? 'Learning Path' : 'Course'}
                              </Badge>
                              <Badge className={getDifficultyColor(result.difficulty)}>
                                {result.difficulty}
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-lg text-gray-900 hover:text-blue-600 cursor-pointer">
                              {result.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">{result.description}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={result.price === 'Free' ? 'secondary' : 'default'}>
                              {result.price}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          {result.type === 'course' && result.instructor && (
                            <span>by {result.instructor}</span>
                          )}
                          {result.type === 'course' && result.rating && (
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-500 mr-1" />
                              <span>{result.rating}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{result.duration}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            <span>
                              {result.type === 'course' 
                                ? `${result.students?.toLocaleString()} students`
                                : `${result.courses} courses`
                              }
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {result.tags.slice(0, 4).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {result.tags.length > 4 && (
                              <Badge variant="secondary" className="text-xs">
                                +{result.tags.length - 4} more
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Learn More
                            </Button>
                            <Button size="sm">
                              <Play className="h-3 w-3 mr-1" />
                              {result.type === 'course' ? 'Start Course' : 'Start Path'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningSearch;