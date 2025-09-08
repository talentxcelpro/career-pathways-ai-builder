import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Clock, TrendingUp, ExternalLink, Play, BookOpen } from 'lucide-react';
import { useLearningJobIntegration } from '@/hooks/useLearningJobIntegration';

interface JobFocusedCoursesProps {
  targetRole?: string;
  industry?: string;
}

export const JobFocusedCourses: React.FC<JobFocusedCoursesProps> = ({
  targetRole,
  industry
}) => {
  const { 
    jobFocusedCourses, 
    isLoading, 
    fetchJobFocusedCourses,
    updateCourseProgress 
  } = useLearningJobIntegration();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState(industry || 'all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const filteredCourses = jobFocusedCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.skills_taught.some(skill => 
                           skill.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    const matchesIndustry = selectedIndustry === 'all' || 
                           course.industry_alignment.includes(selectedIndustry);
    
    const matchesDifficulty = selectedDifficulty === 'all' || 
                             course.difficulty_level === selectedDifficulty;
    
    return matchesSearch && matchesIndustry && matchesDifficulty;
  });

  const handleEnroll = async (courseId: string) => {
    await updateCourseProgress(courseId, {
      course_type: 'job_focused',
      progress_percentage: 0,
      lessons_completed: 0,
      total_lessons: 10, // Default, would be fetched from course data
      time_spent_hours: 0,
      certificate_earned: false,
      skills_acquired: [],
      performance_score: 0
    });
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const formatPrice = (cost: number, isFree: boolean) => {
    if (isFree || cost === 0) return 'Free';
    return `₹${cost.toLocaleString('en-IN')}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-gray-200 rounded"></div>
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
        <Briefcase className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold">Job-Focused Courses</h2>
        <Badge variant="secondary" className="ml-2">
          {filteredCourses.length} courses
        </Badge>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Input
          placeholder="Search courses..."
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
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="group hover:shadow-lg transition-all duration-300">
            <div className="relative">
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-40 object-cover rounded-t-lg"
                />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-blue-400 to-purple-500 rounded-t-lg flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-white" />
                </div>
              )}
              
              {/* Job Relevance Badge */}
              <div className="absolute top-2 right-2">
                <Badge 
                  variant="secondary" 
                  className={getRelevanceColor(course.job_relevance_score)}
                >
                  {course.job_relevance_score}% Job Match
                </Badge>
              </div>
            </div>

            <CardHeader className="pb-3">
              <CardTitle className="text-lg leading-tight group-hover:text-blue-600 transition-colors">
                {course.title}
              </CardTitle>
              <p className="text-sm text-gray-600 line-clamp-2">
                {course.description}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="font-medium">{course.provider}</span>
                <span>•</span>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {course.duration_hours}h
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-4">
                {/* Skills */}
                <div className="flex flex-wrap gap-1">
                  {course.skills_taught.slice(0, 4).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {course.skills_taught.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{course.skills_taught.length - 4}
                    </Badge>
                  )}
                </div>

                {/* Industry Alignment */}
                <div className="flex flex-wrap gap-1">
                  {course.industry_alignment.slice(0, 2).map((industry, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {industry}
                    </Badge>
                  ))}
                </div>

                {/* Certification Badge */}
                {course.certification_available && (
                  <Badge variant="default" className="text-xs">
                    Certificate Available
                  </Badge>
                )}

                {/* Price and Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-lg font-bold text-green-600">
                    {formatPrice(course.cost, course.is_free)}
                  </div>
                  
                  <div className="flex gap-2">
                    {course.external_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(course.external_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleEnroll(course.id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Start
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-500">
            Try adjusting your search criteria or check back later for new courses.
          </p>
        </div>
      )}
    </div>
  );
};