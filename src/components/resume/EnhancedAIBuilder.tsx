import { useState, useEffect } from 'react';
import { Brain, Wand2, Sparkles, Target, MessageCircle, BarChart3, Mic } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VoiceInput } from './VoiceInput';
import { ATSScoring } from './ATSScoring';
import { ResumeAnalytics } from './ResumeAnalytics';
import { CollaborationPanel } from './CollaborationPanel';
import { toast } from 'sonner';

interface EnhancedAIBuilderProps {
  resumeData?: any;
  onSave?: (data: any) => void;
  onOptimize?: (suggestions: string[]) => void;
}

export const EnhancedAIBuilder = ({ 
  resumeData, 
  onSave, 
  onOptimize 
}: EnhancedAIBuilderProps) => {
  const [activeTab, setActiveTab] = useState('builder');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [resumeContent, setResumeContent] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleVoiceTranscript = (transcript: string) => {
    if (transcript.trim()) {
      setResumeContent(prev => prev + ' ' + transcript);
      toast.success('Voice input added to resume');
    }
  };

  const handleAIOptimize = async (suggestions: string[]) => {
    setIsOptimizing(true);
    try {
      // Simulate AI optimization
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock optimization - in production this would call your AI service
      const optimizedContent = resumeContent + '\n\n[AI OPTIMIZATION APPLIED]\n' + 
        suggestions.map(s => `• ${s}`).join('\n');
      
      setResumeContent(optimizedContent);
      onOptimize?.(suggestions);
      toast.success('Resume optimized with AI suggestions!');
    } catch (error) {
      toast.error('Optimization failed. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleCollaboration = {
    onInvite: (email: string, role: string) => {
      toast.success(`Invited ${email} as ${role}`);
    },
    onComment: (content: string, section?: string) => {
      toast.success('Comment added successfully');
    },
    onShare: () => {
      navigator.clipboard.writeText(`https://talentxcel.in/resume/shared/${Date.now()}`);
      toast.success('Resume link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI-Powered Resume Builder
          </h1>
          <p className="text-xl text-muted-foreground">
            Build, optimize, and collaborate on your resume with advanced AI assistance
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="builder" className="gap-2">
              <Brain className="h-4 w-4" />
              AI Builder
            </TabsTrigger>
            <TabsTrigger value="voice" className="gap-2">
              <Mic className="h-4 w-4" />
              Voice Input
            </TabsTrigger>
            <TabsTrigger value="ats" className="gap-2">
              <Target className="h-4 w-4" />
              ATS Score
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="collaborate" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Collaborate
            </TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5" />
                    AI Resume Content
                  </CardTitle>
                  <CardDescription>
                    AI-generated content based on your profile and job requirements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={resumeContent}
                    onChange={(e) => setResumeContent(e.target.value)}
                    placeholder="Your resume content will appear here... Use voice input or type directly."
                    rows={20}
                    className="w-full p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="mt-4 flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab('voice')}
                      className="gap-2"
                    >
                      <Mic className="h-4 w-4" />
                      Add Voice Input
                    </Button>
                    <Button 
                      onClick={() => onSave?.(resumeContent)}
                      className="gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      Save Resume
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Live Preview</CardTitle>
                  <CardDescription>
                    See how your resume looks in real-time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-white p-6 rounded-lg border shadow-sm min-h-[500px]">
                    <div className="prose prose-sm max-w-none">
                      {resumeContent ? (
                        <pre className="whitespace-pre-wrap font-sans text-sm">
                          {resumeContent}
                        </pre>
                      ) : (
                        <div className="text-center text-muted-foreground py-20">
                          <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Start building your resume to see the preview</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="voice" className="space-y-6">
            <VoiceInput
              onTranscript={handleVoiceTranscript}
              placeholder="Speak to add content to your resume. Describe your experience, skills, or achievements..."
              isActive={isVoiceActive}
              onActiveChange={setIsVoiceActive}
            />
            
            {resumeContent && (
              <Card>
                <CardHeader>
                  <CardTitle>Current Resume Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/30 p-4 rounded-lg max-h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm">{resumeContent}</pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ats" className="space-y-6">
            <ATSScoring
              resumeText={resumeContent}
              onOptimize={handleAIOptimize}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <ResumeAnalytics
              resumeId="current-resume"
              isLive={true}
            />
          </TabsContent>

          <TabsContent value="collaborate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Resume Editor</CardTitle>
                    <CardDescription>
                      Collaborate in real-time with your team
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <textarea
                      value={resumeContent}
                      onChange={(e) => setResumeContent(e.target.value)}
                      placeholder="Collaborative resume editing..."
                      rows={15}
                      className="w-full p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-1">
                <CollaborationPanel
                  resumeId="current-resume"
                  currentUserId="current-user"
                  onInvite={handleCollaboration.onInvite}
                  onComment={handleCollaboration.onComment}
                  onShare={handleCollaboration.onShare}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};