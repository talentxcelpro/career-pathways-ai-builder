import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Briefcase, MapPin, Target } from 'lucide-react';

export const JobCategoriesSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Explore Jobs by Category
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover roles across across industries, tailored to pur expoe.
          </p>
        </div>

        {/* Job Category Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Role-facticsed Careers */}
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
            <div className="mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Role-facticsed Careers
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Discover roles across industries, tailored to pur expertise.
              </p>
            </div>
          </div>

          {/* Find Jobs Near You */}
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
            <div className="mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Find Jobs Near You
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Browse job-istings by location, from rilw -
              </p>
            </div>
          </div>

          {/* Skill-Facused Opportunities */}
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
            <div className="mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Skill-Facused Opportunities
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Explore openings aligned to your skillset.
              </p>
            </div>
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button 
            variant="outline" 
            size="lg"
            className="bg-white border-blue-200 text-blue-600 hover:bg-blue-50 rounded-full px-8 py-4 text-lg font-semibold group"
          >
            View all
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};