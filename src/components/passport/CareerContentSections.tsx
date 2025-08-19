import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Briefcase, 
  GraduationCap, 
  Code, 
  Award, 
  Users, 
  Calendar,
  MapPin,
  ExternalLink,
  Star,
  Plus,
  TrendingUp,
  Target,
  Brain,
  CheckCircle
} from 'lucide-react';
import { useCareerContent } from '@/hooks/useCareerContent';
import { format } from 'date-fns';

interface CareerContentSectionsProps {
  isPublicView?: boolean;
  showFullView?: boolean;
}

export function CareerContentSections({ isPublicView = false, showFullView = true }: CareerContentSectionsProps) {
  const { 
    experience, 
    education, 
    projects, 
    skills, 
    certifications, 
    testimonials,
    skillGapAnalysis,
    getTotalExperience,
    getSkillsByCategory,
    getVerifiedCertifications,
    getPublicTestimonials,
    isLoading 
  } = useCareerContent();

  if (isLoading) {
    return <div className="space-y-6">Loading career content...</div>;
  }

  const totalExperience = getTotalExperience();
  const skillsByCategory = getSkillsByCategory();
  const verifiedCertifications = getVerifiedCertifications();
  const publicTestimonials = getPublicTestimonials();

  return (
    <div className="space-y-6">
      {/* Professional Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Professional Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{Math.floor(totalExperience)}+</div>
              <div className="text-sm text-muted-foreground">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{projects.length}</div>
              <div className="text-sm text-muted-foreground">Projects Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{verifiedCertifications.length}</div>
              <div className="text-sm text-muted-foreground">Certifications</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Experience Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Work Experience
          </CardTitle>
          {!isPublicView && (
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Experience
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {experience.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No work experience added yet
            </div>
          ) : (
            <div className="space-y-4">
              {experience.slice(0, showFullView ? undefined : 3).map((exp) => (
                <div key={exp.id} className="border-l-2 border-primary/20 pl-4 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{exp.job_title}</h3>
                      <p className="text-primary font-medium">{exp.company_name}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(exp.start_date), 'MMM yyyy')} - {
                            exp.is_current ? 'Present' : format(new Date(exp.end_date!), 'MMM yyyy')
                          }
                        </span>
                        {exp.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {exp.location}
                          </span>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {exp.employment_type}
                        </Badge>
                      </div>
                      {exp.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {exp.description}
                        </p>
                      )}
                      {exp.achievements.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Key Achievements:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {exp.achievements.slice(0, 2).map((achievement, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                {achievement}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {exp.skills_used.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {exp.skills_used.slice(0, 5).map((skill, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    {exp.company_logo && (
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={exp.company_logo} />
                        <AvatarFallback>{exp.company_name[0]}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Education Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Education
          </CardTitle>
          {!isPublicView && (
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Education
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {education.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No education history added yet
            </div>
          ) : (
            <div className="space-y-4">
              {education.slice(0, showFullView ? undefined : 3).map((edu) => (
                <div key={edu.id} className="border-l-2 border-primary/20 pl-4 pb-4">
                  <h3 className="font-semibold">{edu.degree}</h3>
                  {edu.field_of_study && (
                    <p className="text-sm text-muted-foreground">{edu.field_of_study}</p>
                  )}
                  <p className="text-primary font-medium">{edu.institution_name}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(edu.start_date), 'MMM yyyy')} - {
                        edu.is_current ? 'Present' : format(new Date(edu.end_date!), 'MMM yyyy')
                      }
                    </span>
                    {edu.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {edu.location}
                      </span>
                    )}
                  </div>
                  {(edu.grade || edu.gpa || edu.honors) && (
                    <div className="flex gap-4 mt-2">
                      {edu.grade && <Badge variant="secondary">Grade: {edu.grade}</Badge>}
                      {edu.gpa && <Badge variant="secondary">GPA: {edu.gpa}</Badge>}
                      {edu.honors && <Badge variant="secondary">{edu.honors}</Badge>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Skills & Expertise
          </CardTitle>
          {!isPublicView && (
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {Object.keys(skillsByCategory).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No skills added yet
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                <div key={category}>
                  <h4 className="font-medium capitalize mb-2 text-sm">{category} Skills</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categorySkills.slice(0, showFullView ? undefined : 4).map((skill) => (
                      <div key={skill.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{skill.skill_name}</span>
                          {skill.is_verified && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={skill.proficiency_level * 20} className="w-16 h-2" />
                          <span className="text-xs text-muted-foreground w-8">
                            {skill.proficiency_level}/5
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projects Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Projects & Portfolio
          </CardTitle>
          {!isPublicView && (
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No projects added yet
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.slice(0, showFullView ? undefined : 4).map((project) => (
                <div key={project.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{project.title}</h3>
                    <Badge variant="outline" className="text-xs capitalize">
                      {project.project_type}
                    </Badge>
                  </div>
                  {project.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  {project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.technologies.slice(0, 4).map((tech, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    {project.project_url && (
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Live Demo
                      </Button>
                    )}
                    {project.github_url && (
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        <Code className="h-3 w-3 mr-1" />
                        Code
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certifications Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certifications & Achievements
          </CardTitle>
          {!isPublicView && (
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Certification
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {certifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No certifications added yet
            </div>
          ) : (
            <div className="space-y-3">
              {certifications.slice(0, showFullView ? undefined : 5).map((cert) => (
                <div key={cert.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    {cert.image_url && (
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={cert.image_url} />
                        <AvatarFallback>{cert.issuing_organization[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <h4 className="font-medium">{cert.certification_name}</h4>
                      <p className="text-sm text-muted-foreground">{cert.issuing_organization}</p>
                      <p className="text-xs text-muted-foreground">
                        Issued {format(new Date(cert.issue_date), 'MMM yyyy')}
                        {cert.expiry_date && ` • Expires ${format(new Date(cert.expiry_date), 'MMM yyyy')}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={cert.verification_status === 'verified' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {cert.verification_status}
                    </Badge>
                    {cert.credential_url && (
                      <Button size="sm" variant="outline" className="h-7">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Testimonials Section */}
      {(isPublicView ? publicTestimonials : testimonials).length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recommendations
            </CardTitle>
            {!isPublicView && (
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Request Recommendation
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(isPublicView ? publicTestimonials : testimonials)
                .slice(0, showFullView ? undefined : 3)
                .map((testimonial) => (
                <div key={testimonial.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{testimonial.recommender_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{testimonial.recommender_name}</h4>
                        {testimonial.is_verified && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      {testimonial.recommender_title && (
                        <p className="text-sm text-muted-foreground">
                          {testimonial.recommender_title}
                          {testimonial.recommender_company && ` at ${testimonial.recommender_company}`}
                        </p>
                      )}
                      <p className="text-sm mt-2 italic">"{testimonial.testimonial_text}"</p>
                      {testimonial.skills_endorsed.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {testimonial.skills_endorsed.map((skill, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skill Gap Analysis */}
      {!isPublicView && skillGapAnalysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Career Growth Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {skillGapAnalysis.slice(0, 1).map((analysis) => (
              <div key={analysis.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Target Role: {analysis.target_role}</h4>
                    {analysis.target_industry && (
                      <p className="text-sm text-muted-foreground">Industry: {analysis.target_industry}</p>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{analysis.competitiveness_score}%</div>
                    <div className="text-xs text-muted-foreground">Market Fit</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-sm mb-2 text-green-600">Current Strengths</h5>
                    <div className="flex flex-wrap gap-1">
                      {analysis.current_skills.slice(0, 6).map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-sm mb-2 text-orange-600">Skills to Develop</h5>
                    <div className="flex flex-wrap gap-1">
                      {analysis.skill_gaps.slice(0, 6).map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <Button size="sm" className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Get Learning Recommendations
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}