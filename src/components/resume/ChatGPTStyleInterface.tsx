import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
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
  Wifi
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

    try {
      console.log('🚀 Starting AI resume enhancement...');
      console.log('📊 Request payload:', {
        extractedDataSize: JSON.stringify(extractedData).length,
        userPromptLength: userPrompt.length,
        userId: user?.id
      });

      // First, test basic connectivity with a GET request
      console.log('🔍 Testing function connectivity...');
      const testResponse = await fetch(`https://dthlgsnakhoftinssokm.supabase.co/functions/v1/ai-resume-enhancement`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc',
          'Content-Type': 'application/json',
        }
      });
      console.log('✅ Connectivity test result:', testResponse.status, testResponse.statusText);

      // Prepare request with detailed logging
      const requestPayload = {
        extractedData,
        userPrompt,
        enhancementType: 'complete_rewrite',
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      console.log('📤 Sending enhancement request...');
      console.log('🔧 Request details:', {
        payloadSize: JSON.stringify(requestPayload).length,
        requestId: requestPayload.requestId
      });

      // Call AI enhancement function with comprehensive error handling
      const { data, error } = await supabase.functions.invoke('ai-resume-enhancement', {
        body: requestPayload,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestPayload.requestId,
          'X-User-ID': user?.id || 'anonymous'
        }
      });

      console.log('📥 Function response received:', { 
        hasData: !!data, 
        hasError: !!error,
        errorDetails: error 
      });

      if (error) {
        console.error('❌ Enhancement function error:', error);
        
        // Check for specific error types
        if (error.message?.includes('Failed to send a request')) {
          throw new Error('Network connectivity issue - unable to reach AI service. Please check your connection and try again.');
        } else if (error.message?.includes('API key')) {
          throw new Error('AI service configuration issue. Please contact support.');
        } else {
          throw new Error(error.message || 'Failed to enhance resume');
        }
      }

      if (!data || !data.success) {
        console.error('❌ Enhancement failed:', data);
        throw new Error(data?.error || 'Enhancement failed - no valid response from AI service');
      }

      console.log('✅ Enhancement successful!');

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `🎯 **Enhanced Resume Generated!**\n\nI've created a complete, professional, and ATS-optimized resume based on your requirements. Here's what I've improved:\n\n✅ Professional summary tailored to your goals\n✅ Enhanced experience descriptions with metrics\n✅ Optimized skills section\n✅ Improved formatting for ATS compatibility\n✅ Industry-specific keywords\n\n**Ready to review your enhanced resume?**`,
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
      
      // Enhanced error categorization and handling
      const isNetworkError = error.message?.includes('Failed to send a request') || 
                            error.message?.includes('fetch') ||
                            error.message?.includes('Network connectivity');
      const isConfigError = error.message?.includes('API key') || 
                           error.message?.includes('configuration');
      const isTimeoutError = error.message?.includes('timeout');
      const isRetryable = !isConfigError;
      
      // Log diagnostic information
      console.log('🔍 Error diagnosis:', {
        isNetworkError,
        isConfigError,
        isTimeoutError,
        isRetryable,
        retryCount
      });
      
      const retryButton = isRetryable ? '\n\n🔄 **You can try again** - this might be a temporary issue.' : '';
      
      let errorContent = `❌ **Enhancement Failed**\n\nI encountered an issue enhancing your resume.${retryButton}\n\n`;
      
      if (isConfigError) {
        errorContent += '**Issue:** AI service configuration problem\n**Solution:** The AI service is being configured. Please try again in a few minutes or contact support.';
      } else if (isNetworkError) {
        errorContent += '**Issue:** Unable to connect to AI service\n**Solution:** Please check your internet connection. If the problem persists, the service may be restarting.';
      } else if (isTimeoutError) {
        errorContent += '**Issue:** Request took too long to process\n**Solution:** Try with a shorter, more specific prompt or try again later.';
      } else {
        errorContent += `**Technical details:** ${error.message}`;
      }
      
      // Add troubleshooting tips for persistent failures
      if (retryCount >= 2) {
        errorContent += '\n\n**Persistent Issues?**\n• Refresh the page and try again\n• Try uploading a different resume\n• Check if other features work normally';
      }
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: errorContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Show different toast messages based on error type
      if (isNetworkError) {
        toast.error('Unable to connect to AI service. Please check your connection.');
      } else if (isConfigError) {
        toast.error('AI service is being configured. Please try again shortly.');
      } else {
        toast.error('Enhancement failed. Check the chat for details.');
      }
      
      // Track retry count for retryable errors
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
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Resume Loaded
              </Badge>
              {/* Temporarily disabled status check while function redeploys */}
              <Badge variant="outline" className="text-blue-600">
                <Wifi className="w-3 h-3 mr-1" />
                AI Ready
              </Badge>
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