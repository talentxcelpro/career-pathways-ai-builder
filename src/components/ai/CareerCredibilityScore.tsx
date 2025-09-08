import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, Award, CheckCircle, Star, TrendingUp, 
  Users, BookOpen, Building, Briefcase, Clock,
  ExternalLink, AlertCircle, Target
} from 'lucide-react';

interface CredibilityMetric {
  category: string;
  score: number;
  maxScore: number;
  factors: Array<{
    name: string;
    points: number;
    status: 'completed' | 'pending' | 'recommended';
    importance: 'high' | 'medium' | 'low';
    timeToComplete?: string;
    actionUrl?: string;
  }>;
}

interface Endorsement {
  source: string;
  type: 'certification' | 'reference' | 'achievement' | 'education';
  credibility: number;
  verifiable: boolean;
  date: string;
  description: string;
}

const CareerCredibilityScore: React.FC = () => {
  const [overallScore] = useState(742); // Out of 1000
  const [industryRanking] = useState(78); // Percentile

  const credibilityMetrics: CredibilityMetric[] = [
    {
      category: 'Professional Certifications',
      score: 145,
      maxScore: 200,
      factors: [
        {
          name: 'AWS Solutions Architect',
          points: 85,
          status: 'completed',
          importance: 'high'
        },
        {
          name: 'Google Cloud Professional',
          points: 60,
          status: 'pending',
          importance: 'high',
          timeToComplete: '3 months',
          actionUrl: 'https://cloud.google.com/certification'
        },
        {
          name: 'Kubernetes CKA',
          points: 40,
          status: 'recommended',
          importance: 'medium',
          timeToComplete: '2 months'
        }
      ]
    },
    {
      category: 'Work Experience',
      score: 180,
      maxScore: 200,
      factors: [
        {
          name: 'Senior Role (3+ years)',
          points: 90,
          status: 'completed',
          importance: 'high'
        },
        {
          name: 'Big Tech Experience',
          points: 60,
          status: 'pending',
          importance: 'high'
        },
        {
          name: 'Leadership Experience',
          points: 30,
          status: 'completed',
          importance: 'medium'
        }
      ]
    },
    {
      category: 'Education & Training',
      score: 120,
      maxScore: 150,
      factors: [
        {
          name: 'Computer Science Degree',
          points: 70,
          status: 'completed',
          importance: 'high'
        },
        {
          name: 'Advanced Degree/MBA',
          points: 50,
          status: 'recommended',
          importance: 'medium',
          timeToComplete: '2 years'
        }
      ]
    },
    {
      category: 'Industry Recognition',
      score: 95,
      maxScore: 150,
      factors: [
        {
          name: 'Published Articles/Blog',
          points: 25,
          status: 'completed',
          importance: 'medium'
        },
        {
          name: 'Conference Speaking',
          points: 40,
          status: 'recommended',
          importance: 'high',
          timeToComplete: '6 months'
        },
        {
          name: 'Open Source Contributions',
          points: 30,
          status: 'completed',
          importance: 'medium'
        }
      ]
    },
    {
      category: 'Professional Network',
      score: 85,
      maxScore: 150,
      factors: [
        {
          name: 'LinkedIn Connections (500+)',
          points: 20,
          status: 'completed',
          importance: 'low'
        },
        {
          name: 'Industry Leader Endorsements',
          points: 45,
          status: 'pending',
          importance: 'high',
          timeToComplete: '3 months'
        },
        {
          name: 'Professional References',
          points: 20,
          status: 'completed',
          importance: 'medium'
        }
      ]
    },
    {
      category: 'Performance Metrics',
      score: 117,
      maxScore: 150,
      factors: [
        {
          name: 'Quantified Achievements',
          points: 60,
          status: 'completed',
          importance: 'high'
        },
        {
          name: 'Performance Reviews',
          points: 40,
          status: 'completed',
          importance: 'medium'
        },
        {
          name: 'Awards & Recognition',
          points: 17,
          status: 'pending',
          importance: 'medium'
        }
      ]
    }
  ];

  const endorsements: Endorsement[] = [
    {
      source: 'Amazon Web Services',
      type: 'certification',
      credibility: 95,
      verifiable: true,
      date: '2024-01-15',
      description: 'AWS Certified Solutions Architect - Professional Level'
    },
    {
      source: 'Microsoft',
      type: 'certification',
      credibility: 90,
      verifiable: true,
      date: '2023-08-20',
      description: 'Azure Solutions Architect Expert'
    },
    {
      source: 'TechCorp CEO',
      type: 'reference',
      credibility: 85,
      verifiable: true,
      date: '2024-02-10',
      description: 'Led critical infrastructure migration, improved performance by 40%'
    },
    {
      source: 'Stanford University',
      type: 'education',
      credibility: 92,
      verifiable: true,
      date: '2018-06-15',
      description: 'Master of Science in Computer Science'
    }
  ];

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLevel = (score: number) => {
    if (score >= 800) return { level: 'Elite Professional', color: 'text-purple-600 bg-purple-50' };
    if (score >= 700) return { level: 'Senior Professional', color: 'text-blue-600 bg-blue-50' };
    if (score >= 600) return { level: 'Experienced Professional', color: 'text-green-600 bg-green-50' };
    if (score >= 400) return { level: 'Mid-Level Professional', color: 'text-yellow-600 bg-yellow-50' };
    return { level: 'Entry Level Professional', color: 'text-gray-600 bg-gray-50' };
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'recommended': return <Target className="h-4 w-4 text-blue-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const totalMaxScore = credibilityMetrics.reduce((sum, metric) => sum + metric.maxScore, 0);
  const currentScore = credibilityMetrics.reduce((sum, metric) => sum + metric.score, 0);
  const scoreLevel = getScoreLevel(overallScore);

  return (
    <div className="space-y-6">
      {/* Overall Score Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Career Credibility Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{overallScore}</div>
              <div className="text-sm text-muted-foreground">Out of 1,000 points</div>
              <Badge className={scoreLevel.color} variant="secondary">
                {scoreLevel.level}
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">{industryRanking}%</div>
              <div className="text-sm text-muted-foreground">Industry Percentile</div>
              <div className="text-xs text-muted-foreground mt-1">
                Better than {industryRanking}% of professionals
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">+{Math.floor((overallScore / 1000) * 45)}%</div>
              <div className="text-sm text-muted-foreground">Salary Premium</div>
              <div className="text-xs text-muted-foreground mt-1">
                Above market average
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{currentScore} / {totalMaxScore}</span>
            </div>
            <Progress value={(currentScore / totalMaxScore) * 100} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Credibility Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {credibilityMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{metric.category}</CardTitle>
                <div className="text-right">
                  <div className={`text-xl font-bold ${getScoreColor(metric.score, metric.maxScore)}`}>
                    {metric.score}
                  </div>
                  <div className="text-xs text-muted-foreground">/ {metric.maxScore}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Progress value={(metric.score / metric.maxScore) * 100} className="h-2" />
                
                <div className="space-y-2">
                  {metric.factors.map((factor, factorIndex) => (
                    <div key={factorIndex} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(factor.status)}
                        <span className="text-sm">{factor.name}</span>
                        <Badge className={getImportanceColor(factor.importance)} variant="secondary">
                          {factor.importance}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">+{factor.points}pts</span>
                        {factor.status !== 'completed' && factor.timeToComplete && (
                          <span className="text-xs text-muted-foreground">({factor.timeToComplete})</span>
                        )}
                        {factor.actionUrl && (
                          <Button size="sm" variant="ghost">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Verified Endorsements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-6 w-6" />
            Verified Endorsements & Credentials
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {endorsements.map((endorsement, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                <div className="flex-shrink-0">
                  {endorsement.type === 'certification' && <Award className="h-5 w-5 text-blue-600" />}
                  {endorsement.type === 'reference' && <Users className="h-5 w-5 text-green-600" />}
                  {endorsement.type === 'education' && <BookOpen className="h-5 w-5 text-purple-600" />}
                  {endorsement.type === 'achievement' && <Star className="h-5 w-5 text-yellow-600" />}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-sm">{endorsement.source}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{endorsement.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {endorsement.credibility}% credible
                      </Badge>
                      {endorsement.verifiable && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {endorsement.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(endorsement.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Improvement Recommendations */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <TrendingUp className="h-6 w-6" />
            Quick Wins to Boost Your Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-yellow-800">High Impact Actions (Next 90 days)</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-white rounded">
                  <span className="text-sm">Get Google Cloud certification</span>
                  <Badge className="bg-green-100 text-green-800">+60 pts</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded">
                  <span className="text-sm">Secure CEO endorsement</span>
                  <Badge className="bg-green-100 text-green-800">+45 pts</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded">
                  <span className="text-sm">Speak at industry conference</span>
                  <Badge className="bg-green-100 text-green-800">+40 pts</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-yellow-800">Long-term Investments (6+ months)</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-white rounded">
                  <span className="text-sm">Complete advanced degree</span>
                  <Badge className="bg-blue-100 text-blue-800">+50 pts</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded">
                  <span className="text-sm">Join big tech company</span>
                  <Badge className="bg-blue-100 text-blue-800">+60 pts</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded">
                  <span className="text-sm">Build thought leadership</span>
                  <Badge className="bg-blue-100 text-blue-800">+35 pts</Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-white rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Projected Impact:</strong> Completing the high-impact actions could boost your score to <strong>887 points</strong>, 
              placing you in the <strong>Elite Professional</strong> category and increasing your market value by an estimated <strong>$25,000-$40,000</strong>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CareerCredibilityScore;