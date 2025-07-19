import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Briefcase, 
  BookOpen, 
  DollarSign, 
  Brain,
  Loader2,
  ExternalLink,
  TrendingUp,
  MapPin,
  Clock,
  Star
} from 'lucide-react';
import { useAICareerMapping } from '@/hooks/useAICareerMapping';

interface DataIntegrationDashboardProps {
  targetRole: string;
  currentSkills?: string[];
  location?: string;
  experienceLevel?: string;
}

export const DataIntegrationDashboard: React.FC<DataIntegrationDashboardProps> = ({
  targetRole,
  currentSkills = [],
  location = 'United States',
  experienceLevel = 'Mid-level'
}) => {
  const [activeTab, setActiveTab] = useState('jobs');
  const [searchFilters, setSearchFilters] = useState({
    jobRole: targetRole,
    location: location,
    skills: currentSkills
  });

  const {
    searchJobs,
    syncLearningPlatforms,
    getSalaryData,
    getSkillsFramework,
    isSearchingJobs,
    isSyncingLearning,
    isGettingSalaryData,
    isGettingSkillsFramework
  } = useAICareerMapping();

  const [jobResults, setJobResults] = useState<any>(null);
  const [learningResults, setLearningResults] = useState<any>(null);
  const [salaryResults, setSalaryResults] = useState<any>(null);
  const [skillsResults, setSkillsResults] = useState<any>(null);

  const handleJobSearch = async () => {
    try {
      const result = await searchJobs.mutateAsync({
        jobRole: searchFilters.jobRole,
        location: searchFilters.location,
        experience: experienceLevel,
        skills: searchFilters.skills,
        limit: 20
      });
      setJobResults(result);
    } catch (error) {
      console.error('Job search failed:', error);
    }
  };

  const handleLearningSync = async () => {
    try {
      const result = await syncLearningPlatforms.mutateAsync({
        skills: currentSkills,
        targetRole: targetRole,
        learningLevel: experienceLevel.toLowerCase(),
        preferredFormat: 'Mixed'
      });
      setLearningResults(result);
    } catch (error) {
      console.error('Learning sync failed:', error);
    }
  };

  const handleSalaryAnalysis = async () => {
    try {
      const result = await getSalaryData.mutateAsync({
        role: targetRole,
        location: location,
        experienceLevel: experienceLevel,
        industry: 'Technology'
      });
      setSalaryResults(result);
    } catch (error) {
      console.error('Salary analysis failed:', error);
    }
  };

  const handleSkillsFramework = async () => {
    try {
      const result = await getSkillsFramework.mutateAsync({
        targetRole: targetRole,
        industry: 'Technology'
      });
      setSkillsResults(result);
    } catch (error) {
      console.error('Skills framework failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
          <Database className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">External Data Integration</h2>
          <p className="text-muted-foreground">
            Access real-time job market, learning, and salary data from multiple sources
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="hidden md:inline">Job Market</span>
          </TabsTrigger>
          <TabsTrigger value="learning" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden md:inline">Learning</span>
          </TabsTrigger>
          <TabsTrigger value="salary" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden md:inline">Salary Data</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden md:inline">Skills DB</span>
          </TabsTrigger>
        </TabsList>

        {/* Job Market Tab */}
        <TabsContent value="jobs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Job Market Integration
              </CardTitle>
              <CardDescription>
                Search and analyze job opportunities from multiple job boards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Job role..."
                  value={searchFilters.jobRole}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, jobRole: e.target.value }))}
                />
                <Input
                  placeholder="Location..."
                  value={searchFilters.location}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, location: e.target.value }))}
                />
                <Button onClick={handleJobSearch} disabled={isSearchingJobs}>
                  {isSearchingJobs ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Briefcase className="h-4 w-4 mr-2" />
                  )}
                  Search Jobs
                </Button>
              </div>

              {jobResults && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Found {jobResults.totalResults} jobs
                    </h3>
                    <Badge variant="secondary">
                      {jobResults.marketSummary?.demandLevel} Demand
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {jobResults.jobs?.slice(0, 6).map((job: any, index: number) => (
                      <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-semibold text-sm">{job.title}</h4>
                              <p className="text-sm text-muted-foreground">{job.company}</p>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {job.location}
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {job.matchScore}% match
                              </Badge>
                              <span className="text-sm font-medium text-green-600">
                                {job.salary}
                              </span>
                            </div>
                            
                            <Button size="sm" variant="outline" className="w-full">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Job
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning Platforms Tab */}
        <TabsContent value="learning" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Learning Platform Integration
              </CardTitle>
              <CardDescription>
                Discover courses from top online learning platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleLearningSync} disabled={isSyncingLearning}>
                {isSyncingLearning ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <BookOpen className="h-4 w-4 mr-2" />
                )}
                Sync Learning Resources
              </Button>

              {learningResults && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold">
                    {learningResults.courses?.length} Courses Found
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {learningResults.courses?.slice(0, 8).map((course: any, index: number) => (
                      <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-semibold text-sm">{course.title}</h4>
                              <p className="text-sm text-muted-foreground">{course.platform}</p>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {course.duration}
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500" />
                                {course.rating}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {course.difficulty}
                              </Badge>
                              <span className="text-sm font-medium text-blue-600">
                                {course.price}
                              </span>
                            </div>
                            
                            <Button size="sm" variant="outline" className="w-full">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Course
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Salary Data Tab */}
        <TabsContent value="salary" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Industry Salary Analysis
              </CardTitle>
              <CardDescription>
                Get real-time salary data and compensation insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleSalaryAnalysis} disabled={isGettingSalaryData}>
                {isGettingSalaryData ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <DollarSign className="h-4 w-4 mr-2" />
                )}
                Analyze Salary Data
              </Button>

              {salaryResults && (
                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          ${salaryResults.salaryData?.baseSalary?.percentile_50?.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Median Salary</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {salaryResults.salaryData?.marketTrends?.yearOverYearGrowth}
                        </div>
                        <div className="text-sm text-muted-foreground">Annual Growth</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {salaryResults.salaryReport?.competitiveness}
                        </div>
                        <div className="text-sm text-muted-foreground">Market Position</div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Salary Range</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>25th Percentile:</span>
                          <span className="font-medium">
                            ${salaryResults.salaryData?.baseSalary?.percentile_25?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>75th Percentile:</span>
                          <span className="font-medium">
                            ${salaryResults.salaryData?.baseSalary?.percentile_75?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Database Tab */}
        <TabsContent value="skills" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Skills Framework Database
              </CardTitle>
              <CardDescription>
                Access comprehensive skills taxonomy and frameworks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleSkillsFramework} disabled={isGettingSkillsFramework}>
                {isGettingSkillsFramework ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Brain className="h-4 w-4 mr-2" />
                )}
                Load Skills Framework
              </Button>

              {skillsResults && (
                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(skillsResults.skillsFramework?.categories || {}).map(([category, skills]: [string, any]) => (
                      <Card key={category}>
                        <CardContent className="p-4 text-center">
                          <div className="text-xl font-bold text-blue-600">
                            {skills.length}
                          </div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {category} Skills
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">High-Priority Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {skillsResults.skillsRecommendations?.immediate?.map((skill: any, index: number) => (
                          <Badge key={index} variant="secondary">
                            {skill.name}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};