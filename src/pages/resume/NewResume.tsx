
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const NewResume = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [resumeTitle, setResumeTitle] = useState('');

  const templates = [
    { id: 'modern', name: 'Modern Professional', description: 'Clean and contemporary design' },
    { id: 'creative', name: 'Creative Designer', description: 'Eye-catching layout for creatives' },
    { id: 'executive', name: 'Executive Leader', description: 'Sophisticated for leadership roles' },
    { id: 'minimalist', name: 'Simple & Clean', description: 'Minimalist and elegant design' }
  ];

  const [selectedTemplate, setSelectedTemplate] = useState('modern');

  const handleCreateResume = async () => {
    if (!user) {
      toast.error('Please sign in to create a resume');
      navigate('/');
      return;
    }
    
    if (!resumeTitle.trim()) {
      toast.error('Please enter a resume title');
      return;
    }

    setIsCreating(true);

    try {
      console.log('Creating resume for user:', user.id);
      console.log('Resume title:', resumeTitle.trim());
      console.log('Selected template:', selectedTemplate);

      const { data, error } = await supabase
        .from('ai_resumes')
        .insert({
          user_id: user.id,
          title: resumeTitle.trim(),
          content: {
            personalInfo: {
              fullName: '',
              email: '',
              phone: '',
              location: '',
              summary: ''
            },
            experience: [],
            education: [],
            skills: [],
            projects: [],
            certifications: [],
            awards: []
          },
          ats_score: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Database error details:', error);
        throw error;
      }

      console.log('Resume created successfully:', data);
      toast.success('Resume created successfully!');
      navigate(`/resume-builder/edit/${data.id}`);
    } catch (error: any) {
      console.error('Error creating resume:', error);
      
      // Provide more specific error messages
      if (error?.code === 'PGRST301') {
        toast.error('Authentication error. Please sign in again.');
        navigate('/');
      } else if (error?.message?.includes('JWT')) {
        toast.error('Session expired. Please sign in again.');
        navigate('/');
      } else if (error?.message?.includes('duplicate key')) {
        toast.error('A resume with this title already exists. Please choose a different title.');
      } else {
        toast.error(`Failed to create resume: ${error?.message || 'Unknown error'}`);
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" onClick={() => navigate('/resume-builder')} className="flex items-center text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500">
                User: {user ? user.email : 'Not logged in'}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Create New Resume</h1>
          <p className="text-lg text-gray-600">Choose a template and start building your professional resume</p>
          {!user && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">⚠️ You need to sign in to create a resume</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Resume Details */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Resume Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Resume Title</Label>
                  <Input
                    id="title"
                    value={resumeTitle}
                    onChange={(e) => setResumeTitle(e.target.value)}
                    placeholder="e.g., Software Engineer Resume"
                  />
                </div>
                <Button 
                  onClick={handleCreateResume}
                  disabled={isCreating || !resumeTitle.trim()}
                  className="w-full"
                >
                  {isCreating ? (
                    <>Creating...</>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Resume
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Template Selection */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Choose Template</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {templates.map((template) => (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <CardContent className="p-6">
                    <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center">
                      <FileText className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewResume;
