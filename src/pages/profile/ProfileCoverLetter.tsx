
import ProfileLayout from "@/components/profile/ProfileLayout";
import { CoverLetterUpload } from "@/components/profile/documents/CoverLetterUpload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Download, Trash2, FileText } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const ProfileCoverLetter = () => {
  const { toast } = useToast();
  
  const [savedLetters] = useState([]);

  const handleEdit = (letterId: number) => {
    toast({
      title: "Edit Cover Letter",
      description: "Cover letter editor would open here.",
    });
  };

  const handleDownload = (letterId: number, title: string) => {
    toast({
      title: "Download Started",
      description: `Downloading "${title}" as PDF...`,
    });
  };

  const handleDelete = (letterId: number) => {
    toast({
      title: "Cover Letter Deleted",
      description: "The cover letter has been removed.",
    });
  };

  return (
    <ProfileLayout 
      title="Cover Letters" 
      description="Create, manage, and upload your cover letters"
    >
      <div className="space-y-6">
        {/* Upload and Create Section */}
        <CoverLetterUpload />

        {/* Saved Cover Letters */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Your Cover Letters</CardTitle>
            <CardDescription>Manage your saved cover letter templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savedLetters.length > 0 ? savedLetters.map((letter) => (
                <div key={letter.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-10 bg-gradient-to-r from-green-500 to-blue-500 rounded flex items-center justify-center">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{letter.title}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {letter.targetCompany && (
                          <Badge variant="outline">{letter.targetCompany}</Badge>
                        )}
                        {letter.targetRole && (
                          <Badge variant="secondary">{letter.targetRole}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {letter.wordCount} words • Last updated {letter.lastUpdated}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(letter.id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(letter.id, letter.title)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(letter.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Cover Letters Yet</h3>
                  <p className="text-gray-600">Create your first cover letter to get started</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cover Letter Tips */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Cover Letter Best Practices</CardTitle>
            <CardDescription>Tips for writing effective cover letters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">Personalize Each Letter</h4>
                  <p className="text-sm text-gray-600">Customize your cover letter for each company and role.</p>
                </div>
                <div>
                  <h4 className="font-medium">Show Enthusiasm</h4>
                  <p className="text-sm text-gray-600">Express genuine interest in the company and position.</p>
                </div>
                <div>
                  <h4 className="font-medium">Be Concise</h4>
                  <p className="text-sm text-gray-600">Keep it to one page and focus on your most relevant achievements.</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">Tell a Story</h4>
                  <p className="text-sm text-gray-600">Connect your experiences to the role requirements.</p>
                </div>
                <div>
                  <h4 className="font-medium">Include Keywords</h4>
                  <p className="text-sm text-gray-600">Use keywords from the job description naturally.</p>
                </div>
                <div>
                  <h4 className="font-medium">Professional Tone</h4>
                  <p className="text-sm text-gray-600">Maintain a professional yet personable writing style.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProfileLayout>
  );
};

export default ProfileCoverLetter;
