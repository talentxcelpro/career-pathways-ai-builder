
import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, User, Settings, FileText, MessageSquare, Heart, Camera, BarChart3, FolderOpen, Bell } from "lucide-react";

interface ProfileLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

const ProfileLayout = ({ children, title, description }: ProfileLayoutProps) => {
  const location = useLocation();

  const navigationItems = [
    { path: '/profile', label: 'View Profile', icon: User },
    { path: '/profile/edit', label: 'Edit Profile', icon: Settings },
    { path: '/profile/resume', label: 'Resume', icon: FileText },
    { path: '/profile/cover-letter', label: 'Cover Letters', icon: MessageSquare },
    { path: '/profile/preferences', label: 'Job Preferences', icon: Heart },
    { path: '/profile/media', label: 'Media & Portfolio', icon: Camera },
    { path: '/profile/analytics', label: 'Profile Analytics', icon: BarChart3 },
    { path: '/profile/documents', label: 'Documents', icon: FolderOpen },
    { path: '/profile/settings', label: 'Account Settings', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              as={Link} 
              to="/"
              className="flex items-center mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              {description && <p className="text-gray-600">{description}</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <nav className="space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-blue-100 text-blue-700 font-medium' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;
