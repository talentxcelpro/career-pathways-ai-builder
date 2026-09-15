import React from 'react';
import { Helmet } from 'react-helmet-async';
import { MobileNavWrapper } from '@/components/layout/MobileNavWrapper';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Building2, 
  Bookmark,
  Share2,
  ChevronRight
} from 'lucide-react';

export const MobileJobs: React.FC = () => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">This view is optimized for mobile devices.</p>
      </div>
    );
  }

  const featuredJobs = [
    {
      id: 1,
      title: "Senior Software Engineer",
      company: "TechCorp",
      location: "Bangalore, India",
      salary: "₹15-25 LPA",
      type: "Full-time",
      isNew: true,
      skills: ["React", "Node.js", "MongoDB"]
    },
    {
      id: 2,
      title: "Product Manager",
      company: "StartupXYZ",
      location: "Mumbai, India",
      salary: "₹20-30 LPA",
      type: "Full-time",
      isNew: false,
      skills: ["Strategy", "Analytics", "Leadership"]
    },
    {
      id: 3,
      title: "UI/UX Designer",
      company: "DesignStudio",
      location: "Delhi, India",
      salary: "₹8-15 LPA",
      type: "Remote",
      isNew: true,
      skills: ["Figma", "Adobe XD", "Prototyping"]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Jobs - Mobile | TalentXcel</title>
        <meta name="description" content="Find your next career opportunity with TalentXcel mobile job search." />
      </Helmet>
      
      <MobileNavWrapper>
        <div className="min-h-screen bg-gray-50 native-app-style">
          {/* Header */}
          <div className="sticky top-0 z-40 bg-white border-b border-gray-200 safe-area-top">
            <div className="px-4 py-3">
              <h1 className="text-xl font-bold text-gray-900 mb-3">Find Jobs</h1>
              
              {/* Search Bar */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search jobs, companies, skills..."
                  className="pl-10 pr-12 bg-gray-50 border-gray-200 touch-feedback"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 p-2"
                >
                  <Filter className="w-4 h-4" />
                </Button>
              </div>

              {/* Quick Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                <Badge variant="default" className="whitespace-nowrap">All Jobs</Badge>
                <Badge variant="secondary" className="whitespace-nowrap">Remote</Badge>
                <Badge variant="secondary" className="whitespace-nowrap">Full-time</Badge>
                <Badge variant="secondary" className="whitespace-nowrap">Fresher</Badge>
                <Badge variant="secondary" className="whitespace-nowrap">High Salary</Badge>
              </div>
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-160px)] ios-scroll">
            <div className="px-4 py-4 space-y-4">
              {/* Featured Section */}
              <div className="native-card p-4">
                <h2 className="font-semibold text-gray-900 mb-3">Featured Jobs</h2>
                <div className="space-y-3">
                  {featuredJobs.map((job) => (
                    <div
                      key={job.id}
                      className="border border-gray-100 rounded-lg p-4 touch-feedback bg-white"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 text-sm">{job.title}</h3>
                            {job.isNew && (
                              <Badge variant="default" className="text-xs px-2 py-1">New</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{job.company}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {job.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {job.type}
                            </div>
                          </div>
                          <p className="text-sm font-medium text-green-600 mb-2">{job.salary}</p>
                          <div className="flex flex-wrap gap-1">
                            {job.skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs px-2 py-1">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-3">
                          <Button size="sm" variant="ghost" className="p-1">
                            <Bookmark className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="p-1">
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="flex-1 touch-feedback">
                          Apply Now
                        </Button>
                        <Button size="sm" variant="outline" className="touch-feedback">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <div className="native-card p-4 text-center touch-feedback">
                  <Building2 className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Top Companies</p>
                </div>
                <div className="native-card p-4 text-center touch-feedback">
                  <Search className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Salary Insights</p>
                </div>
              </div>

              {/* Recent Searches */}
              <div className="native-card p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Recent Searches</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">Software Engineer Bangalore</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">Remote React Jobs</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">Product Manager Mumbai</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </MobileNavWrapper>
    </>
  );
};

export default MobileJobs;