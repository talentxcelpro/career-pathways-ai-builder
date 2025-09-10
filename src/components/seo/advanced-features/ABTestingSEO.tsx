import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  TestTube, 
  TrendingUp, 
  Users, 
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Target,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { toast } from 'sonner';

interface ABTest {
  id: string;
  name: string;
  type: 'title' | 'meta_description' | 'h1' | 'schema' | 'url_structure';
  status: 'draft' | 'running' | 'completed' | 'paused';
  target_url: string;
  variants: {
    control: {
      name: string;
      content: string;
      traffic_split: number;
    };
    variation: {
      name: string;
      content: string;
      traffic_split: number;
    };
  };
  metrics: {
    control: {
      impressions: number;
      clicks: number;
      ctr: number;
      avg_position: number;
      conversions: number;
    };
    variation: {
      impressions: number;
      clicks: number;
      ctr: number;
      avg_position: number;
      conversions: number;
    };
  };
  confidence_level: number;
  winning_variant: 'control' | 'variation' | null;
  start_date: string;
  end_date?: string;
  duration_days: number;
  min_sample_size: number;
}

export const ABTestingSEO = () => {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [newTest, setNewTest] = useState({
    name: '',
    type: 'title' as ABTest['type'],
    target_url: '',
    control_content: '',
    variation_content: '',
    duration_days: 30,
    traffic_split: 50
  });

  useEffect(() => {
    loadTests();
    
    // Update test metrics every 5 minutes
    const interval = setInterval(() => {
      updateTestMetrics();
    }, 300000);

    return () => clearInterval(interval);
  }, []);

  const loadTests = async () => {
    setLoading(true);
    try {
      // Simulate A/B test data
      const mockTests: ABTest[] = [
        {
          id: '1',
          name: 'Software Engineer Job Title Test',
          type: 'title',
          status: 'running',
          target_url: '/jobs/software-engineer',
          variants: {
            control: {
              name: 'Original Title',
              content: 'Software Engineer Jobs in India - Apply Now',
              traffic_split: 50
            },
            variation: {
              name: 'Enhanced Title',
              content: 'Top Software Engineer Jobs in India 2024 - High Salary',
              traffic_split: 50
            }
          },
          metrics: {
            control: {
              impressions: 45600,
              clicks: 1230,
              ctr: 2.7,
              avg_position: 8.2,
              conversions: 89
            },
            variation: {
              impressions: 44200,
              clicks: 1456,
              ctr: 3.3,
              avg_position: 7.1,
              conversions: 112
            }
          },
          confidence_level: 85,
          winning_variant: 'variation',
          start_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          duration_days: 30,
          min_sample_size: 2000
        },
        {
          id: '2',
          name: 'Meta Description Optimization',
          type: 'meta_description',
          status: 'running',
          target_url: '/jobs/data-scientist',
          variants: {
            control: {
              name: 'Standard Description',
              content: 'Find data scientist jobs in India. Top companies hiring now.',
              traffic_split: 50
            },
            variation: {
              name: 'Action-Oriented Description',
              content: 'Land your dream data scientist job in India! 500+ openings at top companies. Apply today and boost your career.',
              traffic_split: 50
            }
          },
          metrics: {
            control: {
              impressions: 23400,
              clicks: 712,
              ctr: 3.04,
              avg_position: 6.8,
              conversions: 45
            },
            variation: {
              impressions: 22800,
              clicks: 821,
              ctr: 3.6,
              avg_position: 6.2,
              conversions: 58
            }
          },
          confidence_level: 72,
          winning_variant: null,
          start_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          duration_days: 30,
          min_sample_size: 1500
        },
        {
          id: '3',
          name: 'H1 Tag Structure Test',
          type: 'h1',
          status: 'completed',
          target_url: '/companies',
          variants: {
            control: {
              name: 'Generic H1',
              content: 'Top Companies in India',
              traffic_split: 50
            },
            variation: {
              name: 'Keyword-Rich H1',
              content: 'Top Tech Companies Hiring in India - IT Jobs 2024',
              traffic_split: 50
            }
          },
          metrics: {
            control: {
              impressions: 67800,
              clicks: 2034,
              ctr: 3.0,
              avg_position: 9.1,
              conversions: 156
            },
            variation: {
              impressions: 68200,
              clicks: 2387,
              ctr: 3.5,
              avg_position: 7.8,
              conversions: 189
            }
          },
          confidence_level: 95,
          winning_variant: 'variation',
          start_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          duration_days: 30,
          min_sample_size: 3000
        }
      ];
      
      setTests(mockTests);
    } catch (error) {
      console.error('Error loading A/B tests:', error);
      toast.error('Failed to load A/B tests');
    } finally {
      setLoading(false);
    }
  };

  const updateTestMetrics = async () => {
    try {
      setTests(prev => prev.map(test => {
        if (test.status !== 'running') return test;
        
        // Simulate metric updates
        const controlImpressionsIncrease = Math.floor(Math.random() * 100) + 50;
        const variationImpressionsIncrease = Math.floor(Math.random() * 100) + 50;
        
        const newControlMetrics = {
          ...test.metrics.control,
          impressions: test.metrics.control.impressions + controlImpressionsIncrease,
          clicks: test.metrics.control.clicks + Math.floor(controlImpressionsIncrease * test.metrics.control.ctr / 100),
        };
        
        const newVariationMetrics = {
          ...test.metrics.variation,
          impressions: test.metrics.variation.impressions + variationImpressionsIncrease,
          clicks: test.metrics.variation.clicks + Math.floor(variationImpressionsIncrease * test.metrics.variation.ctr / 100),
        };

        // Recalculate CTR
        newControlMetrics.ctr = (newControlMetrics.clicks / newControlMetrics.impressions) * 100;
        newVariationMetrics.ctr = (newVariationMetrics.clicks / newVariationMetrics.impressions) * 100;

        return {
          ...test,
          metrics: {
            control: newControlMetrics,
            variation: newVariationMetrics
          }
        };
      }));
    } catch (error) {
      console.error('Error updating test metrics:', error);
    }
  };

  const createTest = async () => {
    if (!newTest.name || !newTest.target_url || !newTest.control_content || !newTest.variation_content) {
      toast.error('Please fill in all required fields');
      return;
    }

    const test: ABTest = {
      id: Date.now().toString(),
      name: newTest.name,
      type: newTest.type,
      status: 'draft',
      target_url: newTest.target_url,
      variants: {
        control: {
          name: 'Control',
          content: newTest.control_content,
          traffic_split: newTest.traffic_split
        },
        variation: {
          name: 'Variation',
          content: newTest.variation_content,
          traffic_split: 100 - newTest.traffic_split
        }
      },
      metrics: {
        control: { impressions: 0, clicks: 0, ctr: 0, avg_position: 0, conversions: 0 },
        variation: { impressions: 0, clicks: 0, ctr: 0, avg_position: 0, conversions: 0 }
      },
      confidence_level: 0,
      winning_variant: null,
      start_date: new Date().toISOString(),
      duration_days: newTest.duration_days,
      min_sample_size: 1000
    };

    setTests(prev => [test, ...prev]);
    setNewTest({
      name: '',
      type: 'title',
      target_url: '',
      control_content: '',
      variation_content: '',
      duration_days: 30,
      traffic_split: 50
    });
    setShowCreateForm(false);
    toast.success('A/B test created successfully');
  };

  const startTest = (testId: string) => {
    setTests(prev => prev.map(test => 
      test.id === testId 
        ? { ...test, status: 'running', start_date: new Date().toISOString() }
        : test
    ));
    toast.success('A/B test started');
  };

  const pauseTest = (testId: string) => {
    setTests(prev => prev.map(test => 
      test.id === testId ? { ...test, status: 'paused' } : test
    ));
    toast.success('A/B test paused');
  };

  const stopTest = (testId: string) => {
    setTests(prev => prev.map(test => 
      test.id === testId 
        ? { ...test, status: 'completed', end_date: new Date().toISOString() }
        : test
    ));
    toast.success('A/B test completed');
  };

  const getStatusColor = (status: ABTest['status']) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'paused': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: ABTest['status']) => {
    switch (status) {
      case 'running': return <Play className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'paused': return <Pause className="h-3 w-3" />;
      default: return <Square className="h-3 w-3" />;
    }
  };

  const runningTests = tests.filter(test => test.status === 'running').length;
  const completedTests = tests.filter(test => test.status === 'completed').length;
  const avgConfidence = tests.length > 0 
    ? Math.round(tests.reduce((sum, test) => sum + test.confidence_level, 0) / tests.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">SEO A/B Testing</h2>
          <p className="text-muted-foreground">Test and optimize SEO elements for better performance</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <TestTube className="h-4 w-4 mr-2" />
          Create A/B Test
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Running Tests</p>
                <p className="text-2xl font-bold text-green-600">{runningTests}</p>
              </div>
              <Play className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedTests}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
                <p className="text-2xl font-bold">{avgConfidence}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tests</p>
                <p className="text-2xl font-bold">{tests.length}</p>
              </div>
              <TestTube className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Test Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New A/B Test</CardTitle>
            <CardDescription>Set up a new SEO element test</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Test Name</label>
                <Input
                  placeholder="e.g., Homepage Title Test"
                  value={newTest.name}
                  onChange={(e) => setNewTest(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Test Type</label>
                <select
                  value={newTest.type}
                  onChange={(e) => setNewTest(prev => ({ ...prev, type: e.target.value as ABTest['type'] }))}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="title">Title Tag</option>
                  <option value="meta_description">Meta Description</option>
                  <option value="h1">H1 Tag</option>
                  <option value="schema">Schema Markup</option>
                  <option value="url_structure">URL Structure</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Target URL</label>
              <Input
                placeholder="/jobs/software-engineer"
                value={newTest.target_url}
                onChange={(e) => setNewTest(prev => ({ ...prev, target_url: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Control (Original)</label>
                <Textarea
                  placeholder="Original content"
                  value={newTest.control_content}
                  onChange={(e) => setNewTest(prev => ({ ...prev, control_content: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Variation (Test)</label>
                <Textarea
                  placeholder="Test variation content"
                  value={newTest.variation_content}
                  onChange={(e) => setNewTest(prev => ({ ...prev, variation_content: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Duration (days)</label>
                <Input
                  type="number"
                  value={newTest.duration_days}
                  onChange={(e) => setNewTest(prev => ({ ...prev, duration_days: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Traffic Split (%)</label>
                <Input
                  type="number"
                  min="10"
                  max="90"
                  value={newTest.traffic_split}
                  onChange={(e) => setNewTest(prev => ({ ...prev, traffic_split: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button onClick={createTest}>
                Create Test
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      <div className="grid grid-cols-1 gap-6">
        {tests.map((test) => (
          <Card key={test.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {test.name}
                    <Badge className={`${getStatusColor(test.status)} text-white flex items-center gap-1`}>
                      {getStatusIcon(test.status)}
                      {test.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {test.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} • {test.target_url}
                  </CardDescription>
                </div>
                
                <div className="flex items-center gap-2">
                  {test.status === 'draft' && (
                    <Button size="sm" onClick={() => startTest(test.id)}>
                      <Play className="h-3 w-3 mr-1" />
                      Start
                    </Button>
                  )}
                  {test.status === 'running' && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => pauseTest(test.id)}>
                        <Pause className="h-3 w-3 mr-1" />
                        Pause
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => stopTest(test.id)}>
                        <Square className="h-3 w-3 mr-1" />
                        Stop
                      </Button>
                    </>
                  )}
                  {test.status === 'paused' && (
                    <Button size="sm" onClick={() => startTest(test.id)}>
                      <Play className="h-3 w-3 mr-1" />
                      Resume
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Test Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Control</h4>
                  <p className="text-sm">{test.variants.control.content}</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Variation</h4>
                  <p className="text-sm">{test.variants.variation.content}</p>
                </div>
              </div>

              {/* Metrics Comparison */}
              {test.status !== 'draft' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Results</h4>
                    {test.confidence_level >= 95 && (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Statistically Significant
                      </Badge>
                    )}
                    {test.confidence_level >= 80 && test.confidence_level < 95 && (
                      <Badge variant="secondary">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Approaching Significance
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h5 className="font-medium">Control</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Impressions:</span>
                          <span className="font-medium">{test.metrics.control.impressions.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Clicks:</span>
                          <span className="font-medium">{test.metrics.control.clicks.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">CTR:</span>
                          <span className="font-medium">{test.metrics.control.ctr.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Avg Position:</span>
                          <span className="font-medium">{test.metrics.control.avg_position.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h5 className="font-medium">Variation</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Impressions:</span>
                          <span className="font-medium">{test.metrics.variation.impressions.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Clicks:</span>
                          <span className="font-medium">{test.metrics.variation.clicks.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">CTR:</span>
                          <span className={`font-medium ${test.metrics.variation.ctr > test.metrics.control.ctr ? 'text-green-600' : 'text-red-600'}`}>
                            {test.metrics.variation.ctr.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Avg Position:</span>
                          <span className={`font-medium ${test.metrics.variation.avg_position < test.metrics.control.avg_position ? 'text-green-600' : 'text-red-600'}`}>
                            {test.metrics.variation.avg_position.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <span className="text-sm text-muted-foreground">Confidence Level:</span>
                      <span className="font-semibold ml-2">{test.confidence_level}%</span>
                    </div>
                    {test.winning_variant && (
                      <Badge variant={test.winning_variant === 'variation' ? 'default' : 'secondary'}>
                        {test.winning_variant === 'variation' ? 'Variation Wins' : 'Control Wins'}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {tests.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No A/B tests created yet.</p>
            <p className="text-sm text-muted-foreground">Create your first test to optimize SEO elements.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};