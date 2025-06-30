
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Users, 
  Search, 
  Filter, 
  Ban, 
  CheckCircle,
  XCircle,
  RotateCcw,
  UserCheck,
  Mail,
  Eye,
  Edit,
  Download
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { ExportButton } from '@/components/admin/ExportButton';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const users = [
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      role: 'Job Seeker',
      status: 'Active',
      verified: true,
      joinDate: '2024-01-10',
      lastLogin: '2024-01-15 14:30',
      applicationCount: 12,
      profileCompletion: 85,
      location: 'Mumbai, India',
      company: 'Not specified'
    },
    {
      id: '2',
      name: 'Bob Smith',
      email: 'bob@company.com',
      role: 'Employer',
      status: 'Active',
      verified: true,
      joinDate: '2024-01-05',
      lastLogin: '2024-01-14 09:15',
      jobsPosted: 5,
      profileCompletion: 92,
      location: 'Bangalore, India',
      company: 'TechCorp Solutions'
    },
    {
      id: '3',
      name: 'Charlie Brown',
      email: 'charlie@freelance.com',
      role: 'Premium Member',
      status: 'Suspended',
      verified: false,
      joinDate: '2024-01-12',
      lastLogin: '2024-01-13 16:45',
      applicationCount: 3,
      profileCompletion: 45,
      location: 'Delhi, India',
      company: 'Freelancer'
    },
    // ... more sample users
  ];

  const userStats = [
    { label: 'Total Users', value: '25,847', icon: Users, color: 'text-blue-600', change: '+12%' },
    { label: 'Active Users', value: '21,234', icon: UserCheck, color: 'text-green-600', change: '+8%' },
    { label: 'Suspended Users', value: '324', icon: Ban, color: 'text-red-600', change: '-5%' },
    { label: 'New This Month', value: '2,847', icon: CheckCircle, color: 'text-purple-600', change: '+23%' }
  ];

  const statusColors = {
    'Active': 'bg-green-100 text-green-800',
    'Suspended': 'bg-red-100 text-red-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Banned': 'bg-gray-100 text-gray-800'
  };

  const roleColors = {
    'Job Seeker': 'bg-blue-100 text-blue-800',
    'Employer': 'bg-purple-100 text-purple-800',
    'Premium Member': 'bg-yellow-100 text-yellow-800'
  };

  // Advanced filtering logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedFilter === 'all' || user.status.toLowerCase() === selectedFilter;
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    
    // Date filtering
    if (dateRange !== 'all') {
      const joinDate = new Date(user.joinDate);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateRange) {
        case 'week':
          if (daysDiff > 7) return false;
          break;
        case 'month':
          if (daysDiff > 30) return false;
          break;
        case 'quarter':
          if (daysDiff > 90) return false;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const exportData = filteredUsers.map(user => ({
    Name: user.name,
    Email: user.email,
    Role: user.role,
    Status: user.status,
    'Join Date': user.joinDate,
    'Last Login': user.lastLogin,
    'Profile Completion': `${user.profileCompletion}%`,
    Location: user.location,
    Company: user.company
  }));

  return (
    <AdminGuard requiredPermission="canAccessUsers">
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
                <p className="text-gray-600">View, manage, and moderate all platform users</p>
              </div>
              <div className="flex gap-2">
                <ExportButton data={exportData} filename="users" />
                <Button>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {userStats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                          <span className={`text-sm font-medium ${
                            stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stat.change}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Advanced Search and Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select 
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                    <option value="banned">Banned</option>
                  </select>
                  <select 
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="Job Seeker">Job Seekers</option>
                    <option value="Employer">Employers</option>
                    <option value="Premium Member">Premium</option>
                  </select>
                  <select 
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                  >
                    <option value="all">All Time</option>
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="quarter">Last Quarter</option>
                  </select>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    More Filters
                  </Button>
                </div>
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                  <span>Showing {filteredUsers.length} of {users.length} users</span>
                  {(searchTerm || selectedFilter !== 'all' || selectedRole !== 'all' || dateRange !== 'all') && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedFilter('all');
                        setSelectedRole('all');
                        setDateRange('all');
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Activity</TableHead>
                        <TableHead>Profile</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{user.name}</span>
                                  {user.verified && (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  )}
                                </div>
                                <span className="text-sm text-gray-500">{user.email}</span>
                                <div className="text-xs text-gray-400">{user.location}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={roleColors[user.role as keyof typeof roleColors]}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[user.status as keyof typeof statusColors]}>
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">{user.joinDate}</TableCell>
                          <TableCell className="text-sm text-gray-600">{user.lastLogin}</TableCell>
                          <TableCell className="text-sm">
                            {user.applicationCount && (
                              <span>{user.applicationCount} applications</span>
                            )}
                            {user.jobsPosted && (
                              <span>{user.jobsPosted} jobs posted</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-12 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${user.profileCompletion}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-600">{user.profileCompletion}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Mail className="h-4 w-4" />
                              </Button>
                              {user.status === 'Active' ? (
                                <Button variant="outline" size="sm" className="text-red-600">
                                  <Ban className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button variant="outline" size="sm" className="text-green-600">
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Recent User Activity */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent User Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">New user registration: Sarah Wilson</span>
                    </div>
                    <span className="text-xs text-gray-500">5 mins ago</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">User profile updated: John Davis</span>
                    </div>
                    <span className="text-xs text-gray-500">15 mins ago</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm">User account suspended: Mike Johnson</span>
                    </div>
                    <span className="text-xs text-gray-500">1 hour ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
};

export default UserManagement;
