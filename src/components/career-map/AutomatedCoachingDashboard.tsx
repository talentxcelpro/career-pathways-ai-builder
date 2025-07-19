import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  Brain, 
  Target, 
  Calendar, 
  CheckCircle,
  ArrowRight,
  Lightbulb,
  TrendingUp,
  Heart
} from 'lucide-react';
import { useAICareerMapping } from '@/hooks/useAICareerMapping';

interface AutomatedCoachingDashboardProps {
  userId: string;
}

const AutomatedCoachingDashboard: React.FC<AutomatedCoachingDashboardProps> = ({
  userId
}) => {
  const [coachingData, setCoachingData] = useState<any>(null);
  const [selectedSessionType, setSelectedSessionType] = useState<'weekly_checkin' | 'monthly_review' | 'milestone_celebration'>('weekly_checkin');
  const { getCoaching, isGettingCoaching } = useAICareerMapping();

  const handleGetCoaching = async (coachingType = selectedSessionType) => {
    try {
      const result = await getCoaching.mutateAsync({
        userId,
        coachingType
      });
      setCoachingData(result);
    } catch (error) {
      console.error('Failed to get coaching session:', error);
    }
  };

  const getSessionTypeInfo = (type: string) => {
    switch (type) {
      case 'weekly_checkin':
        return { icon: Calendar, color: 'text-blue-600', title: 'Weekly Check-in' };
      case 'monthly_review':
        return { icon: TrendingUp, color: 'text-green-600', title: 'Monthly Review' };
      case 'milestone_celebration':
        return { icon: Heart, color: 'text-purple-600', title: 'Milestone Celebration' };
      default:
        return { icon: MessageCircle, color: 'text-gray-600', title: 'Coaching Session' };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'default';
    }
  };

  if (isGettingCoaching && !coachingData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Generating Coaching Session...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!coachingData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Career Coaching
          </CardTitle>
          <CardDescription>
            Get personalized coaching and guidance for your career journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { type: 'weekly_checkin', title: 'Weekly Check-in', desc: 'Regular progress review' },
                { type: 'monthly_review', title: 'Monthly Review', desc: 'Comprehensive analysis' },
                { type: 'milestone_celebration', title: 'Milestone Celebration', desc: 'Celebrate achievements' }
              ].map((session) => (
                <Button
                  key={session.type}
                  variant={selectedSessionType === session.type ? 'default' : 'outline'}
                  className="h-auto p-4 flex flex-col items-start"
                  onClick={() => setSelectedSessionType(session.type as any)}
                >
                  <span className="font-semibold">{session.title}</span>
                  <span className="text-xs text-muted-foreground">{session.desc}</span>
                </Button>
              ))}
            </div>
            
            <Button onClick={() => handleGetCoaching()} className="w-full">
              Start {getSessionTypeInfo(selectedSessionType).title}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sessionInfo = getSessionTypeInfo(coachingData.coachingSession?.sessionType);
  const SessionIcon = sessionInfo.icon;

  return (
    <div className="space-y-6">
      {/* Coaching Session Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SessionIcon className={`h-5 w-5 ${sessionInfo.color}`} />
            {sessionInfo.title}
          </CardTitle>
          <CardDescription>
            {coachingData.coachingSession?.greeting}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              {coachingData.coachingSession?.motivationalClose}
            </p>
            <Badge variant="outline">
              Next session: {new Date(coachingData.nextSessionRecommended).toLocaleDateString()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="review" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="review">Review</TabsTrigger>
          <TabsTrigger value="focus">Focus</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="adaptive">Adaptive</TabsTrigger>
          <TabsTrigger value="checkin">Check-in</TabsTrigger>
        </TabsList>

        {/* Progress Review */}
        <TabsContent value="review">
          <Card>
            <CardHeader>
              <CardTitle>Progress Review</CardTitle>
              <CardDescription>How you've been doing recently</CardDescription>
            </CardHeader>
            <CardContent>
              {coachingData.coachingSession?.progressReview && (
                <div className="space-y-6">
                  {/* Metrics */}
                  <div>
                    <h4 className="font-semibold mb-3">Key Metrics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {coachingData.coachingSession.progressReview.metrics?.activitiesThisWeek || 0}
                        </div>
                        <p className="text-sm text-muted-foreground">Activities This Week</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {coachingData.coachingSession.progressReview.metrics?.skillImprovements || 0}
                        </div>
                        <p className="text-sm text-muted-foreground">Skill Improvements</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {coachingData.coachingSession.progressReview.metrics?.goalsProgress || '0%'}
                        </div>
                        <p className="text-sm text-muted-foreground">Goals Progress</p>
                      </div>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Highlights
                    </h4>
                    <div className="space-y-2">
                      {coachingData.coachingSession.progressReview.highlights?.map((highlight: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-600 rounded-full" />
                          <span className="text-sm">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Concerns */}
                  {coachingData.coachingSession.progressReview.concerns?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4 text-yellow-600" />
                        Areas for Attention
                      </h4>
                      <div className="space-y-2">
                        {coachingData.coachingSession.progressReview.concerns.map((concern: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-600 rounded-full" />
                            <span className="text-sm">{concern}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 bg-green-50">
                      <h4 className="font-semibold text-green-800 mb-2">What's Going Well</h4>
                      <ul className="space-y-1">
                        {coachingData.coachingSession.feedback?.positive?.map((item: string, index: number) => (
                          <li key={index} className="text-sm text-green-700">{item}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-blue-50">
                      <h4 className="font-semibold text-blue-800 mb-2">Growth Opportunities</h4>
                      <ul className="space-y-1">
                        {coachingData.coachingSession.feedback?.constructive?.map((item: string, index: number) => (
                          <li key={index} className="text-sm text-blue-700">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weekly Focus */}
        <TabsContent value="focus">
          <Card>
            <CardHeader>
              <CardTitle>This Week's Focus</CardTitle>
              <CardDescription>Your priorities for the coming week</CardDescription>
            </CardHeader>
            <CardContent>
              {coachingData.coachingSession?.weeklyFocus && (
                <div className="space-y-6">
                  <div className="text-center border rounded-lg p-6 bg-gradient-to-r from-blue-50 to-purple-50">
                    <h3 className="text-xl font-bold mb-2">Primary Goal</h3>
                    <p className="text-lg text-muted-foreground">
                      {coachingData.coachingSession.weeklyFocus.primaryGoal}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Secondary Goals</h4>
                    <div className="space-y-2">
                      {coachingData.coachingSession.weeklyFocus.secondaryGoals?.map((goal: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">{goal}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      Skill to Improve
                    </h4>
                    <p className="text-muted-foreground">
                      {coachingData.coachingSession.weeklyFocus.skillToImprove}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Action Items */}
        <TabsContent value="actions">
          <Card>
            <CardHeader>
              <CardTitle>Action Items</CardTitle>
              <CardDescription>Specific tasks to complete</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {coachingData.coachingSession?.actionItems?.map((action: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold">{action.task}</h4>
                      <div className="flex gap-2">
                        <Badge variant={getPriorityColor(action.priority)}>
                          {action.priority}
                        </Badge>
                        <Badge variant="outline">{action.deadline}</Badge>
                      </div>
                    </div>
                    
                    {action.resources && action.resources.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Resources:</p>
                        <div className="flex gap-2">
                          {action.resources.map((resource: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {resource}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Adaptive Recommendations */}
        <TabsContent value="adaptive">
          <Card>
            <CardHeader>
              <CardTitle>Adaptive Recommendations</CardTitle>
              <CardDescription>Personalized adjustments to your learning path</CardDescription>
            </CardHeader>
            <CardContent>
              {coachingData.coachingSession?.adaptiveRecommendations && (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Pace Adjustment</h4>
                    <Badge variant={coachingData.coachingSession.adaptiveRecommendations.paceAdjustment === 'faster' ? 'destructive' : 'default'}>
                      {coachingData.coachingSession.adaptiveRecommendations.paceAdjustment}
                    </Badge>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Focus Areas</h4>
                    <p className="text-sm text-muted-foreground">
                      {coachingData.coachingSession.adaptiveRecommendations.focusShift}
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Methodology Changes</h4>
                    <p className="text-sm text-muted-foreground">
                      {coachingData.coachingSession.adaptiveRecommendations.methodologyChanges}
                    </p>
                  </div>

                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h4 className="font-semibold mb-2">Reasoning</h4>
                    <p className="text-sm text-blue-700">
                      {coachingData.coachingSession.adaptiveRecommendations.reasoning}
                    </p>
                  </div>
                </div>
              )}

              {/* Adaptive Updates */}
              {coachingData.adaptiveUpdates?.updateRequired && (
                <div className="mt-6 border rounded-lg p-4 bg-yellow-50">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-600" />
                    Roadmap Updates Available
                  </h4>
                  <div className="space-y-2">
                    {coachingData.adaptiveUpdates.suggestedChanges?.map((change: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-600 rounded-full" />
                        <span className="text-sm">{change}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Check-in Questions */}
        <TabsContent value="checkin">
          <Card>
            <CardHeader>
              <CardTitle>Reflection Questions</CardTitle>
              <CardDescription>Take a moment to reflect on your journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {coachingData.coachingSession?.checkInQuestions?.map((question: string, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">{question}</h4>
                    <textarea
                      className="w-full p-3 border rounded-md resize-none"
                      rows={3}
                      placeholder="Your thoughts..."
                    />
                  </div>
                ))}

                <div className="text-center mt-6">
                  <p className="text-muted-foreground mb-4">
                    {coachingData.coachingSession?.nextSteps}
                  </p>
                  <Button onClick={() => handleGetCoaching()} variant="outline">
                    Schedule Next Session
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomatedCoachingDashboard;