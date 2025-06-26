import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Edit, Eye, Plus, Trash2, Star, Upload, Share, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFileUpload } from '@/hooks/useFileUpload';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProfileLayout from "@/components/profile/ProfileLayout";
import { Link } from 'react-router-dom';
import { ResumeEditor } from '@/components/profile/resume/ResumeEditor';
import { ResumePreview } from '@/components/profile/resume/ResumePreview';
import { ResumeTemplates } from '@/components/profile/resume/ResumeTemplates';
import { ATSScoreCalculator } from '@/components/profile/resume/ATSScoreCalculator';

const ProfileResume = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [editingResume, setEditingResume] = useState<any>(null);
  const [previewingResume, setPreviewingResume] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('modern');
  
  const { uploadFile, uploading } = useFileUpload({
    bucket: 'resumes',
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  });

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  // Get resumes from database
  const { data: resumes = [], isLoading } = useQuery({
    queryKey: ['resumes', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentUser?.id
  });

  // Create resume mutation
  const createResumeMutation = useMutation({
    mutationFn: async ({ file, title }: { file: File; title: string }) => {
      if (!currentUser?.id) throw new Error('User not authenticated');

      // Upload file
      const fileUrl = await uploadFile(file, currentUser.id, 'resumes');
      
      // Save to database
      const { data, error } = await supabase
        .from('resumes')
        .insert({
          user_id: currentUser.id,
          title,
          file_url: fileUrl,
          content: {},
          file_size: file.size,
          mime_type: file.type,
          is_primary: resumes.length === 0 // First resume becomes primary
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes', currentUser?.id] });
      setUploadingFile(null);
      toast({
        title: "Resume uploaded",
        description: "Your resume has been uploaded successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload resume.",
        variant: "destructive"
      });
    }
  });

  // Delete resume mutation
  const deleteResumeMutation = useMutation({
    mutationFn: async (resumeId: string) => {
      const { error } = await supabase
        .from('resumes')
        .update({ is_active: false })
        .eq('id', resumeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes', currentUser?.id] });
      toast({
        title: "Resume deleted",
        description: "The resume has been removed from your profile."
      });
    }
  });

  // Set primary resume mutation
  const setPrimaryMutation = useMutation({
    mutationFn: async (resumeId: string) => {
      if (!currentUser?.id) throw new Error('User not authenticated');

      // First, unset all primary flags
      await supabase
        .from('resumes')
        .update({ is_primary: false })
        .eq('user_id', currentUser.id);

      // Then set the selected resume as primary
      const { error } = await supabase
        .from('resumes')
        .update({ is_primary: true })
        .eq('id', resumeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes', currentUser?.id] });
      toast({
        title: "Primary resume updated",
        description: "This resume is now set as your primary resume."
      });
    }
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFile(file);
    const title = file.name.replace(/\.(pdf|doc|docx)$/i, '');
    createResumeMutation.mutate({ file, title });
  };

  const handleDownload = async (resumeId: string, fileUrl: string, title: string) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download started",
        description: "Your resume is being downloaded."
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the resume.",
        variant: "destructive"
      });
    }
  };

  const handleShare = async (resume: any) => {
    const shareUrl = `${window.location.origin}/resume/${resume.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied",
        description: "Shareable resume link copied to clipboard."
      });
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Failed to copy share link.",
        variant: "destructive"
      });
    }
  };

  const handleCreateFromTemplate = (template: any) => {
    // Navigate to resume builder with selected template
    window.location.href = `/tools/resume-builder?template=${template.id}`;
  };

  if (!currentUser) {
    return (
      <ProfileLayout title="Resume Management" description="Please log in to manage your resumes">
        <div className="text-center py-8">
          <p className="text-gray-600">Please log in to access your resume management.</p>
        </div>
      </ProfileLayout>
    );
  }

  if (isLoading) {
    return (
      <ProfileLayout title="Resume Management" description="Loading your resumes...">
        <div className="text-center py-8">
          <p className="text-gray-600">Loading resumes...</p>
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout 
      title="Resume Management" 
      description="Create, edit, and manage your professional resumes"
    >
      <Tabs defaultValue="resumes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="resumes">My Resumes</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="resumes" className="space-y-6">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/tools/resume-builder" 
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Resume
            </Link>
            <div>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="resume-upload"
                disabled={uploading}
              />
              <label htmlFor="resume-upload">
                <Button variant="outline" className="cursor-pointer" disabled={uploading}>
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Resume'}
                </Button>
              </label>
            </div>
          </div>

          {/* Resume Performance */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Resume Performance</CardTitle>
              <CardDescription>Track how your resumes are performing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">87</div>
                  <div className="text-sm text-gray-600">Profile Views</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{resumes.length}</div>
                  <div className="text-sm text-gray-600">Total Resumes</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">12</div>
                  <div className="text-sm text-gray-600">Applications Sent</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">95%</div>
                  <div className="text-sm text-gray-600">ATS Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resume List */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Your Resumes</CardTitle>
              <CardDescription>Manage and organize your professional resumes</CardDescription>
            </CardHeader>
            <CardContent>
              {resumes.length > 0 ? (
                <div className="space-y-4">
                  {resumes.map((resume, index) => (
                    <div key={resume.id}>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center">
                            <FileText className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-gray-900">{resume.title}</h3>
                              {resume.is_primary && (
                                <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                                  <Star className="h-3 w-3 mr-1" />
                                  Primary
                                </Badge>
                              )}
                              <Badge variant="default">
                                Active
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              Uploaded {new Date(resume.created_at).toLocaleDateString()} • {Math.round(resume.file_size / 1024)}KB
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setPreviewingResume(resume)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setEditingResume(resume)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDownload(resume.id, resume.file_url, resume.title)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleShare(resume)}
                          >
                            <Share className="h-4 w-4" />
                          </Button>
                          {!resume.is_primary && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setPrimaryMutation.mutate(resume.id)}
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => deleteResumeMutation.mutate(resume.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      {index < resumes.length - 1 && <Separator className="my-4" />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No resumes yet</p>
                  <p className="mb-4">Upload your first resume or create one using our resume builder.</p>
                  <div className="space-x-2">
                    <Link to="/tools/resume-builder">
                      <Button>Create Resume</Button>
                    </Link>
                    <label htmlFor="resume-upload">
                      <Button variant="outline" className="cursor-pointer">Upload Resume</Button>
                    </label>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Resume Templates</CardTitle>
              <CardDescription>Choose from professional templates optimized for ATS systems</CardDescription>
            </CardHeader>
            <CardContent>
              <ResumeTemplates 
                onSelectTemplate={handleCreateFromTemplate}
                selectedTemplate={selectedTemplate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {resumes.length > 0 && (
            <>
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Resume Analytics</span>
                  </CardTitle>
                  <CardDescription>
                    Detailed performance metrics for your resumes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600 mb-2">1,247</div>
                      <div className="text-sm text-gray-600">Total Views</div>
                      <div className="text-xs text-green-600 mt-1">↑ 23% this month</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                      <div className="text-3xl font-bold text-green-600 mb-2">89</div>
                      <div className="text-sm text-gray-600">Downloads</div>
                      <div className="text-xs text-green-600 mt-1">↑ 12% this month</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600 mb-2">4.8</div>
                      <div className="text-sm text-gray-600">Avg. ATS Score</div>
                      <div className="text-xs text-green-600 mt-1">↑ 0.3 this month</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {resumes.map((resume) => (
                <ATSScoreCalculator 
                  key={resume.id}
                  resumeContent={resume.content}
                />
              ))}
            </>
          )}
        </TabsContent>

        <TabsContent value="settings">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Resume Settings</CardTitle>
              <CardDescription>Configure your resume preferences and sharing options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Default Template</h4>
                  <p className="text-sm text-gray-600 mb-4">Choose your preferred template for new resumes</p>
                  <ResumeTemplates 
                    onSelectTemplate={(template) => setSelectedTemplate(template.id)}
                    selectedTemplate={selectedTemplate}
                  />
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Sharing Preferences</h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Allow public sharing of resumes</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Track resume views and downloads</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" />
                      <span className="text-sm">Require password for shared resumes</span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Resume Tips */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Resume Optimization Tips</CardTitle>
          <CardDescription>Improve your resume's effectiveness</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                <div className="h-2 w-2 bg-green-600 rounded-full"></div>
              </div>
              <div>
                <h4 className="font-medium">Tailor for Each Job</h4>
                <p className="text-sm text-gray-600">Customize your resume for each application to match job requirements.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
              </div>
              <div>
                <h4 className="font-medium">Use Action Verbs</h4>
                <p className="text-sm text-gray-600">Start bullet points with strong action verbs like "Led," "Developed," "Improved."</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                <div className="h-2 w-2 bg-purple-600 rounded-full"></div>
              </div>
              <div>
                <h4 className="font-medium">Quantify Achievements</h4>
                <p className="text-sm text-gray-600">Include numbers and percentages to demonstrate your impact.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {editingResume && (
        <ResumeEditor
          resume={editingResume}
          open={!!editingResume}
          onClose={() => setEditingResume(null)}
          onSave={(updatedResume) => {
            queryClient.invalidateQueries({ queryKey: ['resumes', currentUser?.id] });
            setEditingResume(null);
          }}
        />
      )}

      {previewingResume && (
        <ResumePreview
          resume={previewingResume}
          open={!!previewingResume}
          onClose={() => setPreviewingResume(null)}
          onDownload={() => handleDownload(previewingResume.id, previewingResume.file_url, previewingResume.title)}
          onShare={() => handleShare(previewingResume)}
        />
      )}
    </ProfileLayout>
  );
};

export default ProfileResume;
