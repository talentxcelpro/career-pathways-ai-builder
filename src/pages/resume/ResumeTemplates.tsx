import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Eye, Palette, Crown, Code, Brush, Minimize, Wrench, GraduationCap, Zap, Building } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const ResumeTemplates = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreating, setIsCreating] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);

  const templateCategories = [
    { id: 'all', name: 'All Templates', icon: null },
    { id: 'professional', name: 'Professional', icon: Crown },
    { id: 'executive', name: 'Executive', icon: Building },
    { id: 'creative', name: 'Creative', icon: Brush },
    { id: 'minimal', name: 'Minimal', icon: Minimize },
    { id: 'technical', name: 'Technical', icon: Code },
    { id: 'academic', name: 'Academic', icon: GraduationCap },
    { id: 'modern', name: 'Modern', icon: Zap },
    { id: 'corporate', name: 'Corporate', icon: Building }
  ];

  const templates = [
    // Professional Templates
    {
      id: 'prof-1',
      name: 'Professional Classic',
      category: 'professional',
      description: 'Clean and professional design perfect for traditional industries',
      ats_score: 95,
      colors: ['#2563eb', '#1e40af', '#1e3a8a']
    },
    {
      id: 'prof-2',
      name: 'Professional Modern',
      category: 'professional',
      description: 'Contemporary professional layout with subtle design elements',
      ats_score: 92,
      colors: ['#059669', '#047857', '#065f46']
    },
    {
      id: 'prof-3',
      name: 'Professional Elite',
      category: 'professional',
      description: 'Premium professional template for senior positions',
      ats_score: 94,
      colors: ['#7c3aed', '#6d28d9', '#5b21b6']
    },
    {
      id: 'prof-4',
      name: 'Professional Plus',
      category: 'professional',
      description: 'Enhanced professional design with visual hierarchy',
      ats_score: 93,
      colors: ['#dc2626', '#b91c1c', '#991b1b']
    },

    // Executive Templates
    {
      id: 'exec-1',
      name: 'Executive Leadership',
      category: 'executive',
      description: 'Sophisticated design for C-suite and senior leadership roles',
      ats_score: 91,
      colors: ['#1f2937', '#374151', '#4b5563']
    },
    {
      id: 'exec-2',
      name: 'Executive Premium',
      category: 'executive',
      description: 'Luxury executive template with elegant typography',
      ats_score: 89,
      colors: ['#92400e', '#b45309', '#d97706']
    },
    {
      id: 'exec-3',
      name: 'Executive Board',
      category: 'executive',
      description: 'Board-ready executive resume with impact focus',
      ats_score: 90,
      colors: ['#1e40af', '#2563eb', '#3b82f6']
    },

    // Creative Templates
    {
      id: 'creative-1',
      name: 'Creative Portfolio',
      category: 'creative',
      description: 'Visual-first design for creative professionals and designers',
      ats_score: 78,
      colors: ['#ec4899', '#db2777', '#be185d']
    },
    {
      id: 'creative-2',
      name: 'Creative Studio',
      category: 'creative',
      description: 'Artistic layout perfect for marketing and design roles',
      ats_score: 80,
      colors: ['#8b5cf6', '#7c3aed', '#6d28d9']
    },
    {
      id: 'creative-3',
      name: 'Creative Vision',
      category: 'creative',
      description: 'Bold creative template with unique visual elements',
      ats_score: 76,
      colors: ['#06b6d4', '#0891b2', '#0e7490']
    },
    {
      id: 'creative-4',
      name: 'Creative Edge',
      category: 'creative',
      description: 'Cutting-edge design for innovative creative professionals',
      ats_score: 82,
      colors: ['#f59e0b', '#d97706', '#b45309']
    },

    // Minimal Templates
    {
      id: 'minimal-1',
      name: 'Minimal Clean',
      category: 'minimal',
      description: 'Ultra-clean design focused on content and readability',
      ats_score: 98,
      colors: ['#374151', '#4b5563', '#6b7280']
    },
    {
      id: 'minimal-2',
      name: 'Minimal Pro',
      category: 'minimal',
      description: 'Professional minimalist approach with perfect spacing',
      ats_score: 97,
      colors: ['#1f2937', '#374151', '#4b5563']
    },
    {
      id: 'minimal-3',
      name: 'Minimal Elite',
      category: 'minimal',
      description: 'Sophisticated minimalism for executive positions',
      ats_score: 96,
      colors: ['#0f172a', '#1e293b', '#334155']
    },

    // Technical Templates
    {
      id: 'tech-1',
      name: 'Technical Pro',
      category: 'technical',
      description: 'Optimized for software engineers and developers',
      ats_score: 94,
      colors: ['#1e40af', '#2563eb', '#3b82f6']
    },
    {
      id: 'tech-2',
      name: 'Technical Stack',
      category: 'technical',
      description: 'Perfect for showcasing technical skills and projects',
      ats_score: 93,
      colors: ['#059669', '#10b981', '#34d399']
    },
    {
      id: 'tech-3',
      name: 'Technical Innovation',
      category: 'technical',
      description: 'Modern tech resume with clean code aesthetics',
      ats_score: 92,
      colors: ['#7c3aed', '#8b5cf6', '#a78bfa']
    },
    {
      id: 'tech-4',
      name: 'Technical Lead',
      category: 'technical',
      description: 'Leadership-focused technical template',
      ats_score: 91,
      colors: ['#dc2626', '#ef4444', '#f87171']
    },

    // Academic Templates
    {
      id: 'academic-1',
      name: 'Academic Research',
      category: 'academic',
      description: 'Comprehensive format for researchers and educators',
      ats_score: 88,
      colors: ['#1e40af', '#2563eb', '#3b82f6']
    },
    {
      id: 'academic-2',
      name: 'Academic Scholar',
      category: 'academic',
      description: 'Scholarly template with publication focus',
      ats_score: 87,
      colors: ['#059669', '#10b981', '#34d399']
    },
    {
      id: 'academic-3',
      name: 'Academic Excellence',
      category: 'academic',
      description: 'Premium academic template for senior positions',
      ats_score: 89,
      colors: ['#7c3aed', '#8b5cf6', '#a78bfa']
    },

    // Modern Templates
    {
      id: 'modern-1',
      name: 'Modern Edge',
      category: 'modern',
      description: 'Contemporary design with modern visual elements',
      ats_score: 85,
      colors: ['#06b6d4', '#0891b2', '#0e7490']
    },
    {
      id: 'modern-2',
      name: 'Modern Pro',
      category: 'modern',
      description: 'Professional modern template with subtle animations',
      ats_score: 86,
      colors: ['#f59e0b', '#d97706', '#b45309']
    },
    {
      id: 'modern-3',
      name: 'Modern Vision',
      category: 'modern',
      description: 'Forward-thinking design for innovative professionals',
      ats_score: 84,
      colors: ['#ec4899', '#db2777', '#be185d']
    },

    // Corporate Templates
    {
      id: 'corp-1',
      name: 'Corporate Standard',
      category: 'corporate',
      description: 'Traditional corporate design for established companies',
      ats_score: 90,
      colors: ['#1f2937', '#374151', '#4b5563']
    },
    {
      id: 'corp-2',
      name: 'Corporate Elite',
      category: 'corporate',
      description: 'Premium corporate template for senior management',
      ats_score: 88,
      colors: ['#92400e', '#b45309', '#d97706']
    },
    {
      id: 'corp-3',
      name: 'Corporate Vision',
      category: 'corporate',
      description: 'Modern corporate design with strategic focus',
      ats_score: 89,
      colors: ['#1e40af', '#2563eb', '#3b82f6']
    }
  ];

  const filteredTemplates = templates.filter(template => 
    selectedCategory === 'all' || template.category === selectedCategory
  );

  const handleUseTemplate = async (templateId: string) => {
    if (!user) return;
    
    setIsCreating(true);
    
    try {
      const { data, error } = await supabase
        .from('ai_resumes')
        .insert({
          user_id: user.id,
          title: 'My New Resume',
          template_id: templateId,
          content: {
            personalInfo: { fullName: '', email: '', phone: '', location: '', summary: '' },
            experience: [],
            education: [],
            skills: [],
            projects: [],
            certifications: []
          }
        })
        .select()
        .single();
      
      if (error) throw error;
      
      navigate(`/resume-builder/edit/${data.id}`);
    } catch (error) {
      console.error('Error creating resume with template:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handlePreview = (template: any) => {
    setPreviewTemplate(template);
    setShowPreviewModal(true);
  };

  const generateSampleResume = (template: any) => {
    const sampleData = {
      personalInfo: {
        fullName: "John Smith",
        email: "john.smith@email.com",
        phone: "(555) 123-4567",
        location: "New York, NY",
        summary: "Experienced professional with 8+ years in software development and team leadership. Proven track record of delivering scalable solutions and driving innovation in fast-paced environments."
      },
      experience: [
        {
          title: "Senior Software Engineer",
          company: "Tech Solutions Inc.",
          location: "New York, NY",
          startDate: "Jan 2020",
          endDate: "Present",
          description: "Led development of microservices architecture serving 10M+ users. Mentored junior developers and improved deployment efficiency by 40%."
        },
        {
          title: "Software Developer",
          company: "Digital Innovations",
          location: "Boston, MA",
          startDate: "Jun 2018",
          endDate: "Dec 2019",
          description: "Developed full-stack web applications using React and Node.js. Collaborated with design team to implement responsive user interfaces."
        }
      ],
      education: [
        {
          degree: "Bachelor of Science in Computer Science",
          school: "University of Technology",
          location: "Cambridge, MA",
          startDate: "2014",
          endDate: "2018"
        }
      ],
      skills: ["JavaScript", "React", "Node.js", "Python", "AWS", "Docker", "MongoDB", "Git"]
    };

    const primaryColor = template.colors[0];
    const secondaryColor = template.colors[1] || '#374151';
    const accentColor = template.colors[2] || '#6B7280';

    return `
      <div style="
        max-width: 800px; 
        margin: 0 auto; 
        padding: 40px; 
        font-family: 'Arial', sans-serif; 
        line-height: 1.6; 
        color: ${secondaryColor};
        background: white;
      ">
        <header style="
          text-align: center; 
          border-bottom: 3px solid ${primaryColor}; 
          padding-bottom: 20px; 
          margin-bottom: 30px;
        ">
          <h1 style="
            font-size: 2.5em; 
            margin: 0; 
            color: ${secondaryColor};
            font-weight: 700;
          ">${sampleData.personalInfo.fullName}</h1>
          <div style="margin-top: 10px; font-size: 1.1em; color: ${accentColor};">
            ${sampleData.personalInfo.email} | ${sampleData.personalInfo.phone} | ${sampleData.personalInfo.location}
          </div>
        </header>
        
        <section style="margin-bottom: 30px;">
          <h2 style="
            font-size: 1.5em; 
            color: ${primaryColor}; 
            border-bottom: 2px solid #E5E7EB; 
            padding-bottom: 5px; 
            margin-bottom: 15px;
          ">Professional Summary</h2>
          <p style="font-size: 1.1em; line-height: 1.7; margin: 0;">
            ${sampleData.personalInfo.summary}
          </p>
        </section>
        
        <section style="margin-bottom: 30px;">
          <h2 style="
            font-size: 1.5em; 
            color: ${primaryColor}; 
            border-bottom: 2px solid #E5E7EB; 
            padding-bottom: 5px; 
            margin-bottom: 15px;
          ">Core Skills</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${sampleData.skills.map(skill => `
              <span style="
                background: ${primaryColor}15; 
                color: ${primaryColor}; 
                padding: 6px 12px; 
                border-radius: 20px; 
                font-size: 0.9em;
                font-weight: 500;
              ">${skill}</span>
            `).join('')}
          </div>
        </section>
        
        <section style="margin-bottom: 30px;">
          <h2 style="
            font-size: 1.5em; 
            color: ${primaryColor}; 
            border-bottom: 2px solid #E5E7EB; 
            padding-bottom: 5px; 
            margin-bottom: 15px;
          ">Professional Experience</h2>
          ${sampleData.experience.map(exp => `
            <div style="margin-bottom: 25px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
                <h3 style="font-size: 1.2em; margin: 0; color: ${secondaryColor}; font-weight: 600;">${exp.title}</h3>
                <span style="font-size: 0.9em; color: ${accentColor}; font-weight: 500;">${exp.startDate} - ${exp.endDate}</span>
              </div>
              <div style="font-weight: 600; color: ${primaryColor}; margin-bottom: 8px;">${exp.company} • ${exp.location}</div>
              <p style="margin: 0; color: #4B5563; line-height: 1.6;">${exp.description}</p>
            </div>
          `).join('')}
        </section>
        
        <section>
          <h2 style="
            font-size: 1.5em; 
            color: ${primaryColor}; 
            border-bottom: 2px solid #E5E7EB; 
            padding-bottom: 5px; 
            margin-bottom: 15px;
          ">Education</h2>
          ${sampleData.education.map(edu => `
            <div style="margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px;">
                <h3 style="font-size: 1.1em; margin: 0; color: ${secondaryColor}; font-weight: 600;">${edu.degree}</h3>
                <span style="font-size: 0.9em; color: ${accentColor}; font-weight: 500;">${edu.startDate} - ${edu.endDate}</span>
              </div>
              <div style="color: ${primaryColor}; font-weight: 600;">${edu.school} • ${edu.location}</div>
            </div>
          `).join('')}
        </section>
      </div>
    `;
  };

  const getAtsScoreColor = (score: number) => {
    if (score >= 95) return 'bg-green-100 text-green-800';
    if (score >= 85) return 'bg-blue-100 text-blue-800';
    if (score >= 75) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/resume')}
              className="flex items-center mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resume Templates</h1>
              <p className="text-gray-600">Choose from professionally designed, ATS-optimized templates</p>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {templateCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2"
              >
                {Icon && <Icon className="h-4 w-4" />}
                {category.name}
              </Button>
            );
          })}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                {/* Template Preview */}
                <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg relative overflow-hidden">
                  <div className="absolute inset-4 bg-white rounded shadow-sm p-3">
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-800 rounded w-3/4"></div>
                      <div className="h-1 bg-gray-600 rounded w-1/2"></div>
                      <div className="mt-3 space-y-1">
                        <div className="h-1 bg-gray-400 rounded"></div>
                        <div className="h-1 bg-gray-400 rounded w-5/6"></div>
                        <div className="h-1 bg-gray-400 rounded w-4/6"></div>
                      </div>
                      <div className="mt-3 space-y-1">
                        <div className="h-1 bg-gray-500 rounded w-2/3"></div>
                        <div className="h-1 bg-gray-300 rounded"></div>
                        <div className="h-1 bg-gray-300 rounded w-3/4"></div>
                      </div>
                    </div>
                    {/* Color accent */}
                    <div 
                      className="absolute top-0 left-0 w-1 h-full rounded-l"
                      style={{ backgroundColor: template.colors[0] }}
                    ></div>
                  </div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => handlePreview(template)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleUseTemplate(template.id)}
                      disabled={isCreating}
                    >
                      Use Template
                    </Button>
                  </div>
                </div>
                
                {/* Template Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <Badge className={`text-xs ${getAtsScoreColor(template.ats_score)}`}>
                      ATS {template.ats_score}%
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {template.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Palette className="h-3 w-3 text-gray-400" />
                      <div className="flex space-x-1">
                        {template.colors.map((color, index) => (
                          <div
                            key={index}
                            className="w-3 h-3 rounded-full border border-gray-200"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handlePreview(template)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleUseTemplate(template.id)}
                        disabled={isCreating}
                      >
                        Use
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Eye className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600">Try selecting a different category</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Preview: {previewTemplate?.name}</span>
              <div className="flex items-center gap-2">
                <Badge className={`text-xs ${previewTemplate ? getAtsScoreColor(previewTemplate.ats_score) : ''}`}>
                  ATS {previewTemplate?.ats_score}%
                </Badge>
                <div className="flex items-center space-x-1">
                  <Palette className="h-3 w-3 text-gray-400" />
                  <div className="flex space-x-1">
                    {previewTemplate?.colors.map((color: string, index: number) => (
                      <div
                        key={index}
                        className="w-3 h-3 rounded-full border border-gray-200"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {previewTemplate && (
              <div 
                className="border rounded-lg bg-white shadow-sm"
                dangerouslySetInnerHTML={{ __html: generateSampleResume(previewTemplate) }}
              />
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowPreviewModal(false)}
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                setShowPreviewModal(false);
                if (previewTemplate) {
                  handleUseTemplate(previewTemplate.id);
                }
              }}
              disabled={isCreating}
            >
              Use This Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResumeTemplates;
