
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PersonalInfoSection } from '@/components/resume/enhanced/sections/PersonalInfoSection';
import { ProfessionalSummarySection } from '@/components/resume/enhanced/sections/ProfessionalSummarySection';
import { SkillsSection } from '@/components/resume/enhanced/sections/SkillsSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, GraduationCap, Award, Languages, Sparkles, ArrowLeft } from 'lucide-react';

interface Resume {
  id: string;
  title: string;
  content: any;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface ResumeSection {
  id: string;
  resume_id: string;
  section_type: string;
  content: any;
  display_order: number;
}

export default function EditResume() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState<Resume | null>(null);
  const [sections, setSections] = useState<ResumeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [enhancing, setEnhancing] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchResume(id);
    }
  }, [id]);

  const fetchResume = async (resumeId: string) => {
    try {
      setLoading(true);
      
      const { data: resumeData, error: resumeError } = await supabase
        .from('ai_resumes')
        .select('*')
        .eq('id', resumeId)
        .single();

      if (resumeError) throw resumeError;

      const { data: sectionsData, error: sectionsError } = await supabase
        .from('resume_sections')
        .select('*')
        .eq('resume_id', resumeId)
        .order('display_order');

      if (sectionsError) throw sectionsError;

      setResume(resumeData);
      
      // If sections exist, use them
      if (sectionsData && sectionsData.length > 0) {
        setSections(sectionsData);
      } else if (resumeData.content && typeof resumeData.content === 'object') {
        // Create sections from extracted content
        await createSectionsFromContent(resumeData, resumeId);
      }
    } catch (error) {
      console.error('Error fetching resume:', error);
      toast.error('Error loading resume');
    } finally {
      setLoading(false);
    }
  };

  const createSectionsFromContent = async (resumeData: Resume, resumeId: string) => {
    const contentData = resumeData.content as any;
    const sectionsToCreate = [];
    
    // Create sections from extracted content with improved mapping
    if (contentData.extracted?.personalInfo || contentData.personalInfo) {
      const personalInfo = contentData.extracted?.personalInfo || contentData.personalInfo;
      sectionsToCreate.push({
        id: crypto.randomUUID(),
        resume_id: resumeId,
        section_type: 'personal_info',
        content: {
          name: personalInfo.fullName || personalInfo.name || '',
          email: personalInfo.email || '',
          phone: personalInfo.phone || '',
          location: personalInfo.location || '',
          linkedin: personalInfo.linkedin || '',
          website: personalInfo.website || ''
        },
        display_order: 1
      });
    }
    
    if (contentData.extracted?.professionalSummary?.content || contentData.professionalSummary?.content) {
      const summary = contentData.extracted?.professionalSummary || contentData.professionalSummary;
      sectionsToCreate.push({
        id: crypto.randomUUID(),
        resume_id: resumeId,
        section_type: 'summary',
        content: summary.content || '',
        display_order: 2
      });
    }
    
    if (contentData.extracted?.experience || contentData.experience) {
      const experience = contentData.extracted?.experience || contentData.experience;
      if (Array.isArray(experience) && experience.length > 0) {
        sectionsToCreate.push({
          id: crypto.randomUUID(),
          resume_id: resumeId,
          section_type: 'experience',
          content: experience.map(exp => ({
            jobTitle: exp.jobTitle || exp.title || '',
            companyName: exp.companyName || exp.company || '',
            location: exp.location || '',
            startDate: exp.startDate || '',
            endDate: exp.endDate || '',
            description: exp.description || '',
            achievements: exp.achievements || [],
            responsibilities: exp.responsibilities || []
          })),
          display_order: 3
        });
      }
    }
    
    if (contentData.extracted?.education || contentData.education) {
      const education = contentData.extracted?.education || contentData.education;
      if (Array.isArray(education) && education.length > 0) {
        sectionsToCreate.push({
          id: crypto.randomUUID(),
          resume_id: resumeId,
          section_type: 'education',
          content: education.map(edu => ({
            degree: edu.degree || '',
            institutionName: edu.institutionName || edu.school || edu.institution || '',
            location: edu.location || '',
            startDate: edu.startDate || '',
            endDate: edu.endDate || '',
            grade: edu.grade || edu.gpa || '',
            honors: edu.honors || ''
          })),
          display_order: 4
        });
      }
    }
    
    if (contentData.extracted?.skills || contentData.skills) {
      const skills = contentData.extracted?.skills || contentData.skills;
      let skillsArray = [];
      
      // Handle different skill formats
      if (skills.technical && Array.isArray(skills.technical)) {
        skillsArray = skills.technical.map((skill: any) => ({
          id: crypto.randomUUID(),
          name: skill.skill || skill.name || skill,
          level: skill.proficiency || 'intermediate',
          category: 'Technical',
          years: 0
        }));
      } else if (Array.isArray(skills)) {
        skillsArray = skills.map((skill: any) => ({
          id: crypto.randomUUID(),
          name: typeof skill === 'string' ? skill : skill.name || skill.skill || '',
          level: 'intermediate',
          category: 'Technical',
          years: 0
        }));
      }
      
      if (skillsArray.length > 0) {
        sectionsToCreate.push({
          id: crypto.randomUUID(),
          resume_id: resumeId,
          section_type: 'skills',
          content: skillsArray,
          display_order: 5
        });
      }
    }
    
    // Save sections to database and update state
    if (sectionsToCreate.length > 0) {
      const { error: sectionsInsertError } = await supabase
        .from('resume_sections')
        .insert(sectionsToCreate);
      
      if (!sectionsInsertError) {
        setSections(sectionsToCreate);
      } else {
        console.error('Error saving sections:', sectionsInsertError);
        setSections(sectionsToCreate); // Still show them in UI
      }
    }
  };

  const enhanceSection = async (sectionType: string) => {
    if (!resume) return;
    
    setEnhancing(sectionType);
    
    try {
      const section = sections.find(s => s.section_type === sectionType);
      if (!section) {
        toast.error('Section not found');
        return;
      }

      const { data, error } = await supabase.functions.invoke('enhance-resume', {
        body: {
          resumeData: { [sectionType]: section.content },
          section: sectionType,
          userId: resume.user_id
        }
      });

      if (error) throw error;

      if (data.success) {
        // Update the section with enhanced content
        const updatedSections = sections.map(s => 
          s.section_type === sectionType 
            ? { ...s, content: data.enhanced }
            : s
        );
        
        setSections(updatedSections);
        
        // Save to database
        await supabase
          .from('resume_sections')
          .update({ content: data.enhanced })
          .eq('id', section.id);
        
        toast.success(`${sectionType} section enhanced successfully!`);
      }
    } catch (error) {
      console.error('Error enhancing section:', error);
      toast.error('Failed to enhance section');
    } finally {
      setEnhancing(null);
    }
  };

  const updateSection = async (sectionType: string, newContent: any) => {
    const section = sections.find(s => s.section_type === sectionType);
    if (!section) return;

    try {
      const updatedSections = sections.map(s => 
        s.section_type === sectionType 
          ? { ...s, content: newContent }
          : s
      );
      
      setSections(updatedSections);
      
      // Save to database
      await supabase
        .from('resume_sections')
        .update({ content: newContent })
        .eq('id', section.id);
      
    } catch (error) {
      console.error('Error updating section:', error);
      toast.error('Failed to update section');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading resume...</div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Resume not found</div>
      </div>
    );
  }

  const personalInfoSection = sections.find(s => s.section_type === 'personal_info');
  const summarySection = sections.find(s => s.section_type === 'summary');
  const skillsSection = sections.find(s => s.section_type === 'skills');
  const experienceSection = sections.find(s => s.section_type === 'experience');
  const educationSection = sections.find(s => s.section_type === 'education');

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/resume-builder')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Resumes
        </Button>
        <h1 className="text-2xl font-bold">{resume.title}</h1>
      </div>

      <div className="space-y-6">
        {/* Personal Information */}
        {personalInfoSection && (
          <div className="relative">
            <PersonalInfoSection
              data={personalInfoSection.content}
              onChange={(newData) => updateSection('personal_info', newData)}
            />
            <Button
              onClick={() => enhanceSection('personal_info')}
              disabled={enhancing === 'personal_info'}
              className="absolute top-4 right-4"
              size="sm"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {enhancing === 'personal_info' ? 'Enhancing...' : 'Enhance'}
            </Button>
          </div>
        )}

        {/* Professional Summary */}
        {summarySection && (
          <div className="relative">
            <ProfessionalSummarySection
              data={{ 
                content: summarySection.content,
                keyHighlights: []
              }}
              onChange={(newData) => updateSection('summary', newData.content)}
            />
            <Button
              onClick={() => enhanceSection('summary')}
              disabled={enhancing === 'summary'}
              className="absolute top-4 right-4"
              size="sm"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {enhancing === 'summary' ? 'Enhancing...' : 'Enhance'}
            </Button>
          </div>
        )}

        {/* Experience */}
        {experienceSection && (
          <div className="relative">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Work Experience
                </CardTitle>
                <Button
                  onClick={() => enhanceSection('experience')}
                  disabled={enhancing === 'experience'}
                  size="sm"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {enhancing === 'experience' ? 'Enhancing...' : 'Enhance'}
                </Button>
              </CardHeader>
              <CardContent>
                {Array.isArray(experienceSection.content) && experienceSection.content.length > 0 ? (
                  <div className="space-y-4">
                    {experienceSection.content.map((exp: any, index: number) => (
                      <div key={index} className="border-l-2 border-gray-200 pl-4">
                        <h4 className="font-semibold">{exp.jobTitle}</h4>
                        <p className="text-sm font-medium text-gray-600">{exp.companyName}</p>
                        <p className="text-sm text-gray-500">{exp.startDate} - {exp.endDate}</p>
                        {exp.description && <p className="text-sm mt-2">{exp.description}</p>}
                        {exp.achievements && exp.achievements.length > 0 && (
                          <ul className="list-disc list-inside text-sm mt-2">
                            {exp.achievements.map((achievement: string, i: number) => (
                              <li key={i}>{achievement}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No work experience added yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Education */}
        {educationSection && (
          <div className="relative">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education
                </CardTitle>
                <Button
                  onClick={() => enhanceSection('education')}
                  disabled={enhancing === 'education'}
                  size="sm"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {enhancing === 'education' ? 'Enhancing...' : 'Enhance'}
                </Button>
              </CardHeader>
              <CardContent>
                {Array.isArray(educationSection.content) && educationSection.content.length > 0 ? (
                  <div className="space-y-4">
                    {educationSection.content.map((edu: any, index: number) => (
                      <div key={index} className="space-y-1">
                        <h4 className="font-semibold">{edu.degree}</h4>
                        <p className="text-sm font-medium text-gray-600">{edu.institutionName}</p>
                        <p className="text-sm text-gray-500">{edu.startDate} - {edu.endDate}</p>
                        {edu.grade && <p className="text-sm">Grade: {edu.grade}</p>}
                        {edu.honors && <p className="text-sm">Honors: {edu.honors}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No education added yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Skills */}
        {skillsSection && (
          <div className="relative">
            <SkillsSection
              data={skillsSection.content || []}
              onChange={(newData) => updateSection('skills', newData)}
            />
            <Button
              onClick={() => enhanceSection('skills')}
              disabled={enhancing === 'skills'}
              className="absolute top-4 right-4"
              size="sm"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {enhancing === 'skills' ? 'Enhancing...' : 'Enhance'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
