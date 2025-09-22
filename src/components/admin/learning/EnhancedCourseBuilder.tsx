import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Trash2, 
  Move, 
  BookOpen, 
  Clock, 
  Users, 
  Target,
  Play,
  FileText,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Save,
  Eye
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Module {
  id: string;
  title: string;
  description: string;
  duration_hours: number;
  lessons: Lesson[];
  objectives: string[];
  order: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  content_type: 'video' | 'text' | 'interactive' | 'quiz' | 'assignment';
  content_url?: string;
  content_text?: string;
  objectives: string[];
  order: number;
}

interface CourseData {
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  instructor_name: string;
  duration_hours: number;
  price: number;
  is_free: boolean;
  skills_taught: string[];
  learning_objectives: string[];
  prerequisites: string[];
  target_audience: string[];
  modules: Module[];
  thumbnail_url?: string;
}

interface EnhancedCourseBuilderProps {
  onSave: (courseData: CourseData) => void;
  initialData?: Partial<CourseData>;
  isLoading?: boolean;
}

export const EnhancedCourseBuilder: React.FC<EnhancedCourseBuilderProps> = ({
  onSave,
  initialData,
  isLoading = false
}) => {
  const [courseData, setCourseData] = useState<CourseData>({
    title: '',
    description: '',
    category: '',
    difficulty_level: 'beginner',
    instructor_name: 'TalentXcel Academy',
    duration_hours: 0,
    price: 0,
    is_free: true,
    skills_taught: [],
    learning_objectives: [],
    prerequisites: [],
    target_audience: [],
    modules: [],
    ...initialData
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [newSkill, setNewSkill] = useState('');
  const [newObjective, setNewObjective] = useState('');
  const [newPrerequisite, setNewPrerequisite] = useState('');
  const [newAudience, setNewAudience] = useState('');

  const addModule = () => {
    const newModule: Module = {
      id: `module_${Date.now()}`,
      title: '',
      description: '',
      duration_hours: 0,
      lessons: [],
      objectives: [],
      order: courseData.modules.length + 1
    };
    setCourseData(prev => ({
      ...prev,
      modules: [...prev.modules, newModule]
    }));
  };

  const updateModule = (moduleId: string, updates: Partial<Module>) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId ? { ...module, ...updates } : module
      )
    }));
  };

  const deleteModule = (moduleId: string) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.filter(module => module.id !== moduleId)
    }));
  };

  const addLesson = (moduleId: string) => {
    const newLesson: Lesson = {
      id: `lesson_${Date.now()}`,
      title: '',
      description: '',
      duration_minutes: 0,
      content_type: 'video',
      objectives: [],
      order: 1
    };

    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId 
          ? { ...module, lessons: [...module.lessons, { ...newLesson, order: module.lessons.length + 1 }] }
          : module
      )
    }));
  };

  const updateLesson = (moduleId: string, lessonId: string, updates: Partial<Lesson>) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId
          ? {
              ...module,
              lessons: module.lessons.map(lesson =>
                lesson.id === lessonId ? { ...lesson, ...updates } : lesson
              )
            }
          : module
      )
    }));
  };

  const deleteLesson = (moduleId: string, lessonId: string) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId
          ? { ...module, lessons: module.lessons.filter(lesson => lesson.id !== lessonId) }
          : module
      )
    }));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setCourseData(prev => ({
        ...prev,
        skills_taught: [...prev.skills_taught, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const addObjective = () => {
    if (newObjective.trim()) {
      setCourseData(prev => ({
        ...prev,
        learning_objectives: [...prev.learning_objectives, newObjective.trim()]
      }));
      setNewObjective('');
    }
  };

  const addPrerequisite = () => {
    if (newPrerequisite.trim()) {
      setCourseData(prev => ({
        ...prev,
        prerequisites: [...prev.prerequisites, newPrerequisite.trim()]
      }));
      setNewPrerequisite('');
    }
  };

  const addAudience = () => {
    if (newAudience.trim()) {
      setCourseData(prev => ({
        ...prev,
        target_audience: [...prev.target_audience, newAudience.trim()]
      }));
      setNewAudience('');
    }
  };

  const removeFromArray = (array: string[], index: number) => {
    return array.filter((_, i) => i !== index);
  };

  const calculateTotalDuration = () => {
    return courseData.modules.reduce((total, module) => {
      const moduleDuration = module.lessons.reduce((lessonTotal, lesson) => {
        return lessonTotal + (lesson.duration_minutes / 60);
      }, 0);
      return total + moduleDuration;
    }, 0);
  };

  const handleSave = () => {
    const totalDuration = calculateTotalDuration();
    onSave({
      ...courseData,
      duration_hours: Math.ceil(totalDuration)
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Course Builder</h2>
          <p className="text-muted-foreground">Create comprehensive learning experiences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Course'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="structure">Course Structure</TabsTrigger>
          <TabsTrigger value="content">Content Details</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
              <CardDescription>Basic details about your course</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title</Label>
                  <Input
                    id="title"
                    value={courseData.title}
                    onChange={(e) => setCourseData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Complete AWS Cloud Computing Mastery"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={courseData.category} 
                    onValueChange={(value) => setCourseData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="data-science">Data Science</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="cloud-computing">Cloud Computing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Course Description</Label>
                <Textarea
                  id="description"
                  value={courseData.description}
                  onChange={(e) => setCourseData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide a comprehensive overview of what students will learn..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select 
                    value={courseData.difficulty_level} 
                    onValueChange={(value) => setCourseData(prev => ({ ...prev, difficulty_level: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructor">Instructor</Label>
                  <Input
                    id="instructor"
                    value={courseData.instructor_name}
                    onChange={(e) => setCourseData(prev => ({ ...prev, instructor_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thumbnail">Thumbnail URL</Label>
                  <Input
                    id="thumbnail"
                    value={courseData.thumbnail_url || ''}
                    onChange={(e) => setCourseData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Learning Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Skills Taught */}
              <div className="space-y-3">
                <Label>Skills Taught</Label>
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill..."
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <Button onClick={addSkill} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {courseData.skills_taught.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs"
                        onClick={() => setCourseData(prev => ({
                          ...prev,
                          skills_taught: removeFromArray(prev.skills_taught, index)
                        }))}
                      >
                        ×
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Learning Objectives */}
              <div className="space-y-3">
                <Label>Learning Objectives</Label>
                <div className="flex gap-2">
                  <Input
                    value={newObjective}
                    onChange={(e) => setNewObjective(e.target.value)}
                    placeholder="Add a learning objective..."
                    onKeyPress={(e) => e.key === 'Enter' && addObjective()}
                  />
                  <Button onClick={addObjective} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {courseData.learning_objectives.map((objective, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="flex-1">{objective}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCourseData(prev => ({
                          ...prev,
                          learning_objectives: removeFromArray(prev.learning_objectives, index)
                        }))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prerequisites */}
              <div className="space-y-3">
                <Label>Prerequisites</Label>
                <div className="flex gap-2">
                  <Input
                    value={newPrerequisite}
                    onChange={(e) => setNewPrerequisite(e.target.value)}
                    placeholder="Add a prerequisite..."
                    onKeyPress={(e) => e.key === 'Enter' && addPrerequisite()}
                  />
                  <Button onClick={addPrerequisite} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {courseData.prerequisites.map((prereq, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {prereq}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs"
                        onClick={() => setCourseData(prev => ({
                          ...prev,
                          prerequisites: removeFromArray(prev.prerequisites, index)
                        }))}
                      >
                        ×
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Target Audience */}
              <div className="space-y-3">
                <Label>Target Audience</Label>
                <div className="flex gap-2">
                  <Input
                    value={newAudience}
                    onChange={(e) => setNewAudience(e.target.value)}
                    placeholder="Who is this course for..."
                    onKeyPress={(e) => e.key === 'Enter' && addAudience()}
                  />
                  <Button onClick={addAudience} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {courseData.target_audience.map((audience, index) => (
                    <Badge key={index} variant="default" className="flex items-center gap-1">
                      {audience}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs"
                        onClick={() => setCourseData(prev => ({
                          ...prev,
                          target_audience: removeFromArray(prev.target_audience, index)
                        }))}
                      >
                        ×
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structure" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Course Modules</CardTitle>
                  <CardDescription>
                    Estimated Duration: {Math.ceil(calculateTotalDuration())} hours
                  </CardDescription>
                </div>
                <Button onClick={addModule}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Module
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {courseData.modules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No modules created yet. Add your first module to get started.</p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="space-y-4">
                  {courseData.modules.map((module, moduleIndex) => (
                    <AccordionItem key={module.id} value={module.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3 flex-1">
                          <Badge variant="outline">Module {moduleIndex + 1}</Badge>
                          <span className="font-semibold">
                            {module.title || 'Untitled Module'}
                          </span>
                          <Badge variant="secondary" className="ml-auto mr-4">
                            {module.lessons.length} lessons
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Module Title</Label>
                            <Input
                              value={module.title}
                              onChange={(e) => updateModule(module.id, { title: e.target.value })}
                              placeholder="e.g., AWS Fundamentals & Core Services"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Duration (hours)</Label>
                            <Input
                              type="number"
                              value={module.duration_hours}
                              onChange={(e) => updateModule(module.id, { duration_hours: parseInt(e.target.value) || 0 })}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Module Description</Label>
                          <Textarea
                            value={module.description}
                            onChange={(e) => updateModule(module.id, { description: e.target.value })}
                            placeholder="Describe what students will learn in this module..."
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-semibold">Lessons</h4>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => addLesson(module.id)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Lesson
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => deleteModule(module.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <Card key={lesson.id} className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <Badge variant="outline">Lesson {lessonIndex + 1}</Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteLesson(module.id, lesson.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <Input
                                    value={lesson.title}
                                    onChange={(e) => updateLesson(module.id, lesson.id, { title: e.target.value })}
                                    placeholder="Lesson title"
                                  />
                                  <Select
                                    value={lesson.content_type}
                                    onValueChange={(value) => updateLesson(module.id, lesson.id, { content_type: value as any })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="video">Video</SelectItem>
                                      <SelectItem value="text">Text/Reading</SelectItem>
                                      <SelectItem value="interactive">Interactive</SelectItem>
                                      <SelectItem value="quiz">Quiz</SelectItem>
                                      <SelectItem value="assignment">Assignment</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    type="number"
                                    value={lesson.duration_minutes}
                                    onChange={(e) => updateLesson(module.id, lesson.id, { duration_minutes: parseInt(e.target.value) || 0 })}
                                    placeholder="Duration (min)"
                                  />
                                </div>

                                <Textarea
                                  value={lesson.description}
                                  onChange={(e) => updateLesson(module.id, lesson.id, { description: e.target.value })}
                                  placeholder="Lesson description"
                                  rows={2}
                                />

                                {lesson.content_type === 'video' && (
                                  <Input
                                    value={lesson.content_url || ''}
                                    onChange={(e) => updateLesson(module.id, lesson.id, { content_url: e.target.value })}
                                    placeholder="Video URL"
                                  />
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
              <CardDescription>Manage lesson content, resources, and assessments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Content editor will be available in this section</p>
                <p className="text-sm">Upload videos, create quizzes, add resources</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="free-course">Free Course</Label>
                      <p className="text-sm text-muted-foreground">Make this course available for free</p>
                    </div>
                    <Switch
                      id="free-course"
                      checked={courseData.is_free}
                      onCheckedChange={(checked) => setCourseData(prev => ({ ...prev, is_free: checked }))}
                    />
                  </div>

                  {!courseData.is_free && (
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (₹)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={courseData.price}
                        onChange={(e) => setCourseData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Course Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Modules:</span>
                        <span>{courseData.modules.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Lessons:</span>
                        <span>{courseData.modules.reduce((total, module) => total + module.lessons.length, 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimated Duration:</span>
                        <span>{Math.ceil(calculateTotalDuration())} hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Skills Taught:</span>
                        <span>{courseData.skills_taught.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};