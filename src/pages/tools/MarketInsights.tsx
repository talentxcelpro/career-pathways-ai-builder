
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, BarChart3, Users, MapPin, Lightbulb, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const MarketInsights = () => {
  const [formData, setFormData] = useState({
    industry: '',
    location: '',
    jobRole: ''
  });
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<any>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getInsights = async () => {
    if (!formData.industry && !formData.location) return;
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('ai-tools', {
        body: {
          tool: 'market-insights',
          data: formData,
          userId: user?.id
        }
      });

      if (error) throw error;
      setInsights(data);
    } catch (error) {
      console.error('Market insights error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveInsights = async () => {
    if (!insights) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('saved_tool_results').insert({
        user_id: user.id,
        tool_name: 'market-insights',
        title: `Market Analysis: ${formData.industry} in ${formData.location}`,
        content: { formData, insights }
      });
      
      alert('Market insights saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Market Insights</h1>
          <p className="text-gray-600">
            Get comprehensive market analysis, industry trends, and job market insights
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Market Analysis
              </CardTitle>
              <CardDescription>
                Enter details to get market insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  placeholder="e.g., Technology, Healthcare"
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., San Francisco, CA"
                />
              </div>

              <div>
                <Label htmlFor="jobRole">Job Role (Optional)</Label>
                <Input
                  id="jobRole"
                  value={formData.jobRole}
                  onChange={(e) => handleInputChange('jobRole', e.target.value)}
                  placeholder="e.g., Software Engineer"
                />
              </div>

              <Button 
                onClick={getInsights}
                disabled={loading || (!formData.industry && !formData.location)}
                className="w-full"
              >
                {loading ? 'Analyzing Market...' : 'Get Market Insights'}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="lg:col-span-2">
            {loading ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Analyzing market data...</p>
                </CardContent>
              </Card>
            ) : insights ? (
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="trends">Trends</TabsTrigger>
                  <TabsTrigger value="skills">Hot Skills</TabsTrigger>
                  <TabsTrigger value="growth">Job Growth</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <Target className="h-5 w-5 mr-2" />
                          Market Overview
                        </CardTitle>
                        <Button variant="outline" size="sm" onClick={saveInsights}>
                          Save Insights
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">Market Analysis</h4>
                          <p className="text-blue-800">{insights.insights}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 border rounded-lg">
                            <div className="flex items-center mb-2">
                              <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                              <span className="font-medium">Growth Rate</span>
                            </div>
                            <div className="text-2xl font-bold text-green-600">
                              {insights.jobGrowth?.growthRate}
                            </div>
                          </div>

                          <div className="p-4 border rounded-lg">
                            <div className="flex items-center mb-2">
                              <Users className="h-4 w-4 text-blue-600 mr-2" />
                              <span className="font-medium">New Positions</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-600">
                              {insights.jobGrowth?.projectedJobs}
                            </div>
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center mb-2">
                            <MapPin className="h-4 w-4 text-purple-600 mr-2" />
                            <span className="font-medium">Competition Level</span>
                          </div>
                          <Badge variant="secondary">{insights.jobGrowth?.competitionLevel}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="trends">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        Industry Trends
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {insights.trends?.map((trend: string, index: number) => (
                          <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-blue-600 text-sm font-medium">{index + 1}</span>
                            </div>
                            <span className="text-gray-700">{trend}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="skills">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Lightbulb className="h-5 w-5 mr-2" />
                        In-Demand Skills
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {insights.hotSkills?.map((skill: string, index: number) => (
                          <div key={index} className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                            <div className="font-medium text-purple-900">{skill}</div>
                            <div className="text-xs text-purple-600 mt-1">High Demand</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="growth">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2" />
                        Job Growth Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="text-center p-6 bg-green-50 rounded-lg">
                            <div className="text-3xl font-bold text-green-600 mb-2">
                              {insights.jobGrowth?.growthRate}
                            </div>
                            <p className="text-green-800">Annual Growth Rate</p>
                          </div>

                          <div className="text-center p-6 bg-blue-50 rounded-lg">
                            <div className="text-3xl font-bold text-blue-600 mb-2">
                              {insights.jobGrowth?.projectedJobs?.split(' ')[0]}
                            </div>
                            <p className="text-blue-800">New Positions Expected</p>
                          </div>
                        </div>

                        <div className="p-4 border-l-4 border-yellow-400 bg-yellow-50">
                          <h4 className="font-medium text-yellow-800 mb-2">Market Opportunity</h4>
                          <p className="text-yellow-700">
                            The {formData.industry} sector shows strong growth potential with 
                            {insights.jobGrowth?.competitionLevel?.toLowerCase() === 'moderate' ? ' moderate' : ' high'} competition levels. 
                            This presents good opportunities for qualified candidates.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Enter industry or location details to see market insights</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketInsights;
