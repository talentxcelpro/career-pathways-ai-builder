import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface TestResult {
  template: string;
  success: boolean;
  messageId?: string;
  region?: string;
  attempts?: number;
  duration?: string;
  error?: string;
  timestamp: string;
}

export function EmailSystemTestComprehensive() {
  const [email, setEmail] = useState("talentxcelpro@gmail.com");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const { toast } = useToast();

  const emailTemplates = [
    { key: 'test_email', name: 'Test Email', icon: '🧪' },
    { key: 'welcome', name: 'Welcome Email', icon: '👋' },
    { key: 'profile_completion', name: 'Profile Completion', icon: '📝' },
    { key: 'job_match', name: 'Job Match', icon: '💼' }
  ];

  const sendTestEmail = async (templateKey: string, templateName: string) => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const startTime = Date.now();

    try {
      console.log(`📧 Testing ${templateName} template...`);

      const templateData: any = {
        event_name: templateKey,
        recipient_email: email,
        recipient_name: "Test User",
        platform_name: "TalentXcel"
      };

      // Add job match specific data
      if (templateKey === 'job_match') {
        templateData.data = {
          job_title: "Senior Software Engineer",
          company_name: "Tech Corp",
          location: "Remote"
        };
      }

      const { data, error } = await supabase.functions.invoke('send-email-notification', {
        body: templateData
      });

      const duration = Date.now() - startTime;

      if (error) {
        console.error(`❌ ${templateName} failed:`, error);
        
        const result: TestResult = {
          template: templateName,
          success: false,
          error: error.message,
          duration: `${duration}ms`,
          timestamp: new Date().toISOString()
        };
        
        setResults(prev => [result, ...prev]);
        
        toast({
          title: "❌ Email Failed",
          description: `${templateName}: ${error.message}`,
          variant: "destructive",
        });
      } else {
        console.log(`✅ ${templateName} sent successfully:`, data);
        
        const result: TestResult = {
          template: templateName,
          success: true,
          messageId: data.messageId,
          region: data.region,
          attempts: data.attempts,
          duration: data.duration || `${duration}ms`,
          timestamp: new Date().toISOString()
        };
        
        setResults(prev => [result, ...prev]);
        
        toast({
          title: "✅ Email Sent Successfully",
          description: `${templateName} sent to ${email}`,
        });
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`❌ ${templateName} exception:`, error);
      
      const result: TestResult = {
        template: templateName,
        success: false,
        error: error.message || 'Unknown error',
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      };
      
      setResults(prev => [result, ...prev]);
      
      toast({
        title: "❌ Error",
        description: `${templateName}: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testAllTemplates = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResults([]);

    for (const template of emailTemplates) {
      await sendTestEmail(template.key, template.name);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsLoading(false);
  };

  const processEmailQueue = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-email-queue');
      
      if (error) throw error;
      
      toast({
        title: "✅ Queue Processed",
        description: `Processed ${data?.processed || 0} emails`,
      });
    } catch (error: any) {
      toast({
        title: "❌ Queue Processing Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkSESHealth = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-email-notification', {
        body: {
          event_name: 'test_email',
          recipient_email: email,
          recipient_name: 'Health Check User',
          platform_name: 'TalentXcel'
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "✅ SES Health Check Passed",
        description: `Region: ${data.region}, Attempts: ${data.attempts}`,
      });
    } catch (error: any) {
      toast({
        title: "❌ SES Health Check Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">📧 Email System Testing</h2>
        <p className="text-muted-foreground mb-6">
          Comprehensive email testing with AWS SES integration, regional fallback, and delivery tracking.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Test Email Address</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="max-w-md"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {emailTemplates.map((template) => (
              <Button
                key={template.key}
                onClick={() => sendTestEmail(template.key, template.name)}
                disabled={isLoading || !email}
                variant="outline"
                className="h-auto py-4"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <span className="mr-2 text-lg">{template.icon}</span>
                )}
                <span className="text-sm">{template.name}</span>
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button
              onClick={testAllTemplates}
              disabled={isLoading || !email}
              className="flex-1 min-w-[200px]"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Test All Templates
            </Button>

            <Button
              onClick={processEmailQueue}
              disabled={isLoading}
              variant="secondary"
              className="flex-1 min-w-[200px]"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <AlertCircle className="h-4 w-4 mr-2" />
              )}
              Process Queue
            </Button>

            <Button
              onClick={checkSESHealth}
              disabled={isLoading || !email}
              variant="outline"
              className="flex-1 min-w-[200px]"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              SES Health Check
            </Button>
          </div>
        </div>
      </Card>

      {results.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">📊 Test Results</h3>
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.success
                    ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                    : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {result.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold">{result.template}</p>
                      {result.success ? (
                        <div className="text-sm text-muted-foreground space-y-1 mt-1">
                          <p>✓ Message ID: {result.messageId}</p>
                          <p>✓ Region: {result.region}</p>
                          <p>✓ Attempts: {result.attempts}</p>
                          <p>✓ Duration: {result.duration}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-red-600 mt-1">{result.error}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-blue-600" />
          System Information
        </h3>
        <ul className="text-sm space-y-2 text-muted-foreground">
          <li>• Primary Region: <strong>us-east-1</strong> (N. Virginia)</li>
          <li>• Fallback Region: <strong>us-west-2</strong> (Oregon)</li>
          <li>• Sender: <strong>noreply@talentxcel.in</strong></li>
          <li>• Regional failover: <strong>Automatic</strong></li>
          <li>• Template Engine: <strong>Built-in</strong></li>
          <li>• Queue Processing: <strong>Available</strong></li>
        </ul>
      </Card>
    </div>
  );
}
