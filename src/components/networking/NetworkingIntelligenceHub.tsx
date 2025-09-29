import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Network, TrendingUp, Users, Zap, Target, MessageSquare, Calendar } from 'lucide-react';
import { useNetworkingIntelligence } from '@/hooks/useNetworkingIntelligence';

export const NetworkingIntelligenceHub: React.FC = () => {
  const {
    intelligentMatches,
    networkInsights,
    recommendations,
    scheduleNetworking,
    isLoading
  } = useNetworkingIntelligence();

  return (
    <div className="space-y-6">
      {/* AI Insights Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Network Score</p>
                <p className="text-2xl font-bold">92</p>
              </div>
              <Brain className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">+8 this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">AI Matches</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-muted-foreground">High-quality connections</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Influence Score</p>
                <p className="text-2xl font-bold">78%</p>
              </div>
              <Network className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-muted-foreground">Industry ranking</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Smart Intros</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Zap className="h-8 w-8 text-orange-500" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-muted-foreground">This week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Intelligent Matches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Networking Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          {intelligentMatches.length > 0 ? (
            <div className="space-y-4">
              {intelligentMatches.map((match) => (
                <div key={match.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {match.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{match.name}</h3>
                      <p className="text-sm text-muted-foreground">{match.title} at {match.company}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{match.matchScore}% match</Badge>
                        <Badge variant="outline">{match.mutualConnections} mutual</Badge>
                        <Badge variant={match.isOnline ? 'default' : 'secondary'}>
                          {match.isOnline ? 'Online' : 'Offline'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="text-xs text-muted-foreground mb-2">
                      <strong>Match reasons:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {match.matchReasons.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button size="sm">
                        <Users className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">AI is Analyzing</h3>
              <p className="text-muted-foreground">
                Building your personalized networking matches...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Network Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Network Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {networkInsights.map((insight, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${insight.color}`}></div>
                    <span className="font-medium">{insight.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{insight.count}</p>
                    <p className="text-sm text-muted-foreground">{insight.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Smart Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Zap className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{rec.title}</p>
                    <p className="text-xs text-muted-foreground">{rec.description}</p>
                    <Button size="sm" variant="outline" className="mt-2">
                      {rec.action}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Networking Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Smart Networking Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors">
              <CardContent className="p-4 text-center">
                <Calendar className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Schedule Coffee Chat</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  AI will find optimal times for both parties
                </p>
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => scheduleNetworking({ type: 'coffee' })}
                  disabled={isLoading}
                >
                  Auto-Schedule
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed border-secondary/30 hover:border-secondary/50 transition-colors">
              <CardContent className="p-4 text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-3 text-secondary" />
                <h3 className="font-semibold mb-2">Smart Introduction</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  AI-crafted introduction messages
                </p>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => scheduleNetworking({ type: 'introduction' })}
                  disabled={isLoading}
                >
                  Generate Intro
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed border-accent/30 hover:border-accent/50 transition-colors">
              <CardContent className="p-4 text-center">
                <Network className="h-8 w-8 mx-auto mb-3 text-accent" />
                <h3 className="font-semibold mb-2">Group Networking</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Join AI-matched networking groups
                </p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => scheduleNetworking({ type: 'group' })}
                  disabled={isLoading}
                >
                  Find Groups
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};