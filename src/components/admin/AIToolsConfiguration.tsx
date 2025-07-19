
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Settings, 
  TestTube, 
  Edit, 
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAIService } from '@/hooks/useAIService';
import { toast } from 'sonner';

interface AITool {
  id: string;
  name: string;
  slug: string;
  category: string;
  isEnabled: boolean;
  usageCount: number;
  successRate: number;
  avgResponseTime: number;
  costPerRequest: number;
  rateLimit: number;
}

export const AIToolsConfiguration = () => {
  const { invokeAITool, isProcessing } = useAIService();
  const [tools, setTools] = useState<AITool[]>([
    {
      id: '1',
      name: 'Resume Enhancement',
      slug: 'resume-enhancer',
      category: 'Resume',
      isEnabled: true,
      usageCount: 1250,
      successRate: 97.8,
      avgResponseTime: 2100,
      costPerRequest: 0.02,
      rateLimit: 50
    },
    {
      id: '2',
      name: 'ATS Optimizer',
      slug: 'ats-optimizer',
      category: 'Resume',
      isEnabled: true,
      usageCount: 890,
      successRate: 95.2,
      avgResponseTime: 1800,
      costPerRequest: 0.015,
      rateLimit: 30
    },
    {
      id: '3',
      name: 'Career Advisor',
      slug: 'career-advisor',
      category: 'Career',
      isEnabled: true,
      usageCount: 567,
      successRate: 98.1,
      avgResponseTime: 2500,
      costPerRequest: 0.025,
      rateLimit: 20
    },
    {
      id: '4',
      name: 'Salary Analyzer',
      slug: 'salary-analyzer',
      category: 'Salary',
      isEnabled: true,
      usageCount: 234,
      successRate: 96.7,
      avgResponseTime: 1500,
      costPerRequest: 0.01,
      rateLimit: 40
    }
  ]);

  const handleToggleTool = (toolId: string) => {
    setTools(prev => prev.map(tool => 
      tool.id === toolId 
        ? { ...tool, isEnabled: !tool.isEnabled }
        : tool
    ));
    toast.success('Tool configuration updated');
  };

  const handleQuickTest = async (tool: AITool) => {
    console.log(`Testing ${tool.slug}...`);
    
    const testData = {
      'resume-enhancer': {
        summary: 'Test software developer',
        experience: 'Test experience',
        skills: 'JavaScript, React'
      },
      'ats-optimizer': {
        resumeContent: { summary: 'Test resume' },
        jobDescription: 'Test job description'
      },
      'career-advisor': {
        userProfile: { currentRole: 'Developer', experience: 2 },
        targetRole: 'Senior Developer'
      },
      'salary-analyzer': {
        role: 'Software Engineer',
        location: 'San Francisco',
        experience: 3
      }
    };

    const result = await invokeAITool({
      toolSlug: tool.slug,
      inputData: testData[tool.slug as keyof typeof testData] || {},
      category: 'test'
    });

    if (result.success) {
      toast.success(`${tool.name} test passed!`);
    } else {
      toast.error(`${tool.name} test failed: ${result.error}`);
    }
  };

  const getStatusBadge = (tool: AITool) => {
    if (!tool.isEnabled) return <Badge variant="secondary">Disabled</Badge>;
    if (tool.successRate >= 95) return <Badge variant="default">Healthy</Badge>;
    if (tool.successRate >= 90) return <Badge variant="outline">Warning</Badge>;
    return <Badge variant="destructive">Critical</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Tools Configuration</h2>
          <p className="text-muted-foreground">
            Manage and configure AI tools across the platform
          </p>
        </div>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Global Settings
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active AI Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tool</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Avg Response</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tools.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{tool.name}</p>
                      <p className="text-sm text-muted-foreground">{tool.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{tool.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={tool.isEnabled}
                        onCheckedChange={() => handleToggleTool(tool.id)}
                      />
                      {getStatusBadge(tool)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{tool.usageCount.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {tool.successRate >= 95 ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className="text-sm">{tool.successRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{tool.avgResponseTime}ms</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleQuickTest(tool)}
                        disabled={isProcessing || !tool.isEnabled}
                      >
                        <TestTube className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <TrendingUp className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Rate Limiting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Global Rate Limit (requests/hour)</Label>
              <Input type="number" defaultValue="1000" />
            </div>
            <div className="space-y-2">
              <Label>Per User Limit (requests/hour)</Label>
              <Input type="number" defaultValue="50" />
            </div>
            <div className="space-y-2">
              <Label>Premium User Limit (requests/hour)</Label>
              <Input type="number" defaultValue="200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Daily Budget ($)</Label>
              <Input type="number" defaultValue="100" />
            </div>
            <div className="space-y-2">
              <Label>Alert Threshold (%)</Label>
              <Input type="number" defaultValue="80" />
            </div>
            <div className="flex items-center space-x-2">
              <Switch defaultChecked />
              <Label>Auto-disable on budget exceeded</Label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
