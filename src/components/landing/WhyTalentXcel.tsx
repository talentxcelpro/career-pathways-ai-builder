import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Target, BookOpen, Briefcase, TrendingUp, Shield } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Professional Network',
    description: 'Connect with industry leaders, mentors, and peers worldwide',
    color: 'from-blue-500 to-cyan-500',
    link: '/network'
  },
  {
    icon: Target,
    title: 'Personalized Career Paths',
    description: 'AI-driven recommendations tailored to your goals and skills',
    color: 'from-purple-500 to-pink-500',
    link: '/tools/career-pathfinder'
  },
  {
    icon: BookOpen,
    title: 'AI-Powered Learning Hub',
    description: 'Upskill with courses designed for your career trajectory',
    color: 'from-green-500 to-emerald-500',
    link: '/learning'
  },
  {
    icon: Briefcase,
    title: 'Verified Job & Internship Listings',
    description: 'Access exclusive opportunities from top companies',
    color: 'from-orange-500 to-red-500',
    link: '/jobs'
  },
  {
    icon: TrendingUp,
    title: 'Career Analytics',
    description: 'Track your progress with detailed insights and metrics',
    color: 'from-indigo-500 to-purple-500',
    link: '/tools'
  },
  {
    icon: Shield,
    title: 'Trusted Platform',
    description: 'Secure, professional environment with verified profiles',
    color: 'from-teal-500 to-cyan-500',
    link: '/about'
  }
];

export const WhyTalentXcel = () => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full blur-3xl"></div>
      
      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-6xl font-light text-slate-900 mb-6">
            Why <span className="font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">TalentXcel?</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light">
            Everything you need to accelerate your career journey, all in one beautifully designed platform
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link 
                to={feature.link}
                key={feature.title}
                className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 hover:border-slate-200 animate-fade-in block"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`}></div>
                
                <div className="relative">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} p-4 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-full h-full text-white" strokeWidth={1.5} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-slate-800 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 font-light leading-relaxed group-hover:text-slate-700 transition-colors">
                    {feature.description}
                  </p>

                  {/* Hover arrow */}
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-slate-500 font-light">
            Ready to transform your career? 
            <span className="text-blue-600 font-medium cursor-pointer hover:text-blue-700 transition-colors ml-1">
              Get started today →
            </span>
          </p>
        </div>
      </div>
    </section>
  );
};