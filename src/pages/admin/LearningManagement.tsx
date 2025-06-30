
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  GraduationCap, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Star,
  Users,
  Clock,
  BookOpen,
  Award
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';

const LearningManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const courses = [
    {
      id: '1',
      title: 'React Development Mastery',
      category: 'Technology',
      instructor: 'John Smith',
      enrollments: 1234,
      completion: 78,
      rating: 4.8,
      duration: '8 hours',
      status: 'active',
      isFeatured: true,
      level: 'Intermediate'
    },
    {
      id: '2',
      title: 'Product Management Fundamentals',
      category: 'Business',
      instructor: 'Sarah Johnson',
      enrollments: 892,
      completion: 65,
      rating: 4.6,
      duration: '6 hours',
      status: 'active',
      isFeatured: false,
      level: 'Beginner'
    },
    {
      id: '3',
      title: 'Advanced Data Science',
      category: 'Data Science',
      instructor: 'Mike Chen',
      enrollments: 567,
      completion: 42,
      rating: 4.9,
      duration: '12 hours',
      status: 'draft',
      isFeatured: true,
      level: 'Advanced'
    }
  ];

  const learningStats = [
    { label: 'Total Courses', value: '156', icon: BookOpen, color: 'text-blue-600' },
    { label: 'Active Learners', value: '8,234', icon: Users, color: 'text-green-600' },
    { label: 'Completed Courses', value: '2,456', icon: Award, color: 'text-purple-600' },
    { label: 'Learning Hours', value: '45,678', icon: Clock, color: 'text-orange-600' }
  ];

  const learningPaths = [
    { name: 'Full Stack Developer', courses: 12, enrollments: 456 },
    { name: 'Product Manager', courses: 8, enrollments: 234 },
    { name: 'Data Scientist', courses: 15, enrollments: 189 },
    { name: 'UI/UX Designer', courses: 10, enrollments: 345 }
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Management</h1>
              <p className="text-gray-600">Create courses, manage paths, and track engagement</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Path
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {learningStats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Courses Management */}
            <div className="lg:col-span-3">
              {/* Search and Filters */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button variant="outline">Filter</Button>
                    <Button variant="outline">Export</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Courses Table */}
              <Card>
                <CardHeader>
                  <CardTitle>All Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Instructor</TableHead>
                        <TableHead>Metrics</TableHead>
                        <TableHead>Performance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">{course.title}</h3>
                                {course.isFeatured && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Badge variant="outline" className="text-xs">{course.category}</Badge>
                                <span>{course.level}</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {course.duration}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{course.instructor}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {course.enrollments} enrolled
                              </p>
                              <p className="text-gray-600">{course.completion}% completion</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium">{course.rating}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                                {course.status}
                              </Badge>
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
                              <Button variant="outline" size="sm" className="text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Learning Paths */}
              <Card>
                <CardHeader>
                  <CardTitle>Learning Paths</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {learningPaths.map((path, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <h4 className="font-medium text-sm">{path.name}</h4>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-600">{path.courses} courses</span>
                          <span className="text-xs text-gray-600">{path.enrollments} enrolled</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Course Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Auto-approve courses</span>
                    <Switch />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Enable certificates</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Allow external links</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Track progress</span>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full" variant="outline">
                    Bulk Course Import
                  </Button>
                  <Button className="w-full" variant="outline">
                    Learning Analytics
                  </Button>
                  <Button className="w-full" variant="outline">
                    Certificate Templates
                  </Button>
                  <Button className="w-full" variant="outline">
                    Instructor Dashboard
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default LearningManagement;
