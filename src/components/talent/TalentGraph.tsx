import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Award, 
  BookOpen, 
  Briefcase, 
  DollarSign,
  Users,
  Lightbulb,
  ArrowRight,
  Star
} from "lucide-react";
import { SkillAssessment } from "@/components/skills/SkillAssessment";
import { LearningPipeline } from "@/components/learning/LearningPipeline";

interface UserSkill {
  id: string;
  skill_id: string;
  proficiency_level: number;
  proficiency_type: 'self_assessed' | 'test_verified' | 'employer_verified' | 'project_verified';
  years_experience: number;
  skills_master: {
    name: string;
    category: string;
    market_demand_score: number;
    difficulty_level: string;
  };
}

interface CareerGoal {
  id: string;
  target_role: string;
  target_salary: number;
  timeline_months: number;
  current_readiness_score: number;
  skill_gaps: any;
}

interface JobMatch {
  job_id: string;
  job_title: string;
  company_name: string;
  match_percentage: number;
  salary_min: number;
  salary_max: number;
  missing_skills: string[];
}

interface SimpleJob {
  id: string;
  title: string;
  salary_min: number | null;
  salary_max: number | null;
  company_id: string | null;
}

interface SimpleCompany {
  id: string;
  name: string;
}

export function TalentGraph() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [showAssessment, setShowAssessment] = useState(false);

  // Fetch user's skills
  const { data: userSkills, isLoading: skillsLoading } = useQuery({
    queryKey: ["user-skills"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("user_skills")
        .select(`
          *,
          skills_master (
            name,
            category,
            market_demand_score,
            difficulty_level
          )
        `)
        .eq("user_id", user.id)
        .order('proficiency_level', { ascending: false });

      if (error) throw error;
      return data as UserSkill[];
    },
  });

  // Fetch user's career goals
  const { data: careerGoals } = useQuery({
    queryKey: ["user-career-goals"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("user_career_goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CareerGoal[];
    },
  });

  // Calculate job matches
  const { data: jobMatches } = useQuery({
    queryKey: ["job-matches"],
    queryFn: async () => {
      // Mock data to avoid TypeScript deep instantiation issues
      // In production, this would use the calculate_job_skill_match function
      const mockJobs: JobMatch[] = [
        {
          job_id: "1",
          job_title: "Senior Frontend Developer",
          company_name: "TechCorp",
          match_percentage: 85,
          salary_min: 1200000,
          salary_max: 1800000,
          missing_skills: ["TypeScript", "GraphQL"]
        },
        {
          job_id: "2", 
          job_title: "Full Stack Engineer",
          company_name: "StartupXYZ",
          match_percentage: 78,
          salary_min: 1000000,
          salary_max: 1500000,
          missing_skills: ["AWS", "Docker"]
        },
        {
          job_id: "3",
          job_title: "React Developer",
          company_name: "WebSolutions",
          match_percentage: 92,
          salary_min: 800000,
          salary_max: 1200000,
          missing_skills: ["Redux"]
        }
      ];

      return mockJobs;
    },
  });

  // Calculate talent score
  const calculateTalentScore = () => {
    if (!userSkills?.length) return 0;
    
    const totalScore = userSkills.reduce((sum, skill) => {
      const marketWeight = skill.skills_master.market_demand_score / 100;
      const proficiencyWeight = skill.proficiency_level / 100;
      const verificationBonus = skill.proficiency_type === 'test_verified' ? 1.2 : 
                               skill.proficiency_type === 'employer_verified' ? 1.1 : 1.0;
      
      return sum + (marketWeight * proficiencyWeight * verificationBonus * 100);
    }, 0);
    
    return Math.min(100, Math.round(totalScore / userSkills.length));
  };

  const talentScore = calculateTalentScore();

  // Group skills by category
  const skillsByCategory = userSkills?.reduce((acc, skill) => {
    const category = skill.skills_master.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, UserSkill[]>) || {};

  const SkillCard = ({ skill }: { skill: UserSkill }) => {
    const getVerificationIcon = (type: string) => {
      switch (type) {
        case 'test_verified': return <Award className="w-4 h-4 text-blue-500" />;
        case 'employer_verified': return <Briefcase className="w-4 h-4 text-green-500" />;
        case 'project_verified': return <Star className="w-4 h-4 text-purple-500" />;
        default: return <Users className="w-4 h-4 text-gray-400" />;
      }
    };

    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">{skill.skills_master.name}</h4>
            {getVerificationIcon(skill.proficiency_type)}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Proficiency</span>
              <span>{skill.proficiency_level}%</span>
            </div>
            <Progress value={skill.proficiency_level} className="h-2" />
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{skill.years_experience} years exp</span>
              <Badge variant="outline" className="text-xs">
                Demand: {skill.skills_master.market_demand_score}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (showAssessment) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setShowAssessment(false)}
          className="mb-4"
        >
          ← Back to Talent Graph
        </Button>
        <SkillAssessment onComplete={() => setShowAssessment(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Your Talent Graph</h1>
        <p className="text-muted-foreground">
          AI-powered insights connecting your skills, learning, and career opportunities
        </p>
      </div>

      {/* Talent Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-500" />
            Talent Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl font-bold text-blue-600">{talentScore}</div>
            <Badge variant={talentScore >= 80 ? "default" : talentScore >= 60 ? "secondary" : "outline"}>
              {talentScore >= 80 ? "Excellent" : talentScore >= 60 ? "Good" : "Developing"}
            </Badge>
          </div>
          <Progress value={talentScore} className="mb-4" />
          <p className="text-sm text-muted-foreground">
            Your talent score is calculated based on skill proficiency, market demand, and verification level.
          </p>
        </CardContent>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="opportunities">Jobs</TabsTrigger>
          <TabsTrigger value="learning">Learning</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Skills Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="w-5 h-5" />
                  Skills Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Skills</span>
                    <span className="font-medium">{userSkills?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Verified</span>
                    <span className="font-medium">
                      {userSkills?.filter(s => s.proficiency_type !== 'self_assessed').length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Proficiency</span>
                    <span className="font-medium">
                      {userSkills?.length ? Math.round(userSkills.reduce((sum, s) => sum + s.proficiency_level, 0) / userSkills.length) : 0}%
                    </span>
                  </div>
                </div>
                <Button 
                  className="w-full mt-4" 
                  variant="outline"
                  onClick={() => setShowAssessment(true)}
                >
                  Take Skill Assessment
                </Button>
              </CardContent>
            </Card>

            {/* Career Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5" />
                  Career Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {careerGoals && careerGoals.length > 0 ? (
                  <div className="space-y-3">
                    {careerGoals.slice(0, 2).map((goal) => (
                      <div key={goal.id} className="p-3 bg-muted rounded-lg">
                        <p className="font-medium text-sm">{goal.target_role}</p>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Readiness: {goal.current_readiness_score}%</span>
                          <span>{goal.timeline_months} months</span>
                        </div>
                        <Progress value={goal.current_readiness_score} className="h-1 mt-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-3">No career goals set</p>
                    <Button variant="outline" size="sm">
                      Set Career Goal
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Job Matches */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Briefcase className="w-5 h-5" />
                  Top Job Matches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {jobMatches?.slice(0, 3).map((match) => (
                    <div key={match.job_id} className="p-3 bg-muted rounded-lg">
                      <p className="font-medium text-sm">{match.job_title}</p>
                      <p className="text-xs text-muted-foreground">{match.company_name}</p>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-green-600">{match.match_percentage}% match</span>
                        <span>₹{match.salary_min/100000}L - ₹{match.salary_max/100000}L</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Your Skills</h3>
            <Button onClick={() => setShowAssessment(true)}>
              <Award className="w-4 h-4 mr-2" />
              Take Assessment
            </Button>
          </div>

          {skillsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-2 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(skillsByCategory).map(([category, skills]) => (
                <div key={category}>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    {category} ({skills.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {skills.map((skill) => (
                      <SkillCard key={skill.id} skill={skill} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-4">
          <h3 className="text-xl font-semibold">Job Opportunities</h3>
          
          <div className="grid gap-4">
            {jobMatches?.map((match) => (
              <Card key={match.job_id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium">{match.job_title}</h4>
                      <p className="text-sm text-muted-foreground">{match.company_name}</p>
                    </div>
                    <Badge variant={match.match_percentage >= 80 ? "default" : "secondary"}>
                      {match.match_percentage}% match
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="flex items-center gap-1 text-sm">
                      <DollarSign className="w-4 h-4" />
                      ₹{match.salary_min/100000}L - ₹{match.salary_max/100000}L
                    </span>
                    <Progress value={match.match_percentage} className="w-24 h-2" />
                  </div>
                  
                  {match.missing_skills.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-muted-foreground mb-1">Skills to develop:</p>
                      <div className="flex flex-wrap gap-1">
                        {match.missing_skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      View Job
                    </Button>
                    <Button size="sm" variant="outline">
                      <Lightbulb className="w-4 h-4 mr-1" />
                      Get Ready
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="learning">
          <LearningPipeline 
            targetRole={careerGoals?.[0]?.target_role}
            skillGaps={careerGoals?.[0]?.skill_gaps?.map(sg => sg.skill_name) || []}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}