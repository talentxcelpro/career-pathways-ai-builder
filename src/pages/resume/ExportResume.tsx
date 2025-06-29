
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, FileText, File } from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';

const ExportResume = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'pdf' | 'docx') => {
    setIsExporting(true);
    // TODO: Implement export functionality
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsExporting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/resume')}
            className="flex items-center mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Export Resume</h1>
            <p className="text-gray-600">Download your resume in multiple formats</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Export Options */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Export Formats</CardTitle>
                <CardDescription>Choose your preferred format for download</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-red-600" />
                    <div>
                      <h3 className="font-medium">PDF Format</h3>
                      <p className="text-sm text-gray-600">Perfect for applications and printing</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <File className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-medium">Word Format</h3>
                      <p className="text-sm text-gray-600">Editable document for further customization</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => handleExport('docx')}
                    disabled={isExporting}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download DOCX
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Include branding</span>
                    <input type="checkbox" className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">High-quality images</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">ATS-optimized formatting</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Resume Preview</CardTitle>
                <CardDescription>How your resume will look when exported</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-[3/4] border rounded-lg bg-white p-4">
                  <div className="text-center py-12 text-gray-500">
                    <p>Resume preview for ID: {id}</p>
                    <p className="text-sm">Export preview will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportResume;
