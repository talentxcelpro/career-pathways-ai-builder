import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Send, 
  Bot, 
  User, 
  Lightbulb, 
  Briefcase, 
  GraduationCap, 
  TrendingUp,
  MessageCircle,
  Sparkles,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  category?: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  category: string;
  prompt: string;
}

export function CareerGPTAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const quickActions: QuickAction[] = [
    {
      id: 'resume-review',
      title: 'Resume Review',
      description: 'Get feedback on your resume',
      icon: User,
      category: 'Resume',
      prompt: 'Can you help me review and improve my resume? What are the key elements I should focus on?'
    },
    {
      id: 'interview-prep',
      title: 'Interview Preparation',
      description: 'Prepare for upcoming interviews',
      icon: MessageCircle,
      category: 'Interview',
      prompt: 'I have an interview coming up. Can you help me prepare with common questions and tips?'
    },
    {
      id: 'career-switch',
      title: 'Career Change',
      description: 'Explore career transition options',
      icon: TrendingUp,
      category: 'Career',
      prompt: 'I\'m thinking about changing careers. How should I approach this transition?'
    },
    {
      id: 'skill-development',
      title: 'Skill Development',
      description: 'Plan your learning roadmap',
      icon: GraduationCap,
      category: 'Skills',
      prompt: 'What skills should I focus on developing for my career growth?'
    },
    {
      id: 'job-search',
      title: 'Job Search Strategy',
      description: 'Optimize your job search',
      icon: Briefcase,
      category: 'Jobs',
      prompt: 'Can you help me create an effective job search strategy?'
    },
    {
      id: 'salary-negotiation',
      title: 'Salary Negotiation',
      description: 'Learn negotiation tactics',
      icon: TrendingUp,
      category: 'Negotiation',
      prompt: 'How should I approach salary negotiation in my next job offer?'
    }
  ];

  const welcomeMessage: Message = {
    id: 'welcome',
    role: 'assistant',
    content: `👋 Hi! I'm your AI Career Assistant. I'm here to help you with:

• **Resume & Cover Letter** - Review, optimization, and writing tips
• **Interview Preparation** - Mock questions, strategies, and feedback
• **Career Planning** - Goal setting, skill development, and roadmaps
• **Job Search** - Strategy, networking, and application tips
• **Salary & Negotiation** - Compensation research and negotiation tactics
• **Industry Insights** - Market trends and opportunities

What can I help you with today?`,
    timestamp: new Date(),
    category: 'welcome'
  };

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([welcomeMessage]);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || inputMessage.trim();
    if (!content) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Simulate AI response - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiResponse = generateAIResponse(content);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        category: detectCategory(content)
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('resume')) {
      return `Here are some key tips for improving your resume:

**📋 Structure & Format:**
• Use a clean, ATS-friendly format
• Keep it to 1-2 pages maximum
• Use consistent formatting and fonts

**🎯 Content Optimization:**
• Start with a strong professional summary
• Use action verbs and quantify achievements
• Tailor keywords to the job description
• Include relevant skills and certifications

**✨ Pro Tips:**
• Use bullet points for easy scanning
• Include contact information and LinkedIn profile
• Proofread carefully for errors
• Save as PDF to preserve formatting

Would you like me to review a specific section of your resume or help with any particular aspect?`;
    }
    
    if (lowerMessage.includes('interview')) {
      return `Let me help you prepare for your interview! Here's a comprehensive approach:

**🤝 Common Interview Questions:**
• "Tell me about yourself"
• "Why do you want this role?"
• "What are your strengths/weaknesses?"
• "Describe a challenging situation you overcame"

**🎯 STAR Method:**
Use this structure for behavioral questions:
• **Situation** - Set the context
• **Task** - Explain your responsibility
• **Action** - Describe what you did
• **Result** - Share the outcome

**📝 Preparation Checklist:**
• Research the company and role thoroughly
• Prepare 3-5 thoughtful questions to ask
• Practice your elevator pitch
• Prepare specific examples of your achievements
• Plan your outfit and route in advance

What type of role are you interviewing for? I can provide more specific guidance!`;
    }
    
    if (lowerMessage.includes('career change') || lowerMessage.includes('transition')) {
      return `Career transitions can be exciting! Here's a strategic approach:

**🔍 Self-Assessment:**
• Identify your transferable skills
• Clarify your values and interests
• Assess your financial situation
• Define your ideal work environment

**📊 Market Research:**
• Research target industries and roles
• Identify skill gaps to address
• Network with professionals in your target field
• Understand salary expectations

**🛤️ Transition Strategy:**
• Create a timeline for your transition
• Develop missing skills through courses/certifications
• Update your resume to highlight transferable skills
• Start networking before you need a job
• Consider informational interviews

**💡 Practical Steps:**
• Update your LinkedIn profile
• Join relevant professional groups
• Attend industry events and webinars
• Consider freelancing or volunteering in your target field

What industry or role are you considering transitioning to?`;
    }
    
    return `Thank you for your question! I'm here to help with all aspects of your career development. 

Based on your message, here are some general tips:

**🚀 Career Success Framework:**
• Set clear, measurable goals
• Continuously develop relevant skills
• Build and maintain professional networks
• Stay updated with industry trends
• Seek feedback and mentorship opportunities

**📈 Next Steps:**
• Define specific areas where you need guidance
• Create an action plan with deadlines
• Track your progress regularly
• Celebrate small wins along the way

Could you provide more specific details about what you'd like help with? I can give you more targeted advice based on your situation.`;
  };

  const detectCategory = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('resume')) return 'Resume';
    if (lowerMessage.includes('interview')) return 'Interview';
    if (lowerMessage.includes('career')) return 'Career';
    if (lowerMessage.includes('skill')) return 'Skills';
    if (lowerMessage.includes('job')) return 'Jobs';
    if (lowerMessage.includes('salary')) return 'Negotiation';
    return 'General';
  };

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isExpanded) {
    return (
      <Card className="fixed bottom-6 right-6 w-80 shadow-lg border-2 z-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm">Career AI Assistant</CardTitle>
                <p className="text-xs text-muted-foreground">Ask me anything about your career!</p>
              </div>
            </div>
            <Button size="sm" onClick={() => setIsExpanded(true)}>
              Open
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-xl border-2 z-50 flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Career AI Assistant</CardTitle>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Online • Ready to help
              </div>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setIsExpanded(false)}
          >
            ✕
          </Button>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="p-1 bg-primary/10 rounded-full">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                    {message.category && message.category !== 'welcome' && (
                      <Badge variant="outline" className="text-xs">
                        {message.category}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {message.role === 'user' && (
                  <div className="p-1 bg-primary/10 rounded-full">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="p-1 bg-primary/10 rounded-full">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        {messages.length <= 1 && (
          <div className="p-4 border-t">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Quick Actions
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.slice(0, 4).map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.id}
                    variant="outline"
                    size="sm"
                    className="h-auto p-2 flex flex-col gap-1 text-left"
                    onClick={() => handleQuickAction(action)}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-medium">{action.title}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Ask about your career..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              size="sm" 
              onClick={() => sendMessage()}
              disabled={!inputMessage.trim() || isLoading}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send • Available 24/7
          </p>
        </div>
      </CardContent>
    </Card>
  );
}