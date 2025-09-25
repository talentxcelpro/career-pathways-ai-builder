import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Building2, GraduationCap, Globe } from 'lucide-react';
import individualImage from '@/assets/individual-learning.jpg';
import businessImage from '@/assets/business-training.jpg';
import universityImage from '@/assets/university-learning.jpg';
import governmentImage from '@/assets/government-training.jpg';

export const AudienceTargetSection: React.FC = () => {
  const audiences = [
    {
      title: 'For Individuals',
      subtitle: 'Personal skill development',
      description: 'Transform your career with personalized learning paths, industry-relevant skills, and expert-led courses designed for individual growth.',
      image: individualImage,
      link: '/learning/individuals',
      icon: Users,
      gradient: 'from-blue-500 to-purple-600',
      stats: '50K+ learners'
    },
    {
      title: 'For Businesses',
      subtitle: 'Corporate training programs',
      description: 'Upskill your workforce with scalable enterprise solutions, custom learning paths, and comprehensive analytics for business growth.',
      image: businessImage,
      link: '/learning/businesses',
      icon: Building2,
      gradient: 'from-green-500 to-blue-600',
      stats: '500+ companies'
    },
    {
      title: 'For Universities',
      subtitle: 'Academic partnerships',
      description: 'Enhance your curriculum with industry-relevant content, accredited programs, and collaborative learning experiences.',
      image: universityImage,
      link: '/learning/universities',
      icon: GraduationCap,
      gradient: 'from-purple-500 to-pink-600',
      stats: '100+ universities'
    },
    {
      title: 'For Governments',
      subtitle: 'Public sector training',
      description: 'Develop public sector capabilities with secure, compliant training solutions designed for government workforce development.',
      image: governmentImage,
      link: '/learning/governments',
      icon: Globe,
      gradient: 'from-orange-500 to-red-600',
      stats: '25+ countries'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Learning Solutions for Everyone
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Discover tailored learning experiences designed for individuals, businesses, universities, and governments worldwide.
          </p>
        </div>

        {/* Audience Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {audiences.map((audience, index) => {
            const Icon = audience.icon;
            return (
              <div
                key={audience.title}
                className="group relative bg-white/80 backdrop-blur-apple rounded-2xl overflow-hidden shadow-card hover:shadow-glow transition-all duration-500 transform hover:scale-[1.02] border border-white/50"
              >
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={audience.image}
                    alt={audience.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  
                  {/* Icon Badge */}
                  <div className={`absolute top-4 left-4 w-12 h-12 bg-gradient-to-r ${audience.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  
                  {/* Stats Badge */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <span className="text-xs font-semibold text-foreground">{audience.stats}</span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {audience.title}
                    </h3>
                    <p className="text-sm font-medium text-primary">
                      {audience.subtitle}
                    </p>
                  </div>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    {audience.description}
                  </p>
                  
                  <Link to={audience.link}>
                    <Button 
                      className="w-full bg-gradient-to-r from-primary to-ai-violet-medium hover:from-primary/90 hover:to-ai-violet-medium/90 text-white font-semibold shadow-lg hover:shadow-glow transition-all duration-300 group-hover:scale-105"
                    >
                      Learn More
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>

                {/* Hover Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${audience.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none rounded-2xl`} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};