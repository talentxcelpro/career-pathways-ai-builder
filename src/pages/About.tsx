
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Eye, Sparkles } from "lucide-react";

const About = () => {
  const features = [
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Smart Resume Builder & Cover Letters",
      description: "AI-powered tools to create compelling resumes and cover letters"
    },
    {
      icon: <Target className="h-8 w-8 text-purple-600" />,
      title: "AI Career Mapping & Job Matching",
      description: "Intelligent career planning and personalized job recommendations"
    },
    {
      icon: <Sparkles className="h-8 w-8 text-green-600" />,
      title: "Learning Hub with Certifications",
      description: "Comprehensive courses and industry-recognized certifications"
    },
    {
      icon: <Users className="h-8 w-8 text-orange-600" />,
      title: "Professional Networking & Messaging",
      description: "Connect with professionals and build meaningful relationships"
    },
    {
      icon: <Eye className="h-8 w-8 text-red-600" />,
      title: "Employer & Freelancer Marketplace",
      description: "Opportunities for both full-time roles and freelance projects"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-6">Empowering Talent. Elevating Careers.</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Transforming the way professionals connect, learn, and grow with AI-powered career solutions.
          </p>
          <p className="text-sm text-blue-200 mt-4">
            <strong>Effective:</strong> July 01, 2025
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Who We Are */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Who We Are</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              TalentXcel is an all-in-one AI-powered platform built to transform the way professionals connect, learn, and grow. 
              From job discovery and resume building to networking, mentorship, and career planning — we're here for your entire journey.
            </p>
          </CardContent>
        </Card>

        {/* Our Mission */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              To create a future-ready ecosystem that accelerates personal and professional growth for millions by blending 
              intelligent tools, community, and opportunity.
            </p>
          </CardContent>
        </Card>

        {/* What We Offer */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Our Vision */}
        <Card>
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Vision</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              To become the world's most intelligent, trusted, and lovable career platform.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
