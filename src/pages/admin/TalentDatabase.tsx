import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Users, Database, Search, Settings, File, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BulkUploadManager } from '@/components/talent-database/BulkUploadManager';
import { TalentSearch } from '@/components/talent-database/TalentSearch';
import { ProfileGenerator } from '@/components/talent-database/ProfileGenerator';
import { MatchingEngine } from '@/components/talent-database/MatchingEngine';
import { TalentAnalytics } from '@/components/talent-database/TalentAnalytics';
import { SetupGuide } from '@/components/talent-database/SetupGuide';
import { CVFilesManager } from '@/components/talent-database/CVFilesManager';
import NameFixerTool from '@/components/talent-database/NameFixerTool';

const TalentDatabase = () => {
  const [activeTab, setActiveTab] = useState('setup');

  const features = [
    {
      icon: Upload,
      title: 'Bulk Upload CVs',
      description: 'Upload thousands of CVs in PDF/DOCX format',
      count: '0 CVs',
      color: 'bg-blue-500'
    },
    {
      icon: Users,
      title: 'Generated Profiles',
      description: 'Auto-generated candidate profiles',
      count: '0 Profiles',
      color: 'bg-green-500'
    },
    {
      icon: Database,
      title: 'Searchable Database',
      description: 'AI-powered talent matching',
      count: '0 Matches',
      color: 'bg-purple-500'
    },
    {
      icon: Search,
      title: 'SEO Optimized',
      description: 'Public profile pages for candidates',
      count: '0 Views',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Talent Database</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive talent management and intelligent job matching system
          </p>
        </div>
        <Button size="lg" className="gap-2">
          <Upload className="h-4 w-4" />
          Quick Upload
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${feature.color}`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                  <p className="text-lg font-bold text-primary mt-1">{feature.count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="setup" className="gap-2">
            <Settings className="h-4 w-4" />
            Setup
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="h-4 w-4" />
            Bulk Upload
          </TabsTrigger>
          <TabsTrigger value="cvfiles" className="gap-2">
            <File className="h-4 w-4" />
            CV Files
          </TabsTrigger>
          <TabsTrigger value="namefixer" className="gap-2">
            <User className="h-4 w-4" />
            Name Fixer
          </TabsTrigger>
          <TabsTrigger value="search" className="gap-2">
            <Search className="h-4 w-4" />
            Search Talent
          </TabsTrigger>
          <TabsTrigger value="profiles" className="gap-2">
            <Users className="h-4 w-4" />
            Profiles
          </TabsTrigger>
          <TabsTrigger value="matching" className="gap-2">
            <Database className="h-4 w-4" />
            Job Matching
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <FileText className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <SetupGuide />
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bulk CV Upload System</CardTitle>
              <CardDescription>
                Upload and process thousands of CVs automatically with AI-powered parsing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BulkUploadManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cvfiles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Uploaded CV Files</CardTitle>
              <CardDescription>
                View and manage all uploaded CV files and their parsing results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CVFilesManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="namefixer" className="space-y-6">
          <NameFixerTool />
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Talent Search & Database</CardTitle>
              <CardDescription>
                Search and filter through the talent database with advanced criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TalentSearch />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profiles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Management</CardTitle>
              <CardDescription>
                Manage auto-generated profiles and SEO optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileGenerator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matching" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Job Matching Engine</CardTitle>
              <CardDescription>
                Intelligent matching between candidates and job openings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MatchingEngine />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Talent Analytics</CardTitle>
              <CardDescription>
                Insights into talent database performance and engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TalentAnalytics />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TalentDatabase;