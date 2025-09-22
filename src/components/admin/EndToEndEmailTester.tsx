import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  PlayCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail, 
  User, 
  Briefcase, 
  Star,
  AlertCircle,
  Activity
} from 'lucide-react';

interface TestScenario {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  enabled: boolean;
}

interface TestResult {
  scenario: string;
  status: 'success' | 'failed';
  message?: string;
  error?: string;
  [key: string]: any;
}

export const EndToEndEmailTester = () => {
  const [testEmail, setTestEmail] = useState('');
  const [testUserName, setTestUserName] = useState('');
  const [scenarios, setScenarios] = useState<TestScenario[]>([
    {
      id: 'user_registration',
      name: 'User Registration Flow',
      description: 'Test complete user registration and welcome email sequence',
      icon: User,
      enabled: true
    },
    {
      id: 'job_application',
      name: 'Job Application Flow',
      description: 'Test job application confirmation and employer notification emails',
      icon: Briefcase,
      enabled: true
    },
    {
      id: 'job_recommendations',
      name: 'Job Recommendations',
      description: 'Test personalized job recommendation emails with real job data',
      icon: Star,
      enabled: true
    },
    {
      id: 'profile_completion',
      name: 'Profile Completion Reminder',
      description: 'Test profile completion reminder with specific missing fields',
      icon: AlertCircle,
      enabled: true
    }
  ]);
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [testSummary, setTestSummary] = useState<any>(null);
  const { toast } = useToast();

  const toggleScenario = (scenarioId: string) => {
    setScenarios(prev => 
      prev.map(s => 
        s.id === scenarioId ? { ...s, enabled: !s.enabled } : s
      )
    );
  };

  const runEndToEndTest = async () => {
    if (!testEmail || !testUserName) {
      toast({
        title: "Missing Required Fields",
        description: "Please provide both test email and user name",
        variant: "destructive",
      });
      return;
    }

    const enabledScenarios = scenarios.filter(s => s.enabled).map(s => s.id);
    
    if (enabledScenarios.length === 0) {
      toast({
        title: "No Scenarios Selected",
        description: "Please select at least one test scenario",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    setResults([]);
    setTestSummary(null);

    try {
      console.log('🚀 Starting end-to-end email automation test...');
      
      toast({
        title: "🧪 Starting Tests",
        description: `Running ${enabledScenarios.length} email automation scenarios`,
      });

      const { data, error } = await supabase.functions.invoke('end-to-end-email-test', {
        body: {
          test_email: testEmail,
          test_user_name: testUserName,
          scenarios: enabledScenarios
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'End-to-end test failed');
      }

      setResults(data.results || []);
      setTestSummary(data.test_summary);

      const successCount = data.results?.filter((r: TestResult) => r.status === 'success').length || 0;
      const failureCount = data.results?.filter((r: TestResult) => r.status === 'failed').length || 0;

      if (failureCount === 0) {
        toast({
          title: "🎉 All Tests Passed!",
          description: `Successfully completed ${successCount} email automation scenarios. Check your email!`,
        });
      } else {
        toast({
          title: "⚠️ Some Tests Failed",
          description: `${successCount} passed, ${failureCount} failed. Check results below.`,
          variant: "destructive",
        });
      }

      console.log('End-to-end test results:', data);

    } catch (error: any) {
      console.error('End-to-end test failed:', error);
      toast({
        title: "❌ Test Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold">End-to-End Email Testing</h3>
        <p className="text-muted-foreground">
          Test complete email automation flows with real data and triggers
        </p>
      </div>

      {/* Test Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5" />
            Test Configuration
          </CardTitle>
          <CardDescription>
            Configure test parameters for comprehensive email automation testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="endToEndTestEmail">Test Email Address</Label>
              <Input
                id="endToEndTestEmail"
                type="email"
                placeholder="your-email@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                You'll receive test emails at this address
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endToEndTestUserName">Test User Name</Label>
              <Input
                id="endToEndTestUserName"
                placeholder="John Doe"
                value={testUserName}
                onChange={(e) => setTestUserName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Used in email personalization
              </p>
            </div>
          </div>

          {/* Scenario Selection */}
          <div className="space-y-3">
            <h4 className="font-medium">Test Scenarios</h4>
            <div className="grid gap-3 md:grid-cols-2">
              {scenarios.map((scenario) => {
                const IconComponent = scenario.icon;
                return (
                  <div key={scenario.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={scenario.id}
                      checked={scenario.enabled}
                      onCheckedChange={() => toggleScenario(scenario.id)}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        <label htmlFor={scenario.id} className="font-medium text-sm cursor-pointer">
                          {scenario.name}
                        </label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {scenario.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Button 
            onClick={runEndToEndTest} 
            disabled={testing || !testEmail || !testUserName}
            className="w-full"
            size="lg"
          >
            {testing ? (
              <>
                <Activity className="h-4 w-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                Run End-to-End Tests
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Test Summary */}
      {testSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Test Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{testSummary.total_scenarios}</div>
                <p className="text-sm text-muted-foreground">Total Scenarios</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{testSummary.successful}</div>
                <p className="text-sm text-muted-foreground">Successful</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{testSummary.failed}</div>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{testSummary.success_rate}%</div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Detailed results for each test scenario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => {
                const scenario = scenarios.find(s => s.id === result.scenario);
                const IconComponent = scenario?.icon || Mail;
                
                return (
                  <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{scenario?.name || result.scenario}</h4>
                        <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                          {result.status}
                        </Badge>
                      </div>
                      {result.message && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {result.message}
                        </p>
                      )}
                      {result.error && (
                        <Alert className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{result.error}</AlertDescription>
                        </Alert>
                      )}
                      {result.job_title && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Job: {result.job_title}
                        </p>
                      )}
                      {result.jobs_count && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Recommended Jobs: {result.jobs_count}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Alert>
        <Mail className="h-4 w-4" />
        <AlertDescription>
          <strong>After running tests:</strong>
          <br />
          1. Check your email inbox for test messages
          <br />
          2. Verify email delivery in AWS SES console
          <br />
          3. Monitor the email_automation_queue for processing status
          <br />
          4. Check email_delivery_tracking for delivery confirmations
        </AlertDescription>
      </Alert>
    </div>
  );
};