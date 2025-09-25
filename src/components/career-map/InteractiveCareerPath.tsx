import React, { useState, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Target, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  X, 
  Edit3, 
  Save,
  Trash2,
  Play,
  Star,
  Calendar,
  Award,
  Brain
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from 'sonner';

interface CareerStep {
  id: string;
  title: string;
  description?: string;
  timeframe: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  skills?: string[];
  resources?: string[];
}

interface InteractiveCareerPathProps {
  initialPath?: CareerStep[];
  onSave?: (path: CareerStep[]) => void;
  className?: string;
}

export const InteractiveCareerPath: React.FC<InteractiveCareerPathProps> = memo(({
  initialPath = [],
  onSave,
  className = ""
}) => {
  const [careerPath, setCareerPath] = useState<CareerStep[]>(initialPath);
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [newStepTitle, setNewStepTitle] = useState('');
  const [isAddingStep, setIsAddingStep] = useState(false);

  const addNewStep = useCallback(() => {
    if (!newStepTitle.trim()) return;

    const newStep: CareerStep = {
      id: `step-${Date.now()}`,
      title: newStepTitle,
      timeframe: '3 months',
      priority: 'medium',
      completed: false,
      skills: [],
      resources: []
    };

    setCareerPath(prev => [...prev, newStep]);
    setNewStepTitle('');
    setIsAddingStep(false);
    toast.success('Career step added!');
  }, [newStepTitle]);

  const updateStep = useCallback((stepId: string, updates: Partial<CareerStep>) => {
    setCareerPath(prev => 
      prev.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      )
    );
  }, []);

  const removeStep = useCallback((stepId: string) => {
    setCareerPath(prev => prev.filter(step => step.id !== stepId));
    toast.success('Career step removed');
  }, []);

  const toggleStepCompletion = useCallback((stepId: string) => {
    setCareerPath(prev =>
      prev.map(step =>
        step.id === stepId 
          ? { ...step, completed: !step.completed }
          : step
      )
    );
  }, []);

  const handleDragEnd = useCallback((result: any) => {
    if (!result.destination) return;

    const items = Array.from(careerPath);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setCareerPath(items);
    toast.success('Career path reordered');
  }, [careerPath]);

  const savePath = useCallback(() => {
    onSave?.(careerPath);
    toast.success('Career path saved!');
  }, [careerPath, onSave]);

  const calculateProgress = () => {
    if (careerPath.length === 0) return 0;
    const completed = careerPath.filter(step => step.completed).length;
    return Math.round((completed / careerPath.length) * 100);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Progress */}
      <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-apple-light">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-apple-light">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-text-primary font-display">
                  Interactive Career Path Builder
                </CardTitle>
                <p className="text-sm text-text-secondary">
                  Build and customize your career progression step by step
                </p>
              </div>
            </div>
            <Badge className="bg-blue-100 text-blue-700 border-0 px-3 py-1">
              <Brain className="h-3 w-3 mr-1" />
              AI-Enhanced
            </Badge>
          </div>
          
          {careerPath.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text-primary">
                  Progress: {calculateProgress()}% Complete
                </span>
                <span className="text-sm text-text-secondary">
                  {careerPath.filter(s => s.completed).length} of {careerPath.length} steps
                </span>
              </div>
              <Progress value={calculateProgress()} className="h-2" />
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Career Path Steps */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="career-path">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3"
            >
              {careerPath.map((step, index) => (
                <Draggable key={step.id} draggableId={step.id} index={index}>
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`
                        border-0 bg-white/90 backdrop-blur-apple rounded-xl shadow-apple-light
                        transition-all duration-200 hover:shadow-apple-medium
                        ${snapshot.isDragging ? 'rotate-2 shadow-apple-strong' : ''}
                        ${step.completed ? 'opacity-75' : ''}
                      `}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Drag Handle */}
                          <div 
                            {...provided.dragHandleProps}
                            className="flex-shrink-0 mt-2 cursor-move"
                          >
                            <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              <div className="w-1 h-1 bg-gray-400 rounded-full ml-0.5"></div>
                            </div>
                          </div>

                          {/* Step Number & Completion */}
                          <div className="flex-shrink-0">
                            <div className={`
                              w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                              ${step.completed 
                                ? 'bg-green-500 border-green-500 text-white' 
                                : 'bg-white border-gray-200 text-text-primary'
                              }
                            `}>
                              {step.completed ? (
                                <CheckCircle2 className="h-5 w-5" />
                              ) : (
                                <span className="text-sm font-bold">{index + 1}</span>
                              )}
                            </div>
                          </div>

                          {/* Step Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className={`
                                font-semibold text-sm
                                ${step.completed ? 'line-through text-text-secondary' : 'text-text-primary'}
                              `}>
                                {step.title}
                              </h3>
                              <div className={`w-2 h-2 rounded-full ${getPriorityColor(step.priority)}`} />
                              <Badge className="bg-gray-100 text-gray-700 border-0 px-2 py-0.5 text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {step.timeframe}
                              </Badge>
                            </div>

                            {step.description && (
                              <p className="text-xs text-text-secondary mb-2">
                                {step.description}
                              </p>
                            )}

                            {step.skills && step.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {step.skills.map((skill, idx) => (
                                  <Badge 
                                    key={idx}
                                    className="bg-blue-50 text-blue-700 border-0 px-1.5 py-0.5 text-xs"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Step Actions */}
                            <div className="flex items-center gap-2 mt-3">
                              <Button
                                size="sm"
                                variant={step.completed ? "secondary" : "default"}
                                onClick={() => toggleStepCompletion(step.id)}
                                className="px-3 py-1 text-xs"
                              >
                                {step.completed ? (
                                  <>
                                    <X className="h-3 w-3 mr-1" />
                                    Mark Incomplete
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Mark Complete
                                  </>
                                )}
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingStep(step.id)}
                                className="px-3 py-1 text-xs"
                              >
                                <Edit3 className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeStep(step.id)}
                                className="px-3 py-1 text-xs text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add New Step */}
      <Card className="border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
        <CardContent className="p-4">
          {!isAddingStep ? (
            <Button
              variant="ghost"
              onClick={() => setIsAddingStep(true)}
              className="w-full py-8 text-text-secondary hover:text-text-primary"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Career Step
            </Button>
          ) : (
            <div className="space-y-3">
              <Input
                placeholder="Enter career step title..."
                value={newStepTitle}
                onChange={(e) => setNewStepTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addNewStep()}
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={addNewStep}
                  disabled={!newStepTitle.trim()}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Step
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsAddingStep(false);
                    setNewStepTitle('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Bar */}
      {careerPath.length > 0 && (
        <Card className="border-0 bg-gray-50 shadow-apple-light">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="font-medium text-text-primary">
                    {careerPath.length} step{careerPath.length !== 1 ? 's' : ''} in your path
                  </span>
                  <span className="text-text-secondary ml-2">
                    • {calculateProgress()}% complete
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCareerPath([])}
                  className="px-3 py-1 text-xs"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
                
                {onSave && (
                  <Button
                    size="sm"
                    onClick={savePath}
                    className="px-3 py-1 text-xs"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save Path
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {careerPath.length === 0 && !isAddingStep && (
        <Card className="border-0 bg-gradient-to-br from-gray-50 to-gray-100 shadow-apple-light">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-apple-light">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2 font-display">
              Start Building Your Career Path
            </h3>
            <p className="text-text-secondary text-sm mb-6 max-w-md mx-auto">
              Create a step-by-step roadmap to achieve your career goals. Add milestones, 
              track progress, and visualize your professional journey.
            </p>
            <Button
              onClick={() => setIsAddingStep(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 shadow-apple-light"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Step
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
});