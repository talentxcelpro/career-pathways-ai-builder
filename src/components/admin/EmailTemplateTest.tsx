import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const EmailTemplateTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const testEmails = [
    { email: "arsh.wani@gmail.com", name: "Arsh Wani" },
    { email: "Talenxcelpro@gmail.com", name: "TalentXcel Pro" }
  ];

  const sendTestEmail = async (email: string, name: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('unified-email-service', {
        body: {
          to: email,
          subject: 'Complete Your TalentXcel Profile to Unlock All Features',
          template: 'profile_completion_reminder',
          templateData: {
            candidate_name: name
          },
          provider: 'ses', // Use Amazon SES
          priority: 'normal'
        }
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error('Email send error:', error);
      throw error;
    }
  };

  const handleSendTestEmails = async () => {
    setIsLoading(true);
    let successCount = 0;
    let errors: string[] = [];

    try {
      for (const testEmail of testEmails) {
        try {
          await sendTestEmail(testEmail.email, testEmail.name);
          successCount++;
          
          toast({
            title: "Email Sent Successfully",
            description: `Profile completion reminder sent to ${testEmail.email}`,
          });
        } catch (error: any) {
          errors.push(`${testEmail.email}: ${error.message}`);
          
          toast({
            title: "Email Send Failed",
            description: `Failed to send email to ${testEmail.email}: ${error.message}`,
            variant: "destructive",
          });
        }

        // Add small delay between emails
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (successCount > 0) {
        toast({
          title: "Test Complete",
          description: `Successfully sent ${successCount} out of ${testEmails.length} emails`,
        });
      }

      if (errors.length > 0) {
        console.error('Email errors:', errors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Completion Email Test</CardTitle>
        <CardDescription>
          Test the TalentXcel profile completion reminder template
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium">Test Recipients:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            {testEmails.map((email, index) => (
              <li key={index}>{email.email} (as {email.name})</li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Template Features:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Beautiful TalentXcel branding with logo</li>
            <li>Professional blue gradient header</li>
            <li>Dynamic candidate name replacement</li>
            <li>Responsive design with dark mode support</li>
            <li>Call-to-action button to complete profile</li>
            <li>Full footer with all TalentXcel links</li>
          </ul>
        </div>

        <Button 
          onClick={handleSendTestEmails}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Sending Test Emails..." : "Send Test Emails via Amazon SES"}
        </Button>

        <p className="text-xs text-muted-foreground">
          This will send the profile completion reminder using your beautiful HTML template 
          with Amazon SES SMTP configuration.
        </p>
      </CardContent>
    </Card>
  );
};

export default EmailTemplateTest;