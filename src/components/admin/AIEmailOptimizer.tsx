import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Target, 
  Zap,
  Settings,
  BarChart3,
  Users,
  Mail,
  Eye,
  MousePointer,
  Star,
  Lightbulb,
  RefreshCw
} from "lucide-react";

interface AIOptimization {
  id: string;
  template_id: string;
  optimization_type: 'subject_line' | 'send_time' | 'content' | 'frequency';
  current_performance: number;
  predicted_improvement: number;
  confidence_score: number;
  suggestion: string;
  status: 'pending' | 'testing' | 'implemented' | 'rejected';
  created_at: string;
  test_results?: {
    control_performance: number;
    variant_performance: number;
    statistical_significance: number;
  };
}

interface SmartScheduling {
  id: string;
  campaign_name: string;
  optimal_send_time: string;
  recipient_segments: number;
  predicted_engagement: number;
  timezone_optimization: boolean;
  device_optimization: boolean;
  frequency_cap: number;
  status: 'scheduled' | 'sending' | 'completed';
}

interface PersonalizationRule {
  id: string;
  name: string;
  trigger_condition: string;
  personalization_fields: string[];
  dynamic_content: any;
  performance_lift: number;
  is_active: boolean;
}

export const AIEmailOptimizer = () => {
  const [optimizations, setOptimizations] = useState<AIOptimization[]>([]);
  const [smartSchedules, setSmartSchedules] = useState<SmartScheduling[]>([]);
  const [personalizationRules, setPersonalizationRules] = useState<PersonalizationRule[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedOptimization, setSelectedOptimization] = useState<AIOptimization | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [aiSettings, setAiSettings] = useState({
    auto_optimization: true,
    confidence_threshold: 75,
    test_duration_days: 7,
    min_sample_size: 1000,
    max_variants: 3
  });

  useEffect(() => {
    loadAIOptimizations();
    loadSmartSchedules();
    loadPersonalizationRules();
  }, []);

  const loadAIOptimizations = async () => {
    try {
      // Mock AI optimization data
      const mockOptimizations: AIOptimization[] = [
        {
          id: '1',
          template_id: 'welcome_email',
          optimization_type: 'subject_line',
          current_performance: 24.5,
          predicted_improvement: 31.2,
          confidence_score: 87,
          suggestion: 'Change "Welcome to our platform!" to "🎉 Your account is ready - let\'s get started!"',
          status: 'testing',
          created_at: new Date().toISOString(),
          test_results: {
            control_performance: 24.5,
            variant_performance: 28.9,
            statistical_significance: 95.2
          }
        },
        {
          id: '2',
          template_id: 'newsletter',
          optimization_type: 'send_time',
          current_performance: 18.3,
          predicted_improvement: 23.7,
          confidence_score: 92,
          suggestion: 'Optimize send time from 9:00 AM to 2:30 PM based on user engagement patterns',
          status: 'pending',
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          template_id: 'cart_abandonment',
          optimization_type: 'frequency',
          current_performance: 12.1,
          predicted_improvement: 16.8,
          confidence_score: 78,
          suggestion: 'Reduce follow-up frequency from daily to every 3 days to prevent fatigue',
          status: 'implemented',
          created_at: new Date().toISOString()
        }
      ];
      
      setOptimizations(mockOptimizations);
    } catch (error) {
      console.error('Error loading AI optimizations:', error);
    }
    setLoading(false);
  };

  const loadSmartSchedules = async () => {
    try {
      // Mock smart scheduling data
      const mockSchedules: SmartScheduling[] = [
        {
          id: '1',
          campaign_name: 'Weekly Product Update',
          optimal_send_time: '2024-01-15T14:30:00Z',
          recipient_segments: 5,
          predicted_engagement: 34.5,
          timezone_optimization: true,
          device_optimization: true,
          frequency_cap: 2,
          status: 'scheduled'
        },
        {
          id: '2',
          campaign_name: 'Holiday Sale Announcement',
          optimal_send_time: '2024-01-16T10:00:00Z',
          recipient_segments: 8,
          predicted_engagement: 42.1,
          timezone_optimization: true,
          device_optimization: false,
          frequency_cap: 1,
          status: 'sending'
        }
      ];
      
      setSmartSchedules(mockSchedules);
    } catch (error) {
      console.error('Error loading smart schedules:', error);
    }
  };

  const loadPersonalizationRules = async () => {
    try {
      // Mock personalization rules
      const mockRules: PersonalizationRule[] = [
        {
          id: '1',
          name: 'Industry-Specific Content',
          trigger_condition: 'user.industry',
          personalization_fields: ['greeting', 'case_studies', 'cta_text'],
          dynamic_content: {
            tech: { greeting: 'Hi Tech Leader', cta_text: 'Explore DevTools' },
            finance: { greeting: 'Dear Finance Professional', cta_text: 'View Financial Solutions' }
          },
          performance_lift: 23.4,
          is_active: true
        },
        {
          id: '2',
          name: 'Engagement-Based Frequency',
          trigger_condition: 'user.engagement_score',
          personalization_fields: ['frequency', 'content_depth'],
          dynamic_content: {
            high: { frequency: 'weekly', content_depth: 'detailed' },
            low: { frequency: 'monthly', content_depth: 'summary' }
          },
          performance_lift: 18.7,
          is_active: true
        }
      ];
      
      setPersonalizationRules(mockRules);
    } catch (error) {
      console.error('Error loading personalization rules:', error);
    }
  };

  const runAIOptimization = async () => {
    setIsOptimizing(true);
    try {
      // Simulate AI optimization process
      toast({
        title: "AI Optimization Started",
        description: "Analyzing email performance and generating improvements...",
      });

      // Mock AI optimization call
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Generate new optimization suggestions
      const newOptimization: AIOptimization = {
        id: Date.now().toString(),
        template_id: 'product_announcement',
        optimization_type: 'content',
        current_performance: 15.2,
        predicted_improvement: 21.8,
        confidence_score: 83,
        suggestion: 'Add social proof testimonials and create urgency with limited-time offer',
        status: 'pending',
        created_at: new Date().toISOString()
      };

      setOptimizations(prev => [newOptimization, ...prev]);

      toast({
        title: "AI Optimization Complete",
        description: "New optimization suggestions have been generated.",
      });
    } catch (error) {
      console.error('Error running AI optimization:', error);
      toast({
        title: "Error",
        description: "Failed to run AI optimization.",
        variant: "destructive"
      });
    }
    setIsOptimizing(false);
  };

  const implementOptimization = async (optimizationId: string) => {
    try {
      // Update optimization status
      setOptimizations(prev => prev.map(opt => 
        opt.id === optimizationId 
          ? { ...opt, status: 'testing' }
          : opt
      ));

      toast({
        title: "Optimization Implemented",
        description: "A/B test has been started to validate the optimization.",
      });
    } catch (error) {
      console.error('Error implementing optimization:', error);
      toast({
        title: "Error",
        description: "Failed to implement optimization.",
        variant: "destructive"
      });
    }
  };

  const getOptimizationIcon = (type: string) => {
    const icons = {
      subject_line: Mail,
      send_time: Clock,
      content: Sparkles,
      frequency: BarChart3
    };
    
    const IconComponent = icons[type as keyof typeof icons] || Lightbulb;
    return <IconComponent className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      testing: 'default',
      implemented: 'default',
      rejected: 'destructive'
    } as const;
    
    const colors = {
      pending: 'text-yellow-600',
      testing: 'text-blue-600',
      implemented: 'text-green-600',
      rejected: 'text-red-600'
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading AI optimizer...</div>;
  }

  return (
    <div className="space-y-6">
      {/* AI Optimizer Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Email Optimizer
          </h2>
          <p className="text-muted-foreground">
            Intelligent optimization powered by machine learning and behavioral analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={runAIOptimization} 
            disabled={isOptimizing}
            className="flex items-center gap-2"
          >
            {isOptimizing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isOptimizing ? 'Optimizing...' : 'Run AI Analysis'}
          </Button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg. Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+27.3%</div>
            <div className="text-xs text-muted-foreground">From AI optimizations</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Active Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <div className="text-xs text-muted-foreground">A/B tests running</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84.2%</div>
            <div className="text-xs text-muted-foreground">Average confidence</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Personalized
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89.1%</div>
            <div className="text-xs text-muted-foreground">Of all emails</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="optimizations" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="optimizations">AI Suggestions</TabsTrigger>
          <TabsTrigger value="scheduling">Smart Scheduling</TabsTrigger>
          <TabsTrigger value="personalization">Personalization</TabsTrigger>
          <TabsTrigger value="settings">AI Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="optimizations" className="space-y-4">
          <div className="space-y-4">
            {optimizations.map((optimization) => (
              <Card key={optimization.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-primary">
                        {getOptimizationIcon(optimization.optimization_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold capitalize">
                            {optimization.optimization_type.replace('_', ' ')} Optimization
                          </h3>
                          {getStatusBadge(optimization.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {optimization.suggestion}
                        </p>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Current:</span>
                            <div className="font-medium">{optimization.current_performance}%</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Predicted:</span>
                            <div className="font-medium text-green-600">
                              {optimization.predicted_improvement}%
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Confidence:</span>
                            <div className="font-medium">{optimization.confidence_score}%</div>
                          </div>
                        </div>

                        {optimization.test_results && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="text-sm font-medium text-green-900 mb-1">
                              Test Results
                            </div>
                            <div className="text-sm text-green-700">
                              Variant outperformed control by{' '}
                              {((optimization.test_results.variant_performance / optimization.test_results.control_performance - 1) * 100).toFixed(1)}%
                              {' '}with {optimization.test_results.statistical_significance}% confidence
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {optimization.status === 'pending' && (
                        <Button 
                          size="sm"
                          onClick={() => implementOptimization(optimization.id)}
                        >
                          Implement
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduling" className="space-y-4">
          <div className="space-y-4">
            {smartSchedules.map((schedule) => (
              <Card key={schedule.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{schedule.campaign_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Optimized for {schedule.recipient_segments} segments
                      </p>
                    </div>
                    <Badge variant={schedule.status === 'scheduled' ? 'secondary' : 'default'}>
                      {schedule.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Send Time:</span>
                      <div className="font-medium">
                        {new Date(schedule.optimal_send_time).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Predicted Engagement:</span>
                      <div className="font-medium text-green-600">
                        {schedule.predicted_engagement}%
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Timezone Opt:</span>
                      <div className="font-medium">
                        {schedule.timezone_optimization ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Frequency Cap:</span>
                      <div className="font-medium">{schedule.frequency_cap}/week</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="personalization" className="space-y-4">
          <div className="space-y-4">
            {personalizationRules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{rule.name}</h3>
                        <Switch 
                          checked={rule.is_active}
                          onCheckedChange={() => {
                            setPersonalizationRules(prev => prev.map(r => 
                              r.id === rule.id ? { ...r, is_active: !r.is_active } : r
                            ));
                          }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Trigger: {rule.trigger_condition}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span>
                          Fields: {rule.personalization_fields.join(', ')}
                        </span>
                        <span className="text-green-600 font-medium">
                          +{rule.performance_lift}% performance lift
                        </span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Optimization Settings</CardTitle>
              <CardDescription>
                Configure how the AI system optimizes your email campaigns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-implement optimizations</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically implement high-confidence optimizations
                  </p>
                </div>
                <Switch 
                  checked={aiSettings.auto_optimization}
                  onCheckedChange={(checked) => 
                    setAiSettings(prev => ({ ...prev, auto_optimization: checked }))
                  }
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Confidence Threshold (%)</Label>
                  <Input
                    type="number"
                    value={aiSettings.confidence_threshold}
                    onChange={(e) => 
                      setAiSettings(prev => ({ 
                        ...prev, 
                        confidence_threshold: parseInt(e.target.value) || 75 
                      }))
                    }
                    min="50"
                    max="99"
                  />
                </div>
                <div>
                  <Label>Test Duration (days)</Label>
                  <Input
                    type="number"
                    value={aiSettings.test_duration_days}
                    onChange={(e) => 
                      setAiSettings(prev => ({ 
                        ...prev, 
                        test_duration_days: parseInt(e.target.value) || 7 
                      }))
                    }
                    min="1"
                    max="30"
                  />
                </div>
                <div>
                  <Label>Min Sample Size</Label>
                  <Input
                    type="number"
                    value={aiSettings.min_sample_size}
                    onChange={(e) => 
                      setAiSettings(prev => ({ 
                        ...prev, 
                        min_sample_size: parseInt(e.target.value) || 1000 
                      }))
                    }
                    min="100"
                    max="10000"
                  />
                </div>
                <div>
                  <Label>Max Variants</Label>
                  <Input
                    type="number"
                    value={aiSettings.max_variants}
                    onChange={(e) => 
                      setAiSettings(prev => ({ 
                        ...prev, 
                        max_variants: parseInt(e.target.value) || 3 
                      }))
                    }
                    min="1"
                    max="5"
                  />
                </div>
              </div>
              
              <Button className="w-full">
                Save AI Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};