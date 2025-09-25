import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, Target, Calendar, Award, Star, User } from 'lucide-react';

interface PersonalizedDashboardProps {
  userName?: string;
  userRole?: string;
  userLocation?: string;
  profileMatch?: number;
  aiConfidence?: number;
  estimatedTimeline?: string;
  profileViews?: number;
  className?: string;
}

export const PersonalizedDashboard: React.FC<PersonalizedDashboardProps> = ({
  userName = "Arshid Hussain Wani",
  userRole = "Sales head APAC",
  userLocation = "Noida",
  profileMatch = 90,
  aiConfidence = 85,
  estimatedTimeline = "18mo",
  profileViews = 97,
  className = ""
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Start Your AI Journey</h1>
        </div>
        <p className="text-gray-600 max-w-lg mx-auto">
          Create personalized career roadmaps with AI technology
        </p>
        
        <div className="flex gap-4 justify-center mb-8">
          <button className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Brain className="h-4 w-4" />
            Create Roadmap
          </button>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-700 transition-colors">
            <Target className="h-4 w-4" />
            Analyze Skills
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <Brain className="h-4 w-4 text-purple-600" />
          </div>
          <span className="text-purple-600 font-medium">Personalized for {userName.split(' ')[0]}</span>
        </div>
      </div>

      {/* Interactive Career Roadmap Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your Interactive Career Roadmap
        </h2>
        <p className="text-gray-600">
          Experience your personalized career journey with real-time AI insights 
          tailored to your profile and goals.
        </p>
      </div>

      {/* User Profile Welcome */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Welcome back, {userName.split(' ')[0]}</h3>
                <p className="text-gray-600 text-sm">{userRole} • {userLocation}</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <Brain className="h-3 w-3 mr-1" />
              AI Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <div className="text-3xl font-bold text-blue-600 mb-1">{profileMatch}%</div>
          <div className="text-sm text-gray-600 mb-2">Profile Match</div>
          <Progress value={profileMatch} className="h-2" />
        </Card>
        
        <Card className="text-center p-4">
          <div className="text-3xl font-bold text-green-600 mb-1">{aiConfidence}%</div>
          <div className="text-sm text-gray-600 mb-2">AI Confidence</div>
          <Progress value={aiConfidence} className="h-2" />
        </Card>
        
        <Card className="text-center p-4">
          <div className="text-3xl font-bold text-purple-600 mb-1">{estimatedTimeline}</div>
          <div className="text-sm text-gray-600 mb-2">Est. Timeline</div>
          <div className="text-xs text-purple-600">Optimized for you</div>
        </Card>
        
        <Card className="text-center p-4">
          <div className="text-3xl font-bold text-orange-600 mb-1">{profileViews}</div>
          <div className="text-sm text-gray-600 mb-2">Profile Views</div>
          <div className="text-xs text-orange-600">This month</div>
        </Card>
      </div>

      {/* Career Metrics Display */}
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-green-600 mb-2">65%</div>
          <h3 className="text-xl font-semibold text-gray-900">AI Confidence</h3>
          <p className="text-green-600 font-medium">Success probability</p>
        </div>

        <div className="text-center">
          <div className="text-4xl font-bold text-purple-600 mb-2">18 months</div>
          <h3 className="text-xl font-semibold text-gray-900">Timeline</h3>
          <p className="text-purple-600 font-medium">Optimized for you</p>
        </div>

        <div className="text-center">
          <div className="text-4xl font-bold text-orange-600 mb-2">60%</div>
          <h3 className="text-xl font-semibold text-gray-900">Success Rate</h3>
          <p className="text-orange-600 font-medium">Predicted outcome</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs defaultValue="path" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="path" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Your Path
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Skills Map
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="path" className="text-center py-8">
          <div className="text-lg font-semibold text-gray-900 mb-2">
            Your Career Progression Path
          </div>
          <p className="text-gray-600">
            {userName}'s personalized roadmap with AI-powered insights
          </p>
        </TabsContent>

        <TabsContent value="skills" className="text-center py-8">
          <div className="text-lg font-semibold text-gray-900 mb-2">
            Skills Development Map
          </div>
          <p className="text-gray-600">
            Skills mapped specifically for your career goals
          </p>
        </TabsContent>

        <TabsContent value="timeline" className="text-center py-8">
          <div className="text-lg font-semibold text-gray-900 mb-2">
            Career Timeline
          </div>
          <p className="text-gray-600">
            Navigate your personalized milestones
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
};