
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { ExportButton } from '@/components/admin/ExportButton';

interface LearningFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  categoryFilter: string;
  setCategoryFilter: (filter: string) => void;
  difficultyFilter: string;
  setDifficultyFilter: (filter: string) => void;
  activeTab: 'courses' | 'paths';
  learningStats: {
    categories: string[];
  } | undefined;
  courses: any[];
  learningPaths: any[];
}

export const LearningFilters: React.FC<LearningFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  difficultyFilter,
  setDifficultyFilter,
  activeTab,
  learningStats,
  courses,
  learningPaths
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {activeTab === 'courses' && (
            <>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Categories</option>
                {learningStats?.categories?.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </>
          )}
          <Button onClick={() => window.open('/admin/learning/create', '_blank')}>
            <Plus className="h-4 w-4 mr-2" />
            Add {activeTab === 'courses' ? 'Course' : 'Path'}
          </Button>
          <ExportButton 
            data={activeTab === 'courses' ? (courses || []) : (learningPaths || [])} 
            filename={`${activeTab}-export`} 
            format="csv"
          />
        </div>
      </CardContent>
    </Card>
  );
};
