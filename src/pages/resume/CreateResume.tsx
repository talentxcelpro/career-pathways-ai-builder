
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Wand2, Save } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const CreateResume = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resumeTitle, setResumeTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateResume = async () => {
    if (!resumeTitle.trim() || !user) return;
    
    setIsCreating(true);
    
    try {
      const { data, error } = await supabase
        .from('ai_resumes')
        .insert({
          user_id: user.id,
          title: resumeTitle,
          content: {
            personalInfo: { fullName: '', email: '', phone: '', location: '', summary: '' },
            experience: [],
            education: [],
            skills: [],
            projects: [],
            certifications: []
          }
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Navigate to editor
      navigate(`/resume/edit/${data.id}`);
    } catch (error) {
      console.error('Error creating resume:', error);
    } finally {
      setIsCreating(false);
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Create New Resume</h1>
            <p className="text-gray-600">Start building your professional resume from scratch</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resume Creation Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Resume Details</CardTitle>
                <CardDescription>Give your resume a name to get started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resume Title *
                  </label>
                  <Input
                    placeholder="e.g., Software Engineer Resume, Marketing Professional CV"
                    value={resumeTitle}
                    onChange={(e) => setResumeTitle(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Choose a descriptive name to help you identify this resume later
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button 
                    onClick={handleCreateResume}
                    disabled={!resumeTitle.trim() || isCreating || !user}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {isCreating ? (
                      <>
                        <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Create Resume
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Features Preview */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>AI-Powered Features</CardTitle>
                <CardDescription>What you'll get with our AI resume builder</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-gray-900">Smart Content Suggestions</h4>
                      <p className="text-sm text-gray-600">AI-generated bullet points and achievements</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-gray-900">ATS Optimization</h4>
                      <p className="text-sm text-gray-600">Real-time scoring and keyword recommendations</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-gray-900">Professional Templates</h4>
                      <p className="text-sm text-gray-600">15+ industry-optimized designs</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-gray-900">Export Options</h4>
                      <p className="text-sm text-gray-600">PDF, Word, and shareable links</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>What's Next?</CardTitle>
                <CardDescription>After creating your resume, you'll be able to:</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="space-y-4">
                      <div className="w-16 h-20 bg-gray-200 rounded mx-auto"></div>
                      <div>
                        <h3 className="font-medium text-gray-900">Resume Builder Interface</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Interactive editor with AI-powered suggestions and real-time preview
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <Wand2 className="h-4 w-4 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium">AI Writing</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="w-8 h-8 bg-green-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <Save className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="text-sm font-medium">Auto Save</p>
                    </div>
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

export default CreateResume;
