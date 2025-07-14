import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FlaskConical, 
  TrendingUp, 
  Play, 
  Pause, 
  CheckCircle,
  BarChart3,
  Target,
  Clock,
  Trophy
} from "lucide-react";
import { useResumeABTesting } from '@/hooks/useResumeABTesting';
import { formatDistanceToNow, format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface ABTestingPanelProps {
  resumeId: string;
  currentResumeData: any;
}

const TestCard = ({ 
  test, 
  onStatusUpdate, 
  onDelete 
}: {
  test: any;
  onStatusUpdate: (testId: string, status: any, winnerVariant?: 'a' | 'b') => void;
  onDelete: (testId: string) => void;
}) => {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800'
  };

  const statusIcons = {
    active: <Play className="h-3 w-3" />,
    paused: <Pause className="h-3 w-3" />,
    completed: <CheckCircle className="h-3 w-3" />
  };

  return (
    <Card className="relative">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="font-medium">{test.test_name}</h4>
            <p className="text-sm text-muted-foreground">
              Split: {(test.traffic_split * 100).toFixed(0)}% / {((1 - test.traffic_split) * 100).toFixed(0)}%
            </p>
          </div>
          <Badge className={`${statusColors[test.status]} flex items-center space-x-1`}>
            {statusIcons[test.status]}
            <span className="capitalize">{test.status}</span>
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium">Variant A</p>
            <p className="text-xs text-muted-foreground">Original</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-sm font-medium">Variant B</p>
            <p className="text-xs text-muted-foreground">Test</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span>Started {formatDistanceToNow(new Date(test.start_date), { addSuffix: true })}</span>
          {test.winner_variant && (
            <Badge variant="outline" className="text-green-600">
              <Trophy className="h-3 w-3 mr-1" />
              Winner: Variant {test.winner_variant.toUpperCase()}
            </Badge>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          {test.status === 'active' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onStatusUpdate(test.id, 'paused')}
            >
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </Button>
          )}
          {test.status === 'paused' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onStatusUpdate(test.id, 'active')}
            >
              <Play className="h-4 w-4 mr-1" />
              Resume
            </Button>
          )}
          {(test.status === 'active' || test.status === 'paused') && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onStatusUpdate(test.id, 'completed')}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const TestResults = ({ testId }: { testId: string }) => {
  const { useTestResults, calculateMetrics } = useResumeABTesting();
  const { data: results } = useTestResults(testId);
  
  if (!results) return null;
  
  const metrics = calculateMetrics(results);

  const chartData = [
    {
      name: 'Views',
      'Variant A': metrics.variant_a.views,
      'Variant B': metrics.variant_b.views
    },
    {
      name: 'Downloads',
      'Variant A': metrics.variant_a.downloads,
      'Variant B': metrics.variant_b.downloads
    },
    {
      name: 'Applications',
      'Variant A': metrics.variant_a.applications,
      'Variant B': metrics.variant_b.applications
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium text-blue-600 mb-3">Variant A (Original)</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Views</span>
                <span className="font-medium">{metrics.variant_a.views}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Downloads</span>
                <span className="font-medium">{metrics.variant_a.downloads}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Applications</span>
                <span className="font-medium">{metrics.variant_a.applications}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Conversion Rate</span>
                <span className="font-medium">{metrics.variant_a.conversionRate.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium text-purple-600 mb-3">Variant B (Test)</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Views</span>
                <span className="font-medium">{metrics.variant_b.views}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Downloads</span>
                <span className="font-medium">{metrics.variant_b.downloads}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Applications</span>
                <span className="font-medium">{metrics.variant_b.applications}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Conversion Rate</span>
                <span className="font-medium">{metrics.variant_b.conversionRate.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Variant A" fill="hsl(var(--primary))" />
                <Bar dataKey="Variant B" fill="hsl(var(--secondary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <h4 className="font-medium mb-2">Statistical Significance</h4>
            <div className="text-2xl font-bold mb-2">
              {metrics.significance.toFixed(1)}%
            </div>
            <Progress value={metrics.significance} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {metrics.significance > 95 ? 'Statistically significant' : 'Not yet significant'}
            </p>
            {metrics.recommendedWinner && (
              <Badge className="mt-2 bg-green-100 text-green-800">
                <Trophy className="h-3 w-3 mr-1" />
                Recommended Winner: Variant {metrics.recommendedWinner.toUpperCase()}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const ABTestingPanel = ({ resumeId, currentResumeData }: ABTestingPanelProps) => {
  const [testName, setTestName] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

  const {
    tests,
    isLoading,
    createTest,
    updateTestStatus,
    deleteTest,
    isCreating
  } = useResumeABTesting(resumeId);

  const handleCreateTest = () => {
    if (testName.trim() && currentResumeData) {
      // For demo, create a slightly modified version as variant B
      const variantB = {
        ...currentResumeData,
        personalInfo: {
          ...currentResumeData.personalInfo,
          summary: currentResumeData.personalInfo.summary + ' (Optimized version)'
        }
      };

      createTest({ 
        testName, 
        variantB,
        trafficSplit: 0.5 
      });
      setTestName('');
      setShowCreateDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-32 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">A/B Testing</h3>
          <p className="text-sm text-muted-foreground">
            Test different versions of your resume to optimize performance
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <FlaskConical className="h-4 w-4 mr-2" />
              Create Test
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create A/B Test</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Test Name</label>
                <Input
                  placeholder="e.g., Summary Optimization Test"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Test Setup</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  This will create a test between your current resume (Variant A) and 
                  an AI-optimized version (Variant B).
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 50/50 traffic split</li>
                  <li>• Automatic performance tracking</li>
                  <li>• Statistical significance calculation</li>
                </ul>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateTest} disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Test'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {tests && tests.length > 0 ? (
        <Tabs defaultValue="tests" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tests">Tests ({tests.length})</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="tests" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tests.map((test) => (
                <TestCard
                  key={test.id}
                  test={test}
                  onStatusUpdate={(testId, status, winnerVariant) => 
                    updateTestStatus({ testId, status, winnerVariant })
                  }
                  onDelete={deleteTest}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <div className="mb-4">
              <Select value={selectedTestId || ''} onValueChange={setSelectedTestId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a test to view results" />
                </SelectTrigger>
                <SelectContent>
                  {tests.map((test) => (
                    <SelectItem key={test.id} value={test.id}>
                      {test.test_name} ({test.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTestId && <TestResults testId={selectedTestId} />}
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h4 className="text-lg font-medium mb-2">No A/B Tests Yet</h4>
            <p className="text-muted-foreground mb-4">
              Start testing different versions of your resume to optimize performance
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <FlaskConical className="h-4 w-4 mr-2" />
              Create Your First Test
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};