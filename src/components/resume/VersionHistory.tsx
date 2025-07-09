import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  History, Eye, RotateCcw, Clock, 
  FileText, GitBranch, Calendar 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from 'date-fns';

interface VersionHistoryProps {
  resumeId?: string;
  onVersionRestore: (content: any) => void;
}

export const VersionHistory = ({ resumeId, onVersionRestore }: VersionHistoryProps) => {
  const [previewVersion, setPreviewVersion] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch version history
  const { data: versions, isLoading } = useQuery({
    queryKey: ['resume-versions', resumeId],
    queryFn: async () => {
      if (!resumeId) return [];
      
      const { data, error } = await supabase
        .from('resume_versions')
        .select('id, resume_id, version_name, version_number, content_snapshot, is_current, created_at, notes')
        .eq('resume_id', resumeId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as any[];
    },
    enabled: !!resumeId
  });

  const handlePreview = (version: any) => {
    setPreviewVersion(version);
    setShowPreview(true);
  };

  const handleRestore = (version: any) => {
    onVersionRestore(version.content_snapshot);
  };

  const renderPreviewContent = (content: any) => {
    const info = content?.personalInfo || {};
    
    return (
      <div className="bg-white p-6 rounded-lg border">
        <div className="text-center border-b-2 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {info.fullName || 'No Name'}
          </h1>
          <div className="text-sm text-gray-600 space-x-2">
            <span>{info.email || 'No Email'}</span>
            <span>•</span>
            <span>{info.phone || 'No Phone'}</span>
            <span>•</span>
            <span>{info.location || 'No Location'}</span>
          </div>
        </div>

        {info.summary && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-blue-600">
              Professional Summary
            </h2>
            <p className="text-gray-700 text-sm">{info.summary}</p>
          </div>
        )}

        {content?.experience && content.experience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-blue-600">
              Experience
            </h2>
            <div className="space-y-3">
              {content.experience.slice(0, 2).map((exp: any, index: number) => (
                <div key={index} className="text-sm">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-medium">{exp.title || 'Job Title'}</h3>
                    <span className="text-xs text-gray-600">
                      {exp.startDate} - {exp.endDate}
                    </span>
                  </div>
                  <div className="text-blue-600 font-medium mb-1">
                    {exp.company} • {exp.location}
                  </div>
                  {exp.description && (
                    <p className="text-gray-600 text-xs line-clamp-2">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
              {content.experience.length > 2 && (
                <p className="text-xs text-gray-500 italic">
                  +{content.experience.length - 2} more experience entries
                </p>
              )}
            </div>
          </div>
        )}

        {content?.skills?.technical && content.skills.technical.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-2 text-blue-600">
              Skills
            </h2>
            <div className="flex flex-wrap gap-1">
              {content.skills.technical.slice(0, 8).map((skill: string, index: number) => (
                <span 
                  key={index}
                  className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700"
                >
                  {skill}
                </span>
              ))}
              {content.skills.technical.length > 8 && (
                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                  +{content.skills.technical.length - 8} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <History className="h-8 w-8 animate-pulse mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading version history...</p>
        </div>
      </div>
    );
  }

  if (!versions || versions.length === 0) {
    return (
      <div className="text-center py-8">
        <GitBranch className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">No Version History</h3>
        <p className="text-muted-foreground">
          Versions will be created automatically as you make changes to your resume.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Version History</h3>
          <p className="text-sm text-muted-foreground">
            {versions.length} version{versions.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        <Badge variant="outline" className="flex items-center space-x-1">
          <History className="h-3 w-3" />
          <span>Auto-saved</span>
        </Badge>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {versions.map((version, index) => (
          <Card key={version.id} className={version.is_current ? 'ring-2 ring-primary' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium">{version.version_name}</h4>
                    {version.is_current && (
                      <Badge variant="default" className="text-xs">Current</Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      v{version.version_number}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FileText className="h-3 w-3" />
                      <span>
                        {version.content_snapshot?.experience?.length || 0} experience, 
                        {' '}
                        {version.content_snapshot?.education?.length || 0} education
                      </span>
                    </div>
                  </div>
                  
                  {version.notes && (
                    <p className="text-sm text-muted-foreground mt-1 italic">
                      {version.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(version)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  
                  {!version.is_current && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(version)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Restore
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <History className="h-5 w-5" />
              <span>Version Preview: {previewVersion?.version_name}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto">
            {previewVersion && renderPreviewContent(previewVersion.content_snapshot)}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
            {previewVersion && !previewVersion.is_current && (
              <Button onClick={() => {
                handleRestore(previewVersion);
                setShowPreview(false);
              }}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Restore This Version
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};