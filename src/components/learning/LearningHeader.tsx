
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { BookOpen, Target, Award, Flame } from 'lucide-react';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
export const LearningHeader: React.FC = () => {
  const { displayName, streakDays } = useCurrentUserProfile();
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {displayName}!</h1>
      <p className="text-gray-600 flex items-center gap-2">
        <Flame className="h-4 w-4 text-orange-500" />
        You're on a {streakDays}-day learning streak
      </p>
      
      {/* Quick Navigation */}
      <div className="flex flex-wrap gap-4 mt-6">
        <Link to="/learning/my-courses">
          <Button variant="outline" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            My Courses
          </Button>
        </Link>
        <Link to="/learning/paths">
          <Button variant="outline" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Learning Paths
          </Button>
        </Link>
        <Link to="/learning/certificates">
          <Button variant="outline" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Certificates
          </Button>
        </Link>
      </div>
    </header>
  );
};
