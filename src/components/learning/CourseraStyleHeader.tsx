import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, ChevronDown, User, Building, GraduationCap, Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudienceOption {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
  href: string;
}

const audienceOptions: AudienceOption[] = [
  {
    id: 'individuals',
    title: 'For Individuals',
    icon: User,
    description: 'Build job-relevant skills with courses, certificates, and hands-on projects',
    color: 'text-blue-600',
    href: '/learning/individuals'
  },
  {
    id: 'businesses',
    title: 'For Businesses',
    icon: Building,
    description: 'Upskill teams with enterprise-ready content and analytics',
    color: 'text-green-600',
    href: '/learning/businesses'
  },
  {
    id: 'universities',
    title: 'For Universities',
    icon: GraduationCap,
    description: 'Partner with leading universities and enhance academic programs',
    color: 'text-purple-600',
    href: '/learning/universities'
  },
  {
    id: 'governments',
    title: 'For Governments',
    icon: Landmark,
    description: 'Transform public workforce with digital skills training',
    color: 'text-orange-600',
    href: '/learning/governments'
  }
];

export const CourseraStyleHeader: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      {/* Black Audience Navigation Bar - Exact Coursera Style */}
      <div className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-12 space-x-0">
            {audienceOptions.map((option, index) => (
              <Link
                key={option.id}
                to={option.href}
                className={`px-6 py-3 text-white/90 hover:text-white hover:bg-white/10 text-sm font-medium transition-all border-b-2 border-transparent hover:border-white/30 ${
                  index === 0 ? 'border-b-2 border-white text-white' : ''
                }`}
              >
                {option.title}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Header - Clean White Background */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/learning" className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">TalentXcel</div>
            </Link>

            {/* Center - Explore + Search */}
            <div className="flex items-center space-x-6 flex-1 max-w-2xl mx-8">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-blue-600 text-white hover:bg-blue-700 font-medium px-6 h-11 rounded-md">
                    <div className="flex items-center space-x-2">
                      <span>Explore</span>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-96 p-6" align="start">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-gray-900">Popular Skills</h4>
                      <div className="space-y-2 text-sm">
                        <Link to="/learning/courses?category=data-science" className="block text-gray-600 hover:text-blue-600 py-1">Data Science</Link>
                        <Link to="/learning/courses?category=machine-learning" className="block text-gray-600 hover:text-blue-600 py-1">Machine Learning</Link>
                        <Link to="/learning/courses?category=web-development" className="block text-gray-600 hover:text-blue-600 py-1">Web Development</Link>
                        <Link to="/learning/courses?category=cloud-computing" className="block text-gray-600 hover:text-blue-600 py-1">Cloud Computing</Link>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-gray-900">Career Paths</h4>
                      <div className="space-y-2 text-sm">
                        <Link to="/learning/paths?role=data-scientist" className="block text-gray-600 hover:text-blue-600 py-1">Data Scientist</Link>
                        <Link to="/learning/paths?role=software-engineer" className="block text-gray-600 hover:text-blue-600 py-1">Software Engineer</Link>
                        <Link to="/learning/paths?role=product-manager" className="block text-gray-600 hover:text-blue-600 py-1">Product Manager</Link>
                        <Link to="/learning/paths?role=digital-marketer" className="block text-gray-600 hover:text-blue-600 py-1">Digital Marketer</Link>
                      </div>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Search Input - Coursera Style */}
              <div className="relative flex-1">
                <Input
                  placeholder="What do you want to learn?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-4 pr-12 h-11 text-base bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-full"
                />
                <Button 
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 h-9 w-9 p-0 rounded-full"
                >
                  <Search className="h-4 w-4 text-white" />
                </Button>
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-6">
              <Link to="/learning/degrees" className="hidden md:block text-gray-700 hover:text-blue-600 font-medium text-sm">
                Online Degrees
              </Link>
              <Link to="/learning/careers" className="hidden md:block text-gray-700 hover:text-blue-600 font-medium text-sm">
                Careers
              </Link>
              <Link to="/auth" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                Log In
              </Link>
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-9 rounded-md font-medium">
                <Link to="/auth">Join for Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Promotional Banner - Coursera Style */}
      <div className="bg-blue-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-blue-900">Ends tomorrow: Discover new skills with courses from industry experts—</span>
              <Link to="/learning/courses" className="text-blue-600 hover:text-blue-800 font-semibold underline">
                now ₹7,999/year
              </Link>
            </div>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 h-8 w-8 p-0">
              ✕
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};