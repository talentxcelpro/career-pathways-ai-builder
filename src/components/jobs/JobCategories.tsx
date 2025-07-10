import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Palette, Code, TrendingUp, DollarSign, Users, Building, ChevronRight } from "lucide-react";

interface JobCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  jobCount: number;
  averageSalary: string;
  gradient: string;
  trending?: boolean;
}

const jobCategories: JobCategory[] = [
  {
    id: '1',
    name: 'Design',
    icon: <Palette className="h-5 w-5" />,
    jobCount: 245,
    averageSalary: '₹8-15 LPA',
    gradient: 'from-pink-500 to-rose-500',
    trending: true
  },
  {
    id: '2',
    name: 'Tech',
    icon: <Code className="h-5 w-5" />,
    jobCount: 1250,
    averageSalary: '₹12-25 LPA',
    gradient: 'from-blue-500 to-cyan-500',
    trending: true
  },
  {
    id: '3',
    name: 'Marketing',
    icon: <TrendingUp className="h-5 w-5" />,
    jobCount: 420,
    averageSalary: '₹6-12 LPA',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    id: '4',
    name: 'Finance',
    icon: <DollarSign className="h-5 w-5" />,
    jobCount: 380,
    averageSalary: '₹10-20 LPA',
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    id: '5',
    name: 'HR',
    icon: <Users className="h-5 w-5" />,
    jobCount: 180,
    averageSalary: '₹5-10 LPA',
    gradient: 'from-purple-500 to-violet-500'
  },
  {
    id: '6',
    name: 'Govt/Public Sector',
    icon: <Building className="h-5 w-5" />,
    jobCount: 95,
    averageSalary: '₹4-8 LPA',
    gradient: 'from-indigo-500 to-blue-600'
  }
];

interface JobCategoriesProps {
  onCategoryClick?: (categoryName: string) => void;
}

export const JobCategories: React.FC<JobCategoriesProps> = ({ onCategoryClick }) => {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            💼 Browse by Categories
          </h2>
          <p className="text-gray-600">Explore opportunities across different industries</p>
        </div>

        {/* Horizontal Scrollable Categories */}
        <div className="flex gap-4 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          {jobCategories.map((category) => (
            <Card 
              key={category.id}
              className="min-w-[280px] cursor-pointer hover:shadow-lg transition-all duration-200 group"
              onClick={() => onCategoryClick?.(category.name)}
            >
              <div className={`bg-gradient-to-r ${category.gradient} text-white p-1 rounded-t-lg`}>
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-lg">
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{category.name}</h3>
                        <p className="text-white/80 text-sm">{category.jobCount} jobs available</p>
                      </div>
                    </div>
                    {category.trending && (
                      <Badge className="bg-white/20 text-white border-white/30">
                        🔥 Trending
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Average Salary</p>
                    <p className="font-semibold text-gray-900">{category.averageSalary}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {jobCategories.map((category) => (
            <button
              key={`chip-${category.id}`}
              onClick={() => onCategoryClick?.(category.name)}
              className={`p-3 rounded-xl bg-gradient-to-r ${category.gradient} text-white hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
            >
              <div className="flex flex-col items-center gap-2">
                {category.icon}
                <span className="font-medium text-sm">{category.name}</span>
                <span className="text-xs text-white/80">{category.jobCount}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};