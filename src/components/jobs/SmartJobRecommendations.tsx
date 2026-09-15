import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Brain, 
  Heart, 
  Eye, 
  MapPin, 
  IndianRupee, 
  Clock, 
  TrendingUp,
  Zap,
  Star,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { formatSalaryRange } from "@/utils/currencyUtils";

interface SmartJobRecommendationsProps {
  userId?: string;
  onJobSave?: (jobId: string) => void;
  savedJobs?: string[];
}

export const SmartJobRecommendations: React.FC<SmartJobRecommendationsProps> = ({
  userId,
  onJobSave,
  savedJobs = [],
}) => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock recommended jobs with AI insights
  const recommendedJobs = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      company: { 
        name: 'TechCorp', 
        logo_url: '/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png',
        industry: 'Technology'
      },
      location: 'Bangalore',
      salary_min: 800000,
      salary_max: 1200000,
      posted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      skills_required: ['React', 'TypeScript', 'Node.js'],
      aiInsights: {
        matchScore: 95,
        reasons: ['Perfect skill match', '3 years relevant experience', 'Salary matches expectations'],
        salaryPrediction: 'Above market average',
        applicationSuccess: 'High'
      },
      urgency: 'high',
      trending: true
    },
    {
      id: '2', 
      title: 'Full Stack Engineer',
      company: { 
        name: 'StartupXYZ', 
        logo_url: '/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png',
        industry: 'Fintech'
      },
      location: 'Mumbai',
      salary_min: 700000,
      salary_max: 1000000,
      posted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      skills_required: ['React', 'Python', 'AWS'],
      aiInsights: {
        matchScore: 88,
        reasons: ['Strong technical fit', 'Location preference match', 'Growth opportunity'],
        salaryPrediction: 'Market rate',
        applicationSuccess: 'Medium-High'
      },
      urgency: 'medium',
      trending: false
    },
    {
      id: '3',
      title: 'React Developer',
      company: { 
        name: 'WebSolutions', 
        logo_url: '/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png',
        industry: 'E-commerce'
      },
      location: 'Pune',
      salary_min: 600000,
      salary_max: 900000,
      posted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      skills_required: ['React', 'JavaScript', 'CSS'],
      aiInsights: {
        matchScore: 82,
        reasons: ['Core skills align', 'Remote work available', 'Fast growing company'],
        salaryPrediction: 'Below expectation',
        applicationSuccess: 'Medium'
      },
      urgency: 'low',
      trending: false
    }
  ];

  const handleRefreshRecommendations = async () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return <Zap className="h-3 w-3 text-red-500" />;
      case 'medium': return <Clock className="h-3 w-3 text-yellow-500" />;
      default: return <Clock className="h-3 w-3 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            AI-Powered Job Recommendations
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefreshRecommendations}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Jobs curated specifically for your profile and preferences
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendedJobs.map((job) => (
          <Card 
            key={job.id} 
            className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-purple-500"
            onClick={() => navigate(`/jobs/${job.id}`)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge 
                      variant="secondary" 
                      className={getMatchScoreColor(job.aiInsights.matchScore)}
                    >
                      {job.aiInsights.matchScore}% Match
                    </Badge>
                    {job.trending && (
                      <Badge variant="outline" className="text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                    {getUrgencyIcon(job.urgency)}
                  </div>
                  
                  <h3 className="font-semibold text-lg hover:text-purple-600 transition-colors">
                    {job.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={job.company.logo_url} alt={job.company.name} />
                      <AvatarFallback className="text-xs">
                        {job.company.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{job.company.name}</p>
                      <p className="text-xs text-gray-500">{job.company.industry}</p>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onJobSave?.(job.id);
                  }}
                  className={`${savedJobs.includes(job.id) ? 'text-red-500' : 'text-gray-400'}`}
                >
                  <Heart className={`h-4 w-4 ${savedJobs.includes(job.id) ? 'fill-current' : ''}`} />
                </Button>
              </div>

              {/* Job Details */}
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <IndianRupee className="h-4 w-4" />
                  <span>{formatSalaryRange(job.salary_min, job.salary_max, true)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDistanceToNow(new Date(job.posted_at))} ago</span>
                </div>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1 mb-3">
                {job.skills_required.map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>

              {/* AI Insights */}
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">AI Insights</span>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-medium">Why it's a good match:</span>
                    <ul className="list-disc list-inside text-gray-600 mt-1">
                      {job.aiInsights.reasons.map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-purple-200">
                    <div className="flex items-center gap-4">
                      <span>💰 {job.aiInsights.salaryPrediction}</span>
                      <span>📈 {job.aiInsights.applicationSuccess} success rate</span>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs h-6">
                      Quick Apply
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Get More Recommendations */}
        <div className="text-center pt-4">
          <Button variant="outline" onClick={handleRefreshRecommendations}>
            <Star className="h-4 w-4 mr-2" />
            Get More AI Recommendations
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};