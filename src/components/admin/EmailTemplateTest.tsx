import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const EmailTemplateTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [htmlContent, setHtmlContent] = useState<string>(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><title>Complete Your TalentXcel Profile to Unlock All Features</title><meta name="viewport" content="width=device-width, initial-scale=1.0" /><style>body{margin:0;padding:0;background-color:#f3f4f6;font-family:'Segoe UI','Helvetica Neue',sans-serif;color:#1a1a1a}.container{max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.05)}.header{background:linear-gradient(to right,#1e3a8a,#2563eb);padding:24px;text-align:center;color:#ffffff}.logo{font-size:24px;font-weight:bold;text-decoration:none;display:block;color:#ffffff}.logo span{color:#facc15}.subheader{font-size:14px;margin-top:6px;color:#e0e7ff}.body{padding:32px 24px}.body p{font-size:15px;line-height:1.6;margin-bottom:16px}.body ul{padding-left:20px;margin-bottom:24px}.body ul li{margin-bottom:10px}.cta{text-align:center;margin-top:20px}.cta a{background-color:#1e40af;color:white;text-decoration:none;padding:14px 28px;font-weight:bold;border-radius:6px;display:inline-block}.footer{padding:20px;background-color:#f1f5f9;font-size:12px;text-align:center;color:#6b7280}.footer a{color:#2563eb;margin:0 6px;text-decoration:none}@media (prefers-color-scheme: dark){body{background-color:#111827;color:#f3f4f6}.container{background-color:#1f2937}.header{background:#1e3a8a}.footer{background-color:#111827;color:#9ca3af}}</style></head><body><div class="container"><div class="header"><a href="https://talentxcel.in" class="logo">Talent<span>Xcel</span></a><h2 style="margin:10px 0;">Complete Your Profile</h2><div class="subheader">Unlock better job opportunities</div></div><div class="body"><p>Hi {{candidate_name}},</p><p>Your profile is almost ready! Complete it now to get better job matches and stand out to employers.</p><p><strong>Why complete your profile?</strong></p><ul><li>✅ Get 3x more job matches</li><li>✅ Increase visibility to recruiters</li><li>✅ Access exclusive opportunities</li><li>✅ Show your professional skills</li></ul><div class="cta"><a href="https://talentxcel.in">✨ Complete My Profile</a></div><p style="font-size:13px;color:#6b7280;text-align:center;margin-top:40px">This email was sent automatically by TalentXcel. Please do not reply.</p></div><div class="footer">© 2025 TalentXcel Services | <a href="https://talentxcel.in">talentxcel.in</a><br><div style="margin-top:10px"><a href="https://talentxcel.in/network">Network</a> <a href="https://talentxcel.in/jobs">Jobs</a> <a href="https://talentxcel.in/employer">Employer</a> <a href="https://talentxcel.in/companies">Companies</a> <a href="https://talentxcel.in/resume">Resume Builder</a> <a href="https://talentxcel.in/tools">Tools</a> <a href="https://talentxcel.in/services">Services</a> <a href="https://talentxcel.in/learning">Learning</a> <a href="https://talentxcel.in/colleges">Colleges</a> <a href="https://talentxcel.in/career-map">Career Map</a></div></div></div></body></html>`);
  const [nameOverride, setNameOverride] = useState<string>('Hello');


  const testEmails = [
    { email: "arsh.wani@gmail.com", name: "Arsh Wani" },
    { email: "Talenxcelpro@gmail.com", name: "TalentXcel Pro" }
  ];

  const sendTestEmail = async (email: string, name: string, useHtml = false) => {
    try {
      const payload = useHtml
        ? {
            to: email,
            subject: 'Complete Your TalentXcel Profile to Unlock All Features',
            html: htmlContent,
            templateData: { candidate_name: name || nameOverride },
            provider: 'ses',
            priority: 'normal'
          }
        : {
            to: email,
            subject: 'Complete Your TalentXcel Profile to Unlock All Features',
            template: 'profile_completion_reminder',
            templateData: { candidate_name: name },
            provider: 'ses',
            priority: 'normal'
          };

      const { data, error } = await supabase.functions.invoke('unified-email-service', {
        body: payload
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
          <h4 className="font-medium">Send Generic HTML (SES API)</h4>
          <textarea
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            className="w-full h-40 text-xs font-mono border rounded p-2"
            placeholder="Paste full HTML here"
          />
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={nameOverride}
              onChange={(e) => setNameOverride(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
              placeholder="candidate_name override"
            />
            <Button 
              onClick={async () => {
                setIsLoading(true);
                for (const t of testEmails) {
                  try { await sendTestEmail(t.email, t.name, true); } catch {}
                  await new Promise(r => setTimeout(r, 500));
                }
                setIsLoading(false);
                toast({ title: 'Sent generic HTML via SES' });
              }}
              disabled={isLoading}
              className=""
            >
              {isLoading ? 'Sending...' : 'Send Generic HTML via SES'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Uses unified-email-service with provider: 'ses' and your full HTML. Tokens like {'{{candidate_name}}'} are replaced.
          </p>
        </div>

      </CardContent>
    </Card>
  );
};

export default EmailTemplateTest;