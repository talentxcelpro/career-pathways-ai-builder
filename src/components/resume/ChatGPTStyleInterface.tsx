
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useAIResumeEnhancements } from "@/hooks/useAIResumeEnhancements";
import { useResumeUpload } from "@/hooks/useResumeUpload";
import { FileUploadZone } from "@/components/resume/upload/FileUploadZone";
import { toast } from "sonner";
import {
  Send,
  Sparkles,
  Upload,
  FileText,
  Zap,
  Target,
  MessageSquare,
  Wand2,
  RotateCcw,
  Copy,
  Check,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface AIMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  data?: any;
  isLoading?: boolean;
  error?: string;
}

interface ChatGPTStyleInterfaceProps {
  resumeData?: any;
  onEnhancementApplied?: (enhancedData: any) => void;
}

export const ChatGPTStyleInterface: React.FC<ChatGPTStyleInterfaceProps> = ({
  resumeData,
  onEnhancementApplied
}) => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: "👋 Hi! I'm your AI Resume Assistant. I can help you optimize your resume with smart titles, tone adjustments, and keyword optimization. Upload your resume or start creating one to get personalized AI enhancements!",
      timestamp: new Date()
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showUploadSection, setShowUploadSection] = useState(!resumeData);
  const [copiedId, setCopiedId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    generateSmartTitles,
    isGeneratingTitles,
    adjustTone,
    isAdjustingTone,
    optimizeKeywords,
    isOptimizingKeywords,
  } = useAIResumeEnhancements();

  const {
    isProcessing,
    uploadSuccess,
    processingStep,
    processingSteps,
    processResume,
    resetUpload,
    progress
  } = useResumeUpload();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (type: 'user' | 'ai', content: string, data?: any, error?: string) => {
    const newMessage: AIMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      data,
      error
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  };

  const updateMessage = (id: string, updates: Partial<AIMessage>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, ...updates } : msg
    ));
  };

  const handleGenerateTitles = async () => {
    const messageId = addMessage('user', 'Generate smart resume titles');
    const aiMessageId = addMessage('ai', 'Generating smart titles...', null);
    updateMessage(aiMessageId, { isLoading: true });

    try {
      const result = await generateSmartTitles(resumeData || {});
      
      if (result) {
        updateMessage(aiMessageId, {
          content: `✨ **Smart Resume Titles Generated!**\n\n**Best Title:** ${result.recommendations.bestTitle}\n\n**Alternative Options:**\n${result.titles.map(t => `• ${t.title} (ATS Score: ${t.atsScore}%)`).join('\n')}\n\n**Tips:**\n${result.recommendations.tips.join('\n• ')}`,
          data: result,
          isLoading: false
        });
      } else {
        updateMessage(aiMessageId, {
          content: "I couldn't generate titles right now. Please make sure you have resume data uploaded or try again.",
          isLoading: false,
          error: 'Title generation failed'
        });
      }
    } catch (error) {
      updateMessage(aiMessageId, {
        content: "Sorry, I encountered an error generating titles. Please try again.",
        isLoading: false,
        error: error.message
      });
    }
  };

  const handleOptimizeKeywords = async () => {
    addMessage('user', 'Optimize keywords for ATS');
    const aiMessageId = addMessage('ai', 'Analyzing and optimizing keywords...', null);
    updateMessage(aiMessageId, { isLoading: true });

    try {
      const jobDescription = inputText.trim();
      const result = await optimizeKeywords(resumeData, jobDescription);
      
      if (result) {
        updateMessage(aiMessageId, {
          content: `🎯 **Keywords Optimized!**\n\n**ATS Score:** ${result.atsScore}%\n\n**Missing Keywords:**\n${result.recommendations.map(r => `• ${r.keyword} (${r.priority} priority)`).join('\n')}\n\n**Improvement Tips:**\n${result.improvementTips.join('\n• ')}`,
          data: result,
          isLoading: false
        });
      } else {
        updateMessage(aiMessageId, {
          content: "I provided keyword optimization suggestions based on best practices. Upload your resume for personalized recommendations.",
          isLoading: false
        });
      }
    } catch (error) {
      updateMessage(aiMessageId, {
        content: "I encountered an issue optimizing keywords. Please try again or upload your resume first.",
        isLoading: false,
        error: error.message
      });
    }
  };

  const handleAdjustTone = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some content to adjust');
      return;
    }

    const content = inputText.trim();
    addMessage('user', `Adjust tone: "${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"`);
    const aiMessageId = addMessage('ai', 'Adjusting tone to professional...', null);
    updateMessage(aiMessageId, { isLoading: true });

    try {
      const result = await adjustTone(content, 'professional', 'summary');
      
      if (result) {
        const changesText = result.changes.length > 0 
          ? `\n\n**Changes Made:**\n${result.changes.map(c => `• "${c.original}" → "${c.adjusted}"`).join('\n')}`
          : '';
          
        updateMessage(aiMessageId, {
          content: `✨ **Tone Adjusted to ${result.tone}!**\n\n**Enhanced Content:**\n"${result.adjustedContent}"\n\n**Impact Score:** ${result.impactScore}%${changesText}\n\n**Suggestions:**\n${result.suggestions.join('\n• ')}`,
          data: result,
          isLoading: false
        });
        
        setInputText(''); // Clear input after successful adjustment
      } else {
        updateMessage(aiMessageId, {
          content: "I couldn't adjust the tone right now. The AI service might be temporarily unavailable. Please try again.",
          isLoading: false,
          error: 'Tone adjustment failed'
        });
      }
    } catch (error) {
      updateMessage(aiMessageId, {
        content: "I encountered an issue adjusting the tone. Please try again in a moment.",
        isLoading: false,
        error: error.message
      });
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      setUploadedFile(files[0]);
      toast.success('File selected! Click "Extract Content" to process.');
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    resetUpload();
  };

  const handleProcessResume = () => {
    if (uploadedFile) {
      const files = new DataTransfer();
      files.items.add(uploadedFile);
      processResume(uploadedFile);
    }
  };

  const handleDragEvents = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      toast.success('Content copied to clipboard!');
      setTimeout(() => setCopiedId(''), 2000);
    } catch (error) {
      toast.error('Failed to copy content');
    }
  };

  const isAnyLoading = isGeneratingTitles || isAdjustingTone || isOptimizingKeywords || isProcessing;

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-background">
      {/* Header */}
      <div className="border-b border-border p-4 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">AI Resume Assistant</h1>
              <p className="text-sm text-muted-foreground">Smart enhancements powered by AI</p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUploadSection(!showUploadSection)}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Resume
            {showUploadSection ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Upload Section */}
      {showUploadSection && (
        <div className="border-b border-border p-4 bg-muted/30">
          <FileUploadZone
            onFileSelect={handleFileSelect}
            uploadedFile={uploadedFile}
            onRemoveFile={handleRemoveFile}
            onProcessResume={handleProcessResume}
            isProcessing={isProcessing}
            dragActive={dragActive}
            onDragEnter={handleDragEvents}
            onDragLeave={handleDragEvents}
            onDragOver={handleDragEvents}
            onDrop={handleDrop}
            processingProgress={progress?.percentage || 0}
            processingStatus={progress?.step || 'Processing'}
          />
          
          {uploadSuccess && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">Resume processed successfully!</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-3 relative group`}>
              {message.type === 'ai' && message.isLoading && (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  <span className="text-sm">Processing...</span>
                </div>
              )}
              
              {message.error && (
                <div className="flex items-center space-x-2 text-destructive mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Error occurred</span>
                </div>
              )}
              
              <div className="whitespace-pre-wrap text-sm">{message.content}</div>
              
              {message.type === 'ai' && !message.isLoading && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background border"
                  onClick={() => copyToClipboard(message.content, message.id)}
                >
                  {copiedId === message.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              )}
              
              <div className="text-xs text-muted-foreground mt-2 opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="border-t border-border p-4 bg-card">
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateTitles}
            disabled={isAnyLoading}
            className="flex items-center gap-2"
          >
            {isGeneratingTitles ? (
              <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
            ) : (
              <Target className="h-3 w-3" />
            )}
            Smart Titles
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleOptimizeKeywords}
            disabled={isAnyLoading}
            className="flex items-center gap-2"
          >
            {isOptimizingKeywords ? (
              <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
            ) : (
              <Zap className="h-3 w-3" />
            )}
            Optimize Keywords
          </Button>
        </div>

        {/* Input Area */}
        <div className="flex space-x-2">
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter resume content to adjust tone, or paste a job description for keyword optimization..."
            className="flex-1 min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (inputText.trim()) {
                  handleAdjustTone();
                }
              }
            }}
          />
          
          <Button
            onClick={handleAdjustTone}
            disabled={isAnyLoading || !inputText.trim()}
            className="px-3"
          >
            {isAdjustingTone ? (
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">
            Press Enter to adjust tone • Shift+Enter for new line
          </p>
          
          {resumeData ? (
            <Badge variant="secondary" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              Resume Loaded
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              <Info className="h-3 w-3 mr-1" />
              Upload resume for better results
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
