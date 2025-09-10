import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, Shield, Target, Users, Mail, Network, TrendingUp, FileX } from 'lucide-react';

export const BacklinkSubcategories = () => {
  const [activeCategory, setActiveCategory] = useState('profile');
  
  const categories = [
    { id: 'profile', label: 'Profile', icon: Shield },
    { id: 'opportunities', label: 'Opportunities', icon: Target },
    { id: 'toxic', label: 'Toxic Links', icon: FileX },
    { id: 'competitors', label: 'Competitors', icon: Users },
    { id: 'outreach', label: 'Outreach', icon: Mail },
    { id: 'internal', label: 'Internal', icon: Network },
    { id: 'velocity', label: 'Velocity', icon: TrendingUp },
    { id: 'disavow', label: 'Disavow', icon: FileX }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Backlink Intelligence Center</CardTitle>
        <CardDescription>Complete backlink analysis for TalentXcel.in</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                className="h-20 flex-col gap-2"
                onClick={() => setActiveCategory(category.id)}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{category.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};