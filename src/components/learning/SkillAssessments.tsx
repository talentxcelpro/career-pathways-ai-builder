import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Award, Clock, Target, Play, CheckCircle, Star } from "lucide-react";
import { toast } from "sonner";

// Mock data for demonstration
const mockAssessments = [
  {
    id: "1",
    skill_name: "React.js",
    skill_category: "programming",
    assessment_type: "quiz" as const,
    score: 85,
    max_score: 100,
    passed: true,
    certificate_earned: true,
    time_taken_minutes: 45,
    completed_at: "2024-01-15T10:30:00Z"
  },
  {
    id: "2",
    skill_name: "UI/UX Design",
    skill_category: "design",
    assessment_type: "practical" as const,
    score: 92,
    max_score: 100,
    passed: true,
    certificate_earned: true,
    time_taken_minutes: 60,
    completed_at: "2024-01-10T14:20:00Z"
  }
];

export default function SkillAssessments() {
  const [assessments, setAssessments] = useState(mockAssessments);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    'all', 'programming', 'design', 'marketing', 'management', 'data_science'
  ];

  const availableAssessments = [
    { name: 'React.js', category: 'programming', type: 'quiz' as const },
    { name: 'UI/UX Design', category: 'design', type: 'practical' as const },
    { name: 'Leadership', category: 'management', type: 'ai_interview' as const },
    { name: 'Digital Marketing', category: 'marketing', type: 'quiz' as const },
    { name: 'Python', category: 'programming', type: 'practical' as const },
    { name: 'Data Analysis', category: 'data_science', type: 'quiz' as const }
  ];

  const startAssessment = (skillName: string) => {
    const newAssessment = {
      id: Date.now().toString(),
      skill_name: skillName,
      skill_category: 'programming',
      assessment_type: 'quiz' as const,
      score: undefined,
      max_score: 100,
      passed: undefined,
      certificate_earned: false,
      time_taken_minutes: undefined,
      completed_at: undefined
    };
    setAssessments([newAssessment, ...assessments]);
    toast.success(`Started ${skillName} assessment!`);
  };

  const getAssessmentTypeIcon = (type: string) => {
    switch (type) {
      case 'quiz': return Brain;
      case 'practical': return Target;
      case 'ai_interview': return Play;
      case 'peer_review': return Star;
      default: return Brain;
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredAssessments = selectedCategory === 'all' 
    ? assessments 
    : assessments.filter(a => a.skill_category === selectedCategory);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Skill Assessments</h2>
        <p className="text-muted-foreground">Test and validate your skills with AI-powered assessments</p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category.replace('_', ' ')}
          </Button>
        ))}
      </div>

      {/* Available Assessments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Available Assessments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableAssessments
              .filter(skill => selectedCategory === 'all' || skill.category === selectedCategory)
              .map((skill, index) => {
                const isCompleted = assessments.some(a => 
                  a.skill_name === skill.name && a.completed_at
                );
                const IconComponent = getAssessmentTypeIcon(skill.type);
                
                return (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{skill.name}</h3>
                          <IconComponent className="h-4 w-4 text-blue-600" />
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {skill.category.replace('_', ' ')}
                        </Badge>
                        <Badge variant="secondary" className="capitalize">
                          {skill.type.replace('_', ' ')}
                        </Badge>
                        {isCompleted ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm">Completed</span>
                          </div>
                        ) : (
                          <Button 
                            size="sm" 
                            className="w-full"
                            onClick={() => startAssessment(skill.name)}
                          >
                            Start Assessment
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Completed Assessments */}
      {filteredAssessments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Your Assessment Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAssessments.map((assessment) => (
                <div key={assessment.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{assessment.skill_name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {assessment.skill_category.replace('_', ' ')} • {assessment.assessment_type.replace('_', ' ')}
                      </p>
                    </div>
                    {assessment.certificate_earned && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Award className="h-3 w-3 mr-1" />
                        Certified
                      </Badge>
                    )}
                  </div>

                  {assessment.completed_at ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Score</span>
                        <span className={`font-semibold ${getScoreColor(assessment.score || 0, assessment.max_score)}`}>
                          {assessment.score}/{assessment.max_score}
                        </span>
                      </div>
                      <Progress 
                        value={(assessment.score || 0) / assessment.max_score * 100} 
                        className="w-full"
                      />
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {assessment.time_taken_minutes && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {assessment.time_taken_minutes} min
                          </div>
                        )}
                        <div>
                          Completed: {new Date(assessment.completed_at).toLocaleDateString()}
                        </div>
                        {assessment.passed && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Passed
                          </Badge>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-blue-600">
                      <Play className="h-4 w-4" />
                      <span className="text-sm">In Progress</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}