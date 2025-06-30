
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
  Network, 
  Search, 
  Flag, 
  Pin, 
  Trash2, 
  Eye,
  MessageSquare,
  Heart,
  Share2,
  Hash,
  Users
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';

const NetworkManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const posts = [
    {
      id: '1',
      author: 'John Doe',
      content: 'Just landed my dream job at TechCorp! Thanks to TalentXcel...',
      type: 'text',
      likes: 45,
      comments: 12,
      shares: 8,
      reported: 0,
      status: 'active',
      createdAt: '2 hours ago'
    },
    {
      id: '2',
      author: 'Jane Smith',
      content: 'New AI tool is amazing for resume optimization!',
      type: 'text',
      likes: 23,
      comments: 5,
      shares: 3,
      reported: 2,
      status: 'flagged',
      createdAt: '4 hours ago'
    }
  ];

  const reportedContent = [
    {
      id: '1',
      type: 'post',
      author: 'User123',
      reason: 'Spam content',
      reportCount: 3,
      status: 'pending'
    },
    {
      id: '2',
      type: 'comment',
      author: 'TestUser',
      reason: 'Inappropriate language',
      reportCount: 1,
      status: 'pending'
    }
  ];

  const trendingTopics = [
    { tag: '#TechJobs', count: 234 },
    { tag: '#RemoteWork', count: 189 },
    { tag: '#AICareer', count: 156 },
    { tag: '#Networking', count: 123 }
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Network Management</h1>
            <p className="text-gray-600">Moderate posts, comments, and community content</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Posts</p>
                    <p className="text-2xl font-bold text-gray-900">2,456</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Flag className="h-8 w-8 text-red-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Reported Content</p>
                    <p className="text-2xl font-bold text-gray-900">23</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Active Groups</p>
                    <p className="text-2xl font-bold text-gray-900">45</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Hash className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Trending Topics</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search posts, comments, or users..."
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
            {/* Posts Management */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Author</TableHead>
                        <TableHead>Content</TableHead>
                        <TableHead>Engagement</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {posts.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell className="font-medium">{post.author}</TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="text-sm truncate">{post.content}</p>
                              <p className="text-xs text-gray-500">{post.createdAt}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-3 text-sm">
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {post.likes}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {post.comments}
                              </span>
                              <span className="flex items-center gap-1">
                                <Share2 className="h-3 w-3" />
                                {post.shares}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={post.status === 'active' ? 'default' : 'destructive'}>
                              {post.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Pin className="h-4 w-4" />
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
              {/* Reported Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flag className="h-5 w-5 text-red-600" />
                    Reported Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportedContent.map((item) => (
                      <div key={item.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium">{item.author}</span>
                          <Badge variant="destructive" className="text-xs">
                            {item.reportCount} reports
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{item.reason}</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="text-xs">
                            Review
                          </Button>
                          <Button size="sm" variant="destructive" className="text-xs">
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Trending Topics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="h-5 w-5 text-purple-600" />
                    Trending Topics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {trendingTopics.map((topic, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{topic.tag}</span>
                        <span className="text-xs text-gray-600">{topic.count} posts</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default NetworkManagement;
