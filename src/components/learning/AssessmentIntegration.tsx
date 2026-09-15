import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Clock, 
  Trophy, 
  Target, 
  TrendingUp, 
  Users,
  Award,
  CheckCircle,
  ArrowRight,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";

interface AssessmentData {
  id: string;
  title: string;
  description: string;
  duration: number;
  questions: number;
  difficulty: string;
  category: string;
  completions: number;
  averageScore: number;
}

interface UserAssessmentStats {
  totalTaken: number;
  totalPassed: number;
  averageScore: number;
  skillsValidated: string[];
  recentScores: number[];
  completionRate: number;
}

const mockAssessments: AssessmentData[] = [
  {
    id: '1',
    title: 'JavaScript Fundamentals',
    description: 'Test your core JavaScript knowledge including ES6+ features',
    duration: 45,
    questions: 25,
    difficulty: 'Intermediate',
    category: 'Technical Skills',
    completions: 1250,
    averageScore: 78
  },
  {
    id: '2',
    title: 'React Development',
    description: 'Comprehensive assessment of React concepts and best practices',
    duration: 60,
    questions: 30,
    difficulty: 'Advanced',
    category: 'Technical Skills',
    completions: 890,
    averageScore: 72
  },
  {
    id: '3',
    title: 'Problem Solving & Logic',
    description: 'Evaluate your analytical and problem-solving capabilities',
    duration: 30,
    questions: 20,
    difficulty: 'Beginner',
    category: 'Cognitive Abilities',
    completions: 2100,
    averageScore: 85
  }
];

const mockUserStats: UserAssessmentStats = {
  totalTaken: 12,
  totalPassed: 9,
  averageScore: 82,
  skillsValidated: ['JavaScript', 'React', 'CSS', 'Problem Solving'],
  recentScores: [85, 78, 92, 75, 88],
  completionRate: 75
};

const difficultyColors = {
  beginner: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  intermediate: 'bg-blue-100 text-blue-700 border-blue-200',
  advanced: 'bg-purple-100 text-purple-700 border-purple-200',
  expert: 'bg-red-100 text-red-700 border-red-200'
};

export const AssessmentIntegration: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
          <Brain className="h-5 w-5" />
          <span className="font-medium">Skill Validation Hub</span>
        </div>
        <h2 className="text-3xl font-bold text-foreground">
          Validate Your Skills with Professional Assessments
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Take industry-standard assessments to prove your expertise and unlock new career opportunities
        </p>
      </div>

      {/* User Stats Dashboard */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Your Assessment Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">{mockUserStats.totalTaken}</div>
              <div className="text-sm text-muted-foreground">Assessments Taken</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-green-600">{mockUserStats.totalPassed}</div>
              <div className="text-sm text-muted-foreground">Assessments Passed</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-blue-600">{mockUserStats.averageScore}%</div>
              <div className="text-sm text-muted-foreground">Average Score</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-purple-600">{mockUserStats.skillsValidated.length}</div>
              <div className="text-sm text-muted-foreground">Skills Validated</div>
            </div>
          </div>

          {/* Skills Progress */}
          <div className="mt-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Overall Progress</span>
              <span>{mockUserStats.completionRate}%</span>
            </div>
            <Progress value={mockUserStats.completionRate} className="h-3" />
            
            {/* Validated Skills */}
            <div className="flex flex-wrap gap-2 mt-4">
              {mockUserStats.skillsValidated.map((skill, index) => (
                <Badge key={index} className="bg-green-100 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured Assessments */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-foreground">Featured Assessments</h3>
          <Link to="/assessments">
            <Button variant="outline" className="group">
              View All Assessments
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockAssessments.map((assessment) => (
            <Card 
              key={assessment.id}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-border/50"
            >
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <Badge 
                    className={difficultyColors[assessment.difficulty.toLowerCase() as keyof typeof difficultyColors]}
                  >
                    {assessment.difficulty}
                  </Badge>
                </div>
                
                <div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {assessment.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {assessment.description}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Assessment Stats */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="text-center p-2 bg-muted/50 rounded">
                    <Clock className="h-4 w-4 mx-auto mb-1 text-primary" />
                    <div className="font-medium">{assessment.duration}m</div>
                  </div>
                  <div className="text-center p-2 bg-muted/50 rounded">
                    <Target className="h-4 w-4 mx-auto mb-1 text-primary" />
                    <div className="font-medium">{assessment.questions}</div>
                  </div>
                  <div className="text-center p-2 bg-muted/50 rounded">
                    <Users className="h-4 w-4 mx-auto mb-1 text-primary" />
                    <div className="font-medium">{assessment.completions}</div>
                  </div>
                </div>

                {/* Average Score */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Average Score</span>
                    <span className="font-medium">{assessment.averageScore}%</span>
                  </div>
                  <Progress value={assessment.averageScore} className="h-2" />
                </div>

                {/* Category */}
                <Badge variant="outline" className="w-full justify-center py-2">
                  {assessment.category}
                </Badge>

                {/* Action Button */}
                <Link to={`/assessments`} className="block">
                  <Button className="w-full group-hover:scale-105 transition-transform">
                    <Zap className="h-4 w-4 mr-2" />
                    Start Assessment
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-primary to-secondary text-white">
        <CardContent className="text-center py-8">
          <Trophy className="h-16 w-16 mx-auto mb-4 text-white/90" />
          <h3 className="text-2xl font-bold mb-2">Ready to Prove Your Skills?</h3>
          <p className="text-white/90 mb-6 max-w-md mx-auto">
            Join thousands of professionals who have validated their expertise and advanced their careers
          </p>
          <Link to="/assessments">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
              <Brain className="h-5 w-5 mr-2" />
              Explore All Assessments
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};