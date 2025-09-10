import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  TrendingUp, 
  Target, 
  Brain, 
  MapPin, 
  Users, 
  Zap,
  Eye
} from 'lucide-react';

export const KeywordSubcategories = () => {
  const [activeSubTab, setActiveSubTab] = useState('research');

  const subcategories = [
    { id: 'research', label: 'Research & Discovery', icon: Search, desc: 'Find high-value keywords' },
    { id: 'serp', label: 'SERP Analysis', icon: TrendingUp, desc: 'Analyze search results' },
    { id: 'gap', label: 'Keyword Gaps', icon: Target, desc: 'Find missed opportunities' },
    { id: 'longtail', label: 'Long-tail Mining', icon: Brain, desc: 'Discover specific phrases' },
    { id: 'local', label: 'Local Keywords', icon: MapPin, desc: 'Location-based terms' },
    { id: 'competitor', label: 'Competitor Keywords', icon: Users, desc: 'Analyze competitors' },
    { id: 'difficulty', label: 'Difficulty Analysis', icon: Zap, desc: 'Assess competition' },
    { id: 'intent', label: 'Search Intent', icon: Eye, desc: 'Understand user goals' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {subcategories.map((cat) => (
          <Button
            key={cat.id}
            variant={activeSubTab === cat.id ? "default" : "outline"}
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => setActiveSubTab(cat.id)}
          >
            <cat.icon className="h-6 w-6" />
            <div className="text-center">
              <div className="font-semibold text-sm">{cat.label}</div>
              <div className="text-xs text-muted-foreground">{cat.desc}</div>
            </div>
          </Button>
        ))}
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsContent value="research">
          <KeywordResearchComponent />
        </TabsContent>
        <TabsContent value="serp">
          <SERPAnalysisComponent />
        </TabsContent>
        <TabsContent value="gap">
          <KeywordGapComponent />
        </TabsContent>
        <TabsContent value="longtail">
          <LongTailMiningComponent />
        </TabsContent>
        <TabsContent value="local">
          <LocalKeywordComponent />
        </TabsContent>
        <TabsContent value="competitor">
          <CompetitorKeywordComponent />
        </TabsContent>
        <TabsContent value="difficulty">
          <DifficultyAnalysisComponent />
        </TabsContent>
        <TabsContent value="intent">
          <SearchIntentComponent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const KeywordResearchComponent = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Search className="h-5 w-5" />
        Keyword Research & Discovery
      </CardTitle>
      <CardDescription>Discover high-value keywords for your content strategy</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Seed Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['resume builder', 'job search', 'career guidance', 'ai resume'].map((kw, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                  <span className="text-sm">{kw}</span>
                  <Badge variant="secondary">Core</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Related Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['professional resume', 'cv maker', 'job application', 'career coach'].map((kw, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                  <span className="text-sm">{kw}</span>
                  <Badge variant="outline">Related</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Opportunity Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['free resume builder', 'resume templates', 'cover letter generator', 'job interview prep'].map((kw, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                  <span className="text-sm">{kw}</span>
                  <Badge variant="default">High Value</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </CardContent>
  </Card>
);

const SERPAnalysisComponent = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5" />
        SERP Analysis & Rankings
      </CardTitle>
      <CardDescription>Analyze search engine results pages and track rankings</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Top SERP Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { feature: 'Featured Snippets', count: 45, trend: '+12%' },
                  { feature: 'People Also Ask', count: 78, trend: '+8%' },
                  { feature: 'Local Pack', count: 23, trend: '+5%' },
                  { feature: 'Knowledge Panel', count: 12, trend: '+15%' }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                    <div>
                      <div className="font-medium text-sm">{item.feature}</div>
                      <div className="text-xs text-muted-foreground">{item.count} appearances</div>
                    </div>
                    <Badge variant="secondary">{item.trend}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Ranking Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { position: 'Top 3', count: 15, color: 'bg-green-500' },
                  { position: 'Top 10', count: 42, color: 'bg-blue-500' },
                  { position: 'Top 20', count: 28, color: 'bg-yellow-500' },
                  { position: '20+', count: 35, color: 'bg-red-500' }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <span className="text-sm font-medium">{item.position}</span>
                    </div>
                    <span className="text-sm">{item.count} keywords</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Similar pattern for other components...
const KeywordGapComponent = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Target className="h-5 w-5" />
        Keyword Gap Analysis
      </CardTitle>
      <CardDescription>Identify keyword opportunities you're missing</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8">
        <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Gap Analysis Coming Soon</h3>
        <p className="text-muted-foreground">Advanced competitor gap analysis tools</p>
      </div>
    </CardContent>
  </Card>
);

const LongTailMiningComponent = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Brain className="h-5 w-5" />
        Long-tail Keyword Mining
      </CardTitle>
      <CardDescription>Discover specific, low-competition phrases</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8">
        <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Long-tail Mining Coming Soon</h3>
        <p className="text-muted-foreground">AI-powered long-tail keyword discovery</p>
      </div>
    </CardContent>
  </Card>
);

const LocalKeywordComponent = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <MapPin className="h-5 w-5" />
        Local Keyword Research
      </CardTitle>
      <CardDescription>Find location-specific keyword opportunities</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8">
        <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Local Keywords Coming Soon</h3>
        <p className="text-muted-foreground">Location-based keyword research tools</p>
      </div>
    </CardContent>
  </Card>
);

const CompetitorKeywordComponent = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        Competitor Keyword Analysis
      </CardTitle>
      <CardDescription>Analyze competitor keyword strategies</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8">
        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Competitor Analysis Coming Soon</h3>
        <p className="text-muted-foreground">Advanced competitor keyword intelligence</p>
      </div>
    </CardContent>
  </Card>
);

const DifficultyAnalysisComponent = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Zap className="h-5 w-5" />
        Keyword Difficulty Assessment
      </CardTitle>
      <CardDescription>Assess competition level for target keywords</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8">
        <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Difficulty Analysis Coming Soon</h3>
        <p className="text-muted-foreground">AI-powered difficulty scoring</p>
      </div>
    </CardContent>
  </Card>
);

const SearchIntentComponent = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Eye className="h-5 w-5" />
        Search Intent Analysis
      </CardTitle>
      <CardDescription>Understand user search intentions</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8">
        <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Intent Analysis Coming Soon</h3>
        <p className="text-muted-foreground">Advanced search intent classification</p>
      </div>
    </CardContent>
  </Card>
);