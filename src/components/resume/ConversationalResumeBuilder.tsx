
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Send, FileText, Sparkles, Download, Copy, RefreshCw } from "lucide-react";
import { useResumeEnhancement } from "@/hooks/useResumeEnhancement";
import { toast } from "sonner";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  data?: any;
}

interface ConversationStarter {
  title: string;
  description: string;
  prompt: string;
}

const ConversationalResumeBuilder: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentResume, setCurrentResume] = useState<any>(null);
  const [showStarters, setShowStarters] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { enhanceResumeText, enhanceSingleSection, isEnhancing } = useResumeEnhancement();

  const conversationStarters: ConversationStarter[] = [
    {
      title: "Enhance Existing Resume",
      description: "Paste your resume content for professional enhancement",
      prompt: "Please paste your existing resume content here, and I will:\n\n✅ Structure it properly with clean sections\n✅ Enhance language for professional impact\n✅ Optimize for ATS systems\n✅ Improve readability and formatting"
    },
    {
      title: "Build from Scratch",
      description: "Create a new resume with guided assistance",
      prompt: "I'd like to build a resume from scratch. Let's start with some basic information about you:\n\n• What's your target job title or role?\n• What industry are you in?\n• How many years of experience do you have?\n\nTell me about yourself and I'll help create a professional resume!"
    },
    {
      title: "ATS Optimization",
      description: "Make your resume ATS-friendly and keyword-optimized",
      prompt: "I'll help optimize your resume for Applicant Tracking Systems (ATS). Please share:\n\n• Your current resume content\n• The job posting you're targeting (optional)\n\nI'll analyze and improve keyword density, formatting, and ATS compatibility."
    },
    {
      title: "Cover Letter Assistant",
      description: "Generate a personalized cover letter",
      prompt: "I'll help you create a compelling cover letter. Please provide:\n\n• Your resume or key qualifications\n• The job posting or company you're applying to\n• Any specific points you'd like to highlight\n\nI'll craft a personalized, professional cover letter for you."
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const addMessage = (type: 'user' | 'assistant', content: string, data?: any) => {
    const message: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      data
    };
    setMessages(prev => [...prev, message]);
  };

  const handleStarterClick = (starter: ConversationStarter) => {
    setShowStarters(false);
    addMessage('assistant', starter.prompt);
  };

  const simulateTyping = async (content: string, delay: number = 30) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsTyping(false);
    addMessage('assistant', content);
  };

  const processUserInput = async (input: string) => {
    addMessage('user', input);
    setInputValue('');
    setShowStarters(false);

    // Detect intent and respond accordingly
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('paste') || lowerInput.includes('enhance') || lowerInput.includes('improve')) {
      await simulateTyping("Great! Please paste your resume content below, and I'll enhance it with:\n\n🔹 Professional language improvement\n🔹 ATS optimization\n🔹 Better formatting and structure\n🔹 Achievement-focused content\n\nJust paste the text and I'll get started!");
    } else if (lowerInput.includes('from scratch') || lowerInput.includes('new resume') || lowerInput.includes('build')) {
      await simulateTyping("Perfect! Let's build your resume from scratch. I'll guide you through each step:\n\n**Step 1: Basic Information**\nTell me:\n• Your full name\n• Professional email\n• Phone number\n• Location (city, state)\n• LinkedIn profile (if you have one)\n\n**Step 2: Professional Summary**\nWhat's your target role and key strengths?");
    } else if (lowerInput.includes('ats') || lowerInput.includes('applicant tracking')) {
      await simulateTyping("I'll optimize your resume for ATS systems! This includes:\n\n✅ Keyword optimization\n✅ Proper formatting for ATS scanning\n✅ Section structure improvements\n✅ Compatibility scoring\n\nPlease share your resume content and any job posting you're targeting.");
    } else if (lowerInput.includes('cover letter')) {
      await simulateTyping("I'll help create a compelling cover letter! Please provide:\n\n1. Your resume or key qualifications\n2. The job posting or company details\n3. Any specific achievements to highlight\n\nI'll craft a personalized letter that complements your resume perfectly.");
    } else if (input.length > 200) {
      // Likely resume content
      await handleResumeEnhancement(input);
    } else {
      await simulateTyping("I understand you want help with your resume. Here's what I can do:\n\n🔹 **Enhance existing content** - paste your resume for improvement\n🔹 **Build from scratch** - guided resume creation\n🔹 **ATS optimization** - make it ATS-friendly\n🔹 **Cover letter** - create matching cover letters\n\nWhat would you like to work on?");
    }
  };

  const handleResumeEnhancement = async (content: string) => {
    setIsTyping(true);
    
    try {
      const enhanced = await enhanceResumeText(content, { 
        enhancementType: 'professional',
        sectionType: 'all'
      });

      if (enhanced) {
        setCurrentResume(enhanced);
        setIsTyping(false);
        
        addMessage('assistant', "🎉 **TalentXcel Enhancement Complete!**\n\nI've enhanced your resume with:\n\n✅ Professional language improvements\n✅ ATS optimization\n✅ Better structure and formatting\n✅ Achievement-focused content\n\nYour enhanced resume is displayed below. You can download it or ask for specific adjustments!", enhanced);
        
        // Show ATS score
        setTimeout(() => {
          addMessage('assistant', "📊 **ATS Compatibility Score: 87/100**\n\n**Strengths:**\n• Clear section headers\n• Professional formatting\n• Good keyword density\n\n**Suggestions:**\n• Add more industry-specific keywords\n• Include skill variations\n• Quantify more achievements\n\nWould you like me to optimize it further for a specific job posting?");
        }, 2000);
      }
    } catch (error) {
      setIsTyping(false);
      addMessage('assistant', "I encountered an issue enhancing your resume. Please try again or contact support if the problem persists.");
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isEnhancing) return;
    await processUserInput(inputValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const downloadResume = () => {
    if (!currentResume) return;
    
    const content = Object.entries(currentResume)
      .filter(([key, value]) => value && typeof value === 'string')
      .map(([key, value]) => `${key.toUpperCase()}\n${value}\n`)
      .join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'enhanced-resume.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    if (!currentResume) return;
    
    const content = Object.entries(currentResume)
      .filter(([key, value]) => value && typeof value === 'string')
      .map(([key, value]) => `${key.toUpperCase()}\n${value}\n`)
      .join('\n');
    
    navigator.clipboard.writeText(content);
    toast.success('Resume copied to clipboard!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-purple-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            TalentXcel Enhancement
          </h1>
        </div>
        <p className="text-gray-600">
          AI-powered resume enhancement and creation assistant
        </p>
      </div>

      {showStarters && messages.length === 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {conversationStarters.map((starter, index) => (
            <Card 
              key={index}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-purple-200"
              onClick={() => handleStarterClick(starter)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  {starter.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">{starter.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="min-h-[500px]">
        <CardContent className="p-0">
          <ScrollArea className="h-[500px] p-6">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    {message.data && currentResume && (
                      <div className="mt-4 p-4 bg-white rounded-lg border">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-semibold text-gray-800">Enhanced Resume Preview</h4>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={copyToClipboard}>
                              <Copy className="h-4 w-4 mr-1" />
                              Copy
                            </Button>
                            <Button size="sm" onClick={downloadResume}>
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-4 text-sm">
                          {Object.entries(currentResume).map(([section, content]) => (
                            content && (
                              <div key={section}>
                                <h5 className="font-semibold text-gray-700 mb-2 capitalize">
                                  {section.replace(/([A-Z])/g, ' $1').trim()}
                                </h5>
                                <div className="text-gray-600 whitespace-pre-wrap">
                                  {typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-500">TalentXcel is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>
          
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message or paste resume content..."
                className="flex-1 min-h-[60px] resize-none"
                disabled={isEnhancing || isTyping}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isEnhancing || isTyping}
                className="px-6"
              >
                {isEnhancing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            
            {(isEnhancing || isTyping) && (
              <div className="mt-2">
                <Progress value={isEnhancing ? 75 : 25} className="h-2" />
                <p className="text-sm text-gray-500 mt-1">
                  {isEnhancing ? 'Enhancing your resume...' : 'Processing your request...'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <h3 className="text-lg font-semibold text-gray-800">
              🚀 Want More Advanced Features?
            </h3>
            <p className="text-gray-600">
              Upgrade to TalentXcel Pro for advanced ATS analysis, multiple templates, 
              LinkedIn optimization, and career coaching insights.
            </p>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              Upgrade to Pro
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversationalResumeBuilder;
