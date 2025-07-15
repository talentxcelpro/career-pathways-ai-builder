import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Brain, ShoppingCart, TrendingUp } from "lucide-react";
import PersonalizedLearningPaths from "@/components/learning/PersonalizedLearningPaths";
import SkillAssessments from "@/components/learning/SkillAssessments";
import ServiceMarketplace from "@/components/marketplace/ServiceMarketplace";

export default function LearningHub() {
  const [activeTab, setActiveTab] = useState("learning-paths");

  const stats = [
    {
      title: "Learning Paths",
      value: "12",
      description: "Active learning journeys",
      icon: BookOpen,
      color: "text-blue-600"
    },
    {
      title: "Skills Assessed",
      value: "8",
      description: "Validated competencies",
      icon: Brain,
      color: "text-purple-600"
    },
    {
      title: "Services Available",
      value: "150+",
      description: "Expert career services",
      icon: ShoppingCart,
      color: "text-green-600"
    },
    {
      title: "Skill Growth",
      value: "+25%",
      description: "This month",
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Learning & Development Hub</h1>
          <p className="text-lg text-muted-foreground">
            Accelerate your career with AI-powered learning paths, skill assessments, and expert services
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <IconComponent className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="learning-paths" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Learning Paths
          </TabsTrigger>
          <TabsTrigger value="assessments" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Skill Assessments
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Service Marketplace
          </TabsTrigger>
        </TabsList>

        <TabsContent value="learning-paths" className="space-y-6">
          <PersonalizedLearningPaths />
        </TabsContent>

        <TabsContent value="assessments" className="space-y-6">
          <SkillAssessments />
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-6">
          <ServiceMarketplace />
        </TabsContent>
      </Tabs>
    </div>
  );
}