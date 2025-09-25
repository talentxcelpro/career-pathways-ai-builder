import React from 'react';
import { MicrolearningHub } from '@/components/learning/microlearning/MicrolearningHub';
import { LearningPageLayout } from '@/components/learning/LearningPageLayout';
import { updateMetaTags } from '@/utils/metaTags';
import { supabase } from '@/integrations/supabase/client';

const QuickLearningPage = () => {
  const [microlearningData, setMicrolearningData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    updateMetaTags({
      title: 'Quick Learning | TalentXcel Learning',
      description: 'Bite-sized lessons, quizzes, and flashcards for learning on the go. Master skills in minutes, not hours.'
    });
    
    fetchMicrolearningData();
  }, []);

  const fetchMicrolearningData = async () => {
    try {
      // Fetch quick lessons from courses with short duration
      const { data: quickLessons, error: lessonsError } = await supabase
        .from('courses')
        .select('id, title, description, duration_hours, difficulty_level, category, skills_taught, rating')
        .lte('duration_hours', 2)
        .eq('published', true)
        .order('rating', { ascending: false })
        .limit(8);

      if (lessonsError) throw lessonsError;

      // Fetch skill assessments for quizzes
      const { data: skillAssessments, error: assessmentsError } = await supabase
        .from('skill_assessments')
        .select('*')
        .limit(6);

      // For flashcards, we'll use skills data
      const { data: skills, error: skillsError } = await supabase
        .from('skills')
        .select('*')
        .limit(6);

      const transformedData = {
        quickLessons: (quickLessons || []).map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description || `Quick lesson on ${lesson.title}`,
          duration: lesson.duration_hours * 60, // Convert to minutes
          difficulty: lesson.difficulty_level,
          category: lesson.category,
          completed: false,
          xpReward: Math.floor(lesson.duration_hours * 25) // XP based on duration
        })),
        quizzes: (skillAssessments || []).length > 0 ? (skillAssessments || []).map(assessment => ({
          id: assessment.id,
          title: `${assessment.skill_name || 'Skill'} Assessment`,
          questions: 10,
          timeLimit: 15,
          category: assessment.category || 'General',
          difficulty: assessment.difficulty_level || 'medium',
          highScore: null,
          attempts: 0
        })) : [
          {
            id: '1',
            title: 'React Fundamentals Quiz',
            questions: 10,
            timeLimit: 15,
            category: 'React',
            difficulty: 'medium',
            highScore: null,
            attempts: 0
          },
          {
            id: '2',
            title: 'JavaScript ES6 Quiz',
            questions: 15,
            timeLimit: 20,
            category: 'JavaScript',
            difficulty: 'medium',
            highScore: null,
            attempts: 0
          }
        ],
        flashcards: (skills || []).length > 0 ? (skills || []).slice(0, 3).map(skill => ({
          id: skill.id,
          topic: skill.name || 'Programming Concepts',
          cardCount: 25,
          category: skill.category || 'Technology',
          reviewSchedule: 'due',
          nextReview: new Date()
        })) : [
          {
            id: '1',
            topic: 'JavaScript Keywords',
            cardCount: 25,
            category: 'JavaScript',
            reviewSchedule: 'due',
            nextReview: new Date()
          },
          {
            id: '2',
            topic: 'React Component Lifecycle',
            cardCount: 18,
            category: 'React',
            reviewSchedule: 'upcoming',
            nextReview: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
          }
        ]
      };

      setMicrolearningData(transformedData);
    } catch (error) {
      console.error('Error fetching microlearning data:', error);
      // Fallback to minimal data if fetch fails
      setMicrolearningData({
        quickLessons: [],
        quizzes: [],
        flashcards: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LearningPageLayout 
        heroTitle="Quick Learning" 
        heroDescription="Bite-sized lessons, quizzes, and flashcards for learning on the go"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gradient-card backdrop-blur-apple rounded-lg p-6 h-32" />
              ))}
            </div>
          </div>
        </div>
      </LearningPageLayout>
    );
  }

  return (
    <LearningPageLayout 
      heroTitle="Quick Learning" 
      heroDescription="Bite-sized lessons, quizzes, and flashcards for learning on the go"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {microlearningData && <MicrolearningHub {...microlearningData} />}
      </div>
    </LearningPageLayout>
  );
};

export default QuickLearningPage;