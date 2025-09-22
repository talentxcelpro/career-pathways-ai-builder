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
  const [activeAudience, setActiveAudience] = useState<string | null>(null);

  return (
    <header className="bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/learning" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-primary">TalentXcel</div>
          </Link>

          {/* Audience Navigation */}
          <div className="hidden lg:flex space-x-8">
            {audienceOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <DropdownMenu key={option.id}>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost"
                      className="flex items-center space-x-2 text-foreground hover:text-primary font-medium"
                    >
                      <IconComponent className={cn("h-4 w-4", option.color)} />
                      <span>{option.title}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80 p-6">
                    <div className="flex items-start space-x-4">
                      <div className={cn("p-3 rounded-lg bg-gray-50")}>
                        <IconComponent className={cn("h-6 w-6", option.color)} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-2">{option.title}</h3>
                        <p className="text-muted-foreground text-sm mb-4">{option.description}</p>
                        <Button asChild size="sm">
                          <Link to={option.href}>Learn More</Link>
                        </Button>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <Link to="/learning/degrees" className="hidden md:block text-foreground hover:text-primary font-medium">
              Online Degrees
            </Link>
            <Link to="/learning/certificates" className="hidden md:block text-foreground hover:text-primary font-medium">
              Certificates
            </Link>
            <Link to="/auth" className="text-primary hover:text-primary/80 font-medium">
              Log In
            </Link>
            <Button asChild size="sm">
              <Link to="/auth">Join for Free</Link>
            </Button>
          </div>
        </div>

        {/* Search Bar Section */}
        <div className="pb-4">
          <div className="flex items-center justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-blue-600 text-white hover:bg-blue-700 font-medium">
                  <div className="flex items-center space-x-2">
                    <span>Explore</span>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-96 p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-3">Popular Skills</h4>
                    <div className="space-y-2 text-sm">
                      <Link to="/learning/courses?category=data-science" className="block text-muted-foreground hover:text-primary">Data Science</Link>
                      <Link to="/learning/courses?category=machine-learning" className="block text-muted-foreground hover:text-primary">Machine Learning</Link>
                      <Link to="/learning/courses?category=web-development" className="block text-muted-foreground hover:text-primary">Web Development</Link>
                      <Link to="/learning/courses?category=cloud-computing" className="block text-muted-foreground hover:text-primary">Cloud Computing</Link>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Career Paths</h4>
                    <div className="space-y-2 text-sm">
                      <Link to="/learning/paths?role=data-scientist" className="block text-muted-foreground hover:text-primary">Data Scientist</Link>
                      <Link to="/learning/paths?role=software-engineer" className="block text-muted-foreground hover:text-primary">Software Engineer</Link>
                      <Link to="/learning/paths?role=product-manager" className="block text-muted-foreground hover:text-primary">Product Manager</Link>
                      <Link to="/learning/paths?role=digital-marketer" className="block text-muted-foreground hover:text-primary">Digital Marketer</Link>
                    </div>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Search Input */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="What do you want to learn?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-3 text-base bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
                />
                <Button 
                  size="sm" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Promotional Banner */}
      <div className="bg-blue-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-blue-900">Ends tomorrow: Discover new skills with courses from industry experts—</span>
              <Link to="/learning/courses" className="text-blue-600 hover:text-blue-800 font-medium underline">
                now ₹7,999/year
              </Link>
            </div>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
              ✕
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};