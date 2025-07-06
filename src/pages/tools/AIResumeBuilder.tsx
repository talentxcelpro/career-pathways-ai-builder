import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Wand2,
  Download,
  Eye,
  Save,
  Copy,
  Sparkles,
  Award
} from 'lucide-react';
import { toast } from 'sonner';

const AIResumeBuilder = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    jobTitle: '',
    industry: '',
    experience: '',
    skills: '',
    achievements: '',
    education: ''
  });
  const [generatedResume, setGeneratedResume] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');

  const generateResume = async () => {
    if (!profileData.fullName || !profileData.email || !profileData.jobTitle) {
      toast.error('Please fill in required fields (Name, Email, Job Title)');
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI resume generation
    setTimeout(() => {
      setGeneratedResume({
        personalInfo: {
          name: profileData.fullName,
          email: profileData.email,
          phone: profileData.phone,
          location: profileData.location,
          title: profileData.jobTitle
        },
        summary: `Experienced ${profileData.jobTitle} with ${profileData.experience} years of expertise in ${profileData.industry}. Proven track record of delivering innovative solutions and driving business growth through strategic thinking and technical excellence.`,
        experience: [
          {
            title: `Senior ${profileData.jobTitle}`,
            company: 'TechCorp Solutions',
            duration: '2021 - Present',
            description: [
              'Led cross-functional teams to deliver complex projects on time and within budget',
              'Implemented innovative solutions that improved efficiency by 35%',
              'Mentored junior team members and contributed to strategic planning'
            ]
          },
          {
            title: profileData.jobTitle,
            company: 'Innovation Labs',
            duration: '2019 - 2021',
            description: [
              'Developed and maintained scalable applications serving 100K+ users',
              'Collaborated with product teams to define technical requirements',
              'Optimized system performance resulting in 40% faster load times'
            ]
          }
        ],
        skills: profileData.skills.split(',').map(skill => skill.trim()).filter(Boolean),
        education: [
          {
            degree: 'Bachelor of Science in Computer Science',
            institution: 'University of Technology',
            year: '2019'
          }
        ],
        achievements: profileData.achievements.split('\n').filter(Boolean),
        atsScore: Math.floor(Math.random() * 20) + 80
      });
      setIsGenerating(false);
      toast.success('Resume generated successfully!');
    }, 3000);
  };

  const copyToClipboard = async () => {
    if (!generatedResume) return;
    
    try {
      const resumeText = `
${generatedResume.personalInfo.name}
${generatedResume.personalInfo.email} | ${generatedResume.personalInfo.phone}
${generatedResume.personalInfo.location}

PROFESSIONAL SUMMARY
${generatedResume.summary}

EXPERIENCE
${generatedResume.experience.map((exp: any) => `
${exp.title} - ${exp.company} (${exp.duration})
${exp.description.map((desc: string) => `• ${desc}`).join('\n')}
`).join('\n')}

SKILLS
${generatedResume.skills.join(', ')}

EDUCATION
${generatedResume.education.map((edu: any) => `${edu.degree} - ${edu.institution} (${edu.year})`).join('\n')}
      `.trim();
      
      await navigator.clipboard.writeText(resumeText);
      toast.success('Resume copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const templates = [
    { id: 'modern', name: 'Modern', description: 'Clean and contemporary design' },
    { id: 'professional', name: 'Professional', description: 'Traditional corporate style' },
    { id: 'creative', name: 'Creative', description: 'Unique and eye-catching layout' },
    { id: 'minimalist', name: 'Minimalist', description: 'Simple and elegant approach' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-purple-600" />
          AI Resume Builder
        </h1>
        <p className="text-gray-600 mt-2">
          Create a professional resume with AI-powered content generation and optimization
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profileData.location}
                  onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="San Francisco, CA"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Professional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="jobTitle">Job Title *</Label>
                <Input
                  id="jobTitle"
                  value={profileData.jobTitle}
                  onChange={(e) => setProfileData(prev => ({ ...prev, jobTitle: e.target.value }))}
                  placeholder="Software Engineer"
                />
              </div>

              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select value={profileData.industry} onValueChange={(value) => setProfileData(prev => ({ ...prev, industry: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="experience">Years of Experience</Label>
                <Select value={profileData.experience} onValueChange={(value) => setProfileData(prev => ({ ...prev, experience: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1">0-1 years</SelectItem>
                    <SelectItem value="2-5">2-5 years</SelectItem>
                    <SelectItem value="6-10">6-10 years</SelectItem>
                    <SelectItem value="10+">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Textarea
                  id="skills"
                  value={profileData.skills}
                  onChange={(e) => setProfileData(prev => ({ ...prev, skills: e.target.value }))}
                  placeholder="JavaScript, React, Node.js, Python, AWS"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="achievements">Key Achievements (one per line)</Label>
                <Textarea
                  id="achievements"
                  value={profileData.achievements}
                  onChange={(e) => setProfileData(prev => ({ ...prev, achievements: e.target.value }))}
                  placeholder="Increased team productivity by 25%&#10;Led migration to cloud infrastructure&#10;Mentored 5 junior developers"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Template Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-3 text-left border rounded-lg transition-colors ${
                      selectedTemplate === template.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-gray-600">{template.description}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={generateResume}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Wand2 className="h-5 w-5 mr-2 animate-spin" />
                Generating Resume...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Resume
              </>
            )}
          </Button>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-2">
          {generatedResume ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Generated Resume</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      ATS Score: {generatedResume.atsScore}%
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm">
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 bg-white border rounded-lg p-6 font-serif">
                  {/* Header */}
                  <div className="text-center border-b pb-4">
                    <h1 className="text-2xl font-bold text-gray-900">{generatedResume.personalInfo.name}</h1>
                    <div className="text-gray-600 mt-1">
                      {generatedResume.personalInfo.email} | {generatedResume.personalInfo.phone}
                    </div>
                    <div className="text-gray-600">{generatedResume.personalInfo.location}</div>
                  </div>

                  {/* Summary */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">PROFESSIONAL SUMMARY</h2>
                    <p className="text-gray-700 leading-relaxed">{generatedResume.summary}</p>
                  </div>

                  {/* Experience */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">EXPERIENCE</h2>
                    {generatedResume.experience.map((exp: any, index: number) => (
                      <div key={index} className="mb-4">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-medium text-gray-900">{exp.title}</h3>
                          <span className="text-sm text-gray-600">{exp.duration}</span>
                        </div>
                        <div className="text-gray-700 mb-2">{exp.company}</div>
                        <ul className="space-y-1">
                          {exp.description.map((desc: string, i: number) => (
                            <li key={i} className="text-sm text-gray-700">• {desc}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Skills */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">SKILLS</h2>
                    <div className="flex flex-wrap gap-2">
                      {generatedResume.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Education */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">EDUCATION</h2>
                    {generatedResume.education.map((edu: any, index: number) => (
                      <div key={index} className="text-gray-700">
                        <div className="font-medium">{edu.degree}</div>
                        <div>{edu.institution} - {edu.year}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-20">
                <FileText className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">Ready to Build</h3>
                <p className="text-gray-600 text-center">
                  Fill in your information and click "Generate Resume" to create your AI-powered resume
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIResumeBuilder;