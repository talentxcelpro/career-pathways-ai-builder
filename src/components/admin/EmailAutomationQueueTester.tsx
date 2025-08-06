import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Send, Clock, User } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  template_type: string;
  subject: string;
  content: string;
}

// Simplified template payloads for the new HTML template system
const templatePayloads = {
  profile_completion_reminder: {
    candidate_name: "Test User"
  },
  welcome: {
    candidate_name: "Test User"
  },
  job_opening: {
    candidate_name: "Test User",
    job_title: "Frontend Developer",
    company_name: "TechCorp",
    location: "Remote",
    salary_range: "₹8-12 LPA",
    requirements: ["React", "TypeScript", "JavaScript"]
  },
  career_map_ready: {
    candidate_name: "Test User"
  },
  resume_created: {
    candidate_name: "Test User"
  }
};

export const EmailAutomationQueueTester = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [recipientEmail, setRecipientEmail] = useState('talentxcelpro@gmail.com');
  const [recipientName, setRecipientName] = useState('Test User');
  const [customPayload, setCustomPayload] = useState('{}');
  const [loading, setLoading] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const { data, error } = await supabase
        .from('email_templates')
        .select('id, name, template_type, subject, content')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to load email templates",
        variant: "destructive"
      });
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleTemplateChange = (templateName: string) => {
    setSelectedTemplate(templateName);
    if (templatePayloads[templateName as keyof typeof templatePayloads]) {
      setCustomPayload(JSON.stringify(templatePayloads[templateName as keyof typeof templatePayloads], null, 2));
    } else {
      // Simplified default payload for HTML templates
      setCustomPayload(JSON.stringify({
        candidate_name: recipientName
      }, null, 2));
    }
  };

  const queueTestEmail = async () => {
    if (!selectedTemplate || !recipientEmail) {
      toast({
        title: "Error",
        description: "Please select a template and enter recipient email",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      let templateData;
      try {
        templateData = JSON.parse(customPayload);
      } catch (e) {
        throw new Error('Invalid JSON in template data');
      }

      // Update the candidate_name in template data
      templateData.candidate_name = recipientName;

      const { error } = await supabase
        .from('email_automation_queue')
        .insert([{
          recipient_email: recipientEmail,
          recipient_name: recipientName,
          trigger_type: selectedTemplate,
          template_data: templateData,
          status: 'pending',
          scheduled_at: new Date().toISOString()
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Email queued successfully! Template: ${selectedTemplate}`,
      });

      // Trigger the queue processor
      try {
        const { error: processError } = await supabase.functions.invoke('process-email-queue');
        
        if (processError) {
          console.error('Queue processor error:', processError);
          toast({
            title: "Warning", 
            description: "Email queued but processor may have issues. Check logs.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Processing",
            description: "Queue processor triggered successfully!",
          });
        }
      } catch (invokeError) {
        console.error('Error invoking queue processor:', invokeError);
        toast({
          title: "Info",
          description: "Email queued successfully. Processor will run automatically.",
        });
      }

    } catch (error: any) {
      console.error('Error queuing email:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to queue email",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Email Automation Queue Tester
        </CardTitle>
        <CardDescription>
          Test automated email templates with the queue system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="template">Email Template</Label>
          <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
            <SelectTrigger>
              <SelectValue placeholder={loadingTemplates ? "Loading templates..." : "Select an email template"} />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.template_type}>
                  {template.name} ({template.template_type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Recipient Email</Label>
            <Input
              id="email"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </div>
          <div>
            <Label htmlFor="name">Recipient Name</Label>
            <Input
              id="name"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Test User"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="payload">Template Data (JSON)</Label>
          <Textarea
            id="payload"
            value={customPayload}
            onChange={(e) => setCustomPayload(e.target.value)}
            placeholder="Template data in JSON format"
            rows={8}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground mt-1">
            For most templates, you only need {"{"} "candidate_name": "Name" {"}"} - HTML templates handle the rest!
          </p>
        </div>

        <Button 
          onClick={queueTestEmail} 
          disabled={loading}
          className="w-full flex items-center gap-2"
        >
          {loading ? (
            <>
              <Clock className="h-4 w-4 animate-spin" />
              Queuing Email...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Queue Test Email
            </>
          )}
        </Button>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">📋 How it works:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Select a template and customize the data</li>
            <li>• Email gets queued in the automation system</li>
            <li>• Queue processor renders HTML template with your data</li>
            <li>• Email is sent via SMTP to the recipient</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};