import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Helmet } from 'react-helmet-async';
import { Target, Upload, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ATSChecker = () => {
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState('');

  return (
    <>
      <Helmet>
        <title>ATS Checker | TalentXcel Resume Builder</title>
        <meta name="description" content="Check your resume's ATS compatibility" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Target className="h-4 w-4" />
              ATS Compatibility Checker
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Optimize for ATS Systems
            </h1>
            <p className="text-xl text-muted-foreground">
              Get your resume past Applicant Tracking Systems and into the hands of recruiters
            </p>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Resume for ATS Analysis</CardTitle>
                <CardDescription>
                  We'll analyze your resume and provide detailed feedback on ATS compatibility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => navigate('/resume/upload')} 
                  className="w-full"
                  size="lg"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Resume for Analysis
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Target Specific Job (Optional)</CardTitle>
                <CardDescription>
                  Paste a job description to get tailored recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[200px]"
                />
                <Button 
                  onClick={() => navigate('/resume/build')}
                  className="w-full"
                  disabled={!jobDescription}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze & Optimize
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle>What We Check</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Keyword Optimization</p>
                    <p className="text-sm text-muted-foreground">
                      Match important keywords from job descriptions
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Format Compatibility</p>
                    <p className="text-sm text-muted-foreground">
                      Ensure ATS systems can parse your resume correctly
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Content Quality</p>
                    <p className="text-sm text-muted-foreground">
                      Analyze achievements, skills, and experience descriptions
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Common Issues Detection</p>
                    <p className="text-sm text-muted-foreground">
                      Identify formatting problems, missing sections, and errors
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default ATSChecker;