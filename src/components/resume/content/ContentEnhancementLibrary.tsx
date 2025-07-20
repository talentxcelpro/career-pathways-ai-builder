import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  BookOpen, Plus, Star, TrendingUp, Target, 
  Lightbulb, Copy, CheckCircle, Search 
} from 'lucide-react';

interface BulletPoint {
  id: string;
  content: string;
  category: string;
  industry: string;
  role: string;
  impact: 'high' | 'medium' | 'low';
  tags: string[];
}

interface ActionVerb {
  verb: string;
  category: string;
  strength: 'strong' | 'medium' | 'weak';
}

interface ContentEnhancementLibraryProps {
  onContentSelect: (content: string) => void;
}

export const ContentEnhancementLibrary: React.FC<ContentEnhancementLibraryProps> = ({
  onContentSelect
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Mock data - in real app, this would come from your content library
  const bulletPoints: BulletPoint[] = [
    {
      id: '1',
      content: 'Increased team productivity by 35% through implementation of agile methodologies and automated testing protocols',
      category: 'leadership',
      industry: 'technology',
      role: 'manager',
      impact: 'high',
      tags: ['productivity', 'agile', 'automation', 'team-management']
    },
    {
      id: '2',
      content: 'Reduced customer acquisition cost by 28% while increasing conversion rates through data-driven marketing campaigns',
      category: 'marketing',
      industry: 'general',
      role: 'marketing',
      impact: 'high',
      tags: ['customer-acquisition', 'conversion', 'data-driven', 'marketing']
    },
    {
      id: '3',
      content: 'Managed cross-functional team of 12 developers across 3 time zones to deliver software solutions 2 weeks ahead of schedule',
      category: 'project-management',
      industry: 'technology',
      role: 'manager',
      impact: 'high',
      tags: ['cross-functional', 'team-management', 'deadlines', 'software']
    },
    {
      id: '4',
      content: 'Implemented new customer service protocols resulting in 40% reduction in response time and 25% increase in satisfaction scores',
      category: 'operations',
      industry: 'service',
      role: 'operations',
      impact: 'high',
      tags: ['customer-service', 'protocols', 'response-time', 'satisfaction']
    }
  ];

  const actionVerbs: ActionVerb[] = [
    { verb: 'Spearheaded', category: 'leadership', strength: 'strong' },
    { verb: 'Orchestrated', category: 'leadership', strength: 'strong' },
    { verb: 'Pioneered', category: 'innovation', strength: 'strong' },
    { verb: 'Optimized', category: 'improvement', strength: 'strong' },
    { verb: 'Streamlined', category: 'improvement', strength: 'strong' },
    { verb: 'Facilitated', category: 'collaboration', strength: 'medium' },
    { verb: 'Coordinated', category: 'management', strength: 'medium' },
    { verb: 'Assisted', category: 'support', strength: 'weak' },
    { verb: 'Helped', category: 'support', strength: 'weak' }
  ];

  const achievements = [
    {
      category: 'Sales',
      examples: [
        'Exceeded quarterly sales targets by 150% for 4 consecutive quarters',
        'Generated $2.5M in new revenue through strategic client partnerships',
        'Closed 95% of qualified leads, highest rate in company history'
      ]
    },
    {
      category: 'Leadership',
      examples: [
        'Led cross-functional team of 25+ members through successful product launch',
        'Mentored 8 junior developers, with 100% promotion rate within 18 months',
        'Reduced team turnover by 60% through improved management practices'
      ]
    },
    {
      category: 'Technical',
      examples: [
        'Architected scalable system handling 10M+ daily active users',
        'Reduced application load time by 40% through code optimization',
        'Implemented CI/CD pipeline reducing deployment time from 2 hours to 15 minutes'
      ]
    }
  ];

  const categories = ['all', 'leadership', 'marketing', 'technical', 'operations', 'sales'];
  const industries = ['all', 'technology', 'healthcare', 'finance', 'general'];

  const filteredBulletPoints = bulletPoints.filter(point => {
    const matchesCategory = selectedCategory === 'all' || point.category === selectedCategory;
    const matchesIndustry = selectedIndustry === 'all' || point.industry === selectedIndustry;
    const matchesSearch = searchTerm === '' || 
      point.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      point.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesIndustry && matchesSearch;
  });

  const handleCopyContent = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    onContentSelect(content);
    
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerbStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'weak': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Content Enhancement Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="bullet-points" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bullet-points">Bullet Points</TabsTrigger>
              <TabsTrigger value="action-verbs">Action Verbs</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="bullet-points" className="space-y-4">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map(ind => (
                        <SelectItem key={ind} value={ind}>
                          {ind.charAt(0).toUpperCase() + ind.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Bullet Points */}
              <div className="space-y-3">
                {filteredBulletPoints.map((point) => (
                  <div key={point.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-2">{point.content}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={getImpactColor(point.impact)}>
                            {point.impact} impact
                          </Badge>
                          <Badge variant="outline">{point.category}</Badge>
                          <Badge variant="outline">{point.industry}</Badge>
                          {point.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleCopyContent(point.content, point.id)}
                        className="shrink-0"
                      >
                        {copiedId === point.id ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="action-verbs" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {actionVerbs.map((verb, index) => (
                  <div key={index} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{verb.verb}</span>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{verb.category}</Badge>
                          <Badge className={`text-xs ${getVerbStrengthColor(verb.strength)}`}>
                            {verb.strength}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleCopyContent(verb.verb, `verb-${index}`)}
                      >
                        {copiedId === `verb-${index}` ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4">
              {achievements.map((category, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {category.examples.map((example, exIndex) => (
                      <div key={exIndex} className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="text-sm flex-1">{example}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyContent(example, `achievement-${index}-${exIndex}`)}
                        >
                          {copiedId === `achievement-${index}-${exIndex}` ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};