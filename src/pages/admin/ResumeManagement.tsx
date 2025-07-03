
import React from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  FileText, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Download,
  Star,
  Users,
  BarChart3
} from 'lucide-react';
import { useResumeManagement } from '@/hooks/useResumeManagement';
import { AddTemplateDialog } from '@/components/admin/dialogs/AddTemplateDialog';

const ResumeManagement = () => {
  const {
    searchTerm,
    setSearchTerm,
    resumeStats,
    resumes,
    coverLetters,
    isLoading,
    deleteResume
  } = useResumeManagement();

  const statsCards = [
    { label: 'Total Resumes', value: resumeStats?.totalResumes || 0, icon: FileText, color: 'text-blue-600' },
    { label: 'Public Resumes', value: resumeStats?.publicResumes || 0, icon: Eye, color: 'text-green-600' },
    { label: 'Cover Letters', value: resumeStats?.totalCoverLetters || 0, icon: FileText, color: 'text-purple-600' },
    { label: 'Active Users', value: resumeStats?.activeUsers || 0, icon: Users, color: 'text-orange-600' }
  ];

  return (
    <UnifiedAdminLayout 
      title="Resume Management" 
      description="Manage resume templates, usage stats, and documents"
    >
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search resumes and templates..."
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resumes Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>AI Generated Resumes ({resumes?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Resume Title</TableHead>
                        <TableHead>ATS Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resumes?.map((resume) => (
                        <TableRow key={resume.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {resume.profiles?.full_name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{resume.profiles?.full_name || 'Unknown User'}</p>
                                <p className="text-sm text-gray-600">{resume.profiles?.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{resume.title}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(resume.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                <span className="text-sm">{resume.ats_score || 0}/100</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge variant={resume.is_public ? 'default' : 'secondary'}>
                                {resume.is_public ? 'Public' : 'Private'}
                              </Badge>
                              {resume.is_primary && (
                                <Badge variant="outline" className="block w-fit">Primary</Badge>
                              )}
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
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-600"
                                onClick={() => deleteResume(resume.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cover Letters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Recent Cover Letters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {coverLetters?.slice(0, 5).map((letter) => (
                    <div key={letter.id} className="border-b pb-3 last:border-b-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {letter.profiles?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium">{letter.profiles?.full_name}</p>
                      </div>
                      <p className="text-sm font-medium mb-1">{letter.title}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {letter.tone || 'Professional'}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(letter.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <AddTemplateDialog onTemplateAdded={() => window.location.reload()} />
                <Button className="w-full" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Usage Analytics
                </Button>
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </UnifiedAdminLayout>
  );
};

export default ResumeManagement;
