
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useResumeDataProcessor } from "./ResumeDataProcessor";
import { ResumeEditor } from "./ResumeEditor";
import { ResumePreview } from "./ResumePreview";
import { ResumeHeader } from "./ResumeHeader";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface UnifiedResumeInterfaceProps {
  mode: 'edit' | 'create';
  initialData?: any;
}

export const UnifiedResumeInterface: React.FC<UnifiedResumeInterfaceProps> = ({ 
  mode, 
  initialData 
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { processRawResumeData, getEmptyResumeData } = useResumeDataProcessor();
  
  const [resumeData, setResumeData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load resume data
  useEffect(() => {
    const loadResumeData = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        if (mode === 'edit' && id) {
          console.log('Loading resume with ID:', id);
          const { data, error } = await supabase
            .from('ai_resumes')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

          if (error) {
            console.error('Error loading resume:', error);
            setError('Failed to load resume');
            return;
          }

          if (data) {
            console.log('Resume loaded successfully:', data);
            const processedData = processRawResumeData(data.content);
            setResumeData(processedData);
          }
        } else if (mode === 'create') {
          if (initialData) {
            const processedData = processRawResumeData(initialData);
            setResumeData(processedData);
          } else {
            setResumeData(getEmptyResumeData());
          }
        }
      } catch (error) {
        console.error('Error in loadResumeData:', error);
        setError('Failed to load resume data');
      } finally {
        setIsLoading(false);
      }
    };

    loadResumeData();
  }, [id, mode, user, navigate, initialData, processRawResumeData, getEmptyResumeData]);

  // Auto-save functionality
  useEffect(() => {
    if (!hasChanges || !resumeData || mode !== 'edit') return;

    const saveTimer = setTimeout(() => {
      handleSave();
    }, 3000); // Auto-save after 3 seconds of no changes

    return () => clearTimeout(saveTimer);
  }, [resumeData, hasChanges, mode]);

  const handleSave = async () => {
    if (!user || !resumeData || mode !== 'edit') return;
    
    setIsSaving(true);
    
    try {
      const updateData = {
        content: resumeData,
        template_id: null, // Always set to null to avoid UUID validation errors
        updated_at: new Date().toISOString()
      };

      console.log('Saving resume with data:', updateData);

      const { error } = await supabase
        .from('ai_resumes')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Save error:', error);
        toast.error('Failed to save resume');
        return;
      }

      setLastSaved(new Date());
      setHasChanges(false);
      console.log('Resume saved successfully');
      
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Failed to save resume');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResumeDataChange = (newData: any) => {
    console.log('Resume data changed:', newData);
    setResumeData(newData);
    setHasChanges(true);
  };

  const handleEnhancementApplied = (enhancedData: any) => {
    console.log('Enhancement applied:', enhancedData);
    setResumeData(enhancedData);
    setHasChanges(true);
    toast.success('AI enhancement applied successfully!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 max-w-md">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Error</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </Card>
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 max-w-md">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">No Data</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            No resume data available
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ResumeHeader 
        mode={mode}
        isSaving={isSaving}
        lastSaved={lastSaved}
        hasChanges={hasChanges}
        onSave={handleSave}
        resumeData={resumeData}
        onEnhancementApplied={handleEnhancementApplied}
      />
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <ResumeEditor 
              data={resumeData}
              onChange={handleResumeDataChange}
            />
          </div>
          
          <div className="space-y-6">
            <ResumePreview 
              data={resumeData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
