
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Edit, Eye, Download, Trash2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProfileLayout from "@/components/profile/ProfileLayout";

const ProfileCoverLetter = () => {
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [coverLetters] = useState([
    {
      id: 1,
      title: "Software Engineer Cover Letter",
      company: "TechCorp Inc.",
      position: "Senior Software Engineer",
      lastUpdated: "2024-01-15",
      status: "active"
    },
    {
      id: 2,
      title: "Generic Tech Cover Letter",
      company: "Various",
      position: "Software Developer",
      lastUpdated: "2024-01-10",
      status: "template"
    }
  ]);

  const [newCoverLetter, setNewCoverLetter] = useState({
    title: "",
    company: "",
    position: "",
    content: ""
  });

  const handleCreate = () => {
    if (!newCoverLetter.title.trim()) {
      toast({
        title: "Error",
        description: "Please provide a title for your cover letter.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Cover Letter Created",
      description: "Your cover letter has been saved successfully.",
    });
    setShowCreateForm(false);
    setNewCoverLetter({ title: "", company: "", position: "", content: "" });
  };

  return (
    <ProfileLayout 
      title="Cover Letters" 
      description="Create and manage personalized cover letters for job applications"
    >
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Cover Letter
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Use Template
          </Button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Create New Cover Letter</CardTitle>
              <CardDescription>Write a personalized cover letter for your job application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Cover letter title"
                  value={newCoverLetter.title}
                  onChange={(e) => setNewCoverLetter(prev => ({ ...prev, title: e.target.value }))}
                />
                <Input
                  placeholder="Company name"
                  value={newCoverLetter.company}
                  onChange={(e) => setNewCoverLetter(prev => ({ ...prev, company: e.target.value }))}
                />
                <Input
                  placeholder="Position title"
                  value={newCoverLetter.position}
                  onChange={(e) => setNewCoverLetter(prev => ({ ...prev, position: e.target.value }))}
                />
              </div>
              <Textarea
                placeholder="Write your cover letter content here..."
                value={newCoverLetter.content}
                onChange={(e) => setNewCoverLetter(prev => ({ ...prev, content: e.target.value }))}
                className="min-h-[200px]"
              />
              <div className="flex gap-2">
                <Button onClick={handleCreate}>Create Cover Letter</Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cover Letters List */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Your Cover Letters</CardTitle>
            <CardDescription>Manage your saved cover letters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {coverLetters.map((letter, index) => (
                <div key={letter.id}>
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-10 bg-gradient-to-r from-green-500 to-blue-500 rounded flex items-center justify-center">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">{letter.title}</h3>
                          <Badge variant={letter.status === 'active' ? 'default' : 'secondary'}>
                            {letter.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {letter.company} • {letter.position} • Last updated {letter.lastUpdated}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  {index < coverLetters.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Writing Tips */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Cover Letter Writing Tips</CardTitle>
            <CardDescription>Best practices for effective cover letters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Structure</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Header with your contact information</li>
                  <li>• Date and employer's details</li>
                  <li>• Professional greeting</li>
                  <li>• Strong opening paragraph</li>
                  <li>• Body paragraphs with examples</li>
                  <li>• Closing and call to action</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Content Tips</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Research the company and role</li>
                  <li>• Highlight relevant achievements</li>
                  <li>• Show enthusiasm and passion</li>
                  <li>• Keep it concise (1 page max)</li>
                  <li>• Proofread for errors</li>
                  <li>• Use a professional tone</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProfileLayout>
  );
};

export default ProfileCoverLetter;
