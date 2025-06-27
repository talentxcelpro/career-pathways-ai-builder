
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Plus, Mail, MoreHorizontal, Shield, Eye, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const EmployerTeam = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah@company.com",
      role: "Admin",
      avatar: "",
      status: "Active",
      lastActive: "2 hours ago"
    },
    {
      id: 2,
      name: "Mike Chen",
      email: "mike@company.com",
      role: "Recruiter",
      avatar: "",
      status: "Active",
      lastActive: "1 day ago"
    },
    {
      id: 3,
      name: "Emily Davis",
      email: "emily@company.com",
      role: "Viewer",
      avatar: "",
      status: "Pending",
      lastActive: "Never"
    }
  ];

  const getRoleBadge = (role: string) => {
    const colors = {
      Admin: "bg-red-100 text-red-800",
      Recruiter: "bg-blue-100 text-blue-800",
      Viewer: "bg-gray-100 text-gray-800"
    };
    return colors[role as keyof typeof colors] || colors.Viewer;
  };

  const getStatusBadge = (status: string) => {
    return status === "Active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Users className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600">Manage your team members and their permissions</p>
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Team Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">3</div>
                <div className="text-sm text-gray-600">Total Members</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">2</div>
                <div className="text-sm text-gray-600">Active Members</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Mail className="h-8 w-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">1</div>
                <div className="text-sm text-gray-600">Pending Invites</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Manage team member roles and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.email}</p>
                    <p className="text-xs text-gray-500">Last active: {member.lastActive}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Badge className={getRoleBadge(member.role)}>{member.role}</Badge>
                  <Badge className={getStatusBadge(member.status)}>{member.status}</Badge>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Role
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>Understand what each role can do</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <Badge className="bg-red-100 text-red-800 mb-2">Admin</Badge>
              <ul className="text-sm space-y-1">
                <li>• Full access to all features</li>
                <li>• Manage team members</li>
                <li>• Billing and settings</li>
                <li>• Delete jobs and data</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <Badge className="bg-blue-100 text-blue-800 mb-2">Recruiter</Badge>
              <ul className="text-sm space-y-1">
                <li>• Post and manage jobs</li>
                <li>• View and contact candidates</li>
                <li>• Schedule interviews</li>
                <li>• Access analytics</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <Badge className="bg-gray-100 text-gray-800 mb-2">Viewer</Badge>
              <ul className="text-sm space-y-1">
                <li>• View jobs and candidates</li>
                <li>• Add notes and comments</li>
                <li>• Limited analytics access</li>
                <li>• No posting permissions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployerTeam;
