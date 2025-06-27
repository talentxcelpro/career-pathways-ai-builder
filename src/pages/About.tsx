
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Target, 
  FileText, 
  Brain, 
  GraduationCap, 
  Network, 
  Briefcase,
  Eye 
} from 'lucide-react';

const About = () => {
  const offerings = [
    {
      title: "Smart Resume Builder & Cover Letters",
      icon: FileText,
      description: "AI-powered tools to create professional resumes and tailored cover letters"
    },
    {
      title: "AI Career Mapping & Job Matching",
      icon: Brain,
      description: "Intelligent career path planning and personalized job recommendations"
    },
    {
      title: "Learning Hub with Certifications",
      icon: GraduationCap,
      description: "Comprehensive courses and industry-recognized certifications"
    },
    {
      title: "Professional Networking & Messaging",
      icon: Network,
      description: "Connect with professionals and build meaningful relationships"
    },
    {
      title: "Employer & Freelancer Marketplace",
      icon: Briefcase,
      description: "Access to job opportunities and freelance projects"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Empowering Talent. Elevating Careers.
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto"></div>
        </div>

        {/* Who We Are */}
        <section className="mb-16">
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <Users className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Who We Are</h2>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                TalentXcel is an all-in-one AI-powered platform built to transform the way professionals connect, learn, and grow. From job discovery and resume building to networking, mentorship, and career planning — we're here for your entire journey.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Our Mission */}
        <section className="mb-16">
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <Target className="h-8 w-8 text-purple-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                To create a future-ready ecosystem that accelerates personal and professional growth for millions by blending intelligent tools, community, and opportunity.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* What We Offer */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What We Offer</h2>
            <p className="text-lg text-gray-600">Comprehensive tools and services for your career success</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {offerings.map((offering, index) => (
              <Card key={index} className="bg-white/60 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                      <offering.icon className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{offering.title}</h3>
                  <p className="text-gray-600">{offering.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Our Vision */}
        <section>
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 shadow-xl">
            <CardContent className="p-8 text-center text-white">
              <div className="flex justify-center mb-6">
                <Eye className="h-12 w-12" />
              </div>
              <h2 className="text-3xl font-bold mb-6">Our Vision</h2>
              <p className="text-xl leading-relaxed">
                To become the world's most intelligent, trusted, and lovable career platform.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default About;
