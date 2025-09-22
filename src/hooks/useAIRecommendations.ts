import { useState, useEffect } from 'react';

interface PersonalizedRecommendation {
  title: string;
  instructor: string;
  description: string;
  duration: string;
  rating: number;
  enrolled: string;
  aiScore: number;
  relevanceScore: number;
  skills: string[];
}

interface SkillGap {
  skill: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  currentLevel: number;
  targetLevel: number;
  marketDemand: number;
  recommendedCourses: Array<{
    title: string;
    duration: string;
  }>;
}

interface CareerPath {
  title: string;
  description: string;
  timeToComplete: string;
  successProbability: number;
  salaryRange: string;
  jobOpenings: string;
  milestones: Array<{
    title: string;
    description: string;
    duration: string;
    completed: boolean;
  }>;
}

interface TrendingCourse {
  title: string;
  instructor: string;
  growthRate: number;
  popularityScore: number;
  enrolled: string;
  rating: number;
}

interface CollaborativeGroup {
  title: string;
  description: string;
  courses: Array<{
    title: string;
    peersEnrolled: number;
  }>;
}

export const useAIRecommendations = () => {
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [skillGapAnalysis, setSkillGapAnalysis] = useState<SkillGap[]>([]);
  const [careerPathSuggestions, setCareerPathSuggestions] = useState<CareerPath[]>([]);
  const [trendingCourses, setTrendingCourses] = useState<TrendingCourse[]>([]);
  const [collaborativeFiltering, setCollaborativeFiltering] = useState<CollaborativeGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllRecommendations();
  }, []);

  const fetchAllRecommendations = async () => {
    try {
      setIsLoading(true);
      
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock personalized recommendations
      const mockPersonalized: PersonalizedRecommendation[] = [
        {
          title: 'Advanced React Patterns',
          instructor: 'Sarah Chen',
          description: 'Master advanced React concepts including hooks, context, and performance optimization.',
          duration: '6 weeks',
          rating: 4.8,
          enrolled: '12,847',
          aiScore: 96,
          relevanceScore: 94,
          skills: ['React Hooks', 'Performance', 'State Management']
        },
        {
          title: 'Machine Learning for Developers',
          instructor: 'Dr. Alex Kumar',
          description: 'Introduction to ML concepts and practical implementation for software engineers.',
          duration: '8 weeks',
          rating: 4.7,
          enrolled: '8,234',
          aiScore: 89,
          relevanceScore: 87,
          skills: ['Python', 'TensorFlow', 'Data Science']
        },
        {
          title: 'Cloud Native Architecture',
          instructor: 'Michael Rodriguez',
          description: 'Design and build scalable cloud-native applications using modern patterns.',
          duration: '10 weeks',
          rating: 4.9,
          enrolled: '15,672',
          aiScore: 92,
          relevanceScore: 90,
          skills: ['Kubernetes', 'Docker', 'Microservices']
        },
        {
          title: 'Full Stack TypeScript',
          instructor: 'Emma Thompson',
          description: 'Complete TypeScript development from frontend to backend.',
          duration: '12 weeks',
          rating: 4.6,
          enrolled: '9,891',
          aiScore: 85,
          relevanceScore: 83,
          skills: ['TypeScript', 'Node.js', 'REST APIs']
        }
      ];

      // Mock skills gap analysis
      const mockSkillsGap: SkillGap[] = [
        {
          skill: 'Machine Learning',
          category: 'Technical Skills',
          priority: 'high',
          currentLevel: 3,
          targetLevel: 7,
          marketDemand: 89,
          recommendedCourses: [
            { title: 'ML Fundamentals', duration: '4 weeks' },
            { title: 'Python for Data Science', duration: '3 weeks' }
          ]
        },
        {
          skill: 'Cloud Architecture',
          category: 'Infrastructure',
          priority: 'medium',
          currentLevel: 5,
          targetLevel: 8,
          marketDemand: 76,
          recommendedCourses: [
            { title: 'AWS Solutions Architect', duration: '6 weeks' },
            { title: 'Kubernetes Fundamentals', duration: '4 weeks' }
          ]
        },
        {
          skill: 'Leadership & Management',
          category: 'Soft Skills',
          priority: 'medium',
          currentLevel: 4,
          targetLevel: 7,
          marketDemand: 68,
          recommendedCourses: [
            { title: 'Technical Leadership', duration: '5 weeks' },
            { title: 'Agile Management', duration: '3 weeks' }
          ]
        }
      ];

      // Mock career paths
      const mockCareerPaths: CareerPath[] = [
        {
          title: 'Senior Full Stack Developer',
          description: 'Progress from mid-level to senior developer role with comprehensive technical and leadership skills',
          timeToComplete: '8-12 months',
          successProbability: 87,
          salaryRange: '$90k-$130k',
          jobOpenings: '2,847',
          milestones: [
            { title: 'Advanced React Mastery', description: 'Complete advanced patterns course', duration: '6 weeks', completed: false },
            { title: 'Backend Architecture', description: 'Learn microservices design', duration: '8 weeks', completed: false },
            { title: 'Leadership Skills', description: 'Develop team leadership abilities', duration: '4 weeks', completed: false },
            { title: 'System Design', description: 'Master large-scale system design', duration: '6 weeks', completed: false }
          ]
        },
        {
          title: 'Machine Learning Engineer',
          description: 'Transition into ML engineering with focus on production systems and model deployment',
          timeToComplete: '12-18 months',
          successProbability: 72,
          salaryRange: '$110k-$180k',
          jobOpenings: '1,234',
          milestones: [
            { title: 'Python & ML Basics', description: 'Foundation in Python and ML concepts', duration: '8 weeks', completed: true },
            { title: 'Deep Learning', description: 'Neural networks and deep learning', duration: '10 weeks', completed: false },
            { title: 'MLOps & Deployment', description: 'Production ML systems', duration: '8 weeks', completed: false },
            { title: 'Advanced ML', description: 'Specialized ML techniques', duration: '12 weeks', completed: false }
          ]
        }
      ];

      // Mock trending courses
      const mockTrending: TrendingCourse[] = [
        {
          title: 'ChatGPT for Developers',
          instructor: 'AI Experts',
          growthRate: 340,
          popularityScore: 95,
          enrolled: '45,672',
          rating: 4.9
        },
        {
          title: 'Web3 Development',
          instructor: 'Blockchain Academy',
          growthRate: 156,
          popularityScore: 82,
          enrolled: '23,891',
          rating: 4.6
        },
        {
          title: 'Rust Programming',
          instructor: 'Systems Programming Pro',
          growthRate: 128,
          popularityScore: 78,
          enrolled: '18,445',
          rating: 4.7
        },
        {
          title: 'Advanced Docker & Kubernetes',
          instructor: 'Cloud Native Expert',
          growthRate: 89,
          popularityScore: 84,
          enrolled: '31,256',
          rating: 4.8
        }
      ];

      // Mock collaborative filtering
      const mockCollaborative: CollaborativeGroup[] = [
        {
          title: 'JavaScript Developers Like You',
          description: 'Courses popular among JavaScript developers with similar experience',
          courses: [
            { title: 'Advanced TypeScript', peersEnrolled: 234 },
            { title: 'Node.js Performance', peersEnrolled: 189 },
            { title: 'React Testing Library', peersEnrolled: 156 },
            { title: 'GraphQL Mastery', peersEnrolled: 143 }
          ]
        },
        {
          title: 'Career Changers to Tech',
          description: 'Popular learning paths for professionals transitioning to technology',
          courses: [
            { title: 'Full Stack Bootcamp', peersEnrolled: 567 },
            { title: 'Data Science Fundamentals', peersEnrolled: 423 },
            { title: 'UX/UI Design Basics', peersEnrolled: 389 },
            { title: 'Agile & Scrum', peersEnrolled: 312 }
          ]
        },
        {
          title: 'Senior Developers',
          description: 'Advanced courses taken by senior-level professionals',
          courses: [
            { title: 'System Design Interviews', peersEnrolled: 445 },
            { title: 'Architecture Patterns', peersEnrolled: 378 },
            { title: 'Technical Leadership', peersEnrolled: 298 },
            { title: 'Performance Optimization', peersEnrolled: 267 }
          ]
        }
      ];
      
      setPersonalizedRecommendations(mockPersonalized);
      setSkillGapAnalysis(mockSkillsGap);
      setCareerPathSuggestions(mockCareerPaths);
      setTrendingCourses(mockTrending);
      setCollaborativeFiltering(mockCollaborative);
    } catch (error) {
      console.error('Failed to fetch AI recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshRecommendations = () => {
    fetchAllRecommendations();
  };

  return {
    personalizedRecommendations,
    skillGapAnalysis,
    careerPathSuggestions,
    trendingCourses,
    collaborativeFiltering,
    isLoading,
    refreshRecommendations
  };
};