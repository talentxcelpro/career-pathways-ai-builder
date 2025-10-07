import React from 'react';
import { FileText, Users, Target, GraduationCap, Briefcase, BarChart3, Shield, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FeaturesSection = () => {
  const navigate = useNavigate();
  const features = [
    {
      icon: FileText,
      title: "Resume Builder",
      description: "Create professional resumes with AI-powered suggestions and templates",
      link: "/resume"
    },
    {
      icon: CreditCard,
      title: "Career Passport",
      description: "Your digital professional identity showcasing skills, achievements, and career journey",
      link: "/passport"
    },
    {
      icon: Users,
      title: "Professional Network",
      description: "Connect with industry leaders, mentors, and peers worldwide",
      link: "/network"
    },
    {
      icon: Target,
      title: "Personalized Career Paths",
      description: "AI-driven recommendations tailored to your goals and skills",
      link: "/career-map"
    },
    {
      icon: GraduationCap,
      title: "AI-Powered Learning Hub",
      description: "Upskill with courses designed for your career trajectory",
      link: "/learning"
    },
    {
      icon: Briefcase,
      title: "Verified Job & Internship Listings",
      description: "Access exclusive opportunities from top companies",
      link: "/jobs"
    },
    {
      icon: BarChart3,
      title: "Career Analytics",
      description: "Track your progress with detailed insights and metrics",
      link: "/tools"
    },
    {
      icon: Shield,
      title: "Trusted Platform",
      description: "Secure, professional environment with verified profiles",
      link: "/about"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-light text-slate-900 mb-4">
            Everything You Need to
            <span className="block font-medium bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Accelerate Your Career
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            From networking to skill-building, discover all the tools and opportunities to reach your professional goals
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                onClick={() => feature.link.startsWith('http') ? window.open(feature.link, '_blank') : navigate(feature.link)}
                className="group p-8 bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};