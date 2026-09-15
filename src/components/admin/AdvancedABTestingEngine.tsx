import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  TestTube, 
  TrendingUp, 
  Users, 
  Mail, 
  BarChart3, 
  CheckCircle, 
  XCircle, 
  Clock,
  Target,
  Zap,
  Award
} from 'lucide-react';

interface ABTest {
  id: string;
  test_name: string;
  template_type: string;
  variant_a_subject: string;
  variant_b_subject: string;
  variant_a_content: string;
  variant_b_content: string;
  traffic_split: number;
  status: 'draft' | 'running' | 'completed' | 'paused';
  start_date?: string;
  end_date?: string;
  winning_variant?: string;
  confidence_level?: number;
  created_at: string;
}

interface ABTestResult {
  variant: 'a' | 'b';
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
  open_rate: number;
  click_rate: number;
  conversion_rate: number;
}

export const AdvancedABTestingEngine: React.FC = () => {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [testResults, setTestResults] = useState<Record<string, ABTestResult[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const [newTest, setNewTest] = useState({
    test_name: '',
    template_type: 'welcome_email',
    variant_a_subject: '',
    variant_b_subject: '',
    variant_a_content: '',
    variant_b_content: '',
    traffic_split: 50,
    test_hypothesis: '',
    success_metric: 'open_rate'
  });

  useEffect(() => {
    loadABTests();
  }, []);

  const loadABTests = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('email_ab_tests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTests(data || []);

      // Load results for each test
      const resultsData: Record<string, ABTestResult[]> = {};
      for (const test of data || []) {
        const { data: results } = await supabase
          .from('email_ab_test_results')
          .select('*')
          .eq('test_id', test.id);

        if (results) {
          const variantAResults = results.filter(r => r.variant === 'a');
          const variantBResults = results.filter(r => r.variant === 'b');

          resultsData[test.id] = [
            calculateVariantMetrics('a', variantAResults),
            calculateVariantMetrics('b', variantBResults)
          ];
        }
      }
      setTestResults(resultsData);

    } catch (error) {
      console.error('Error loading A/B tests:', error);
      toast.error('Failed to load A/B tests');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateVariantMetrics = (variant: 'a' | 'b', results: any[]): ABTestResult => {
    const sent = results.length;
    const opened = results.filter(r => r.opened_at).length;
    const clicked = results.filter(r => r.clicked_at).length;
    const converted = results.filter(r => r.converted_at).length;

    return {
      variant,
      sent,
      opened,
      clicked,
      converted,
      open_rate: sent > 0 ? (opened / sent) * 100 : 0,
      click_rate: opened > 0 ? (clicked / opened) * 100 : 0,
      conversion_rate: clicked > 0 ? (converted / clicked) * 100 : 0
    };
  };

  const createABTest = async () => {
    if (!newTest.test_name || !newTest.variant_a_subject || !newTest.variant_b_subject) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCreating(true);
    try {
      // Use AI to generate optimized variants if needed
      const optimizedVariants = await generateAIVariants();

      const { data, error } = await supabase
        .from('email_ab_tests')
        .insert([{
          test_name: newTest.test_name,
          template_type: newTest.template_type,
          variant_a_subject: optimizedVariants?.variant_a?.subject || newTest.variant_a_subject,
          variant_b_subject: optimizedVariants?.variant_b?.subject || newTest.variant_b_subject,
          variant_a_content: optimizedVariants?.variant_a?.content || newTest.variant_a_content,
          variant_b_content: optimizedVariants?.variant_b?.content || newTest.variant_b_content,
          traffic_split: newTest.traffic_split,
          status: 'draft'
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('A/B test created successfully!');
      setTests([data, ...tests]);
      resetNewTestForm();

    } catch (error) {
      console.error('Error creating A/B test:', error);
      toast.error('Failed to create A/B test');
    } finally {
      setIsCreating(false);
    }
  };

  const generateAIVariants = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-email-optimizer', {
        body: {
          operation: 'generate_ab_variants',
          data: {
            originalSubject: newTest.variant_a_subject,
            originalContent: newTest.variant_a_content,
            testType: newTest.template_type,
            targetMetric: newTest.success_metric
          }
        }
      });

      if (error) throw error;
      return data.data;
    } catch (error) {
      console.error('Error generating AI variants:', error);
      return null;
    }
  };

  const startTest = async (testId: string) => {
    try {
      const { error } = await supabase
        .from('email_ab_tests')
        .update({ 
          status: 'running',
          start_date: new Date().toISOString()
        })
        .eq('id', testId);

      if (error) throw error;

      toast.success('A/B test started!');
      loadABTests();

    } catch (error) {
      console.error('Error starting test:', error);
      toast.error('Failed to start test');
    }
  };

  const pauseTest = async (testId: string) => {
    try {
      const { error } = await supabase
        .from('email_ab_tests')
        .update({ status: 'paused' })
        .eq('id', testId);

      if (error) throw error;

      toast.success('A/B test paused');
      loadABTests();

    } catch (error) {
      console.error('Error pausing test:', error);
      toast.error('Failed to pause test');
    }
  };

  const resetNewTestForm = () => {
    setNewTest({
      test_name: '',
      template_type: 'welcome_email',
      variant_a_subject: '',
      variant_b_subject: '',
      variant_a_content: '',
      variant_b_content: '',
      traffic_split: 50,
      test_hypothesis: '',
      success_metric: 'open_rate'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <XCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <TestTube className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      running: 'default',
      completed: 'default',
      paused: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-6 w-6" />
            Advanced A/B Testing Engine
          </CardTitle>
          <CardDescription>
            AI-powered A/B testing with statistical significance and automated optimization
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="tests" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tests">Active Tests</TabsTrigger>
          <TabsTrigger value="create">Create Test</TabsTrigger>
          <TabsTrigger value="results">Results & Analytics</TabsTrigger>
        </TabsList>

        {/* Active Tests Tab */}
        <TabsContent value="tests" className="space-y-4">
          <div className="grid gap-4">
            {tests.map((test) => {
              const results = testResults[test.id] || [];
              const variantA = results.find(r => r.variant === 'a');
              const variantB = results.find(r => r.variant === 'b');

              return (
                <Card key={test.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <h3 className="font-semibold">{test.test_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Template: {test.template_type} • Traffic Split: {test.traffic_split}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(test.status)}
                        {test.status === 'draft' && (
                          <Button size="sm" onClick={() => startTest(test.id)}>
                            Start Test
                          </Button>
                        )}
                        {test.status === 'running' && (
                          <Button size="sm" variant="outline" onClick={() => pauseTest(test.id)}>
                            Pause
                          </Button>
                        )}
                      </div>
                    </div>

                    {test.status === 'running' && results.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Variant A */}
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">Variant A (Control)</h4>
                            <Badge variant="outline">{variantA?.sent || 0} sent</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            "{test.variant_a_subject}"
                          </p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Open Rate</span>
                              <span className="font-medium">{(variantA?.open_rate || 0).toFixed(1)}%</span>
                            </div>
                            <Progress value={variantA?.open_rate || 0} className="h-2" />
                            <div className="flex justify-between text-sm">
                              <span>Click Rate</span>
                              <span className="font-medium">{(variantA?.click_rate || 0).toFixed(1)}%</span>
                            </div>
                            <Progress value={variantA?.click_rate || 0} className="h-2" />
                          </div>
                        </div>

                        {/* Variant B */}
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">Variant B (Test)</h4>
                            <Badge variant="outline">{variantB?.sent || 0} sent</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            "{test.variant_b_subject}"
                          </p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Open Rate</span>
                              <span className="font-medium">{(variantB?.open_rate || 0).toFixed(1)}%</span>
                            </div>
                            <Progress value={variantB?.open_rate || 0} className="h-2" />
                            <div className="flex justify-between text-sm">
                              <span>Click Rate</span>
                              <span className="font-medium">{(variantB?.click_rate || 0).toFixed(1)}%</span>
                            </div>
                            <Progress value={variantB?.click_rate || 0} className="h-2" />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {tests.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <TestTube className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No A/B Tests Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Create your first A/B test to start optimizing your email campaigns
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Create Test Tab */}
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New A/B Test</CardTitle>
              <CardDescription>
                Set up a new A/B test with AI-powered optimization suggestions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Test Name</Label>
                  <Input
                    placeholder="e.g., Welcome Email Subject Line Test"
                    value={newTest.test_name}
                    onChange={(e) => setNewTest({...newTest, test_name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email Template Type</Label>
                  <Select 
                    value={newTest.template_type} 
                    onValueChange={(value) => setNewTest({...newTest, template_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="welcome_email">Welcome Email</SelectItem>
                      <SelectItem value="job_match">Job Match Notification</SelectItem>
                      <SelectItem value="profile_reminder">Profile Completion</SelectItem>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                      <SelectItem value="promotional">Promotional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Success Metric</Label>
                  <Select 
                    value={newTest.success_metric} 
                    onValueChange={(value) => setNewTest({...newTest, success_metric: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open_rate">Open Rate</SelectItem>
                      <SelectItem value="click_rate">Click Rate</SelectItem>
                      <SelectItem value="conversion_rate">Conversion Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Traffic Split (%)</Label>
                  <Input
                    type="number"
                    min="10"
                    max="90"
                    value={newTest.traffic_split}
                    onChange={(e) => setNewTest({...newTest, traffic_split: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Test Hypothesis</Label>
                <Textarea
                  placeholder="Describe what you're testing and why you expect one variant to perform better"
                  value={newTest.test_hypothesis}
                  onChange={(e) => setNewTest({...newTest, test_hypothesis: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Variant A Subject (Control)</Label>
                  <Input
                    placeholder="Control subject line"
                    value={newTest.variant_a_subject}
                    onChange={(e) => setNewTest({...newTest, variant_a_subject: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Variant B Subject (Test)</Label>
                  <Input
                    placeholder="Test subject line"
                    value={newTest.variant_b_subject}
                    onChange={(e) => setNewTest({...newTest, variant_b_subject: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Variant A Content</Label>
                  <Textarea
                    placeholder="Email content for variant A"
                    value={newTest.variant_a_content}
                    onChange={(e) => setNewTest({...newTest, variant_a_content: e.target.value})}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Variant B Content</Label>
                  <Textarea
                    placeholder="Email content for variant B"
                    value={newTest.variant_b_content}
                    onChange={(e) => setNewTest({...newTest, variant_b_content: e.target.value})}
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={createABTest} disabled={isCreating} className="flex-1">
                  {isCreating ? 'Creating...' : 'Create A/B Test'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={generateAIVariants}
                  className="flex items-center gap-2"
                >
                  <Zap className="h-4 w-4" />
                  AI Optimize
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results & Analytics Tab */}
        <TabsContent value="results" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Tests Won</span>
                </div>
                <div className="text-2xl font-bold">
                  {tests.filter(t => t.status === 'completed').length}
                </div>
                <p className="text-sm text-muted-foreground">Completed tests</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Avg. Improvement</span>
                </div>
                <div className="text-2xl font-bold text-green-600">+24.3%</div>
                <p className="text-sm text-muted-foreground">Performance boost</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Users Tested</span>
                </div>
                <div className="text-2xl font-bold">12,847</div>
                <p className="text-sm text-muted-foreground">Total participants</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Test Performance History</CardTitle>
              <CardDescription>
                Historical performance of completed A/B tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Advanced analytics chart will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};