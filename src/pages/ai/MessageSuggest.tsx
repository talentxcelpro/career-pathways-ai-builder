
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Users, 
  Send, 
  Copy, 
  Check,
  Sparkles,
  UserPlus,
  MessageCircle
} from 'lucide-react';

const MessageSuggest = () => {
  const [context, setContext] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState('');

  const messageTypes = [
    {
      id: 'connection',
      title: 'Connection Request',
      description: 'Send personalized connection requests',
      icon: UserPlus,
      placeholder: 'Tell us about the person you want to connect with...'
    },
    {
      id: 'follow-up',
      title: 'Follow-up Message',
      description: 'Professional follow-up after meetings or interviews',
      icon: MessageCircle,
      placeholder: 'Describe the context of your previous interaction...'
    },
    {
      id: 'networking',
      title: 'Networking Message',
      description: 'Reach out to industry professionals',
      icon: Users,
      placeholder: 'What do you want to discuss or ask about...'
    }
  ];

  const toneOptions = [
    { value: 'professional', label: 'Professional', color: 'bg-blue-50 text-blue-700' },
    { value: 'friendly', label: 'Friendly', color: 'bg-green-50 text-green-700' },
    { value: 'casual', label: 'Casual', color: 'bg-purple-50 text-purple-700' },
    { value: 'formal', label: 'Formal', color: 'bg-gray-50 text-gray-700' }
  ];

  const [selectedTone, setSelectedTone] = useState('professional');

  const handleGenerate = () => {
    if (!context.trim()) return;
    
    setGenerating(true);
    
    setTimeout(() => {
      setSuggestions([
        {
          id: 1,
          title: 'Option 1: Direct & Professional',
          content: `Hi [Name],\n\nI came across your profile and was impressed by your experience in [relevant field]. I'd love to connect and potentially discuss [specific topic/opportunity].\n\nBest regards,\n[Your name]`,
          length: 'Short',
          tone: 'Professional'
        },
        {
          id: 2,
          title: 'Option 2: Detailed & Personal',
          content: `Hello [Name],\n\nI hope this message finds you well. I recently [context from your input] and was particularly interested in your work at [Company]. Your insights on [specific topic] would be incredibly valuable.\n\nWould you be open to a brief conversation?\n\nWarm regards,\n[Your name]`,
          length: 'Medium',
          tone: 'Friendly'
        },
        {
          id: 3,
          title: 'Option 3: Brief & Engaging',
          content: `Hi [Name],\n\nYour work in [field] caught my attention! I'd appreciate the opportunity to connect and learn from your experience.\n\nThanks!\n[Your name]`,
          length: 'Short',
          tone: 'Casual'
        }
      ]);
      setGenerating(false);
    }, 2000);
  };

  const handleCopy = (content, id) => {
    navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  const examples = [
    {
      scenario: "Connecting with a recruiter",
      message: "Hi Sarah, I'm interested in the Software Engineer position at your company. I'd love to connect and learn more about the role."
    },
    {
      scenario: "Following up after a networking event",
      message: "Hi John, It was great meeting you at the Tech Conference yesterday. I'd love to continue our conversation about AI in healthcare."
    },
    {
      scenario: "Reaching out to an industry expert",
      message: "Hello Dr. Smith, I've been following your research on machine learning. Would you be open to sharing insights about career paths in AI?"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-indigo-600 rounded-lg">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Smart Messaging Assistant</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Generate personalized, professional messages for networking, connections, and follow-ups 
            with AI-powered suggestions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Generator */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  <span>Message Generator</span>
                </CardTitle>
                <CardDescription>
                  Provide context and get personalized message suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="connection" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    {messageTypes.map((type) => (
                      <TabsTrigger key={type.id} value={type.id} className="flex items-center space-x-2">
                        <type.icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{type.title.split(' ')[0]}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {messageTypes.map((type) => (
                    <TabsContent key={type.id} value={type.id} className="space-y-4">
                      <div className="text-sm text-gray-600 mb-4">
                        {type.description}
                      </div>
                      
                      <Textarea
                        placeholder={type.placeholder}
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        className="min-h-[120px]"
                      />

                      {/* Tone Selection */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">Preferred Tone</label>
                        <div className="flex flex-wrap gap-2">
                          {toneOptions.map((tone) => (
                            <Badge
                              key={tone.value}
                              className={`cursor-pointer ${
                                selectedTone === tone.value 
                                  ? tone.color 
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                              onClick={() => setSelectedTone(tone.value)}
                            >
                              {tone.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleGenerate}
                        disabled={!context.trim() || generating}
                        className="w-full"
                      >
                        {generating ? (
                          <>
                            <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Messages
                          </>
                        )}
                      </Button>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* Generated Suggestions */}
            {suggestions.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold">Generated Messages</h3>
                {suggestions.map((suggestion) => (
                  <Card key={suggestion.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{suggestion.title}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {suggestion.length}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {suggestion.tone}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 p-4 rounded-lg mb-3">
                        <pre className="whitespace-pre-wrap text-sm font-mono">
                          {suggestion.content}
                        </pre>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(suggestion.content, suggestion.id)}
                        >
                          {copied === suggestion.id ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </>
                          )}
                        </Button>
                        <Button size="sm">
                          <Send className="h-4 w-4 mr-2" />
                          Use Message
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Examples */}
            <Card>
              <CardHeader>
                <CardTitle>Example Scenarios</CardTitle>
                <CardDescription>
                  Common networking situations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {examples.map((example, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">{example.scenario}</h4>
                    <p className="text-xs text-gray-600">{example.message}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Messaging Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Personalize with specific details about their work</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Keep connection requests under 300 characters</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Include a clear call-to-action</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Follow up within 3-5 days</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageSuggest;
