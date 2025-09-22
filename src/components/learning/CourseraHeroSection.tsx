import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, Star, Users, BookOpen, Award, TrendingUp, Clock, CheckCircle } from 'lucide-react';

export const CourseraHeroSection: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  
  const features = [
    {
      icon: BookOpen,
      title: 'Expert-Led Courses',
      description: 'Learn from top instructors at leading universities'
    },
    {
      icon: Award,
      title: 'Career Certificates',
      description: 'Earn industry-recognized credentials'
    },
    {
      icon: TrendingUp,
      title: 'Skill Assessment',
      description: 'Track your progress with detailed analytics'
    }
  ];

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
              Learn without limits
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-700 leading-relaxed max-w-xl">
              Start, switch, or advance your career with thousands of courses from world-class universities and companies.
            </p>

            {/* CTA Buttons - Coursera Style */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-sm shadow-lg hover:shadow-xl transition-all duration-300 hover-scale"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Learning
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-sm"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Browse Courses
              </Button>
            </div>
          </div>

          {/* Right Content - Interactive Learning Dashboard */}
          <div className="relative">
            <div className="relative bg-white rounded-2xl p-8 shadow-2xl border animate-fade-in">
              {/* Interactive Learning Interface */}
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Your Learning Journey</h3>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-gray-600">4.8</span>
                  </div>
                </div>

                {/* Interactive Feature Cards */}
                <div className="space-y-3">
                  {features.map((feature, index) => {
                    const IconComponent = feature.icon;
                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                          activeFeature === index
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setActiveFeature(index)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            activeFeature === index ? 'bg-blue-500' : 'bg-gray-100'
                          }`}>
                            <IconComponent className={`h-5 w-5 ${
                              activeFeature === index ? 'text-white' : 'text-gray-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                            <p className="text-sm text-gray-600">{feature.description}</p>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${
                            activeFeature === index ? 'bg-blue-500' : 'bg-gray-300'
                          }`}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Progress indicators */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Flexible schedule</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">Verified certificate</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating stats - Clean design with animation */}
            <div className="absolute -top-4 -right-4 bg-white rounded-lg p-4 shadow-lg border animate-scale-in">
              <div className="flex items-center space-x-2">
                <div className="flex text-yellow-500">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-900">4.8/5</span>
              </div>
            </div>


            <div className="absolute top-1/2 -left-6 bg-green-50 border border-green-200 rounded-lg p-3 shadow-lg animate-fade-in" style={{animationDelay: '0.4s'}}>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium text-green-800">Certificate Ready</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};