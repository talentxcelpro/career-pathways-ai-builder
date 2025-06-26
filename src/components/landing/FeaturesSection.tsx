
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, GraduationCap, FileText } from "lucide-react";

export const FeaturesSection = () => {
  const features = [
    {
      icon: Users,
      title: "Professional Profile",
      description: "Create a compelling professional presence that stands out to employers and connections.",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: Briefcase,
      title: "Smart Job Search",
      description: "Discover opportunities that match your skills and career goals with AI-powered recommendations.",
      gradient: "from-green-500 to-green-600"
    },
    {
      icon: GraduationCap,
      title: "Skill Development",
      description: "Access courses and learning paths tailored to your career aspirations and industry trends.",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: FileText,
      title: "AI Career Tools",
      description: "Generate professional resumes, cover letters, and get personalized career guidance.",
      gradient: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <section className="py-24 bg-white/70 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Everything You Need to Excel</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Comprehensive tools powered by AI to transform your career journey</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-white/90 backdrop-blur-sm group">
              <CardHeader className="text-center pb-4">
                <div className={`w-20 h-20 bg-gradient-to-r ${feature.gradient} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
