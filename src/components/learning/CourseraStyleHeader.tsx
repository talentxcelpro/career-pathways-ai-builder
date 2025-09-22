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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/learning/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      {/* Black Audience Navigation Bar - Coursera Style with White Text */}
      <div className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-12 space-x-0">
            {audienceOptions.map((option, index) => (
              <Link
                key={option.id}
                to={option.href}
                className="px-6 py-3 text-white hover:text-white hover:bg-white/10 text-sm font-medium transition-all border-b-2 border-transparent hover:border-white/30"
              >
                {option.title}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Header - Clean White Background */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
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
                        <Link to="/learning/courses?category=cybersecurity" className="block text-gray-600 hover:text-blue-600 py-1">Cybersecurity</Link>
                        <Link to="/learning/courses?category=ai" className="block text-gray-600 hover:text-blue-600 py-1">Artificial Intelligence</Link>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-gray-900">Popular Programs</h4>
                      <div className="space-y-2 text-sm">
                        <Link to="/learning/paths" className="block text-gray-600 hover:text-blue-600 py-1">Professional Certificates</Link>
                        <Link to="/learning/paths?type=specialization" className="block text-gray-600 hover:text-blue-600 py-1">Specializations</Link>
                        <Link to="/learning/quick-learn" className="block text-gray-600 hover:text-blue-600 py-1">Guided Projects</Link>
                        <Link to="/learning/employment-bridge" className="block text-gray-600 hover:text-blue-600 py-1">Career Services</Link>
                        <Link to="/learning/skill-assessment" className="block text-gray-600 hover:text-blue-600 py-1">Skill Assessments</Link>
                        <Link to="/learning/community" className="block text-gray-600 hover:text-blue-600 py-1">Learning Community</Link>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                      <Link to="/learning/courses" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Browse All Courses →
                      </Link>
                      <Link to="/learning/analytics" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Learning Analytics →
                      </Link>
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
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-4 pr-12 h-11 text-base bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-full"
                />
                <Button 
                  onClick={handleSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 h-9 w-9 p-0 rounded-full"
                >
                  <Search className="h-4 w-4 text-white" />
                </Button>
              </div>
            </div>

            {/* Right side actions - Only Essential Links */}
            <div className="flex items-center space-x-6">
              <Link to="/learning/my-courses" className="hidden md:block text-gray-700 hover:text-blue-600 font-medium text-sm">
                My Learning
              </Link>
              <Link to="/learning/certificates" className="hidden md:block text-gray-700 hover:text-blue-600 font-medium text-sm">
                Certificates
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-gray-700 hover:text-blue-600 font-medium text-sm">
                    <User className="h-4 w-4 mr-2" />
                    Account
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>
                    <Link to="/learning/my-progress" className="w-full">My Progress</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/learning/my-courses" className="w-full">My Courses</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/learning/certificates" className="w-full">Certificates</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/learning/analytics" className="w-full">Analytics</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/settings" className="w-full">Settings</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};