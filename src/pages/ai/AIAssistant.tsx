
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  MessageSquare, 
  TrendingUp, 
  FileText, 
  MapPin, 
  Send,
  Sparkles,
  Clock,
  Users,
  Star
} from 'lucide-react';

const AIAssistant = () => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([
    {
      id: 1,
      type: 'assistant',
      content: "Hi! I'm your AI career assistant. I can help you with navigation, career advice, job preparation, and much more. What would you like to know?",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  const quickActions = [
    {
      title: "Career Guidance",
      description: "Get personalized career advice",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      prompt: "I need help with my career direction. Can you guide me?"
    },
    {
      title: "Resume Review",
      description: "Get feedback on your resume",
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-50",
      prompt: "Can you help me improve my resume?"
    },
    {
      title: "Interview Prep",
      description: "Practice interview questions",
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      prompt: "I have an interview coming up. Can you help me prepare?"
    },
    {
      title: "Job Search Tips",
      description: "Optimize your job search strategy",
      icon: MapPin,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      prompt: "What are the best strategies for finding a job in my field?"
    }
  ];

  const stats = [
    { label: 'Questions Answered', value: '50K+', icon: MessageSquare },
    { label: 'Success Rate', value: '94%', icon: Star },
    { label: 'Avg Response Time', value: '2s', icon: Clock },
    { label: 'Active Users', value: '10K+', icon: Users }
  ];

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: chat.length + 1,
      type: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString()
    };

    setChat(prev => [...prev, newMessage]);
    setMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: chat.length + 2,
        type: 'assistant',
        content: "I understand your question. Let me help you with that. This is a demo response - in a real implementation, this would connect to an AI service to provide personalized career guidance.",
        timestamp: new Date().toLocaleTimeString()
      };
      setChat(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleQuickAction = (prompt: string) => {
    setMessage(prompt);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Career Assistant</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get instant answers to your career questions, personalized advice, and expert guidance 
            powered by advanced AI technology.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-4">
                <stat.icon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <span>Chat with AI Assistant</span>
                </CardTitle>
                <CardDescription>
                  Ask anything about your career, job search, or professional development
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  {chat.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.type === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white border border-gray-200'
                      }`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="Ask me anything about your career..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 min-h-[40px] max-h-[120px]"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage} disabled={!message.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Get started with these common career questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action, index) => (
                  <div 
                    key={index}
                    onClick={() => handleQuickAction(action.prompt)}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${action.bgColor}`}>
                        <action.icon className={`h-4 w-4 ${action.color}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{action.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{action.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>AI Capabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="secondary" className="text-xs">Career Planning</Badge>
                  <Badge variant="secondary" className="text-xs">Interview Prep</Badge>
                  <Badge variant="secondary" className="text-xs">Resume Tips</Badge>
                  <Badge variant="secondary" className="text-xs">Job Search Strategy</Badge>
                  <Badge variant="secondary" className="text-xs">Skill Development</Badge>
                  <Badge variant="secondary" className="text-xs">Industry Insights</Badge>
                  <Badge variant="secondary" className="text-xs">Salary Negotiation</Badge>
                  <Badge variant="secondary" className="text-xs">Professional Growth</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
