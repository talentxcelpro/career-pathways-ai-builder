import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Plus, 
  X, 
  Camera,
  FileText,
  Star,
  Download,
  Eye,
  Wand2
} from 'lucide-react';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { toast } from 'sonner';

interface ResumeSection {
  id: string;
  type: 'personal' | 'experience' | 'education' | 'skills' | 'summary';
  title: string;
  content: any;
}

export const MobileResumeBuilder = () => {
  const { isMobile } = useMobileDetection();
  const [activeSection, setActiveSection] = useState<string>('personal');
  const [resumeData, setResumeData] = useState({
    personal: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      profileImage: null as File | null
    },
    summary: '',
    experience: [] as any[],
    education: [] as any[],
    skills: [] as string[]
  });
  const [completionScore, setCompletionScore] = useState(15);

  const sections = [
    { id: 'personal', title: 'Personal Info', icon: User, color: 'bg-blue-100 text-blue-600' },
    { id: 'summary', title: 'Summary', icon: FileText, color: 'bg-green-100 text-green-600' },
    { id: 'experience', title: 'Experience', icon: Star, color: 'bg-purple-100 text-purple-600' },
    { id: 'education', title: 'Education', icon: Star, color: 'bg-orange-100 text-orange-600' },
    { id: 'skills', title: 'Skills', icon: Star, color: 'bg-pink-100 text-pink-600' }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeData(prev => ({
        ...prev,
        personal: { ...prev.personal, profileImage: file }
      }));
      toast.success('Profile image uploaded!');
    }
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        id: Date.now(),
        company: '',
        position: '',
        duration: '',
        description: ''
      }]
    }));
  };

  const addSkill = (skill: string) => {
    if (skill && !resumeData.skills.includes(skill)) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const removeSkill = (skill: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const generateWithAI = async () => {
    toast.success('AI enhancement started!');
    // Simulate AI generation
    setTimeout(() => {
      toast.success('Resume enhanced with AI suggestions!');
      setCompletionScore(Math.min(completionScore + 20, 100));
    }, 2000);
  };

  if (!isMobile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="p-8 w-full max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">TalentXcel Mobile Resume Builder</h2>
          <p className="text-gray-600">
            This TalentXcel mobile-optimized resume builder is designed for seamless mobile experience. 
            Create professional resumes on-the-go with AI assistance.
          </p>
        </Card>
      </div>
    );
  }

  const renderPersonalSection = () => (
    <div className="space-y-4">
      {/* Profile Image Upload */}
      <div className="text-center">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            {resumeData.personal.profileImage ? (
              <img 
                src={URL.createObjectURL(resumeData.personal.profileImage)} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <label className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full cursor-pointer">
            <Camera className="w-4 h-4" />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-2">Tap to add photo</p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Full Name"
            value={resumeData.personal.fullName}
            onChange={(e) => setResumeData(prev => ({
              ...prev,
              personal: { ...prev.personal, fullName: e.target.value }
            }))}
            className="pl-10"
          />
        </div>

        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="email"
            placeholder="Email Address"
            value={resumeData.personal.email}
            onChange={(e) => setResumeData(prev => ({
              ...prev,
              personal: { ...prev.personal, email: e.target.value }
            }))}
            className="pl-10"
          />
        </div>

        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Phone Number"
            value={resumeData.personal.phone}
            onChange={(e) => setResumeData(prev => ({
              ...prev,
              personal: { ...prev.personal, phone: e.target.value }
            }))}
            className="pl-10"
          />
        </div>

        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Location"
            value={resumeData.personal.location}
            onChange={(e) => setResumeData(prev => ({
              ...prev,
              personal: { ...prev.personal, location: e.target.value }
            }))}
            className="pl-10"
          />
        </div>
      </div>
    </div>
  );

  const renderSkillsSection = () => {
    const [newSkill, setNewSkill] = useState('');
    
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Add a skill"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addSkill(newSkill);
                setNewSkill('');
              }
            }}
          />
          <Button
            size="sm"
            onClick={() => {
              addSkill(newSkill);
              setNewSkill('');
            }}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {resumeData.skills.map((skill, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {skill}
              <button
                onClick={() => removeSkill(skill)}
                className="text-gray-500 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>

        {resumeData.skills.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Star className="w-8 h-8 mx-auto mb-2" />
            <p>Add skills to showcase your expertise</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">TalentXcel Resume Builder</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{completionScore}%</span>
            <div className="w-16 h-2 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${completionScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="bg-white border-b px-4 py-2">
        <div className="flex gap-2 overflow-x-auto">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? section.color
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {section.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <Card className="p-4">
          {activeSection === 'personal' && renderPersonalSection()}
          {activeSection === 'summary' && (
            <div className="space-y-4">
              <Textarea
                placeholder="Write a brief summary about yourself, your experience, and career goals..."
                value={resumeData.summary}
                onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                rows={4}
              />
              <Button variant="outline" className="w-full" onClick={generateWithAI}>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate with AI
              </Button>
            </div>
          )}
          {activeSection === 'skills' && renderSkillsSection()}
        </Card>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 safe-area-padding-bottom">
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
};