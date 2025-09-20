import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Flame, ArrowUp, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Trending = () => {
  return (
    <>
      <Helmet>
        <title>Trending | Hot Topics & Popular Content</title>
        <meta name="description" content="Discover what's trending in your industry. Stay updated with the latest hot topics and popular discussions." />
        <link rel="canonical" href="https://talentxcel.in/trending" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Flame className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Trending Now</h1>
            </div>
            <p className="text-muted-foreground">Discover the hottest topics and conversations in your industry</p>
          </div>

          <div className="grid gap-6">
            {/* Hot Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-primary" />
                  Hot Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: "AI Revolution in Job Market", engagement: "2.5K", growth: "+45%", time: "2h" },
                    { title: "Remote Work Future", engagement: "1.8K", growth: "+32%", time: "4h" },
                    { title: "Green Technology Jobs", engagement: "1.2K", growth: "+28%", time: "6h" },
                    { title: "Cryptocurrency Careers", engagement: "950", growth: "+18%", time: "8h" }
                  ].map((topic, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">#{i + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{topic.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{topic.engagement} posts</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {topic.time}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <ArrowUp className="h-3 w-3" />
                          {topic.growth}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trending Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Trending Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    "React", "TypeScript", "AI/ML", "DevOps", 
                    "Cloud Computing", "Data Science", "Blockchain", "Cybersecurity"
                  ].map((skill, i) => (
                    <div key={i} className="p-3 bg-primary/5 rounded-lg text-center">
                      <p className="font-medium">{skill}</p>
                      <p className="text-xs text-muted-foreground">+{20 + i * 3}% demand</p>
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

export default Trending;