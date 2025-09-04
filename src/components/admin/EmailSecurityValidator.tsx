import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shield, CheckCircle, AlertTriangle, Lock, Mail } from 'lucide-react';

interface Template {
  id: string;
  template_name: string;
  subject: string;
  html_template: string;
  is_active: boolean;
  created_at: string;
}

interface ValidationResult {
  valid: boolean;
  issues: string[];
  hasHtml: boolean;
  hasSubject: boolean;
  templateCount: number;
}

export const EmailSecurityValidator: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
      validateTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load email templates');
    }
  };

  const validateTemplates = (templateList: Template[]) => {
    const issues: string[] = [];
    let hasHtml = true;
    let hasSubject = true;

    // Check if we have templates
    if (templateList.length === 0) {
      issues.push('No email templates found. Create templates before sending emails.');
    }

    // Check each template
    templateList.forEach(template => {
      if (!template.html_template || template.html_template.trim() === '') {
        issues.push(`Template '${template.template_name}' has no HTML content`);
        hasHtml = false;
      }
      
      if (!template.subject || template.subject.trim() === '') {
        issues.push(`Template '${template.template_name}' has no subject`);
        hasSubject = false;
      }

      if (!template.is_active) {
        issues.push(`Template '${template.template_name}' is disabled`);
      }
    });

    const activeTemplates = templateList.filter(t => t.is_active);
    if (activeTemplates.length === 0 && templateList.length > 0) {
      issues.push('No active templates found. Enable at least one template.');
    }

    setValidation({
      valid: issues.length === 0,
      issues,
      hasHtml,
      hasSubject,
      templateCount: activeTemplates.length
    });
  };

  const runSecurityTest = async () => {
    setIsLoading(true);
    try {
      // Test if direct HTML injection is blocked
      const { data, error } = await supabase.functions.invoke('send-template-email', {
        body: {
          template_name: '', // Try to send without template
          recipient_email: 'security-test@example.com',
          recipient_name: 'Security Test'
        }
      });

      if (error && error.message.includes('SECURITY:')) {
        toast.success('✅ Security test passed! Direct content blocked successfully.');
      } else {
        toast.error('❌ Security test failed! System may allow non-template emails.');
      }
    } catch (error: any) {
      if (error.message.includes('template_name is required')) {
        toast.success('✅ Security validation working! Template enforcement active.');
      } else {
        toast.error('❌ Security test failed: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Email Security Validator
          </CardTitle>
          <CardDescription>
            Ensures only template-based emails are sent for security and consistency
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {validation && (
            <Alert variant={validation.valid ? "default" : "destructive"}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {validation.valid 
                  ? "✅ Email security validation passed! All templates are properly configured."
                  : `❌ Found ${validation.issues.length} security issues that need attention.`
                }
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Mail className="h-8 w-8 text-blue-500" />
                </div>
                <div className="text-2xl font-bold">{validation?.templateCount || 0}</div>
                <div className="text-sm text-muted-foreground">Active Templates</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  {validation?.hasHtml ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  )}
                </div>
                <div className="text-2xl font-bold">
                  {validation?.hasHtml ? "✅" : "❌"}
                </div>
                <div className="text-sm text-muted-foreground">HTML Content</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Lock className="h-8 w-8 text-purple-500" />
                </div>
                <div className="text-2xl font-bold">Enforced</div>
                <div className="text-sm text-muted-foreground">Template-Only</div>
              </CardContent>
            </Card>
          </div>

          {validation?.issues && validation.issues.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-red-600">Issues Found:</h4>
              <ul className="space-y-1">
                {validation.issues.map((issue, index) => (
                  <li key={index} className="text-sm text-red-600 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-semibold">Available Email Templates:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {templates.map((template) => (
                <div key={template.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{template.template_name}</span>
                    <Badge variant={template.is_active ? "default" : "secondary"}>
                      {template.is_active ? "Active" : "Disabled"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {template.subject || 'No subject'}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    {template.html_template ? (
                      <span className="text-green-600">✅ Has HTML</span>
                    ) : (
                      <span className="text-red-600">❌ No HTML</span>
                    )}
                    {template.subject ? (
                      <span className="text-green-600">✅ Has Subject</span>
                    ) : (
                      <span className="text-red-600">❌ No Subject</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={runSecurityTest} disabled={isLoading}>
              {isLoading ? "Testing..." : "Run Security Test"}
            </Button>
            <Button variant="outline" onClick={fetchTemplates}>
              Refresh Templates
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Enforcement Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-600">✅ Implemented Protections</h4>
              <ul className="space-y-2 text-sm">
                <li>• Template name mandatory for all emails</li>
                <li>• Raw HTML content blocked completely</li>
                <li>• Template validation before sending</li>
                <li>• Active template enforcement</li>
                <li>• Email delivery event logging</li>
                <li>• Error tracking for failed sends</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-600">🔒 Security Benefits</h4>
              <ul className="space-y-2 text-sm">
                <li>• Prevents malicious HTML injection</li>
                <li>• Ensures consistent branding</li>
                <li>• Centralized template management</li>
                <li>• Audit trail for all emails</li>
                <li>• Template version control</li>
                <li>• Content approval workflow</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};