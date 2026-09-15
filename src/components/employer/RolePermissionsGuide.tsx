import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Briefcase, Eye, Settings, FileText, BarChart3, UserPlus } from "lucide-react";

interface RolePermission {
  title: string;
  description: string;
  permissions: string[];
  color: string;
  icon: React.ReactNode;
}

const rolePermissions: RolePermission[] = [
  {
    title: "Owner",
    description: "Full access to all features",
    permissions: [
      "Manage team members",
      "Company settings",
      "Billing & payments",
      "All CRM features",
      "Full analytics access",
      "Permission management"
    ],
    color: "purple",
    icon: <Shield className="h-4 w-4" />
  },
  {
    title: "Admin",
    description: "Comprehensive management capabilities",
    permissions: [
      "Manage team members",
      "Post & edit jobs",
      "View all applications",
      "Analytics access",
      "Company profile updates",
      "Interview scheduling"
    ],
    color: "red",
    icon: <Settings className="h-4 w-4" />
  },
  {
    title: "Recruiter",
    description: "Core recruitment functionality",
    permissions: [
      "Post jobs",
      "Manage applications",
      "Interview scheduling",
      "Candidate communication",
      "Basic CRM access",
      "Application tracking"
    ],
    color: "blue",
    icon: <UserPlus className="h-4 w-4" />
  },
  {
    title: "Hiring Manager",
    description: "Decision-making and collaboration",
    permissions: [
      "View applications",
      "Interview candidates",
      "Make hiring decisions",
      "Team collaboration",
      "Candidate notes",
      "Application status updates"
    ],
    color: "green",
    icon: <Users className="h-4 w-4" />
  },
  {
    title: "Viewer",
    description: "Read-only access for oversight",
    permissions: [
      "View job postings",
      "View applications",
      "Basic reporting",
      "Read-only access",
      "Dashboard insights",
      "Export basic reports"
    ],
    color: "gray",
    icon: <Eye className="h-4 w-4" />
  }
];

const getColorClasses = (color: string) => {
  switch (color) {
    case 'purple':
      return {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-900',
        badge: 'bg-purple-100 text-purple-800 border-purple-200'
      };
    case 'red':
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-900',
        badge: 'bg-red-100 text-red-800 border-red-200'
      };
    case 'blue':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-900',
        badge: 'bg-blue-100 text-blue-800 border-blue-200'
      };
    case 'green':
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-900',
        badge: 'bg-green-100 text-green-800 border-green-200'
      };
    case 'gray':
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-900',
        badge: 'bg-gray-100 text-gray-800 border-gray-200'
      };
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-900',
        badge: 'bg-gray-100 text-gray-800 border-gray-200'
      };
  }
};

export const RolePermissionsGuide: React.FC = () => {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Team Role Permissions
        </CardTitle>
        <CardDescription>
          Understanding what each role can do in your employer dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rolePermissions.map((role, index) => {
            const colors = getColorClasses(role.color);
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-1.5 rounded ${colors.badge}`}>
                    {role.icon}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${colors.text}`}>{role.title}</h3>
                    <p className="text-xs text-muted-foreground">{role.description}</p>
                  </div>
                </div>
                <ul className="space-y-1">
                  {role.permissions.map((permission, permIndex) => (
                    <li key={permIndex} className="text-xs text-muted-foreground flex items-center">
                      <span className="w-1 h-1 bg-current rounded-full mr-2 opacity-60"></span>
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="p-1 bg-blue-100 rounded mt-0.5">
              <Briefcase className="h-3 w-3 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">Pro Tip</p>
              <p className="text-xs text-blue-700 mt-1">
                Start by inviting key team members as Admins or Recruiters. You can always adjust their permissions later from the Team Management page.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};