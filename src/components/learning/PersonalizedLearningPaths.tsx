import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Target, Clock, Trophy, Plus, Play } from "lucide-react";
import { toast } from "sonner";

// Mock data for demonstration
const mockLearningPaths = [
  {
    id: "1",
    title: "Full-Stack Developer Journey",
    description: "A comprehensive path to become a full-stack developer with modern technologies",
    target_role: "Full-Stack Developer",
    difficulty_level: "intermediate" as const,
    estimated_duration_hours: 120,
    skills_covered: ["React", "Node.js", "TypeScript", "Database Design", "API Development"],
    completion_percentage: 45,
    ai_generated: true
  },
  {
    id: "2",
    title: "Data Science Fundamentals",
    description: "Learn the basics of data science, machine learning, and analytics",
    target_role: "Data Scientist",
    difficulty_level: "beginner" as const,
    estimated_duration_hours: 80,
    skills_covered: ["Python", "Pandas", "Machine Learning", "Statistics", "Visualization"],
    completion_percentage: 0,
    ai_generated: true
  }
];

export default function PersonalizedLearningPaths() {
  const [learningPaths, setLearningPaths] = useState(mockLearningPaths);

  const createAILearningPath = () => {
    const newPath = {
      id: Date.now().toString(),
      title: "Product Management Mastery",
      description: "Learn to build and manage successful products from conception to launch",
      target_role: "Product Manager",
      difficulty_level: "intermediate" as const,
      estimated_duration_hours: 100,
      skills_covered: ["Product Strategy", "User Research", "Analytics", "Agile", "Leadership"],
      completion_percentage: 0,
      ai_generated: true
    };
    setLearningPaths([newPath, ...learningPaths]);
    toast.success('AI learning path created!');
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Personalized Learning Paths</h2>
          <p className="text-muted-foreground">AI-curated learning journeys tailored to your career goals</p>
        </div>
        <Button onClick={createAILearningPath} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Generate AI Path
        </Button>
      </div>

      <div className="grid gap-6">
        {learningPaths.map((path) => (
          <Card key={path.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">{path.title}</CardTitle>
                    {path.ai_generated && (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        AI Generated
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">{path.description}</p>
                </div>
                <Badge className={getDifficultyColor(path.difficulty_level)}>
                  {path.difficulty_level}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">{path.target_role}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{path.estimated_duration_hours} hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">{path.completion_percentage}% Complete</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Progress</label>
                <Progress value={path.completion_percentage} className="w-full" />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Skills You'll Learn</label>
                <div className="flex flex-wrap gap-2">
                  {path.skills_covered.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex items-center gap-2">
                  {path.completion_percentage > 0 ? (
                    <>
                      <Play className="h-4 w-4" />
                      Continue Learning
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Start Learning
                    </>
                  )}
                </Button>
                <Button variant="outline">View Details</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}