import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Download, Eye } from 'lucide-react';

const Resumes = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">My Resumes</h1>
            <p className="text-muted-foreground">Create and manage your professional resumes</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Resume
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <FileText className="h-8 w-8 text-blue-600" />
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle>Software Engineer Resume</CardTitle>
              <CardDescription>Updated 2 days ago</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button size="sm" className="flex-1">Edit</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-dashed border-2 hover:border-solid transition-all cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center h-48 text-center">
              <Plus className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Create New Resume</h3>
              <p className="text-sm text-muted-foreground">Start with a template or build from scratch</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Resumes;