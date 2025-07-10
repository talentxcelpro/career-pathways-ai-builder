import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Clock,
  MapPin,
  GraduationCap,
  DollarSign,
  Users,
  Calendar,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  query: string;
}

const CollegeChatAI = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI college advisor. I can help you with admissions, courses, fees, campus life, and career prospects at this college. What would you like to know?',
      timestamp: new Date(),
      suggestions: [
        'Tell me about admission requirements',
        'What are the popular courses?',
        'How much are the fees?',
        'What about campus facilities?'
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions: QuickAction[] = [
    {
      id: '1',
      label: 'Admission Process',
      icon: <GraduationCap className="h-4 w-4" />,
      query: 'What is the admission process and requirements?'
    },
    {
      id: '2',
      label: 'Course Details',
      icon: <BookOpen className="h-4 w-4" />,
      query: 'Tell me about the courses and programs offered'
    },
    {
      id: '3',
      label: 'Fee Structure',
      icon: <DollarSign className="h-4 w-4" />,
      query: 'What is the fee structure and scholarship options?'
    },
    {
      id: '4',
      label: 'Campus Life',
      icon: <Users className="h-4 w-4" />,
      query: 'What facilities and activities are available on campus?'
    },
    {
      id: '5',
      label: 'Placement Stats',
      icon: <Users className="h-4 w-4" />,
      query: 'What are the placement statistics and career opportunities?'
    },
    {
      id: '6',
      label: 'Location & Transport',
      icon: <MapPin className="h-4 w-4" />,
      query: 'How is the location and transportation connectivity?'
    }
  ];

  const handleSendMessage = async (messageText?: string) => {
    const message = messageText || inputMessage.trim();
    if (!message) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(message),
        timestamp: new Date(),
        suggestions: generateSuggestions(message)
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('admission') || lowerQuery.includes('requirement')) {
      return 'For admissions, you\'ll need to complete the online application with your academic transcripts, entrance exam scores (if applicable), and personal statement. The typical eligibility is 60% marks in 12th grade for undergraduate programs. Application deadlines are usually in March-April for the next academic year. Would you like specific details about any program?';
    }
    
    if (lowerQuery.includes('course') || lowerQuery.includes('program')) {
      return 'This college offers excellent programs in Engineering, Business, Arts, and Sciences. Popular courses include Computer Science, Electronics, MBA, and Commerce. Each program has industry-relevant curriculum with practical training. The faculty-to-student ratio is 1:15, ensuring personalized attention. Which specific field interests you?';
    }
    
    if (lowerQuery.includes('fee') || lowerQuery.includes('cost') || lowerQuery.includes('scholarship')) {
      return 'The annual fees range from ₹80,000 to ₹2,50,000 depending on the program. Merit-based scholarships are available for top performers (up to 50% fee waiver). There are also need-based financial aid options. EMI facilities and education loans are supported. Would you like details about specific program fees?';
    }
    
    if (lowerQuery.includes('campus') || lowerQuery.includes('facility') || lowerQuery.includes('hostel')) {
      return 'The campus spans 50 acres with modern facilities including smart classrooms, well-equipped labs, a library with 50,000+ books, sports complex, and cafeteria. Hostel accommodation is available for both boys and girls with WiFi and mess facilities. There are active clubs for technical, cultural, and sports activities. The campus has 24/7 security and medical facilities.';
    }
    
    if (lowerQuery.includes('placement') || lowerQuery.includes('career') || lowerQuery.includes('job')) {
      return 'The college has an excellent placement record with 85% placement rate. Top recruiters include TCS, Infosys, Wipro, Amazon, Deloitte, and local companies. Average package is ₹4.5 LPA with highest reaching ₹12 LPA. The placement cell provides training for interviews, resume building, and soft skills development. Industry internships are mandatory for final year students.';
    }
    
    if (lowerQuery.includes('location') || lowerQuery.includes('transport') || lowerQuery.includes('connectivity')) {
      return 'The college is strategically located with excellent connectivity. It\'s 2 km from the main bus stand and 15 km from the railway station. City buses run every 15 minutes. The area has good infrastructure with banks, hospitals, and shopping centers nearby. For outstation students, airport connectivity is available 45 minutes away.';
    }
    
    return 'That\'s a great question! I\'d be happy to help you with more specific information. Could you please be more specific about what aspect of the college you\'d like to know about? I can provide details about admissions, courses, fees, campus facilities, placements, or any other aspect of college life.';
  };

  const generateSuggestions = (query: string): string[] => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('admission')) {
      return [
        'What documents are required for admission?',
        'When is the application deadline?',
        'Is there an entrance exam?'
      ];
    }
    
    if (lowerQuery.includes('course')) {
      return [
        'What is the curriculum structure?',
        'Are there internship opportunities?',
        'Tell me about faculty qualifications'
      ];
    }
    
    return [
      'Tell me about hostel facilities',
      'What about extracurricular activities?',
      'How is the alumni network?'
    ];
  };

  const handleQuickAction = (action: QuickAction) => {
    handleSendMessage(action.query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI College Advisor
                </CardTitle>
                <p className="text-gray-600 mt-1">
                  Get instant answers about admissions, courses, and campus life
                </p>
              </div>
              <div className="ml-auto">
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Powered
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Quick Actions */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Quick Questions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  className="justify-start h-auto p-3 bg-white/50 hover:bg-white hover:shadow-md transition-all"
                  onClick={() => handleQuickAction(action)}
                >
                  {action.icon}
                  <span className="ml-2 text-xs">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-0">
            <ScrollArea className="h-[500px] p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.type === 'ai' && (
                      <Avatar className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600">
                        <AvatarFallback className="text-white text-xs">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : ''}`}>
                      <div className={`p-3 rounded-lg ${
                        message.type === 'user' 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-auto' 
                          : 'bg-gray-100'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>

                      {/* AI Suggestions */}
                      {message.type === 'ai' && message.suggestions && (
                        <div className="mt-3 space-y-1">
                          {message.suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="ghost"
                              size="sm"
                              className="h-auto p-2 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>

                    {message.type === 'user' && (
                      <Avatar className="h-8 w-8 bg-gray-200 order-3">
                        <AvatarFallback className="text-gray-600 text-xs">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600">
                      <AvatarFallback className="text-white text-xs">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t p-4 bg-white/50">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask anything about this college..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-white/80"
                />
                <Button 
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CollegeChatAI;