
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Download, Eye } from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';

const EditCoverLetter = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Implement save functionality
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/resume/cover-letter')}
              className="flex items-center mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Generator
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Cover Letter</h1>
              <p className="text-gray-600">Customize your cover letter content</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cover Letter Editor</CardTitle>
            <CardDescription>Edit your cover letter content - ID: {id}</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter your cover letter content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[500px] font-serif text-base leading-relaxed"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditCoverLetter;
