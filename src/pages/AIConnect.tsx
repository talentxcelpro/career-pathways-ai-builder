import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Zap, Users, Target, MessageCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const AIConnect = () => {
  return (
    <>
      <Helmet>
        <title>AI Connect | Smart Professional Networking</title>
        <meta name="description" content="AI-powered professional networking. Get smart recommendations, automated networking insights, and intelligent connection suggestions." />
        <link rel="canonical" href="https://talentxcel.in/ai-connect" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Brain className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">AI Connect</h1>
            </div>
            <p className="text-muted-foreground">Smart networking powered by artificial intelligence</p>
          </div>

          <div className="grid gap-6">
            {/* AI Features Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <Target className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Smart Matching</h3>
                  <p className="text-sm text-muted-foreground">AI finds the most relevant connections for your career goals</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <MessageCircle className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Conversation Starters</h3>
                  <p className="text-sm text-muted-foreground">AI-generated icebreakers for meaningful conversations</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Network Analytics</h3>
                  <p className="text-sm text-muted-foreground">Insights into your network growth and engagement</p>
                </CardContent>
              </Card>
            </div>

            {/* AI Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  AI-Powered Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      type: "Smart Connection",
                      title: "Connect with React developers in your area",
                      reason: "Based on your skills and location",
                      confidence: 95,
                      action: "Find Connections"
                    },
                    {
                      type: "Engagement Opportunity",
                      title: "Comment on trending AI discussions",
                      reason: "Matches your interests in machine learning",
                      confidence: 88,
                      action: "View Posts"
                    },
                    {
                      type: "Network Expansion",
                      title: "Join Web Development communities",
                      reason: "Popular among your existing connections",
                      confidence: 82,
                      action: "Explore Groups"
                    }
                  ].map((rec, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{rec.type}</Badge>
                            <Badge variant="secondary">{rec.confidence}% match</Badge>
                          </div>
                          <h3 className="font-semibold mb-1">{rec.title}</h3>
                          <p className="text-sm text-muted-foreground">{rec.reason}</p>
                        </div>
                        <Button variant="outline" size="sm">{rec.action}</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  AI Network Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Network Strength</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Connection Quality</span>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary rounded-full h-2" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <div className="flex justify-between">
                        <span className="text-sm">Engagement Rate</span>
                        <span className="text-sm font-medium">72%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary rounded-full h-2" style={{ width: '72%' }}></div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Growth Opportunities</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        Connect with 5 more senior developers
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        Engage in AI/ML discussions
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        Join 2 more industry groups
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        Share more technical content
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Chat Assistant */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  AI Networking Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted/50 rounded-lg mb-4">
                  <p className="text-sm mb-2"><strong>AI Assistant:</strong> I noticed you're interested in connecting with React developers. Would you like me to suggest some conversation starters for your next networking message?</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm">Get Suggestions</Button>
                  <Button size="sm" variant="outline">Ask AI</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIConnect;