import React, { useState } from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Save, 
  Eye, 
  Plus, 
  X, 
  Upload,
  BookOpen,
  Clock,
  Users,
  Star,
  Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const CreateCourse = () => {
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    instructor_name: '',
    instructor_bio: '',
    category: '',
    difficulty_level: 'beginner',
    duration_hours: 0,
    price: 0,
    is_free: true,
    is_active: true,
    thumbnail_url: '',
    video_url: '',
    skills_taught: [],
    curriculum: []
  });

  const [newSkill, setNewSkill] = useState('');
  const [newModule, setNewModule] = useState({ title: '', description: '', duration: 0 });

  const categories = [
    'Web Development',
    'Mobile Development', 
    'Data Science',
    'Machine Learning',
    'Design',
    'Marketing',
    'Business',
    'Photography',
    'Music',
    'Language Learning'
  ];

  const handleSkillAdd = () => {
    if (newSkill.trim()) {
      setCourseData(prev => ({
        ...prev,
        skills_taught: [...prev.skills_taught, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleSkillRemove = (index: number) => {
    setCourseData(prev => ({
      ...prev,
      skills_taught: prev.skills_taught.filter((_, i) => i !== index)
    }));
  };

  const handleModuleAdd = () => {
    if (newModule.title.trim()) {
      setCourseData(prev => ({
        ...prev,
        curriculum: [...prev.curriculum, { ...newModule, id: Date.now() }]
      }));
      setNewModule({ title: '', description: '', duration: 0 });
    }
  };

  const handleModuleRemove = (index: number) => {
    setCourseData(prev => ({
      ...prev,
      curriculum: prev.curriculum.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!courseData.title || !courseData.description || !courseData.instructor_name) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Course created successfully!');
      navigate('/admin/learning');
    } catch (error) {
      toast.error('Failed to create course');
    }
  };

  const handlePreview = () => {
    // Open preview in new tab
    window.open('/learning/preview', '_blank');
  };

  return (
    <UnifiedAdminLayout 
      title="Create New Course" 
      description="Add a new course to the learning platform"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Course Creation</h2>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </div>
        </div>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Course Title *</label>
                <Input
                  placeholder="Enter course title"
                  value={courseData.title}
                  onChange={(e) => setCourseData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <Select value={courseData.category} onValueChange={(value) => setCourseData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description *</label>
              <Textarea
                placeholder="Describe what students will learn in this course"
                value={courseData.description}
                onChange={(e) => setCourseData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty Level</label>
                <Select value={courseData.difficulty_level} onValueChange={(value) => setCourseData(prev => ({ ...prev, difficulty_level: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Beginner
                      </div>
                    </SelectItem>
                    <SelectItem value="intermediate">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        <Star className="h-4 w-4" />
                        Intermediate
                      </div>
                    </SelectItem>
                    <SelectItem value="advanced">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        <Star className="h-4 w-4" />
                        <Star className="h-4 w-4" />
                        Advanced
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (Hours)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={courseData.duration_hours}
                  onChange={(e) => setCourseData(prev => ({ ...prev, duration_hours: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price ($)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={courseData.price}
                  onChange={(e) => setCourseData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  disabled={courseData.is_free}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={courseData.is_free}
                    onCheckedChange={(checked) => setCourseData(prev => ({ ...prev, is_free: checked, price: checked ? 0 : prev.price }))}
                  />
                  <label className="text-sm font-medium">Free Course</label>
                </div>
                <p className="text-xs text-muted-foreground">Make this course available for free</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={courseData.is_active}
                    onCheckedChange={(checked) => setCourseData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <label className="text-sm font-medium">Publish Course</label>
                </div>
                <p className="text-xs text-muted-foreground">Make this course visible to students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructor Information */}
        <Card>
          <CardHeader>
            <CardTitle>Instructor Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Instructor Name *</label>
                <Input
                  placeholder="Enter instructor name"
                  value={courseData.instructor_name}
                  onChange={(e) => setCourseData(prev => ({ ...prev, instructor_name: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Instructor Bio</label>
              <Textarea
                placeholder="Brief bio about the instructor"
                value={courseData.instructor_bio}
                onChange={(e) => setCourseData(prev => ({ ...prev, instructor_bio: e.target.value }))}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Media & Resources */}
        <Card>
          <CardHeader>
            <CardTitle>Media & Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Thumbnail URL</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/thumbnail.jpg"
                    value={courseData.thumbnail_url}
                    onChange={(e) => setCourseData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                  />
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Video URL</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/video.mp4"
                    value={courseData.video_url}
                    onChange={(e) => setCourseData(prev => ({ ...prev, video_url: e.target.value }))}
                  />
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills Taught */}
        <Card>
          <CardHeader>
            <CardTitle>Skills Taught</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSkillAdd()}
              />
              <Button onClick={handleSkillAdd}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {courseData.skills_taught.map((skill, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleSkillRemove(index)}
                  />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Course Curriculum */}
        <Card>
          <CardHeader>
            <CardTitle>Course Curriculum</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
              <Input
                placeholder="Module title"
                value={newModule.title}
                onChange={(e) => setNewModule(prev => ({ ...prev, title: e.target.value }))}
              />
              <Input
                placeholder="Description"
                value={newModule.description}
                onChange={(e) => setNewModule(prev => ({ ...prev, description: e.target.value }))}
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Duration (min)"
                  value={newModule.duration}
                  onChange={(e) => setNewModule(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                />
                <Button onClick={handleModuleAdd}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {courseData.curriculum.map((module, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{module.title}</h4>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">{module.duration} minutes</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleModuleRemove(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Course Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">{courseData.duration_hours} Hours</p>
                <p className="text-xs text-muted-foreground">Duration</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <BookOpen className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">{courseData.curriculum.length} Modules</p>
                <p className="text-xs text-muted-foreground">Curriculum</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Star className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">{courseData.skills_taught.length} Skills</p>
                <p className="text-xs text-muted-foreground">Learning Outcomes</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Globe className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">{courseData.is_free ? 'Free' : `$${courseData.price}`}</p>
                <p className="text-xs text-muted-foreground">Price</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </UnifiedAdminLayout>
  );
};

export default CreateCourse;