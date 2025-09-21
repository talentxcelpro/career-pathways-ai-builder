import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Upload } from 'lucide-react';
import resumePreview from '@/assets/resume-preview-ai.png';

const ResumeNew: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5">
      <Helmet>
        <title>Resume Builder - Complete TalentXcel Career Toolkit | AI-Powered Resume Creation</title>
        <meta name="description" content="Everything you need to build, optimize, and land your next role with AI. Create professional resumes with our intelligent resume builder." />
        <meta name="keywords" content="resume builder, AI resume, career toolkit, job application, professional resume, ATS optimized" />
        <link rel="canonical" href="https://talentxcel.in/resume/new" />
      </Helmet>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Main Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Complete TalentXcel
            <br />
            Career Toolkit
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Everything you need to build, optimize, and land your next role with AI
          </p>

          {/* Primary Action Buttons */}
          <div className="space-y-4 mb-16">
            <Link to="/resume/builder" className="block">
              <Button 
                size="lg" 
                className="w-full max-w-md h-14 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                Start Building Resume
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Link to="/resume/upload" className="block">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full max-w-md h-14 text-lg font-semibold border-2 border-border hover:bg-muted/50 rounded-xl transition-all duration-300 hover:shadow-lg"
              >
                <Upload className="mr-2 h-5 w-5" />
                Upload Existing Resume
              </Button>
            </Link>
          </div>
        </div>

        {/* Resume Preview Section */}
        <div className="relative">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-0 shadow-xl rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <div className="relative max-w-md mx-auto">
                {/* Resume Preview Image */}
                <div className="bg-white rounded-xl shadow-lg p-6 relative">
                  <img 
                    src={resumePreview} 
                    alt="Professional Resume Preview - Alex Johnson" 
                    className="w-full h-auto rounded-lg"
                    loading="eager"
                  />
                  
                  {/* Floating Badges */}
                  <div className="absolute -top-2 -left-2">
                    <Badge className="bg-green-500 text-white font-semibold px-3 py-1 rounded-full shadow-lg">
                      ATS Optimized
                    </Badge>
                  </div>
                  
                  <div className="absolute -bottom-2 -right-2">
                    <Badge className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                      <span className="text-lg">⚡</span>
                      AI-Power
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="text-center mt-16">
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>95% ATS Pass Rate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>50+ Templates</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Used by 100k+ Professionals</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeNew;