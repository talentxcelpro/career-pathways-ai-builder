import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Target, 
  Mail, 
  TrendingUp,
  Users,
  Briefcase,
  Clock,
  CheckCircle
} from 'lucide-react';

const MatchingEngine = () => {
  const matchingStats = {
    totalMatches: 0,
    activeJobs: 0,
    notificationsSent: 0,
    responseRate: 0
  };

  return (
    <div className="space-y-6">
      {/* Matching Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{matchingStats.totalMatches}</div>
                <div className="text-sm text-muted-foreground">Total Matches</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{matchingStats.activeJobs}</div>
                <div className="text-sm text-muted-foreground">Active Jobs</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{matchingStats.notificationsSent}</div>
                <div className="text-sm text-muted-foreground">Notifications Sent</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{matchingStats.responseRate}%</div>
                <div className="text-sm text-muted-foreground">Response Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Matching Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Matching Engine Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex-col gap-2">
              <Brain className="h-6 w-6" />
              Run AI Matching
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Mail className="h-6 w-6" />
              Send Job Alerts
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Target className="h-6 w-6" />
              Configure Matching
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Matching Algorithm Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Matching Algorithm Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Matching Criteria</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Skills Match</span>
                  <Badge variant="secondary">40% weight</Badge>
                </div>
                <Progress value={40} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Experience Level</span>
                  <Badge variant="secondary">25% weight</Badge>
                </div>
                <Progress value={25} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Location Preference</span>
                  <Badge variant="secondary">20% weight</Badge>
                </div>
                <Progress value={20} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Salary Range</span>
                  <Badge variant="secondary">15% weight</Badge>
                </div>
                <Progress value={15} className="h-2" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Notification Settings</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium text-sm">Daily Job Alerts</div>
                    <div className="text-xs text-muted-foreground">Send daily digest of matches</div>
                  </div>
                  <Badge variant="outline">Enabled</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium text-sm">Instant High Matches</div>
                    <div className="text-xs text-muted-foreground">Immediate notification for 90%+ matches</div>
                  </div>
                  <Badge variant="outline">Enabled</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium text-sm">Weekly Summary</div>
                    <div className="text-xs text-muted-foreground">Weekly matching performance report</div>
                  </div>
                  <Badge variant="outline">Enabled</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Matches (Empty State) */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Job Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No matches yet</h3>
            <p className="text-muted-foreground mb-4">
              Upload CVs and add job postings to start generating intelligent matches
            </p>
            <Button className="gap-2">
              <Brain className="h-4 w-4" />
              Start Matching Process
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* How Matching Works */}
      <Card>
        <CardHeader>
          <CardTitle>How AI Job Matching Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">1. Profile Analysis</h3>
              <p className="text-sm text-muted-foreground">
                AI analyzes candidate profiles, skills, experience, and preferences
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">2. Job Requirements</h3>
              <p className="text-sm text-muted-foreground">
                Extracts and understands job requirements, skills, and company culture
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">3. AI Matching</h3>
              <p className="text-sm text-muted-foreground">
                Intelligent algorithm calculates compatibility scores and ranks matches
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">4. Smart Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Automated emails sent to candidates with personalized job recommendations
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { MatchingEngine };