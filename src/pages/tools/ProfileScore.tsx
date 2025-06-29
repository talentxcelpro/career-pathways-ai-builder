
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Award, 
  ArrowLeft, 
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Eye,
  Star,
  User
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ProfileScore {
  overallScore: number;
  sections: {
    [key: string]: {
      score: number;
      status: 'excellent' | 'good' | 'needs_improvement' | 'missing';
      suggestions: string[];
    };
  };
  visibility: {
    score: number;
    factors: string[];
  };
  improvements: string[];
  strengths: string[];
}

const ProfileScore = () => {
  const navigate = useNavigate();
  const [profileUrl, setProfileUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [score, setScore] = useState<ProfileScore | null>(null);

  const analyzeProfile = async () => {
    if (!profileUrl && !summary) {
      toast.error('Please provide either a profile URL or profile summary');
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI profile analysis
    setTimeout(() => {
      const mockScore: ProfileScore = {
        overallScore: 78,
        sections: {
          'Profile Completeness': {
            score: 85,
            status: 'good',
            suggestions: [
              'Add a professional profile picture',
              'Include contact information',
              'Add location details'
            ]
          },
          'Professional Summary': {
            score: 90,
            status: 'excellent',
            suggestions: [
              'Great use of keywords',
              'Clear value proposition',
              'Well-structured content'
            ]
          },
          'Work Experience': {
            score: 72,
            status: 'good',
            suggestions: [
              'Add more quantifiable achievements',
              'Include specific technologies used',
              'Expand on leadership roles'
            ]
          },
          'Skills & Endorsements': {
            score: 65,
            status: 'needs_improvement',
            suggestions: [
              'Add more relevant technical skills',
              'Get endorsements from colleagues',
              'Include certification details'
            ]
          },
          'Network & Connections': {
            score: 45,
            status: 'needs_improvement',
            suggestions: [
              'Connect with more professionals',
              'Join industry groups',
              'Engage with others\' content'
            ]
          }
        },
        visibility: {
          score: 68,
          factors: [
            'Profile views: 124 this month',
            'Search appearance: Medium',
            'Keyword optimization: 72%',
            'Activity level: Low'
          ]
        },
        improvements: [
          'Optimize your headline with industry keywords',
          'Add more work samples to showcase your abilities',
          'Increase your posting frequency to boost visibility',
          'Request recommendations from past colleagues'
        ],
        strengths: [
          'Strong professional summary',
          'Diverse skill set',
          'Clear career progression',
          'Good use of industry terminology'
        ]
      };

      setScore(mockScore);
      setIsAnalyzing(false);
      toast.success('Profile analysis completed!');
    }, 4000);
  };

  const getSectionColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'needs_improvement': return 'text-orange-600';
      case 'missing': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSectionBadgeColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'needs_improvement': return 'bg-orange-100 text-orange-800';
      case 'missing': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/tools')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tools
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Award className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Profile Scorer</h1>
              <p className="text-gray-600">Get a comprehensive score for your professional profile with optimization tips</p>
            </div>
          </div>
        </div>

        {!score ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Analysis Form */}
            <Card>
              <CardHeader>
                <CardTitle>Analyze Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isAnalyzing ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                    <h3 className="text-lg font-medium mb-2">Analyzing Your Profile</h3>
                    <p className="text-gray-600 mb-4">AI is evaluating your professional profile across multiple dimensions...</p>
                    <Progress value={68} className="w-full" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="profileUrl">LinkedIn Profile URL</Label>
                      <Input
                        id="profileUrl"
                        placeholder="https://linkedin.com/in/yourname"
                        value={profileUrl}
                        onChange={(e) => setProfileUrl(e.target.value)}
                      />
                    </div>

                    <div className="text-center text-sm text-gray-500">
                      OR
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="summary">Professional Summary</Label>
                      <Textarea
                        id="summary"
                        placeholder="Paste your professional summary or bio here"
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience">Work Experience</Label>
                      <Textarea
                        id="experience"
                        placeholder="Brief overview of your work experience"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="skills">Key Skills</Label>
                      <Input
                        id="skills"
                        placeholder="e.g., JavaScript, Project Management, Data Analysis"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                      />
                    </div>

                    <Button 
                      onClick={analyzeProfile}
                      className="w-full"
                      disabled={!profileUrl && !summary}
                    >
                      Analyze Profile
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Analysis Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-orange-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Comprehensive Scoring</h4>
                    <p className="text-sm text-gray-600">Multi-dimensional analysis of your professional profile</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Optimization Tips</h4>
                    <p className="text-sm text-gray-600">Actionable recommendations to improve your profile</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Eye className="h-5 w-5 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Visibility Analysis</h4>
                    <p className="text-sm text-gray-600">Understand how visible your profile is to recruiters</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-yellow-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Industry Benchmarking</h4>
                    <p className="text-sm text-gray-600">Compare your profile against industry standards</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Results */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Profile Score</h2>
                <p className="text-gray-600">Comprehensive analysis with optimization recommendations</p>
              </div>
              <Button variant="outline" onClick={() => setScore(null)}>
                Analyze Another Profile
              </Button>
            </div>

            {/* Overall Score */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className={`text-5xl font-bold ${getScoreColor(score.overallScore)} mb-2`}>
                      {score.overallScore}/100
                    </div>
                    <p className="text-gray-600 mb-4">Overall Profile Score</p>
                    <Progress value={score.overallScore} className="h-3" />
                  </div>
                  <div className="text-center">
                    <div className={`text-5xl font-bold ${getScoreColor(score.visibility.score)} mb-2`}>
                      {score.visibility.score}/100
                    </div>
                    <p className="text-gray-600 mb-4">Visibility Score</p>
                    <Progress value={score.visibility.score} className="h-3" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Section-by-Section Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(score.sections).map(([section, analysis]) => (
                  <div key={section} className="border-l-4 border-orange-200 pl-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-lg">{section}</h4>
                      <div className="flex items-center gap-2">
                        <Badge className={getSectionBadgeColor(analysis.status)}>
                          {analysis.status.replace('_', ' ')}
                        </Badge>
                        <span className={`font-bold ${getSectionColor(analysis.status)}`}>
                          {analysis.score}/100
                        </span>
                      </div>
                    </div>
                    
                    <Progress value={analysis.score} className="mb-3" />
                    
                    <ul className="space-y-1">
                      {analysis.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Strengths and Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Your Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {score.strengths.map((strength, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Improvement Areas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {score.improvements.map((improvement, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Visibility Factors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-purple-600" />
                  Visibility Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {score.visibility.factors.map((factor, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-gray-700">{factor}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileScore;
