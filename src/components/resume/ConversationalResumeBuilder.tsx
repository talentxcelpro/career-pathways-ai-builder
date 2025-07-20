
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Send, FileText, Sparkles, Download, Copy, RefreshCw, Target, Award, Brain, Zap, User, Briefcase, GraduationCap } from "lucide-react";
import { useResumeEnhancement } from "@/hooks/useResumeEnhancement";
import { useAIService } from "@/hooks/useAIService";
import { useAdvancedResumeAI } from "@/hooks/useAdvancedResumeAI";
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
  const { invokeAITool, optimizeForATS, generateCoverLetter } = useAIService();
  const { 
    enhanceContent, 
    scoreResume, 
    optimizeForATS: advancedATSOptimization,
    generateCoverLetter: advancedCoverLetter,
    isProcessing: isAIProcessing 
  } = useAdvancedResumeAI();

  const conversationStarters: ConversationStarter[] = [
    {
      title: "✨ Enhance Existing Resume",
      description: "Transform your current resume into a powerful, ATS-optimized masterpiece",
      prompt: "I'll analyze and enhance your resume with advanced AI techniques. Please paste your resume content, and I'll:\n\n🎯 **Professional Language Enhancement** - Convert weak phrases into powerful, action-oriented statements\n📊 **Achievement Quantification** - Transform responsibilities into measurable accomplishments\n🤖 **ATS Optimization** - Ensure perfect compatibility with Applicant Tracking Systems\n✍️ **Grammar & Style Polish** - Professional tone with clarity improvements\n🔍 **Keyword Integration** - Industry-specific terminology for maximum impact\n\nSimply paste your resume text below!"
    },
    {
      title: "🚀 Build from Scratch",
      description: "Create a professional resume step-by-step with AI guidance",
      prompt: "Let's build your resume from the ground up! I'll guide you through each section with intelligent questions and suggestions.\n\n**Getting Started:**\n• What's your target role or industry?\n• How many years of experience do you have?\n• What are your key achievements?\n\nI'll help structure everything into a compelling professional narrative that stands out to employers!"
    },
    {
      title: "🎯 ATS Optimization Expert",
      description: "Advanced ATS analysis with compatibility scoring and keyword optimization",
      prompt: "I'll perform comprehensive ATS optimization using advanced parsing algorithms:\n\n📈 **ATS Compatibility Score** - Detailed analysis with improvement recommendations\n🔑 **Strategic Keyword Placement** - Industry-specific terms positioned for maximum impact\n📋 **Format Optimization** - Structure that passes all major ATS systems\n⚡ **Quick Wins Identification** - Immediate improvements for better visibility\n\nShare your resume and target job description (optional) for complete optimization!"
    },
    {
      title: "📝 AI Cover Letter Generator",
      description: "Create compelling, personalized cover letters that complement your resume",
      prompt: "I'll craft a persuasive cover letter that perfectly complements your resume:\n\n✨ **Personalized Content** - Tailored to the specific role and company\n🎭 **Tone Matching** - Professional style that reflects your personality\n🔗 **Resume Integration** - Seamlessly connects with your key qualifications\n📊 **Success Metrics** - Proven templates that get results\n\nProvide your resume and the job posting for a custom cover letter!"
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
      // Use advanced AI for content enhancement
      const enhancementResult = await enhanceContent(content);
      
      if (enhancementResult?.success) {
        const enhanced = enhancementResult.data;
        setCurrentResume(enhanced);
        setIsTyping(false);
        
        addMessage('assistant', "🎉 **TalentXcel AI Enhancement Complete!**\n\nYour resume has been transformed with:\n\n🚀 **Professional Language Enhancement** - Action-oriented, impactful phrasing\n📊 **Achievement Quantification** - Results-focused content with metrics\n🤖 **ATS Optimization** - Keyword-rich and system-friendly formatting\n✨ **Grammar & Style Polish** - Clear, professional tone throughout\n🎯 **Impact Maximization** - Compelling narrative that highlights your value\n\nYour enhanced resume is displayed below!", enhanced);
        
        // Generate and show ATS analysis
        setTimeout(async () => {
          const analysis = await scoreResume(content);
          if (analysis) {
            addMessage('assistant', `📊 **Comprehensive Resume Analysis**\n\n**Overall Scores:**\n• ATS Compatibility: ${analysis.atsScore}/100\n• Impact & Clarity: ${analysis.impactScore}/100\n• Keyword Optimization: ${analysis.keywordDensity}/100\n• Readability: ${analysis.readabilityScore}/100\n\n**Key Strengths:**\n${analysis.strengths.map(s => `• ${s}`).join('\n')}\n\n**Improvement Areas:**\n${analysis.weaknesses.map(w => `• ${w}`).join('\n')}\n\n**Next Steps:**\n${analysis.suggestions.map(s => `• ${s}`).join('\n')}\n\nWould you like me to optimize it further for a specific job posting or industry?`);
          }
        }, 3000);
      } else {
        // Fallback to original enhancement
        const enhanced = await enhanceResumeText(content, { 
          enhancementType: 'professional',
          sectionType: 'all'
        });

        if (enhanced) {
          setCurrentResume(enhanced);
          setIsTyping(false);
          addMessage('assistant', "✅ **Resume Enhancement Complete!**\n\nI've improved your resume with professional language and ATS optimization. Your enhanced resume is displayed below!", enhanced);
        }
      }
    } catch (error) {
      setIsTyping(false);
      addMessage('assistant', "I encountered an issue enhancing your resume. Our AI service is temporarily busy - please try again in a moment, or contact support if the problem persists.");
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              TalentXcel AI Resume Builder
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Professional resume enhancement powered by advanced AI technology
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span>ATS Optimized</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span>Achievement Focused</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span>AI Powered</span>
            </div>
          </div>
        </div>

        {showStarters && messages.length === 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            {conversationStarters.map((starter, index) => {
              const icons = [Zap, User, Target, FileText];
              const IconComponent = icons[index];
              return (
                <Card 
                  key={index}
                  className="cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 bg-white/80 backdrop-blur-sm hover:bg-white group"
                  onClick={() => handleStarterClick(starter)}
                >
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg group-hover:from-purple-600 group-hover:to-blue-600 transition-all duration-300">
                        <IconComponent className="h-5 w-5 text-purple-600 group-hover:text-white transition-colors duration-300" />
                      </div>
                      <span className="group-hover:text-purple-600 transition-colors duration-300">
                        {starter.title}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm leading-relaxed">{starter.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Card className="min-h-[600px] bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
          <CardContent className="p-0">
            <ScrollArea className="h-[600px] p-8">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-5 rounded-2xl shadow-lg ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white' 
                      : 'bg-white text-gray-900 border border-gray-100'
                  }`}>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                      {message.data && currentResume && (
                        <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-100 shadow-inner">
                          <div className="flex justify-between items-center mb-6">
                            <div>
                              <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                <Award className="h-5 w-5 text-purple-600" />
                                Enhanced Resume Preview
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">AI-optimized and ATS-ready</p>
                            </div>
                            <div className="flex gap-3">
                              <Button size="sm" variant="outline" onClick={copyToClipboard} className="shadow-sm">
                                <Copy className="h-4 w-4 mr-2" />
                                Copy
                              </Button>
                              <Button size="sm" onClick={downloadResume} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-sm">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-6 text-sm">
                            {Object.entries(currentResume).map(([section, content]) => {
                              if (!content) return null;
                              const sectionIcons = {
                                summary: User,
                                experience: Briefcase,
                                education: GraduationCap,
                                skills: Target
                              };
                              const IconComponent = sectionIcons[section as keyof typeof sectionIcons] || FileText;
                              return (
                                <div key={section} className="bg-white p-4 rounded-lg border border-gray-100">
                                  <h5 className="font-bold text-gray-800 mb-3 capitalize flex items-center gap-2">
                                    <IconComponent className="h-4 w-4 text-purple-600" />
                                    {section.replace(/([A-Z])/g, ' $1').trim()}
                                  </h5>
                                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-600 font-medium">TalentXcel AI is analyzing...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>
          
          <div className="p-6 border-t bg-gray-50/50">
            <div className="flex gap-4">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Describe what you need help with, or paste your resume content here..."
                className="flex-1 min-h-[80px] resize-none border-2 border-gray-200 focus:border-purple-300 bg-white shadow-sm"
                disabled={isEnhancing || isTyping}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isEnhancing || isTyping}
                className="px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
                size="lg"
              >
                {isEnhancing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
            
            {(isEnhancing || isTyping) && (
              <div className="mt-4">
                <Progress value={isEnhancing ? 75 : 35} className="h-3" />
                <p className="text-sm text-gray-600 mt-2 font-medium">
                  {isEnhancing ? '🚀 AI is enhancing your resume with advanced optimization...' : '🧠 Processing your request with TalentXcel AI...'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-100 via-blue-100 to-indigo-100 border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Unlock Premium Features
                </h3>
              </div>
              <p className="text-gray-700 text-lg max-w-2xl mx-auto">
                Get access to advanced AI tools, premium templates, LinkedIn optimization, 
                interview preparation, and personalized career coaching insights.
              </p>
              <div className="flex justify-center gap-4 mt-6">
                <Button 
                  variant="outline" 
                  className="border-2 border-purple-200 hover:border-purple-300 text-purple-700 hover:bg-purple-50"
                  size="lg"
                >
                  Learn More
                </Button>
                <Button 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg" 
                  size="lg"
                >
                  Upgrade to Pro
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConversationalResumeBuilder;
