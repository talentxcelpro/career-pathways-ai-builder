import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EndToEndEmailTester } from './EndToEndEmailTester';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Play, 
  Users, 
  Briefcase, 
  Mail, 
  Building,
  Clock,
  Eye,
  Plus,
  TestTube,
  Activity
} from 'lucide-react';

interface DataQuality {
  profiles: {
    total: number;
    valid_emails: number;
    mock_emails: number;
    mock_names: number;
  };
  applications: {
    total: number;
    with_email: number;
    mock_emails: number;
  };
  companies: {
    total: number;
    valid: number;
    mock: number;
  };
  email_triggers: Array<{
    trigger_type: string;
    email_count: number;
    mock_recipients: number;
    successful_sends: number;
  }>;
}

interface TestScenario {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  test_data: any;
  status: 'pending' | 'running' | 'success' | 'failed';
  result?: any;
  error?: string;
}

export const RealDataEmailTester = () => {
  const [dataQuality, setDataQuality] = useState<DataQuality | null>(null);
  const [testScenarios, setTestScenarios] = useState<TestScenario[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [testEmail, setTestEmail] = useState('');
  const [testUserName, setTestUserName] = useState('');
  const { toast } = useToast();

  const defaultScenarios: TestScenario[] = [
    {
      id: 'welcome_email',
      name: 'Welcome Email Flow',
      description: 'Test welcome email when new user registers',
      trigger_type: 'welcome_email',
      test_data: {},
      status: 'pending'
    },
    {
      id: 'profile_completion',
      name: 'Profile Completion Reminder',
      description: 'Test profile completion reminder for incomplete profiles',
      trigger_type: 'profile_completion_reminder',
      test_data: { completion_percentage: 45 },
      status: 'pending'
    },
    {
      id: 'job_application',
      name: 'Job Application Confirmation',
      description: 'Test job application confirmation email',
      trigger_type: 'application_confirmation',
      test_data: { 
        job_title: 'Senior Software Engineer',
        company_name: 'TalentXcel Services',
        application_date: new Date().toISOString()
      },
      status: 'pending'
    },
    {
      id: 'job_recommendation',
      name: 'Job Recommendation Email',
      description: 'Test personalized job recommendation email',
      trigger_type: 'job_recommendation',
      test_data: {
        job_count: 5,
        top_job_title: 'Software Engineer',
        match_score: 85
      },
      status: 'pending'
    },
    {
      id: 'daily_digest',
      name: 'Daily Job Digest',
      description: 'Test daily job digest with new opportunities',
      trigger_type: 'daily_job_digest',
      test_data: {
        job_count: 12,
        featured_jobs: ['React Developer', 'Node.js Engineer', 'Full Stack Developer']
      },
      status: 'pending'
    }
  ];

  const loadDataQuality = async () => {
    setLoading(true);
    try {
      console.log('🔍 Analyzing data quality...');

      // Get profiles data quality
      const { data: profilesData } = await supabase
        .rpc('validate_user_input', { 
          input_text: 'dummy', 
          input_type: 'general' 
        })
        .then(() => supabase
          .from('profiles')
          .select('email, full_name')
          .limit(1000)
        );

      // Get job applications data quality  
      const { data: applicationsData } = await supabase
        .from('job_applications')
        .select('application_data')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .limit(100);

      // Get companies data quality
      const { data: companiesData } = await supabase
        .from('companies')
        .select('name')
        .limit(100);

      // Get email trigger stats
      const { data: triggerData } = await supabase
        .from('email_automation_queue')
        .select('trigger_type, recipient_email, status')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Analyze data quality
      const profiles = {
        total: profilesData?.length || 0,
        valid_emails: profilesData?.filter(p => 
          p.email && /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(p.email)
        ).length || 0,
        mock_emails: profilesData?.filter(p => 
          p.email && (p.email.includes('@test.com') || p.email.includes('@example.com'))
        ).length || 0,
        mock_names: profilesData?.filter(p => 
          p.full_name && (p.full_name.includes('Test User') || p.full_name === 'Candidate')
        ).length || 0
      };

      const applications = {
        total: applicationsData?.length || 0,
        with_email: applicationsData?.filter(a => a.application_data?.email).length || 0,
        mock_emails: applicationsData?.filter(a => 
          a.application_data?.email && 
          (a.application_data.email.includes('@test.com') || a.application_data.email.includes('@example.com'))
        ).length || 0
      };

      const companies = {
        total: companiesData?.length || 0,
        valid: companiesData?.filter(c => c.name && c.name.length > 2).length || 0,
        mock: companiesData?.filter(c => 
          c.name && (c.name.includes('Test') || c.name.includes('Example'))
        ).length || 0
      };

      // Group trigger data
      const triggerStats = triggerData?.reduce((acc: any, email: any) => {
        const type = email.trigger_type;
        if (!acc[type]) {
          acc[type] = { 
            trigger_type: type, 
            email_count: 0, 
            mock_recipients: 0, 
            successful_sends: 0 
          };
        }
        acc[type].email_count++;
        if (email.recipient_email?.includes('@test.com') || email.recipient_email?.includes('@example.com')) {
          acc[type].mock_recipients++;
        }
        if (email.status === 'sent') {
          acc[type].successful_sends++;
        }
        return acc;
      }, {}) || {};

      const email_triggers = Object.values(triggerStats) as any[];

      setDataQuality({
        profiles,
        applications,
        companies,
        email_triggers
      });

      console.log('Data quality analysis complete:', { profiles, applications, companies, email_triggers });

    } catch (error: any) {
      console.error('Data quality analysis failed:', error);
      toast({
        title: "❌ Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const runTestScenario = async (scenarioId: string) => {
    if (!testEmail || !testUserName) {
      toast({
        title: "Missing Test Data",
        description: "Please provide test email and user name",
        variant: "destructive",
      });
      return;
    }

    setTestScenarios(prev => 
      prev.map(s => s.id === scenarioId ? { ...s, status: 'running' } : s)
    );

    try {
      const scenario = testScenarios.find(s => s.id === scenarioId);
      if (!scenario) return;

      console.log(`🧪 Running test scenario: ${scenario.name}`);

      // Prepare test data
      const emailData = {
        event_name: scenario.trigger_type,
        recipient_email: testEmail,
        recipient_name: testUserName,
        ...scenario.test_data,
        platform_name: 'TalentXcel',
        support_email: 'support@talentxcel.in',
        current_year: new Date().getFullYear().toString(),
        current_date: new Date().toLocaleDateString(),
        test_mode: true
      };

      console.log('Sending test email with data:', emailData);

      // Send test email via unified service
      const { data, error } = await supabase.functions.invoke('send-email-notification', {
        body: emailData
      });

      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || 'Email test failed');
      }

      // Update scenario status
      setTestScenarios(prev => 
        prev.map(s => s.id === scenarioId ? { 
          ...s, 
          status: 'success',
          result: data
        } : s)
      );

      toast({
        title: "✅ Test Successful",
        description: `${scenario.name} email sent successfully to ${testEmail}`,
      });

      console.log(`Test scenario ${scenario.name} completed successfully:`, data);

    } catch (error: any) {
      console.error(`Test scenario ${scenarioId} failed:`, error);
      
      setTestScenarios(prev => 
        prev.map(s => s.id === scenarioId ? { 
          ...s, 
          status: 'failed',
          error: error.message
        } : s)
      );

      toast({
        title: "❌ Test Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const runAllTests = async () => {
    if (!testEmail || !testUserName) {
      toast({
        title: "Missing Test Data",
        description: "Please provide test email and user name",
        variant: "destructive",
      });
      return;
    }

    console.log('🚀 Running all email automation tests...');
    
    for (const scenario of testScenarios) {
      await runTestScenario(scenario.id);
      // Wait 2 seconds between tests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    toast({
      title: "🎉 All Tests Complete",
      description: "Check your email for test messages",
    });
  };

  const getDataQualityScore = () => {
    if (!dataQuality) return 0;
    
    const profileScore = dataQuality.profiles.total > 0 ? 
      (dataQuality.profiles.valid_emails / dataQuality.profiles.total) * 100 : 0;
    
    const applicationScore = dataQuality.applications.total > 0 ? 
      (dataQuality.applications.with_email / dataQuality.applications.total) * 100 : 0;
    
    const companyScore = dataQuality.companies.total > 0 ? 
      (dataQuality.companies.valid / dataQuality.companies.total) * 100 : 0;

    return Math.round((profileScore + applicationScore + companyScore) / 3);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running': return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      default: return <Eye className="h-5 w-5 text-gray-500" />;
    }
  };

  useEffect(() => {
    loadDataQuality();
    setTestScenarios(defaultScenarios);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Real Data Email Testing</h2>
          <p className="text-muted-foreground">Phase 2: Validate email automation with real data</p>
        </div>
        <Button onClick={loadDataQuality} disabled={loading} variant="outline">
          <Activity className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Analyzing...' : 'Refresh Analysis'}
        </Button>
      </div>

      <Tabs defaultValue="quality" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quality">Data Quality</TabsTrigger>
          <TabsTrigger value="testing">Email Testing</TabsTrigger>
          <TabsTrigger value="endtoend">End-to-End Tests</TabsTrigger>
          <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="quality" className="space-y-4">
          {/* Data Quality Overview */}
          {dataQuality && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Data Quality Score: {getDataQualityScore()}%
                </CardTitle>
                <CardDescription>
                  Analysis of real vs mock data in your system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Profiles Quality */}
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      User Profiles
                    </h4>
                    <div className="text-2xl font-bold text-green-500">
                      {dataQuality.profiles.valid_emails}/{dataQuality.profiles.total}
                    </div>
                    <p className="text-sm text-muted-foreground">Valid email addresses</p>
                    {dataQuality.profiles.mock_emails > 0 && (
                      <Badge variant="destructive">
                        {dataQuality.profiles.mock_emails} mock emails
                      </Badge>
                    )}
                  </div>

                  {/* Applications Quality */}
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Job Applications
                    </h4>
                    <div className="text-2xl font-bold text-blue-500">
                      {dataQuality.applications.with_email}/{dataQuality.applications.total}
                    </div>
                    <p className="text-sm text-muted-foreground">Applications with emails</p>
                    {dataQuality.applications.mock_emails > 0 && (
                      <Badge variant="destructive">
                        {dataQuality.applications.mock_emails} mock emails
                      </Badge>
                    )}
                  </div>

                  {/* Companies Quality */}
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Companies
                    </h4>
                    <div className="text-2xl font-bold text-purple-500">
                      {dataQuality.companies.valid}/{dataQuality.companies.total}
                    </div>
                    <p className="text-sm text-muted-foreground">Valid company names</p>
                    {dataQuality.companies.mock > 0 && (
                      <Badge variant="destructive">
                        {dataQuality.companies.mock} mock companies
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Email Trigger Statistics */}
          {dataQuality && dataQuality.email_triggers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Email Trigger Performance (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dataQuality.email_triggers.map((trigger, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{trigger.trigger_type.replace(/_/g, ' ').toUpperCase()}</div>
                        <div className="text-sm text-muted-foreground">
                          {trigger.email_count} emails • {trigger.successful_sends} sent successfully
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={trigger.successful_sends === trigger.email_count ? "default" : "destructive"}>
                          {Math.round((trigger.successful_sends / trigger.email_count) * 100)}% success
                        </Badge>
                        {trigger.mock_recipients > 0 && (
                          <Badge variant="outline">
                            {trigger.mock_recipients} mock
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          {/* Test Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Test Configuration</CardTitle>
              <CardDescription>
                Set up test parameters for email automation testing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="testEmail">Test Email Address</Label>
                  <Input
                    id="testEmail"
                    type="email"
                    placeholder="your-email@example.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="testUserName">Test User Name</Label>
                  <Input
                    id="testUserName"
                    placeholder="John Doe"
                    value={testUserName}
                    onChange={(e) => setTestUserName(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={runAllTests} disabled={!testEmail || !testUserName}>
                  <TestTube className="h-4 w-4 mr-2" />
                  Run All Tests
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Test Scenarios */}
          <div className="grid gap-4 md:grid-cols-2">
            {testScenarios.map((scenario) => (
              <Card key={scenario.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {getStatusIcon(scenario.status)}
                      {scenario.name}
                    </span>
                    <Badge variant={scenario.status === 'success' ? 'default' : 'outline'}>
                      {scenario.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{scenario.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {scenario.error && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{scenario.error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button
                    onClick={() => runTestScenario(scenario.id)}
                    disabled={scenario.status === 'running' || !testEmail || !testUserName}
                    variant="outline"
                    className="w-full"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Run Test
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="endtoend" className="space-y-4">
          <EndToEndEmailTester />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Email Monitoring</CardTitle>
              <CardDescription>
                Real-time monitoring of email automation system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  Monitor email delivery in real-time. Check SES dashboard for bounce and complaint handling.
                </AlertDescription>
              </Alert>
              
              <div className="mt-4 space-y-2">
                <Button variant="outline" asChild>
                  <a href="https://console.aws.amazon.com/ses" target="_blank" rel="noopener noreferrer">
                    Open AWS SES Console
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};