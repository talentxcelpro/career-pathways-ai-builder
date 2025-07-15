import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, MapPin, DollarSign, Clock, Bookmark, ExternalLink, Brain, CheckCircle, AlertTriangle } from "lucide-react";

const IntelligentJobMatching = () => {
  const [bookmarkedJobs, setBookmarkedJobs] = useState<string[]>([]);

  const jobMatches = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      salary: '$120k - $150k',
      matchScore: 95,
      postedTime: '2 days ago',
      matchingFactors: [
        'React expertise (5+ years)',
        'TypeScript experience',
        'Team leadership skills',
        'Startup experience'
      ],
      skillGaps: [
        'AWS certification preferred',
        'GraphQL experience nice to have'
      ],
      salaryComparison: {
        market: '$135k',
        yourRange: '$130k - $155k',
        difference: '+8%'
      }
    },
    {
      id: '2',
      title: 'Full Stack Engineer',
      company: 'InnovateLabs',
      location: 'Austin, TX',
      salary: '$110k - $135k',
      matchScore: 88,
      postedTime: '1 week ago',
      matchingFactors: [
        'JavaScript proficiency',
        'Node.js experience',
        'Database design skills'
      ],
      skillGaps: [
        'Python experience required',
        'DevOps knowledge preferred'
      ],
      salaryComparison: {
        market: '$125k',
        yourRange: '$130k - $155k',
        difference: '-4%'
      }
    },
    {
      id: '3',
      title: 'Engineering Team Lead',
      company: 'GrowthTech',
      location: 'Remote',
      salary: '$140k - $170k',
      matchScore: 82,
      postedTime: '3 days ago',
      matchingFactors: [
        'Leadership experience',
        'Technical expertise',
        'Remote work experience'
      ],
      skillGaps: [
        'Management certification',
        'Agile/Scrum mastery'
      ],
      salaryComparison: {
        market: '$155k',
        yourRange: '$130k - $155k',
        difference: '+13%'
      }
    }
  ];

  const toggleBookmark = (jobId: string) => {
    setBookmarkedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getSalaryComparisonColor = (difference: string) => {
    if (difference.startsWith('+')) return 'text-green-600';
    if (difference.startsWith('-')) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Target className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Intelligent Job Matching</h2>
          <p className="text-muted-foreground">AI-powered job recommendations based on your profile</p>
        </div>
      </div>

      {/* Matching Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">24</div>
            <div className="text-sm text-muted-foreground">Perfect Matches</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">67</div>
            <div className="text-sm text-muted-foreground">Good Matches</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">92%</div>
            <div className="text-sm text-muted-foreground">Avg Match Score</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">8</div>
            <div className="text-sm text-muted-foreground">Applied</div>
          </CardContent>
        </Card>
      </div>

      {/* Job Matches */}
      <div className="space-y-4">
        {jobMatches.map((job) => (
          <Card key={job.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Job Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{job.title}</h3>
                      <Badge variant="outline" className={getMatchScoreColor(job.matchScore)}>
                        <Brain className="h-3 w-3 mr-1" />
                        {job.matchScore}% match
                      </Badge>
                    </div>
                    <p className="text-muted-foreground font-medium">{job.company}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {job.salary}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {job.postedTime}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleBookmark(job.id)}
                      className={bookmarkedJobs.includes(job.id) ? 'text-yellow-600' : ''}
                    >
                      <Bookmark className="h-4 w-4" />
                    </Button>
                    <Button size="sm">
                      Apply Now
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>

                {/* Match Score Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Match Score</span>
                    <span className={getMatchScoreColor(job.matchScore)}>{job.matchScore}%</span>
                  </div>
                  <Progress value={job.matchScore} className="h-2" />
                </div>

                {/* Detailed Analysis */}
                <Tabs defaultValue="matching" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="matching">Matching Factors</TabsTrigger>
                    <TabsTrigger value="gaps">Skill Gaps</TabsTrigger>
                    <TabsTrigger value="salary">Salary Analysis</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="matching" className="space-y-2">
                    {job.matchingFactors.map((factor, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>{factor}</span>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="gaps" className="space-y-2">
                    {job.skillGaps.map((gap, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span>{gap}</span>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="salary" className="space-y-3">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Market Average</div>
                        <div className="text-muted-foreground">{job.salaryComparison.market}</div>
                      </div>
                      <div>
                        <div className="font-medium">Your Range</div>
                        <div className="text-muted-foreground">{job.salaryComparison.yourRange}</div>
                      </div>
                      <div>
                        <div className="font-medium">Difference</div>
                        <div className={getSalaryComparisonColor(job.salaryComparison.difference)}>
                          {job.salaryComparison.difference}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default IntelligentJobMatching;