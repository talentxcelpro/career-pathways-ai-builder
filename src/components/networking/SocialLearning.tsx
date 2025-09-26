import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Clock, Users, Award, Play, Filter, Plus, TrendingUp } from "lucide-react";
import { useNetworking } from "@/hooks/useNetworking";
import { useAuth } from "@/contexts/AuthContext";

const SocialLearning = () => {
  const { user } = useAuth();
  const { learningPaths, enrollInLearningPath, isLoading, isProcessing } = useNetworking();
  const [activeTab, setActiveTab] = useState('browse');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock learning paths data
  const mockLearningPaths = [
    {
      id: '1',
      title: 'Full-Stack JavaScript Mastery',
      description: 'Comprehensive learning path covering frontend and backend JavaScript development with React and Node.js.',
      difficulty_level: 'intermediate',
      estimated_hours: 120,
      skills_gained: ['React', 'Node.js', 'Express', 'MongoDB', 'REST APIs', 'Authentication'],
      prerequisites: ['Basic JavaScript', 'HTML/CSS'],
      modules: [
        { title: 'React Fundamentals', duration: 20, completed: false },
        { title: 'State Management', duration: 15, completed: false },
        { title: 'Node.js Backend', duration: 25, completed: false },
        { title: 'Database Integration', duration: 20, completed: false },
        { title: 'Authentication & Security', duration: 15, completed: false },
        { title: 'Deployment & DevOps', duration: 25, completed: false }
      ],
      is_collaborative: true,
      max_participants: 50,
      current_participants: 34,
      cover_image_url: '/placeholder-course.png',
      tags: ['JavaScript', 'Full-Stack', 'React', 'Node.js'],
      creator: {
        name: 'Alex Rodriguez',
        title: 'Senior Full-Stack Developer',
        avatar: '/placeholder-avatar.png',
        company: 'Tech Corp'
      },
      is_featured: true,
      completion_rate: 87,
      rating: 4.8,
      enrolled_count: 1250,
      difficulty_color: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: '2',
      title: 'Machine Learning Fundamentals',
      description: 'Learn the foundations of machine learning with Python, covering algorithms, data preprocessing, and model evaluation.',
      difficulty_level: 'beginner',
      estimated_hours: 80,
      skills_gained: ['Python', 'Scikit-learn', 'Pandas', 'NumPy', 'Data Visualization', 'ML Algorithms'],
      prerequisites: ['Basic Python', 'High School Math'],
      modules: [
        { title: 'Python for Data Science', duration: 15, completed: false },
        { title: 'Data Preprocessing', duration: 12, completed: false },
        { title: 'Supervised Learning', duration: 20, completed: false },
        { title: 'Unsupervised Learning', duration: 15, completed: false },
        { title: 'Model Evaluation', duration: 10, completed: false },
        { title: 'Final Project', duration: 8, completed: false }
      ],
      is_collaborative: true,
      max_participants: 100,
      current_participants: 78,
      cover_image_url: '/placeholder-course.png',
      tags: ['Machine Learning', 'Python', 'Data Science'],
      creator: {
        name: 'Dr. Sarah Kim',
        title: 'Data Science Lead',
        avatar: '/placeholder-avatar.png',
        company: 'AI Research Lab'
      },
      is_featured: false,
      completion_rate: 92,
      rating: 4.9,
      enrolled_count: 2100,
      difficulty_color: 'bg-green-100 text-green-800'
    },
    {
      id: '3',
      title: 'Advanced System Design',
      description: 'Master distributed systems, scalability patterns, and architecture design for large-scale applications.',
      difficulty_level: 'advanced',
      estimated_hours: 60,
      skills_gained: ['System Architecture', 'Microservices', 'Load Balancing', 'Caching', 'Database Scaling'],
      prerequisites: ['5+ years experience', 'Distributed Systems basics'],
      modules: [
        { title: 'Scalability Fundamentals', duration: 10, completed: false },
        { title: 'Database Design', duration: 12, completed: false },
        { title: 'Microservices Architecture', duration: 15, completed: false },
        { title: 'Caching Strategies', duration: 8, completed: false },
        { title: 'Performance Optimization', duration: 10, completed: false },
        { title: 'Case Studies', duration: 5, completed: false }
      ],
      is_collaborative: true,
      max_participants: 30,
      current_participants: 24,
      cover_image_url: '/placeholder-course.png',
      tags: ['System Design', 'Architecture', 'Scalability'],
      creator: {
        name: 'Michael Chen',
        title: 'Principal Engineer',
        avatar: '/placeholder-avatar.png',
        company: 'Cloud Platform'
      },
      is_featured: true,
      completion_rate: 78,
      rating: 4.7,
      enrolled_count: 890,
      difficulty_color: 'bg-red-100 text-red-800'
    },
    {
      id: '4',
      title: 'UX Design Thinking',
      description: 'Learn user-centered design principles, research methods, and prototyping techniques.',
      difficulty_level: 'beginner',
      estimated_hours: 40,
      skills_gained: ['User Research', 'Wireframing', 'Prototyping', 'Usability Testing', 'Design Systems'],
      prerequisites: ['Basic design knowledge'],
      modules: [
        { title: 'Design Thinking Process', duration: 8, completed: false },
        { title: 'User Research Methods', duration: 10, completed: false },
        { title: 'Wireframing & Prototyping', duration: 12, completed: false },
        { title: 'Usability Testing', duration: 6, completed: false },
        { title: 'Design Systems', duration: 4, completed: false }
      ],
      is_collaborative: true,
      max_participants: 40,
      current_participants: 31,
      cover_image_url: '/placeholder-course.png',
      tags: ['UX Design', 'Design Thinking', 'User Research'],
      creator: {
        name: 'Emma Wilson',
        title: 'Senior UX Designer',
        avatar: '/placeholder-avatar.png',
        company: 'Design Studio'
      },
      is_featured: false,
      completion_rate: 85,
      rating: 4.6,
      enrolled_count: 750,
      difficulty_color: 'bg-green-100 text-green-800'
    }
  ];

  const difficultyLevels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredPaths = mockLearningPaths.filter(path =>
    searchQuery === '' ||
    path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    path.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
    path.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEnrollInPath = async (pathId: string) => {
    try {
      await enrollInLearningPath(pathId);
    } catch (error) {
      console.error('Error enrolling in learning path:', error);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Search learning paths..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-4"
          />
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Path
          </Button>
        </div>
      </div>

      {/* Difficulty Level Filters */}
      <div className="flex gap-2 flex-wrap">
        {difficultyLevels.map((level) => (
          <Badge 
            key={level} 
            variant="outline" 
            className="cursor-pointer hover:bg-accent"
          >
            {level}
          </Badge>
        ))}
      </div>

      {/* Learning Paths Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="browse">Browse Paths</TabsTrigger>
          <TabsTrigger value="enrolled">My Learning</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPaths.map((path) => (
              <Card key={path.id} className={`hover:shadow-md transition-shadow ${path.is_featured ? 'ring-2 ring-primary/20' : ''}`}>
                {path.is_featured && (
                  <div className="bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                    Featured Learning Path
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">{path.title}</h3>
                        <Badge className={getDifficultyColor(path.difficulty_level)}>
                          {path.difficulty_level}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {path.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Creator Info */}
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={path.creator.avatar} />
                      <AvatarFallback>{path.creator.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{path.creator.name}</h4>
                      <p className="text-xs text-muted-foreground">{path.creator.title}</p>
                      <p className="text-xs text-muted-foreground">{path.creator.company}</p>
                    </div>
                  </div>

                  {/* Path Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{path.estimated_hours} hours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>{path.modules.length} modules</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{path.current_participants} enrolled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span>{path.completion_rate}% complete rate</span>
                    </div>
                  </div>

                  {/* Skills Gained */}
                  <div>
                    <span className="font-medium text-sm">Skills you'll gain:</span>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {path.skills_gained.slice(0, 4).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {path.skills_gained.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{path.skills_gained.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Prerequisites */}
                  <div>
                    <span className="font-medium text-sm">Prerequisites:</span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {path.prerequisites.join(', ')}
                    </p>
                  </div>

                  {/* Progress if collaborative */}
                  {path.is_collaborative && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Group Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {path.current_participants} / {path.max_participants} learners
                        </span>
                      </div>
                      <Progress value={(path.current_participants / path.max_participants) * 100} className="h-2" />
                    </div>
                  )}

                  {/* Rating and Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span>{path.rating}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {path.enrolled_count} students
                      </span>
                    </div>
                    {path.is_collaborative && (
                      <Badge variant="secondary" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        Collaborative
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={() => handleEnrollInPath(path.id)}
                      disabled={isProcessing || (path.max_participants && path.current_participants >= path.max_participants)}
                    >
                      {path.max_participants && path.current_participants >= path.max_participants ? 
                        'Path Full' : 
                        'Enroll Now'
                      }
                    </Button>
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="enrolled" className="space-y-4">
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Enrolled Paths</h3>
            <p className="text-muted-foreground mb-4">
              Start your learning journey by enrolling in a path
            </p>
            <Button onClick={() => setActiveTab('browse')}>
              Browse Learning Paths
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="text-center py-12">
            <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Completed Paths</h3>
            <p className="text-muted-foreground mb-4">
              Complete learning paths to see your achievements here
            </p>
            <Button onClick={() => setActiveTab('browse')}>
              Start Learning
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialLearning;