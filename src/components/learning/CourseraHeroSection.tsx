import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, Star, Users, BookOpen, Award } from 'lucide-react';

export const CourseraHeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Content */}
          <div className="text-white space-y-8">
            {/* TalentXcel Plus Badge */}
            <div className="inline-flex items-center space-x-2">
              <Badge className="bg-blue-500 text-white hover:bg-blue-400 px-4 py-1 text-sm font-medium">
                TALENTXCEL PLUS
              </Badge>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Achieve your career goals with
              <br />
              <span className="text-blue-200">TalentXcel Plus</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl lg:text-2xl text-blue-100 leading-relaxed max-w-xl">
              Subscribe to build job-ready skills from world-class institutions.
            </p>

            {/* Pricing */}
            <div className="space-y-4">
              <div className="text-white">
                <span className="text-2xl font-bold">₹2,099/month, cancel anytime</span>
              </div>
              <div className="flex items-center space-x-1 text-blue-200">
                <span>or</span>
                <Link to="/pricing" className="text-blue-200 hover:text-white underline font-medium">
                  ₹13,999/year with 14-day money-back guarantee
                </Link>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                className="bg-blue-500 hover:bg-blue-400 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Play className="mr-2 h-5 w-5" />
                Start 7-day Free Trial
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-blue-300 text-white hover:bg-blue-300/10 px-8 py-4 text-lg font-semibold rounded-lg backdrop-blur-sm"
              >
                Explore Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Right Content - Hero Image/Illustration */}
          <div className="relative">
            <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              {/* Mock interface or illustration would go here */}
              <div className="aspect-square bg-gradient-to-br from-white/20 to-transparent rounded-2xl flex items-center justify-center">
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 bg-blue-400/30 rounded-full flex items-center justify-center mx-auto">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">Learn with confidence</h3>
                    <p className="text-blue-100">Interactive courses from top universities</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-white rounded-xl p-4 shadow-lg">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <span className="text-sm font-semibold text-gray-900">4.8 rating</span>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-4 shadow-lg">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-semibold text-gray-900">100M+ learners</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="pt-16 border-t border-blue-400/30 mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Learn from 350+ top universities and companies
            </h2>
          </div>
          
          {/* Partner Logos Grid */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center justify-items-center opacity-80">
            {/* Mock partner logos */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white/20 backdrop-blur-sm rounded-lg p-4 w-full h-16 flex items-center justify-center">
                <div className="text-white font-bold text-lg">PARTNER</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};