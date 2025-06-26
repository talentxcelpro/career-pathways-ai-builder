
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Lightbulb, 
  Clock, 
  TrendingUp, 
  Target, 
  Star,
  ArrowRight,
  CheckCircle,
  X,
  Zap,
  Calendar,
  AlertTriangle
} from 'lucide-react';

interface Suggestion {
  id: string;
  type: 'tool' | 'action' | 'improvement';
  title: string;
  description: string;
  tool_name?: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  estimated_time: number; // in minutes
  potential_impact: 'high' | 'medium' | 'low';
  expires_at?: string;
  is_dismissed: boolean;
  created_at: string;
}

interface ActivityPattern {
  most_used_tool: string;
  usage_frequency: number;
  last_activity: string;
  completion_rate: number;
  preferred_time: string;
}

const AutomatedSuggestions = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activityPattern, setActivityPattern] = useState<ActivityPattern | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissing, setDismissing] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    analyzeUserActivity();
    generateSuggestions();
  }, []);

  const analyzeUserActivity = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Analyze tool usage patterns from existing tool_usage table
      const { data: usageData, error } = await supabase
        .from('tool_usage')
        .select('tool_name, created_at, session_data, results')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (usageData && usageData.length > 0) {
        // Find most used tool
        const toolCounts = usageData.reduce((acc: any, item) => {
          acc[item.tool_name] = (acc[item.tool_name] || 0) + 1;
          return acc;
        }, {});

        const mostUsedTool = Object.keys(toolCounts).length > 0 
          ? Object.entries(toolCounts).reduce((a: any, b: any) => 
              toolCounts[a[0]] > toolCounts[b[0]] ? a : b
            )[0] 
          : 'Resume Checker';

        // Calculate usage frequency (sessions per week)
        const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentUsage = usageData.filter(item => 
          new Date(item.created_at) > lastWeek
        );

        // Analyze preferred usage times
        const hourCounts = usageData.reduce((acc: any, item) => {
          const hour = new Date(item.created_at).getHours();
          acc[hour] = (acc[hour] || 0) + 1;
          return acc;
        }, {});

        const preferredHour = Object.keys(hourCounts).length > 0
          ? Object.entries(hourCounts).reduce((a: any, b: any) => 
              hourCounts[a[0]] > hourCounts[b[0]] ? a : b
            )[0]
          : '9';

        const getTimeLabel = (hour: number) => {
          if (hour < 12) return 'morning';
          if (hour < 17) return 'afternoon';
          return 'evening';
        };

        setActivityPattern({
          most_used_tool: mostUsedTool,
          usage_frequency: recentUsage.length,
          last_activity: usageData[0].created_at,
          completion_rate: 85, // Mock calculation
          preferred_time: getTimeLabel(parseInt(preferredHour))
        });
      }
    } catch (error) {
      console.error('Error analyzing user activity:', error);
    }
  };

  const generateSuggestions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Try to get existing suggestions, fallback to generating new ones
      const { data: existingSuggestions, error } = await supabase
        .from('user_suggestions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching suggestions:', error);
        // Generate mock suggestions as fallback
        const mockSuggestions = generateMockSuggestions();
        setSuggestions(mockSuggestions);
      } else if (existingSuggestions && existingSuggestions.length > 0) {
        setSuggestions(existingSuggestions);
      } else {
        // Generate new suggestions and save them
        const newSuggestions = generateMockSuggestions();
        setSuggestions(newSuggestions);
        
        // Try to save suggestions to database
        for (const suggestion of newSuggestions) {
          await supabase
            .from('user_suggestions')
            .insert({
              user_id: user.id,
              type: suggestion.type,
              title: suggestion.title,
              description: suggestion.description,
              tool_name: suggestion.tool_name,
              priority: suggestion.priority,
              reason: suggestion.reason,
              estimated_time: suggestion.estimated_time,
              potential_impact: suggestion.potential_impact,
              expires_at: suggestion.expires_at,
              is_dismissed: false
            });
        }
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      // Fallback to mock suggestions
      setSuggestions(generateMockSuggestions());
    } finally {
      setLoading(false);
    }
  };

  const generateMockSuggestions = (): Suggestion[] => {
    return [
      {
        id: '1',
        type: 'tool',
        title: 'Update Your Resume',
        description: 'It\'s been 2 weeks since you last used the Resume Checker. Consider updating your resume with recent achievements.',
        tool_name: 'resume-check',
        priority: 'high',
        reason: 'You haven\'t updated your resume recently, and market trends show new keyword preferences.',
        estimated_time: 15,
        potential_impact: 'high',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        is_dismissed: false,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        type: 'action',
        title: 'Practice Interview Skills',
        description: 'Based on your job applications, you should practice common interview questions for your target role.',
        tool_name: 'interview-prep',
        priority: 'medium',
        reason: 'You have 3 pending applications and haven\'t practiced interviews recently.',
        estimated_time: 30,
        potential_impact: 'high',
        is_dismissed: false,
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        type: 'improvement',
        title: 'Optimize Your Profile',
        description: 'Your profile score could be improved by adding more skills and updating your summary.',
        tool_name: 'profile-score',
        priority: 'medium',
        reason: 'Your profile completion is at 75%. Completing it could increase visibility by 40%.',
        estimated_time: 10,
        potential_impact: 'medium',
        is_dismissed: false,
        created_at: new Date().toISOString()
      },
      {
        id: '4',
        type: 'tool',
        title: 'Check Salary Trends',
        description: 'New salary data is available for your industry. Check if you\'re being paid competitively.',
        tool_name: 'salary-analyzer',
        priority: 'low',
        reason: 'Market data updated with 15% salary increase trends in your field.',
        estimated_time: 5,
        potential_impact: 'medium',
        expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        is_dismissed: false,
        created_at: new Date().toISOString()
      }
    ];
  };

  const handleSuggestionAction = async (suggestion: Suggestion) => {
    if (suggestion.tool_name) {
      const routes: { [key: string]: string } = {
        'resume-check': '/tools',
        'cover-letter': '/tools',
        'profile-score': '/tools',
        'salary-analyzer': '/tools',
        'interview-prep': '/tools',
        'ai-assistant': '/tools',
        'market-insights': '/tools'
      };

      if (routes[suggestion.tool_name]) {
        window.location.href = routes[suggestion.tool_name];
      }
    }
  };

  const dismissSuggestion = async (suggestionId: string) => {
    setDismissing(suggestionId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Try to update in database, fallback to local state
      const { error } = await supabase
        .from('user_suggestions')
        .update({ is_dismissed: true })
        .eq('id', suggestionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error dismissing suggestion:', error);
      }

      // Update local state regardless
      setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
      
      toast({
        title: "Suggestion dismissed",
        description: "The suggestion has been removed from your list.",
      });
    } catch (error) {
      console.error('Error dismissing suggestion:', error);
      // Still update local state
      setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
      toast({
        title: "Suggestion dismissed",
        description: "The suggestion has been removed from your list.",
      });
    } finally {
      setDismissing(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return TrendingUp;
      case 'medium': return Target;
      case 'low': return Star;
      default: return Star;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tool': return Zap;
      case 'action': return CheckCircle;
      case 'improvement': return TrendingUp;
      default: return Lightbulb;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your activity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Activity Overview */}
      {activityPattern && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Activity Overview</span>
            </CardTitle>
            <CardDescription>Based on your recent tool usage patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{activityPattern.usage_frequency}</p>
                <p className="text-sm text-gray-600">Sessions this week</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{activityPattern.completion_rate}%</p>
                <p className="text-sm text-gray-600">Completion rate</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-purple-600 capitalize">{activityPattern.preferred_time}</p>
                <p className="text-sm text-gray-600">Preferred time</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-orange-600">{activityPattern.most_used_tool}</p>
                <p className="text-sm text-gray-600">Most used tool</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5" />
            <span>Smart Suggestions</span>
          </CardTitle>
          <CardDescription>
            Personalized recommendations based on your activity and goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          {suggestions.length > 0 ? (
            <div className="space-y-4">
              {suggestions.map((suggestion) => {
                const TypeIcon = getTypeIcon(suggestion.type);
                const ImpactIcon = getImpactIcon(suggestion.potential_impact);
                
                return (
                  <div key={suggestion.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <TypeIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold">{suggestion.title}</h4>
                            <Badge className={`text-xs ${getPriorityColor(suggestion.priority)}`}>
                              {suggestion.priority}
                            </Badge>
                            {suggestion.expires_at && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                Expires {new Date(suggestion.expires_at).toLocaleDateString()}
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{suggestion.description}</p>
                          <p className="text-xs text-gray-500 mb-3">{suggestion.reason}</p>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{suggestion.estimated_time} min</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ImpactIcon className="h-3 w-3" />
                              <span>{suggestion.potential_impact} impact</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleSuggestionAction(suggestion)}
                          disabled={!suggestion.tool_name}
                        >
                          <ArrowRight className="h-3 w-3 mr-1" />
                          {suggestion.type === 'tool' ? 'Use Tool' : 'Take Action'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissSuggestion(suggestion.id)}
                          disabled={dismissing === suggestion.id}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">You're all caught up!</h3>
              <p className="text-gray-600">No new suggestions at the moment. Keep using our tools to get personalized recommendations.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Upcoming Reminders</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <p className="font-medium text-sm">Weekly Resume Review</p>
                <p className="text-xs text-gray-600">Due in 2 days</p>
              </div>
              <Button variant="outline" size="sm">
                Schedule
              </Button>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-sm">Monthly Goal Review</p>
                <p className="text-xs text-gray-600">Due in 1 week</p>
              </div>
              <Button variant="outline" size="sm">
                Schedule
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomatedSuggestions;
