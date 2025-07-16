import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Target, Calendar, ArrowRight, BookOpen, Trophy } from 'lucide-react';

interface RoadmapDisplayProps {
  roadmap: any;
  onSave?: () => void;
  onEdit?: () => void;
  showActions?: boolean;
}

export const RoadmapDisplay: React.FC<RoadmapDisplayProps> = ({
  roadmap,
  onSave,
  onEdit,
  showActions = true
}) => {
  // Parse roadmap data - handle both string and object formats
  const roadmapData = typeof roadmap === 'string' 
    ? { description: roadmap }
    : roadmap;

  const milestones = roadmapData.milestones || [];
  const skillsNeeded = roadmapData.skills_needed || roadmapData.skillsNeeded || [];
  const timeline = roadmapData.timeline || roadmapData.timeframe;
  const description = roadmapData.description || roadmapData.summary;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-violet-600" />
            Career Roadmap Summary
          </CardTitle>
          <CardDescription>
            AI-generated personalized career development plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {description && (
            <div className="prose prose-sm max-w-none mb-4">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {description}
              </p>
            </div>
          )}
          
          {timeline && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Estimated Timeline: {timeline} months</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills Development */}
      {skillsNeeded.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Skills to Develop
            </CardTitle>
            <CardDescription>
              Key competencies for your career transition
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {skillsNeeded.map((skill, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="justify-center py-2"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Milestones */}
      {milestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-600" />
              Key Milestones
            </CardTitle>
            <CardDescription>
              Important steps on your career journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-violet-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-medium text-violet-600">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {typeof milestone === 'string' ? milestone : milestone.title || milestone.name}
                    </p>
                    {typeof milestone === 'object' && milestone.description && (
                      <p className="text-xs text-gray-600 mt-1">
                        {milestone.description}
                      </p>
                    )}
                    {typeof milestone === 'object' && milestone.timeframe && (
                      <div className="flex items-center gap-1 mt-2">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {milestone.timeframe}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {showActions && (
        <div className="flex gap-3">
          {onSave && (
            <Button onClick={onSave} className="flex-1">
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Roadmap
            </Button>
          )}
          {onEdit && (
            <Button variant="outline" onClick={onEdit} className="flex-1">
              <ArrowRight className="h-4 w-4 mr-2" />
              Customize
            </Button>
          )}
        </div>
      )}
    </div>
  );
};