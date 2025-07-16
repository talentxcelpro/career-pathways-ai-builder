import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";

interface ABTest {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  variant_a: string;
  variant_b: string;
  traffic_split: number;
  conversion_rate_a: number;
  conversion_rate_b: number;
  participants: number;
  confidence_level: number;
  start_date: string;
  end_date?: string;
}

export const ABTestingDashboard = () => {
  const [activeTests] = useState<ABTest[]>([
    {
      id: '1',
      name: 'Service Card CTA Button',
      status: 'running',
      variant_a: 'Get Quote',
      variant_b: 'Start Project',
      traffic_split: 50,
      conversion_rate_a: 3.2,
      conversion_rate_b: 4.7,
      participants: 1248,
      confidence_level: 87,
      start_date: '2024-01-15'
    },
    {
      id: '2',
      name: 'Pricing Display Format',
      status: 'completed',
      variant_a: 'Starting at ₹5,000',
      variant_b: 'From ₹5,000/project',
      traffic_split: 50,
      conversion_rate_a: 2.8,
      conversion_rate_b: 3.9,
      participants: 2156,
      confidence_level: 95,
      start_date: '2024-01-01',
      end_date: '2024-01-14'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'completed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'paused': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getWinningVariant = (test: ABTest) => {
    return test.conversion_rate_b > test.conversion_rate_a ? 'B' : 'A';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">A/B Testing Dashboard</h2>
          <p className="text-muted-foreground">Optimize conversion rates through experimentation</p>
        </div>
        <Button>
          <Target className="h-4 w-4 mr-2" />
          Create New Test
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Tests</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <Play className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
                <p className="text-2xl font-bold">91%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Participants</p>
                <p className="text-2xl font-bold">3.4K</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Uplift Rate</p>
                <p className="text-2xl font-bold">+15.2%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tests List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Tests</TabsTrigger>
          <TabsTrigger value="running">Running</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {activeTests.map((test) => (
            <Card key={test.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{test.name}</CardTitle>
                    <CardDescription>
                      Started {test.start_date} • {test.participants} participants
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(test.status)}>
                      {test.status}
                    </Badge>
                    {test.status === 'running' && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          <Pause className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Variant A */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Variant A: {test.variant_a}</h4>
                      <span className="text-sm text-muted-foreground">
                        {test.conversion_rate_a}% conversion
                      </span>
                    </div>
                    <Progress value={test.conversion_rate_a * 10} className="h-2" />
                  </div>

                  {/* Variant B */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Variant B: {test.variant_b}</h4>
                      <span className="text-sm text-muted-foreground">
                        {test.conversion_rate_b}% conversion
                      </span>
                    </div>
                    <Progress value={test.conversion_rate_b * 10} className="h-2" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span>Confidence: {test.confidence_level}%</span>
                    <span>Traffic Split: {test.traffic_split}%</span>
                  </div>
                  {test.status === 'completed' && (
                    <Badge variant="outline" className="text-green-600">
                      Winner: Variant {getWinningVariant(test)}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};