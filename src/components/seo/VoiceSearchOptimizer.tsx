import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mic, Search, Brain, CheckCircle, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface VoiceSearchQuery {
  id: string;
  question: string;
  answer: string;
  intent: 'informational' | 'navigational' | 'transactional' | 'local';
  difficulty: 'easy' | 'medium' | 'hard';
  keywords: string[];
}

interface VoiceSearchOptimizerProps {
  pageTitle: string;
  pageType: 'job' | 'company' | 'course' | 'general';
}

export const VoiceSearchOptimizer: React.FC<VoiceSearchOptimizerProps> = ({
  pageTitle,
  pageType
}) => {
  const [queries, setQueries] = useState<VoiceSearchQuery[]>([]);
  const [newQuery, setNewQuery] = useState({
    question: '',
    answer: '',
    intent: 'informational' as const,
    keywords: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Predefined voice search patterns based on page type
  const getDefaultQueries = (type: string) => {
    const baseQueries = {
      job: [
        {
          question: "What does a [job title] do?",
          answer: "A [job title] is responsible for...",
          intent: "informational" as const,
          keywords: ["job description", "responsibilities", "duties"]
        },
        {
          question: "How much does a [job title] make?",
          answer: "The average salary for a [job title] is...",
          intent: "informational" as const,
          keywords: ["salary", "compensation", "pay"]
        },
        {
          question: "How to become a [job title]?",
          answer: "To become a [job title], you typically need...",
          intent: "informational" as const,
          keywords: ["requirements", "education", "skills"]
        }
      ],
      company: [
        {
          question: "What does [company name] do?",
          answer: "[Company name] is a company that...",
          intent: "informational" as const,
          keywords: ["company description", "business", "services"]
        },
        {
          question: "How many employees does [company name] have?",
          answer: "[Company name] has approximately...",
          intent: "informational" as const,
          keywords: ["company size", "employees", "workforce"]
        },
        {
          question: "Where is [company name] located?",
          answer: "[Company name] is headquartered in...",
          intent: "local" as const,
          keywords: ["location", "address", "headquarters"]
        }
      ],
      course: [
        {
          question: "What will I learn in this course?",
          answer: "In this course, you will learn...",
          intent: "informational" as const,
          keywords: ["curriculum", "learning outcomes", "skills"]
        },
        {
          question: "How long does this course take?",
          answer: "This course typically takes...",
          intent: "informational" as const,
          keywords: ["duration", "time", "schedule"]
        },
        {
          question: "Do I need prerequisites for this course?",
          answer: "The prerequisites for this course are...",
          intent: "informational" as const,
          keywords: ["requirements", "prerequisites", "background"]
        }
      ]
    };

    return baseQueries[type as keyof typeof baseQueries] || [];
  };

  useEffect(() => {
    // Initialize with default queries based on page type
    const defaultQueries = getDefaultQueries(pageType);
    const initialQueries: VoiceSearchQuery[] = defaultQueries.map((query, index) => ({
      id: (index + 1).toString(),
      question: query.question,
      answer: query.answer,
      intent: query.intent,
      difficulty: 'medium' as const,
      keywords: query.keywords
    }));
    setQueries(initialQueries);
  }, [pageType]);

  const addQuery = () => {
    if (!newQuery.question || !newQuery.answer) return;

    const query: VoiceSearchQuery = {
      id: Date.now().toString(),
      question: newQuery.question,
      answer: newQuery.answer,
      intent: newQuery.intent,
      difficulty: 'medium',
      keywords: newQuery.keywords.split(',').map(k => k.trim()).filter(Boolean)
    };

    setQueries(prev => [...prev, query]);
    setNewQuery({ question: '', answer: '', intent: 'informational', keywords: '' });
  };

  const removeQuery = (id: string) => {
    setQueries(prev => prev.filter(q => q.id !== id));
  };

  const generateAIQueries = async () => {
    setIsGenerating(true);
    // Simulate AI generation - in real implementation, this would call an AI service
    setTimeout(() => {
      const aiGeneratedQueries: VoiceSearchQuery[] = [
        {
          id: `ai-${Date.now()}`,
          question: `What are the benefits of working at ${pageTitle}?`,
          answer: `Working at ${pageTitle} offers numerous benefits including...`,
          intent: 'informational',
          difficulty: 'easy',
          keywords: ['benefits', 'perks', 'advantages']
        },
        {
          id: `ai-${Date.now() + 1}`,
          question: `How to apply for jobs at ${pageTitle}?`,
          answer: `To apply for jobs at ${pageTitle}, you can...`,
          intent: 'transactional',
          difficulty: 'medium',
          keywords: ['application', 'apply', 'hiring process']
        }
      ];
      
      setQueries(prev => [...prev, ...aiGeneratedQueries]);
      setIsGenerating(false);
    }, 2000);
  };

  const generateFAQSchema = () => {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": queries.map(query => ({
        "@type": "Question",
        "name": query.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": query.answer
        }
      }))
    };
  };

  const getIntentColor = (intent: string) => {
    const colors = {
      informational: 'bg-blue-100 text-blue-800',
      navigational: 'bg-green-100 text-green-800',
      transactional: 'bg-orange-100 text-orange-800',
      local: 'bg-purple-100 text-purple-800'
    };
    return colors[intent as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(generateFAQSchema())}
        </script>
        
        {/* Voice search optimization meta tags */}
        <meta name="speakable" content="main-content" />
        <meta name="voice-search-optimized" content="true" />
        
        {/* Question-based keywords for voice search */}
        {queries.map((query, index) => (
          <meta key={index} name="voice-query" content={query.question} />
        ))}
      </Helmet>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Voice Search Optimization
          </CardTitle>
          <CardDescription>
            Optimize content for voice search queries and featured snippets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Voice Search Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Optimized Queries</p>
                    <p className="text-2xl font-bold">{queries.length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Conversational</p>
                    <p className="text-2xl font-bold">
                      {queries.filter(q => q.question.includes('how') || q.question.includes('what') || q.question.includes('where')).length}
                    </p>
                  </div>
                  <Brain className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Local Intent</p>
                    <p className="text-2xl font-bold">
                      {queries.filter(q => q.intent === 'local').length}
                    </p>
                  </div>
                  <Search className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Voice Search Queries */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Voice Search Queries</h3>
              <Button onClick={generateAIQueries} disabled={isGenerating}>
                <Brain className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generating...' : 'AI Generate'}
              </Button>
            </div>

            <div className="space-y-3">
              {queries.map(query => (
                <Card key={query.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={getIntentColor(query.intent)}>
                          {query.intent}
                        </Badge>
                        <Badge variant="outline">
                          {query.difficulty}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeQuery(query.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <strong className="text-sm">Q: </strong>
                        <span className="text-sm">{query.question}</span>
                      </div>
                      <div>
                        <strong className="text-sm">A: </strong>
                        <span className="text-sm text-muted-foreground">{query.answer}</span>
                      </div>
                      {query.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {query.keywords.map((keyword, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Add New Query */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add New Voice Search Query</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Voice search question (e.g., 'How much does a software engineer make?')"
                value={newQuery.question}
                onChange={(e) => setNewQuery(prev => ({ ...prev, question: e.target.value }))}
              />
              <Textarea
                placeholder="Answer that targets featured snippets..."
                value={newQuery.answer}
                onChange={(e) => setNewQuery(prev => ({ ...prev, answer: e.target.value }))}
                rows={3}
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  className="w-full p-2 border rounded-md"
                  value={newQuery.intent}
                  onChange={(e) => setNewQuery(prev => ({ ...prev, intent: e.target.value as any }))}
                >
                  <option value="informational">Informational</option>
                  <option value="navigational">Navigational</option>
                  <option value="transactional">Transactional</option>
                  <option value="local">Local</option>
                </select>
                <Input
                  placeholder="Keywords (comma separated)"
                  value={newQuery.keywords}
                  onChange={(e) => setNewQuery(prev => ({ ...prev, keywords: e.target.value }))}
                />
              </div>
              <Button onClick={addQuery} disabled={!newQuery.question || !newQuery.answer}>
                <Plus className="h-4 w-4 mr-2" />
                Add Query
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};