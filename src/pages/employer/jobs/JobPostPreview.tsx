
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Share2, CheckCircle, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from 'react-router-dom';

const JobPostPreview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { aiGenerated, formData } = location.state || {};

  const sampleJobData = {
    title: formData?.jobTitle || "Senior Software Engineer",
    company: "TechCorp Inc.",
    location: formData?.location || "San Francisco, CA",
    employmentType: formData?.employmentType || "full_time",
    experienceLevel: formData?.experienceLevel || "senior",
    description: `We are seeking a talented Senior Software Engineer to join our dynamic engineering team. You will be responsible for designing, developing, and maintaining scalable web applications while collaborating with cross-functional teams to deliver exceptional user experiences.

Key Responsibilities:
• Design and develop robust, scalable software solutions
• Collaborate with product managers and designers to implement new features
• Mentor junior developers and contribute to technical decision-making
• Participate in code reviews and maintain high code quality standards
• Work with modern technologies including React, Node.js, and cloud platforms`,
    requirements: [
      "5+ years of software development experience",
      "Strong proficiency in JavaScript, TypeScript, and React",
      "Experience with Node.js and RESTful APIs",
      "Knowledge of cloud platforms (AWS, Azure, or GCP)",
      "Strong problem-solving and communication skills"
    ],
    benefits: [
      "Competitive salary and equity package",
      "Comprehensive health, dental, and vision insurance",
      "Flexible work arrangements and remote options",
      "Professional development opportunities",
      "401(k) with company matching"
    ],
    salary: "$120,000 - $180,000",
    skills: ["JavaScript", "TypeScript", "React", "Node.js", "AWS", "Git"]
  };

  const handlePublish = () => {
    navigate('/jobs/post/success', { 
      state: { 
        jobData: sampleJobData,
        aiGenerated 
      } 
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Eye className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Preview Job Post</h1>
            <p className="text-gray-600">Review your job posting before publishing</p>
          </div>
        </div>
        {aiGenerated && (
          <Badge className="bg-purple-100 text-purple-800">AI Generated</Badge>
        )}
      </div>

      {/* Job Preview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{sampleJobData.title}</CardTitle>
              <CardDescription className="text-lg">{sampleJobData.company} • {sampleJobData.location}</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-green-600">{sampleJobData.salary}</div>
              <Badge>{sampleJobData.employmentType.replace('_', '-')}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Job Description */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Job Description</h3>
            <div className="text-gray-700 whitespace-pre-line">{sampleJobData.description}</div>
          </div>

          {/* Requirements */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Requirements</h3>
            <ul className="space-y-2">
              {sampleJobData.requirements.map((req, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {sampleJobData.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">{skill}</Badge>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Benefits & Perks</h3>
            <ul className="space-y-2">
              {sampleJobData.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Edit
        </Button>
        
        <div className="flex space-x-3">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Post
          </Button>
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Save as Draft
          </Button>
          <Button onClick={handlePublish} className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="h-4 w-4 mr-2" />
            Publish Job
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobPostPreview;
