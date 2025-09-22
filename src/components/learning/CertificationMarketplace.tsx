import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, Star, Users, Clock, DollarSign, Shield, Trending, Filter } from 'lucide-react';

export const CertificationMarketplace: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const certifications = [
    {
      id: '1',
      title: 'AWS Solutions Architect Professional',
      provider: 'Amazon Web Services',
      price: 299,
      rating: 4.8,
      enrolled: '45,672',
      duration: '3-6 months',
      difficulty: 'Advanced',
      category: 'Cloud Computing',
      trending: true,
      skills: ['AWS', 'Cloud Architecture', 'System Design'],
      marketValue: 'High',
      jobIncrease: '+23%'
    },
    {
      id: '2',
      title: 'Google Cloud Professional ML Engineer',
      provider: 'Google Cloud',
      price: 199,
      rating: 4.7,
      enrolled: '23,891',
      duration: '4-8 months',
      difficulty: 'Advanced',
      category: 'Machine Learning',
      trending: true,
      skills: ['ML', 'TensorFlow', 'GCP'],
      marketValue: 'Very High',
      jobIncrease: '+31%'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Certification Marketplace
          </h1>
          <p className="text-muted-foreground mt-2">
            Industry-recognized certifications to boost your career
          </p>
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certifications.map((cert) => (
          <Card key={cert.id} className="relative overflow-hidden">
            {cert.trending && (
              <div className="absolute top-4 right-4 z-10">
                <Badge className="bg-red-500 text-white">
                  <Trending className="h-3 w-3 mr-1" />
                  Trending
                </Badge>
              </div>
            )}
            
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{cert.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{cert.provider}</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-primary">${cert.price}</div>
                <Badge variant={cert.marketValue === 'Very High' ? 'default' : 'secondary'}>
                  {cert.marketValue} Value
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {cert.duration}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current text-yellow-500" />
                  {cert.rating}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {cert.enrolled}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {cert.skills?.map((skill, skillIndex) => (
                  <Badge key={skillIndex} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>

              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-sm font-medium text-green-800">Career Impact</div>
                <div className="text-sm text-green-600">{cert.jobIncrease} salary increase</div>
              </div>

              <Button className="w-full">Start Certification Path</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};