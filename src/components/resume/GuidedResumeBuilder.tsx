import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GuidedResumeBuilderProps {
  onComplete: (data: any) => void;
  initialData?: any;
}

interface Step {
  id: number;
  title: string;
  description: string;
  fields: Field[];
  helpText: string;
  examples: string[];
}

interface Field {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'email' | 'tel' | 'url';
  required: boolean;
  placeholder: string;
  tooltip: string;
}

const steps: Step[] = [
  {
    id: 1,
    title: 'Contact Information',
    description: 'Let\'s start with your basic details',
    helpText: 'Your contact information helps employers reach you. Make sure it\'s accurate and professional.',
    examples: [
      'Use a professional email address',
      'Include your full name as you\'d like it to appear',
      'Add your city and state (no full address needed)'
    ],
    fields: [
      { name: 'fullName', label: 'Full Name', type: 'text', required: true, placeholder: 'John Smith', tooltip: 'Your full name as it should appear on your resume' },
      { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'john.smith@email.com', tooltip: 'Use a professional email address' },
      { name: 'phone', label: 'Phone', type: 'tel', required: true, placeholder: '+1 (555) 123-4567', tooltip: 'Include country code if applying internationally' },
      { name: 'location', label: 'Location', type: 'text', required: true, placeholder: 'San Francisco, CA', tooltip: 'City and state is sufficient' },
      { name: 'linkedin', label: 'LinkedIn URL', type: 'url', required: false, placeholder: 'https://linkedin.com/in/yourprofile', tooltip: 'Optional but recommended for professional roles' },
    ]
  },
  {
    id: 2,
    title: 'Professional Summary',
    description: 'Tell us about yourself in 3-4 sentences',
    helpText: 'Your professional summary is your elevator pitch. Highlight your key strengths, experience, and what you bring to employers.',
    examples: [
      'Start with your professional title and years of experience',
      'Include 2-3 key achievements or skills',
      'Mention what you\'re looking for in your next role'
    ],
    fields: [
      { 
        name: 'summary', 
        label: 'Professional Summary', 
        type: 'textarea', 
        required: true, 
        placeholder: 'Results-driven Software Engineer with 5+ years of experience building scalable web applications. Expertise in React, Node.js, and cloud technologies. Proven track record of delivering high-impact projects that increased user engagement by 40%. Seeking opportunities to leverage full-stack development skills in innovative technology companies.',
        tooltip: 'Write 3-4 sentences highlighting your experience, skills, and career goals'
      }
    ]
  },
  {
    id: 3,
    title: 'Work Experience',
    description: 'Add your work history',
    helpText: 'For each job, focus on achievements rather than just duties. Use numbers and metrics whenever possible.',
    examples: [
      'Start bullet points with action verbs (Led, Developed, Increased)',
      'Quantify your achievements (Increased sales by 25%)',
      'Highlight specific technologies and methodologies used'
    ],
    fields: [
      { name: 'jobTitle', label: 'Job Title', type: 'text', required: true, placeholder: 'Senior Software Engineer', tooltip: 'Your official job title' },
      { name: 'company', label: 'Company', type: 'text', required: true, placeholder: 'Tech Corp', tooltip: 'Company name' },
      { name: 'location', label: 'Location', type: 'text', required: false, placeholder: 'New York, NY', tooltip: 'Job location' },
      { name: 'startDate', label: 'Start Date', type: 'text', required: true, placeholder: 'January 2020', tooltip: 'Month and year' },
      { name: 'endDate', label: 'End Date', type: 'text', required: false, placeholder: 'Present or December 2023', tooltip: 'Leave blank if current position' },
      { 
        name: 'achievements', 
        label: 'Key Achievements (one per line)', 
        type: 'textarea', 
        required: true, 
        placeholder: 'Led development of microservices architecture serving 1M+ users\nReduced API response time by 60% through optimization\nMentored team of 5 junior developers',
        tooltip: 'Focus on results and impact, use metrics'
      }
    ]
  },
  {
    id: 4,
    title: 'Education',
    description: 'Share your educational background',
    helpText: 'Include your highest degree first. If you have relevant coursework or honors, mention them.',
    examples: [
      'Include your degree, major, and institution',
      'Add GPA if it\'s above 3.5',
      'List relevant honors or awards'
    ],
    fields: [
      { name: 'degree', label: 'Degree', type: 'text', required: true, placeholder: 'Bachelor of Science in Computer Science', tooltip: 'Full degree name and major' },
      { name: 'institution', label: 'Institution', type: 'text', required: true, placeholder: 'University of California, Berkeley', tooltip: 'University or college name' },
      { name: 'graduationYear', label: 'Graduation Year', type: 'text', required: true, placeholder: '2018', tooltip: 'Year you graduated or expect to graduate' },
      { name: 'gpa', label: 'GPA (optional)', type: 'text', required: false, placeholder: '3.8/4.0', tooltip: 'Only include if 3.5 or higher' },
    ]
  },
  {
    id: 5,
    title: 'Skills',
    description: 'List your technical and professional skills',
    helpText: 'Include both hard skills (technical) and soft skills (communication, leadership). Prioritize skills relevant to your target role.',
    examples: [
      'Group similar skills together',
      'List most relevant skills first',
      'Include proficiency levels for key skills'
    ],
    fields: [
      { 
        name: 'technicalSkills', 
        label: 'Technical Skills (comma-separated)', 
        type: 'textarea', 
        required: true, 
        placeholder: 'React, Node.js, Python, AWS, Docker, PostgreSQL, Git, REST APIs',
        tooltip: 'Programming languages, frameworks, tools you\'re proficient in'
      },
      { 
        name: 'softSkills', 
        label: 'Professional Skills (comma-separated)', 
        type: 'textarea', 
        required: false, 
        placeholder: 'Leadership, Project Management, Problem Solving, Team Collaboration',
        tooltip: 'Communication, leadership, and other interpersonal skills'
      }
    ]
  }
];

export const GuidedResumeBuilder: React.FC<GuidedResumeBuilderProps> = ({
  onComplete,
  initialData = {}
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [showHelp, setShowHelp] = useState(true);

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const isStepValid = () => {
    return step.fields
      .filter(field => field.required)
      .every(field => formData[field.name]?.trim());
  };

  const handleNext = () => {
    if (isStepValid() && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === steps.length - 1) {
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Progress Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Resume Builder</h2>
          <Badge variant="secondary">
            Step {currentStep + 1} of {steps.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
        
        {/* Step Indicators */}
        <div className="flex justify-between">
          {steps.map((s, idx) => (
            <div key={s.id} className="flex flex-col items-center gap-2">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2
                ${idx < currentStep ? 'bg-primary border-primary text-primary-foreground' : 
                  idx === currentStep ? 'border-primary text-primary' : 
                  'border-muted text-muted-foreground'}
              `}>
                {idx < currentStep ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
              </div>
              <span className="text-xs text-center hidden md:block">{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{step.title}</CardTitle>
              <CardDescription>{step.description}</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHelp(!showHelp)}
            >
              <HelpCircle className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Help Section */}
          {showHelp && (
            <Card className="bg-accent/50 border-accent">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{step.helpText}</p>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      {step.examples.map((example, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {step.fields.map(field => (
              <div key={field.name} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{field.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                {field.type === 'textarea' ? (
                  <Textarea
                    id={field.name}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    rows={6}
                    className="resize-none"
                  />
                ) : (
                  <Input
                    id={field.name}
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}
          </div>

          {/* AI Enhancement Button (for Summary and Experience steps) */}
          {(currentStep === 1 || currentStep === 2) && (
            <Button variant="outline" className="w-full gap-2">
              <Sparkles className="w-4 h-4" />
              Enhance with AI
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!isStepValid()}
          className="gap-2"
        >
          {currentStep === steps.length - 1 ? (
            <>
              Complete Resume
              <CheckCircle className="w-4 h-4" />
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
