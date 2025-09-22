import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, Star, Users, BookOpen, Award } from 'lucide-react';

export const CourseraHeroSection: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
      {/* Clean geometric background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content - Clean and Professional */}
          <div className="space-y-8">
            {/* TalentXcel Plus Badge */}
            <div className="inline-flex items-center space-x-2">
              <Badge className="bg-blue-600 text-white hover:bg-blue-500 px-4 py-2 text-sm font-semibold rounded-sm">
                TALENTXCEL PLUS
              </Badge>
            </div>

            {/* Main Headline - Coursera Style */}
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-gray-900">
              Achieve your career goals with
              <br />
              <span className="text-gray-900">TalentXcel Plus</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-700 leading-relaxed max-w-xl">
              Subscribe to build job-ready skills from world-class institutions.
            </p>

            {/* Pricing */}
            <div className="space-y-3">
              <div className="text-gray-900">
                <span className="text-2xl font-bold">₹2,099/month, cancel anytime</span>
              </div>
              <div className="flex items-center space-x-1 text-blue-600">
                <span className="text-gray-700">or</span>
                <Link to="/pricing" className="text-blue-600 hover:text-blue-700 underline font-medium ml-2">
                  ₹13,999/year with 14-day money-back guarantee
                </Link>
              </div>
            </div>

            {/* CTA Buttons - Coursera Style */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-sm shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start 7-day Free Trial
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-sm"
              >
                or ₹13,999/year with 14-day money-back guarantee
              </Button>
            </div>
          </div>

          {/* Right Content - Clean Visual */}
          <div className="relative">
            <div className="relative bg-white rounded-2xl p-8 shadow-2xl border">
              {/* Clean hero visual */}
              <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center">
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Play className="h-12 w-12 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-gray-900">Learn with confidence</h3>
                    <p className="text-gray-600">Interactive courses from top universities</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating stats - Clean design */}
            <div className="absolute -top-4 -right-4 bg-white rounded-lg p-4 shadow-lg border">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <span className="text-sm font-semibold text-gray-900">4.8 rating</span>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-white rounded-lg p-4 shadow-lg border">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-semibold text-gray-900">100M+ learners</span>
              </div>
            </div>
          </div>
        </div>

        {/* Partner Section - Clean and Minimal */}
        <div className="pt-20 border-t border-gray-200 mt-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Learn from 350+ top universities and companies
            </h2>
          </div>
          
          {/* Partner Logos Grid - Coursera Style */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center justify-items-center">
            {/* Clean partner logo placeholders */}
            {[
              'ILLINOIS', 'DUKE', 'GOOGLE', 'MICHIGAN', 'IBM', 'VANDERBILT'
            ].map((partner, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 w-full h-12 flex items-center justify-center border border-gray-200">
                <div className="text-gray-600 font-semibold text-sm">{partner}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};