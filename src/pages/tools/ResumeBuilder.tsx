
import React, { useState, useEffect } from 'react';
import { createSafeHtml } from '@/utils/sanitize';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Wand2, Plus, X, Loader2, FileText, Eye } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const ResumeBuilder = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<string>("");

  const [resumeData, setResumeData] = useState({
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      summary: ""
    },
    experience: [{
      id: 1,
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: ""
    }],
    education: [{
      id: 1,
      degree: "",
      school: "",
      location: "",
      startDate: "",
      endDate: "",
      gpa: ""
    }],
    skills: [] as string[],
    tempSkill: ""
  });

  const addExperience = () => {
    const newExp = {
      id: Date.now(),
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: ""
    };
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, newExp]
    }));
  };

  const removeExperience = (id: number) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const updateExperience = (id: number, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const addEducation = () => {
    const newEdu = {
      id: Date.now(),
      degree: "",
      school: "",
      location: "",
      startDate: "",
      endDate: "",
      gpa: ""
    };
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newEdu]
    }));
  };

  const removeEducation = (id: number) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const updateEducation = (id: number, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const addSkill = () => {
    if (resumeData.tempSkill.trim() && !resumeData.skills.includes(resumeData.tempSkill.trim())) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, prev.tempSkill.trim()],
        tempSkill: ""
      }));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const generateResume = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const html = generateHTMLResume();
    setGeneratedResume(html);
    setIsGenerating(false);
  };

  const generateHTMLResume = () => {
    return `
      <div style="max-width: 800px; margin: 0 auto; padding: 40px; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <header style="text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="font-size: 2.5em; margin: 0; color: #1f2937;">${resumeData.personalInfo.fullName}</h1>
          <div style="margin-top: 10px; font-size: 1.1em; color: #6b7280;">
            ${resumeData.personalInfo.email} | ${resumeData.personalInfo.phone} | ${resumeData.personalInfo.location}
            ${resumeData.personalInfo.website ? ` | ${resumeData.personalInfo.website}` : ''}
          </div>
        </header>
        
        ${resumeData.personalInfo.summary ? `
        <section style="margin-bottom: 30px;">
          <h2 style="font-size: 1.5em; color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 15px;">Professional Summary</h2>
          <p>${resumeData.personalInfo.summary}</p>
        </section>
        ` : ''}
        
        ${resumeData.skills.length > 0 ? `
        <section style="margin-bottom: 30px;">
          <h2 style="font-size: 1.5em; color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 15px;">Skills</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${resumeData.skills.map(skill => `
              <span style="background: #dbeafe; color: #2563eb; padding: 6px 12px; border-radius: 20px; font-size: 0.9em;">${skill}</span>
            `).join('')}
          </div>
        </section>
        ` : ''}
        
        ${resumeData.experience.filter(exp => exp.title || exp.company).length > 0 ? `
        <section style="margin-bottom: 30px;">
          <h2 style="font-size: 1.5em; color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 15px;">Experience</h2>
          ${resumeData.experience.filter(exp => exp.title || exp.company).map(exp => `
            <div style="margin-bottom: 25px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
                <h3 style="font-size: 1.2em; margin: 0;">${exp.title}</h3>
                <span style="font-size: 0.9em; color: #6b7280;">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</span>
              </div>
              <div style="font-weight: 600; color: #2563eb; margin-bottom: 8px;">${exp.company}${exp.location ? ` • ${exp.location}` : ''}</div>
              ${exp.description ? `<p style="margin: 0;">${exp.description}</p>` : ''}
            </div>
          `).join('')}
        </section>
        ` : ''}
        
        ${resumeData.education.filter(edu => edu.degree || edu.school).length > 0 ? `
        <section>
          <h2 style="font-size: 1.5em; color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 15px;">Education</h2>
          ${resumeData.education.filter(edu => edu.degree || edu.school).map(edu => `
            <div style="margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px;">
                <h3 style="font-size: 1.1em; margin: 0;">${edu.degree}</h3>
                <span style="font-size: 0.9em; color: #6b7280;">${edu.startDate} - ${edu.endDate}</span>
              </div>
              <div style="color: #2563eb; font-weight: 600;">${edu.school}${edu.location ? ` • ${edu.location}` : ''}</div>
              ${edu.gpa ? `<div style="color: #6b7280; margin-top: 5px;">GPA: ${edu.gpa}</div>` : ''}
            </div>
          `).join('')}
        </section>
        ` : ''}
      </div>
    `;
  };

  const downloadResume = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedResume], {type: 'text/html'});
    element.href = URL.createObjectURL(file);
    element.download = `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/tools')}
              className="flex items-center mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tools
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Resume Builder</h1>
              <p className="text-gray-600">Create professional resumes with AI assistance</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button 
              onClick={generateResume} 
              disabled={isGenerating || !resumeData.personalInfo.fullName}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Resume
                </>
              )}
            </Button>
            {generatedResume && (
              <Button onClick={downloadResume} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            <Tabs defaultValue="personal">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
              </TabsList>

              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        placeholder="Full Name *"
                        value={resumeData.personalInfo.fullName}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                        }))}
                      />
                      <Input
                        placeholder="Email Address *"
                        type="email"
                        value={resumeData.personalInfo.email}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, email: e.target.value }
                        }))}
                      />
                      <Input
                        placeholder="Phone Number"
                        value={resumeData.personalInfo.phone}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, phone: e.target.value }
                        }))}
                      />
                      <Input
                        placeholder="Location"
                        value={resumeData.personalInfo.location}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, location: e.target.value }
                        }))}
                      />
                      <Input
                        placeholder="Website/Portfolio"
                        value={resumeData.personalInfo.website}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, website: e.target.value }
                        }))}
                        className="sm:col-span-2"
                      />
                    </div>
                    <Textarea
                      placeholder="Professional Summary"
                      value={resumeData.personalInfo.summary}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, summary: e.target.value }
                      }))}
                      className="min-h-[100px]"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="experience">
                <Card>
                  <CardHeader>
                    <CardTitle>Work Experience</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {resumeData.experience.map((exp, index) => (
                      <div key={exp.id} className="space-y-4 p-4 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Experience {index + 1}</h4>
                          {resumeData.experience.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExperience(exp.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input
                            placeholder="Job Title"
                            value={exp.title}
                            onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                          />
                          <Input
                            placeholder="Company"
                            value={exp.company}
                            onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                          />
                          <Input
                            placeholder="Location"
                            value={exp.location}
                            onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Input
                              placeholder="Start Date"
                              value={exp.startDate}
                              onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                            />
                            <Input
                              placeholder="End Date"
                              value={exp.endDate}
                              onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                              disabled={exp.current}
                            />
                          </div>
                        </div>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={exp.current}
                            onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm">I currently work here</span>
                        </label>
                        <Textarea
                          placeholder="Job description and achievements"
                          value={exp.description}
                          onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                          className="min-h-[80px]"
                        />
                      </div>
                    ))}
                    <Button onClick={addExperience} variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Experience
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="education">
                <Card>
                  <CardHeader>
                    <CardTitle>Education</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {resumeData.education.map((edu, index) => (
                      <div key={edu.id} className="space-y-4 p-4 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Education {index + 1}</h4>
                          {resumeData.education.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEducation(edu.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input
                            placeholder="Degree"
                            value={edu.degree}
                            onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                          />
                          <Input
                            placeholder="School/University"
                            value={edu.school}
                            onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                          />
                          <Input
                            placeholder="Location"
                            value={edu.location}
                            onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                          />
                          <Input
                            placeholder="GPA (optional)"
                            value={edu.gpa}
                            onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                          />
                          <Input
                            placeholder="Start Date"
                            value={edu.startDate}
                            onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                          />
                          <Input
                            placeholder="End Date"
                            value={edu.endDate}
                            onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                    <Button onClick={addEducation} variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Education
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="skills">
                <Card>
                  <CardHeader>
                    <CardTitle>Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {resumeData.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="relative group">
                            {skill}
                            <button
                              onClick={() => removeSkill(skill)}
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a skill"
                          value={resumeData.tempSkill}
                          onChange={(e) => setResumeData(prev => ({ ...prev, tempSkill: e.target.value }))}
                          onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                        />
                        <Button onClick={addSkill} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Section */}
          <div className="lg:sticky lg:top-8">
            <Card>
              <CardHeader>
                <CardTitle>Resume Preview</CardTitle>
                <CardDescription>
                  {generatedResume ? "AI-generated resume ready for download" : "Fill in your information to see the preview"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedResume ? (
                  <div className="space-y-4">
                    <div 
                      className="border rounded-lg p-4 bg-white max-h-[600px] overflow-y-auto"
                      dangerouslySetInnerHTML={createSafeHtml(generatedResume)}
                    />
                    <Button onClick={downloadResume} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Resume
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Your resume preview will appear here</p>
                    <p className="text-sm">Fill in your information and click "Generate Resume"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
