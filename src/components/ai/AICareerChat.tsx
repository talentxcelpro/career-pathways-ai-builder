import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Bot, User, Lightbulb, TrendingUp, Target, Briefcase } from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const AICareerChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi! I'm your AI Career Assistant. I can help you with job search strategies, career planning, salary negotiations, interview preparation, and much more. What would you like to discuss today?",
      timestamp: new Date(),
      suggestions: [
        "How can I improve my resume?",
        "What salary should I negotiate?",
        "Help me prepare for interviews",
        "What skills should I learn next?"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickActions = [
    {
      icon: Lightbulb,
      title: 'Career Advice',
      description: 'Get personalized career guidance',
      prompt: 'I need career advice for my next move'
    },
    {
      icon: TrendingUp,
      title: 'Skill Development',
      description: 'Learn what skills to develop',
      prompt: 'What skills should I focus on developing?'
    },
    {
      icon: Target,
      title: 'Job Search',
      description: 'Optimize your job search strategy',
      prompt: 'Help me with my job search strategy'
    },
    {
      icon: Briefcase,
      title: 'Interview Prep',
      description: 'Practice interview questions',
      prompt: 'Help me prepare for my upcoming interview'
    }
  ];

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(content),
        timestamp: new Date(),
        suggestions: generateSuggestions(content)
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('resume')) {
      return "I'd be happy to help with your resume! Here are some key tips:\n\n1. **Use strong action verbs** - Start bullet points with words like 'Led,' 'Developed,' 'Implemented'\n2. **Quantify achievements** - Include specific numbers and metrics\n3. **Tailor for each role** - Customize keywords for the specific job\n4. **Keep it concise** - Aim for 1-2 pages with clear, scannable sections\n\nWould you like me to review a specific section or provide more detailed guidance on any of these points?";
    }
    
    if (lowerInput.includes('salary') || lowerInput.includes('negotiate')) {
      return "Great question about salary negotiation! Here's my advice:\n\n1. **Research market rates** - Use sites like Glassdoor, PayScale, and Levels.fyi\n2. **Know your worth** - List your achievements and unique value\n3. **Consider total compensation** - Don't forget benefits, equity, PTO\n4. **Practice your pitch** - Be confident but flexible\n5. **Time it right** - Best after receiving an offer\n\nBased on your profile, I see you're in the frontend development space. Current market rates for your experience level are typically $X-$Y. Would you like help preparing your negotiation strategy?";
    }
    
    if (lowerInput.includes('interview')) {
      return "I'll help you ace that interview! Here's a comprehensive prep plan:\n\n**Technical Preparation:**\n- Review core concepts in your field\n- Practice coding problems (if applicable)\n- Prepare specific examples using the STAR method\n\n**Common Questions to Prepare:**\n- 'Tell me about yourself'\n- 'Why do you want this role?'\n- 'Describe a challenging project'\n\n**Questions to Ask Them:**\n- Team dynamics and collaboration\n- Growth opportunities\n- Company challenges and goals\n\nWould you like me to simulate a mock interview or help you prepare answers for specific questions?";
    }
    
    if (lowerInput.includes('skills') || lowerInput.includes('learn')) {
      return "Based on current market trends and your background, here are the most valuable skills to develop:\n\n**High-Priority Skills:**\n- Cloud platforms (AWS, Azure, GCP)\n- DevOps and CI/CD pipelines\n- System design and architecture\n- Data analysis and interpretation\n\n**Emerging Technologies:**\n- AI/ML fundamentals\n- Blockchain and Web3\n- Edge computing\n- Cybersecurity awareness\n\n**Soft Skills:**\n- Leadership and mentoring\n- Cross-functional collaboration\n- Strategic thinking\n\nWhich area interests you most? I can create a personalized learning roadmap for you.";
    }

    return "I understand you're looking for career guidance. Could you provide a bit more detail about your specific situation? For example:\n\n- What's your current role and experience level?\n- What specific challenge are you facing?\n- What are your career goals?\n\nThis will help me give you more targeted and useful advice!";
  };

  const generateSuggestions = (userInput: string): string[] => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('resume')) {
      return [
        "Review my technical skills section",
        "Help with quantifying achievements",
        "ATS optimization tips",
        "Industry-specific keywords"
      ];
    }
    
    if (lowerInput.includes('salary')) {
      return [
        "Research my market value",
        "Practice negotiation scenarios",
        "Evaluate total compensation",
        "When to bring up salary"
      ];
    }
    
    if (lowerInput.includes('interview')) {
      return [
        "Mock interview simulation",
        "Technical question practice",
        "Behavioral question prep",
        "Questions to ask interviewer"
      ];
    }

    return [
      "Tell me about career paths in my field",
      "How to build a professional network",
      "Best practices for job applications",
      "Help with LinkedIn optimization"
    ];
  };

  const handleQuickAction = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <MessageSquare className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">AI Career Chat</h2>
          <p className="text-muted-foreground">Get instant career advice from your AI assistant</p>
        </div>
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleQuickAction(action.prompt)}
            >
              <CardContent className="p-4 text-center space-y-2">
                <div className="p-2 rounded-lg bg-primary/10 w-fit mx-auto">
                  <action.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium">{action.title}</h3>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Chat Container */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Career Assistant
            <Badge variant="secondary" className="ml-auto">Online</Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col gap-4">
          {/* Messages */}
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.type === 'ai' && (
                    <div className="p-2 rounded-lg bg-primary/10 h-fit">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] space-y-2 ${message.type === 'user' ? 'order-first' : ''}`}>
                    <div className={`p-3 rounded-lg ${
                      message.type === 'user' 
                        ? 'bg-primary text-primary-foreground ml-auto' 
                        : 'bg-muted'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    
                    {message.suggestions && (
                      <div className="flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => handleSendMessage(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {message.type === 'user' && (
                    <div className="p-2 rounded-lg bg-secondary h-fit">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Ask me anything about your career..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
              className="flex-1"
            />
            <Button 
              onClick={() => handleSendMessage(inputMessage)}
              disabled={!inputMessage.trim() || isTyping}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AICareerChat;