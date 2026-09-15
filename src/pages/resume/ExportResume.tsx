
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';
import { ExportPanel } from '@/components/resume/export/ExportPanel';

const ExportResume = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock resume data - in real app, fetch from API
  const mockResumeData = {
    personalInfo: {
      fullName: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1 (555) 123-4567',
      location: 'New York, NY',
      summary: 'Experienced software developer with 5+ years of expertise in React, Node.js, and cloud technologies.'
    },
    experience: [
      {
        position: 'Senior Software Engineer',
        company: 'Tech Corp',
        startDate: '2020-01',
        endDate: 'Present',
        description: 'Led development of scalable web applications using React and Node.js'
      }
    ],
    education: [
      {
        degree: 'Bachelor of Computer Science',
        school: 'University of Technology',
        startDate: '2016',
        endDate: '2020'
      }
    ],
    skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Python'],
    projects: [],
    certifications: []
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/resume')}
            className="flex items-center mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Export Resume</h1>
            <p className="text-gray-600">Download your resume in multiple formats</p>
          </div>
        </div>

        <ExportPanel 
          resumeData={mockResumeData} 
          resumeId={id || 'mock-resume-id'} 
        />
      </div>
    </div>
  );
};

export default ExportResume;
