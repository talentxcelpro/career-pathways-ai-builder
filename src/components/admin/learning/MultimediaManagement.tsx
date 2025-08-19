import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Upload, Video, FileText } from 'lucide-react';

export const MultimediaManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Multimedia Content</h2>
          <p className="text-muted-foreground">Manage videos, documents, and interactive content</p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Content
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <Video className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Video Library</CardTitle>
            <CardDescription>Manage course videos and lectures</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">0</div>
            <p className="text-sm text-muted-foreground mb-4">Total videos</p>
            <Button variant="outline" className="w-full">
              <Play className="h-4 w-4 mr-2" />
              Manage Videos
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <FileText className="h-8 w-8 text-green-600 mb-2" />
            <CardTitle>Documents</CardTitle>
            <CardDescription>PDFs, slides, and resources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">0</div>
            <p className="text-sm text-muted-foreground mb-4">Total documents</p>
            <Button variant="outline" className="w-full">
              <FileText className="h-4 w-4 mr-2" />
              Manage Docs
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Play className="h-8 w-8 text-purple-600 mb-2" />
            <CardTitle>Interactive Content</CardTitle>
            <CardDescription>H5P, SCORM, and simulations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">0</div>
            <p className="text-sm text-muted-foreground mb-4">Interactive modules</p>
            <Button variant="outline" className="w-full">
              Create Module
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
          <CardDescription>Latest multimedia content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No content uploaded yet
          </div>
        </CardContent>
      </Card>
    </div>
  );
};