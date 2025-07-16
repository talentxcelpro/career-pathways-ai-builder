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
          <h1 className="text-3xl font-bold">Accelerate Your Career with TalentXcel Academy</h1>
          <p className="text-lg text-muted-foreground">
            AI-Powered Career Tools with TalentXcel Careers
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-800/50">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Discover Top Companies on TalentXcel
            </h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              Explore leading companies and their career opportunities
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-2xl border border-purple-200/50 dark:border-purple-800/50">
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
              Discover Your Perfect College with TalentXcel
            </h3>
            <p className="text-purple-700 dark:text-purple-300 text-sm">
              AI-powered guidance meets real-world insights — explore programs, placements, student reviews, and personalized recommendations to find your ideal college match.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-6 rounded-2xl border border-green-200/50 dark:border-green-800/50">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
              AI Career Roadmap with TalentXcel
            </h3>
            <p className="text-green-700 dark:text-green-300 text-sm">
              Unlock your future with AI-powered insights. Get personalized, step-by-step career roadmaps tailored to your goals, skills, and industry trends.
            </p>
          </div>
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