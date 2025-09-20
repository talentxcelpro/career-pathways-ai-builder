import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, TrendingUp, Star, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SmartFeed = () => {
  return (
    <>
      <Helmet>
        <title>Smart Feed | AI-Powered Professional Content</title>
        <meta name="description" content="Discover personalized professional content powered by AI. Get relevant industry insights and career opportunities." />
        <link rel="canonical" href="https://talentxcel.in/smart-feed" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Brain className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Smart Feed</h1>
            </div>
            <p className="text-muted-foreground">AI-curated content tailored to your professional interests</p>
          </div>

          <div className="grid gap-6">
            {/* AI Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Recommended for You
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: "10 Skills Every Developer Needs in 2024", type: "Article", relevance: 95 },
                  { title: "Remote Work Best Practices", type: "Guide", relevance: 88 },
                  { title: "Industry Salary Trends", type: "Report", relevance: 92 }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{item.relevance}% match</Badge>
                      <Star className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Trending in Your Industry
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "AI & Machine Learning",
                    "Remote Team Management", 
                    "Digital Transformation",
                    "Sustainable Technology"
                  ].map((topic, i) => (
                    <div key={i} className="p-3 bg-primary/5 rounded-lg">
                      <p className="font-medium">{topic}</p>
                      <p className="text-sm text-muted-foreground">Trending now</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default SmartFeed;