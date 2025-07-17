import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Upload, 
  FileText, 
  Send, 
  Sparkles, 
  Bot,
  User,
  Loader2,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  RefreshCw,
  Wifi,
  Settings,
  Brain,
  Zap
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { EnhancedResumeProcessor } from "@/services/enhancedResumeProcessor";
import { AIServiceStatus } from "@/components/ai/AIServiceStatus";
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  data?: any;
}

interface ExtractedResumeData {
  personalInfo: any;
  experience: any[];
  education: any[];
  skills: any;
  projects: any[];
  certifications: any[];
  confidenceMetrics?: {
    overall: number;
  };
  atsOptimization?: {
    score: number;
  };
}

export const ChatGPTStyleInterface = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'upload' | 'chat' | 'generate'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedResumeData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userPrompt, setUserPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResumeId, setGeneratedResumeId] = useState<string | null>(null);
  const [servicesHealthy, setServicesHealthy] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState<'auto' | 'openai' | 'deepseek'>('auto');
  
  // Supabase API constants
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';
  const SUPABASE_FUNCTION_URL = 'https://dthlgsnakhoftinssokm.supabase.co/functions/v1/enhance-resume';
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploadedFile(file);
    setIsProcessing(true);
    setExtractionProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExtractionProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      // Process the resume
      const processor = new EnhancedResumeProcessor();
      const extracted = await processor.processResume(file);
      
      clearInterval(progressInterval);
      setExtractionProgress(100);
      setExtractedData(extracted);

      // Add system message about extraction
      const confidence = extracted.confidenceMetrics?.overall || 0;
      const atsScore = extracted.atsOptimization?.score || 0;

      setTimeout(() => {
        setMessages([
          {
            id: '1',
            type: 'system',
            content: `✅ Resume extracted successfully!\n\n📊 **Extraction Results:**\n- Confidence: ${(confidence * 100).toFixed(1)}%\n- ATS Score: ${atsScore}/100\n- Sections found: ${Object.keys(extracted).length}`,
            timestamp: new Date()
          },
          {
            id: '2',
            type: 'assistant',
            content: `Hi! I've successfully read your resume "${file.name}". I can see your professional experience, skills, and education.\n\n**What would you like me to do?** \n\nYou can ask me to:\n• Create a complete, ATS-optimized CV\n• Enhance for specific job roles\n• Improve formatting and content\n• Optimize for specific industries\n\nJust tell me what you need!`,
            timestamp: new Date()
          }
        ]);
        setPhase('chat');
        setIsProcessing(false);
      }, 1000);

    } catch (error) {
      console.error('Resume extraction failed:', error);
      toast.error('Failed to extract resume content. Please try again.');
      setIsProcessing(false);
      setUploadedFile(null);
    }
  };

  const handleSendMessage = async (isRetry = false) => {
    if (!userPrompt.trim() || !extractedData) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: userPrompt,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setUserPrompt('');
    setIsGenerating(true);

    // Comprehensive diagnostic and fallback system
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();
    let fallbackAttempted = false;
    
    try {
      console.log('🚀 Starting AI resume enhancement...');
      console.log('📊 Request diagnostics:', {
        requestId,
        extractedDataSize: JSON.stringify(extractedData).length,
        userPromptLength: userPrompt.length,
        userId: user?.id,
        timestamp: new Date().toISOString(),
        retryAttempt: isRetry ? retryCount : 0
      });

      // Phase 1: Health Check & Connectivity Test
      console.log('🔍 Phase 1: Testing function connectivity...');
      let healthCheckPassed = false;
      
      try {
        const healthResponse = await fetch(SUPABASE_FUNCTION_URL, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
          }
        });
        
        console.log('✅ Health check result:', healthResponse.status, healthResponse.statusText);
        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          console.log('💚 Health check data:', healthData);
          healthCheckPassed = true;
        }
      } catch (healthError) {
        console.warn('⚠️ Health check failed:', healthError);
        // Continue with main request despite health check failure
      }

      // Phase 2: Primary Request with Supabase Client
      const requestPayload = {
        extractedData,
        userPrompt,
        enhancementType: 'complete_rewrite',
        aiProvider: selectedProvider,
        timestamp: new Date().toISOString(),
        requestId
      };

      console.log('📤 Phase 2: Sending enhancement request via Supabase client...');
      console.log('🔧 Request details:', {
        payloadSize: JSON.stringify(requestPayload).length,
        requestId,
        healthCheckPassed
      });

      let data: any, error: any;

      // Attempt 1: Supabase Functions SDK
      try {
        const result: any = await Promise.race([
          supabase.functions.invoke('enhance-resume', {
            body: requestPayload,
            headers: {
              'Content-Type': 'application/json',
              'X-Request-ID': requestId,
              'X-User-ID': user?.id || 'anonymous'
            }
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
          )
        ]);
        
        data = result.data;
        error = result.error;
        console.log('✅ Supabase client request completed');
      } catch (clientError) {
        console.warn('⚠️ Supabase client failed, attempting direct fetch fallback...', clientError);
        fallbackAttempted = true;
        
        // Attempt 2: Direct Fetch Fallback
        try {
          const response = await fetch(SUPABASE_FUNCTION_URL, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'apikey': SUPABASE_ANON_KEY,
              'Content-Type': 'application/json',
              'X-Request-ID': requestId,
              'X-User-ID': user?.id || 'anonymous'
            },
            body: JSON.stringify(requestPayload)
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const fallbackData = await response.json();
          data = fallbackData;
          error = null;
          console.log('✅ Direct fetch fallback successful');
        } catch (fetchError) {
          console.error('❌ Both primary and fallback methods failed');
          error = fetchError;
        }
      }

      // Phase 3: Response Analysis and Error Handling
      const responseTime = Date.now() - startTime;
      console.log('📥 Function response received:', { 
        hasData: !!data, 
        hasError: !!error,
        responseTime,
        fallbackAttempted,
        errorDetails: error 
      });

      if (error) {
        console.error('❌ Enhancement function error:', error);
        
        // Detailed error classification
        const errorMessage = error.message || error.toString();
        const isNetworkError = errorMessage.includes('Failed to send a request') || 
                              errorMessage.includes('fetch') ||
                              errorMessage.includes('timeout') ||
                              errorMessage.includes('network') ||
                              !navigator.onLine;
        
        const isConfigError = errorMessage.includes('API key') || 
                             errorMessage.includes('401') ||
                             errorMessage.includes('authentication');
        
        const isServiceError = errorMessage.includes('500') || 
                              errorMessage.includes('503') ||
                              errorMessage.includes('service unavailable');

        if (isNetworkError) {
          throw new Error('Network connectivity issue - unable to reach AI service. Please check your connection and try again.');
        } else if (isConfigError) {
          throw new Error('AI service configuration issue. Please contact support.');
        } else if (isServiceError) {
          throw new Error('AI service is temporarily unavailable. Please try again in a few minutes.');
        } else {
          throw new Error(errorMessage || 'Failed to enhance resume');
        }
      }

      if (!data || !data.success) {
        console.error('❌ Enhancement failed:', data);
        throw new Error(data?.error || 'Enhancement failed - no valid response from AI service');
      }

      console.log('✅ Enhancement successful!');

      const providerUsed = data.provider || 'unknown';
      const fallbackInfo = data.fallbackUsed ? ' (with fallback)' : '';
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `🎯 **Enhanced Resume Generated!**\n\nI've created a complete, professional, and ATS-optimized resume using **${providerUsed.toUpperCase()}**${fallbackInfo}. Here's what I've improved:\n\n✅ Professional summary tailored to your goals\n✅ Enhanced experience descriptions with metrics\n✅ Optimized skills section\n✅ Improved formatting for ATS compatibility\n✅ Industry-specific keywords\n\n**Ready to review your enhanced resume?**`,
        timestamp: new Date(),
        data: data.enhancedResume
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save enhanced resume
      const { data: savedResume, error: saveError } = await supabase
        .from('ai_resumes')
        .insert({
          user_id: user?.id,
          title: `Enhanced Resume - ${new Date().toLocaleDateString()}`,
          content: data.enhancedResume,
          ats_score: data.enhancedResume.atsOptimization?.score || 85,
          template_id: null
        })
        .select()
        .single();

      if (saveError) throw saveError;

      setGeneratedResumeId(savedResume.id);
      setPhase('generate');

    } catch (error) {
      console.error('❌ Enhancement failed with error:', error);
      
      // Phase 4: Comprehensive Error Analysis & Recovery
      const totalTime = Date.now() - startTime;
      const errorMessage = error.message || error.toString();
      
      // Advanced error categorization
      const isNetworkError = errorMessage.includes('Failed to send a request') || 
                            errorMessage.includes('fetch') ||
                            errorMessage.includes('Network connectivity') ||
                            errorMessage.includes('timeout') ||
                            !navigator.onLine;
                            
      const isConfigError = errorMessage.includes('API key') || 
                           errorMessage.includes('configuration') ||
                           errorMessage.includes('401') ||
                           errorMessage.includes('authentication');
                           
      const isServiceError = errorMessage.includes('500') || 
                            errorMessage.includes('503') ||
                            errorMessage.includes('service unavailable') ||
                            errorMessage.includes('temporarily unavailable');
                            
      const isTimeoutError = errorMessage.includes('timeout') || totalTime > 25000;
      const isRetryable = !isConfigError;
      
      // Enhanced diagnostic logging
      console.log('🔍 Comprehensive error diagnosis:', {
        errorMessage,
        isNetworkError,
        isConfigError,
        isServiceError,
        isTimeoutError,
        isRetryable,
        retryCount,
        totalTime,
        fallbackAttempted: fallbackAttempted,
        onlineStatus: navigator.onLine,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
      
      // Progressive error messaging based on retry count
      let errorContent = `❌ **Enhancement Failed**\n\nI encountered an issue enhancing your resume.`;
      
      if (isRetryable) {
        errorContent += '\n\n🔄 **You can try again** - this might be a temporary issue.';
      }
      
      errorContent += '\n\n';
      
      if (isConfigError) {
        errorContent += '**Issue:** AI service configuration problem\n**Solution:** The AI service is being configured. Please try again in a few minutes or contact support.';
      } else if (isServiceError) {
        errorContent += '**Issue:** AI service temporarily unavailable\n**Solution:** The service is restarting. Please wait a moment and try again.';
      } else if (isNetworkError) {
        errorContent += '**Issue:** Unable to connect to AI service\n**Solution:** Please check your internet connection. If the problem persists, the service may be restarting.';
      } else if (isTimeoutError) {
        errorContent += '**Issue:** Request took too long to process\n**Solution:** Try with a shorter, more specific prompt or try again later.';
      } else {
        errorContent += `**Technical details:** ${errorMessage}`;
      }
      
      // Progressive troubleshooting based on retry count
      if (retryCount >= 1) {
        errorContent += '\n\n**Test Supabase Connectivity**\nVerify Supabase isn\'t the culprit:\n\n```javascript\n// Run in browser console\nfetch("https://dthlgsnakhoftinssokm.supabase.co/rest/v1/", {\n  headers: { apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }\n}).then(res => console.log("Supabase status:", res.status))\n```\nIf this fails (non-200 status), check your Supabase project for outages.';
      }
      
      if (retryCount >= 2) {
        errorContent += '\n\n🔧 **Advanced Troubleshooting**\nIf the AI service is yours:\n\n**Check API Endpoints**\nEnsure your AI service URL is reachable:\n\n```bash\ncurl -I <YOUR_AI_SERVICE_URL>  # Should return HTTP 200/204\n```\n\n**Inspect Network Requests**\nOpen browser DevTools (F12 → Network tab). Look for:\n\n• Failed requests (red entries) to your AI endpoint\n• CORS errors (add Access-Control-Allow-Origin: * server-side)\n\nIf using a 3rd-party AI (e.g., OpenAI):\n• Check service status: OpenAI Status | Anthropic Status\n• Verify API keys are valid/correct in your Supabase secrets.';
      }
      
      if (retryCount >= 3) {
        errorContent += '\n\n🛠️ **If You Control the AI Service**\n**Restart the AI Service**\n\n```bash\n# Example with systemd:\nsudo systemctl restart your-ai-service\n```\n\n**Check Service Logs**\n\n```bash\njournalctl -u your-ai-service -n 100 --no-pager  # Linux systemd\ndocker logs your-ai-container  # If Dockerized\n```\n\n**Validate Environment Variables**\nEnsure keys/ports are correctly set in your .env or deployment config.\n\n⏱️ **When All Else Fails**\n**Fallback Strategy:** Implement a fail-safe in your code:\n\n```javascript\ntry {\n  const enhancedResume = await enhanceWithAI(resume);\n} catch (error) {\n  console.error("AI failed, using local fallback:", error);\n  // Show user unenhanced resume + "Try later" message\n}\n```\n\n**Monitor Outages:** Use tools like UptimeRobot for AI service monitoring.';
      }
      
      const errorMsgObj: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: errorContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsgObj]);
      
      // Contextual toast messages
      if (isNetworkError) {
        toast.error('Unable to connect to AI service. Please check your connection.');
      } else if (isConfigError) {
        toast.error('AI service is being configured. Please try again shortly.');
      } else if (isServiceError) {
        toast.error('AI service temporarily unavailable. Please wait and retry.');
      } else {
        toast.error('Enhancement failed. Check the chat for details.');
      }
      
      // Intelligent retry tracking
      if (isRetryable) {
        setRetryCount(prev => prev + 1);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleViewResume = () => {
    if (generatedResumeId) {
      navigate(`/resume-builder/edit/${generatedResumeId}`);
    }
  };

  if (phase === 'upload') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-white/80 backdrop-blur-sm shadow-2xl border-0">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg flex items-center justify-center">
                <Bot className="h-8 w-8 text-white" />
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Resume Assistant</h1>
                <p className="text-gray-600">Upload your resume and I'll help you enhance it for any job!</p>
              </div>

              {isProcessing ? (
                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Reading your resume...</p>
                    <Progress value={extractionProgress} className="w-full" />
                  </div>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Upload Your Resume</p>
                  <p className="text-sm text-gray-600">PDF or Word document • Max 10MB</p>
                  <Button className="mt-4">Choose File</Button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (phase === 'chat') {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">AI Resume Assistant</h1>
                <p className="text-sm text-gray-600">Analyzing: {uploadedFile?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Resume Loaded
              </Badge>
              <Badge variant="outline" className="text-blue-600">
                <Wifi className="w-3 h-3 mr-1" />
                AI Ready
              </Badge>
              
              {/* AI Provider Selection */}
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-gray-500" />
                <Select value={selectedProvider} onValueChange={(value: 'auto' | 'openai' | 'deepseek') => setSelectedProvider(value)}>
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">
                      <div className="flex items-center space-x-2">
                        <Brain className="w-3 h-3" />
                        <span>Auto</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="openai">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-3 h-3" />
                        <span>OpenAI</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="deepseek">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-3 h-3" />
                        <span>DeepSeek</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-2xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-blue-500' 
                      : message.type === 'system'
                      ? 'bg-gray-500'
                      : 'bg-gradient-to-br from-blue-500 to-purple-600'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : message.type === 'system' ? (
                      <AlertCircle className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`p-4 rounded-2xl ${
                    message.type === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white/80 backdrop-blur-sm border border-gray-200'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  </div>
                </div>
              </div>
            ))}
            
            {isGenerating && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3 max-w-2xl">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  </div>
                  <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                      <span className="text-sm text-gray-600">Enhancing your resume...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex space-x-3">
              <Textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tell me what you want me to do with your resume..."
                className="flex-1 min-h-[60px] resize-none bg-white/90"
                disabled={isGenerating}
              />
              <Button
                onClick={() => handleSendMessage(false)}
                disabled={!userPrompt.trim() || isGenerating}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Send className="w-4 h-4" />
              </Button>
              
              {retryCount > 0 && (
                <Button
                  onClick={() => handleSendMessage(true)}
                  disabled={isGenerating}
                  variant="outline"
                  size="sm"
                  className="ml-2"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Retry ({retryCount})
                </Button>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                "Create a complete, ATS-optimized CV for a Data Analyst with 3 years experience",
                "Enhance my resume for a Software Engineer position at a tech startup",
                "Optimize my CV for the healthcare industry",
                "Improve my resume's formatting and content"
              ].map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setUserPrompt(suggestion)}
                  className="text-xs bg-white/50 hover:bg-white/80"
                  disabled={isGenerating}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'generate') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-white/80 backdrop-blur-sm shadow-2xl border-0">
          <CardContent className="p-8 text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Resume Enhanced!</h2>
              <p className="text-gray-600">Your professional, ATS-optimized resume is ready to download and use.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="font-semibold text-green-800">ATS Score</div>
                <div className="text-2xl font-bold text-green-600">85+</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="font-semibold text-blue-800">Enhancement</div>
                <div className="text-2xl font-bold text-blue-600">Complete</div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleViewResume}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                size="lg"
              >
                <Eye className="w-4 h-4 mr-2" />
                View & Edit Resume
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setPhase('upload');
                  setMessages([]);
                  setUploadedFile(null);
                  setExtractedData(null);
                  setGeneratedResumeId(null);
                }}
                className="w-full"
              >
                Create Another Resume
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};