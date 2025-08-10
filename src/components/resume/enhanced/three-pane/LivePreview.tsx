import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { EditorResume } from '@/types/editor-resume';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Github, 
  Globe,
  Calendar,
  Building,
  GraduationCap,
  Award,
  ExternalLink
} from 'lucide-react';

interface LivePreviewProps {
  data: EditorResume;
  templateId: string;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ data, templateId }) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = formatDate(startDate);
    const end = endDate ? formatDate(endDate) : 'Present';
    return `${start} - ${end}`;
  };

  return (
    <div className="h-full bg-background">
      <div className="border-b border-border bg-muted/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Live Preview</h3>
          <Badge variant="outline" className="text-xs">
            {templateId}
          </Badge>
        </div>
      </div>
      
      <div className="p-4 overflow-auto">
        <div className="bg-white shadow-lg rounded-lg max-w-2xl mx-auto min-h-[11in] p-8 text-sm">
          {/* Header - Personal Info */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {data.personalInfo.fullName || 'Your Name'}
            </h1>
            {data.personalInfo.professionalTitle && (
              <p className="text-lg text-gray-600 mb-4">
                {data.personalInfo.professionalTitle}
              </p>
            )}
            
            <div className="flex flex-wrap justify-center gap-4 text-gray-600">
              {data.personalInfo.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>{data.personalInfo.email}</span>
                </div>
              )}
              {data.personalInfo.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <span>{data.personalInfo.phone}</span>
                </div>
              )}
              {data.personalInfo.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{data.personalInfo.location}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 mt-2 text-gray-600">
              {data.personalInfo.linkedin && (
                <div className="flex items-center gap-1">
                  <Linkedin className="h-4 w-4" />
                  <span>LinkedIn</span>
                </div>
              )}
              {data.personalInfo.github && (
                <div className="flex items-center gap-1">
                  <Github className="h-4 w-4" />
                  <span>GitHub</span>
                </div>
              )}
              {data.personalInfo.website && (
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  <span>Website</span>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          {data.personalInfo.summary && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-gray-200 pb-1">
                Professional Summary
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {data.personalInfo.summary}
              </p>
            </div>
          )}

          {/* Experience */}
          {data.experience.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-200 pb-1">
                Work Experience
              </h2>
              <div className="space-y-6">
                {data.experience.map((exp, index) => (
                  <div key={exp.id || index}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {exp.title}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Building className="h-4 w-4" />
                          <span className="font-medium">{exp.company}</span>
                          {exp.location && (
                            <>
                              <span>•</span>
                              <span>{exp.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-gray-600 text-right">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDateRange(exp.startDate, exp.endDate)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {exp.description && (
                      <p className="text-gray-700 mb-3">{exp.description}</p>
                    )}
                    
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="list-disc list-inside text-gray-700 mb-3 space-y-1">
                        {exp.achievements.map((achievement, achIndex) => (
                          <li key={achIndex}>{achievement}</li>
                        ))}
                      </ul>
                    )}
                    
                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {exp.technologies.map((tech, techIndex) => (
                          <Badge key={techIndex} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-200 pb-1">
                Education
              </h2>
              <div className="space-y-4">
                {data.education.map((edu, index) => (
                  <div key={edu.id || index}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {edu.degree}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-600">
                          <GraduationCap className="h-4 w-4" />
                          <span className="font-medium">{edu.institution}</span>
                          {edu.location && (
                            <>
                              <span>•</span>
                              <span>{edu.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-gray-600 text-right">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDateRange(edu.startDate, edu.endDate)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {edu.description && (
                      <p className="text-gray-700 mt-2">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {(data.skills.technical.length > 0 || data.skills.soft.length > 0 || 
            data.skills.tools.length > 0 || data.skills.languages.length > 0) && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-200 pb-1">
                Skills
              </h2>
              <div className="space-y-3">
                {data.skills.technical.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Technical Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {data.skills.technical.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {data.skills.tools.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Tools & Technologies</h4>
                    <div className="flex flex-wrap gap-2">
                      {data.skills.tools.map((tool, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {data.skills.soft.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Soft Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {data.skills.soft.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {data.skills.languages.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Languages</h4>
                    <div className="flex flex-wrap gap-2">
                      {data.skills.languages.map((lang, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Projects */}
          {data.projects.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-200 pb-1">
                Projects
              </h2>
              <div className="space-y-4">
                {data.projects.map((project, index) => (
                  <div key={project.id || index}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {project.name}
                      </h3>
                      {project.link && (
                        <ExternalLink className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                    
                    {project.description && (
                      <p className="text-gray-700 mb-3">{project.description}</p>
                    )}
                    
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, techIndex) => (
                          <Badge key={techIndex} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};