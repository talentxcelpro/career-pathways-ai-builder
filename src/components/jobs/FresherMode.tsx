import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  GraduationCap, 
  Target, 
  BookOpen, 
  Trophy, 
  CheckCircle,
  Clock,
  Briefcase,
  Users,
  TrendingUp,
  Award,
  Star,
  ChevronRight,
  PlayCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

interface FresherProfile {
  readiness_score: number;
  completed_courses: number;
  certifications: number;
  projects_showcased: number;
  internship_completed: boolean;
  resume_score: number;
  interview_practice_sessions: number;
}

interface SkillTrack {
  id: string;
  name: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration_weeks: number;
  skills: string[];
  job_prospects: string[];
  salary_range: string;
  completion_rate: number;
}

const FRESHER_TRACKS: SkillTrack[] = [
  {
    id: 'frontend-dev',
    name: 'Frontend Developer',
    description: 'Master modern web development with React, TypeScript, and UI/UX principles',
    difficulty: 'Beginner',
    duration_weeks: 16,
    skills: ['HTML/CSS', 'JavaScript', 'React', 'TypeScript', 'Tailwind CSS'],
    job_prospects: ['Frontend Developer', 'UI Developer', 'React Developer'],
    salary_range: '₹3-8 LPA',
    completion_rate: 78
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    description: 'Learn data analysis, visualization, and insights generation',
    difficulty: 'Beginner',
    duration_weeks: 12,
    skills: ['Excel', 'SQL', 'Python', 'Tableau/Power BI', 'Statistics'],
    job_prospects: ['Data Analyst', 'Business Analyst', 'Data Scientist'],
    salary_range: '₹4-10 LPA',
    completion_rate: 85
  },
  {
    id: 'digital-marketing',
    name: 'Digital Marketing',
    description: 'Master online marketing, SEO, social media, and analytics',
    difficulty: 'Beginner',
    duration_weeks: 10,
    skills: ['SEO/SEM', 'Google Analytics', 'Social Media', 'Content Marketing'],
    job_prospects: ['Digital Marketer', 'SEO Specialist', 'Social Media Manager'],
    salary_range: '₹3-7 LPA',
    completion_rate: 82
  },
  {
    id: 'full-stack',
    name: 'Full Stack Developer',
    description: 'Complete web development with frontend, backend, and databases',
    difficulty: 'Intermediate',
    duration_weeks: 24,
    skills: ['React', 'Node.js', 'MongoDB', 'Express', 'APIs'],
    job_prospects: ['Full Stack Developer', 'Software Engineer', 'Backend Developer'],
    salary_range: '₹5-12 LPA',
    completion_rate: 71
  }
];

export const FresherMode: React.FC = () => {
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);

  const { data: currentUser } = useQuery({
    queryKey: ['current-user-fresher'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return { ...user, profile };
    }
  });

  const { data: fresherProfile } = useQuery({
    queryKey: ['fresher-profile', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return null;
      
      // Mock data for demonstration - in real app, this would come from user's activity
      const mockProfile: FresherProfile = {
        readiness_score: 65,
        completed_courses: 3,
        certifications: 1,
        projects_showcased: 2,
        internship_completed: false,
        resume_score: 78,
        interview_practice_sessions: 4
      };
      
      return mockProfile;
    },
    enabled: !!currentUser
  });

  const { data: recommendedJobs } = useQuery({
    queryKey: ['fresher-recommended-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          id, title, company_id, location, salary_min, salary_max, experience_level,
          companies(name, logo_url)
        `)
        .eq('experience_level', 'entry')
        .eq('is_active', true)
        .limit(6);

      if (error) throw error;
      return data;
    }
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReadinessStatus = (score: number) => {
    if (score >= 80) return { status: 'Job Ready', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (score >= 60) return { status: 'Almost Ready', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { status: 'Building Skills', color: 'text-orange-600', bgColor: 'bg-orange-50' };
  };

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Join Fresher Mode</h3>
          <p className="text-gray-600 mb-4">
            Get personalized guidance for your career journey
          </p>
          <Link to="/auth/login">
            <Button>Get Started</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Job Readiness Dashboard */}
      {fresherProfile && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Job Readiness Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-bold text-blue-900">{fresherProfile.readiness_score}%</div>
                <div className={`text-sm font-medium px-3 py-1 rounded-full ${getReadinessStatus(fresherProfile.readiness_score).bgColor} ${getReadinessStatus(fresherProfile.readiness_score).color}`}>
                  {getReadinessStatus(fresherProfile.readiness_score).status}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 mb-1">Next milestone at 80%</div>
                <Progress value={fresherProfile.readiness_score} className="w-32" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-3 bg-white rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className="text-lg font-semibold">{fresherProfile.completed_courses}</div>
                <div className="text-xs text-gray-600">Courses</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <Trophy className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                <div className="text-lg font-semibold">{fresherProfile.certifications}</div>
                <div className="text-xs text-gray-600">Certificates</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <Award className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <div className="text-lg font-semibold">{fresherProfile.projects_showcased}</div>
                <div className="text-xs text-gray-600">Projects</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 mt-4">
              <Link to="/resume/upload" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Improve Resume ({fresherProfile.resume_score}%)
                </Button>
              </Link>
              <Link to="/tools/interview-prep" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Practice Interview
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skill Tracks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-purple-600" />
            Fresher Career Tracks
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Structured learning paths designed for new graduates
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {FRESHER_TRACKS.map((track) => (
              <div 
                key={track.id} 
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedTrack === track.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
                }`}
                onClick={() => setSelectedTrack(selectedTrack === track.id ? null : track.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{track.name}</h4>
                      <Badge className={getDifficultyColor(track.difficulty)}>
                        {track.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {track.duration_weeks} weeks
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{track.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {track.duration_weeks} weeks
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {track.completion_rate}% completion rate
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {track.salary_range}
                      </div>
                    </div>
                  </div>
                  
                  <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${
                    selectedTrack === track.id ? 'rotate-90' : ''
                  }`} />
                </div>

                {/* Expanded Content */}
                {selectedTrack === track.id && (
                  <div className="mt-4 pt-4 border-t space-y-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Skills You'll Learn</h5>
                      <div className="flex flex-wrap gap-2">
                        {track.skills.map((skill) => (
                          <Badge key={skill} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Job Opportunities</h5>
                      <div className="flex flex-wrap gap-2">
                        {track.job_prospects.map((job) => (
                          <Badge key={job} variant="outline">{job}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link to={`/learning/tracks/${track.id}`} className="flex-1">
                        <Button className="w-full">
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Start Learning
                        </Button>
                      </Link>
                      <Link to={`/learning/tracks/${track.id}/preview`}>
                        <Button variant="outline">
                          Preview
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Entry-Level Jobs */}
      {recommendedJobs && recommendedJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-green-600" />
              Entry-Level Opportunities
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Jobs perfect for new graduates and career starters
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {recommendedJobs.slice(0, 4).map((job) => (
                <Link key={job.id} to={`/jobs/${job.id}`}>
                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{job.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{job.companies?.name}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{job.location}</span>
                          {job.salary_min && job.salary_max && (
                            <span>₹{job.salary_min}-{job.salary_max} LPA</span>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Fresher Friendly
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <Link to="/jobs?experience_level=entry">
                <Button variant="outline">
                  View All Entry-Level Jobs
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};