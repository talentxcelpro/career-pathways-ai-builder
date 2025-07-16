import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  GitBranch, History, Clock, User, Rewind, 
  Eye, Download, Share2, MessageSquare, Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ResumeVersion {
  id: string;
  version: string;
  title: string;
  created_at: string;
  created_by: string;
  changes: string[];
  is_current: boolean;
  file_size: number;
  content_preview: string;
}

interface VersionControlProps {
  resumeId: string;
  onVersionRestore: (versionId: string) => void;
  className?: string;
}

export const VersionControl: React.FC<VersionControlProps> = ({
  resumeId,
  onVersionRestore,
  className
}) => {
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  useEffect(() => {
    loadVersionHistory();
  }, [resumeId]);

  const loadVersionHistory = async () => {
    try {
      setIsLoading(true);
      // Mock data for now
      const mockVersions = [
        {
          id: '1',
          version: 'v1.0',
          title: 'Initial version',
          created_at: new Date().toISOString(),
          created_by: 'current',
          changes: ['Created initial resume'],
          is_current: true,
          file_size: 1024,
          content_preview: 'Initial resume with basic information'
        }
      ];
      setVersions(mockVersions);
    } catch (error) {
      console.error('Failed to load version history:', error);
      toast.error('Failed to load version history');
    } finally {
      setIsLoading(false);
    }
  };

  const createNewVersion = async (title: string, changes: string[]) => {
    try {
      const newVersion = {
        id: Date.now().toString(),
        version: `v${versions.length + 1}.0`,
        title,
        created_at: new Date().toISOString(),
        created_by: 'current',
        changes,
        is_current: false,
        file_size: 1024,
        content_preview: title
      };
      
      setVersions([newVersion, ...versions]);
      toast.success('New version created successfully');
    } catch (error) {
      console.error('Failed to create version:', error);
      toast.error('Failed to create version');
    }
  };

  const restoreVersion = async (versionId: string) => {
    try {
      await onVersionRestore(versionId);
      toast.success('Version restored successfully');
    } catch (error) {
      console.error('Failed to restore version:', error);
      toast.error('Failed to restore version');
    }
  };

  if (isLoading) {
    return (
      <Card className={cn("bg-white/80 backdrop-blur-sm border-0 shadow-lg", className)}>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading version history...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-white/80 backdrop-blur-sm border-0 shadow-lg", className)}>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <GitBranch className="h-5 w-5 mr-2 text-blue-600" />
          Version History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create New Version Button */}
        <Button
          onClick={() => createNewVersion('Manual save', ['User manual save'])}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <GitBranch className="h-4 w-4 mr-2" />
          Create New Version
        </Button>

        <Separator />

        {/* Version List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {versions.map((version, index) => (
            <Card
              key={version.id}
              className={cn(
                "transition-all duration-200 cursor-pointer border",
                selectedVersion === version.id ? "ring-2 ring-blue-500 border-blue-200" : "border-gray-200 hover:border-gray-300",
                version.is_current && "bg-blue-50 border-blue-300"
              )}
              onClick={() => setSelectedVersion(selectedVersion === version.id ? null : version.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge 
                      className={cn(
                        "text-xs",
                        version.is_current ? "bg-blue-600" : "bg-gray-600"
                      )}
                    >
                      {version.version}
                    </Badge>
                    {version.is_current && (
                      <Badge variant="outline" className="text-xs border-green-500 text-green-700">
                        Current
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(version.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <h4 className="font-medium text-gray-900 mb-1">{version.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{version.content_preview}</p>

                {/* Changes */}
                {version.changes && version.changes.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-700">Changes:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {version.changes.slice(0, 3).map((change, changeIndex) => (
                        <li key={changeIndex} className="flex items-start space-x-1">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{change}</span>
                        </li>
                      ))}
                      {version.changes.length > 3 && (
                        <li className="text-gray-500">
                          +{version.changes.length - 3} more changes
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Expanded Actions */}
                {selectedVersion === version.id && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {!version.is_current && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            restoreVersion(version.id);
                          }}
                          className="text-xs"
                        >
                          <Rewind className="h-3 w-3 mr-1" />
                          Restore
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {versions.length === 0 && (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No version history yet</p>
            <p className="text-sm text-gray-400">Create your first version to start tracking changes</p>
          </div>
        )}

        {/* Version Stats */}
        {versions.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">{versions.length}</div>
                <div className="text-xs text-gray-600">Versions</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  {versions.reduce((sum, v) => sum + (v.changes?.length || 0), 0)}
                </div>
                <div className="text-xs text-gray-600">Changes</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">
                  {Math.round(versions.reduce((sum, v) => sum + v.file_size, 0) / 1024)}KB
                </div>
                <div className="text-xs text-gray-600">Total Size</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};