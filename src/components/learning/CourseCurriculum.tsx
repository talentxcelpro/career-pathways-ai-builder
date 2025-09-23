
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Play, FileText, CheckCircle, Lock } from 'lucide-react';

interface CurriculumModule {
  id: string;
  title: string;
  duration_minutes: number;
  lessons: {
    id: string;
    title: string;
    type: 'video' | 'text' | 'quiz';
    duration_minutes: number;
    is_free: boolean;
    is_completed?: boolean;
  }[];
}

interface CourseCurriculumProps {
  modules: CurriculumModule[];
  isEnrolled: boolean;
}

export const CourseCurriculum: React.FC<CourseCurriculumProps> = ({
  modules,
  isEnrolled
}) => {
  const [openModules, setOpenModules] = useState<string[]>([]);

  const toggleModule = (moduleId: string) => {
    setOpenModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const getLessonIcon = (type: string, isCompleted?: boolean) => {
    if (isCompleted) return <CheckCircle className="h-4 w-4 text-green-600" />;
    
    switch (type) {
      case 'video': return <Play className="h-4 w-4 text-blue-600" />;
      case 'quiz': return <FileText className="h-4 w-4 text-purple-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Curriculum</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {modules.map((module) => (
            <Collapsible
              key={module.id}
              open={openModules.includes(module.id)}
              onOpenChange={() => toggleModule(module.id)}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <ChevronDown className={`h-4 w-4 transition-transform ${
                    openModules.includes(module.id) ? 'rotate-180' : ''
                  }`} />
                  <div className="text-left">
                    <h3 className="font-medium">{module.title}</h3>
                    <p className="text-sm text-gray-600">
                      {module.lessons.length} lessons • {formatDuration(module.duration_minutes)}
                    </p>
                  </div>
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-2">
                <div className="ml-4 space-y-2">
                  {module.lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getLessonIcon(lesson.type, lesson.is_completed)}
                        <div>
                          <h4 className="font-medium text-sm">{lesson.title}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600">
                              {formatDuration(lesson.duration_minutes)}
                            </span>
                            {lesson.is_free && (
                              <Badge variant="secondary" className="text-xs">Free</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {!isEnrolled && !lesson.is_free && (
                        <Lock className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
