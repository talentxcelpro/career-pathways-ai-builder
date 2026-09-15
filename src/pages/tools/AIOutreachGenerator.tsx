import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToolsData } from '@/hooks/useToolsData';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Send, 
  Copy,
  Save,
  Download,
  MessageSquare,
  Mail,
  Linkedin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AIOutreachGenerator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logToolUsage, updateToolUsage, saveToolResult } = useToolsData();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [usageId, setUsageId] = useState<string | null>(null);
  const [generatedMessages, setGeneratedMessages] = useState<any>(null);
  
  // Form inputs
  const [recipientName, setRecipientName] = useState('');
  const [recipientCompany, setRecipientCompany] = useState('');
  const [recipientRole, setRecipientRole] = useState('');
  const [outreachPurpose, setOutreachPurpose] = useState('');
  const [messageType, setMessageType] = useState('linkedin');
  const [tone, setTone] = useState('professional');

  useEffect(() => {
    if (user) {
      const usage = logToolUsage('ai-outreach-generator', 'AI Outreach Generator');
      usage.then(data => data && setUsageId(data.id));
    }
  }, [user]);

  const handleGenerate = async () => {
    if (!user) {
      toast.error('Please log in to generate outreach messages');
      return;
    }

    if (!recipientName || !outreachPurpose) {
      toast.error('Please fill in recipient name and outreach purpose');
      return;
    }

    setIsGenerating(true);

    try {
      // Get user profile for personalization
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Generate personalized outreach messages
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('ai-tools', {
        body: {
          type: 'outreach-generation',
          data: {
            recipientName,
            recipientCompany,
            recipientRole,
            outreachPurpose,
            messageType,
            tone,
            senderProfile: profile
          },
          userId: user.id
        }
      });

      const result = {
        primary_message: aiResponse?.primary_message || `Hi ${recipientName},\n\nI hope this message finds you well. I'm reaching out because ${outreachPurpose.toLowerCase()}.\n\nI'd love to connect and explore how we might collaborate.\n\nBest regards,\n${profile?.full_name || 'Your name'}`,
        follow_up_message: aiResponse?.follow_up_message || `Hi ${recipientName},\n\nI wanted to follow up on my previous message about ${outreachPurpose.toLowerCase()}.\n\nWould you be available for a brief conversation this week?\n\nThanks,\n${profile?.full_name || 'Your name'}`,
        subject_lines: aiResponse?.subject_lines || [
          `Quick question about ${recipientCompany}`,
          `Collaboration opportunity`,
          `Following up on our connection`
        ],
        personalization_tips: aiResponse?.personalization_tips || [
          `Mention ${recipientCompany}'s recent achievements`,
          'Reference mutual connections if any',
          'Be specific about the value you can provide'
        ],
        response_rate_tips: aiResponse?.response_rate_tips || [
          'Keep initial message under 100 words',
          'Ask a specific question to encourage response',
          'Follow up after 1 week if no response'
        ]
      };

      setGeneratedMessages(result);

      if (usageId) {
        await updateToolUsage(usageId, result, 'completed', 60);
      }

      toast.success('Outreach messages generated!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate messages. Please try again.');
      if (usageId) {
        await updateToolUsage(usageId, {}, 'failed', 0);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleSaveResult = async () => {
    if (!generatedMessages) return;
    
    await saveToolResult(
      'ai-outreach-generator',
      `Outreach Messages for ${recipientName}`,
      generatedMessages,
      'document',
      ['outreach', 'networking', 'messages']
    );
  };

  const renderResults = () => {
    if (!generatedMessages) return null;

    return (
      <div className="space-y-6">
        {/* Primary Message */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Primary Message
              </span>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatedMessages.primary_message)}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
              {generatedMessages.primary_message}
            </div>
          </CardContent>
        </Card>

        {/* Follow-up Message */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Follow-up Message
              </span>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatedMessages.follow_up_message)}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
              {generatedMessages.follow_up_message}
            </div>
          </CardContent>
        </Card>

        {/* Subject Lines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Subject Line Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {generatedMessages.subject_lines.map((subject: string, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span>{subject}</span>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(subject)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Personalization Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {generatedMessages.personalization_tips.map((tip: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span className="text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Response Rate Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {generatedMessages.response_rate_tips.map((tip: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span className="text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={handleSaveResult} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Messages
          </Button>
          <Button variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Export Messages
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/tools')} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Button>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            {!generatedMessages ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                    <Send className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Powered by TalentXcel AI Outreach Generator</h2>
                  <p className="text-muted-foreground mb-6">
                    LinkedIn, email, cold pitch messages that get replies
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Recipient Name *</label>
                      <Input
                        placeholder="e.g., John Smith"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Company</label>
                      <Input
                        placeholder="e.g., Google"
                        value={recipientCompany}
                        onChange={(e) => setRecipientCompany(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Recipient Role</label>
                      <Input
                        placeholder="e.g., Product Manager"
                        value={recipientRole}
                        onChange={(e) => setRecipientRole(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Message Type</label>
                      <Select value={messageType} onValueChange={setMessageType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="linkedin">LinkedIn Message</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="cold-pitch">Cold Pitch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Tone</label>
                      <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="formal">Formal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Outreach Purpose *</label>
                  <Textarea
                    placeholder="Describe why you're reaching out (e.g., seeking collaboration, job opportunity, mentorship, partnership)"
                    value={outreachPurpose}
                    onChange={(e) => setOutreachPurpose(e.target.value)}
                    rows={3}
                  />
                </div>

                {isGenerating ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <h3 className="text-xl font-semibold mb-2">Generating Messages</h3>
                    <p className="text-muted-foreground">
                      Creating personalized outreach messages...
                    </p>
                  </div>
                ) : (
                  <Button onClick={handleGenerate} size="lg" className="w-full">
                    <Send className="h-5 w-5 mr-2" />
                    Generate Outreach Messages
                  </Button>
                )}
              </div>
            ) : (
              renderResults()
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIOutreachGenerator;