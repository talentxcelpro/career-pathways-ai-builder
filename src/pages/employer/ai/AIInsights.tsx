
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, AlertTriangle, CheckCircle, ArrowLeft, Lightbulb, Target } from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';

const AIInsights = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const insights = {
    overallScore: 78,
    recommendations: [
      {
        type: "improvement",
        priority: "high",
        title: "Salary Range Competitive Analysis",
        description: "Your salary range is 15% below market average for similar roles in San Francisco",
        impact: "Could increase applications by 40%",
        action: "Consider increasing range to $140,000 - $200,000"
      },
      {
        type: "warning",
        priority: "medium",
        title: "Job Title Optimization",
        description: "Consider using 'Senior Software Engineer' instead of 'Software Engineer III'",
        impact: "Better searchability and candidate understanding",
        action: "Update job title for better visibility"
      },
      {
        type: "success",
        priority: "low",
        title: "Skills Requirements",
        description: "Your skill requirements are well-balanced and realistic",
        impact: "Good candidate-job matching",
        action: "No action needed"
      }
    ],
    marketAnalysis: {
      similarJobs: 127,
      avgApplications: 52,
      avgTimeToFill: 28,
      competitiveScore: 72
    },
    keywordAnalysis: {
      strongKeywords: ["React", "TypeScript", "AWS", "Full-stack"],
      missingKeywords: ["Remote", "Senior", "Leadership", "Agile"],
      overusedKeywords: ["Experience", "Strong", "Excellent"]
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'improvement': return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      default: return <Lightbulb className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => navigate(`/jobs/manage/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Brain className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Job Insights</h1>
          <p className="text-gray-600">Optimize your job posting with AI-powered recommendations</p>
        </div>
      </div>

      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Job Post Optimization Score
          </CardTitle>
          <CardDescription>
            AI analysis of your job posting effectiveness
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Overall Score</span>
                <span className="text-sm font-bold">{insights.overallScore}/100</span>
              </div>
              <Progress value={insights.overallScore} className="h-3" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">{insights.overallScore}%</div>
              <div className="text-sm text-gray-600">Good</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            AI Recommendations
          </CardTitle>
          <CardDescription>
            Actionable insights to improve your job posting performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.recommendations.map((rec, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  {getTypeIcon(rec.type)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold">{rec.title}</h3>
                      <Badge className={getPriorityColor(rec.priority)}>
                        {rec.priority} priority
                      </Badge>
                    </div>
                    <p className="text-gray-700 mb-2">{rec.description}</p>
                    <p className="text-sm text-blue-600 font-medium mb-3">💡 {rec.impact}</p>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">{rec.action}</p>
                      <Button size="sm" variant="outline">Apply Fix</Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Market Analysis</CardTitle>
            <CardDescription>How your job compares to similar postings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Similar Jobs Posted</span>
              <span className="font-semibold">{insights.marketAnalysis.similarJobs}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Applications</span>
              <span className="font-semibold">{insights.marketAnalysis.avgApplications}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Time to Fill</span>
              <span className="font-semibold">{insights.marketAnalysis.avgTimeToFill} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Competitive Score</span>
              <span className="font-semibold">{insights.marketAnalysis.competitiveScore}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Keyword Analysis</CardTitle>
            <CardDescription>SEO and searchability optimization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-green-700 mb-2">✓ Strong Keywords</h4>
              <div className="flex flex-wrap gap-1">
                {insights.keywordAnalysis.strongKeywords.map((keyword, index) => (
                  <Badge key={index} className="bg-green-100 text-green-800">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-yellow-700 mb-2">⚠ Missing Keywords</h4>
              <div className="flex flex-wrap gap-1">
                {insights.keywordAnalysis.missingKeywords.map((keyword, index) => (
                  <Badge key={index} className="bg-yellow-100 text-yellow-800">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-red-700 mb-2">⚡ Overused Keywords</h4>
              <div className="flex flex-wrap gap-1">
                {insights.keywordAnalysis.overusedKeywords.map((keyword, index) => (
                  <Badge key={index} className="bg-red-100 text-red-800">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => navigate(`/jobs/manage/${id}`)}>
          Back to Job
        </Button>
        <div className="space-x-3">
          <Button variant="outline">Generate Report</Button>
          <Button onClick={() => navigate(`/jobs/manage/${id}/edit`)}>
            Apply Recommendations
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
