
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { BookOpen, Target, Award } from 'lucide-react';

export const LearningHeader: React.FC = () => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Hub</h1>
      <p className="text-gray-600">Advance your career with expert-led courses and learning paths</p>
      
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
    </div>
  );
};
