import React from 'react';
import { MicrolearningHub } from '@/components/learning/microlearning/MicrolearningHub';
import { updateMetaTags } from '@/utils/metaTags';
import { Zap, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const QuickLearningPage = () => {
  React.useEffect(() => {
    updateMetaTags({
      title: 'Quick Learning | TalentXcel Learning',
      description: 'Bite-sized lessons, quizzes, and flashcards for learning on the go. Master skills in minutes, not hours.'
    });
  }, []);

  // Mock microlearning data
  const mockMicrolearning = {
    quickLessons: [
      {
        id: '1',
        title: 'Arrow Functions in 5 Minutes',
        description: 'Quick refresher on ES6 arrow functions',
        duration: 5,
        difficulty: 'easy' as const,
        category: 'JavaScript',
        completed: true,
        xpReward: 50
      },
      {
        id: '2',
        title: 'CSS Flexbox Basics',
        description: 'Master flexbox layout in minutes',
        duration: 8,
        difficulty: 'medium' as const,
        category: 'CSS',
        completed: false,
        xpReward: 75
      },
      {
        id: '3',
        title: 'React Hooks Quick Guide',
        description: 'Essential React hooks explained quickly',
        duration: 12,
        difficulty: 'medium' as const,
        category: 'React',
        completed: false,
        xpReward: 100
      },
      {
        id: '4',
        title: 'Git Commands Cheat Sheet',
        description: 'Most used Git commands in 10 minutes',
        duration: 10,
        difficulty: 'easy' as const,
        category: 'Git',
        completed: true,
        xpReward: 60
      }
    ],
    quizzes: [
      {
        id: '1',
        title: 'React Hooks Quiz',
        questions: 10,
        timeLimit: 15,
        category: 'React',
        difficulty: 'medium' as const,
        highScore: 85,
        attempts: 3
      },
      {
        id: '2',
        title: 'JavaScript ES6 Quiz',
        questions: 15,
        timeLimit: 20,
        category: 'JavaScript',
        difficulty: 'medium' as const,
        highScore: 92,
        attempts: 2
      },
      {
        id: '3',
        title: 'CSS Grid vs Flexbox',
        questions: 8,
        timeLimit: 12,
        category: 'CSS',
        difficulty: 'easy' as const,
        highScore: null,
        attempts: 0
      }
    ],
    flashcards: [
      {
        id: '1',
        topic: 'JavaScript Keywords',
        cardCount: 25,
        category: 'JavaScript',
        reviewSchedule: 'due' as const,
        nextReview: new Date()
      },
      {
        id: '2',
        topic: 'React Component Lifecycle',
        cardCount: 18,
        category: 'React',
        reviewSchedule: 'upcoming' as const,
        nextReview: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: '3',
        topic: 'CSS Properties',
        cardCount: 30,
        category: 'CSS',
        reviewSchedule: 'completed' as const,
        nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LearningHeader />
        
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <Zap className="h-8 w-8 text-yellow-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quick Learning</h1>
            <p className="text-gray-600">
              Master skills in minutes with bite-sized lessons and interactive content
            </p>
          </div>
        </div>

        {/* Microlearning Hub */}
        <MicrolearningHub {...mockMicrolearning} />
      </div>
    </div>
  );
};

export default QuickLearningPage;